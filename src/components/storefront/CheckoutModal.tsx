import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Order, StorefrontCustomization } from '../../types';
import { storage } from '../../lib/storage';
import { formatCurrency } from '../../lib/utils';
import { getProductCommission } from '../../lib/commission';
import {
  getDefaultCustomization,
  getFontStyle,
  getButtonBorderRadius,
  getCardBorderRadius,
  getContrastTextColor,
  FONT_OPTIONS,
} from '../../lib/customizationDefaults';
import {
  ChevronLeft,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Check,
  AlertCircle,
  Truck,
  Info,
  Compass,
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storefrontId: string;
  cart: CartItem[];
  onOrderPlaced: (order: Order) => void;
  customization?: StorefrontCustomization;
}

export function CheckoutModal({
  isOpen,
  onClose,
  storefrontId,
  cart,
  onOrderPlaced,
  customization,
}: CheckoutModalProps) {
  const { t } = useTranslation();
  const storefront = storage.getStorefronts().find((s) => s.id === storefrontId);
  const storeName = storefront?.storeName || 'Storefront';

  const fullCustomization = getDefaultCustomization(customization || storefront?.customization);
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

  const [formData, setFormData] = useState({
    customerName: 'Sarah Jenkins',
    customerPhone: '+251 91 123 4567',
    customerEmail: 's.jenkins@example.com',
    regionCity: 'Addis Ababa',
    areaDistrict: '',
    street: '',
    building: '',
    landmark: '',
    deliveryNotes: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lock body scroll and listen for Escape key when checkout is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Calculate reseller commission based on configured rates/fixed amounts per product
  const resellerCommission = cart.reduce((sum, item) => {
    const biz = storage.getBusinessById(item.product.businessId);
    const comm = getProductCommission(item.product, biz);
    return sum + comm.amount * item.quantity;
  }, 0);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // Validation - Only Full Name and Phone Number are required
    if (!formData.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setErrorMessage('Please enter a valid phone number for delivery confirmation.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const addressParts = [
        formData.street,
        formData.building,
        formData.landmark ? `Near ${formData.landmark}` : '',
      ].filter(Boolean);

      const fullStreetAddress = addressParts.length > 0 
        ? addressParts.join(', ') 
        : 'Addis Ababa (Exact location to be confirmed via phone call)';

      const newOrder = storage.placeOrder({
        storefrontId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || `${formData.customerPhone.replace(/\D/g, '')}@guest.storefront`,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          street: fullStreetAddress,
          city: formData.regionCity || 'Addis Ababa',
          state: formData.areaDistrict || 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
        },
        items: cart.map((c) => ({
          productId: c.product.id,
          productTitle: c.product.title,
          brand: c.product.brand,
          unitPrice: c.product.price,
          quantity: c.quantity,
          businessId: c.product.businessId,
          coverImage: c.selectedCoverImage || c.product.images[0],
        })),
        totalAmount: subtotal,
        resellerCommission,
        paymentMethod: formData.paymentMethod,
      });

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
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
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold active:scale-95 transition-all min-h-[44px] min-w-[44px]"
              style={{
                borderRadius: buttonRadius,
                backgroundColor: `${actionBtnBg}15`,
                color: colors.heading || '#0f172a',
              }}
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" style={{ color: colors.heading }} />
              <span>Back</span>
            </button>

            <div className="text-center px-2 flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase" style={{ color: colors.heading, ...fontHeadingStyle }}>
                Guest Checkout
              </span>
              <span className="text-[10px] font-bold truncate max-w-[160px] sm:max-w-xs" style={{ color: colors.primary }}>
                {storeName}
              </span>
            </div>

            <div
              className="flex items-center gap-1 text-[11px] font-bold border px-2.5 py-1.5"
              style={{
                borderRadius: buttonRadius,
                backgroundColor: `${colors.primary}12`,
                borderColor: `${colors.primary}33`,
                color: colors.primary,
              }}
            >
              <Lock className="h-3.5 w-3.5" style={{ color: colors.primary }} />
              <span className="hidden sm:inline">256-bit</span>
              <span>Secure</span>
            </div>
          </div>

          {/* FULL-SCREEN SCROLLABLE CONTENT BODY */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-6">
              {/* Encrypted Guest Checkout Banner */}
              <div
                className="flex items-center gap-3 border p-3.5 text-xs font-medium shadow-2xs"
                style={{
                  borderRadius: cardRadius,
                  backgroundColor: `${colors.primary}10`,
                  borderColor: `${colors.primary}25`,
                  color: colors.text,
                }}
              >
                <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: colors.primary }} />
                <div>
                  <p className="font-bold" style={{ color: colors.heading, ...fontHeadingStyle }}>Instant Guest Checkout</p>
                  <p className="text-[11px] opacity-80" style={{ color: colors.text }}>No account required. Fast & direct order fulfillment.</p>
                </div>
              </div>

              {/* Validation Error Banner if present */}
              {errorMessage && (
                <div
                  className="flex items-center gap-2.5 border p-3.5 text-xs font-bold"
                  style={{
                    borderRadius: buttonRadius,
                    backgroundColor: `${colors.danger || '#ef4444'}15`,
                    borderColor: `${colors.danger || '#ef4444'}33`,
                    color: colors.danger || '#ef4444',
                  }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" style={{ color: colors.danger || '#ef4444' }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SECTION 1: CONTACT INFORMATION */}
              <div
                className="border p-4 sm:p-5 shadow-2xs space-y-4"
                style={{
                  borderRadius: cardRadius,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center text-xs font-black"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: actionBtnBg,
                        color: actionBtnTextColor,
                      }}
                    >
                      1
                    </div>
                    <h3 className="text-sm font-extrabold" style={{ color: colors.heading, ...fontHeadingStyle }}>Contact Information</h3>
                  </div>
                  <span
                    className="text-[10px] font-bold border px-2 py-0.5"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: `${colors.danger || '#ef4444'}15`,
                      borderColor: `${colors.danger || '#ef4444'}33`,
                      color: colors.danger || '#ef4444',
                    }}
                  >
                    Required
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Full Name (Required) */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: colors.heading }}>
                      Full Name <span className="font-bold" style={{ color: colors.danger || '#ef4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                        style={{
                          borderRadius: buttonRadius,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.heading,
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Number (Required) */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: colors.heading }}>
                      Phone Number <span className="font-bold" style={{ color: colors.danger || '#ef4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                      <input
                        type="tel"
                        inputMode="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="e.g. +251 91 123 4567"
                        className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                        style={{
                          borderRadius: buttonRadius,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.heading,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] opacity-70 font-medium" style={{ color: colors.text }}>
                      Our delivery team will call this number to confirm order & delivery location.
                    </p>
                  </div>

                  {/* Email Address (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                        Email Address
                      </label>
                      <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                        style={{
                          borderRadius: buttonRadius,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.heading,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERY INFORMATION (OPTIONAL) */}
              <div
                className="border p-4 sm:p-5 shadow-2xs space-y-4"
                style={{
                  borderRadius: cardRadius,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center text-xs font-black"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                      }}
                    >
                      2
                    </div>
                    <h3 className="text-sm font-extrabold" style={{ color: colors.heading, ...fontHeadingStyle }}>
                      Delivery Information <span className="font-semibold text-xs opacity-60" style={{ color: colors.text }}>(Optional)</span>
                    </h3>
                  </div>
                  <span
                    className="text-[10px] font-bold border px-2 py-0.5"
                    style={{
                      borderRadius: buttonRadius,
                      backgroundColor: `${colors.primary}12`,
                      borderColor: `${colors.primary}25`,
                      color: colors.primary,
                    }}
                  >
                    All delivery information is optional.
                  </span>
                </div>

                {/* Delivery Location Notice */}
                <div
                  className="flex items-start gap-3 border p-3.5 text-xs"
                  style={{
                    borderRadius: buttonRadius,
                    backgroundColor: `${colors.primary}10`,
                    borderColor: `${colors.primary}25`,
                    color: colors.text,
                  }}
                >
                  <Truck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: colors.primary }} />
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-black text-xs" style={{ color: colors.heading, ...fontHeadingStyle }}>Addis Ababa Delivery Notice</p>
                    <p className="text-[11px] opacity-80 font-medium" style={{ color: colors.text }}>
                      We currently deliver only within Addis Ababa. Our team will contact you using the phone number you provide to confirm your delivery location and arrange delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Region / City (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                          Region / City
                        </label>
                        <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                        <input
                          type="text"
                          value={formData.regionCity}
                          onChange={(e) => setFormData({ ...formData, regionCity: e.target.value })}
                          placeholder="e.g. Addis Ababa"
                          className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                          style={{
                            borderRadius: buttonRadius,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.heading,
                          }}
                        />
                      </div>
                    </div>

                    {/* Area / District (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                          Area / District
                        </label>
                        <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                      </div>
                      <input
                        type="text"
                        value={formData.areaDistrict}
                        onChange={(e) => setFormData({ ...formData, areaDistrict: e.target.value })}
                        placeholder="e.g. Bole / Kazanchis"
                        className="w-full border px-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                        style={{
                          borderRadius: buttonRadius,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.heading,
                        }}
                      />
                    </div>
                  </div>

                  {/* Street Address (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                        Street Address
                      </label>
                      <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                    </div>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="e.g. Bole Road, Main St"
                      className="w-full border px-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.heading,
                      }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Building / House Number (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                          Building / House Number
                        </label>
                        <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                      </div>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                        <input
                          type="text"
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                          placeholder="e.g. Apt 4B, Building 2"
                          className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                          style={{
                            borderRadius: buttonRadius,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.heading,
                          }}
                        />
                      </div>
                    </div>

                    {/* Landmark (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                          Landmark
                        </label>
                        <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                      </div>
                      <div className="relative">
                        <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: colors.text }} />
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder="e.g. Near Edna Mall, Behind Hotel"
                          className="w-full border pl-10 pr-4 py-3 text-sm font-medium focus:outline-none min-h-[48px] transition-all"
                          style={{
                            borderRadius: buttonRadius,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.heading,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Notes (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold" style={{ color: colors.heading }}>
                        Delivery Notes
                      </label>
                      <span className="text-[10px] font-semibold opacity-60" style={{ color: colors.text }}>(Optional)</span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.deliveryNotes}
                      onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                      placeholder="Gate code, specific delivery instructions, or preferred call times..."
                      className="w-full border p-3 text-sm font-medium focus:outline-none transition-all resize-none"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.heading,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ORDER SUMMARY (READ-ONLY) */}
              <div
                className="border p-4 sm:p-5 shadow-2xs space-y-4"
                style={{
                  borderRadius: cardRadius,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center text-xs font-black"
                      style={{
                        borderRadius: buttonRadius,
                        backgroundColor: actionBtnBg,
                        color: actionBtnTextColor,
                      }}
                    >
                      3
                    </div>
                    <h3 className="text-sm font-extrabold" style={{ color: colors.heading, ...fontHeadingStyle }}>Order Summary</h3>
                  </div>
                  <span className="text-xs font-extrabold opacity-70" style={{ color: colors.text }}>
                    {cart.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </div>

                {/* Read-Only Cart Items */}
                <div className="divide-y" style={{ divideColor: colors.border }}>
                  {cart.map((item) => {
                    const cover = item.selectedCoverImage || item.product.images[0];
                    return (
                      <div key={item.product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <img
                          src={cover}
                          alt={item.product.title}
                          className="h-16 w-16 border object-cover shrink-0"
                          style={{
                            borderRadius: buttonRadius,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase block" style={{ color: colors.primary }}>
                            {item.product.brand}
                          </span>
                          <h4 className="text-xs font-bold truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>
                            {item.product.title}
                          </h4>
                          <p className="text-xs font-semibold opacity-70 mt-0.5" style={{ color: colors.text }}>
                            Qty: <span className="font-bold" style={{ color: colors.heading }}>{item.quantity}</span> × {formatCurrency(item.product.price)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black font-mono" style={{ color: colors.heading }}>
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Method Selector */}
                <div className="pt-3 border-t space-y-2" style={{ borderColor: colors.border }}>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: colors.text }}>
                    Payment Option
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'Cash on Delivery', label: 'Cash on Delivery', desc: 'Pay when order arrives' },
                      { id: 'Credit Card', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
                      { id: 'Apple Pay', label: 'Apple Pay', desc: '1-tap contactless' },
                    ].map((method) => {
                      const isSelected = formData.paymentMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                          className="flex cursor-pointer flex-col justify-between border p-3 transition-all min-h-[52px]"
                          style={{
                            borderRadius: buttonRadius,
                            backgroundColor: isSelected ? `${colors.primary}12` : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                            boxShadow: isSelected ? `0 0 0 2px ${colors.primary}33` : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold" style={{ color: colors.heading, ...fontHeadingStyle }}>{method.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4" style={{ color: colors.primary }} />}
                          </div>
                          <span className="text-[10px] opacity-70 mt-0.5" style={{ color: colors.text }}>{method.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div
                  className="p-3.5 border space-y-1.5 text-xs"
                  style={{
                    borderRadius: buttonRadius,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex justify-between" style={{ color: colors.text }}>
                    <span>Subtotal</span>
                    <span className="font-semibold font-mono" style={{ color: colors.heading }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: colors.text }}>
                    <span>Delivery Fee</span>
                    <span className="font-bold" style={{ color: colors.primary }}>FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t pt-2 mt-1" style={{ borderColor: colors.border, color: colors.heading }}>
                    <span>Total Amount</span>
                    <span className="font-mono text-base">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* STICKY BOTTOM ACTION BAR */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t p-3 sm:p-4 backdrop-blur-md shadow-2xl max-w-full overflow-hidden"
            style={{
              backgroundColor: `${colors.surface || '#ffffff'}f2`,
              borderColor: colors.border || '#e2e8f0',
            }}
          >
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 sm:gap-4 min-w-0">
              <div className="min-w-0 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block truncate" style={{ color: colors.text }}>
                  Total ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                </span>
                <span className="text-base sm:text-2xl font-black font-mono truncate block" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || cart.length === 0}
                className="flex flex-1 sm:flex-initial sm:min-w-[220px] items-center justify-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-black shadow-lg active:scale-95 disabled:opacity-50 transition-all min-h-[48px] min-w-0"
                style={{
                  borderRadius: buttonRadius,
                  backgroundColor: actionBtnBg,
                  color: actionBtnTextColor,
                  ...fontHeadingStyle,
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate">Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

