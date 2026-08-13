import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Package,
  Plus,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  UserCheck,
  UserPlus,
  ChevronRight,
  Store,
  Tag,
  ZoomIn,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Product, BusinessProfile } from '../../types';
import { getProductCommission } from '../../lib/commission';
import { formatCurrency } from '../../lib/utils';
import { useFollow } from '../../hooks/useFollow';
import { UnfollowConfirmModal } from '../common/UnfollowConfirmModal';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { ProductReviewsList } from '../common/ProductReviewsList';
import { RatingStars } from '../common/RatingStars';

interface ProductDetailPageProps {
  productId?: string;
  onNavigate: (path: string, params?: any) => void;
  onBack?: () => void;
}

export function ProductDetailPage({ productId, onNavigate, onBack }: ProductDetailPageProps) {
  const { t } = useTranslation();
  const currentUser = storage.getCurrentUser();

  // Resolve product
  const product: Product | undefined = useMemo(() => {
    if (!productId) return undefined;
    return storage.getProductById(productId);
  }, [productId]);

  // Resolve supplier business
  const business: BusinessProfile | undefined = useMemo(() => {
    if (!product) return undefined;
    return storage.getBusinessById(product.businessId);
  }, [product]);

  const ownerUser = useMemo(() => {
    if (!business) return undefined;
    return storage.getUsers().find((u) => u.id === business.ownerId);
  }, [business]);

  // Reseller Storefront state
  const storefront = storage.getStorefrontByResellerId(currentUser.id);
  const storefrontProducts = storefront ? storage.getStorefrontProductsWithDetails(storefront.id) : [];
  const isAddedToStore = useMemo(() => {
    if (!product) return false;
    return storefrontProducts.some((sp) => sp.productId === product.id);
  }, [storefrontProducts, product]);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Follow hook
  const {
    isFollowing,
    handleToggleFollow,
    unfollowTarget,
    confirmUnfollow,
    cancelUnfollow,
    isProcessing,
    toastMessage: followToastMessage,
  } = useFollow();

  // Related products from the same supplier
  const relatedProducts = useMemo(() => {
    if (!product || !business) return [];
    return storage
      .getProductsByBusinessId(business.id)
      .filter((p) => p.id !== product.id && p.status === 'active' && !p.isHidden)
      .slice(0, 4);
  }, [product, business]);

  // Toggle Storefront Product
  const handleToggleStorefront = () => {
    if (!product || !storefront) return;

    if (isAddedToStore) {
      storage.removeProductFromStorefront(storefront.id, product.id);
      showToast(t('marketplace.removedFromStore', 'Product removed from your storefront'));
    } else {
      storage.addProductToStorefront(storefront.id, product.id);
      showToast(t('marketplace.addedToStore', 'Product added to your storefront!'));
    }
  };

  // Share Product
  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    } else {
      showToast('Product shared!');
    }
  };

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <EmptyState
          icon={Package}
          title="Product Not Found"
          description="The product you are looking for does not exist or has been unlisted by the supplier."
          actionLabel="Return to Marketplace"
          onAction={() => onNavigate('/reseller/marketplace')}
        />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];
  const activeImage = images[selectedImageIndex] || images[0];
  const commission = getProductCommission(product, business);
  const ownerName = ownerUser ? ownerUser.name.split('(')[0].trim() : 'Business Owner';

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {(toastMessage || followToastMessage) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-neutral-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in border border-neutral-700">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage || followToastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb & Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 overflow-x-auto">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : onNavigate('/reseller/marketplace'))}
            className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </button>
          <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
          {business && (
            <>
              <button
                type="button"
                onClick={() => onNavigate(`/supplier/${business.id}`)}
                className="hover:text-neutral-900 transition-colors shrink-0 font-bold text-neutral-700"
              >
                {business.businessName}
              </button>
              <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
            </>
          )}
          <span className="text-neutral-900 font-bold truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareProduct}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 text-neutral-500" />
            <span>Share</span>
          </button>
          {business && (
            <button
              type="button"
              onClick={() => onNavigate(`/supplier/${business.id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Store className="h-3.5 w-3.5 text-emerald-600" />
              <span>Supplier Store</span>
            </button>
          )}
        </div>
      </div>

      {/* PRODUCT MAIN DETAILS GRID */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image Stage */}
            <div
              className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 transition-all ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              } h-[380px] sm:h-[450px] w-full flex items-center justify-center`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activeImage}
                alt={product.title}
                className={`h-full w-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'hover:scale-105'
                }`}
              />

              <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                <ZoomIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isZoomed ? 'Click to zoom out' : 'Click to zoom'}</span>
              </div>

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-md">
                  {product.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-extrabold backdrop-blur-md ${
                    product.stock > 0
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Commission Action (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Brand */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                  {product.brand || business?.businessName || 'Brand Owner'}
                </span>
                <span className="text-neutral-400 font-medium">SKU: #{product.id.slice(-6).toUpperCase()}</span>
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-neutral-900 leading-tight">
                  {product.title}
                </h1>
                {(() => {
                  const stats = storage.getRatingStatsForProduct(product.id);
                  return (
                    <div className="flex items-center gap-2 mt-2">
                      <RatingStars rating={stats.averageRating} size="sm" />
                      <span className="text-xs font-bold text-neutral-900">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        ({stats.totalReviews} customer {stats.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Pricing & Net Reseller Commission Box */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white p-5 shadow-2xs space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-neutral-600">Suggested Retail Price:</span>
                  <span className="text-2xl font-black text-neutral-900">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <div className="border-t border-emerald-200/80 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      Your Reseller Commission:
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium block">
                      Net profit per sale ({commission.rateText})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">
                      +{formatCurrency(commission.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Status Details */}
              <div className="rounded-xl bg-neutral-50 p-3.5 border border-neutral-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-700 font-medium">
                  <Package className="h-4 w-4 text-neutral-500" />
                  <span>Available Inventory:</span>
                </div>
                <span className="font-extrabold text-neutral-900">
                  {product.stock > 0 ? `${product.stock} units ready to ship` : 'Currently Out of Stock'}
                </span>
              </div>

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <Tag className="h-3.5 w-3.5 text-neutral-400" />
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Main Action Button */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleToggleStorefront}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-xs font-black shadow-md transition-all cursor-pointer ${
                  isAddedToStore
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-900/20'
                }`}
              >
                {isAddedToStore ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Your Storefront (Click to Remove)
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add to My Reseller Storefront
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPLIER CARD SECTION */}
      {business && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={business.logoUrl}
                alt={business.businessName}
                className="h-16 w-16 rounded-2xl object-cover border border-neutral-200 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-neutral-900">{business.businessName}</h3>
                  {business.isVerified !== false && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" /> Verified Brand
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Owner: {ownerName} • Category: {business.category}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {business.followerCount} Reseller Followers • Response Time: &lt; 2 hours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={(e) => handleToggleFollow(business, e)}
                disabled={isProcessing}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all shadow-2xs cursor-pointer ${
                  isFollowing(business.id)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {isFollowing(business.id) ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Follow Supplier</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`/supplier/${business.id}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                <span>Visit Supplier Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT REVIEWS & FEEDBACK */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ProductReviewsList
          productId={product.id}
          businessId={product.businessId}
          isCreator={true}
          storefrontId={storefront?.id}
          onRemoveFromStorefront={
            isAddedToStore
              ? () => {
                  if (storefront) {
                    storage.removeProductFromStorefront(storefront.id, product.id);
                    showToast('Product removed from your storefront');
                  }
                }
              : undefined
          }
        />
      </div>

      {/* RELATED PRODUCTS FROM SAME SUPPLIER */}
      {relatedProducts.length > 0 && business && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                More Products from {business.businessName}
              </h3>
              <p className="text-xs text-neutral-500">
                Explore additional products offered by this brand owner
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(`/supplier/${business.id}`)}
              className="text-xs font-bold text-neutral-900 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Catalog</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relProd) => {
              const relComm = getProductCommission(relProd, business);
              const isRelAdded = storefrontProducts.some((sp) => sp.productId === relProd.id);

              return (
                <div
                  key={relProd.id}
                  onClick={() => onNavigate(`/product/${relProd.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={relProd.images[0]}
                        alt={relProd.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 right-2.5 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        +{formatCurrency(relComm.amount)}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {relProd.category}
                      </span>
                      <h4 className="font-bold text-xs text-neutral-900 truncate group-hover:text-emerald-700">
                        {relProd.title}
                      </h4>
                      <p className="text-xs font-extrabold text-neutral-900">
                        {formatCurrency(relProd.price)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (storefront) {
                          if (isRelAdded) {
                            storage.removeProductFromStorefront(storefront.id, relProd.id);
                            showToast('Removed from store');
                          } else {
                            storage.addProductToStorefront(storefront.id, relProd.id);
                            showToast('Added to store!');
                          }
                        }
                      }}
                      className={`w-full inline-flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold transition-all cursor-pointer ${
                        isRelAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {isRelAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {isRelAdded ? 'In Store' : 'Add to Store'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
