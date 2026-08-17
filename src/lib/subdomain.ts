import { Storefront } from '../types';
import { storage } from './storage';

// 1. Reserved Subdomains List (Platform System Keywords)
export const RESERVED_SLUGS: string[] = [
  'www',
  'admin',
  'api',
  'app',
  'mail',
  'support',
  'help',
  'login',
  'signup',
  'dashboard',
  'account',
  'auth',
  'static',
  'cdn',
  'assets',
  'store',
  'mystore',
  'et',
  'root',
  'terms',
  'privacy',
  'billing',
  'webhook',
  'status',
  'portal',
  'index',
  'home',
  'checkout',
  'cart',
  'orders',
  'reseller',
  'business',
  'public',
  'images',
  'uploads',
  'sysadmin',
  'explore',
  'analytics',
  'settings',
  'notifications',
  'appeals',
  'marketplace',
  'signin',
  'register',
  'get-started',
];

/**
 * Get the configured primary platform domain (e.g. "suk.et").
 */
export function getPlatformDomain(): string {
  const env = (import.meta as any).env || {};
  return (
    env.VITE_PLATFORM_DOMAIN ||
    env.NEXT_PUBLIC_PLATFORM_DOMAIN ||
    'suk.et'
  );
}

/**
 * Get the configured primary storefront domain (e.g. "mystore.et").
 */
export function getStorefrontDomain(): string {
  const env = (import.meta as any).env || {};
  return (
    env.VITE_STOREFRONT_DOMAIN ||
    env.NEXT_PUBLIC_STOREFRONT_DOMAIN ||
    'mystore.et'
  );
}

/**
 * Normalize raw text into a URL-safe lowercase slug with hyphens.
 * Example: "Abebe Fashion & Electronics" -> "abebe-fashion-electronics"
 */
export function normalizeSlug(input: string | any): string {
  if (!input) return '';
  const strInput = typeof input === 'string' ? input : String(input);
  return strInput
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens
}

/**
 * Check if a given slug is reserved by the platform.
 */
export function isSlugReserved(slug: string): boolean {
  const clean = normalizeSlug(slug);
  return RESERVED_SLUGS.includes(clean);
}

/**
 * Check if a slug is available (not reserved and not used by another storefront or alias).
 */
export function isSlugAvailable(slug: string, currentStorefrontId?: string): boolean {
  const clean = normalizeSlug(slug);
  if (!clean || clean.length < 2) return false;
  if (isSlugReserved(clean)) return false;

  const storefronts = storage.getStorefronts();
  const match = storefronts.find((s) => {
    if (currentStorefrontId && s.id === currentStorefrontId) return false;
    if (s.slug === clean) return true;
    if (s.previousSlugs && s.previousSlugs.includes(clean)) return true;
    return false;
  });

  return !match;
}

/**
 * Generate a unique slug for a storefront based on store name or desired slug.
 */
export function generateUniqueSlug(storeName: string, currentStorefrontId?: string): string {
  const baseSlug = normalizeSlug(storeName) || 'store';

  if (isSlugAvailable(baseSlug, currentStorefrontId)) {
    return baseSlug;
  }

  // Try standard suffixes
  const suffixes = ['shop', 'store', 'et', 'hub', 'official', 'market', 'direct', 'online'];
  for (const suf of suffixes) {
    const candidate = `${baseSlug}-${suf}`;
    if (isSlugAvailable(candidate, currentStorefrontId)) {
      return candidate;
    }
  }

  // Fallback to numeric increment
  let counter = 1;
  while (counter < 100) {
    const candidate = `${baseSlug}-${counter}`;
    if (isSlugAvailable(candidate, currentStorefrontId)) {
      return candidate;
    }
    counter++;
  }

  // Random fallback
  return `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Generate alternative available slug suggestions for a user when their primary choice is taken.
 */
export function generateSlugSuggestions(storeName: string, currentStorefrontId?: string): string[] {
  const baseSlug = normalizeSlug(storeName) || 'store';
  const suggestions: string[] = [];

  const candidates = [
    `${baseSlug}-shop`,
    `${baseSlug}-official`,
    `${baseSlug}-store`,
    `${baseSlug}-et`,
    `${baseSlug}-hub`,
    `${baseSlug}-express`,
    `${baseSlug}-ethiopia`,
  ];

  for (const candidate of candidates) {
    if (isSlugAvailable(candidate, currentStorefrontId) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
    if (suggestions.length >= 4) break;
  }

  if (suggestions.length === 0) {
    suggestions.push(`${baseSlug}-${Math.floor(100 + Math.random() * 899)}`);
  }

  return suggestions;
}

/**
 * Get the full domain representation for a storefront.
 * Example: "abebe" -> "abebe.mystore.et"
 */
export function getStorefrontFullDomain(slug: string): string {
  const domain = getStorefrontDomain();
  const cleanSlug = normalizeSlug(slug) || 'store';
  return `${cleanSlug}.${domain}`;
}

/**
 * Get the canonical production HTTP URL for a storefront slug.
 * Always generates https://<slug>.<storefrontDomain>
 * Example: "abebe" -> "https://abebe.mystore.et"
 */
export function getStorefrontUrl(slug: string): string {
  const fullDomain = getStorefrontFullDomain(slug);
  return `https://${fullDomain}`;
}

/**
 * Check if a host belongs to a development, preview, or cloud runner environment
 * where automatic storefront subdomain extraction must NOT be performed.
 */
export function isDevOrPreviewHost(hostNoPort: string): boolean {
  if (!hostNoPort) return true;

  const normalizedHost = hostNoPort.toLowerCase();

  // Local IPs & Localhost
  if (
    normalizedHost === 'localhost' ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost === '0.0.0.0' ||
    normalizedHost === '::1' ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)
  ) {
    return true;
  }

  // Cloud Run / AI Studio containers, Vercel, Netlify, Render, Github Pages, Replit
  if (
    normalizedHost.endsWith('.run.app') ||
    normalizedHost.endsWith('.vercel.app') ||
    normalizedHost.endsWith('.vercel.dev') ||
    normalizedHost.endsWith('.github.io') ||
    normalizedHost.endsWith('.netlify.app') ||
    normalizedHost.endsWith('.onrender.com') ||
    normalizedHost.endsWith('.replit.dev') ||
    normalizedHost.endsWith('.stackblitz.io') ||
    normalizedHost.endsWith('.webcontainer.io')
  ) {
    return true;
  }

  return false;
}

/**
 * Check if host matches platform apex or www domain (e.g. suk.et, www.suk.et, mystore.et, www.mystore.et)
 */
export function isPlatformApexHost(hostNoPort: string): boolean {
  if (!hostNoPort) return true;
  const normalized = hostNoPort.toLowerCase();
  const platformDomain = getPlatformDomain().toLowerCase();
  const storefrontDomain = getStorefrontDomain().toLowerCase();

  return (
    normalized === platformDomain ||
    normalized === `www.${platformDomain}` ||
    normalized === storefrontDomain ||
    normalized === `www.${storefrontDomain}`
  );
}

/**
 * Extract storefront slug from current hostname or query parameters.
 * 
 * Rules:
 * 1. Explicit query parameters (?store=x, ?subdomain=x, ?sf=x) take priority (great for dev/testing).
 * 2. Dev/Preview hosts (Cloud Run *.run.app, Vercel *.vercel.app, localhost, etc.) return null (no storefront auto-resolution).
 * 3. Platform apex hosts (suk.et, www.suk.et, mystore.et, www.mystore.et) return null.
 * 4. Production storefront hostnames (e.g. abebe.mystore.et or abebe.suk.et):
 *    - Extracts subdomain prefix "abebe".
 *    - Verifies it is not a reserved system keyword.
 *    - Queries storage/Supabase for the storefront.
 *    - Returns the resolved slug if found.
 *    - Returns the extracted slug if not found (so StoreNotFoundView can properly display for nonexistent.mystore.et).
 */
export function getStorefrontSlugFromHostname(
  hostname?: string,
  searchParams?: URLSearchParams
): { slug: string | null; isAliasMatch?: boolean; aliasOriginalSlug?: string } {
  // 1. Check Query Params override (useful for dev preview, iframe, or testing)
  if (searchParams) {
    const paramSlug = searchParams.get('store') || searchParams.get('subdomain') || searchParams.get('sf');
    if (paramSlug) {
      const cleanParam = normalizeSlug(paramSlug);
      if (!isSlugReserved(cleanParam)) {
        return resolveSlugWithAliasCheck(cleanParam);
      }
    }
  }

  // 2. Parse Hostname
  const currentHost =
    hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  if (!currentHost) return { slug: null };

  const hostNoPort = currentHost.split(':')[0].toLowerCase();

  // 3. Dev / Preview / Container Hosts (e.g. ais-dev-*.run.app, *.vercel.app, localhost)
  if (isDevOrPreviewHost(hostNoPort)) {
    // Exception: Allow local wildcard testing like "abebe.localhost"
    if (hostNoPort.endsWith('.localhost')) {
      const parts = hostNoPort.split('.');
      if (parts.length === 2 && parts[0] && parts[0] !== 'www') {
        const localSlug = normalizeSlug(parts[0]);
        if (!isSlugReserved(localSlug)) {
          return resolveSlugWithAliasCheck(localSlug);
        }
      }
    }
    return { slug: null };
  }

  // 4. Platform Main Apex / WWW Hosts
  if (isPlatformApexHost(hostNoPort)) {
    return { slug: null };
  }

  // 5. Genuine Storefront Subdomain Host (e.g. abebe.mystore.et or abebe.suk.et)
  const storefrontDomain = getStorefrontDomain().toLowerCase();
  const platformDomain = getPlatformDomain().toLowerCase();

  let extractedSubdomain: string | null = null;

  if (hostNoPort.endsWith(`.${storefrontDomain}`)) {
    const prefix = hostNoPort.slice(0, -(storefrontDomain.length + 1));
    if (prefix && !prefix.includes('.')) {
      extractedSubdomain = normalizeSlug(prefix);
    }
  } else if (hostNoPort.endsWith(`.${platformDomain}`)) {
    const prefix = hostNoPort.slice(0, -(platformDomain.length + 1));
    if (prefix && !prefix.includes('.')) {
      extractedSubdomain = normalizeSlug(prefix);
    }
  }

  if (extractedSubdomain && !isSlugReserved(extractedSubdomain)) {
    return resolveSlugWithAliasCheck(extractedSubdomain);
  }

  return { slug: null };
}

/**
 * Resolves a slug or alias against storage to see if it matches a primary slug or historical alias.
 */
export function resolveSlugWithAliasCheck(
  extractedSlug: string
): { slug: string | null; isAliasMatch?: boolean; aliasOriginalSlug?: string } {
  const clean = normalizeSlug(extractedSlug);
  if (!clean || isSlugReserved(clean)) return { slug: null };

  const storefronts = storage.getStorefronts();

  // Check direct slug or ID match first
  const directMatch = storefronts.find(
    (s) => s.slug === clean || s.slug.toLowerCase() === clean.toLowerCase() || s.id === extractedSlug || s.resellerId === extractedSlug
  );
  if (directMatch) {
    return { slug: directMatch.slug, isAliasMatch: false };
  }

  // Check historical alias match
  const aliasMatch = storefronts.find(
    (s) => s.previousSlugs && s.previousSlugs.some((ps) => ps === clean || ps.toLowerCase() === clean.toLowerCase())
  );
  if (aliasMatch) {
    return {
      slug: aliasMatch.slug,
      isAliasMatch: true,
      aliasOriginalSlug: clean,
    };
  }

  // Return the slug anyway so the app can show "Store Not Found" page for this specific slug on production storefront domains
  return { slug: clean, isAliasMatch: false };
}

/**
 * Social sharing formatting helpers
 */
export function getStorefrontShareLinks(storefront: Storefront) {
  const url = getStorefrontUrl(storefront.slug);
  const title = storefront.storeName;
  const description =
    storefront.bannerSubtitle || `Explore curated white-label products on ${storefront.storeName}!`;
  const shareText = `Check out ${title} on SUK! ${description}`;

  return {
    url,
    title,
    shareText,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out ${title}`)}&body=${encodeURIComponent(`${shareText}\n\nVisit: ${url}`)}`,
  };
}
