import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Flag,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  CheckCircle2,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ProductReview, RatingStats, BusinessProfile } from '../../types';
import { storage } from '../../lib/storage';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../common/Badge';

interface BusinessReviewsProps {
  business: BusinessProfile;
}

export const BusinessReviews: React.FC<BusinessReviewsProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unreplied' | 'low_rating'>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reply Modal State
  const [replyReview, setReplyReview] = useState<ProductReview | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Report Modal State
  const [reportReview, setReportReview] = useState<ProductReview | null>(null);
  const [reportReason, setReportReason] = useState<string>('Fake or Unverified Review');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const reviews = storage.getReviewsForBusiness(business.id, true);
  const stats: RatingStats = storage.getRatingStatsForBusiness(business.id);

  // Filter Logic
  const filteredReviews = reviews.filter((r) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(query);
      const matchProduct = (r.productTitle || '').toLowerCase().includes(query);
      const matchComment = (r.comment || '').toLowerCase().includes(query);
      if (!matchName && !matchProduct && !matchComment) return false;
    }

    // Tab filter
    if (activeTab === 'unreplied' && r.reply) return false;
    if (activeTab === 'low_rating' && r.rating > 2) return false;

    // Rating star filter
    if (selectedRating !== 'all' && Math.round(r.rating) !== selectedRating) return false;

    return true;
  });

  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;
  const unrepliedCount = reviews.filter((r) => !r.reply).length;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReview || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      storage.replyToReview(replyReview.id, replyText, business.businessName);
      setReplyReview(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReview || !reportReason.trim()) return;

    setIsSubmittingReport(true);
    try {
      storage.reportReview(reportReview.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportReview(null);
        setReportSuccess(false);
        setReportDetails('');
      }, 1500);
    } catch (err) {
      console.error('Failed to send report:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Customer Reviews & Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage product feedback, answer customer questions publicly, and monitor overall store quality.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-center px-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <RatingStars rating={stats.averageRating} size="sm" className="mt-0.5 justify-center" />
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-xs space-y-0.5 text-slate-600 dark:text-slate-300">
              <p><strong>{stats.totalReviews}</strong> Total Reviews</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                <strong>{stats.totalVerified}</strong> Verified Purchases
              </p>
            </div>
          </div>
        </div>

        {/* Low Rating Warning Banner */}
        {lowRatingCount > 0 && (
          <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {lowRatingCount} Low Rating {lowRatingCount === 1 ? 'Review' : 'Reviews'} Received (1-2 Stars)
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Promptly replying to low rating reviews helps resolve customer issues and protects store reputation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('low_rating')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
            >
              View Low Ratings
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Main Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('unreplied')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'unreplied'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Needs Reply
            {unrepliedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                {unrepliedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('low_rating')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'low_rating'
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
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by product or customer..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Reviews Found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              There are no reviews matching your currently selected tab or search query.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs ${
                review.rating <= 2 ? 'border-l-4 border-l-amber-500' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {review.customerName}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Order #{review.orderId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Product: <span className="text-slate-900 dark:text-white font-bold">{review.productTitle}</span>
                  </p>
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
              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                {review.comment ? (
                  <p className="leading-relaxed">{review.comment}</p>
                ) : (
                  <p className="text-xs italic text-slate-400">No written feedback provided with this rating.</p>
                )}
              </div>

              {/* Existing Reply */}
              {review.reply ? (
                <div className="mt-4 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Public Brand Response ({review.reply.authorName})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(review.reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{review.reply.replyText}</p>
                </div>
              ) : (
                /* Reply Action Footer */
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setReplyReview(review)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply as Brand
                  </button>

                  <button
                    onClick={() => setReportReview(review)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Abusive Review</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REPLY MODAL */}
      {replyReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Reply to Review
              </h3>
              <button
                onClick={() => setReplyReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Review by {replyReview.customerName} ({replyReview.rating}/5 stars)
              </p>
              <p className="text-slate-500 italic">"{replyReview.comment || 'No comment text'}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public Brand Response
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Thank the customer or address their feedback as ${business.businessName}...`}
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyReview(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingReply ? 'Posting Reply...' : 'Post Public Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                Report Review to Admin
              </h3>
              <button
                onClick={() => setReportReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Report Transmitted to Admin</h4>
                <p className="text-xs text-slate-500">
                  Platform moderators will inspect this review and take action if policies are violated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Fake or Unverified Review">Fake or Unverified Review</option>
                    <option value="Inappropriate or Profane Language">Inappropriate or Profane Language</option>
                    <option value="Spam or Advertising">Spam or Advertising</option>
                    <option value="Irrelevant to Product or Business">Irrelevant to Product or Business</option>
                    <option value="Extortion or Defamation">Extortion or Defamation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details for admin review..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReportReview(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
