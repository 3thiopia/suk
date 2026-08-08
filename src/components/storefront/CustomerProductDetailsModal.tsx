import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  Share2,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Tag,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Lock,
  Package,
  Award,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorefrontProduct, Product, StorefrontCustomization } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ProductReviewsList } from '../common/ProductReviewsList';
import {
  getDefaultCustomization,
  getFontStyle,
  getButtonBorderRadius,
  getCardBorderRadius,
  getContrastTextColor,
  FONT_OPTIONS,
} from '../../lib/customizationDefaults';

interface CustomerProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storefrontProduct: StorefrontProduct;
  allStorefrontProducts?: StorefrontProduct[];
  onSelectRelatedProduct?: (sp: StorefrontProduct) => void;
  onAddToCart?: (
    product: Product,
    selectedCoverImage: string,
    storefrontProductId: string,
    quantity?: number
  ) => void;
  customization?: StorefrontCustomization;
  inCartQuantity?: number;
}

export function CustomerProductDetailsModal({
  isOpen,
  onClose,
  storefrontProduct,
  allStorefrontProducts = [],
  onSelectRelatedProduct,
  onAddToCart,
  customization,
  inCartQuantity = 0,
}: CustomerProductDetailsModalProps) {
  const product = storefrontProduct.product;

  const fullCustomization = getDefaultCustomization(customization);
  const { colors, typography, buttons, cards } = fullCustomization;

  const fontHeadingStyle = getFontStyle(typography.headingFont);
  const fontBodyStyle = getFontStyle(typography.bodyFont);

  const buttonRadius = getButtonBorderRadius(buttons.shape);
  const cardRadius = getCardBorderRadius(cards.borderRadius);
  const actionBtnBg = colors.button || colors.primary || '#0f172a';
  const actionBtnTextColor = getContrastTextColor(actionBtnBg, '#ffffff');

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

  // Prepare images list (reseller custom cover image if set, plus product images without duplicates)
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    if (storefrontProduct.customCoverImage) {
      set.add(storefrontProduct.customCoverImage);
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img) set.add(img);
      });
    }
    return Array.from(set);
  }, [product, storefrontProduct.customCoverImage]);

  // Session-only image selection & touch swiping
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Touch gesture state for swiping images on mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Body scroll lock & Escape key handling when full-screen view is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomModalOpen) {
          setIsZoomModalOpen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isZoomModalOpen, onClose]);

  // Reset states on product change or open
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setCopiedShare(false);
    setAddedToast(false);
  }, [storefrontProduct.id, isOpen]);

  if (!product) return null;

  const currentMainImage = allImages[selectedImageIndex] || allImages[0] || '';
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Related products from same category or storefront
  const relatedProducts = allStorefrontProducts.filter(
    (sp) => sp.id !== storefrontProduct.id && sp.product
  ).slice(0, 6);

  const handleShareProduct = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock || !onAddToCart) return;
    const coverToUse = storefrontProduct.customCoverImage || currentMainImage;
    onAddToCart(product, coverToUse, storefrontProduct.id, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 800);
  };

  // Touch swipe handlers
  const minSwipeDistance = 40;
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance && allImages.length > 1) {
      // Next image
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    } else if (distance < -minSwipeDistance && allImages.length > 1) {
      // Prev image
      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  // Specs map parsing
  const specsEntries = product.specifications
    ? Object.entries(product.specifications).filter(([k, v]) => k && v)
    : [];

  const defaultSpecs: [string, string][] = [
    ['Brand', product.brand],
    ['Category', product.category],
    ['Fulfilling Supplier', product.businessName || product.brand],
    ['Stock Status', isOutOfStock ? 'Out of Stock' : `${product.stock} units available`],
    ['Shipping', 'Standard Express Delivery Available'],
    ['Buyer Guarantee', '100% Authentic Brand Direct'],
  ];

  const displaySpecs = specsEntries.length > 0 ? specsEntries : defaultSpecs;

  return (
    <>
      {/* Full-Screen Native App Product Details Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden w-full h-full"
            style={{
              backgroundColor: colors.background || '#f8fafc',
              color: colors.text || '#334155',
              ...fontBodyStyle,
            }}
          >
            {/* STICKY TOP APP HEADER BAR */}
            <div
              className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md shadow-2xs shrink-0"
              style={{
                backgroundColor: `${colors.surface || '#ffffff'}f2`,
                borderColor: colors.border || '#e2e8f0',
              }}
            >
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold active:scale-95 transition-all min-h-[44px] min-w-[44px]"
                style={{
                  borderRadius: buttonRadius,
                  backgroundColor: `${actionBtnBg}15`,
                  color: colors.heading || '#0f172a',
                }}
                aria-label="Back to storefront"
              >
                <ChevronLeft className="h-5 w-5" style={{ color: colors.heading }} />
                <span>Back</span>
              </button>

              <div className="text-center px-2 flex flex-col items-center max-w-[200px] sm:max-w-md truncate">
                <span className="text-xs sm:text-sm font-black truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  {product.title}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
                  {product.brand}
                </span>
              </div>

              <button
                onClick={handleShareProduct}
                className="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]"
                style={{
                  borderRadius: buttonRadius,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                title="Share product link"
              >
                {copiedShare ? (
                  <>
                    <Check className="h-4 w-4" style={{ color: colors.primary }} />
                    <span className="font-bold hidden sm:inline" style={{ color: colors.primary }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 opacity-70" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>

            {/* FULL SCREEN SCROLLABLE CONTENT BODY */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
              <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 space-y-6">
                {/* 1. IMAGE GALLERY WITH SWIPE & PAGINATION DOTS */}
                <div className="space-y-3">
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="relative group overflow-hidden border aspect-square flex items-center justify-center select-none shadow-xs"
                    style={{
                      borderRadius: cardRadius,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <img
                      src={currentMainImage}
                      alt={product.title}
                      className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300"
                      onClick={() => setIsZoomModalOpen(true)}
                    />

                    {/* Left / Right Chevron Buttons */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white active:scale-95 transition-all"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white active:scale-95 transition-all"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Stock Tag Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span
                        className="rounded-md backdrop-blur-xs px-2.5 py-1 text-[11px] font-extrabold shadow-xs border"
                        style={{
                          backgroundColor: `${colors.surface}e6`,
                          borderColor: colors.border,
                          color: colors.heading,
                        }}
                      >
                        {product.brand}
                      </span>
                      {isOutOfStock ? (
                        <span
                          className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: colors.danger || '#ef4444' }}
                        >
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span
                          className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: colors.warning || '#f59e0b' }}
                        >
                          Only {product.stock} left
                        </span>
                      ) : (
                        <span
                          className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: colors.primary || '#059669' }}
                        >
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Zoom Overlay Button */}
                    <button
                      onClick={() => setIsZoomModalOpen(true)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 backdrop-blur-xs px-3 py-1.5 text-xs font-bold shadow-md border transition-all min-h-[38px]"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: `${colors.surface}e6`,
                        borderColor: colors.border,
                        color: colors.heading,
                      }}
                    >
                      <ZoomIn className="h-4 w-4" style={{ color: colors.heading }} />
                      <span>Zoom</span>
                    </button>

                    {/* Mobile Pagination Dots */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-xs">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === selectedImageIndex ? 'w-5 bg-white' : 'w-2 bg-white/50'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails Row */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                      {allImages.map((img, idx) => {
                        const isSelected = idx === selectedImageIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className="relative h-16 w-16 shrink-0 overflow-hidden border transition-all"
                            style={{
                              borderRadius: buttonRadius,
                              borderColor: isSelected ? colors.primary : colors.border,
                              boxShadow: isSelected ? `0 0 0 2px ${colors.primary}33` : 'none',
                              opacity: isSelected ? 1 : 0.6,
                            }}
                          >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. PRODUCT TITLE */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    {product.title}
                  </h1>
                </div>

                {/* 3. PRICE & QUANTITY SELECTOR */}
                <div
                  className="flex items-center justify-between p-4 border shadow-2xs"
                  style={{
                    borderRadius: cardRadius,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70" style={{ color: colors.text }}>
                      Total Price
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: colors.heading, ...fontHeadingStyle }}>
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>

                  {/* Quantity Selector */}
                  {!isOutOfStock && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold hidden sm:inline" style={{ color: colors.text }}>Qty:</span>
                      <div
                        className="flex items-center border p-1 shadow-2xs"
                        style={{
                          borderRadius: buttonRadius,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        }}
                      >
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="rounded-lg p-2 disabled:opacity-30 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 transition-all"
                          style={{ color: colors.heading }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-black" style={{ color: colors.heading }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={quantity >= product.stock}
                          className="rounded-lg p-2 disabled:opacity-30 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 transition-all"
                          style={{ color: colors.heading }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. BRAND & CATEGORY */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 border"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: `${colors.primary}18`,
                      borderColor: `${colors.primary}33`,
                      color: colors.primary,
                    }}
                  >
                    Brand: {product.brand}
                  </span>
                  <span
                    className="text-xs font-medium px-3 py-1 border"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  >
                    Category: {product.category}
                  </span>
                  {product.subcategory && (
                    <span
                      className="text-xs font-medium px-3 py-1 border"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >
                      Subcategory: {product.subcategory}
                    </span>
                  )}
                </div>

                {/* 5. STOCK AVAILABILITY & DIRECT GUARANTEE */}
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between text-xs p-3.5 border"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <span className="font-bold" style={{ color: colors.heading }}>Availability Status</span>
                    <span
                      className="font-black"
                      style={{ color: isOutOfStock ? colors.danger || '#ef4444' : colors.primary || '#059669' }}
                    >
                      {isOutOfStock ? 'Out of Stock' : `${product.stock} units ready to ship`}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2.5 text-xs p-3.5 border"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: `${colors.primary}10`,
                      borderColor: `${colors.primary}25`,
                      color: colors.text,
                    }}
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: colors.primary }} />
                    <span>
                      Fulfilled directly by <strong className="font-bold" style={{ color: colors.heading }}>{product.businessName || product.brand}</strong> with authentic brand warranty.
                    </span>
                  </div>
                </div>

                {/* 6. PRODUCT DESCRIPTION */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.text }}>
                    {product.description}
                  </p>
                </div>

                {/* 7. PRODUCT SPECIFICATIONS */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    Specifications & Details
                  </h3>
                  <div
                    className="border overflow-hidden text-xs divide-y"
                    style={{
                      borderRadius: cardRadius,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      divideColor: colors.border,
                    }}
                  >
                    {displaySpecs.map(([label, val], idx) => (
                      <div key={idx} className="grid grid-cols-3 px-3.5 py-3 transition-colors">
                        <span className="font-semibold opacity-70" style={{ color: colors.text }}>{label}</span>
                        <span className="col-span-2 font-medium" style={{ color: colors.heading }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. PRODUCT REVIEWS & RATINGS */}
                <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                  <ProductReviewsList
                    productId={product.id}
                    businessId={product.businessId}
                  />
                </div>

                {/* 9. RELATED PRODUCTS (Horizontal Scroll Carousel) */}
                {relatedProducts.length > 0 && (
                  <div className="space-y-3 pt-4 border-t" style={{ borderColor: colors.border }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: colors.heading, ...fontHeadingStyle }}>
                        More Products You Might Like
                      </h3>
                      <span className="text-[10px] font-bold opacity-60" style={{ color: colors.text }}>
                        {relatedProducts.length} items
                      </span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {relatedProducts.map((relSp) => {
                        const rp = relSp.product;
                        if (!rp) return null;
                        const cover = relSp.customCoverImage || rp.images[0];
                        return (
                          <div
                            key={relSp.id}
                            onClick={() => onSelectRelatedProduct && onSelectRelatedProduct(relSp)}
                            className="w-38 shrink-0 border p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                            style={{
                              borderRadius: cardRadius,
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            }}
                          >
                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 mb-2">
                              <img
                                src={cover}
                                alt={rp.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <span className="text-[9px] font-bold uppercase block truncate" style={{ color: colors.primary }}>
                              {rp.brand}
                            </span>
                            <h4 className="text-xs font-bold truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                              {rp.title}
                            </h4>
                            <p className="text-xs font-black mt-1" style={{ color: colors.heading }}>
                              {formatCurrency(rp.price)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR (ALWAYS ACCESSIBLE) */}
            {!isOutOfStock && (
              <div
                className="fixed bottom-0 left-0 right-0 z-40 border-t p-3.5 sm:p-4 backdrop-blur-md shadow-2xl"
                style={{
                  backgroundColor: `${colors.surface || '#ffffff'}f2`,
                  borderColor: colors.border || '#e2e8f0',
                }}
              >
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70" style={{ color: colors.text }}>
                      Total ({quantity})
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono" style={{ color: colors.heading, ...fontHeadingStyle }}>
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCartClick}
                    className="flex flex-1 sm:flex-initial sm:min-w-[240px] items-center justify-center gap-2 py-3.5 px-6 text-sm font-black shadow-lg active:scale-95 transition-all min-h-[48px]"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: actionBtnBg,
                      color: actionBtnTextColor,
                      ...fontHeadingStyle,
                    }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>
                      {addedToast ? 'Added to Cart!' : `Order Now (${formatCurrency(product.price * quantity)})`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Resolution Image Zoom Lightbox Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all">
          <button
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl flex flex-col items-center">
            <img
              src={currentMainImage}
              alt={product.title}
              className="max-h-[80vh] w-auto max-w-full object-contain shadow-2xl"
            />

            {allImages.length > 1 && (
              <div className="mt-4 flex items-center gap-4 text-white text-xs font-bold">
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
                  }
                  className="rounded-full bg-white/20 p-2 hover:bg-white/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <span>
                  Image {selectedImageIndex + 1} of {allImages.length}
                </span>

                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
                  }
                  className="rounded-full bg-white/20 p-2 hover:bg-white/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
