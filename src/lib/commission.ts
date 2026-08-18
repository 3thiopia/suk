import { Product, BusinessProfile, Order, CommissionPayout } from '../types';
import { formatCurrency } from './utils';

export interface CalculatedCommission {
  amount: number;
  rateText: string;
  isFixed: boolean;
  formattedAmount: string;
}

export function getProductCommission(
  product: Partial<Product>,
  business?: Partial<BusinessProfile> | null
): CalculatedCommission {
  const price = product.price || 0;

  // 1. Explicit fixed commission amount on product
  if (typeof product.commissionAmount === 'number' && product.commissionAmount > 0) {
    return {
      amount: product.commissionAmount,
      rateText: 'Fixed',
      isFixed: true,
      formattedAmount: formatCurrency(product.commissionAmount),
    };
  }

  // 2. Explicit percentage rate on product
  if (typeof product.commissionRate === 'number' && product.commissionRate > 0) {
    const amount = (price * product.commissionRate) / 100;
    return {
      amount,
      rateText: `${product.commissionRate}%`,
      isFixed: false,
      formattedAmount: formatCurrency(amount),
    };
  }

  // 3. Business profile default commission rate
  if (business && typeof business.defaultCommissionRate === 'number' && business.defaultCommissionRate > 0) {
    const amount = (price * business.defaultCommissionRate) / 100;
    return {
      amount,
      rateText: `${business.defaultCommissionRate}%`,
      isFixed: false,
      formattedAmount: formatCurrency(amount),
    };
  }

  // 4. Default platform rate (15%)
  const defaultRate = 15;
  const amount = (price * defaultRate) / 100;
  return {
    amount,
    rateText: `${defaultRate}%`,
    isFixed: false,
    formattedAmount: formatCurrency(amount),
  };
}

export interface CommissionStatusInfo {
  statusKey: 'expected' | 'earned' | 'paid' | 'cancelled';
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function getOrderCommissionStatus(
  order: Order,
  isPayoutProcessed?: boolean
): CommissionStatusInfo {
  // Check if payout was completed or explicitly marked as paid
  if (isPayoutProcessed || (order.commissionEligibleForPayout && order.status === 'completed')) {
    return {
      statusKey: 'paid',
      label: 'Commission Paid',
      shortLabel: 'Paid',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      badgeBorder: 'border-emerald-300',
    };
  }

  if (order.status === 'delivered' || order.status === 'completed') {
    return {
      statusKey: 'earned',
      label: 'Commission Earned',
      shortLabel: 'Earned',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
    };
  }

  if (order.status === 'rejected' || order.status === 'cancelled') {
    return {
      statusKey: 'cancelled',
      label: 'Commission Cancelled',
      shortLabel: 'Cancelled',
      badgeBg: 'bg-neutral-100',
      badgeText: 'text-neutral-500',
      badgeBorder: 'border-neutral-200',
    };
  }

  // Default for pending, accepted, shipped
  return {
    statusKey: 'expected',
    label: 'Pending (Not Earned)',
    shortLabel: 'Pending',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  };
}
