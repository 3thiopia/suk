-- ==========================================
-- Migration 004: Businesses Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  category TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
  follower_count INT NOT NULL DEFAULT 0 CHECK (follower_count >= 0),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending_review')),
  status_reason TEXT,
  default_commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (default_commission_rate >= 0 AND default_commission_rate <= 100),
  tagline TEXT,
  city TEXT,
  country TEXT DEFAULT 'Ethiopia',
  address TEXT,
  year_established INT,
  story TEXT,
  mission TEXT,
  specialties TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
