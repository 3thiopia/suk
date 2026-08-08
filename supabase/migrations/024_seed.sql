-- ==========================================
-- Migration 024: Seed Initial Data
-- ==========================================

-- 1. Insert Platform Settings
INSERT INTO public.platform_settings (id, app_name, support_email, currency_symbol, default_commission_rate, min_payout_amount)
VALUES (1, 'SUK Platform', 'support@suk.et', 'ETB', 20.00, 50.00)
ON CONFLICT (id) DO UPDATE SET app_name = EXCLUDED.app_name;

-- 2. Insert Categories
INSERT INTO public.categories (id, name, slug, display_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Electronics & Tech', 'electronics', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Fashion & Apparel', 'fashion', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Beauty & Cosmetics', 'beauty', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Home & Living', 'home', 4),
  ('c5555555-5555-5555-5555-555555555555', 'Handicrafts & Art', 'artisan', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Auth Users (Satisfying Foreign Key for public.profiles)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
(
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@suk.et',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"SUK Super Admin","role":"admin"}'::jsonb,
  NOW(),
  NOW()
),
(
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'supplier@addistech.et',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Abebe Kebede (Supplier)","role":"business_owner"}'::jsonb,
  NOW(),
  NOW()
),
(
  'c0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'creator@martha.et',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Martha Tadesse (Creator)","role":"creator"}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Demo Admin Profile
INSERT INTO public.profiles (id, email, name, role, avatar_url, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@suk.et',
  'SUK Super Admin',
  'admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert Demo Business Owner Profile
INSERT INTO public.profiles (id, email, name, role, avatar_url, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'supplier@addistech.et',
  'Abebe Kebede (Supplier)',
  'business_owner',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Demo Creator Profile
INSERT INTO public.profiles (id, email, name, role, avatar_url, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'creator@martha.et',
  'Martha Tadesse (Creator)',
  'creator',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Demo Business
INSERT INTO public.businesses (
  id,
  owner_id,
  business_name,
  slug,
  logo_url,
  banner_url,
  description,
  website,
  phone,
  email,
  category,
  rating,
  follower_count,
  is_verified,
  default_commission_rate,
  tagline,
  city,
  country,
  address,
  year_established,
  story,
  mission
) VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'b0000000-0000-0000-0000-000000000001',
  'Addis Tech Supplies',
  'addis-tech-supplies',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'Direct wholesale importer and distributor of electronics, power banks, audio gear, and smart accessories in Addis Ababa.',
  'https://addistech.et',
  '+251911223344',
  'contact@addistech.et',
  'Electronics & Tech',
  4.90,
  142,
  true,
  20.00,
  'Premium Electronics & Wholesale Distribution',
  'Addis Ababa',
  'Ethiopia',
  'Bole Medhaniallem, Addis Ababa',
  2018,
  'Founded in 2018, Addis Tech Supplies provides direct importer prices to retail businesses and digital creators.',
  'Empowering digital creators across Ethiopia with genuine high-margin electronics.'
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert Demo Creator Storefront
INSERT INTO public.storefronts (
  id,
  reseller_id,
  store_name,
  slug,
  logo_url,
  banner_url,
  banner_title,
  banner_subtitle,
  theme_color,
  layout_mode,
  min_payout_threshold,
  total_earnings,
  pending_payout,
  total_orders_count
) VALUES (
  's1111111-1111-1111-1111-111111111111',
  'c0000000-0000-0000-0000-000000000001',
  'Martha Curated Studio',
  'martha-curated',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'Martha Curated Studio',
  'Hand-picked tech accessories, ethical fashion, and home goods sourced directly from verified Ethiopian suppliers.',
  'emerald',
  'grid',
  50.00,
  12800.00,
  2450.00,
  18
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert Demo Products
INSERT INTO public.products (
  id,
  business_id,
  title,
  brand,
  category,
  subcategory,
  description,
  price,
  cost_price,
  stock,
  status,
  images,
  tags,
  commission_rate,
  commission_amount
) VALUES 
(
  'p1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'UltraBass Pro Wireless Noise-Canceling Headphones',
  'AddisSound',
  'Electronics & Tech',
  'Audio & Headphones',
  'Premium active noise-canceling bluetooth headphones with 40-hour battery life, deep bass response, and comfortable memory foam ear cushions.',
  4500.00,
  2800.00,
  45,
  'active',
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
  ARRAY['bluetooth', 'audio', 'headphones', 'wireless'],
  20.00,
  900.00
),
(
  'p2222222-2222-2222-2222-222222222222',
  'b1111111-1111-1111-1111-111111111111',
  'Solar Charge PowerBank 20000mAh Dual USB-C',
  'AddisPower',
  'Electronics & Tech',
  'Power & Accessories',
  'Heavy duty 20000mAh portable charger with integrated solar recharge panel, dual fast charging USB-C PD 65W output for smartphones and laptops.',
  3200.00,
  1900.00,
  80,
  'active',
  ARRAY['https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80'],
  ARRAY['powerbank', 'solar', 'charging', 'portable'],
  25.00,
  800.00
) ON CONFLICT (id) DO NOTHING;

-- 9. Add products to Creator Storefront
INSERT INTO public.storefront_products (storefront_id, product_id, is_visible, display_order)
VALUES 
  ('s1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', true, 1),
  ('s1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', true, 2)
ON CONFLICT (storefront_id, product_id) DO NOTHING;
