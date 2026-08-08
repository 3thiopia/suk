/**
 * Supabase Database Schema & RLS Security Rules
 * 
 * This file contains the authoritative database DDL and Row Level Security (RLS) policies
 * required for production deployment on Supabase.
 */

export const SUPABASE_SQL_SCHEMA = `
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business_owner', 'reseller', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Profiles Table (Business Owners)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  website TEXT,
  category TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table (Owned strictly by Business Owners)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'out_of_stock')),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reseller Storefronts Table
CREATE TABLE IF NOT EXISTS public.storefronts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  banner_title TEXT,
  banner_subtitle TEXT,
  theme_color TEXT DEFAULT 'emerald',
  layout_mode TEXT DEFAULT 'grid',
  min_payout_threshold NUMERIC(10,2) DEFAULT 50.00 CHECK (min_payout_threshold >= 50.00),
  total_earnings NUMERIC(10,2) DEFAULT 0.00,
  pending_payout NUMERIC(10,2) DEFAULT 0.00,
  total_orders_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Storefront Collections Table (Reseller product groupings)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(storefront_id, slug)
);

-- 7. Storefront Products Table (References Business Products; Reseller Presentation ONLY)
CREATE TABLE IF NOT EXISTS public.storefront_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  custom_cover_image TEXT,
  collection_ids UUID[] DEFAULT '{}',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(storefront_id, product_id)
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  reseller_commission NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'shipped', 'delivered', 'completed')),
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  product_title TEXT NOT NULL,
  brand TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  cover_image TEXT
);

-- 10. Commission Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  payout_date TIMESTAMPTZ,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Follows Table (Resellers follow Businesses)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reseller_id, business_id)
);

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Products RLS:
-- 1. Anyone can view active products.
CREATE POLICY "Public products viewable by all" ON public.products
  FOR SELECT USING (true);

-- 2. ONLY Business Owner who owns the business can INSERT/UPDATE/DELETE products.
CREATE POLICY "Business owners insert own products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners update own products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners delete own products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id AND b.owner_id = auth.uid()
    )
  );

-- Storefront Products RLS:
-- Resellers can manage presentation parameters for products on their own storefront
CREATE POLICY "Public storefront products viewable by all" ON public.storefront_products
  FOR SELECT USING (true);

CREATE POLICY "Resellers manage own storefront products" ON public.storefront_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.storefronts s
      WHERE s.id = storefront_products.storefront_id AND s.reseller_id = auth.uid()
    )
  );

-- Orders RLS:
-- 1. Customers can create orders (unauthenticated / guest checkout allowed)
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- 2. Business Owners can update order status for orders containing their products
CREATE POLICY "Business owners manage order status" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.businesses b ON oi.business_id = b.id
      WHERE oi.order_id = orders.id AND b.owner_id = auth.uid()
    )
  );

-- Subdomains, Reserved Words & Historical Aliases Schema
CREATE TABLE IF NOT EXISTS public.reserved_slugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storefronts 
    ADD COLUMN IF NOT EXISTS store_slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS store_domain TEXT,
    ADD COLUMN IF NOT EXISTS previous_slugs TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.storefront_slug_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
    old_slug TEXT NOT NULL,
    new_slug TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);
`;
