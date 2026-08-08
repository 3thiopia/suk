import React, { useState } from 'react';
import { AlertTriangle, Upload, X, Check, Image as ImageIcon, Info, Store, Building2, Calendar, ShieldAlert } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Order, OrderReportCategory } from '../../types';
import { Modal } from '../common/Modal';
import { MultiImageUploader } from '../common/MultiImageUploader';
import { OrderStatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

interface OrderReportModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const CATEGORIES: OrderReportCategory[] = [
  'Order has been pending too long',
  'Order was rejected without explanation',
  'Commission was not received',
  'Incorrect commission amount',
  'Business owner is not responding',
  'Order status appears incorrect',
  'Suspected fraud',
  'Technical issue',
  'Other',
];

export function OrderReportModal({ order, isOpen, onClose, onSubmitted }: OrderReportModalProps) {
  const [category, setCategory] = useState<OrderReportCategory>('Order has been pending too long');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const storefront = storage.getStorefronts().find((sf) => sf.id === order.storefrontId);
  const firstItem = order.items[0];
  const businessName = firstItem?.brand || 'Brand Owner';
  const productTitle = firstItem ? firstItem.productTitle : 'Ordered Product';
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ');

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim()) return;
    if (attachments.includes(attachmentUrl.trim())) return;
    setAttachments([...attachments, attachmentUrl.trim()]);
    setAttachmentUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setAttachments([...attachments, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (category === 'Other' && !description.trim()) {
      setError('Please provide a detailed description when "Other" category is selected.');
      return;
    }

    if (!description.trim() && category !== 'Other') {
      setError('Please enter a brief description explaining the issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      storage.createOrderReport({
        orderId: order.id,
        category,
        description: description.trim(),
        attachments,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onSubmitted?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Issue with Order"
      subtitle={`Submit a formal reseller issue report linked directly to Order #${order.id}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Report Submitted Successfully</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Your report for Order #{order.id} has been transmitted to platform administrators. You will be notified of updates directly in your notification center.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Read-only Auto-populated Order Summary Banner */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/80">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Linked Order ID</span>
                <p className="font-mono font-bold text-sm text-neutral-900">#{order.id}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Order Status</span>
                <div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-neutral-500" /> Business Owner
                </span>
                <p className="font-bold text-neutral-900 truncate">{businessName}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block flex items-center gap-1">
                  <Store className="h-3 w-3 text-neutral-500" /> Storefront
                </span>
                <p className="font-bold text-neutral-900 truncate">{storefront?.storeName || 'Your Storefront'}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-neutral-500" /> Order Date
                </span>
                <p className="font-semibold text-neutral-800">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block">Order Total / Commission</span>
                <p className="font-semibold text-neutral-800">
                  {formatCurrency(order.totalAmount)} <span className="text-emerald-700 font-bold">({formatCurrency(order.resellerCommission)})</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/80">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Product Items</span>
              <p className="text-xs text-neutral-800 font-medium truncate mt-0.5">{itemsSummary}</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Report Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as OrderReportCategory)}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 px-3 text-xs text-neutral-900 font-medium focus:outline-none focus:border-neutral-900 shadow-2xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Description & Incident Details {category === 'Other' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue with this order in detail (e.g., timeline of communication with business owner, unexpected delays, status discrepancy)..."
                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 shadow-2xs resize-none"
              />
            </div>

            {/* Optional Proof Attachments */}
            <MultiImageUploader
              value={attachments}
              onChange={(urls) => setAttachments(urls)}
              label="Optional Proof Attachments (Screenshots or Documents)"
              description="Upload chat screenshots, tracking info, or receipt documents directly from your device."
              allowPrimarySelection={false}
              maxImages={5}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting Report...' : 'Submit Order Report'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
