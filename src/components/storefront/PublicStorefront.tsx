import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Eye,
  Check,
  Tag,
  Filter,
  Star,
  ShieldCheck,
  Heart,
  HelpCircle,
  MessageSquare,
  Instagram,
  Mail,
  Send,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Grid,
  SlidersHorizontal,
  Menu,
  X,
  Home,
  Layers,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Storefront, StorefrontProduct, Product, Collection, CartItem, StorefrontCustomization } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { getDefaultCustomization, FONT_OPTIONS } from '../../lib/customizationDefaults';
import { SocialLinksDisplay } from '../common/SocialLinksDisplay';
import { CustomerProductDetailsModal } from './CustomerProductDetailsModal';
import { useTranslation, LanguageSwitcher } from '../../lib/i18n/LanguageContext';
import { useStorefrontMeta } from '../../hooks/useStorefrontMeta';
import { StoreNotFoundView } from './StoreNotFoundView';
import { StoreUnavailableView } from './StoreUnavailableView';

interface PublicStorefrontProps {
  slug?: string;
  storefrontOverride?: Storefront;
  customizationOverride?: StorefrontCustomization;
  cart?: CartItem[];
  onAddToCart?: (product: Product, selectedCoverImage: string, storefrontProductId: string, quantity?: number) => void;
  onOpenCart?: () => void;
  onNavigate?: (path: string) => void;
  isPreviewMode?: boolean;
  isMobilePreview?: boolean;
}

export function PublicStorefront({
  slug,
  storefrontOverride,
  customizationOverride,
  cart = [],
  onAddToCart,
  onOpenCart,
  onNavigate,
  isPreviewMode = false,
  isMobilePreview = false,
}: PublicStorefrontProps) {
  const { t } = useTranslation();

  const fetchedStorefront = storefrontOverride
    ? storefrontOverride
    : slug
    ? storage.getStorefrontBySlug(slug)
    : storage.getStorefronts()[0];

  useStorefrontMeta(fetchedStorefront);

  if (slug && !fetchedStorefront) {
    return <StoreNotFoundView slug={slug} onNavigate={onNavigate} />;
  }

  if (fetchedStorefront && (fetchedStorefront.status === 'suspended' || fetchedStorefront.isDisabled)) {
    return <StoreUnavailableView storefront={fetchedStorefront} onNavigate={onNavigate} />;
  }

  const storefront = fetchedStorefront || storage.getStorefronts()[0];
  const storefrontProducts = storage.getStorefrontProductsWithDetails(storefront.id).filter((sp) => sp.isVisible);
  const collections = storage.getCollections(storefront.id);

  const customization: StorefrontCustomization =
    customizationOverride || storefront.customization || getDefaultCustomization(storefront);

  const { hero, colors, typography, buttons, cards, storeLayout, navigation, footer, sections, headerLayout } =
    customization;

  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<StorefrontProduct | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'catalog' | 'search' | 'cart'>('home');

  // Bottom Nav Customization Inherited Theme Variables
  const navBgColor = colors.surface || colors.card || colors.background || '#ffffff';
  const navBorderColor = colors.border || 'rgba(0,0,0,0.1)';
  const navTextColor = colors.text || '#475569';
  const navPrimaryColor = colors.primary || colors.button || '#059669';
  const navShapeRadius = buttons.shape === 'pill' ? '9999px' : buttons.shape === 'square' ? '0px' : '14px';
  const navFontFamily = typography.bodyFont || 'inherit';

  // Load Google Fonts dynamically if requested
  useEffect(() => {
    const fontsToLoad = [typography.headingFont, typography.bodyFont];
    fontsToLoad.forEach((fontName) => {
      const fontObj = FONT_OPTIONS.find((f) => f.name === fontName);
      if (fontObj) {
        const id = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = fontObj.url;
          document.head.appendChild(link);
        }
      }
    });
  }, [typography.headingFont, typography.bodyFont]);

  const filteredProducts = storefrontProducts.filter((sp) => {
    const p = sp.product;
    if (!p) return false;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollection =
      selectedCollection === 'all' || sp.collectionIds.includes(selectedCollection);

    return matchesSearch && matchesCollection;
  });

  const cartTotalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Helper styles generator
  const getButtonShapeClass = () => {
    switch (buttons.shape) {
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      default:
        return 'rounded-xl';
    }
  };

  const getButtonSizeClass = () => {
    switch (buttons.size) {
      case 'small':
        return 'px-3 py-1.5 text-xs';
      case 'large':
        return 'px-6 py-3 text-sm font-extrabold';
      default:
        return 'px-4 py-2.5 text-xs font-bold';
    }
  };

  const getButtonVariantStyle = () => {
    switch (buttons.variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          border: `1.5px solid ${colors.primary}`,
        };
      case 'soft':
        return {
          backgroundColor: `${colors.primary}18`,
          color: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.heading,
        };
      default: // filled
        return {
          backgroundColor: colors.button,
          color: '#ffffff',
        };
    }
  };

  const getHeroHeightClass = () => {
    switch (hero.bannerHeight) {
      case 'small':
        return 'py-10 sm:py-16 min-h-[180px]';
      case 'large':
        return 'py-24 sm:py-36 min-h-[420px]';
      case 'full':
        return 'py-32 sm:py-48 min-h-[85vh] flex items-center';
      default: // medium
        return 'py-16 sm:py-24 min-h-[280px]';
    }
  };

  const getHeroAlignClass = () => {
    switch (hero.textAlign) {
      case 'center':
        return 'text-center items-center mx-auto';
      case 'right':
        return 'text-right items-end ml-auto';
      default:
        return 'text-left items-start';
    }
  };

  const getHeroVerticalClass = () => {
    switch (hero.verticalAlign) {
      case 'top':
        return 'justify-start';
      case 'bottom':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  const getImageRatioClass = () => {
    switch (cards.imageRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '3:4':
        return 'aspect-3/4';
      default:
        return 'aspect-4/3';
    }
  };

  const getShadowClass = () => {
    switch (cards.shadow) {
      case 'none':
        return 'shadow-none';
      case 'medium':
        return 'shadow-md';
      case 'heavy':
        return 'shadow-xl';
      default:
        return 'shadow-xs';
    }
  };

  const getHoverAnimClass = () => {
    switch (cards.hoverAnimation) {
      case 'lift':
        return 'hover:-translate-y-1.5 transition-transform duration-200';
      case 'scale':
        return 'hover:scale-[1.02] transition-transform duration-200';
      case 'glow':
        return 'hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow duration-200';
      default:
        return '';
    }
  };

  const getGridColumnsClass = () => {
    switch (storeLayout.gridColumns) {
      case '2-column':
        return 'grid-cols-1 sm:grid-cols-2';
      case '4-column':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'list':
        return 'grid-cols-1';
      case 'featured':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'magazine':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getContainerWidthClass = () => {
    switch (storeLayout.contentWidth) {
      case 'full':
        return 'w-full max-w-full px-4 sm:px-8';
      case 'max-5xl':
        return 'w-full max-w-5xl mx-auto px-4 sm:px-6';
      default:
        return 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  const fontHeadingStyle = { fontFamily: `"${typography.headingFont}", sans-serif` };
  const fontBodyStyle = { fontFamily: `"${typography.bodyFont}", sans-serif` };

  return (
    <div
      className="min-h-screen transition-colors overflow-x-hidden w-full max-w-full no-scrollbar"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        ...fontBodyStyle,
      }}
    >
      {/* Dynamic Header Layout */}
      <nav
        className={`${navigation.type === 'sticky' ? 'sticky top-0 z-40' : 'relative z-40'} transition-all`}
        style={{
          backgroundColor: `${colors.surface}${Math.round((navigation.bgTransparency / 100) * 255)
            .toString(16)
            .padStart(2, '0')}`,
          backdropFilter: navigation.blurEffect ? 'blur(12px)' : 'none',
          borderColor: colors.border,
          borderBottomWidth: '1px',
          minHeight: `${navigation.height}px`,
        }}
      >
        <div className={`${getContainerWidthClass()} flex h-full items-center justify-between py-2`}>
          {/* Header Layout Variations */}
          {headerLayout === 'logo_center' || headerLayout === 'minimal_centered' ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={hero.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover border" />
                <span className="text-sm font-extrabold truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  {hero.storeTitle}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
                <a href="#catalog-section" onClick={() => setSelectedCollection('all')} className="hover:opacity-80 transition-opacity" style={{ color: colors.primary }}>
                  Catalog
                </a>
                <a href="#catalog-section" className="hover:opacity-80 transition-opacity">
                  Collections
                </a>
                <a href="#catalog-section" className="hover:opacity-80 transition-opacity">
                  About
                </a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCart}
                  className={`flex items-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} transition-all shadow-xs`}
                  style={getButtonVariantStyle()}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartTotalCount > 0 && (
                    <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {cartTotalCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 md:hidden"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : headerLayout === 'split' ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={hero.logoUrl} alt="Logo" className="h-9 w-9 rounded-xl object-cover border" />
                <div>
                  <h1 className="text-sm font-bold leading-tight truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    {hero.storeTitle}
                  </h1>
                </div>
              </div>
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border py-1.5 pl-8 pr-3 text-xs focus:outline-none"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCart}
                  className={`flex items-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} shadow-xs`}
                  style={getButtonVariantStyle()}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Cart ({cartTotalCount})</span>
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 md:hidden"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Default logo_left */
            <>
              <div className="flex items-center gap-3">
                <img
                  src={hero.logoUrl}
                  alt={hero.storeTitle}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border shadow-2xs"
                  style={{ borderColor: colors.border }}
                />
                <div>
                  <h1 className="text-sm sm:text-base font-extrabold leading-tight truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    {hero.storeTitle}
                  </h1>
                  <span className="text-[10px] font-semibold opacity-70 hidden sm:block" style={{ color: colors.text }}>
                    {hero.tagline || 'Curated Storefront'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <LanguageSwitcher />
                </div>
                <SocialLinksDisplay storefrontId={storefront.id} targetPlacement="header" customization={customization} className="hidden lg:flex" />
                <button
                  onClick={onOpenCart}
                  className={`flex items-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} transition-all shadow-md`}
                  style={getButtonVariantStyle()}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('storefront.cart', 'Cart')}</span>
                  {cartTotalCount > 0 && (
                    <span className="rounded-full bg-white/30 px-2 py-0.5 text-[11px] font-extrabold text-white">
                      {cartTotalCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 md:hidden"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className="relative z-10 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto p-5 shadow-2xl space-y-6"
            style={{ backgroundColor: colors.surface, color: colors.text }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2.5">
                <img src={hero.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover border" />
                <span className="text-sm font-extrabold truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  {hero.storeTitle}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Search in Mobile Menu */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border py-2 pl-9 pr-3 text-xs focus:outline-none"
                style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
              />
            </div>

            {/* Collections Navigation Links */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Categories & Collections</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setSelectedCollection('all');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors text-left ${
                    selectedCollection === 'all' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-neutral-100'
                  }`}
                >
                  <span>All Products</span>
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                    {storefrontProducts.length}
                  </span>
                </button>
                {collections.map((col) => {
                  const count = storefrontProducts.filter((sp) => sp.collectionIds.includes(col.id)).length;
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        setSelectedCollection(col.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors text-left ${
                        selectedCollection === col.id ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <span>{col.title}</span>
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Cart Action */}
            <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCart && onOpenCart();
                }}
                className={`flex w-full items-center justify-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} shadow-md py-3`}
                style={getButtonVariantStyle()}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>View Bag ({cartTotalCount})</span>
              </button>
            </div>

            {/* Language Selector in Mobile Drawer */}
            <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                {t('nav.selectLanguage', 'Select Language')}
              </p>
              <LanguageSwitcher variant="inline" />
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">Connect With Store</p>
              <SocialLinksDisplay storefrontId={storefront.id} targetPlacement="footer" customization={customization} />
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Header */}
      <header className={`relative overflow-hidden ${getHeroHeightClass()}`}>
        <div className="absolute inset-0 z-0">
          <img src={hero.bannerUrl} alt={hero.storeTitle} className="h-full w-full object-cover brightness-[0.38]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        <div className={`relative z-10 ${getContainerWidthClass()} flex flex-col ${getHeroVerticalClass()} h-full text-white py-10 sm:py-16`}>
          <div className={`w-full max-w-3xl space-y-4 ${getHeroAlignClass()}`}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md border border-white/15">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Verified Brand Fulfillment & Direct Warranty</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md break-words leading-tight" style={fontHeadingStyle}>
              {hero.tagline || hero.storeTitle}
            </h2>
            <p className="text-xs sm:text-base font-medium text-neutral-200 leading-relaxed drop-shadow-sm max-w-2xl">
              {hero.description}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`inline-flex items-center justify-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg min-h-[44px]`}
              >
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <SocialLinksDisplay storefrontId={storefront.id} targetPlacement="about" customization={customization} className="inline-flex justify-center" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Storefront Body */}
      <main id="catalog-section" className={`${getContainerWidthClass()} pt-8 pb-24 sm:py-12 space-y-8 sm:space-y-12 max-w-full overflow-hidden`}>
        {/* Collections & Filter Search Header */}
        {sections.collections && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 max-w-full min-w-0 overflow-hidden" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto shrink-0 max-w-full min-w-0">
              <button
                onClick={() => setSelectedCollection('all')}
                className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all border whitespace-nowrap"
                style={{
                  backgroundColor: selectedCollection === 'all' ? colors.primary : colors.surface,
                  color: selectedCollection === 'all' ? '#ffffff' : colors.text,
                  borderColor: colors.border,
                }}
              >
                All Products ({storefrontProducts.length})
              </button>

              {collections.map((col) => {
                const count = storefrontProducts.filter((sp) => sp.collectionIds.includes(col.id)).length;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all border whitespace-nowrap"
                    style={{
                      backgroundColor: selectedCollection === col.id ? colors.primary : colors.surface,
                      color: selectedCollection === col.id ? '#ffffff' : colors.text,
                      borderColor: colors.border,
                    }}
                  >
                    {col.title} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-72 min-w-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-50" style={{ color: colors.text }} />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none min-h-[42px]"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
              />
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        {sections.featuredProducts && storefrontProducts.length > 0 && selectedCollection === 'all' && !searchQuery && (
          <div className="space-y-4 max-w-full min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  Featured Arrivals
                </h3>
                <p className="text-xs opacity-70" style={{ color: colors.text }}>
                  Handpicked brand products trending this month.
                </p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-full min-w-0">
              {storefrontProducts.slice(0, 2).map((sp) => {
                const p = sp.product;
                if (!p) return null;
                const coverImage = sp.customCoverImage || p.images[0];
                const inCart = cart.find((i) => i.product.id === p.id);

                return (
                  <div
                    key={`feat_${sp.id}`}
                    className={`group flex flex-col sm:flex-row overflow-hidden border w-full max-w-full min-w-0 ${getShadowClass()} ${getHoverAnimClass()}`}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: `${cards.borderRadius}px`,
                    }}
                  >
                    <div
                      onClick={() => setActiveProductModal(sp)}
                      className="w-full sm:w-1/2 relative aspect-4/3 sm:aspect-auto overflow-hidden bg-neutral-100 cursor-pointer shrink-0"
                    >
                      <img src={coverImage} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {p.brand}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProductModal(sp);
                        }}
                        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="w-full sm:w-1/2 p-4 sm:p-5 flex flex-col justify-between space-y-3 min-w-0">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Popular Choice</span>
                        <h4
                          onClick={() => setActiveProductModal(sp)}
                          className="text-base font-bold mt-1 cursor-pointer hover:underline truncate"
                          style={{ color: colors.heading, ...fontHeadingStyle }}
                        >
                          {p.title}
                        </h4>
                        <p
                          onClick={() => setActiveProductModal(sp)}
                          className="text-xs opacity-70 line-clamp-2 mt-1 cursor-pointer"
                        >
                          {p.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 gap-2 flex-wrap sm:flex-nowrap min-w-0">
                        <span className="text-base sm:text-lg font-extrabold truncate" style={{ color: colors.heading }}>
                          {formatCurrency(p.price)}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setActiveProductModal(sp)}
                            className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onAddToCart && onAddToCart(p, coverImage, sp.id)}
                            className={`flex items-center gap-1.5 ${getButtonShapeClass()} ${getButtonSizeClass()}`}
                            style={getButtonVariantStyle()}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>{inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Product Catalog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black" style={{ color: colors.heading, ...fontHeadingStyle }}>
              {selectedCollection === 'all' ? 'All Catalog Items' : 'Collection Products'}
            </h3>
            <span className="text-xs font-semibold opacity-60">Showing {filteredProducts.length} items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className="p-16 text-center text-xs opacity-70 rounded-2xl border border-dashed"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              No products match your selected filter query.
            </div>
          ) : (
            <div className={`grid gap-6 ${getGridColumnsClass()}`}>
              {filteredProducts.map((sp) => {
                const p = sp.product;
                if (!p) return null;

                const coverImage = sp.customCoverImage || p.images[0];
                const inCart = cart.find((i) => i.product.id === p.id);

                return (
                  <div
                    key={sp.id}
                    className={`group flex flex-col justify-between overflow-hidden border ${getShadowClass()} ${getHoverAnimClass()}`}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: `${cards.borderRadius}px`,
                    }}
                  >
                    <div>
                      {/* Product Image */}
                      <div
                        onClick={() => setActiveProductModal(sp)}
                        className={`relative w-full overflow-hidden bg-neutral-100 cursor-pointer ${getImageRatioClass()}`}
                      >
                        <img
                          src={coverImage}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-neutral-900 shadow-xs border">
                            {p.brand}
                          </span>
                        </div>

                        <button
                          onClick={() => setActiveProductModal(sp)}
                          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white"
                          title="Quick View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-2">
                        <h4
                          onClick={() => setActiveProductModal(sp)}
                          className="cursor-pointer text-xs font-bold line-clamp-1 hover:underline"
                          style={{ color: colors.heading, ...fontHeadingStyle }}
                        >
                          {p.title}
                        </h4>
                        <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">{p.description}</p>

                        <div className="flex items-baseline justify-between pt-2">
                          <span className="text-base font-extrabold" style={{ color: colors.heading }}>
                            {formatCurrency(p.price)}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">In Stock</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onAddToCart && onAddToCart(p, coverImage, sp.id)}
                        className={`flex w-full items-center justify-center gap-2 ${getButtonShapeClass()} ${getButtonSizeClass()} transition-all shadow-xs`}
                        style={getButtonVariantStyle()}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        {sections.testimonials && (
          <div
            className="rounded-2xl border p-4 sm:p-8 space-y-6 max-w-full min-w-0 overflow-hidden"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Customer Satisfaction</span>
              <h3 className="text-xl font-black" style={{ color: colors.heading, ...fontHeadingStyle }}>
                Verified Buyer Feedback
              </h3>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              {[
                { quote: 'Fast fulfillment direct from brand supplier. Packaging was pristine!', author: 'Sarah K.', role: 'Verified Buyer' },
                { quote: 'Top tier product quality. Authentic guarantee gave me complete confidence.', author: 'David L.', role: 'Verified Customer' },
                { quote: 'Responsive support and seamless checkout experience!', author: 'Elena M.', role: 'Verified Buyer' },
              ].map((t, i) => (
                <div key={i} className="rounded-xl p-4 border space-y-3 min-w-0" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs italic opacity-80 leading-relaxed">"{t.quote}"</p>
                  <div>
                    <p className="text-xs font-bold" style={{ color: colors.heading }}>
                      {t.author}
                    </p>
                    <span className="text-[10px] opacity-60">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {sections.faq && (
          <div className="rounded-2xl border p-4 sm:p-8 space-y-6 max-w-full min-w-0 overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Help & Answers</span>
              <h3 className="text-xl font-black" style={{ color: colors.heading, ...fontHeadingStyle }}>
                Frequently Asked Questions
              </h3>
            </div>

            <div className="max-w-3xl mx-auto space-y-3 min-w-0">
              {[
                {
                  q: 'How is order fulfillment handled?',
                  a: 'Orders placed on this storefront are transmitted directly to verified brand manufacturers who pick, pack, and ship directly to your shipping address.',
                },
                {
                  q: 'Are products backed by authentic manufacturer warranty?',
                  a: 'Yes! All items listed on our storefront originate directly from official brand supplier catalogs with full warranty support.',
                },
                {
                  q: 'What is the standard shipping timeframe?',
                  a: 'Orders typically ship within 1-3 business days with tracking updates sent directly to your email.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                  className="cursor-pointer rounded-xl border p-3.5 sm:p-4 space-y-2 transition-colors min-w-0"
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold" style={{ color: colors.heading }}>
                    <span className="min-w-0 flex-1">{item.q}</span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${faqOpenIndex === idx ? 'rotate-90' : ''}`} />
                  </div>
                  {faqOpenIndex === idx && <p className="text-xs opacity-75 pt-2 leading-relaxed border-t">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        {sections.newsletter && (
          <div
            className="rounded-3xl p-5 sm:p-12 text-center text-white space-y-4 relative overflow-hidden max-w-full min-w-0"
            style={{ backgroundColor: colors.button }}
          >
            <div className="max-w-xl mx-auto space-y-3 min-w-0">
              <Mail className="h-8 w-8 mx-auto opacity-80" />
              <h3 className="text-xl sm:text-2xl font-black" style={fontHeadingStyle}>
                Subscribe to Brand Drop Alerts
              </h3>
              <p className="text-xs opacity-80">Be the first to know about new collection launches, exclusive discounts, and restocks.</p>

              {newsletterSuccess ? (
                <div className="rounded-xl bg-white/20 p-3 text-xs font-bold text-white">
                  Thanks for subscribing! Check your inbox for launch perks.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) {
                      setNewsletterSuccess(true);
                      setNewsletterEmail('');
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2 w-full min-w-0"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full sm:flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 min-w-0"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-neutral-900 hover:bg-neutral-100 shadow-md shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Footer */}
      {footer.show && (
        <footer className="border-t py-8 sm:py-12 max-w-full overflow-hidden" style={{ backgroundColor: footer.bgColor, color: footer.textColor, borderColor: colors.border }}>
          <div className={`${getContainerWidthClass()} flex flex-col md:flex-row items-center justify-between gap-6 text-center sm:text-left min-w-0`}>
            <div className="flex flex-col sm:flex-row items-center gap-3 min-w-0">
              <img src={hero.logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover border shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate" style={fontHeadingStyle}>
                  {hero.storeTitle}
                </span>
                <p className="text-[11px] opacity-70 truncate">{footer.copyrightText}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 max-w-full">
              <SocialLinksDisplay storefrontId={storefront.id} targetPlacement="footer" customization={customization} />
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs opacity-80 min-w-0">
                <a href="#catalog-section" className="hover:underline">
                  Catalog
                </a>
                <a href="#catalog-section" className="hover:underline">
                  Shipping Info
                </a>
                <a href="#catalog-section" className="hover:underline">
                  Terms & Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Native Mobile Bottom Navigation Bar styled strictly with Storefront Customization Theme */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 items-center justify-around py-2 px-2.5 backdrop-blur-md transition-all duration-200 ${
          isMobilePreview ? 'flex' : 'flex md:hidden'
        } ${getShadowClass()}`}
        style={{
          backgroundColor: `${navBgColor}f2`, // 95% opacity for crisp backdrop blur
          borderTop: `1px solid ${navBorderColor}`,
          fontFamily: navFontFamily,
        }}
      >
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all group min-h-[46px] select-none"
          style={{
            borderRadius: navShapeRadius,
            backgroundColor: activeMobileTab === 'home' ? `${navPrimaryColor}18` : 'transparent',
            color: activeMobileTab === 'home' ? navPrimaryColor : navTextColor,
          }}
        >
          <div className="relative flex items-center justify-center">
            <Home
              className="h-5 w-5 transition-transform duration-200 group-active:scale-90 shrink-0"
              style={{
                color: activeMobileTab === 'home' ? navPrimaryColor : 'currentColor',
                opacity: activeMobileTab === 'home' ? 1 : 0.7,
              }}
            />
            {activeMobileTab === 'home' && (
              <span
                className="absolute -bottom-1 h-1 w-1 rounded-full animate-pulse"
                style={{ backgroundColor: navPrimaryColor }}
              />
            )}
          </div>
          <span
            className="text-[10px] leading-none transition-all"
            style={{
              fontWeight: activeMobileTab === 'home' ? 800 : 600,
              opacity: activeMobileTab === 'home' ? 1 : 0.75,
            }}
          >
            Home
          </span>
        </button>

        {/* Catalog Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('catalog');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all group min-h-[46px] select-none"
          style={{
            borderRadius: navShapeRadius,
            backgroundColor: activeMobileTab === 'catalog' ? `${navPrimaryColor}18` : 'transparent',
            color: activeMobileTab === 'catalog' ? navPrimaryColor : navTextColor,
          }}
        >
          <div className="relative flex items-center justify-center">
            <Layers
              className="h-5 w-5 transition-transform duration-200 group-active:scale-90 shrink-0"
              style={{
                color: activeMobileTab === 'catalog' ? navPrimaryColor : 'currentColor',
                opacity: activeMobileTab === 'catalog' ? 1 : 0.7,
              }}
            />
            {activeMobileTab === 'catalog' && (
              <span
                className="absolute -bottom-1 h-1 w-1 rounded-full animate-pulse"
                style={{ backgroundColor: navPrimaryColor }}
              />
            )}
          </div>
          <span
            className="text-[10px] leading-none transition-all"
            style={{
              fontWeight: activeMobileTab === 'catalog' ? 800 : 600,
              opacity: activeMobileTab === 'catalog' ? 1 : 0.75,
            }}
          >
            Catalog
          </span>
        </button>

        {/* Search Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('search');
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              setIsMobileMenuOpen(true);
            }
          }}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all group min-h-[46px] select-none"
          style={{
            borderRadius: navShapeRadius,
            backgroundColor: activeMobileTab === 'search' ? `${navPrimaryColor}18` : 'transparent',
            color: activeMobileTab === 'search' ? navPrimaryColor : navTextColor,
          }}
        >
          <div className="relative flex items-center justify-center">
            <Search
              className="h-5 w-5 transition-transform duration-200 group-active:scale-90 shrink-0"
              style={{
                color: activeMobileTab === 'search' ? navPrimaryColor : 'currentColor',
                opacity: activeMobileTab === 'search' ? 1 : 0.7,
              }}
            />
            {activeMobileTab === 'search' && (
              <span
                className="absolute -bottom-1 h-1 w-1 rounded-full animate-pulse"
                style={{ backgroundColor: navPrimaryColor }}
              />
            )}
          </div>
          <span
            className="text-[10px] leading-none transition-all"
            style={{
              fontWeight: activeMobileTab === 'search' ? 800 : 600,
              opacity: activeMobileTab === 'search' ? 1 : 0.75,
            }}
          >
            Search
          </span>
        </button>

        {/* Bag / Cart Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('cart');
            if (onOpenCart) onOpenCart();
          }}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all group min-h-[46px] select-none relative"
          style={{
            borderRadius: navShapeRadius,
            backgroundColor: activeMobileTab === 'cart' ? `${navPrimaryColor}18` : 'transparent',
            color: activeMobileTab === 'cart' ? navPrimaryColor : navTextColor,
          }}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag
              className="h-5 w-5 transition-transform duration-200 group-active:scale-90 shrink-0"
              style={{
                color: activeMobileTab === 'cart' ? navPrimaryColor : 'currentColor',
                opacity: activeMobileTab === 'cart' ? 1 : 0.7,
              }}
            />
            {cartTotalCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold shadow-2xs shrink-0"
                style={{
                  backgroundColor: navPrimaryColor,
                  color: '#ffffff',
                }}
              >
                {cartTotalCount}
              </span>
            )}
            {activeMobileTab === 'cart' && (
              <span
                className="absolute -bottom-1 h-1 w-1 rounded-full animate-pulse"
                style={{ backgroundColor: navPrimaryColor }}
              />
            )}
          </div>
          <span
            className="text-[10px] leading-none transition-all"
            style={{
              fontWeight: activeMobileTab === 'cart' ? 800 : 600,
              opacity: activeMobileTab === 'cart' ? 1 : 0.75,
            }}
          >
            Bag
          </span>
        </button>
      </div>

      {/* Customer Product Detail Modal */}
      {activeProductModal && activeProductModal.product && (
        <CustomerProductDetailsModal
          isOpen={!!activeProductModal}
          onClose={() => setActiveProductModal(null)}
          storefrontProduct={activeProductModal}
          allStorefrontProducts={storefrontProducts}
          onSelectRelatedProduct={(sp) => setActiveProductModal(sp)}
          onAddToCart={onAddToCart}
          customization={customization}
          inCartQuantity={
            cart.find((item) => item.product.id === activeProductModal.product.id)?.quantity || 0
          }
        />
      )}
    </div>
  );
}
