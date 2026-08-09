import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Flag,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ProductReview, ReviewReport, ReviewReportStatus } from '../../types';
import { storage } from '../../lib/storage';
import { RatingStars } from '../common/RatingStars';

export const ReviewModerationTab: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'reported' | 'low_rating' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hide Modal State
  const [hideTarget, setHideTarget] = useState<ProductReview | null>(null);
  const [hideReason, setHideReason] = useState<string>('Violation of community review standards');

  // Reports State
  const reports = storage.getReviewReports();
  const reviews = storage.getReviews();

  // Filter Logic
  const filteredReviews = reviews.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchProduct = (r.productTitle || '').toLowerCase().includes(q);
      const matchBusiness = (r.businessName || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      if (!matchName && !matchProduct && !matchBusiness && !matchComment) return false;
    }

    if (activeFilter === 'reported') {
      const isReported = reports.some((rep) => rep.reviewId === r.id);
      if (!isReported) return false;
    }

    if (activeFilter === 'low_rating' && r.rating > 2) return false;
    if (activeFilter === 'hidden' && !r.isHidden) return false;

    return true;
  });

  const reportedCount = reports.filter((rep) => rep.status === 'open').length;
  const hiddenCount = reviews.filter((r) => r.isHidden).length;
  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;

  const handleConfirmHide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hideTarget) return;

    storage.hideReview(hideTarget.id, hideReason);
    setHideTarget(null);
  };

  const handleUnhide = (reviewId: string) => {
    storage.unhideReview(reviewId);
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      storage.deleteReview(reviewId);
    }
  };

  const handleUpdateReportStatus = (reportId: string, status: ReviewReportStatus) => {
    storage.updateReviewReportStatus(reportId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Review Moderation & Trust Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit customer reviews, inspect reported items, prevent fake spam, and enforce content guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                {reportedCount} Open Reports
              </span>
            </div>

            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {hiddenCount} Hidden Reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full shrink-0 whitespace-nowrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setActiveFilter('reported')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'reported'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reported
            {reportedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-white text-rose-600 text-[10px] font-extrabold rounded-full">
                {reportedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('low_rating')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'low_rating'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Low Ratings (1-2★)
            {lowRatingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-700 text-white text-[10px] font-bold rounded-full">
                {lowRatingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('hidden')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'hidden'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, product, brand..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Review List Table / Cards */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Reviews Match Filter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              There are no reviews meeting your current selection criteria.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const reviewReports = reports.filter((rep) => rep.reviewId === review.id);

            return (
              <div
                key={review.id}
                className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-xs ${
                  review.isHidden
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10'
                    : reviewReports.some((r) => r.status === 'open')
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {review.customerName}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                      {review.isHidden && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Product: <span className="text-slate-900 dark:text-white font-bold">{review.productTitle}</span>
                      <span className="mx-2 opacity-40">|</span>
                      Brand: <span className="text-slate-900 dark:text-white font-bold">{review.businessName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {review.comment ? (
                    <p className="leading-relaxed">{review.comment}</p>
                  ) : (
                    <p className="italic text-slate-400">No written comment provided.</p>
                  )}
                </div>

                {/* Response from Brand if available */}
                {review.reply && (
                  <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Brand Reply ({review.reply.authorName}):
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{review.reply.replyText}</p>
                  </div>
                )}

                {/* Active Reports Box */}
                {reviewReports.length > 0 && (
                  <div className="mt-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                      <span className="flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" />
                        Report History ({reviewReports.length})
                      </span>
                    </div>
                    {reviewReports.map((rep) => (
                      <div key={rep.id} className="text-xs flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Reason: {rep.reason}
                          </p>
                          {rep.details && <p className="text-slate-500 text-[11px]">{rep.details}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rep.status === 'open'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {rep.status.toUpperCase()}
                          </span>
                          {rep.status === 'open' && (
                            <button
                              onClick={() => handleUpdateReportStatus(rep.id, 'actioned')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded"
                            >
                              Resolve Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Controls Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Order ID: #{review.orderId}</span>

                  <div className="flex items-center gap-2">
                    {review.isHidden ? (
                      <button
                        onClick={() => handleUnhide(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 font-semibold rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Unhide Review
                      </button>
                    ) : (
                      <button
                        onClick={() => setHideTarget(review)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 font-semibold rounded-xl transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide Review
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* HIDE REASON MODAL */}
      {hideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-amber-600" />
                Hide Review from Public Display
              </h3>
              <button
                onClick={() => setHideTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmHide} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Hiding Review
                </label>
                <textarea
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  placeholder="Specify why this review is being hidden..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHideTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
                >
                  Confirm Hide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
