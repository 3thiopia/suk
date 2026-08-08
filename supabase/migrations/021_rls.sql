-- ==========================================
-- Migration 021: Complete Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles RLS
CREATE POLICY "Public profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin full profile access" ON public.profiles FOR ALL USING (public.is_admin());

-- 2. Businesses RLS
CREATE POLICY "Active businesses viewable by public" ON public.businesses FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners update own business" ON public.businesses FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners insert business" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

-- 3. Products RLS
CREATE POLICY "Public views active non-hidden products" ON public.products FOR SELECT USING ((status = 'active' AND is_hidden = false) OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = products.business_id AND b.owner_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Business owners insert products" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Business owners update products" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Business owners delete products" ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()) OR public.is_admin());

-- 4. Storefronts RLS
CREATE POLICY "Public views active storefronts" ON public.storefronts FOR SELECT USING (true);
CREATE POLICY "Creators manage own storefront" ON public.storefronts FOR ALL USING (reseller_id = auth.uid() OR public.is_admin());

-- 5. Orders RLS
CREATE POLICY "Anyone places orders (guest checkout)" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners, Creators, Admins view orders" ON public.orders FOR SELECT USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM public.storefronts s WHERE s.id = orders.storefront_id AND s.reseller_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.order_items oi JOIN public.businesses b ON oi.business_id = b.id WHERE oi.order_id = orders.id AND b.owner_id = auth.uid())
);
CREATE POLICY "Business owners & Creators update orders" ON public.orders FOR UPDATE USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM public.storefronts s WHERE s.id = orders.storefront_id AND s.reseller_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.order_items oi JOIN public.businesses b ON oi.business_id = b.id WHERE oi.order_id = orders.id AND b.owner_id = auth.uid())
);

-- 6. Order Items RLS
CREATE POLICY "Anyone inserts order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "View order items" ON public.order_items FOR SELECT USING (true);

-- 7. Notifications RLS
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- 8. Follows RLS
CREATE POLICY "Creators manage follows" ON public.follows FOR ALL USING (reseller_id = auth.uid() OR public.is_admin());
CREATE POLICY "Public reads follows" ON public.follows FOR SELECT USING (true);

-- 9. Storefront Customization & Products RLS
CREATE POLICY "Public views storefront products" ON public.storefront_products FOR SELECT USING (true);
CREATE POLICY "Creators manage storefront products" ON public.storefront_products FOR ALL USING (EXISTS (SELECT 1 FROM public.storefronts s WHERE s.id = storefront_id AND s.reseller_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Public views collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Creators manage collections" ON public.collections FOR ALL USING (EXISTS (SELECT 1 FROM public.storefronts s WHERE s.id = storefront_id AND s.reseller_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Public views social links" ON public.storefront_social_links FOR SELECT USING (true);
CREATE POLICY "Creators manage social links" ON public.storefront_social_links FOR ALL USING (EXISTS (SELECT 1 FROM public.storefronts s WHERE s.id = storefront_id AND s.reseller_id = auth.uid()) OR public.is_admin());

-- 10. Platform Settings & Categories RLS
CREATE POLICY "Public reads platform settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin updates platform settings" ON public.platform_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Public reads categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manages categories" ON public.categories FOR ALL USING (public.is_admin());

-- 11. Appeals, Reports, Support Tickets
CREATE POLICY "Users read own appeals" ON public.account_appeals FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users insert account appeals" ON public.account_appeals FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Business owners read product appeals" ON public.product_appeals FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Business owners insert product appeals" ON public.product_appeals FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Creators manage order reports" ON public.order_reports FOR ALL USING (reseller_id = auth.uid() OR public.is_admin());
CREATE POLICY "Support tickets viewable by participants/admin" ON public.support_tickets FOR ALL USING (reseller_id = auth.uid() OR public.is_admin());
