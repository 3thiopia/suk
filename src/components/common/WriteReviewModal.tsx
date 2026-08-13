import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, AlertCircle, CheckCircle2, Search, Edit3 } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { storage } from '../../lib/storage';
import { Order, ProductReview } from '../../types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  businessId: string;
  orderId?: string;
  storefrontId?: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  businessId,
  orderId: initialOrderId,
  storefrontId,
  customerName: initialCustomerName,
  customerEmail,
  onSuccess,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lookupQuery, setLookupQuery] = useState<string>(customerEmail || initialOrderId || '');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [existingReview, setExistingReview] = useState<ProductReview | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(initialCustomerName || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Verification & State Sync
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setLookupError(null);
    setSubmittedSuccess(false);

    // If orderId is provided initially, verify it directly
    if (initialOrderId) {
      const allOrders = storage.getOrders();
      const matchedOrder = allOrders.find(
        (o) => o.id === initialOrderId || o.id.toLowerCase() === initialOrderId.toLowerCase()
      );
      if (matchedOrder) {
        setSelectedOrder(matchedOrder);
        checkExistingReview(matchedOrder.id);
        if (!customerName) setCustomerName(matchedOrder.customerName || 'Valued Customer');
        return;
      }
    }

    // Attempt auto-lookup if customer email or available order exists
    const eligibleOrders = storage.getVerifiedOrdersForProduct(productId, customerEmail);
    if (eligibleOrders.length > 0) {
      const topOrder = eligibleOrders[0];
      setSelectedOrder(topOrder);
      checkExistingReview(topOrder.id);
      if (!customerName) setCustomerName(topOrder.customerName || 'Valued Customer');
    } else {
      setSelectedOrder(null);
      setExistingReview(null);
    }
  }, [isOpen, initialOrderId, productId, customerEmail]);

  const checkExistingReview = (orderIdToVerify: string) => {
    const existing = storage.getReviewForOrderAndProduct(orderIdToVerify, productId);
    if (existing) {
      setExistingReview(existing);
      setRating(existing.rating);
      setComment(existing.comment || '');
      setIsAnonymous(!!existing.isAnonymous);
      setCustomerName(existing.customerName || 'Valued Customer');
    } else {
      setExistingReview(null);
      setRating(5);
      setComment('');
    }
  };

  const handleLookupPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!lookupQuery.trim()) {
      setLookupError('Please enter an Order ID or Email address used at checkout.');
      return;
    }

    const matches = storage.getVerifiedOrdersForProduct(productId, lookupQuery.trim());
    if (matches.length > 0) {
      const matched = matches[0];
      setSelectedOrder(matched);
      checkExistingReview(matched.id);
      if (!customerName) setCustomerName(matched.customerName || 'Valued Customer');
    } else {
      setLookupError(
        'No verified order found for this product matching your entry. Only verified buyers can submit reviews.'
      );
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOrder) {
      setError('A verified purchase order is required to submit a review.');
      return;
    }

    if (rating < 1) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        storage.updateReview({
          reviewId: existingReview.id,
          rating,
          comment,
          isAnonymous,
          customerName: customerName || 'Valued Customer',
        });
      } else {
        storage.createReview({
          orderId: selectedOrder.id,
          productId,
          businessId,
          storefrontId: storefrontId || selectedOrder.storefrontId,
          customerName: customerName || selectedOrder.customerName || 'Valued Customer',
          isAnonymous,
          rating,
          comment,
        });
      }

      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsEditing(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Product Review & Rating
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate max-w-xs sm:max-w-md">
              {productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {submittedSuccess ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {existingReview ? 'Review Updated Successfully!' : 'Thank You for Your Feedback!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                Your verified review has been published to this product page and notified to the brand owner.
              </p>
            </div>
          ) : !selectedOrder ? (
            /* Purchase Lookup Stage if no order found automatically */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Verified Purchase Required
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Only customers who actually purchased <strong>{productTitle}</strong> are permitted to leave a rating and review. Please verify your purchase to continue.
                  </p>
                </div>
              </div>

              {lookupError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              <form onSubmit={handleLookupPurchase} className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Verify Order ID or Customer Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="e.g. ORD-1002 or email@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter the Order ID or email address you used when placing the order on any storefront.
                </p>
              </form>
            </div>
          ) : existingReview && !isEditing ? (
            /* Already Reviewed State */
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Purchase Review Submitted</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Order #{selectedOrder.id}</span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  You already reviewed this product.
                </p>
                <div className="flex items-center gap-2">
                  <RatingStars rating={existingReview.rating} size="sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {existingReview.rating}/5 Stars
                  </span>
                </div>
                {existingReview.comment && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    "{existingReview.comment}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Only one review is allowed per purchased order item.
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Your Review</span>
                </button>
              </div>
            </div>
          ) : (
            /* Review Submission / Editing Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verified Purchase Badge */}
              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Purchase Order #{selectedOrder.id}</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {existingReview ? 'Editing Mode' : 'Verified Buyer'}
                </span>
              </div>

              {/* Touch-Friendly Star Rating Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rate this product <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <RatingStars
                    rating={rating}
                    size="xl"
                    interactive
                    onRatingChange={(r) => setRating(r)}
                  />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {rating === 5 && '★★★★★ 5/5 Outstanding'}
                    {rating === 4 && '★★★★☆ 4/5 Very Good'}
                    {rating === 3 && '★★★☆☆ 3/5 Average'}
                    {rating === 2 && '★★☆☆☆ 2/5 Poor'}
                    {rating === 1 && '★☆☆☆☆ 1/5 Unsatisfactory'}
                  </span>
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Write your review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product? How was the quality, fit, or performance?"
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Customer Name & Anonymous Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    disabled={isAnonymous}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 mt-auto">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Post Anonymously</p>
                    <p className="text-[10px] text-slate-400">Hide full name</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : existingReview
                    ? 'Update Review'
                    : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
