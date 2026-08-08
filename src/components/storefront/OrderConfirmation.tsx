import React, { useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Order, StorefrontCustomization } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  getDefaultCustomization,
  getFontStyle,
  getButtonBorderRadius,
  getCardBorderRadius,
  getContrastTextColor,
  FONT_OPTIONS,
} from '../../lib/customizationDefaults';
import { CheckCircle2, PackageCheck, Truck, ShoppingBag } from 'lucide-react';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  customization?: StorefrontCustomization;
}

export function OrderConfirmation({ isOpen, onClose, order, customization }: OrderConfirmationProps) {
  if (!order) return null;

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

  const successColor = colors.success || colors.primary || '#10b981';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Successfully Placed!"
      maxWidth="md"
      borderRadius={cardRadius}
      modalStyle={{
        backgroundColor: colors.surface || '#ffffff',
        borderColor: colors.border || '#e2e8f0',
        color: colors.text || '#334155',
        ...fontBodyStyle,
      }}
      headerStyle={{
        backgroundColor: colors.surface || '#ffffff',
        borderColor: colors.border || '#e2e8f0',
      }}
      titleStyle={{
        color: colors.heading || '#0f172a',
        ...fontHeadingStyle,
      }}
      closeButtonStyle={{
        color: colors.text || '#64748b',
        borderRadius: buttonRadius,
      }}
    >
      <div className="space-y-6 text-center" style={{ color: colors.text, ...fontBodyStyle }}>
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-xs"
          style={{
            backgroundColor: `${successColor}1f`,
            color: successColor,
            border: `2px solid ${successColor}33`,
          }}
        >
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold" style={{ color: colors.heading, ...fontHeadingStyle }}>
            Thank You, {order.customerName}!
          </h3>
          <p className="mt-1 text-xs opacity-70" style={{ color: colors.text }}>
            Order <span className="font-mono font-bold" style={{ color: colors.heading }}>#{order.id}</span> has been transmitted to brand fulfillers.
          </p>
        </div>

        <div
          className="border p-4 text-left space-y-2 text-xs shadow-2xs"
          style={{
            borderRadius: cardRadius,
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <div className="flex justify-between font-bold border-b pb-2" style={{ borderColor: colors.border, color: colors.heading, ...fontHeadingStyle }}>
            <span>Storefront</span>
            <span>{order.storefrontName}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70" style={{ color: colors.text }}>Date</span>
            <span className="font-medium" style={{ color: colors.heading }}>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70" style={{ color: colors.text }}>Total Charged</span>
            <span className="font-extrabold" style={{ color: colors.primary }}>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70" style={{ color: colors.text }}>Payment</span>
            <span className="font-medium" style={{ color: colors.heading }}>{order.paymentMethod}</span>
          </div>
        </div>

        <div
          className="border p-4 text-left space-y-2 shadow-2xs"
          style={{
            borderRadius: cardRadius,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: colors.text, ...fontHeadingStyle }}>
            Items Ordered
          </h4>
          <div className="divide-y" style={{ divideColor: colors.border }}>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.coverImage}
                    alt={item.productTitle}
                    className="h-8 w-8 rounded object-cover border shrink-0"
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: colors.heading, ...fontHeadingStyle }}>{item.productTitle}</p>
                    <p className="text-[10px] opacity-70" style={{ color: colors.text }}>Brand: {item.brand}</p>
                  </div>
                </div>
                <span className="font-bold shrink-0 ml-2" style={{ color: colors.heading }}>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all min-h-[44px]"
          style={{
            borderRadius: buttonRadius,
            backgroundColor: actionBtnBg,
            color: actionBtnTextColor,
            ...fontHeadingStyle,
          }}
        >
          Continue Shopping
        </button>
      </div>
    </Modal>
  );
}
