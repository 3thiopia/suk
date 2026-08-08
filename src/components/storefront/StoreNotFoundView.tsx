import React from 'react';
import { Store, ArrowRight, Home, ShoppingBag, LogIn, LayoutDashboard } from 'lucide-react';
import { storage } from '../../lib/storage';
import { getStorefrontDomain } from '../../lib/subdomain';

interface StoreNotFoundViewProps {
  slug?: string;
  onNavigate?: (path: string) => void;
}

export function StoreNotFoundView({ slug, onNavigate }: StoreNotFoundViewProps) {
  const domain = getStorefrontDomain();
  const currentUser = storage.getCurrentUser();
  const isAuthenticated = currentUser && currentUser.id !== 'guest';

  const allActiveStorefronts = storage
    .getStorefronts()
    .filter((s) => s.status === 'active' && !s.isDisabled)
    .slice(0, 4);

  const handleNav = (targetPath: string) => {
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.location.hash = targetPath;
      window.location.href = targetPath;
    }
  };

  const getDashboardInfo = () => {
    switch (currentUser?.role) {
      case 'reseller':
        return { path: '/reseller/analytics', label: 'Go to Creator Dashboard' };
      case 'business_owner':
        return { path: '/orders', label: 'Go to Business Dashboard' };
      case 'admin':
        return { path: '/admin/orders', label: 'Go to Admin Dashboard' };
      default:
        return { path: '/explore', label: 'Browse Marketplace' };
    }
  };

  const dashboardInfo = getDashboardInfo();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-900 dark:text-white">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Icon Header */}
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Store className="w-8 h-8 text-rose-500" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Storefront Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The storefront address{' '}
            {slug ? (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-mono font-bold rounded">
                {slug}.{domain}
              </code>
            ) : (
              'you requested'
            )}{' '}
            does not exist or may have been moved to a new address.
          </p>
        </div>

        {/* Authenticated User Banner Option */}
        {isAuthenticated && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                Logged in as {currentUser.name} ({currentUser.role.replace('_', ' ')})
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Return to your account control panel anytime.
              </p>
            </div>
            <button
              onClick={() => handleNav(dashboardInfo.path)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0 w-full sm:w-auto justify-center"
            >
              <LayoutDashboard className="w-4 h-4" />
              {dashboardInfo.label}
            </button>
          </div>
        )}

        {/* Discover Active Stores */}
        {allActiveStorefronts.length > 0 && (
          <div className="text-left space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Discover Verified SUK Storefronts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allActiveStorefronts.map((sf) => (
                <button
                  key={sf.id}
                  onClick={() => handleNav(`/store/${sf.slug}`)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-800 rounded-2xl flex items-center gap-3 transition-all text-left group"
                >
                  <img
                    src={sf.logoUrl}
                    alt={sf.storeName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600">
                      {sf.storeName}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {sf.slug}.{domain}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Working Navigation Action Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => handleNav('/')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500" />
            Back to SUK
          </button>

          <button
            onClick={() => handleNav('/explore')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Browse Marketplace
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => handleNav('/signin')}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800/50"
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
