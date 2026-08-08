import { useEffect } from 'react';
import { Storefront } from '../types';
import { getStorefrontUrl } from '../lib/subdomain';

/**
 * Dynamically injects SEO and Open Graph metadata into the page head
 * for the active storefront.
 */
export function useStorefrontMeta(storefront?: Storefront | null) {
  useEffect(() => {
    if (!storefront) return;

    const storeTitle = storefront.storeName;
    const storeDescription =
      storefront.bannerSubtitle ||
      `Shop curated white-label products on ${storefront.storeName}! Guaranteed fast delivery and buyer protection.`;
    const storeImage = storefront.bannerUrl || storefront.logoUrl;
    const canonicalUrl = getStorefrontUrl(storefront.slug);

    // 1. Update Title
    document.title = `${storeTitle} | Official Storefront`;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set canonical link
    const setCanonicalLink = (url: string) => {
      let link = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // Set Standard Meta Tags
    setMetaTag('name', 'description', storeDescription);

    // Set Open Graph Tags
    setMetaTag('property', 'og:title', storeTitle);
    setMetaTag('property', 'og:description', storeDescription);
    setMetaTag('property', 'og:image', storeImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', storeTitle);

    // Set Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', storeTitle);
    setMetaTag('name', 'twitter:description', storeDescription);
    setMetaTag('name', 'twitter:image', storeImage);

    // Set Canonical URL
    setCanonicalLink(canonicalUrl);

    // Cleanup on unmount
    return () => {
      document.title = 'SUK | Commerce Platform';
    };
  }, [storefront]);
}
