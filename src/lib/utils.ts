import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Role-aware home route resolver for navigation/logo clicks.
 *
 * Rules:
 * - Unauthenticated -> Public Landing Page ('/')
 * - Creator / Reseller -> Creator Analytics ('/reseller/analytics')
 * - Business Owner -> Owner Orders ('/orders')
 * - Admin -> Admin Order Management ('/admin/orders')
 */
export function getHomeRoute(role?: string | null, isAuthenticated: boolean = true): string {
  if (!isAuthenticated || !role) {
    return '/';
  }

  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'creator' || normalizedRole === 'reseller') {
    return '/reseller/analytics';
  }

  if (normalizedRole === 'business_owner' || normalizedRole === 'owner' || normalizedRole === 'business') {
    return '/orders';
  }

  if (normalizedRole === 'admin' || normalizedRole === 'super_admin') {
    return '/admin/orders';
  }

  return '/';
}

export function getDefaultRouteForRole(role: string): string {
  return getHomeRoute(role, true);
}

