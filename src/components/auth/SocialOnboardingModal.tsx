import React, { useState } from 'react';
import { Building2, Store, User as UserIcon, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { User, UserRole } from '../../types';
import { storage } from '../../lib/storage';

interface SocialOnboardingModalProps {
  isOpen: boolean;
  currentUser: User;
  onComplete: (updatedUser: User) => void;
}

export function SocialOnboardingModal({ isOpen, currentUser, onComplete }: SocialOnboardingModalProps) {
  const [role, setRole] = useState<UserRole>('reseller');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [businessOrStoreName, setBusinessOrStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

    if (!businessOrStoreName.trim()) {
      setError(
        role === 'business_owner'
          ? 'Please enter your business name.'
          : 'Please enter your store name.'
      );
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.trim();
      const cleanName = fullName.trim();
      const cleanBusinessName = businessOrStoreName.trim();

      // Update user object with selected role and profile data
      const updatedUser: User = {
        ...currentUser,
        name: cleanName,
        phone: cleanPhone,
        role: role,
        status: 'active',
      };

      // Save updated profile
      storage.updateUser(currentUser.id, {
        name: cleanName,
        phone: cleanPhone,
        role: role,
      });

      if (role === 'business_owner') {
        storage.createBusiness({
          ownerId: currentUser.id,
          businessName: cleanBusinessName,
          category: 'General',
          description: `${cleanBusinessName} - Official Brand Supplier on SUK`,
        });
      } else {
        const generatedSlug = cleanBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `store-${Date.now()}`;
        storage.createStorefront({
          resellerId: currentUser.id,
          storeName: cleanBusinessName,
          slug: generatedSlug,
          bannerTitle: `Welcome to ${cleanBusinessName}`,
          bannerSubtitle: 'Curated products with fast delivery across Ethiopia',
        });
      }

      storage.login(currentUser.id);
      onComplete(updatedUser);
    } catch (err: any) {
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-neutral-900">Complete Your Setup</h2>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            Welcome to SUK! Please provide a few final details to set up your account.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 border border-neutral-200/80">
          <button
            type="button"
            onClick={() => setRole('reseller')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
              role === 'reseller'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Store className="h-3.5 w-3.5 text-emerald-600" />
            <span>Creator</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('business_owner')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold transition-all ${
              role === 'business_owner'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Business Owner</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business or Store Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              {role === 'business_owner' ? 'Business Name' : 'Storefront Name'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              {role === 'business_owner' ? (
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              ) : (
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              )}
              <input
                type="text"
                required
                value={businessOrStoreName}
                onChange={(e) => setBusinessOrStoreName(e.target.value)}
                placeholder={
                  role === 'business_owner'
                    ? 'e.g. Addis Fashion Wholesalers'
                    : 'e.g. Abebe\'s Curated Store'
                }
                className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Full Name */}
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

          {/* Phone Number */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 active:scale-98 transition-all shadow-md mt-6"
          >
            {loading ? (
              <span>Saving Setup...</span>
            ) : (
              <>
                <span>Complete Account Setup</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
