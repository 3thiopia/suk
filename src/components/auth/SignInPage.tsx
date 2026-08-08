import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Building2, Store, Sparkles, UserCheck, X, AlertCircle } from 'lucide-react';
import { storage } from '../../lib/storage';
import { User } from '../../types';
import { SukLogo } from '../common/SukLogo';
import { getHomeRoute } from '../../lib/utils';
import { signInWithSupabase, signInWithGoogle } from '../../lib/supabase/auth';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface SignInPageProps {
  onNavigate: (path: string) => void;
  onAuthSuccess: (user: User) => void;
}

export function SignInPage({ onNavigate, onAuthSuccess }: SignInPageProps) {
  const [rememberedInfo, setRememberedInfo] = useState<{ email?: string; phone?: string; name?: string } | null>(() => {
    return storage.getRememberedSignInInfo();
  });

  const [email, setEmail] = useState(() => {
    const info = storage.getRememberedSignInInfo();
    return info ? info.email || '' : '';
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const users = storage.getUsers();

  const handleLoginUser = (user: User) => {
    if (rememberMe) {
      storage.saveRememberedSignInInfo({
        email: user.email,
        phone: user.phone,
        name: user.name,
      });
    } else {
      storage.clearRememberedSignInInfo();
    }
    storage.login(user.id);
    onAuthSuccess(user);
  };

  const handleClearRememberedInfo = () => {
    storage.clearRememberedSignInInfo();
    setRememberedInfo(null);
    setEmail('');
  };

  const handleHomeClick = () => {
    const currentUser = storage.getCurrentUser();
    const isAuthenticated = storage.isAuthenticated();
    onNavigate(getHomeRoute(currentUser?.role, isAuthenticated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Authenticate with Supabase Auth
      const res = await signInWithSupabase(cleanEmail, password);

      if (res.error) {
        // Fallback local account check if Supabase is offline or local simulation user matches
        const localUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (localUser) {
          handleLoginUser(localUser);
          setLoading(false);
          return;
        }

        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.user) {
        handleLoginUser(res.user);
      } else {
        setError('Unable to authenticate. Account not found.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setError(res.error);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError('Unable to initiate Google Sign In. Please try again.');
      setGoogleLoading(false);
    }
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

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
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
            Or sign in with email
          </div>
        </div>

        {rememberedInfo && (rememberedInfo.name || rememberedInfo.email) && (
          <div className="mb-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-3.5 flex items-center justify-between text-xs transition-all">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-neutral-900 truncate">
                  {rememberedInfo.name || 'Saved Account'}
                </p>
                <p className="text-[11px] text-neutral-600 truncate">
                  {rememberedInfo.email}
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
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Email Address
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
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-neutral-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          {/* Remember Email Option */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="rememberMe" className="text-xs text-neutral-600 font-medium cursor-pointer">
              Remember email for next time
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 active:scale-98 transition-all shadow-md mt-6"
          >
            {loading ? (
              <span>Authenticating...</span>
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
            <span>Quick Demo Access</span>
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
                  <span>Business Owner</span>
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={email}
      />

      <div className="text-center text-[11px] text-neutral-400 mt-6">
        SUK E-Commerce Platform • Secure Authentication
      </div>
    </div>
  );
}

