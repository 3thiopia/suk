import React, { useState } from 'react';
import { Scale, AlertTriangle, FileText, Send, Paperclip, X, CheckCircle2, Info, Image as ImageIcon } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Product, ProductAppeal } from '../../types';
import { Modal } from '../common/Modal';
import { MultiImageUploader } from '../common/MultiImageUploader';
import { formatDate } from '../../lib/utils';

interface ProductAppealModalProps {
  product: Product;
  existingAppeal?: ProductAppeal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductAppealModal({
  product,
  existingAppeal,
  isOpen,
  onClose,
  onSuccess,
}: ProductAppealModalProps) {
  const [appealMessage, setAppealMessage] = useState(
    existingAppeal && existingAppeal.status === 'more_info_requested'
      ? ''
      : existingAppeal?.appealMessage || ''
  );
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>(existingAppeal?.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim()) return;
    setAttachments((prev) => [...prev, attachmentUrl.trim()]);
    setAttachmentUrl('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim()) return;

    setIsSubmitting(true);

    if (existingAppeal && existingAppeal.status === 'more_info_requested') {
      storage.updateProductAppealMessage(existingAppeal.id, appealMessage.trim(), attachments);
    } else {
      storage.submitProductAppeal({
        productId: product.id,
        appealMessage: appealMessage.trim(),
        attachments,
      });
    }

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingAppeal ? 'Product Moderation Appeal Details' : 'Submit Product Appeal'}
      subtitle={`Appeal moderation restriction for "${product.title}"`}
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {submittedSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">Appeal Submitted Successfully!</h3>
            <p className="text-emerald-700 max-w-md mx-auto">
              Platform administration has been notified. You will receive a notification as soon as your appeal is reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Warning Banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 text-xs">Product Hidden from Platform Catalog</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This product was hidden by administration on{' '}
                  <span className="font-bold font-mono">{formatDate(product.hiddenAt || product.updatedAt)}</span>.
                  Submitting an appeal will trigger a manual review by compliance managers.
                </p>
              </div>
            </div>

            {/* Read-Only Information */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product Name</label>
                  <input
                    type="text"
                    readOnly
                    value={product.title}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white p-2 font-bold text-neutral-800 cursor-not-allowed text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product ID</label>
                  <input
                    type="text"
                    readOnly
                    value={product.id}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white p-2 font-mono text-neutral-600 cursor-not-allowed text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">Admin Reason for Hiding</label>
                <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 font-medium text-amber-900 text-xs">
                  {product.hiddenReason || product.adminNotes || 'Policy & compliance review required.'}
                </div>
              </div>

              {existingAppeal?.requestedInfo && existingAppeal.status === 'more_info_requested' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>Admin Requested Information</span>
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">{existingAppeal.requestedInfo}</p>
                </div>
              )}
            </div>

            {/* Appeal Form Section */}
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                {existingAppeal?.status === 'more_info_requested'
                  ? 'Provide Requested Details *'
                  : 'Appeal Explanation & Message *'}
              </label>
              <textarea
                required
                rows={4}
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                placeholder="Explain why this product complies with platform guidelines, provide trademark/distribution licensing details, or explain corrections made..."
                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            {/* Direct Upload Attachments Section */}
            <div>
              <MultiImageUploader
                value={attachments}
                onChange={(urls) => setAttachments(urls)}
                label="Supporting Attachments & Proof Documents (Optional)"
                description="Upload images, certificates of authenticity, brand licensing authorization, or compliance documents directly from your device."
                allowPrimarySelection={false}
                maxImages={5}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !appealMessage.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{existingAppeal ? 'Update Appeal' : 'Submit Formal Appeal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
