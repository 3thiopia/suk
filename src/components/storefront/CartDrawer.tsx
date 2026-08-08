import React, { useEffect } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, StorefrontCustomization } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  getDefaultCustomization,
  getFontStyle,
  getButtonBorderRadius,
  getCardBorderRadius,
  getContrastTextColor,
  FONT_OPTIONS,
} from '../../lib/customizationDefaults';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  customization?: StorefrontCustomization;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  customization,
}: CartDrawerProps) {
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

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex h-full w-full max-w-md flex-col shadow-2xl z-10"
            style={{
              backgroundColor: colors.surface || '#ffffff',
              color: colors.text || '#334155',
              ...fontBodyStyle,
            }}
          >
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between border-b p-5"
              style={{ borderColor: colors.border || '#e2e8f0' }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: colors.heading }} />
                <h3 className="text-base font-bold" style={{ color: colors.heading, ...fontHeadingStyle }}>
                  Your Shopping Cart
                </h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: `${colors.primary}18`,
                    color: colors.primary,
                  }}
                >
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: colors.heading }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div
              className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 divide-y"
              style={{ divideColor: colors.border || '#e2e8f0' }}
            >
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-neutral-400"
                    style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}
                  >
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <h4 className="mt-4 text-sm font-bold" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    Your cart is empty
                  </h4>
                  <p className="mt-1 text-xs opacity-70" style={{ color: colors.text }}>
                    Explore items on the storefront to add to cart.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pt-4 first:pt-0">
                    <img
                      src={item.selectedCoverImage || item.product.images[0]}
                      alt={item.product.title}
                      className="h-20 w-20 border shrink-0 object-cover"
                      style={{
                        borderRadius: cardRadius,
                        borderColor: colors.border,
                      }}
                    />

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold line-clamp-1" style={{ color: colors.heading, ...fontHeadingStyle }}>
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-400 hover:text-rose-600 p-0.5 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] opacity-70" style={{ color: colors.text }}>
                          Brand: {item.product.brand}
                        </p>
                        <p className="text-xs font-extrabold mt-1" style={{ color: colors.heading }}>
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center border p-1"
                          style={{
                            borderRadius: buttonRadius,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 opacity-70 hover:opacity-100"
                            style={{ color: colors.heading }}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold" style={{ color: colors.heading }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 opacity-70 hover:opacity-100"
                            style={{ color: colors.heading }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div
                className="border-t p-5 space-y-3"
                style={{
                  backgroundColor: colors.background || '#f8fafc',
                  borderColor: colors.border || '#e2e8f0',
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold opacity-70" style={{ color: colors.text }}>Subtotal</span>
                  <span className="text-base font-black" style={{ color: colors.heading, ...fontHeadingStyle }}>
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] opacity-70" style={{ color: colors.text }}>
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="flex w-full items-center justify-center gap-2 py-3 text-xs font-bold shadow-md hover:opacity-95 transition-all min-h-[44px]"
                  style={{
                    borderRadius: buttonRadius,
                    backgroundColor: actionBtnBg,
                    color: actionBtnTextColor,
                    ...fontHeadingStyle,
                  }}
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
