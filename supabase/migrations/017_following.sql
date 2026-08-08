-- ==========================================
-- Migration 017: Following (Follows) Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reseller_id, business_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follows_reseller ON public.follows(reseller_id);
CREATE INDEX IF NOT EXISTS idx_follows_business ON public.follows(business_id);
