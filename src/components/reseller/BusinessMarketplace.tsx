import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Store,
  Plus,
  Check,
  Eye,
  Heart,
  Filter,
  Lock,
  Layers,
  Sparkles,
  ArrowUpDown,
  Tag,
  Calendar,
  Package,
  SlidersHorizontal,
  FolderPlus,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  X,
  UserCheck,
  Users,
  Coins,
  Star,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { RatingStars } from '../common/RatingStars';
import { Product, BusinessProfile, StorefrontProduct, Collection } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getProductCommission } from '../../lib/commission';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useFollow } from '../../hooks/useFollow';
import { UnfollowConfirmModal } from '../common/UnfollowConfirmModal';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { AuthPromptModal } from '../auth/AuthPromptModal';

interface BusinessMarketplaceProps {
  onNavigate?: (path: string) => void;
}

export function BusinessMarketplace({ onNavigate }: BusinessMarketplaceProps) {
  const { t } = useTranslation();
  const currentUser = storage.getCurrentUser();
  const activeStorefront = currentUser ? storage.getStorefrontByResellerId(currentUser.id) : null;
  const storefront = activeStorefront || storage.getStorefronts()[0];

  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState('');

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'all_products' | 'all_businesses' | 'following'>('all_products');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc'>('newest');

  // Modal States
  const [presentationSp, setPresentationSp] = useState<StorefrontProduct | null>(null);

  // Pagination / Load More
  const [displayCount, setDisplayCount] = useState<number>(12);

  // Raw Data from Storage
  const allProducts = storage.getProducts().filter((p) => p.status === 'active');
  const businesses = storage.getBusinesses();
  const categories = storage.getCategories();
  const storefrontProducts = storage.getStorefrontProducts().filter((sp) => sp.storefrontId === storefront.id);
  const collections = storage.getCollections(storefront.id);

  // Set of IDs already added to this reseller's storefront
  const addedProductIds = useMemo(
    () => new Set(storefrontProducts.map((sp) => sp.productId)),
    [storefrontProducts]
  );

  // Follow state hook for reactive real-time updates
  const {
    followingIds: followedBusinessIds,
    isFollowing,
    handleToggleFollow,
    unfollowTarget,
    confirmUnfollow,
    cancelUnfollow,
    isProcessing,
    toastMessage,
  } = useFollow();

  // Unique Brand Names
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [allProducts]);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Tab filter
      if (activeTab === 'following' && !followedBusinessIds.has(product.businessId)) {
        return false;
      }
      if (selectedBusinessId !== 'all' && product.businessId !== selectedBusinessId) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesBusiness = (product.businessName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesCategory && !matchesDesc && !matchesBusiness) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // Price Range filter
      const minP = parseFloat(priceRange.min);
      if (!isNaN(minP) && product.price < minP) return false;
      const maxP = parseFloat(priceRange.max);
      if (!isNaN(maxP) && product.price > maxP) return false;

      // In Stock filter
      if (inStockOnly && product.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        // Sort by added count across resellers / stock
        return b.stock - a.stock;
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'highest_rated') {
        const statsA = storage.getRatingStatsForProduct(a.id);
        const statsB = storage.getRatingStatsForProduct(b.id);
        return statsB.averageRating - statsA.averageRating;
      }
      return 0;
    });
  }, [
    allProducts,
    activeTab,
    followedBusinessIds,
    selectedBusinessId,
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceRange,
    inStockOnly,
    sortBy,
  ]);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (activeTab === 'following' && !followedBusinessIds.has(b.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.businessName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
        );
      }
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [businesses, activeTab, followedBusinessIds, searchQuery, selectedCategory]);

  // Handlers
  const handleToggleAddProduct = (productId: string) => {
    if (!currentUser || currentUser.role !== 'reseller') {
      setAuthPromptAction('add products to your custom storefront');
      setIsAuthPromptOpen(true);
      return;
    }
    if (addedProductIds.has(productId)) {
      storage.removeProductFromStorefront(storefront.id, productId);
    } else {
      storage.addProductToStorefront(storefront.id, productId);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedBusinessId('all');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setSortBy('newest');
  };

  const handleOpenPresentationModal = (productId: string) => {
    const sp = storefrontProducts.find((item) => item.productId === productId);
    if (sp) {
      setPresentationSp(sp);
    } else {
      // Add first then open
      const newSp = storage.addProductToStorefront(storefront.id, productId);
      setPresentationSp(newSp);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-xl lg:p-8">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> {t('marketplace.title', 'Wholesale Product Marketplace')}
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {t('marketplace.title', 'Wholesale Product Marketplace')}
            </h1>
            <p className="text-xs text-neutral-300 leading-relaxed sm:text-sm">
              {t('marketplace.subtitle', 'Discover vetted supplier products, add them to your digital storefront, and earn commission on every sale.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-xs">
              <p className="text-lg font-black text-emerald-400">{businesses.length}</p>
              <p className="text-[11px] font-medium text-neutral-400">{t('nav.businesses', 'Verified Brands')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-xs">
              <p className="text-lg font-black text-white">{allProducts.length}</p>
              <p className="text-[11px] font-medium text-neutral-400">{t('nav.products', 'Products')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-xs">
              <p className="text-lg font-black text-purple-400">{followedBusinessIds.size}</p>
              <p className="text-[11px] font-medium text-neutral-400">{t('nav.businesses', 'Brands')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-xs">
              <p className="text-lg font-black text-amber-400">{addedProductIds.size}</p>
              <p className="text-[11px] font-medium text-neutral-400">{t('nav.myStorefront', 'In Storefront')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Rules Notice Banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-blue-900">Automatic Catalog Synchronization Active:</span>{' '}
            <span>
              Product name, price, stock quantity, description, and specs are locked by the supplier and stay updated live. You control storefront visibility, cover photo selection, and collections.
            </span>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('/reseller/store-products')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 shadow-2xs hover:bg-blue-100 shrink-0"
          >
            Manage Presentation ({addedProductIds.size}) →
          </button>
        )}
      </div>

      {/* Main Grid: Left Sidebar Filters & Right Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Sidebar Filters */}
        <div className="space-y-5 lg:col-span-1">
          {/* Main Navigation Views */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Marketplace Navigation</h3>
            <button
              onClick={() => {
                setActiveTab('all_products');
                setSelectedBusinessId('all');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all_products' && selectedBusinessId === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>All Products</span>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{allProducts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('all_businesses')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all_businesses'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span>Supplier Brands</span>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 font-bold">{businesses.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-400 fill-purple-400" />
                <span>My Followed Brands</span>
              </div>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] text-purple-700 font-bold">
                {followedBusinessIds.size}
              </span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-neutral-500" /> Categories
              </h3>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[10px] font-bold text-emerald-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedCategory === 'all' ? 'bg-neutral-100 font-bold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] font-mono text-neutral-400">{allProducts.length}</span>
              </button>
              {categories.map((cat) => {
                const count = allProducts.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedCategory === cat.name ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-mono ${selectedCategory === cat.name ? 'text-white/70' : 'text-neutral-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand & Price Filters */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" /> Specifications & Price
            </h3>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Brand Manufacturer</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="all">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-1/2 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none"
                />
                <span className="text-neutral-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-1/2 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Quick price presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                <button
                  onClick={() => setPriceRange({ min: '0', max: '50' })}
                  className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  Under $50
                </button>
                <button
                  onClick={() => setPriceRange({ min: '50', max: '200' })}
                  className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  $50 - $200
                </button>
                <button
                  onClick={() => setPriceRange({ min: '200', max: '1000' })}
                  className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  $200+
                </button>
              </div>
            </div>

            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-bold text-neutral-800">In Stock Products Only</span>
            </label>

            <button
              onClick={handleResetFilters}
              className="w-full rounded-xl border border-neutral-200 py-2 text-center text-xs font-bold text-neutral-600 hover:bg-neutral-100"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="space-y-6 lg:col-span-3">
          {/* Top Search & Controls Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products, specifications, brands, or supplier names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="newest">Sort: Newest Added</option>
                <option value="highest_rated">Sort: Highest Customer Rating</option>
                <option value="popular">Sort: High Stock / Popular</option>
                <option value="price_asc">Sort: Price Low to High</option>
                <option value="price_desc">Sort: Price High to Low</option>
              </select>
            </div>
          </div>

          {/* VIEW MODE 1: SUPPLIER BRANDS DIRECTORY (when 'all_businesses' tab selected) */}
          {activeTab === 'all_businesses' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">Registered Brand Suppliers ({filteredBusinesses.length})</h2>
                <span className="text-xs text-neutral-500">Click a business to inspect its public catalog</span>
              </div>

              {filteredBusinesses.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
                  No businesses matched your search criteria.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBusinesses.map((biz) => {
                    const bizProducts = storage.getProductsByBusinessId(biz.id).filter((p) => p.status === 'active');

                    return (
                      <div
                        key={biz.id}
                        onClick={() => onNavigate(`/supplier/${biz.id}`)}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div>
                          {/* Banner */}
                          <div className="relative h-28 w-full bg-neutral-900 overflow-hidden">
                            <img src={biz.bannerUrl} alt={biz.businessName} className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-3 right-3">
                              <span className="rounded-full bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20">
                                {biz.category}
                              </span>
                            </div>
                          </div>

                          {/* Profile details */}
                          <div className="p-4 space-y-3 relative">
                            <div className="flex items-end justify-between -mt-9 mb-1">
                              <img
                                src={biz.logoUrl}
                                alt={biz.businessName}
                                className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md bg-white"
                              />

                              <button
                                onClick={(e) => handleToggleFollow(biz, e)}
                                disabled={isProcessing}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                                  isFollowing(biz.id)
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                                }`}
                              >
                                {isFollowing(biz.id) ? <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Plus className="h-3.5 w-3.5" />}
                                {isFollowing(biz.id) ? 'Following' : 'Follow'}
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-600 transition-colors">
                                  {biz.businessName}
                                </h3>
                                {biz.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-600" title="Verified Brand Supplier" />}
                              </div>
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                                {biz.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 font-medium">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-neutral-400" /> {biz.followerCount} Followers
                              </span>
                              <span className="flex items-center gap-1 font-bold text-neutral-800">
                                <Package className="h-3.5 w-3.5 text-emerald-600" /> {bizProducts.length} Products
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-neutral-50 px-4 py-2.5 text-center text-xs font-bold text-neutral-700 border-t border-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                          View Business Catalog →
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VIEW MODE 2: PRODUCTS GRID */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">
                    {activeTab === 'following' ? 'Products from Followed Brands' : 'Wholesale Product Catalog'}
                  </h2>
                  <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-800">
                    {filteredProducts.length}
                  </span>
                </div>

                {selectedBusinessId !== 'all' && (
                  <button
                    onClick={() => setSelectedBusinessId('all')}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    Showing specific brand <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500 space-y-3">
                  <Package className="mx-auto h-8 w-8 text-neutral-300" />
                  <p className="font-bold text-neutral-700 text-sm">No wholesale products found</p>
                  <p className="text-neutral-400 max-w-sm mx-auto">
                    Try relaxing your category or price filters, or search for another brand.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.slice(0, displayCount).map((product) => {
                      const isAdded = addedProductIds.has(product.id);
                      const business = businesses.find((b) => b.id === product.businessId);
                      const comm = getProductCommission(product, business);

                      return (
                        <div
                          key={product.id}
                          className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs transition-all hover:border-neutral-300 hover:shadow-md"
                        >
                          <div>
                            {/* Image Header */}
                            <div
                              onClick={() => onNavigate(`/product/${product.id}`)}
                              className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-neutral-100"
                            >
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Brand Badge Overlay */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-neutral-900 shadow-2xs">
                                  {product.brand}
                                </span>
                              </div>


                            </div>

                            {/* Body details */}
                            <div className="p-4 space-y-3">
                              {/* Supplier Header */}
                              {business && (
                                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                                  <div
                                    onClick={() => onNavigate(`/supplier/${business.id}`)}
                                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                  >
                                    <img src={business.logoUrl} alt={business.businessName} className="h-5 w-5 rounded-md object-cover" />
                                    <span className="text-[11px] font-bold text-neutral-700 truncate max-w-[120px]">
                                      {business.businessName}
                                    </span>
                                  </div>

                                  <button
                                    onClick={(e) => handleToggleFollow(business, e)}
                                    disabled={isProcessing}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                      isFollowing(business.id)
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                                  >
                                    {isFollowing(business.id) ? '✓ Following' : '+ Follow'}
                                  </button>
                                </div>
                              )}

                              <div
                                onClick={() => onNavigate(`/product/${product.id}`)}
                                className="cursor-pointer space-y-1"
                              >
                                <h3 className="font-bold text-neutral-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                  {product.title}
                                </h3>

                                {/* Star Rating Summary */}
                                {(() => {
                                  const stats = storage.getRatingStatsForProduct(product.id);
                                  return (
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                                      <RatingStars rating={stats.averageRating} size="xs" />
                                      <span className="font-bold text-neutral-900">
                                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
                                      </span>
                                      <span className="text-[11px] text-neutral-400">
                                        ({stats.totalReviews})
                                      </span>
                                    </div>
                                  );
                                })()}

                                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                  {product.description}
                                </p>
                              </div>

                              {/* Price & Stock */}
                              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                                <div>
                                  <span className="text-[10px] text-neutral-400 block font-medium uppercase">Selling Price</span>
                                  <span className="text-base font-extrabold text-neutral-900 font-mono">
                                    {formatCurrency(product.price)}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Stock</span>
                                  <span
                                    className={`text-xs font-bold ${
                                      product.stock > 10
                                        ? 'text-emerald-700'
                                        : product.stock > 0
                                        ? 'text-amber-700'
                                        : 'text-red-700'
                                    }`}
                                  >
                                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                                  </span>
                                </div>
                              </div>

                              {/* Highlighted Reseller Commission */}
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
                                    💰
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Your Commission</span>
                                    <span className="text-xs font-black text-emerald-950">
                                      {comm.formattedAmount} <span className="font-semibold text-[10px] text-emerald-700">({comm.rateText})</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="p-4 pt-0">
                            {isAdded ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleAddProduct(product.id)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                                >
                                  <Check className="h-4 w-4 text-emerald-600" /> Already Added
                                </button>
                                <button
                                  onClick={() => handleOpenPresentationModal(product.id)}
                                  className="rounded-xl border border-neutral-200 bg-neutral-100 p-2 text-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
                                  title="Edit Cover Image & Presentation Settings"
                                >
                                  <SlidersHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggleAddProduct(product.id)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-emerald-400" /> Add to My Store
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Pagination */}
                  {displayCount < filteredProducts.length && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setDisplayCount((prev) => prev + 12)}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 text-emerald-600" /> Load More Products ({filteredProducts.length - displayCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 3: RESELLER PRESENTATION CUSTOMIZER DRAWER */}
      {presentationSp && (
        <Modal
          isOpen={!!presentationSp}
          onClose={() => setPresentationSp(null)}
          title="Reseller Presentation Settings"
          maxWidth="lg"
        >
          {(() => {
            const product = storage.getProductById(presentationSp.productId);
            if (!product) return null;

            return (
              <div className="space-y-5 text-xs text-neutral-800">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={presentationSp.customCoverImage || product.images[0]} alt={product.title} className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-neutral-900">{product.title}</h4>
                    <p className="text-[11px] font-mono text-neutral-500">{formatCurrency(product.price)} • Managed by {product.brand}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-blue-900">
                  <span className="font-bold">Presentation Only:</span> Choose cover image, collection placement, and storefront visibility. Title, price, and stock remain synced from supplier.
                </div>

                {/* Cover Image Selection */}
                <div className="space-y-2">
                  <label className="block font-bold text-neutral-900">Select Storefront Cover Photo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.map((img, i) => {
                      const isSelected = (presentationSp.customCoverImage || product.images[0]) === img;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            storage.updateStorefrontProduct(presentationSp.id, { customCoverImage: img });
                            setPresentationSp({ ...presentationSp, customCoverImage: img });
                          }}
                          className={`relative aspect-square cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <img src={img} alt={`Cover option ${i}`} className="h-full w-full object-cover" />
                          {isSelected && (
                            <span className="absolute top-1 right-1 rounded-full bg-emerald-600 p-1 text-white shadow-xs">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Collections Assignment */}
                <div className="space-y-2">
                  <label className="block font-bold text-neutral-900">Assign to Collections</label>
                  {collections.length === 0 ? (
                    <p className="text-neutral-400 text-xs">No collections created yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {collections.map((col) => {
                        const isAssigned = presentationSp.collectionIds.includes(col.id);
                        return (
                          <label key={col.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...presentationSp.collectionIds, col.id]
                                  : presentationSp.collectionIds.filter((id) => id !== col.id);
                                storage.updateStorefrontProduct(presentationSp.id, { collectionIds: updated });
                                setPresentationSp({ ...presentationSp, collectionIds: updated });
                              }}
                              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <span className="font-semibold text-neutral-800">{col.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Storefront Visibility */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200">
                  <div>
                    <span className="font-bold text-neutral-900 block">Storefront Visibility</span>
                    <span className="text-[11px] text-neutral-500">Toggle whether buyers can view this item</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextVis = !presentationSp.isVisible;
                      storage.updateStorefrontProduct(presentationSp.id, { isVisible: nextVis });
                      setPresentationSp({ ...presentationSp, isVisible: nextVis });
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      presentationSp.isVisible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {presentationSp.isVisible ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setPresentationSp(null)}
                    className="rounded-xl bg-neutral-900 px-5 py-2 font-bold text-white shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unfollow Confirmation Modal */}
      <UnfollowConfirmModal
        isOpen={!!unfollowTarget}
        onClose={cancelUnfollow}
        onConfirm={confirmUnfollow}
        business={unfollowTarget as any}
        isProcessing={isProcessing}
      />

      {/* Unauthenticated Feature Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        onNavigate={onNavigate || (() => {})}
        actionText={authPromptAction}
      />
    </div>
  );
}
