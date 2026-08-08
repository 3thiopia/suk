import { StorefrontCustomization, Storefront } from '../types';

export const FONT_OPTIONS = [
  { name: 'Inter', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
  { name: 'Manrope', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap' },
  { name: 'Plus Jakarta Sans', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
  { name: 'Poppins', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { name: 'Nunito', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap' },
  { name: 'Roboto', category: 'Sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
];

export const getDefaultCustomization = (
  input?: Partial<Storefront> | StorefrontCustomization
): StorefrontCustomization => {
  let custom: Partial<StorefrontCustomization> | undefined;
  let storefront: Partial<Storefront> | undefined;

  if (input && 'colors' in input) {
    custom = input as Partial<StorefrontCustomization>;
  } else if (input) {
    storefront = input as Partial<Storefront>;
    custom = storefront.customization;
  }

  return {
    headerLayout: custom?.headerLayout || 'logo_left',
    hero: {
      bannerUrl: custom?.hero?.bannerUrl || storefront?.bannerUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
      logoUrl: custom?.hero?.logoUrl || storefront?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      storeTitle: custom?.hero?.storeTitle || storefront?.storeName || 'Storefront Title',
      tagline: custom?.hero?.tagline || storefront?.bannerTitle || 'Curated White-Label Products',
      description: custom?.hero?.description || storefront?.bannerSubtitle || 'Discover authentic brand items fulfilled directly by manufacturers.',
      textAlign: custom?.hero?.textAlign || 'left',
      verticalAlign: custom?.hero?.verticalAlign || 'middle',
      bannerHeight: custom?.hero?.bannerHeight || 'medium',
    },
    colors: {
      primary: custom?.colors?.primary || '#059669', // Emerald 600
      secondary: custom?.colors?.secondary || '#10b981',
      accent: custom?.colors?.accent || '#34d399',
      background: custom?.colors?.background || '#f8fafc',
      surface: custom?.colors?.surface || '#ffffff',
      card: custom?.colors?.card || '#ffffff',
      text: custom?.colors?.text || '#334155',
      heading: custom?.colors?.heading || '#0f172a',
      button: custom?.colors?.button || '#0f172a',
      buttonHover: custom?.colors?.buttonHover || '#1e293b',
      border: custom?.colors?.border || '#e2e8f0',
      success: custom?.colors?.success || '#10b981',
      warning: custom?.colors?.warning || '#f59e0b',
      danger: custom?.colors?.danger || '#ef4444',
      colorMode: custom?.colors?.colorMode || 'light',
    },
    typography: {
      headingFont: custom?.typography?.headingFont || 'Manrope',
      bodyFont: custom?.typography?.bodyFont || 'Inter',
      fontSize: custom?.typography?.fontSize || 'medium',
      fontWeight: custom?.typography?.fontWeight || 'semibold',
      letterSpacing: custom?.typography?.letterSpacing || 'normal',
      lineHeight: custom?.typography?.lineHeight || 'normal',
    },
    buttons: {
      shape: custom?.buttons?.shape || 'rounded',
      size: custom?.buttons?.size || 'medium',
      variant: custom?.buttons?.variant || 'filled',
    },
    cards: {
      layout: custom?.cards?.layout || 'classic',
      imageRatio: custom?.cards?.imageRatio || '4:3',
      spacing: custom?.cards?.spacing || 'normal',
      borderRadius: custom?.cards?.borderRadius ?? 12,
      shadow: custom?.cards?.shadow || 'soft',
      hoverAnimation: custom?.cards?.hoverAnimation || 'lift',
      badgeStyle: custom?.cards?.badgeStyle || 'filled',
    },
    storeLayout: {
      gridColumns: custom?.storeLayout?.gridColumns || '3-column',
      contentWidth: custom?.storeLayout?.contentWidth || 'max-7xl',
      spacing: custom?.storeLayout?.spacing ?? 24,
      padding: custom?.storeLayout?.padding ?? 24,
    },
    navigation: {
      type: custom?.navigation?.type || 'sticky',
      height: custom?.navigation?.height ?? 64,
      bgTransparency: custom?.navigation?.bgTransparency ?? 95,
      blurEffect: custom?.navigation?.blurEffect ?? true,
      activeLinkColor: custom?.navigation?.activeLinkColor || '#059669',
    },
    footer: {
      show: custom?.footer?.show ?? true,
      bgColor: custom?.footer?.bgColor || '#0f172a',
      textColor: custom?.footer?.textColor || '#94a3b8',
      logoUrl: custom?.footer?.logoUrl || storefront?.logoUrl,
      copyrightText: custom?.footer?.copyrightText || `© ${new Date().getFullYear()} ${storefront?.storeName || 'Storefront'}. All rights reserved.`,
      showSocialLinks: custom?.footer?.showSocialLinks ?? true,
      showNewsletter: custom?.footer?.showNewsletter ?? true,
    },
    sections: {
      featuredProducts: custom?.sections?.featuredProducts ?? true,
      newArrivals: custom?.sections?.newArrivals ?? true,
      collections: custom?.sections?.collections ?? true,
      categories: custom?.sections?.categories ?? true,
      testimonials: custom?.sections?.testimonials ?? true,
      aboutUs: custom?.sections?.aboutUs ?? true,
      contact: custom?.sections?.contact ?? true,
      faq: custom?.sections?.faq ?? true,
      newsletter: custom?.sections?.newsletter ?? true,
      instagramFeed: custom?.sections?.instagramFeed ?? false,
    },
    animations: {
      type: custom?.animations?.type || 'fade',
    },
    socialDisplayConfig: {
      placements: custom?.socialDisplayConfig?.placements || ['header', 'footer', 'about', 'contact'],
      alignment: custom?.socialDisplayConfig?.alignment || 'center',
      size: custom?.socialDisplayConfig?.size || 'medium',
      style: custom?.socialDisplayConfig?.style || 'filled',
      useThemeColors: custom?.socialDisplayConfig?.useThemeColors ?? true,
      customColor: custom?.socialDisplayConfig?.customColor || '#059669',
      customHoverColor: custom?.socialDisplayConfig?.customHoverColor || '#047857',
      customBgColor: custom?.socialDisplayConfig?.customBgColor || '#f1f5f9',
      borderRadius: custom?.socialDisplayConfig?.borderRadius ?? 12,
      spacing: custom?.socialDisplayConfig?.spacing ?? 12,
      hoverAnimation: custom?.socialDisplayConfig?.hoverAnimation || 'lift',
    },
  };
};

export function getContrastTextColor(hexColor?: string, defaultColor = '#ffffff'): string {
  if (!hexColor || !hexColor.startsWith('#')) return defaultColor;
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return defaultColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
}

export function getFontStyle(fontName?: string) {
  if (!fontName) return { fontFamily: 'inherit' };
  const fontObj = FONT_OPTIONS.find((f) => f.name === fontName);
  return fontObj ? { fontFamily: `'${fontObj.name}', sans-serif` } : { fontFamily: fontName };
}

export function getButtonBorderRadius(shape?: string): string {
  switch (shape) {
    case 'pill':
      return '9999px';
    case 'square':
      return '0px';
    default:
      return '12px';
  }
}

export function getCardBorderRadius(radius?: number | string): string {
  if (typeof radius === 'number') return `${radius}px`;
  if (typeof radius === 'string' && radius) return radius;
  return '16px';
}

export const THEME_PRESETS: { id: string; name: string; description: string; colors: string[]; config: Partial<StorefrontCustomization> }[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    description: 'Sleek, minimalist interface inspired by Stripe & Linear.',
    colors: ['#059669', '#ffffff', '#0f172a', '#f8fafc'],
    config: {
      headerLayout: 'logo_left',
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        background: '#f8fafc',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#334155',
        heading: '#0f172a',
        button: '#0f172a',
        buttonHover: '#1e293b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Manrope',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'semibold',
        letterSpacing: 'normal',
        lineHeight: 'normal',
      },
      buttons: { shape: 'rounded', size: 'medium', variant: 'filled' },
      cards: { layout: 'modern', imageRatio: '4:3', spacing: 'normal', borderRadius: 12, shadow: 'soft', hoverAnimation: 'lift', badgeStyle: 'filled' },
      storeLayout: { gridColumns: '3-column', contentWidth: 'max-7xl', spacing: 24, padding: 24 },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Monochromic',
    description: 'High typography focus with subtle borders and negative space.',
    colors: ['#18181b', '#ffffff', '#71717a', '#fafafa'],
    config: {
      headerLayout: 'minimal_centered',
      colors: {
        primary: '#18181b',
        secondary: '#27272a',
        accent: '#52525b',
        background: '#fafafa',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#3f3f46',
        heading: '#18181b',
        button: '#18181b',
        buttonHover: '#27272a',
        border: '#e4e4e7',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'bold',
        letterSpacing: 'tight',
        lineHeight: 'tight',
      },
      buttons: { shape: 'square', size: 'medium', variant: 'filled' },
      cards: { layout: 'minimal', imageRatio: '1:1', spacing: 'tight', borderRadius: 4, shadow: 'none', hoverAnimation: 'none', badgeStyle: 'outlined' },
      storeLayout: { gridColumns: '3-column', contentWidth: 'max-5xl', spacing: 16, padding: 20 },
    },
  },
  {
    id: 'luxury',
    name: 'Luxury Obsidian',
    description: 'Rich dark obsidian canvas with gold & champagne accents.',
    colors: ['#d97706', '#09090b', '#fef3c7', '#18181b'],
    config: {
      headerLayout: 'logo_center',
      colors: {
        primary: '#d97706',
        secondary: '#f59e0b',
        accent: '#fbbf24',
        background: '#09090b',
        surface: '#18181b',
        card: '#18181b',
        text: '#d4d4d8',
        heading: '#ffffff',
        button: '#d97706',
        buttonHover: '#b45309',
        border: '#27272a',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'dark',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'medium',
        letterSpacing: 'wide',
        lineHeight: 'relaxed',
      },
      buttons: { shape: 'pill', size: 'large', variant: 'filled' },
      cards: { layout: 'large', imageRatio: '1:1', spacing: 'spacious', borderRadius: 16, shadow: 'heavy', hoverAnimation: 'scale', badgeStyle: 'filled' },
      storeLayout: { gridColumns: '2-column', contentWidth: 'max-7xl', spacing: 32, padding: 32 },
    },
  },
  {
    id: 'technology',
    name: 'Deep Ocean Tech',
    description: 'Vibrant cobalt blue with glassmorphism blur navigation.',
    colors: ['#2563eb', '#eff6ff', '#1e40af', '#ffffff'],
    config: {
      headerLayout: 'sticky_modern',
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: '#f8fafc',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#334155',
        heading: '#0f172a',
        button: '#2563eb',
        buttonHover: '#1d4ed8',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Plus Jakarta Sans',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'bold',
        letterSpacing: 'normal',
        lineHeight: 'normal',
      },
      buttons: { shape: 'rounded', size: 'medium', variant: 'filled' },
      cards: { layout: 'modern', imageRatio: '16:9', spacing: 'normal', borderRadius: 16, shadow: 'medium', hoverAnimation: 'glow', badgeStyle: 'filled' },
      storeLayout: { gridColumns: '4-column', contentWidth: 'full', spacing: 20, padding: 24 },
    },
  },
  {
    id: 'fashion',
    name: 'Warm Sunset Boutique',
    description: 'Earthy terracotta tones with generous image aspect ratios.',
    colors: ['#ea580c', '#fff7ed', '#9a3412', '#ffffff'],
    config: {
      headerLayout: 'hero_full',
      colors: {
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#fb923c',
        background: '#fff7ed',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#431407',
        heading: '#7c2d12',
        button: '#ea580c',
        buttonHover: '#c2410c',
        border: '#ffedd5',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Nunito',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'semibold',
        letterSpacing: 'wide',
        lineHeight: 'relaxed',
      },
      buttons: { shape: 'pill', size: 'medium', variant: 'soft' },
      cards: { layout: 'classic', imageRatio: '3:4', spacing: 'spacious', borderRadius: 16, shadow: 'soft', hoverAnimation: 'lift', badgeStyle: 'subtle' },
      storeLayout: { gridColumns: '3-column', contentWidth: 'max-7xl', spacing: 24, padding: 24 },
    },
  },
  {
    id: 'dark',
    name: 'Midnight Neon Dark',
    description: 'High contrast dark interface with glowing accent highlights.',
    colors: ['#10b981', '#0f172a', '#34d399', '#1e293b'],
    config: {
      headerLayout: 'logo_left',
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#6ee7b7',
        background: '#0f172a',
        surface: '#1e293b',
        card: '#1e293b',
        text: '#94a3b8',
        heading: '#f8fafc',
        button: '#10b981',
        buttonHover: '#059669',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'dark',
      },
      typography: {
        headingFont: 'Manrope',
        bodyFont: 'Inter',
        fontSize: 'medium',
        fontWeight: 'bold',
        letterSpacing: 'normal',
        lineHeight: 'normal',
      },
      buttons: { shape: 'rounded', size: 'medium', variant: 'filled' },
      cards: { layout: 'marketplace', imageRatio: '1:1', spacing: 'normal', borderRadius: 12, shadow: 'medium', hoverAnimation: 'glow', badgeStyle: 'filled' },
      storeLayout: { gridColumns: '3-column', contentWidth: 'max-7xl', spacing: 20, padding: 24 },
    },
  },
  {
    id: 'elegant',
    name: 'Midnight Velvet Purple',
    description: 'Sophisticated deep violet theme with elegant font choices.',
    colors: ['#7c3aed', '#faf5ff', '#6d28d9', '#ffffff'],
    config: {
      headerLayout: 'split',
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#a78bfa',
        background: '#faf5ff',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#4c1d95',
        heading: '#2e1065',
        button: '#7c3aed',
        buttonHover: '#6d28d9',
        border: '#f3e8ff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Manrope',
        bodyFont: 'Roboto',
        fontSize: 'medium',
        fontWeight: 'semibold',
        letterSpacing: 'normal',
        lineHeight: 'relaxed',
      },
      buttons: { shape: 'rounded', size: 'large', variant: 'filled' },
      cards: { layout: 'classic', imageRatio: '4:3', spacing: 'spacious', borderRadius: 16, shadow: 'soft', hoverAnimation: 'lift', badgeStyle: 'filled' },
      storeLayout: { gridColumns: '3-column', contentWidth: 'max-7xl', spacing: 28, padding: 24 },
    },
  },
  {
    id: 'creative',
    name: 'Vibrant Creative',
    description: 'Playful multi-color grid with round pills and dynamic cards.',
    colors: ['#ec4899', '#fff1f2', '#be185d', '#ffffff'],
    config: {
      headerLayout: 'logo_above_title',
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fbcfe8',
        background: '#fff1f2',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#831843',
        heading: '#500724',
        button: '#ec4899',
        buttonHover: '#db2777',
        border: '#ffe4e6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        colorMode: 'light',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Nunito',
        fontSize: 'large',
        fontWeight: 'bold',
        letterSpacing: 'wide',
        lineHeight: 'normal',
      },
      buttons: { shape: 'pill', size: 'medium', variant: 'filled' },
      cards: { layout: 'compact', imageRatio: '1:1', spacing: 'tight', borderRadius: 20, shadow: 'medium', hoverAnimation: 'scale', badgeStyle: 'subtle' },
      storeLayout: { gridColumns: '4-column', contentWidth: 'full', spacing: 16, padding: 20 },
    },
  },
];
