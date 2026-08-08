-- ==========================================
-- Migration 008: Products Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price NUMERIC(10,2) CHECK (cost_price >= 0 OR cost_price IS NULL),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'out_of_stock')),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  hidden_reason TEXT,
  hidden_at TIMESTAMPTZ,
  hidden_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hidden_by_admin_name TEXT,
  appeal_status TEXT CHECK (appeal_status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_requested') OR appeal_status IS NULL),
  current_appeal_id UUID,
  specifications JSONB DEFAULT '{}'::jsonb,
  commission_rate NUMERIC(5,2) DEFAULT 20.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount NUMERIC(10,2) CHECK (commission_amount >= 0 OR commission_amount IS NULL),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_hidden ON public.products(is_hidden);
