import React from 'react';
import { X, Star, Building2, Package } from 'lucide-react';
import { ProductReviewsList } from './ProductReviewsList';
import { storage } from '../../lib/storage';

interface ProductReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  isBusinessOwner?: boolean;
  isCreator?: boolean;
  storefrontId?: string;
  onRemoveFromStorefront?: () => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({
  isOpen,
  onClose,
  productId,
  isBusinessOwner = false,
  isCreator = false,
  storefrontId,
  onRemoveFromStorefront,
}) => {
  if (!isOpen) return null;

  const product = storage.getProductById(productId);
  if (!product) return null;

  const business = storage.getBusinessById(product.businessId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {product.category}
                </span>
                {business && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 truncate">
                    {business.businessName}
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate leading-tight">
                {product.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <ProductReviewsList
            productId={productId}
            businessId={product.businessId}
            isBusinessOwner={isBusinessOwner}
            isCreator={isCreator}
            storefrontId={storefrontId}
            onRemoveFromStorefront={onRemoveFromStorefront}
          />
        </div>
      </div>
    </div>
  );
};
