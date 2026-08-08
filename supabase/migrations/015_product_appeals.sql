-- ==========================================
-- Migration 015: Appeals Tables
-- ==========================================

-- 1. Account Appeals Table (Suspended/banned users requesting account reinstatement)
CREATE TABLE IF NOT EXISTS public.account_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  explanation TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_requested')),
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Product Appeals Table (Business owners appealing admin product moderation)
CREATE TABLE IF NOT EXISTS public.product_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_title TEXT NOT NULL,
  product_image TEXT,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  hidden_reason TEXT NOT NULL,
  hidden_at TIMESTAMPTZ NOT NULL,
  hidden_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hidden_by_admin_name TEXT,
  appeal_message TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_requested')),
  admin_notes TEXT,
  rejection_reason TEXT,
  requested_info TEXT,
  reviewed_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by_admin_name TEXT,
  reviewed_at TIMESTAMPTZ,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_account_appeals_user ON public.account_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_product_appeals_product ON public.product_appeals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_appeals_business ON public.product_appeals(business_id);
