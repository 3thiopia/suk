-- ==========================================
-- Migration 006: Storefronts Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  banner_title TEXT,
  banner_subtitle TEXT,
  theme_color TEXT NOT NULL DEFAULT 'emerald',
  layout_mode TEXT NOT NULL DEFAULT 'grid',
  min_payout_threshold NUMERIC(10,2) NOT NULL DEFAULT 50.00 CHECK (min_payout_threshold >= 0),
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_earnings >= 0),
  pending_payout NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (pending_payout >= 0),
  total_orders_count INT NOT NULL DEFAULT 0 CHECK (total_orders_count >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending_review')),
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  disabled_reason TEXT,
  disabled_at TIMESTAMPTZ,
  customization JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_storefronts_reseller_id ON public.storefronts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_storefronts_slug ON public.storefronts(slug);
CREATE INDEX IF NOT EXISTS idx_storefronts_status ON public.storefronts(status);
