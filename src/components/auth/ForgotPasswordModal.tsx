import React, { useState } from 'react';
import { X, Mail, ArrowRight, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { resetPasswordForEmail } from '../../lib/supabase/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetState = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100">
        <button
          onClick={handleResetState}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900">Check Your Email</h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
              We've sent a secure password reset link to{' '}
              <strong className="text-neutral-900">{email}</strong>. Please check your inbox and click the link to reset your password.
            </p>

            <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 text-left text-[11px] text-neutral-500">
              <span className="font-bold text-neutral-700">Didn't receive the email?</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
              </ul>
            </div>

            <button
              onClick={handleResetState}
              className="mt-6 w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
              <Lock className="h-6 w-6" />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-neutral-900">Reset Your Password</h3>
              <p className="mt-1 text-xs text-neutral-500 font-medium">
                Enter your account email address below to receive a password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. user@example.com"
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
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
