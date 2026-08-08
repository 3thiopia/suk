import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Type,
  Square,
  Sparkles,
  RotateCcw,
  Save,
  Eye,
  Check,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  MousePointer,
  Grid,
  CreditCard,
  Navigation,
  Globe,
  Settings,
  Zap,
  ZoomIn,
  ZoomOut,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  HelpCircle,
  Link,
  SlidersVertical,
  Compass,
  ArrowUpDown,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { SocialLinksManager } from './SocialLinksManager';
import { storage } from '../../lib/storage';
import { getStorefrontFullDomain, getStorefrontUrl } from '../../lib/subdomain';
import { ShareStoreModal } from '../storefront/ShareStoreModal';
import {
  StorefrontCustomization,
  HeaderLayout,
  TextAlignment,
  VerticalAlignment,
  BannerHeight,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
  CardLayout,
  ImageRatio,
  ShadowIntensity,
  HoverAnimation,
  StoreLayoutMode,
  NavType,
  ColorMode,
  AnimationType,
  StorefrontTheme,
} from '../../types';
import { PublicStorefront } from '../storefront/PublicStorefront';
import { SingleImageUploader } from '../common/SingleImageUploader';
import {
  getDefaultCustomization,
  THEME_PRESETS,
  FONT_OPTIONS,
} from '../../lib/customizationDefaults';

interface StorefrontCustomizerProps {
  onNavigate: (path: string) => void;
}

interface AccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

function AccordionSection({
  title,
  subtitle,
  icon: Icon,
  isOpen,
  onToggle,
  badge,
  children,
}: AccordionSectionProps) {
  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs transition-all duration-200 hover:border-neutral-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-neutral-50/80 transition-colors select-none group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isOpen ? 'bg-neutral-900 text-white shadow-2xs' : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200'
          }`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-neutral-900 tracking-tight truncate">
                {title}
              </span>
              {badge && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 transition-transform duration-200 shrink-0 ${
          isOpen ? 'rotate-180 text-neutral-900' : 'group-hover:text-neutral-700'
        }`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-neutral-100 p-4 bg-neutral-50/40 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  key?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white p-3 hover:border-neutral-300 hover:bg-neutral-50/80 transition-all select-none"
    >
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-neutral-900 leading-snug break-words">
          {label}
        </span>
        {description && (
          <span className="block text-[11px] text-neutral-500 mt-0.5 leading-snug break-words">
            {description}
          </span>
        )}
      </div>
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? 'bg-emerald-600' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
}

export function StorefrontCustomizer({ onNavigate }: StorefrontCustomizerProps) {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const initialCustomization =
    storefront?.customization || getDefaultCustomization(storefront);

  const [savedCustomization, setSavedCustomization] = useState<StorefrontCustomization>(
    () => JSON.parse(JSON.stringify(initialCustomization))
  );
  const [customization, setCustomization] = useState<StorefrontCustomization>(
    () => JSON.parse(JSON.stringify(initialCustomization))
  );

  const isDirty = React.useMemo(() => {
    return JSON.stringify(customization) !== JSON.stringify(savedCustomization);
  }, [customization, savedCustomization]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    branding: true,
    colors: true,
  });

  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mobileActivePane, setMobileActivePane] = useState<'controls' | 'preview'>('controls');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFitMode, setIsFitMode] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'published' | 'restored'>('idle');
  const [showResetDropdown, setShowResetDropdown] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!storefront) return null;

  const fullDomain = getStorefrontFullDomain(storefront.slug);
  const fullUrl = getStorefrontUrl(storefront.slug);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllSections = () => {
    setOpenSections({
      branding: true,
      colors: true,
      typography: true,
      header: true,
      hero: true,
      nav: true,
      cards: true,
      buttons: true,
      footer: true,
      social: true,
      layout: true,
      sections: true,
      advanced: true,
    });
  };

  const collapseAllSections = () => {
    setOpenSections({});
  };

  const handleZoomIn = () => {
    setIsFitMode(false);
    setZoomScale((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setIsFitMode(false);
    setZoomScale((prev) => Math.max(0.4, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    setIsFitMode(false);
    setZoomScale(1.0);
  };

  const handleFitToScreen = () => {
    setIsFitMode(true);
  };

  const handleUpdate = <K extends keyof StorefrontCustomization>(
    section: K,
    value: StorefrontCustomization[K]
  ) => {
    setCustomization((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleApplyPreset = (presetConfig: Partial<StorefrontCustomization>) => {
    setCustomization((prev) => ({
      ...prev,
      ...presetConfig,
      colors: { ...prev.colors, ...(presetConfig.colors || {}) },
      typography: { ...prev.typography, ...(presetConfig.typography || {}) },
      buttons: { ...prev.buttons, ...(presetConfig.buttons || {}) },
      cards: { ...prev.cards, ...(presetConfig.cards || {}) },
      storeLayout: { ...prev.storeLayout, ...(presetConfig.storeLayout || {}) },
    }));
  };

  const handleResetColors = () => {
    const defaults = getDefaultCustomization(storefront);
    setCustomization((prev) => ({ ...prev, colors: defaults.colors }));
  };

  const handleResetTypography = () => {
    const defaults = getDefaultCustomization(storefront);
    setCustomization((prev) => ({ ...prev, typography: defaults.typography }));
  };

  const handleResetEntireTheme = () => {
    if (confirm('Reset all storefront customizations back to default studio settings?')) {
      setCustomization(getDefaultCustomization(storefront));
    }
  };

  const handleRestorePreviousStyle = () => {
    setCustomization(JSON.parse(JSON.stringify(savedCustomization)));
    setSaveStatus('restored');
    setTimeout(() => setSaveStatus('idle'), 3500);
  };

  const handleSaveDraft = () => {
    storage.updateStorefront(storefront.id, {
      customization: customization,
      storeName: customization.hero.storeTitle || storefront.storeName,
      bannerTitle: customization.hero.tagline || storefront.bannerTitle,
      bannerSubtitle: customization.hero.description || storefront.bannerSubtitle,
      bannerUrl: customization.hero.bannerUrl || storefront.bannerUrl,
      logoUrl: customization.hero.logoUrl || storefront.logoUrl,
    });
    setSavedCustomization(JSON.parse(JSON.stringify(customization)));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3500);
  };

  const handlePublish = () => {
    storage.updateStorefront(storefront.id, {
      customization: customization,
      storeName: customization.hero.storeTitle || storefront.storeName,
      bannerTitle: customization.hero.tagline || storefront.bannerTitle,
      bannerSubtitle: customization.hero.description || storefront.bannerSubtitle,
      bannerUrl: customization.hero.bannerUrl || storefront.bannerUrl,
      logoUrl: customization.hero.logoUrl || storefront.logoUrl,
    });
    setSavedCustomization(JSON.parse(JSON.stringify(customization)));
    setSaveStatus('published');
    setTimeout(() => setSaveStatus('idle'), 3500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden space-y-3">
      {/* Top Application Header Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-3 bg-white px-4 pt-2.5 rounded-2xl shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <h1 className="text-base font-black text-neutral-900 truncate">
              Storefront Customization Studio
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Professional Web Builder Engine • Instant Real-Time Preview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subdomain Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>{fullDomain}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs min-h-[38px]"
            title="Copy Storefront Subdomain URL"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs min-h-[38px]"
            title="Share Storefront URL"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share Store</span>
          </button>

          {/* Mobile Screen Pane Switcher */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 lg:hidden">
            <button
              onClick={() => setMobileActivePane('controls')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mobileActivePane === 'controls' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600'
              }`}
            >
              Customizer Panel
            </button>
            <button
              onClick={() => setMobileActivePane('preview')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mobileActivePane === 'preview' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600'
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            onClick={() => window.open(`/store/${storefront.slug}`, '_blank')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-2xs min-h-[38px]"
            title="Open Live Public Storefront"
          >
            <ExternalLink className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Open Live Store</span>
          </button>
        </div>
      </div>

      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storefront={storefront}
      />

      {/* Main Studio Workspace Split Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-3">
        {/* LEFT CUSTOMIZATION EDITOR SIDEBAR (Accordion Style) */}
        <div className={`w-full lg:w-[380px] xl:w-[410px] 2xl:w-[430px] shrink-0 flex flex-col rounded-2xl border border-neutral-200/90 bg-white shadow-sm overflow-hidden ${
          mobileActivePane === 'controls' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Sidebar Top Controls Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/80 px-4 py-3 shrink-0">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-neutral-800 block">
                Storefront Settings
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {Object.values(openSections).filter(Boolean).length} of 13 sections open
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={expandAllSections}
                className="text-[11px] font-extrabold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-2 py-1 rounded-lg transition-colors shadow-2xs"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllSections}
                className="text-[11px] font-extrabold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-2 py-1 rounded-lg transition-colors shadow-2xs"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* ACCORDION SCROLLABLE CONTAINER */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin scrollbar-thumb-neutral-200">
            {/* Status Feedback Banner */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-2xs animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {saveStatus === 'published'
                    ? 'Storefront configuration published live successfully!'
                    : 'Draft changes saved.'}
                </span>
              </div>
            )}

            {/* 1. BRANDING & PRESETS SECTION */}
            <AccordionSection
              id="branding"
              title="Branding & Presets"
              subtitle="Theme presets, logo, titles & hero banner images"
              icon={Sparkles}
              badge="Featured"
              isOpen={!!openSections.branding}
              onToggle={() => toggleSection('branding')}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-neutral-900">
                      1-Click Professional Theme Presets
                    </label>
                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                      {THEME_PRESETS.length} Presets Available
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
                    Select a pre-engineered design preset to instantly update your color palette, typography, button styles, and card layouts.
                  </p>
                  
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {THEME_PRESETS.map((p) => {
                      const isSelected =
                        customization.colors.primary?.toLowerCase() === p.config.colors?.primary?.toLowerCase() &&
                        customization.colors.background?.toLowerCase() === p.config.colors?.background?.toLowerCase();

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleApplyPreset(p.config)}
                          className={`cursor-pointer group flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 select-none ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-sm'
                              : 'border-neutral-200/90 bg-white hover:border-neutral-400 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-neutral-900 group-hover:text-emerald-700 transition-colors truncate">
                                    {p.name}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500 font-medium leading-snug line-clamp-2 mt-0.5">
                                  {p.description}
                                </p>
                              </div>
                            </div>

                            {/* Color Swatches Grid (Wrapped Flex Container) */}
                            <div className="space-y-1.5 pt-1 border-t border-neutral-100">
                              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                                Color Swatches
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {p.colors.map((c, i) => (
                                  <div
                                    key={i}
                                    className="relative flex h-6 w-6 items-center justify-center rounded-full border border-black/15 shadow-2xs transition-transform duration-150 hover:scale-110 shrink-0"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                  >
                                    <span className="sr-only">{c}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Key Color Roles Breakdown */}
                            {p.config.colors && (
                              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-neutral-700">
                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50/80 px-2 py-1 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: p.config.colors.primary }}
                                  />
                                  <span className="font-semibold truncate">Primary</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50/80 px-2 py-1 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: p.config.colors.background }}
                                  />
                                  <span className="font-semibold truncate">Canvas</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50/80 px-2 py-1 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: p.config.colors.surface }}
                                  />
                                  <span className="font-semibold truncate">Surface</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50/80 px-2 py-1 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: p.config.colors.heading }}
                                  />
                                  <span className="font-semibold truncate">Text</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Button */}
                          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-neutral-400 truncate">
                              {p.config.typography?.headingFont || 'Standard'} Font
                            </span>
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black transition-all shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-neutral-900 text-white hover:bg-neutral-800 group-hover:bg-emerald-600'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-white" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <span>Apply Theme</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={customization.hero.storeTitle}
                      onChange={(e) =>
                        handleUpdate('hero', { ...customization.hero, storeTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Tagline / Headline</label>
                    <input
                      type="text"
                      value={customization.hero.tagline}
                      onChange={(e) =>
                        handleUpdate('hero', { ...customization.hero, tagline: e.target.value })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={customization.hero.description}
                      onChange={(e) =>
                        handleUpdate('hero', { ...customization.hero, description: e.target.value })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none"
                    />
                  </div>

                  {/* Direct File Uploads for Storefront Branding */}
                  <SingleImageUploader
                    value={customization.hero.logoUrl}
                    onChange={(url) =>
                      handleUpdate('hero', { ...customization.hero, logoUrl: url })
                    }
                    label="Storefront Logo Badge"
                    description="Upload your store logo from your device or camera."
                    aspectRatio="square"
                  />

                  <SingleImageUploader
                    value={customization.hero.bannerUrl}
                    onChange={(url) =>
                      handleUpdate('hero', { ...customization.hero, bannerUrl: url })
                    }
                    label="Hero Banner Artwork"
                    description="Upload high-res hero background image (16:9 widescreen recommended)."
                    aspectRatio="banner"
                  />
                </div>
              </div>
            </AccordionSection>

            {/* 2. COLORS & PALETTE SECTION */}
            <AccordionSection
              id="colors"
              title="Colors & Palette"
              subtitle="Brand primary, surface, text & card hex colors"
              icon={Palette}
              isOpen={!!openSections.colors}
              onToggle={() => toggleSection('colors')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-neutral-900">Color Palette Controls</span>
                  <button
                    onClick={handleResetColors}
                    className="text-[10px] font-bold text-neutral-600 hover:text-neutral-900 underline"
                  >
                    Reset Colors
                  </button>
                </div>

                <div className="grid gap-2">
                  {[
                    { key: 'primary', label: 'Primary Accent' },
                    { key: 'background', label: 'Background Canvas' },
                    { key: 'surface', label: 'Header & Surface' },
                    { key: 'card', label: 'Product Card' },
                    { key: 'heading', label: 'Headings' },
                    { key: 'text', label: 'Body Text' },
                    { key: 'button', label: 'Primary Button' },
                    { key: 'border', label: 'Card Borders' },
                  ].map((c) => {
                    const val = (customization.colors[c.key as keyof typeof customization.colors] as string) || '#000000';
                    return (
                      <div
                        key={c.key}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
                      >
                        <span className="text-xs font-bold text-neutral-800 truncate">{c.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={val.startsWith('#') ? val : '#000000'}
                            onChange={(e) =>
                              handleUpdate('colors', {
                                ...customization.colors,
                                [c.key]: e.target.value,
                              })
                            }
                            className="h-7 w-7 cursor-pointer rounded-lg border border-neutral-300 p-0 shadow-2xs"
                          />
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              handleUpdate('colors', {
                                ...customization.colors,
                                [c.key]: e.target.value,
                              })
                            }
                            className="w-20 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-center font-mono text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionSection>

            {/* 3. TYPOGRAPHY SECTION */}
            <AccordionSection
              id="typography"
              title="Typography & Google Fonts"
              subtitle="Heading font, body font, size & weights"
              icon={Type}
              isOpen={!!openSections.typography}
              onToggle={() => toggleSection('typography')}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-800">Heading Font</label>
                    <button
                      onClick={handleResetTypography}
                      className="text-[10px] font-bold text-neutral-600 hover:text-neutral-900 underline"
                    >
                      Reset Fonts
                    </button>
                  </div>
                  <select
                    value={customization.typography.headingFont}
                    onChange={(e) =>
                      handleUpdate('typography', {
                        ...customization.typography,
                        headingFont: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Body Font</label>
                  <select
                    value={customization.typography.bodyFont}
                    onChange={(e) =>
                      handleUpdate('typography', {
                        ...customization.typography,
                        bodyFont: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Font Size</label>
                    <select
                      value={customization.typography.fontSize}
                      onChange={(e) =>
                        handleUpdate('typography', {
                          ...customization.typography,
                          fontSize: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-xs font-semibold text-neutral-900 focus:outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Font Weight</label>
                    <select
                      value={customization.typography.fontWeight}
                      onChange={(e) =>
                        handleUpdate('typography', {
                          ...customization.typography,
                          fontWeight: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2 text-xs font-semibold text-neutral-900 focus:outline-none"
                    >
                      <option value="normal">Normal (400)</option>
                      <option value="medium">Medium (500)</option>
                      <option value="semibold">Semibold (600)</option>
                      <option value="bold">Bold (700)</option>
                    </select>
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 4. HEADER LAYOUT (VISUAL SCHEMATIC CARDS) */}
            <AccordionSection
              id="header"
              title="Header Layout"
              subtitle="Navigation structure & layout style cards"
              icon={Layout}
              isOpen={!!openSections.header}
              onToggle={() => toggleSection('header')}
            >
              <div className="space-y-3">
                <p className="text-[11px] text-neutral-500 font-medium">
                  Select a visual layout structure for your storefront navigation header:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      id: 'logo_left',
                      title: 'Logo Left, Nav Right',
                      desc: 'Classic e-commerce header layout',
                      renderPreview: () => (
                        <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 p-2 rounded-t-md">
                          <div className="h-2 w-8 rounded bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="h-1.5 w-4 rounded bg-neutral-400" />
                            <div className="h-1.5 w-4 rounded bg-neutral-400" />
                            <div className="h-1.5 w-4 rounded bg-emerald-500" />
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: 'logo_center',
                      title: 'Logo Centered, Nav Below',
                      desc: 'Luxury brand centered layout',
                      renderPreview: () => (
                        <div className="flex flex-col items-center border-b border-neutral-300 bg-neutral-100 p-1.5 rounded-t-md gap-1">
                          <div className="h-2 w-10 rounded bg-neutral-800" />
                          <div className="flex gap-1">
                            <div className="h-1.5 w-3 rounded bg-neutral-400" />
                            <div className="h-1.5 w-3 rounded bg-neutral-400" />
                            <div className="h-1.5 w-3 rounded bg-neutral-400" />
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: 'logo_above_title',
                      title: 'Logo Above Title',
                      desc: 'Stacked identity above store title',
                      renderPreview: () => (
                        <div className="flex flex-col items-center border-b border-neutral-300 bg-neutral-100 p-1.5 rounded-t-md gap-0.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                          <div className="h-1.5 w-10 rounded bg-neutral-800" />
                        </div>
                      ),
                    },
                    {
                      id: 'split',
                      title: 'Split Navigation Header',
                      desc: 'Balanced left links & right cart',
                      renderPreview: () => (
                        <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 p-2 rounded-t-md">
                          <div className="h-1.5 w-5 rounded bg-neutral-400" />
                          <div className="h-2 w-6 rounded bg-neutral-800" />
                          <div className="h-1.5 w-5 rounded bg-emerald-500" />
                        </div>
                      ),
                    },
                    {
                      id: 'minimal_centered',
                      title: 'Minimal Centered',
                      desc: 'Ultra-clean single-line header',
                      renderPreview: () => (
                        <div className="flex items-center justify-center border-b border-neutral-300 bg-neutral-100 p-2 rounded-t-md">
                          <div className="h-1.5 w-16 rounded bg-neutral-700" />
                        </div>
                      ),
                    },
                    {
                      id: 'sticky_modern',
                      title: 'Modern Floating Pill',
                      desc: 'Glassmorphic floating navbar',
                      renderPreview: () => (
                        <div className="p-1 bg-neutral-200 rounded-t-md flex justify-center">
                          <div className="flex items-center justify-between w-full border border-neutral-300 bg-white p-1 rounded-full px-2">
                            <div className="h-1.5 w-4 rounded bg-neutral-800" />
                            <div className="h-1.5 w-4 rounded bg-emerald-500" />
                          </div>
                        </div>
                      ),
                    },
                  ].map((h) => {
                    const isSelected = customization.headerLayout === h.id;
                    return (
                      <div
                        key={h.id}
                        onClick={() => handleUpdate('headerLayout', h.id as HeaderLayout)}
                        className={`cursor-pointer rounded-xl border overflow-hidden transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        {h.renderPreview()}
                        <div className="p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900 truncate">{h.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{h.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionSection>

            {/* 5. HERO BANNER SECTION */}
            <AccordionSection
              id="hero"
              title="Hero Banner & Alignment"
              subtitle="Banner height, artwork, text alignment & overlay options"
              icon={ImageIcon}
              isOpen={!!openSections.hero}
              onToggle={() => toggleSection('hero')}
            >
              <div className="space-y-4">
                <SingleImageUploader
                  value={customization.hero.bannerUrl}
                  onChange={(url) =>
                    handleUpdate('hero', { ...customization.hero, bannerUrl: url })
                  }
                  label="Hero Banner Header Artwork *"
                  description="Main background header image displayed at top of storefront."
                  aspectRatio="banner"
                />

                <SingleImageUploader
                  value={customization.hero.logoUrl}
                  onChange={(url) =>
                    handleUpdate('hero', { ...customization.hero, logoUrl: url })
                  }
                  label="Storefront Logo / Brand Badge *"
                  description="Store logo badge image displayed in header navigation."
                  aspectRatio="square"
                />

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Banner Height</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'small', label: 'Small Compact' },
                      { id: 'medium', label: 'Medium Standard' },
                      { id: 'large', label: 'Large Showcase' },
                      { id: 'full', label: 'Full Screen' },
                    ].map((bh) => (
                      <button
                        key={bh.id}
                        type="button"
                        onClick={() =>
                          handleUpdate('hero', {
                            ...customization.hero,
                            bannerHeight: bh.id as BannerHeight,
                          })
                        }
                        className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                          customization.hero.bannerHeight === bh.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {bh.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Text Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: 'Left Aligned' },
                      { id: 'center', label: 'Centered' },
                      { id: 'right', label: 'Right Aligned' },
                    ].map((ta) => (
                      <button
                        key={ta.id}
                        type="button"
                        onClick={() =>
                          handleUpdate('hero', {
                            ...customization.hero,
                            textAlign: ta.id as TextAlignment,
                          })
                        }
                        className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                          customization.hero.textAlign === ta.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {ta.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 6. NAVIGATION BAR SECTION */}
            <AccordionSection
              id="nav"
              title="Navigation Bar"
              subtitle="Sticky behavior, backdrop blur & transparency"
              icon={Navigation}
              isOpen={!!openSections.nav}
              onToggle={() => toggleSection('nav')}
            >
              <div className="space-y-4">
                <ToggleSwitch
                  label="Sticky Navigation Bar"
                  description="Keep the navigation header fixed at top while scrolling"
                  checked={customization.navigation.type === 'sticky'}
                  onChange={(checked) =>
                    handleUpdate('navigation', {
                      ...customization.navigation,
                      type: checked ? 'sticky' : 'standard',
                    })
                  }
                />

                <ToggleSwitch
                  label="Glassmorphic Backdrop Blur"
                  description="Apply frosted glass blur effect behind the navigation"
                  checked={customization.navigation.blurEffect}
                  onChange={(checked) =>
                    handleUpdate('navigation', {
                      ...customization.navigation,
                      blurEffect: checked,
                    })
                  }
                />

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-neutral-800">Background Transparency</label>
                    <span className="text-xs font-mono font-bold text-neutral-600">
                      {customization.navigation.bgTransparency}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={customization.navigation.bgTransparency}
                    onChange={(e) =>
                      handleUpdate('navigation', {
                        ...customization.navigation,
                        bgTransparency: parseInt(e.target.value) || 95,
                      })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </AccordionSection>

            {/* 7. PRODUCT CARDS SECTION */}
            <AccordionSection
              id="cards"
              title="Product Cards"
              subtitle="Aspect ratio, corner radius & hover animations"
              icon={CreditCard}
              isOpen={!!openSections.cards}
              onToggle={() => toggleSection('cards')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Image Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: '1:1', label: '1:1 Square' },
                      { id: '4:3', label: '4:3 Standard' },
                      { id: '16:9', label: '16:9 Wide' },
                      { id: '3:4', label: '3:4 Portrait' },
                    ].map((r) => {
                      const isSelected = customization.cards.imageRatio === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() =>
                            handleUpdate('cards', {
                              ...customization.cards,
                              imageRatio: r.id as ImageRatio,
                            })
                          }
                          className={`flex flex-col items-center justify-center rounded-xl border p-2 text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-neutral-800">Corner Border Radius</label>
                    <span className="text-xs font-mono font-bold text-neutral-600">
                      {customization.cards.borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={customization.cards.borderRadius}
                    onChange={(e) =>
                      handleUpdate('cards', {
                        ...customization.cards,
                        borderRadius: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Hover Animation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'lift', label: 'Lift Up' },
                      { id: 'scale', label: 'Zoom Scale' },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() =>
                          handleUpdate('cards', {
                            ...customization.cards,
                            hoverAnimation: a.id as HoverAnimation,
                          })
                        }
                        className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                          customization.cards.hoverAnimation === a.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 8. BUTTONS SECTION */}
            <AccordionSection
              id="buttons"
              title="Buttons & Controls"
              subtitle="Corner shapes, style variants & sizing"
              icon={MousePointer}
              isOpen={!!openSections.buttons}
              onToggle={() => toggleSection('buttons')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Corner Shape</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'rounded', label: 'Rounded (12px)' },
                      { id: 'square', label: 'Square (0px)' },
                      { id: 'pill', label: 'Pill Shape' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          handleUpdate('buttons', {
                            ...customization.buttons,
                            shape: s.id as ButtonShape,
                          })
                        }
                        className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                          customization.buttons.shape === s.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">Style Variant</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'filled', label: 'Filled Solid' },
                      { id: 'outlined', label: 'Outlined Border' },
                      { id: 'soft', label: 'Soft Tint' },
                      { id: 'ghost', label: 'Ghost Minimal' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          handleUpdate('buttons', {
                            ...customization.buttons,
                            variant: v.id as ButtonVariant,
                          })
                        }
                        className={`rounded-xl border p-2 text-xs font-bold transition-all ${
                          customization.buttons.variant === v.id
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 9. FOOTER SECTION */}
            <AccordionSection
              id="footer"
              title="Footer Settings"
              subtitle="Visibility, copyright notice & color styling"
              icon={Globe}
              isOpen={!!openSections.footer}
              onToggle={() => toggleSection('footer')}
            >
              <div className="space-y-4">
                <ToggleSwitch
                  label="Display Storefront Footer"
                  description="Show footer area at bottom of public storefront"
                  checked={customization.footer.show}
                  onChange={(checked) =>
                    handleUpdate('footer', { ...customization.footer, show: checked })
                  }
                />

                <ToggleSwitch
                  label="Show Social Links in Footer"
                  description="Display icons for your social media channels"
                  checked={customization.footer.showSocialLinks}
                  onChange={(checked) =>
                    handleUpdate('footer', { ...customization.footer, showSocialLinks: checked })
                  }
                />

                <ToggleSwitch
                  label="Show Newsletter Form in Footer"
                  description="Allow customers to subscribe to email updates"
                  checked={customization.footer.showNewsletter}
                  onChange={(checked) =>
                    handleUpdate('footer', { ...customization.footer, showNewsletter: checked })
                  }
                />

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Copyright Notice Text</label>
                  <input
                    type="text"
                    value={customization.footer.copyrightText}
                    onChange={(e) =>
                      handleUpdate('footer', { ...customization.footer, copyrightText: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <SingleImageUploader
                  value={customization.footer.logoUrl || customization.hero.logoUrl}
                  onChange={(url) =>
                    handleUpdate('footer', { ...customization.footer, logoUrl: url })
                  }
                  label="Footer Logo (Optional)"
                  description="Secondary logo artwork displayed in footer area."
                  aspectRatio="square"
                />
              </div>
            </AccordionSection>

            {/* 10. SOCIAL MEDIA SECTION */}
            <AccordionSection
              id="social"
              title="Social Media Links"
              subtitle="Connect Instagram, TikTok, WhatsApp & YouTube"
              icon={Share2}
              isOpen={!!openSections.social}
              onToggle={() => toggleSection('social')}
            >
              <SocialLinksManager
                storefrontId={storefront.id}
                customization={customization}
                onUpdateCustomization={(c) => setCustomization(c)}
                isEmbeddedInCustomizer={true}
              />
            </AccordionSection>

            {/* 11. LAYOUT & SPACING (VISUAL GRID CARDS) */}
            <AccordionSection
              id="layout"
              title="Layout & Spacing"
              subtitle="Product grid columns & container max width"
              icon={Grid}
              isOpen={!!openSections.layout}
              onToggle={() => toggleSection('layout')}
            >
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Product Grid Columns
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      id: '2-column',
                      label: '2 Columns',
                      renderPreview: () => (
                        <div className="grid grid-cols-2 gap-1 p-1.5 bg-neutral-100 rounded-md">
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                        </div>
                      ),
                    },
                    {
                      id: '3-column',
                      label: '3 Columns',
                      renderPreview: () => (
                        <div className="grid grid-cols-3 gap-1 p-1.5 bg-neutral-100 rounded-md">
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                        </div>
                      ),
                    },
                    {
                      id: '4-column',
                      label: '4 Columns',
                      renderPreview: () => (
                        <div className="grid grid-cols-4 gap-1 p-1.5 bg-neutral-100 rounded-md">
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                          <div className="h-5 rounded bg-neutral-300" />
                        </div>
                      ),
                    },
                    {
                      id: 'list',
                      label: '1 Column List',
                      renderPreview: () => (
                        <div className="flex flex-col gap-1 p-1.5 bg-neutral-100 rounded-md">
                          <div className="h-2.5 rounded bg-neutral-300 w-full" />
                          <div className="h-2.5 rounded bg-neutral-300 w-full" />
                        </div>
                      ),
                    },
                  ].map((g) => {
                    const isSelected = customization.storeLayout.gridColumns === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() =>
                          handleUpdate('storeLayout', {
                            ...customization.storeLayout,
                            gridColumns: g.id as StoreLayoutMode,
                          })
                        }
                        className={`cursor-pointer rounded-xl border overflow-hidden p-2 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        {g.renderPreview()}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-neutral-900">{g.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionSection>

            {/* 12. SECTIONS & VISIBILITY SECTION */}
            <AccordionSection
              id="sections"
              title="Storefront Sections"
              subtitle="Toggle active page modules & showcase blocks"
              icon={Layers}
              isOpen={!!openSections.sections}
              onToggle={() => toggleSection('sections')}
            >
              <div className="space-y-2">
                {[
                  { key: 'featuredProducts', label: 'Featured Products Showcase' },
                  { key: 'collections', label: 'Collection Filter Tabs' },
                  { key: 'testimonials', label: 'Customer Reviews & Testimonials' },
                  { key: 'faq', label: 'Frequently Asked Questions (FAQ)' },
                  { key: 'newsletter', label: 'Email Newsletter Signup' },
                ].map((sec) => {
                  const active = !!customization.sections[sec.key as keyof typeof customization.sections];
                  return (
                    <ToggleSwitch
                      key={sec.key}
                      label={sec.label}
                      checked={active}
                      onChange={(checked) =>
                        handleUpdate('sections', {
                          ...customization.sections,
                          [sec.key]: checked,
                        })
                      }
                    />
                  );
                })}
              </div>
            </AccordionSection>

            {/* 13. ADVANCED SETTINGS & RESETS */}
            <AccordionSection
              id="advanced"
              title="Advanced Settings"
              subtitle="Entry animations & studio reset options"
              icon={Settings}
              isOpen={!!openSections.advanced}
              onToggle={() => toggleSection('advanced')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Page Entry Animation</label>
                  <select
                    value={customization.animations.type}
                    onChange={(e) =>
                      handleUpdate('animations', {
                        ...customization.animations,
                        type: e.target.value as AnimationType,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-semibold text-neutral-900 focus:outline-none"
                  >
                    <option value="fade">Subtle Smooth Fade</option>
                    <option value="slide">Slide Up Entrance</option>
                    <option value="none">Instant No Animation</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-200/80 space-y-2">
                  <span className="text-xs font-extrabold text-neutral-900 block">Reset Options</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleResetColors}
                      className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Colors
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTypography}
                      className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Fonts
                    </button>
                    <button
                      type="button"
                      onClick={handleResetEntireTheme}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Studio
                    </button>
                  </div>
                </div>
              </div>
            </AccordionSection>
          </div>

          {/* STICKY BOTTOM ACTIONS FOOTER (Save Draft, Publish, Restore, Reset) */}
          <div className="sticky bottom-0 z-20 border-t border-neutral-200/90 bg-white/95 p-3.5 backdrop-blur-md shadow-lg shrink-0">
            <div className="flex flex-col gap-2">
              {isDirty && (
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved Edits Active
                  </span>
                  <button
                    type="button"
                    onClick={handleRestorePreviousStyle}
                    className="text-amber-950 underline hover:text-amber-900 font-extrabold"
                  >
                    Discard & Restore
                  </button>
                </div>
              )}

              {saveStatus !== 'idle' && (
                <div className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold shadow-2xs animate-fade-in ${
                  saveStatus === 'restored'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}>
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${saveStatus === 'restored' ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span>
                    {saveStatus === 'published'
                      ? 'Storefront changes published live successfully!'
                      : saveStatus === 'restored'
                      ? 'Restored storefront to last saved configuration.'
                      : 'Draft changes saved.'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestorePreviousStyle}
                  disabled={!isDirty}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-extrabold transition-all shadow-2xs min-h-[40px] ${
                    isDirty
                      ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 active:scale-95 cursor-pointer'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed opacity-60'
                  }`}
                  title="Restore to last saved style (discard unsaved edits)"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Restore Saved</span>
                  <span className="sm:hidden">Restore</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100 py-2.5 px-3 text-xs font-extrabold text-neutral-900 hover:bg-neutral-200 active:scale-95 transition-all shadow-2xs min-h-[40px]"
                >
                  <Save className="h-4 w-4 text-neutral-700" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-extrabold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md min-h-[40px]"
                >
                  <Zap className="h-4 w-4 text-emerald-300" />
                  <span>Publish</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetEntireTheme}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:scale-95 transition-all min-h-[40px] min-w-[40px]"
                  title="Reset Entire Theme to Studio Defaults"
                >
                  <RotateCcw className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LIVE PREVIEW PANEL */}
        <div className={`flex-1 flex flex-col rounded-2xl border border-neutral-300 bg-neutral-100/90 shadow-xl overflow-hidden ${
          mobileActivePane === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Studio Preview Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-600 shrink-0 shadow-2xs">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-extrabold text-neutral-900">Live Studio Real-Time Preview</span>
              <span className="hidden sm:inline font-mono text-[11px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                /store/{storefront.slug}
              </span>
            </div>

            {/* Viewport & Zoom Controls */}
            <div className="flex items-center gap-2">
              {/* Device Selector */}
              <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
                <button
                  onClick={() => setDevicePreview('desktop')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    devicePreview === 'desktop' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Desktop View (Full Screen)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setDevicePreview('tablet')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    devicePreview === 'tablet' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setDevicePreview('mobile')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    devicePreview === 'mobile' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              <div className="h-4 w-px bg-neutral-200 mx-0.5 hidden sm:block" />

              {/* Zoom Controls Bar */}
              <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-0.5 gap-0.5">
                <button
                  onClick={handleZoomOut}
                  className="rounded-lg p-1 text-neutral-600 hover:bg-white hover:text-neutral-900 transition-colors"
                  title="Zoom Out (-10%)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <span className="min-w-[40px] text-center font-mono text-[11px] font-extrabold text-neutral-700">
                  {isFitMode ? 'Fit' : `${Math.round(zoomScale * 100)}%`}
                </span>

                <button
                  onClick={handleZoomIn}
                  className="rounded-lg p-1 text-neutral-600 hover:bg-white hover:text-neutral-900 transition-colors"
                  title="Zoom In (+10%)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                    !isFitMode && zoomScale === 1.0 ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Reset to 100% Zoom"
                >
                  100%
                </button>

                <button
                  onClick={handleFitToScreen}
                  className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                    isFitMode ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Fit to Container"
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Scrollable Workspace Viewport */}
          <div className="flex-1 overflow-auto no-scrollbar bg-neutral-200/70 p-4 lg:p-6 flex justify-center items-start relative bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
            <div
              style={{
                transform: `scale(${isFitMode ? (devicePreview === 'desktop' ? 0.85 : devicePreview === 'tablet' ? 0.95 : 1.0) : zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`bg-white overflow-hidden transition-all duration-300 ${
                devicePreview === 'mobile'
                  ? 'w-[375px] rounded-[36px] border-[10px] border-neutral-900 my-2 shadow-2xl'
                  : devicePreview === 'tablet'
                  ? 'w-[768px] rounded-[24px] border-[8px] border-neutral-800 my-2 shadow-2xl'
                  : 'w-full max-w-full rounded-2xl border border-neutral-300 my-1 shadow-xl'
              }`}
            >
              {/* Phone Notch */}
              {devicePreview === 'mobile' && (
                <div className="bg-neutral-900 h-5 w-full flex justify-center items-center shrink-0">
                  <div className="h-3 w-24 bg-neutral-800 rounded-b-xl flex justify-center items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-neutral-700" />
                    <div className="h-1 w-8 rounded-full bg-neutral-700" />
                  </div>
                </div>
              )}

              {/* Public Storefront Full Page Component */}
              <div className="w-full bg-white min-h-full">
                <PublicStorefront
                  storefrontOverride={{
                    ...storefront,
                    storeName: customization.hero.storeTitle || storefront.storeName,
                    bannerTitle: customization.hero.tagline || storefront.bannerTitle,
                    bannerSubtitle: customization.hero.description || storefront.bannerSubtitle,
                    bannerUrl: customization.hero.bannerUrl || storefront.bannerUrl,
                    logoUrl: customization.hero.logoUrl || storefront.logoUrl,
                  }}
                  customizationOverride={customization}
                  isPreviewMode={true}
                  isMobilePreview={devicePreview === 'mobile'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
