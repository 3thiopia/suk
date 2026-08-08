import React from 'react';
import { ShieldAlert, Store, ArrowRight, Home, Clock } from 'lucide-react';
import { Storefront } from '../../types';
import { getStorefrontDomain } from '../../lib/subdomain';

interface StoreUnavailableViewProps {
  storefront?: Storefront;
  onNavigate?: (path: string) => void;
}

export function StoreUnavailableView({ storefront, onNavigate }: StoreUnavailableViewProps) {
  const domain = getStorefrontDomain();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-900 dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        {/* Icon Header */}
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Store Logo if present */}
        {storefront && (
          <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <img
              src={storefront.logoUrl}
              alt={storefront.storeName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{storefront.storeName}</h3>
              <p className="text-[10px] font-mono text-slate-400">{storefront.slug}.{domain}</p>
            </div>
          </div>
        )}

        {/* Text Body */}
        <div className="space-y-2">
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Storefront Currently Unavailable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This storefront is currently undergoings maintenance or is temporarily inactive. Please check back again later or browse other verified sellers.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('/explore');
              } else {
                window.location.href = '/';
              }
            }}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            Explore Other Stores
          </button>
        </div>
      </div>
    </div>
  );
}
