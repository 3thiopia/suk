-- ==========================================
-- Migration 018: Storefront Customization, Collections, & Social Links
-- ==========================================

-- 1. Storefront Social Links Table
CREATE TABLE IF NOT EXISTS public.storefront_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Storefront Product Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(storefront_id, slug)
);

-- 3. Storefront Products Table (Creator catalog curation)
CREATE TABLE IF NOT EXISTS public.storefront_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  custom_cover_image TEXT,
  collection_ids UUID[] DEFAULT '{}',
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(storefront_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_links_storefront ON public.storefront_social_links(storefront_id);
CREATE INDEX IF NOT EXISTS idx_collections_storefront ON public.collections(storefront_id);
CREATE INDEX IF NOT EXISTS idx_storefront_products_storefront ON public.storefront_products(storefront_id);
CREATE INDEX IF NOT EXISTS idx_storefront_products_product ON public.storefront_products(product_id);
