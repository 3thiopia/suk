import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Check,
  AlertCircle,
  Sparkles,
  Search,
  Sliders,
  Palette,
  Layout,
  Globe,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import {
  StorefrontSocialLink,
  SocialDisplayConfig,
  StorefrontCustomization,
  SocialPlatformId,
  SocialPlacement,
  SocialAlignment,
  SocialSize,
  SocialStyle,
  SocialHoverAnimation,
} from '../../types';
import { SOCIAL_PLATFORMS, getSocialPlatformInfo, formatUrlWithProtocol } from '../../lib/socialPlatforms';
import { getDefaultCustomization } from '../../lib/customizationDefaults';
import { SocialPlatformIcon } from '../common/SocialPlatformIcon';

interface SocialLinksManagerProps {
  storefrontId: string;
  customization?: StorefrontCustomization;
  onUpdateCustomization?: (newCustomization: StorefrontCustomization) => void;
  onLinksChange?: () => void;
  isEmbeddedInCustomizer?: boolean;
}

export function SocialLinksManager({
  storefrontId,
  customization,
  onUpdateCustomization,
  onLinksChange,
  isEmbeddedInCustomizer = false,
}: SocialLinksManagerProps) {
  const [socialLinks, setSocialLinks] = useState<StorefrontSocialLink[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchPlatformQuery, setSearchPlatformQuery] = useState('');

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformId>('instagram');
  const [inputUrl, setInputUrl] = useState('');
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; error?: string; formattedUrl: string }>({
    isValid: true,
    formattedUrl: '',
  });

  // Display Configuration State
  const currentStorefront = storage.getStorefronts().find((s) => s.id === storefrontId);
  const currentCustomization = customization || currentStorefront?.customization || (currentStorefront ? getDefaultCustomization(currentStorefront) : undefined);

  const [displayConfig, setDisplayConfig] = useState<SocialDisplayConfig>(() => {
    return (
      currentCustomization?.socialDisplayConfig || {
        placements: ['header', 'footer', 'about', 'contact'],
        alignment: 'center',
        size: 'medium',
        style: 'filled',
        useThemeColors: true,
        customColor: currentCustomization?.colors.primary || '#059669',
        customHoverColor: currentCustomization?.colors.primary || '#047857',
        customBgColor: '#f1f5f9',
        borderRadius: 12,
        spacing: 12,
        hoverAnimation: 'lift',
      }
    );
  });

  const [activeTab, setActiveTab] = useState<'links' | 'styling' | 'preview'>('links');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  // Sync social links from storage
  const loadLinks = () => {
    const fetched = storage.getStorefrontSocialLinks(storefrontId);
    setSocialLinks(fetched);
  };

  useEffect(() => {
    loadLinks();
    const unsubscribe = storage.subscribe(() => {
      loadLinks();
    });
    return unsubscribe;
  }, [storefrontId]);

  // Handle URL change & live validation
  const handleUrlInput = (val: string, platformId: string) => {
    setInputUrl(val);
    const info = getSocialPlatformInfo(platformId);
    const validation = info.validate(val);
    setUrlValidation(validation);
  };

  const openAddModal = (platformId: SocialPlatformId = 'instagram') => {
    setSelectedPlatform(platformId);
    const info = getSocialPlatformInfo(platformId);
    setInputUrl(info.exampleUrl);
    setUrlValidation(info.validate(info.exampleUrl));
    setEditingLinkId(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (link: StorefrontSocialLink) => {
    setEditingLinkId(link.id);
    setSelectedPlatform(link.platform as SocialPlatformId);
    setInputUrl(link.url);
    const info = getSocialPlatformInfo(link.platform);
    setUrlValidation(info.validate(link.url));
    setIsAddModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!urlValidation.isValid) return;

    if (editingLinkId) {
      storage.updateSocialLink(editingLinkId, {
        platform: selectedPlatform,
        url: urlValidation.formattedUrl,
      });
    } else {
      storage.addSocialLink(storefrontId, selectedPlatform, urlValidation.formattedUrl);
    }

    setIsAddModalOpen(false);
    setInputUrl('');
    loadLinks();
    if (onLinksChange) onLinksChange();
  };

  const handleToggleVisibility = (id: string) => {
    storage.toggleSocialLinkVisibility(id);
    loadLinks();
    if (onLinksChange) onLinksChange();
  };

  const handleDeleteLink = (id: string) => {
    storage.removeSocialLink(id);
    loadLinks();
    if (onLinksChange) onLinksChange();
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === socialLinks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newLinks = [...socialLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    const orderedIds = newLinks.map((l) => l.id);
    storage.reorderSocialLinks(storefrontId, orderedIds);
    loadLinks();
    if (onLinksChange) onLinksChange();
  };

  // Update Display Configuration
  const handleUpdateConfig = (newPartial: Partial<SocialDisplayConfig>) => {
    const updated = { ...displayConfig, ...newPartial };
    setDisplayConfig(updated);

    if (currentCustomization && onUpdateCustomization) {
      onUpdateCustomization({
        ...currentCustomization,
        socialDisplayConfig: updated,
      });
    } else if (currentStorefront) {
      const cust = currentStorefront.customization || getDefaultCustomization(currentStorefront);
      const updatedCust = { ...cust, socialDisplayConfig: updated };
      storage.updateStorefront(storefrontId, { customization: updatedCust });
    }
  };

  const togglePlacement = (placement: SocialPlacement) => {
    const exists = displayConfig.placements.includes(placement);
    const newPlacements = exists
      ? displayConfig.placements.filter((p) => p !== placement)
      : [...displayConfig.placements, placement];
    handleUpdateConfig({ placements: newPlacements });
  };

  // Quick copy URL helper
  const handleCopyUrl = (url: string, platformName: string) => {
    navigator.clipboard.writeText(url);
    setCopyNotification(`Copied ${platformName} link!`);
    setTimeout(() => setCopyNotification(null), 2000);
  };

  // Filter platforms in add dialog
  const filteredPlatforms = SOCIAL_PLATFORMS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchPlatformQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchPlatformQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      {!isEmbeddedInCustomizer && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-black text-neutral-900">Social Links Manager</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {socialLinks.filter((l) => l.isVisible).length} Active
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500 max-w-xl">
                Connect, organize, and customize how your social media channels appear across your public white-label storefront.
              </p>
            </div>

            <button
              onClick={() => openAddModal('instagram')}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              Connect Platform
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'links'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          My Connected Channels ({socialLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('styling')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'styling'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Palette className="h-3.5 w-3.5 text-emerald-500" />
          Display & Styling Options
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'preview'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5 text-blue-500" />
          Live Icon Preview
        </button>
      </div>

      {copyNotification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4" />
          {copyNotification}
        </div>
      )}

      {/* TAB 1: Connected Social Channels List */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Active Storefront Links ({socialLinks.length})
            </span>
            <button
              onClick={() => openAddModal()}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Platform
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-white space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">No Social Links Connected</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Add your social media profiles (Instagram, X, TikTok, WhatsApp, etc.) so storefront visitors can connect with your reseller brand.
              </p>
              <button
                onClick={() => openAddModal('instagram')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Connect Social Account
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {socialLinks.map((link, idx) => {
                const info = getSocialPlatformInfo(link.platform);
                return (
                  <div
                    key={link.id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 bg-white transition-all sm:flex-row sm:items-center sm:justify-between ${
                      link.isVisible
                        ? 'border-neutral-200 shadow-2xs hover:border-neutral-300'
                        : 'border-neutral-200 bg-neutral-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-neutral-400">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={idx === socialLinks.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Icon Preview */}
                      <SocialPlatformIcon
                        platform={link.platform}
                        size={displayConfig.size}
                        styleVariant={displayConfig.style}
                        useThemeColor={displayConfig.useThemeColors}
                        customColor={displayConfig.customColor}
                        customBgColor={displayConfig.customBgColor}
                        borderRadiusPx={displayConfig.borderRadius}
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-neutral-900">{info.name}</h4>
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
                            style={{ backgroundColor: info.brandBgColor, color: info.brandColor }}
                          >
                            {info.category}
                          </span>
                          {!link.isVisible && (
                            <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                          {link.url}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-neutral-100 pt-2 sm:border-0 sm:pt-0">
                      <button
                        onClick={() => handleCopyUrl(link.url, info.name)}
                        className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        title="Copy Link"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        title="Test Open"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleToggleVisibility(link.id)}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                          link.isVisible
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        {link.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {link.isVisible ? 'Visible' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => openEditModal(link)}
                        className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Supported Platforms Grid Quick Add */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Add More Platforms ({SOCIAL_PLATFORMS.length} Supported)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {SOCIAL_PLATFORMS.map((p) => {
                const isConnected = socialLinks.some((l) => l.platform.toLowerCase() === p.id.toLowerCase());
                return (
                  <button
                    key={p.id}
                    onClick={() => openAddModal(p.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                      isConnected
                        ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                    }`}
                  >
                    <SocialPlatformIcon platform={p.id} size="small" styleVariant="filled" />
                    <div className="truncate">
                      <span className="text-xs font-bold text-neutral-900 block truncate">{p.name}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {isConnected ? 'Connected' : '+ Connect'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Display & Styling Customization Options */}
      {activeTab === 'styling' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-6">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Layout className="h-4 w-4 text-emerald-600" /> Storefront Placements & Positions
            </h3>

            {/* Placement Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-700 block">
                Show Social Links In Storefront Areas:
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { id: 'header', label: 'Store Header', desc: 'Main navigation bar' },
                  { id: 'footer', label: 'Store Footer', desc: 'Bottom copyright section' },
                  { id: 'contact', label: 'Contact Section', desc: 'Customer support area' },
                  { id: 'about', label: 'About Storefront', desc: 'Brand bio section' },
                ].map((item) => {
                  const isChecked = displayConfig.placements.includes(item.id as SocialPlacement);
                  return (
                    <div
                      key={item.id}
                      onClick={() => togglePlacement(item.id as SocialPlacement)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <span className="mt-1 block text-[11px] text-neutral-500">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alignment Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">Icon Row Alignment:</label>
              <div className="flex gap-3">
                {[
                  { id: 'left', label: 'Left Align' },
                  { id: 'center', label: 'Center Align' },
                  { id: 'right', label: 'Right Align' },
                ].map((align) => (
                  <button
                    key={align.id}
                    onClick={() => handleUpdateConfig({ alignment: align.id as SocialAlignment })}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      displayConfig.alignment === align.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {align.label}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3 pt-4">
              <Palette className="h-4 w-4 text-emerald-600" /> Visual Styling & Icon Shape
            </h3>

            {/* Icon Style Variant */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">Icon Background Style:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'filled', label: 'Filled Pill', desc: 'Solid background' },
                  { id: 'outline', label: 'Outline Ring', desc: 'Clean border ring' },
                  { id: 'rounded', label: 'Full Circle', desc: '360° rounded pill' },
                  { id: 'square', label: 'Square Box', desc: 'Structured box' },
                  { id: 'minimal', label: 'Minimal Icon', desc: 'No background' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateConfig({ style: st.id as SocialStyle })}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      displayConfig.style === st.id
                        ? 'border-emerald-600 bg-emerald-50 shadow-2xs font-bold text-neutral-900'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{st.label}</span>
                    <span className="text-[10px] text-neutral-400 block">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">Icon Size Scale:</label>
              <div className="flex gap-3">
                {[
                  { id: 'small', label: 'Small (16px)' },
                  { id: 'medium', label: 'Medium (20px)' },
                  { id: 'large', label: 'Large (24px)' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => handleUpdateConfig({ size: sz.id as SocialSize })}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      displayConfig.size === sz.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">Color Mode:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useThemeColorsToggle"
                    checked={displayConfig.useThemeColors}
                    onChange={(e) => handleUpdateConfig({ useThemeColors: e.target.checked })}
                    className="h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="useThemeColorsToggle" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                    Auto-Match Storefront Theme Colors
                  </label>
                </div>
              </div>

              {!displayConfig.useThemeColors && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Custom Icon Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={displayConfig.customColor || '#059669'}
                        onChange={(e) => handleUpdateConfig({ customColor: e.target.value })}
                        className="h-8 w-12 cursor-pointer rounded-lg border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={displayConfig.customColor || '#059669'}
                        onChange={(e) => handleUpdateConfig({ customColor: e.target.value })}
                        className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Custom Background Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={displayConfig.customBgColor || '#f1f5f9'}
                        onChange={(e) => handleUpdateConfig({ customBgColor: e.target.value })}
                        className="h-8 w-12 cursor-pointer rounded-lg border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={displayConfig.customBgColor || '#f1f5f9'}
                        onChange={(e) => handleUpdateConfig({ customBgColor: e.target.value })}
                        className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Hover Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={displayConfig.customHoverColor || '#047857'}
                        onChange={(e) => handleUpdateConfig({ customHoverColor: e.target.value })}
                        className="h-8 w-12 cursor-pointer rounded-lg border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={displayConfig.customHoverColor || '#047857'}
                        onChange={(e) => handleUpdateConfig({ customHoverColor: e.target.value })}
                        className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hover Animations & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">Hover Animation Effect:</label>
                <select
                  value={displayConfig.hoverAnimation}
                  onChange={(e) => handleUpdateConfig({ hoverAnimation: e.target.value as SocialHoverAnimation })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800"
                >
                  <option value="none">None (Static)</option>
                  <option value="lift">Lift Up (-4px)</option>
                  <option value="scale">Scale Up (+10%)</option>
                  <option value="glow">Soft Emerald Glow</option>
                  <option value="bounce">Subtle Bounce</option>
                  <option value="spin">Rotate Spin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 flex justify-between">
                  <span>Icon Spacing:</span>
                  <span className="font-mono text-emerald-700">{displayConfig.spacing}px</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="2"
                  value={displayConfig.spacing}
                  onChange={(e) => handleUpdateConfig({ spacing: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live Interactive Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" /> Real-Time Storefront Social Preview
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Interactive Mode
              </span>
            </div>

            {/* Mock Header Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Storefront Header Preview
              </span>
              <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-4 text-white flex items-center justify-between">
                <span className="text-sm font-extrabold tracking-tight">MY STORE</span>
                <div className="flex items-center gap-3">
                  {socialLinks
                    .filter((l) => l.isVisible)
                    .slice(0, 5)
                    .map((link) => (
                      <SocialPlatformIcon
                        key={link.id}
                        platform={link.platform}
                        size={displayConfig.size}
                        styleVariant={displayConfig.style}
                        useThemeColor={displayConfig.useThemeColors}
                        customColor={displayConfig.customColor}
                        customBgColor={displayConfig.customBgColor}
                        borderRadiusPx={displayConfig.borderRadius}
                        hoverAnimation={displayConfig.hoverAnimation}
                        showTooltip={true}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Mock Footer Preview */}
            <div className="space-y-2 pt-4">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Storefront Footer Preview
              </span>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center space-y-4">
                <h4 className="text-sm font-bold text-neutral-900">Follow Our Official Channels</h4>
                <div
                  className="flex flex-wrap items-center justify-center"
                  style={{ gap: `${displayConfig.spacing}px` }}
                >
                  {socialLinks
                    .filter((l) => l.isVisible)
                    .map((link) => (
                      <SocialPlatformIcon
                        key={link.id}
                        platform={link.platform}
                        size={displayConfig.size}
                        styleVariant={displayConfig.style}
                        useThemeColor={displayConfig.useThemeColors}
                        customColor={displayConfig.customColor}
                        customBgColor={displayConfig.customBgColor}
                        borderRadiusPx={displayConfig.borderRadius}
                        hoverAnimation={displayConfig.hoverAnimation}
                        showTooltip={true}
                      />
                    ))}
                </div>
                <p className="text-xs text-neutral-400">© 2026 Creator Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Social Link Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-neutral-900">
                {editingLinkId ? 'Edit Connected Platform' : 'Connect Social Media Account'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-700 block">Select Platform:</label>
              
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search platforms..."
                    value={searchPlatformQuery}
                    onChange={(e) => setSearchPlatformQuery(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto text-[11px] font-semibold">
                  {['all', 'social', 'messaging', 'video', 'developer', 'web'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`capitalize px-2 py-1 rounded-lg ${
                        selectedCategory === cat
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-neutral-200 rounded-xl bg-neutral-50">
                {filteredPlatforms.map((p) => {
                  const isSelected = selectedPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlatform(p.id);
                        handleUrlInput(inputUrl, p.id);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                          : 'border-transparent hover:bg-white hover:border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <SocialPlatformIcon platform={p.id} size="small" styleVariant="filled" />
                      <span className="text-[11px] mt-1 font-bold truncate w-full">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile URL Input with Realtime Validation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">
                {getSocialPlatformInfo(selectedPlatform).name} Profile URL:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={getSocialPlatformInfo(selectedPlatform).placeholder}
                  value={inputUrl}
                  onChange={(e) => handleUrlInput(e.target.value, selectedPlatform)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 ${
                    urlValidation.isValid
                      ? 'border-neutral-300 focus:ring-emerald-500'
                      : 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  }`}
                />
              </div>

              {/* Validation Status Indicator */}
              <div className="mt-1 flex items-center justify-between text-xs font-medium">
                {urlValidation.isValid ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="h-4 w-4" /> Valid URL Pattern
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                    <AlertCircle className="h-4 w-4" /> {urlValidation.error || 'Invalid URL'}
                  </span>
                )}
                <span className="text-[11px] text-neutral-400">
                  Example: {getSocialPlatformInfo(selectedPlatform).exampleUrl}
                </span>
              </div>
            </div>

            {/* Icon Preview */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Live Icon Preview:</span>
              <div className="flex items-center gap-2">
                <SocialPlatformIcon
                  platform={selectedPlatform}
                  size={displayConfig.size}
                  styleVariant={displayConfig.style}
                  useThemeColor={displayConfig.useThemeColors}
                  customColor={displayConfig.customColor}
                  customBgColor={displayConfig.customBgColor}
                  borderRadiusPx={displayConfig.borderRadius}
                />
                <span className="text-xs font-bold text-neutral-900">
                  {getSocialPlatformInfo(selectedPlatform).name}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                disabled={!urlValidation.isValid || !inputUrl.trim()}
                onClick={handleSaveLink}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {editingLinkId ? 'Save Changes' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
