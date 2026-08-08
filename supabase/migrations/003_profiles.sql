-- ==========================================
-- Migration 003: User Profiles Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('admin', 'business_owner', 'reseller', 'creator', 'customer')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending_review')),
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  ban_type TEXT CHECK (ban_type IN ('permanent', 'temporary') OR ban_type IS NULL),
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  suspension_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
