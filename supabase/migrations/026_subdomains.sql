-- Migration 026: Storefront Subdomains, Reserved Words & Historical Aliases

-- 1. Table: Reserved Subdomains
CREATE TABLE IF NOT EXISTS public.reserved_slugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Reserved Words
INSERT INTO public.reserved_slugs (word) VALUES
    ('www'), ('admin'), ('api'), ('app'), ('mail'), ('support'),
    ('help'), ('login'), ('signup'), ('dashboard'), ('account'),
    ('auth'), ('static'), ('cdn'), ('assets'), ('store'),
    ('mystore'), ('et'), ('root'), ('terms'), ('privacy'),
    ('billing'), ('webhook'), ('status'), ('portal'), ('index'),
    ('home'), ('checkout'), ('cart'), ('orders'), ('reseller'),
    ('business'), ('public'), ('images'), ('uploads'), ('sysadmin')
ON CONFLICT (word) DO NOTHING;

-- 2. Enhance Storefronts Table
ALTER TABLE public.storefronts 
    ADD COLUMN IF NOT EXISTS store_slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS store_domain TEXT,
    ADD COLUMN IF NOT EXISTS previous_slugs TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index on store_slug and previous_slugs for fast hostname resolution
CREATE INDEX IF NOT EXISTS idx_storefronts_store_slug ON public.storefronts (store_slug);
CREATE INDEX IF NOT EXISTS idx_storefronts_previous_slugs ON public.storefronts USING GIN (previous_slugs);

-- 3. Table: Storefront Slug Change History
CREATE TABLE IF NOT EXISTS public.storefront_slug_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
    old_slug TEXT NOT NULL,
    new_slug TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storefront_history_storefront ON public.storefront_slug_history(storefront_id);

-- 4. Trigger Function: Validate Reserved Words and Format Slugs
CREATE OR REPLACE FUNCTION public.validate_storefront_slug()
RETURNS TRIGGER AS $$
DECLARE
    is_reserved BOOLEAN;
BEGIN
    -- Lowercase & sanitize slug
    NEW.store_slug := LOWER(TRIM(NEW.store_slug));

    -- Check if slug is in reserved_slugs
    SELECT EXISTS (
        SELECT 1 FROM public.reserved_slugs WHERE word = NEW.store_slug
    ) INTO is_reserved;

    IF is_reserved THEN
        RAISE EXCEPTION 'Storefront slug "%" is a reserved platform keyword.', NEW.store_slug;
    END IF;

    -- Track history if slug changed
    IF (TG_OP = 'UPDATE') AND (OLD.store_slug IS DISTINCT FROM NEW.store_slug) THEN
        -- Add old slug to previous_slugs array if not already present
        IF NOT (OLD.store_slug = ANY(NEW.previous_slugs)) THEN
            NEW.previous_slugs := array_append(NEW.previous_slugs, OLD.store_slug);
        END IF;

        -- Record history
        INSERT INTO public.storefront_slug_history (storefront_id, old_slug, new_slug)
        VALUES (NEW.id, OLD.store_slug, NEW.store_slug);
    END IF;

    -- Update store_domain
    NEW.store_domain := NEW.store_slug || '.mystore.et';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Trigger
DROP TRIGGER IF EXISTS trigger_validate_storefront_slug ON public.storefronts;
CREATE TRIGGER trigger_validate_storefront_slug
    BEFORE INSERT OR UPDATE OF store_slug ON public.storefronts
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_storefront_slug();

-- 5. RLS Security Policies
ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_slug_history ENABLE ROW LEVEL SECURITY;

-- Anyone can read reserved slugs
CREATE POLICY "Public read reserved_slugs" 
    ON public.reserved_slugs FOR SELECT 
    USING (true);

-- Resellers can read their own slug history
CREATE POLICY "Resellers view own slug history" 
    ON public.storefront_slug_history FOR SELECT 
    USING (auth.uid() = (SELECT reseller_id FROM public.storefronts WHERE id = storefront_id));
