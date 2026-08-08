-- ==========================================
-- Migration 025: Product Reviews & Ratings System
-- ==========================================

-- 1. Product Reviews Table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  storefront_id UUID REFERENCES public.storefronts(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Anonymous',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_review_per_order_product UNIQUE(order_id, product_id)
);

-- 2. Review Replies Table (Public response by Business Owner)
CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_reply_per_review UNIQUE(review_id)
);

-- 3. Review Reports Table (Business Owner reporting abusive reviews)
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_role TEXT NOT NULL DEFAULT 'business_owner',
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.product_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_review ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Policies for Reviews
CREATE POLICY "Public views unhidden reviews" ON public.product_reviews
  FOR SELECT USING (is_hidden = false OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()
  ));

CREATE POLICY "Anyone inserts reviews for delivered orders" ON public.product_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.status IN ('delivered', 'completed')
    )
  );

CREATE POLICY "Admins update reviews" ON public.product_reviews
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins delete reviews" ON public.product_reviews
  FOR DELETE USING (public.is_admin());

-- Policies for Review Replies
CREATE POLICY "Public reads review replies" ON public.review_replies FOR SELECT USING (true);
CREATE POLICY "Business owners insert/update review replies" ON public.review_replies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
    OR public.is_admin()
  );

-- Policies for Review Reports
CREATE POLICY "Business owners & Admins manage review reports" ON public.review_reports
  FOR ALL USING (reporter_id = auth.uid() OR public.is_admin());

-- Function & Trigger for recalculating ratings
CREATE OR REPLACE FUNCTION public.update_business_ratings_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_business_id UUID;
  v_avg_rating NUMERIC(3,2);
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_business_id := OLD.business_id;
  ELSE
    v_business_id := NEW.business_id;
  END IF;

  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00)
  INTO v_avg_rating
  FROM public.product_reviews
  WHERE business_id = v_business_id AND is_hidden = false;

  UPDATE public.businesses
  SET rating = v_avg_rating
  WHERE id = v_business_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_business_rating
AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_business_ratings_on_review();
