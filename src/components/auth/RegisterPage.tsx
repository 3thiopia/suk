import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Phone, User as UserIcon, Mail, Building2, Store, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User, UserRole } from '../../types';
import { SukLogo } from '../common/SukLogo';
import { getHomeRoute } from '../../lib/utils';
import { signUpWithSupabase, signInWithGoogle } from '../../lib/supabase/auth';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from './PasswordStrengthIndicator';

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
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('A valid email address is required for password recovery and account security.');
      return;
    }

    if (role === 'business_owner' && !businessName.trim()) {
      setError('Please enter your official business/store name.');
      return;
    }

    if (!password) {
      setError('Please create a password for your account.');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Please choose a stronger password matching the security criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password field.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.trim();
      const cleanName = fullName.trim();
      const targetBusinessName = role === 'business_owner' ? businessName.trim() : (storeName.trim() || `${cleanName}'s Store`);

      // Call Supabase Auth - Passwords are NEVER saved in localStorage or profile tables
      const res = await signUpWithSupabase({
        email: cleanEmail,
        password,
        name: cleanName,
        role,
        phone: cleanPhone,
        businessName: targetBusinessName,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.needsEmailVerification) {
        setVerificationRequired(true);
        setLoading(false);
        return;
      }

      // If user profile object was generated/returned
      let authenticatedUser = res.user;

      if (!authenticatedUser) {
        // Fallback local storage sync if offline or development mode
        if (role === 'business_owner') {
          const newUser = storage.createUser({
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            role: 'business_owner',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          });

          storage.createBusiness({
            ownerId: newUser.id,
            businessName: targetBusinessName,
            category: 'General',
            description: `${targetBusinessName} - Official Brand Supplier on SUK`,
          });

          authenticatedUser = newUser;
        } else {
          const newUser = storage.createUser({
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            role: 'reseller',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          });

          const generatedSlug = targetBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `store-${Date.now()}`;
          storage.createStorefront({
            resellerId: newUser.id,
            storeName: targetBusinessName,
            slug: generatedSlug,
            bannerTitle: `Welcome to ${targetBusinessName}`,
            bannerSubtitle: 'Curated products with fast delivery across Ethiopia',
          });

          authenticatedUser = newUser;
        }
      }

      // Login session
      storage.login(authenticatedUser.id);
      onAuthSuccess(authenticatedUser);
    } catch (err: any) {
      setError('An error occurred during account creation. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setError(res.error);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError('Unable to initiate Google registration. Please try again.');
      setGoogleLoading(false);
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

      {/* Main Card */}
      <div className="mx-auto max-w-lg w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
        {verificationRequired ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900">Verify Your Email Address</h2>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
              We've sent a verification link to <strong className="text-neutral-900">{email}</strong>.
              Please check your email inbox and click the verification link to activate your account before logging in.
            </p>

            <button
              onClick={() => onNavigate('/signin')}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 transition-all shadow-md"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
          </div>
        ) : (
          <div>
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
                  ? 'Sell your products through a network of creators across Ethiopia'
                  : 'Start your storefront and earn commission on every sale'}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-2.5 px-4 text-xs font-bold text-neutral-800 hover:bg-neutral-50 active:scale-98 transition-all shadow-2xs mb-5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Or fill registration form
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Name (Business Owner Only) */}
              {role === 'business_owner' ? (
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
              ) : (
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Storefront Name <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Abebe's Curated Fashion"
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

              {/* Email Address (MANDATORY) */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. abebe@example.com"
                    className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[10px] text-neutral-500 font-medium">
                  Email is required for password recovery and account security.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-neutral-200 pl-9 pr-10 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-neutral-200 pl-9 pr-10 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] font-bold text-rose-600">Passwords do not match.</p>
                )}
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
          </div>
        )}

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
        SUK E-Commerce Platform • Secure Authentication
      </div>
    </div>
  );
}

