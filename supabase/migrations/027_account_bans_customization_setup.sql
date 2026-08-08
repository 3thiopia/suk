-- Migration 027: Account Bans Tracking, Detailed Storefront Style History & Setup Progress

-- 1. Account Bans Audit Table
CREATE TABLE IF NOT EXISTS public.account_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    banned_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    ban_type TEXT NOT NULL DEFAULT 'permanent' CHECK (ban_type IN ('permanent', 'temporary')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lifted', 'appealed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lifted_at TIMESTAMPTZ,
    lifted_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_account_bans_user ON public.account_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_account_bans_status ON public.account_bans(status);

ALTER TABLE public.account_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage account_bans" ON public.account_bans
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users view own ban records" ON public.account_bans
    FOR SELECT USING (user_id = auth.uid());

-- 2. Storefront Customization History Table (Supports Restore Previous Style)
CREATE TABLE IF NOT EXISTS public.storefront_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
    current_style JSONB NOT NULL DEFAULT '{}'::jsonb,
    previous_style JSONB DEFAULT '{}'::jsonb,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_customization_per_storefront UNIQUE(storefront_id)
);

CREATE INDEX IF NOT EXISTS idx_storefront_customizations_storefront ON public.storefront_customizations(storefront_id);

ALTER TABLE public.storefront_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads storefront_customizations" ON public.storefront_customizations
    FOR SELECT USING (true);

CREATE POLICY "Creators manage own storefront_customizations" ON public.storefront_customizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.storefronts s
            WHERE s.id = storefront_customizations.storefront_id AND s.reseller_id = auth.uid()
        ) OR public.is_admin()
    );

-- 3. Account Setup Progress Table
CREATE TABLE IF NOT EXISTS public.account_setup_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    completion_percentage INT NOT NULL DEFAULT 0,
    checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_setup_progress_per_user UNIQUE(user_id)
);

ALTER TABLE public.account_setup_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own setup progress" ON public.account_setup_progress
    FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- 4. Function: Deliver Order & Calculate Commission
CREATE OR REPLACE FUNCTION public.deliver_order(p_order_id UUID, p_actor_id UUID, p_actor_name TEXT)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status = 'delivered' THEN
        RAISE EXCEPTION 'Order is already marked as delivered.';
    END IF;

    -- Update order status
    UPDATE public.orders
    SET status = 'delivered',
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Record commission payout record if not already created
    INSERT INTO public.commissions (
        order_id,
        reseller_id,
        business_id,
        amount,
        status
    )
    SELECT
        v_order.id,
        s.reseller_id,
        oi.business_id,
        v_order.reseller_commission,
        'unpaid'
    FROM public.storefronts s
    JOIN public.order_items oi ON oi.order_id = v_order.id
    WHERE s.id = v_order.storefront_id
    LIMIT 1
    ON CONFLICT DO NOTHING;

    -- Update storefront reseller earnings
    UPDATE public.storefronts s
    SET total_earnings = total_earnings + v_order.reseller_commission,
        pending_payout = pending_payout + v_order.reseller_commission,
        total_orders_count = total_orders_count + 1
    WHERE s.id = v_order.storefront_id;

    -- Timeline event
    INSERT INTO public.order_timeline_events (order_id, stage, title, description, actor)
    VALUES (
        p_order_id,
        'delivered',
        'Order Delivered',
        'Order marked as delivered. Creator commission recorded.',
        COALESCE(p_actor_name, 'Business Owner')
    );

    RETURN jsonb_build_object('success', true, 'status', 'delivered', 'commission', v_order.reseller_commission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
