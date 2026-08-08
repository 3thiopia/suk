import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Store, Building2, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface AccessDeniedProps {
  userRole: UserRole;
  onNavigateToDefault: () => void;
}

export function AccessDenied({ userRole, onNavigateToDefault }: AccessDeniedProps) {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'reseller':
        return 'Reseller Account';
      case 'business_owner':
        return 'Business Owner Account';
      case 'admin':
        return 'Platform Administrator';
      default:
        return 'Standard User';
    }
  };

  const getDefaultPageTitle = (role: UserRole) => {
    switch (role) {
      case 'reseller':
        return 'Business Marketplace (/marketplace)';
      case 'business_owner':
        return 'Fulfillment Orders (/orders)';
      case 'admin':
        return 'Platform Orders (/admin/orders)';
      default:
        return 'Home Page';
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 sm:p-12 max-w-lg shadow-sm space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
            403 • Restricted Role Access
          </span>
          <h2 className="text-2xl font-black text-neutral-900">Access Denied</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Your current authenticated persona (<span className="font-bold text-neutral-900">{getRoleLabel(userRole)}</span>) does not have permission to access this page.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 text-xs border border-neutral-200 text-left space-y-1 shadow-2xs">
          <p className="font-bold text-neutral-800">Role Security Policy:</p>
          <p className="text-neutral-500 text-[11px] leading-relaxed">
            Each account type is automatically routed to its dedicated workspace. You will be redirected to your authorized home page.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onNavigateToDefault}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
          >
            <Home className="h-4 w-4 text-emerald-400" />
            <span>Go to Authorized {getDefaultPageTitle(userRole)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
