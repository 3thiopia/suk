import React from 'react';
import { X, Lock, Sparkles, Building2, Store, ArrowRight } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  actionText?: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  onNavigate,
  actionText = 'access reseller features and storefront tools',
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-2xs">
          <Lock className="h-7 w-7" />
        </div>

        <h3 className="text-xl font-extrabold text-neutral-900">Sign In Required</h3>
        <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
          Please sign in or create a free account to <span className="font-semibold text-neutral-900">{actionText}</span>.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              onNavigate('/get-started');
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('/signin');
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs font-extrabold text-neutral-800 hover:bg-neutral-50 active:scale-95 transition-all"
          >
            <span>Already have an account? Sign In</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-neutral-500">
          Customers shopping on storefronts do not need an account.
        </p>
      </div>
    </div>
  );
}
