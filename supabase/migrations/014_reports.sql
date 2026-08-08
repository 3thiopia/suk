-- ==========================================
-- Migration 014: Reports, Tickets, & Disputes Tables
-- ==========================================

-- 1. Moderation Reports Table
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('business', 'reseller', 'product', 'order')),
  target_id UUID NOT NULL,
  target_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'reviewed', 'actioned', 'dismissed', 'investigating', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Order Reports Table (Creator reporting issues with supplier orders)
CREATE TABLE IF NOT EXISTS public.order_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reseller_name TEXT NOT NULL,
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  storefront_name TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  business_name TEXT,
  product_title TEXT,
  items_summary TEXT NOT NULL,
  order_date TIMESTAMPTZ NOT NULL,
  order_status TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  reseller_commission NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'waiting_business_response', 'waiting_reseller_response', 'resolved', 'closed')),
  notes JSONB DEFAULT '[]'::jsonb,
  resolution_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Support Tickets Table (Admin & Support Desk)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('customer', 'reseller')),
  customer_name TEXT,
  customer_phone TEXT,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  reseller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reseller_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Waiting for Business', 'Resolved', 'Closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reporter_role TEXT NOT NULL,
  respondent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL,
  respondent_role TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  reason TEXT,
  description TEXT NOT NULL,
  disputed_amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'rejected')),
  messages JSONB DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  resolution_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mod_reports_reporter ON public.moderation_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_order_reports_order ON public.order_reports(order_id);
CREATE INDEX IF NOT EXISTS idx_order_reports_reseller ON public.order_reports(reseller_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON public.support_tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_disputes_order ON public.disputes(order_id);
