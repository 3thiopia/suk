import React from 'react';
import { Building2, Store, ArrowRight, ChevronLeft } from 'lucide-react';
import { SukLogo } from '../common/SukLogo';
import { storage } from '../../lib/storage';
import { getHomeRoute } from '../../lib/utils';

interface GetStartedPageProps {
  onNavigate: (path: string) => void;
}

export function GetStartedPage({ onNavigate }: GetStartedPageProps) {
  const handleHomeClick = () => {
    const currentUser = storage.getCurrentUser();
    const isAuthenticated = storage.isAuthenticated();
    onNavigate(getHomeRoute(currentUser?.role, isAuthenticated));
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="mx-auto max-w-4xl w-full flex items-center justify-between mb-8">
        <button
          onClick={handleHomeClick}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Landing Page</span>
        </button>

        <div className="cursor-pointer" onClick={handleHomeClick}>
          <SukLogo size="sm" />
        </div>

        <button
          onClick={() => onNavigate('/signin')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          Already registered? <span className="underline">Sign In</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-3xl w-full my-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            How would you like to use SUK?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium">
            Select your account type below to get started in less than a minute.
          </p>
        </div>

        {/* Two Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Business Owner Card */}
          <div
            onClick={() => onNavigate('/register?role=business_owner')}
            className="group cursor-pointer rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-5 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🏪</span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900">Business Owner</h2>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
                Sell your products through a network of creators across Ethiopia.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-emerald-600">
              <span>Register Business</span>
              <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Creator Card */}
          <div
            onClick={() => onNavigate('/register?role=reseller')}
            className="group cursor-pointer rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-5 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🤝</span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900">Creator</h2>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
                Build your own storefront, promote products from trusted businesses, grow your audience, and earn commission from every successful sale.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-emerald-600">
              <span>Register as Creator</span>
              <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400 mt-6">
        SUK Platform • Simple & Fast 1-Minute Onboarding
      </div>
    </div>
  );
}

