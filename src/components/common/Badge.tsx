import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus, ProductStatus, AppealStatus } from '../../types';
import { EyeOff, AlertTriangle, Scale, CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'pending':
      return <Badge variant="amber">Pending Approval</Badge>;
    case 'accepted':
      return <Badge variant="info">Accepted</Badge>;
    case 'shipped':
      return <Badge variant="purple">Shipped</Badge>;
    case 'delivered':
    case 'completed':
      return <Badge variant="success">{status.toUpperCase()}</Badge>;
    case 'rejected':
    case 'cancelled':
      return <Badge variant="danger">{status.toUpperCase()}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function ProductStatusBadge({ status, isHidden }: { status?: ProductStatus; isHidden?: boolean }) {
  if (isHidden) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-2xs">
        <EyeOff className="h-3 w-3 text-amber-700 shrink-0" />
        <span>Hidden by Admin</span>
      </span>
    );
  }

  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'out_of_stock':
      return <Badge variant="warning">Out of Stock</Badge>;
    case 'archived':
      return <Badge variant="default">Archived</Badge>;
    default:
      return <Badge>{status || 'Unknown'}</Badge>;
  }
}

export function AppealStatusBadge({ status }: { status: AppealStatus }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
          <Clock className="h-3 w-3" /> Pending Review
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
          <Scale className="h-3 w-3" /> Under Review
        </span>
      );
    case 'more_info_requested':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
          <HelpCircle className="h-3 w-3" /> More Info Required
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
