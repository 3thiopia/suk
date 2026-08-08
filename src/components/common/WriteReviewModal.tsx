import React, { useState } from 'react';
import { X, Star, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { storage } from '../../lib/storage';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  productTitle: string;
  businessId: string;
  storefrontId?: string;
  customerName: string;
  onSuccess?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  productId,
  productTitle,
  businessId,
  storefrontId,
  customerName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError('Please select a rating of at least 1 star.');
      return;
    }

    setIsSubmitting(true);

    try {
      storage.createReview({
        orderId,
        productId,
        businessId,
        storefrontId,
        customerName: customerName || 'Valued Customer',
        isAnonymous,
        rating,
        comment,
      });

      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSubmittedSuccess(false);
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Write Product Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Order #{orderId} &bull; {productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submittedSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Thank You for Your Feedback!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your verified review has been submitted successfully and published to this product page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Verified Purchase Badge */}
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong>Verified Purchase:</strong> Your review will carry a verified badge based on Order #{orderId}.
              </span>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Your Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <RatingStars
                  rating={rating}
                  size="xl"
                  interactive
                  onRatingChange={(r) => setRating(r)}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {rating === 5 && 'Outstanding 🌟'}
                  {rating === 4 && 'Very Good 👍'}
                  {rating === 3 && 'Average 😐'}
                  {rating === 2 && 'Poor 👎'}
                  {rating === 1 && 'Unsatisfactory ❌'}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Detailed Feedback (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with product quality, performance, or packaging..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Post Anonymously</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Hide your full name from public product reviews</p>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
