import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { updatePasswordWithSupabase } from '../../lib/supabase/auth';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from './PasswordStrengthIndicator';
import { SukLogo } from '../common/SukLogo';

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!strength.isValid) {
      setError('Please choose a stronger password matching all security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      const res = await updatePasswordWithSupabase(password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError('An error occurred while updating your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="mx-auto max-w-md w-full flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/signin')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="cursor-pointer" onClick={() => onNavigate('/')}>
          <SukLogo size="sm" />
        </div>
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900">Password Updated!</h1>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
              Your account password has been updated successfully. You can now sign in with your new password.
            </p>

            <button
              onClick={() => onNavigate('/signin')}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 transition-all shadow-md"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-neutral-900">Set New Password</h1>
              <p className="mt-1 text-xs text-neutral-500 font-medium">
                Create a strong, unique password for your SUK account.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-neutral-400 mt-6">
        SUK E-Commerce Platform • Secure Account Recovery
      </div>
    </div>
  );
}
