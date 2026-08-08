-- ==========================================
-- Migration 002: Enumerated Types
-- ==========================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'business_owner', 'reseller', 'creator', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'shipped', 'delivered', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'archived', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_account_status AS ENUM ('active', 'suspended', 'banned', 'pending_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appeal_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'more_info_requested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('Open', 'Investigating', 'Waiting for Business', 'Resolved', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('open', 'investigating', 'waiting_business_response', 'waiting_reseller_response', 'resolved', 'closed', 'actioned', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
