-- ==========================================
-- Migration 012: Payouts & Commissions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  payment_reference TEXT,
  payout_date TIMESTAMPTZ,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_reseller_id ON public.payouts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_storefront_id ON public.payouts(storefront_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
