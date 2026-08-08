-- ==========================================
-- Migration 019: Analytics Views & Event Tracking
-- ==========================================

-- 1. Storefront Views & Click Events Table
CREATE TABLE IF NOT EXISTS public.storefront_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'checkout_started', 'order_completed')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  visitor_session_id TEXT,
  referrer_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast time-series aggregation
CREATE INDEX IF NOT EXISTS idx_analytics_storefront_date ON public.storefront_analytics_events(storefront_id, created_at);

-- 2. Storefront Performance Overview View
CREATE OR REPLACE VIEW public.v_storefront_performance AS
SELECT 
  s.id AS storefront_id,
  s.store_name,
  s.total_earnings,
  s.pending_payout,
  s.total_orders_count,
  COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'page_view') AS total_views,
  COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'product_view') AS total_product_views,
  COUNT(DISTINCT e.visitor_session_id) AS unique_visitors
FROM public.storefronts s
LEFT JOIN public.storefront_analytics_events e ON s.id = e.storefront_id
GROUP BY s.id, s.store_name, s.total_earnings, s.pending_payout, s.total_orders_count;
