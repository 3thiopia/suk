import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Flag,
  MessageSquare,
  ThumbsUp,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { ProductReview, RatingStats, ReviewSortOption } from '../../types';
import { RatingStars } from './RatingStars';
import { storage } from '../../lib/storage';

interface ProductReviewsListProps {
  productId: string;
  businessId?: string;
  isBusinessOwner?: boolean;
  onOpenReportModal?: (review: ProductReview) => void;
  onOpenReplyModal?: (review: ProductReview) => void;
  className?: string;
}

export const ProductReviewsList: React.FC<ProductReviewsListProps> = ({
  productId,
  businessId,
  isBusinessOwner = false,
  onOpenReportModal,
  onOpenReplyModal,
  className = '',
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('recent');

  const reviews = storage.getReviewsForProduct(productId, isBusinessOwner);
  const stats: RatingStats = storage.getRatingStatsForProduct(productId);

  // Filter & Sort Logic
  let filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && Math.round(r.rating) !== filterRating) return false;
    if (onlyVerified && !r.isVerifiedPurchase) return false;
    return true;
  });

  filteredReviews.sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'verified') {
      return (b.isVerifiedPurchase ? 1 : 0) - (a.isVerifiedPurchase ? 1 : 0);
    }
    return 0;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Overall Summary Card */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-5 md:p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Customer Ratings & Reviews
        </h3>

        {stats.totalReviews === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No reviews have been submitted for this product yet.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Be the first verified buyer to leave feedback after order delivery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Average Rating Score Big Box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/50 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.averageRating.toFixed(1)}
              </div>
              <RatingStars rating={stats.averageRating} size="lg" className="my-1.5" />
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
              {stats.totalVerified > 0 && (
                <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{stats.totalVerified} Verified Purchases</span>
                </div>
              )}
            </div>

            {/* Breakdown Progress Bars */}
            <div className="md:col-span-8 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.breakdown[star as keyof typeof stats.breakdown] || 0;
                const pct = stats.breakdownPercentages[star as keyof typeof stats.breakdownPercentages] || 0;

                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                    className="w-full flex items-center gap-3 text-xs group hover:opacity-80 transition-opacity"
                  >
                    <span className="w-12 text-right font-medium text-slate-600 dark:text-slate-300 flex items-center justify-end gap-1">
                      {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          star >= 4
                            ? 'bg-amber-400'
                            : star === 3
                            ? 'bg-amber-300'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-left text-slate-500 dark:text-slate-400 font-medium">
                      {count} ({pct}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls: Filter & Sort Bar */}
      {stats.totalReviews > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Rating Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterRating === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star as keyof typeof stats.breakdown] || 0;
              if (count === 0 && filterRating !== star) return null;
              return (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1 ${
                    filterRating === star
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-current" />
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 border ${
                onlyVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Only
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="verified">Verified First</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 && stats.totalReviews > 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No reviews match your selected filter criteria.
            </p>
            <button
              onClick={() => {
                setFilterRating('all');
                setOnlyVerified(false);
              }}
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`p-5 rounded-2xl border transition-all ${
                review.isHidden
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 shadow-xs'
              }`}
            >
              {review.isHidden && (
                <div className="mb-3 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Hidden by Moderator: {review.hiddenReason || 'Policy violation'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">Admin Status</span>
                </div>
              )}

              {/* Top Row: User & Date & Stars */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {review.customerName}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                  {review.comment}
                </p>
              )}

              {/* Supplier Response / Reply */}
              {review.reply && (
                <div className="mt-4 ml-10 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Building2 className="w-3.5 h-3.5" />
                      Response from {review.reply.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(review.reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {review.reply.replyText}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] text-slate-400">
                  Order #{review.orderId}
                </span>

                <div className="flex items-center gap-2">
                  {isBusinessOwner && !review.reply && onOpenReplyModal && (
                    <button
                      onClick={() => onOpenReplyModal(review)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply as Brand
                    </button>
                  )}

                  {isBusinessOwner && onOpenReportModal && (
                    <button
                      onClick={() => onOpenReportModal(review)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Report abusive review to admin"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
