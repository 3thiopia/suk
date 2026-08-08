import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Phone, User as UserIcon, Mail, Building2, Store, Info } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User, UserRole } from '../../types';
import { SukLogo } from '../common/SukLogo';
import { getHomeRoute } from '../../lib/utils';

interface RegisterPageProps {
  initialRole?: UserRole;
  onNavigate: (path: string) => void;
  onAuthSuccess: (user: User) => void;
}

export function RegisterPage({ initialRole = 'reseller', onNavigate, onAuthSuccess }: RegisterPageProps) {
  const [role, setRole] = useState<UserRole>(initialRole === 'admin' ? 'reseller' : initialRole);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    if (role === 'business_owner' && !businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.trim();
      const userEmail = email.trim() || `${cleanPhone.replace(/[^0-9]/g, '') || Date.now()}@suk.et`;

      if (role === 'business_owner') {
        // Create Business Owner User
        const newUser = storage.createUser({
          name: fullName.trim(),
          phone: cleanPhone,
          email: userEmail,
          role: 'business_owner',
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        });

        // Create Initial Business Profile
        storage.createBusiness({
          ownerId: newUser.id,
          businessName: businessName.trim(),
          category: 'General',
          description: `${businessName.trim()} - Official Brand Supplier on SUK`,
        });

        // Login & redirect
        storage.setCurrentUser(newUser.id);
        onAuthSuccess(newUser);
      } else {
        // Create Reseller User
        const newUser = storage.createUser({
          name: fullName.trim(),
          phone: cleanPhone,
          email: userEmail,
          role: 'reseller',
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        });

        // Create Storefront
        const generatedStoreName = `${fullName.trim()}'s Store`;
        const generatedSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `store-${Date.now()}`;

        storage.createStorefront({
          resellerId: newUser.id,
          storeName: generatedStoreName,
          slug: generatedSlug,
          bannerTitle: `Welcome to ${generatedStoreName}`,
          bannerSubtitle: 'Curated products with fast delivery across Ethiopia',
        });

        // Login & redirect
        storage.login(newUser.id);
        onAuthSuccess(newUser);
      }
    } catch (err: any) {
      setError('An error occurred during account creation. Please try again.');
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    const currentUser = storage.getCurrentUser();
    const isAuthenticated = storage.isAuthenticated();
    onNavigate(getHomeRoute(currentUser?.role, isAuthenticated));
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="mx-auto max-w-lg w-full flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/get-started')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="cursor-pointer" onClick={handleHomeClick}>
          <SukLogo size="sm" />
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="mx-auto max-w-lg w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
        {/* Role Switcher Tabs */}
        <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 border border-neutral-200/80">
          <button
            type="button"
            onClick={() => {
              setRole('business_owner');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
              role === 'business_owner'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Business Owner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('reseller');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
              role === 'reseller'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Store className="h-3.5 w-3.5 text-emerald-600" />
            <span>Creator</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            {role === 'business_owner' ? 'Register Business' : 'Register as Creator'}
          </h1>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {role === 'business_owner'
              ? 'Sell your products through a network of creators'
              : 'Start your storefront and earn sales commission'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name (Business Owner Only) */}
          {role === 'business_owner' && (
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Addis Electronics Wholesalers"
                  className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Full Name (Required) */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Number (Required) */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +251 91 123 4567"
                className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Number Notice Callout */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
              <strong>Please use your own phone number.</strong> We will use this number to contact you regarding your account. Phone verification (OTP) will be added in a future update.
            </p>
          </div>

          {/* Email Address (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-neutral-800">Email Address</label>
              <span className="text-[10px] font-semibold text-neutral-400">Optional</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. abebe@example.com"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('/signin')}
            className="font-bold text-emerald-700 hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>

      {/* Footer minimal credit */}
      <div className="text-center text-[11px] text-neutral-400 mt-6">
        SUK E-Commerce Platform • Fast 1-Minute Registration
      </div>
    </div>
  );
}
