import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, ArrowRight, ChevronLeft, Building2, Store, Sparkles, UserCheck, X } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User } from '../../types';
import { SukLogo } from '../common/SukLogo';
import { getHomeRoute } from '../../lib/utils';

interface SignInPageProps {
  onNavigate: (path: string) => void;
  onAuthSuccess: (user: User) => void;
}

export function SignInPage({ onNavigate, onAuthSuccess }: SignInPageProps) {
  const [rememberedInfo, setRememberedInfo] = useState<{ email?: string; phone?: string; name?: string } | null>(() => {
    return storage.getRememberedSignInInfo();
  });

  const [identifier, setIdentifier] = useState(() => {
    const info = storage.getRememberedSignInInfo();
    return info ? info.phone || info.email || '' : '';
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const users = storage.getUsers();

  const handleLoginUser = (user: User) => {
    storage.login(user.id);
    onAuthSuccess(user);
  };

  const handleClearRememberedInfo = () => {
    storage.clearRememberedSignInInfo();
    setRememberedInfo(null);
    setIdentifier('');
  };

  const handleHomeClick = () => {
    const currentUser = storage.getCurrentUser();
    const isAuthenticated = storage.isAuthenticated();
    onNavigate(getHomeRoute(currentUser?.role, isAuthenticated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = identifier.trim().toLowerCase();

    if (!cleanInput) {
      setError('Please enter your email or phone number.');
      return;
    }

    setLoading(true);

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        (u.phone && u.phone.replace(/[^0-9]/g, '').includes(cleanInput.replace(/[^0-9]/g, '')))
    );

    if (!user) {
      setError('Account not found. Please check your credentials or click "Get Started" to register.');
      setLoading(false);
      return;
    }

    // Process successful sign in
    handleLoginUser(user);
  };

  // Pre-configured accounts for quick testing
  const bizUser = users.find((u) => u.role === 'business_owner') || users[0];
  const resellerUser = users.find((u) => u.role === 'reseller') || users[1];

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="mx-auto max-w-md w-full flex items-center justify-between mb-6">
        <button
          onClick={handleHomeClick}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="cursor-pointer" onClick={handleHomeClick}>
          <SukLogo size="sm" />
        </div>
      </div>

      {/* Main Sign In Card */}
      <div className="mx-auto max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-neutral-900">Welcome Back</h1>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            Sign in to access your business or creator dashboard
          </p>
        </div>

        {rememberedInfo && (rememberedInfo.name || rememberedInfo.phone || rememberedInfo.email) && (
          <div className="mb-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-3.5 flex items-center justify-between text-xs transition-all">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-neutral-900 truncate">
                  {rememberedInfo.name || 'Remembered Account'}
                </p>
                <p className="text-[11px] text-neutral-600 truncate">
                  {rememberedInfo.phone || rememberedInfo.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearRememberedInfo}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg px-2.5 py-1 transition-all shrink-0 ml-2 shadow-2xs"
            >
              <X className="h-3 w-3 text-neutral-400" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. abebe@example.com or +251911234567"
                className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 active:scale-98 transition-all shadow-md mt-6"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-3 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Quick Demo 1-Click Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {bizUser && (
              <button
                type="button"
                onClick={() => handleLoginUser(bizUser)}
                className="flex flex-col items-start p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Business</span>
                </div>
                <span className="text-[10px] text-neutral-500 truncate mt-0.5 w-full">{bizUser.name}</span>
              </button>
            )}

            {resellerUser && (
              <button
                type="button"
                onClick={() => handleLoginUser(resellerUser)}
                className="flex flex-col items-start p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Store className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Creator</span>
                </div>
                <span className="text-[10px] text-neutral-500 truncate mt-0.5 w-full">{resellerUser.name}</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('/get-started')}
            className="font-bold text-emerald-700 hover:underline"
          >
            Get Started
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400 mt-6">
        SUK Platform • Connect Businesses & Creators
      </div>
    </div>
  );
}
