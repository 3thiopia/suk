import React from 'react';
import { Modal } from './Modal';
import { UserX } from 'lucide-react';
import { BusinessProfile } from '../../types';

interface UnfollowConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  business?: BusinessProfile | null;
  businessName?: string;
  isProcessing?: boolean;
}

export function UnfollowConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  business,
  businessName,
  isProcessing = false,
}: UnfollowConfirmModalProps) {
  const name = businessName || business?.businessName || 'this business owner';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unfollow Business Owner?"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3.5 border border-amber-200/70 text-amber-900">
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={name}
              className="h-11 w-11 rounded-lg object-cover border border-amber-200/80 bg-white shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-200/60 text-amber-800 shrink-0">
              <UserX className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-950 truncate">{name}</p>
            <p className="text-[11px] text-amber-800 font-medium">
              {business?.followerCount !== undefined ? `${business.followerCount} followers` : 'Supplier Brand'}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Are you sure you want to unfollow this business owner? You can follow them again at any time.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
          >
            {isProcessing ? 'Unfollowing...' : 'Unfollow'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
