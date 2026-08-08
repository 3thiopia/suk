import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Star,
  MapPin,
  Globe,
  Phone,
  Mail,
  Share2,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  Plus,
  Check,
  ExternalLink,
  ArrowLeft,
  Package,
  Clock,
  ShoppingBag,
  Eye,
  Award,
  Calendar,
  Layers,
  TrendingUp,
  Tag,
  X,
  ChevronRight,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { BusinessProfile, Product } from '../../types';
import { getProductCommission } from '../../lib/commission';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { useFollow } from '../../hooks/useFollow';
import { UnfollowConfirmModal } from '../common/UnfollowConfirmModal';

interface SupplierProfilePageProps {
  businessId?: string;
  onNavigate?: (path: string, params?: any) => void;
  onBack?: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest_commission' | 'lowest_price' | 'highest_price' | 'popular';
type PriceFilter = 'all' | 'under_50' | '50_150' | '150_300' | 'over_300';
type CommissionFilter = 'all' | '10' | '15' | '20' | '25';
type StockFilter = 'all' | 'in_stock' | 'out_of_stock';
type ActiveTab = 'products' | 'about' | 'contact';

export function SupplierProfilePage({ businessId, onNavigate, onBack }: SupplierProfilePageProps) {
  const { t } = useTranslation();
  const currentUser = storage.getCurrentUser();

  // Resolve business profile
  const businesses = storage.getBusinesses();
  const targetBusiness = businessId
    ? businesses.find((b) => b.id === businessId || b.slug === businessId)
    : businesses[0];

  const business: BusinessProfile = targetBusiness || businesses[0];
  const ownerUser = storage.getUsers().find((u) => u.id === business?.ownerId);

  // Reseller Storefront state
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  // Followers state hook for reactive real-time updates
  const {
    isFollowing: checkIsFollowing,
    handleToggleFollow: toggleFollowHook,
    unfollowTarget,
    confirmUnfollow,
    cancelUnfollow,
    isProcessing,
    toastMessage: followToastMessage,
  } = useFollow();

  const followingState = checkIsFollowing(business?.id || '');
  const currentBusinessProfile = storage.getBusinessById(business?.id || '') || business;
  const followerCount = currentBusinessProfile?.followerCount || 0;

  // Added storefront products set
  const storefrontProducts = storefront ? storage.getStorefrontProductsWithDetails(storefront.id) : [];
  const addedProductIds = useMemo(
    () => new Set(storefrontProducts.map((sp) => sp.productId)),
    [storefrontProducts]
  );

  // Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Product Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [commissionFilter, setCommissionFilter] = useState<CommissionFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Quick View / Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Toggle Follow
  const handleToggleFollow = (e?: React.MouseEvent) => {
    if (!business) return;
    toggleFollowHook(business, e);
  };

  // Share Profile
  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('supplier.linkCopied', 'Supplier profile link copied to clipboard!'));
    } else {
      showToast(t('supplier.linkCopied', 'Profile shared successfully!'));
    }
  };

  // Add / Remove from Storefront
  const handleToggleStorefrontProduct = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!storefront) return;

    if (addedProductIds.has(prod.id)) {
      storage.removeProductFromStorefront(storefront.id, prod.id);
      showToast(t('marketplace.removedFromStore', 'Product removed from your storefront'));
    } else {
      storage.addProductToStorefront(storefront.id, prod.id);
      showToast(t('marketplace.addedToStore', 'Product added to your storefront!'));
    }
  };

  // Fetch all products for this business
  const allSupplierProducts = useMemo(() => {
    if (!business) return [];
    return storage.getProductsByBusinessId(business.id).filter((p) => !p.isHidden);
  }, [business]);

  // Categories extracted from supplier's products
  const supplierCategories = useMemo(() => {
    const set = new Set(allSupplierProducts.map((p) => p.category));
    return Array.from(set);
  }, [allSupplierProducts]);

  // Featured Products
  const featuredProducts = useMemo(() => {
    return allSupplierProducts.slice(0, 3);
  }, [allSupplierProducts]);

  // Orders statistics for supplier
  const supplierOrdersCount = useMemo(() => {
    if (!business) return 0;
    return storage.getOrdersByBusinessOwner(business.id).length;
  }, [business]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return allSupplierProducts
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesCategory = p.category.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCategory && !matchesBrand && !matchesTags) return false;
        }

        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Stock Filter
        if (stockFilter === 'in_stock' && p.stock <= 0) return false;
        if (stockFilter === 'out_of_stock' && p.stock > 0) return false;

        // Price Filter
        if (priceFilter === 'under_50' && p.price >= 50) return false;
        if (priceFilter === '50_150' && (p.price < 50 || p.price > 150)) return false;
        if (priceFilter === '150_300' && (p.price < 150 || p.price > 300)) return false;
        if (priceFilter === 'over_300' && p.price <= 300) return false;

        // Commission Filter
        const commObj = getProductCommission(p, business);
        const commPct = p.price > 0 ? (commObj.amount / p.price) * 100 : 0;
        if (commissionFilter === '10' && commPct < 10) return false;
        if (commissionFilter === '15' && commPct < 15) return false;
        if (commissionFilter === '20' && commPct < 20) return false;
        if (commissionFilter === '25' && commPct < 25) return false;

        return true;
      })
      .sort((a, b) => {
        const commA = getProductCommission(a, business).amount;
        const commB = getProductCommission(b, business).amount;

        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'highest_commission':
            return commB - commA;
          case 'lowest_price':
            return a.price - b.price;
          case 'highest_price':
            return b.price - a.price;
          case 'popular':
            return b.stock - a.stock;
          default:
            return 0;
        }
      });
  }, [
    allSupplierProducts,
    searchQuery,
    selectedCategory,
    priceFilter,
    commissionFilter,
    stockFilter,
    sortBy,
    business,
  ]);

  if (!business) {
    return (
      <div className="p-8 text-center">
        <EmptyState
          icon={Building2}
          title="Supplier Not Found"
          description="The supplier profile you are trying to view does not exist or has been removed."
          actionLabel="Return to Marketplace"
          onAction={() => onNavigate && onNavigate('/reseller/marketplace')}
        />
      </div>
    );
  }

  const joinYear = new Date(business.createdAt).getFullYear();
  const activeProductsCount = allSupplierProducts.filter((p) => p.status === 'active' && p.stock > 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-neutral-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in border border-neutral-700">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (onBack ? onBack() : onNavigate && onNavigate('/reseller/marketplace'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('common.back', 'Back to Marketplace')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareProfile}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5 text-neutral-500" />
            <span>{t('common.share', 'Share')}</span>
          </button>
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
            >
              <Globe className="h-3.5 w-3.5 text-neutral-500" />
              <span className="hidden sm:inline">{t('common.website', 'Website')}</span>
            </a>
          )}
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-neutral-900 overflow-hidden">
          <img
            src={business.bannerUrl}
            alt={business.businessName}
            className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

          {/* Top Banner Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {business.isVerified !== false && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-md shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Supplier
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" /> {business.category}
            </span>
          </div>
        </div>

        {/* Hero Content Area with Overlapping Logo */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Overlapping Logo */}
            <div className="flex items-end gap-4">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                <img
                  src={business.logoUrl}
                  alt={business.businessName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                    {business.businessName}
                  </h1>
                  {business.isVerified !== false && (
                    <span title="Verified Brand Owner" className="inline-flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  {business.tagline || business.category} • Member since {joinYear}
                </p>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-end">
              <button
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-sm transition-all ${
                  followingState
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {followingState ? (
                  <>
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>{t('supplier.following', 'Following')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>{t('supplier.follow', 'Follow Supplier')}</span>
                  </>
                )}
              </button>

              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t('supplier.visitStore', 'Visit Website')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Description & Quick Highlights */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-4xl">
              {business.description}
            </p>

            {/* Tags / Specialties */}
            {business.specialties && business.specialties.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Specialties:
                </span>
                {business.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200/60"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BUSINESS STATISTICS HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Package className="h-4 w-4" />
          </div>
          <p className="text-xl font-black text-neutral-900">{allSupplierProducts.length}</p>
          <p className="text-[11px] font-semibold text-neutral-500">Total Products</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-xl font-black text-neutral-900">{activeProductsCount}</p>
          <p className="text-[11px] font-semibold text-neutral-500">Active In Stock</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <UserCheck className="h-4 w-4" />
          </div>
          <p className="text-xl font-black text-neutral-900">{followerCount}</p>
          <p className="text-[11px] font-semibold text-neutral-500">Creator Followers</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-xl font-black text-neutral-900">{supplierOrdersCount}</p>
          <p className="text-[11px] font-semibold text-neutral-500">Orders Fulfilled</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
          </div>
          <p className="text-xl font-black text-neutral-900">{business.rating || 4.9} / 5.0</p>
          <p className="text-[11px] font-semibold text-neutral-500">Supplier Rating</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-2xs">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-xl font-black text-neutral-900">
            {new Date().getFullYear() - joinYear || 1}+ Yrs
          </p>
          <p className="text-[11px] font-semibold text-neutral-500">Platform Tenure</p>
        </div>
      </div>

      {/* FEATURED PRODUCTS SECTION (IF AVAILABLE) */}
      {featuredProducts.length > 0 && (
        <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-white to-neutral-50 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Featured Brand Products</h2>
                <p className="text-[11px] text-neutral-500">Hand-picked top margin items from this supplier</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              High Commission Opportunity
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((prod) => {
              const comm = getProductCommission(prod, business);
              const isAdded = addedProductIds.has(prod.id);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (onNavigate) onNavigate(`/product/${prod.id}`);
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md flex gap-3.5 items-center"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {prod.category}
                    </span>
                    <h4 className="font-bold text-xs text-neutral-900 truncate group-hover:text-emerald-700">
                      {prod.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-neutral-900">
                        {formatCurrency(prod.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                        +{formatCurrency(comm.amount)} ({comm.rateText})
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-neutral-500">
                        {prod.stock > 0 ? `Stock: ${prod.stock}` : 'Out of Stock'}
                      </span>

                      <button
                        onClick={(e) => handleToggleStorefrontProduct(prod, e)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3 w-3" /> In Store
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION NAVIGATION TABS */}
      <div className="flex items-center border-b border-neutral-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Catalog ({allSupplierProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'about'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>About Supplier</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>Business Info & Social</span>
        </button>
      </div>

      {/* TAB CONTENT: PRODUCTS & CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products by name, tag, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sorting & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Categories ({supplierCategories.length})</option>
                  {supplierCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Stock Filter */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 focus:bg-white focus:outline-none"
                >
                  <option value="all">Stock: All</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                {/* Price Filter */}
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 focus:bg-white focus:outline-none"
                >
                  <option value="all">Price: All</option>
                  <option value="under_50">Under $50</option>
                  <option value="50_150">$50 - $150</option>
                  <option value="150_300">$150 - $300</option>
                  <option value="over_300">Over $300</option>
                </select>

                {/* Commission Filter */}
                <select
                  value={commissionFilter}
                  onChange={(e) => setCommissionFilter(e.target.value as CommissionFilter)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 focus:bg-white focus:outline-none"
                >
                  <option value="all">Commission: All</option>
                  <option value="10">10%+ Commission</option>
                  <option value="15">15%+ Commission</option>
                  <option value="20">20%+ Commission</option>
                  <option value="25">25%+ Commission</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-xl border border-neutral-200 bg-neutral-900 px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="highest_commission">Sort: Highest Commission</option>
                  <option value="lowest_price">Sort: Price (Low to High)</option>
                  <option value="highest_price">Sort: Price (High to Low)</option>
                  <option value="popular">Sort: Most Stocked</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>
            </div>

            {/* Results count & active filters reset */}
            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100">
              <span>
                Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> of{' '}
                {allSupplierProducts.length} products
              </span>
              {(searchQuery ||
                selectedCategory !== 'all' ||
                priceFilter !== 'all' ||
                commissionFilter !== 'all' ||
                stockFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceFilter('all');
                    setCommissionFilter('all');
                    setStockFilter('all');
                  }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products Match Filters"
              description="Try adjusting your search terms or filters to browse this supplier's catalog."
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceFilter('all');
                setCommissionFilter('all');
                setStockFilter('all');
              }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const commission = getProductCommission(product, business);
                const isAdded = addedProductIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md"
                  >
                    {/* Image Area */}
                    <div
                      onClick={() => {
                        if (onNavigate) onNavigate(`/product/${product.id}`);
                      }}
                      className="relative h-48 w-full cursor-pointer overflow-hidden bg-neutral-100"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                      {/* Stock Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold shadow-xs backdrop-blur-md ${
                            product.stock > 0
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-rose-500/90 text-white'
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* View Details Button on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-900 shadow-md backdrop-blur-xs">
                          <Eye className="h-3.5 w-3.5 text-emerald-600" /> View Details
                        </span>
                      </div>
                    </div>

                    {/* Details Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        <span>{product.brand}</span>
                      </div>

                      <h3
                        onClick={() => {
                          if (onNavigate) onNavigate(`/product/${product.id}`);
                        }}
                        className="font-bold text-sm text-neutral-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {product.title}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pricing & Commission Card */}
                      <div className="my-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-neutral-500">Retail Price:</span>
                          <span className="text-xs font-extrabold text-neutral-900">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50">
                          <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                            💰 Your Commission:
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            +{formatCurrency(commission.amount)} ({commission.rateText})
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onNavigate) onNavigate(`/product/${product.id}`);
                          }}
                          className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 py-2 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          Details
                        </button>

                        <button
                          onClick={(e) => handleToggleStorefrontProduct(product, e)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold shadow-2xs transition-all ${
                            isAdded
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-neutral-900 text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-white" /> In Store
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" /> Add to Store
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT SUPPLIER */}
      {activeTab === 'about' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Story & Mission */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Company Story & Background
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {business.story ||
                  `${business.businessName} was established in ${business.yearEstablished || joinYear} with a mission to design and supply high-quality ${business.category.toLowerCase()} products. Operating with direct wholesale supply chains, ${business.businessName} partners with independent creators to distribute verified products worldwide.`}
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Our Mission & Creator Promise
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {business.mission ||
                  `To manufacture premium quality goods, provide auto-synced real-time inventory levels, and guarantee attractive creator margins with prompt monthly payouts.`}
              </p>
            </div>

            {/* Highlights */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900">Supplier Highlights</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 space-y-1">
                  <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Brand Ownership
                  </span>
                  <p className="text-xs text-neutral-500">
                    Officially vetted business credentials and quality checks.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 space-y-1">
                  <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" /> Auto Stock & Price Sync
                  </span>
                  <p className="text-xs text-neutral-500">
                    Updates to prices or inventory levels automatically reflect on your storefront.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 space-y-1">
                  <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-purple-600" /> High Creator Margins
                  </span>
                  <p className="text-xs text-neutral-500">
                    Default commission rate starting at {business.defaultCommissionRate || 20}%.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 space-y-1">
                  <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-600" /> Fast Order Fulfillment
                  </span>
                  <p className="text-xs text-neutral-500">
                    Orders processed and shipped within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: At a Glance Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-3">
                Supplier At a Glance
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Brand Name:</span>
                  <span className="font-bold text-neutral-900">{business.businessName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Category:</span>
                  <span className="font-bold text-neutral-900">{business.category}</span>
                </div>

                {ownerUser && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Owner / Representative:</span>
                    <span className="font-bold text-neutral-900">{ownerUser.name.split('(')[0]}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Established:</span>
                  <span className="font-bold text-neutral-900">
                    {business.yearEstablished || joinYear}
                  </span>
                </div>

                {business.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Location:</span>
                    <span className="font-bold text-neutral-900">
                      {business.city}, {business.country || 'USA'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Default Commission:</span>
                  <span className="font-extrabold text-emerald-700">
                    {business.defaultCommissionRate || 20}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Verification:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100" /> Verified
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <button
                  onClick={handleToggleFollow}
                  className={`w-full rounded-xl py-2.5 text-xs font-extrabold transition-colors ${
                    followingState
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {followingState ? 'Following Supplier' : 'Follow Supplier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTACT & SOCIAL MEDIA */}
      {activeTab === 'contact' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Public Contact Information
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5">
                <Building2 className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">{business.businessName}</p>
                  <p className="text-neutral-500">{business.tagline || business.category}</p>
                </div>
              </div>

              {business.phone && (
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-500 text-[10px]">BUSINESS PHONE</p>
                    <a
                      href={`tel:${business.phone}`}
                      className="font-bold text-neutral-900 hover:text-emerald-700"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {(business.email || ownerUser?.email) && (
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5">
                  <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-500 text-[10px]">SUPPLIER EMAIL</p>
                    <a
                      href={`mailto:${business.email || ownerUser?.email}`}
                      className="font-bold text-neutral-900 hover:text-blue-700"
                    >
                      {business.email || ownerUser?.email}
                    </a>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5">
                  <Globe className="h-4 w-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-500 text-[10px]">OFFICIAL WEBSITE</p>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-neutral-900 hover:text-purple-700 flex items-center gap-1"
                    >
                      {business.website} <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </div>
                </div>
              )}

              {business.address && (
                <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5">
                  <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-500 text-[10px]">HQ ADDRESS</p>
                    <p className="font-bold text-neutral-900">
                      {business.address}, {business.city}, {business.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Media Channels */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Official Social Media Channels
            </h3>
            <p className="text-xs text-neutral-500">
              Connect with {business.businessName} on official social platforms.
            </p>

            {/* Social Links Grid */}
            <div className="space-y-2.5">
              {business.socialLinks?.facebook && (
                <a
                  href={business.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                      f
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-blue-600">
                        Facebook
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.facebook}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-blue-600" />
                </a>
              )}

              {business.socialLinks?.instagram && (
                <a
                  href={business.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-black text-sm">
                      ig
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-rose-600">
                        Instagram
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.instagram}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-rose-600" />
                </a>
              )}

              {business.socialLinks?.x && (
                <a
                  href={business.socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white font-black text-sm">
                      X
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-neutral-700">
                        X (Twitter)
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.x}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900" />
                </a>
              )}

              {business.socialLinks?.telegram && (
                <a
                  href={business.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white font-black text-sm">
                      tg
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-sky-600">
                        Telegram Channel
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.telegram}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-sky-600" />
                </a>
              )}

              {business.socialLinks?.youtube && (
                <a
                  href={business.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm">
                      yt
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-red-600">
                        YouTube Channel
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.youtube}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-red-600" />
                </a>
              )}

              {business.socialLinks?.linkedin && (
                <a
                  href={business.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 hover:bg-neutral-50 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white font-black text-sm">
                      in
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-blue-700">
                        LinkedIn
                      </p>
                      <p className="text-[11px] text-neutral-500">{business.socialLinks.linkedin}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-blue-700" />
                </a>
              )}

              {(!business.socialLinks ||
                Object.values(business.socialLinks).filter(Boolean).length === 0) && (
                <p className="text-xs text-neutral-400 italic py-4 text-center">
                  No social media channels configured by this supplier yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 sm:hidden flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <img
            src={business.logoUrl}
            alt={business.businessName}
            className="h-9 w-9 rounded-xl object-cover border border-neutral-200"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-neutral-900 truncate">{business.businessName}</h4>
            <p className="text-[10px] text-neutral-500">{followerCount} Followers</p>
          </div>
        </div>

        <button
          onClick={handleToggleFollow}
          className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all shrink-0 ${
            followingState
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-neutral-900 text-white'
          }`}
        >
          {followingState ? 'Following' : '+ Follow'}
        </button>
      </div>

      {/* Toast Notification */}
      {(toastMessage || followToastMessage) && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage || followToastMessage}</span>
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
    </div>
  );
}
