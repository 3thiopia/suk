-- ==========================================
-- Migration 005: Creator Profiles Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  niche TEXT,
  social_accounts JSONB DEFAULT '{}'::jsonb,
  total_sales_volume NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_sales_volume >= 0),
  payout_bank_name TEXT,
  payout_account_number TEXT,
  payout_account_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_id ON public.creator_profiles(id);
