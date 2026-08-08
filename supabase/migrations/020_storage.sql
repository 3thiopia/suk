-- ==========================================
-- Migration 020: Supabase Storage Buckets & Policies
-- ==========================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('business-assets', 'business-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('storefront-assets', 'storefront-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('appeals', 'appeals', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies
-- Public Read for public buckets
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public Read Business Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY "Public Read Storefront Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'storefront-assets');

CREATE POLICY "Public Read Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated Upload Policies
CREATE POLICY "Authenticated users upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users upload business assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users upload storefront assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'storefront-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users upload appeals" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'appeals' AND auth.role() = 'authenticated');
