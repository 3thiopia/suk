import React, { useState, useEffect } from 'react';
import {
  Link2,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  X,
  History,
} from 'lucide-react';
import { Storefront } from '../../types';
import { storage } from '../../lib/storage';
import {
  normalizeSlug,
  isSlugAvailable,
  isSlugReserved,
  generateSlugSuggestions,
  getStorefrontDomain,
  getStorefrontFullDomain,
} from '../../lib/subdomain';

interface ManageStoreSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  storefront: Storefront;
  onUpdated?: (updatedStorefront: Storefront) => void;
}

export function ManageStoreSlugModal({
  isOpen,
  onClose,
  storefront,
  onUpdated,
}: ManageStoreSlugModalProps) {
  const domain = getStorefrontDomain();
  const [inputSlug, setInputSlug] = useState(storefront.slug);
  const [normalized, setNormalized] = useState(storefront.slug);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(true);
  const [isReserved, setIsReserved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputSlug(storefront.slug);
      setNormalized(storefront.slug);
      setIsAvailable(true);
      setIsReserved(false);
      setStep('edit');
      setErrorMsg('');
    }
  }, [isOpen, storefront]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputSlug(val);
    const clean = normalizeSlug(val);
    setNormalized(clean);

    if (!clean) {
      setIsAvailable(null);
      setIsReserved(false);
      setErrorMsg('Storefront slug cannot be empty');
      return;
    }

    if (clean.length < 2) {
      setIsAvailable(false);
      setIsReserved(false);
      setErrorMsg('Slug must be at least 2 characters long');
      return;
    }

    const reserved = isSlugReserved(clean);
    setIsReserved(reserved);

    if (reserved) {
      setIsAvailable(false);
      setErrorMsg(`"${clean}" is a reserved system keyword. Please choose another name.`);
      setSuggestions(generateSlugSuggestions(clean, storefront.id));
      return;
    }

    const available = isSlugAvailable(clean, storefront.id);
    setIsAvailable(available);

    if (!available) {
      setErrorMsg(`"${clean}.${domain}" is already registered by another creator.`);
      setSuggestions(generateSlugSuggestions(clean, storefront.id));
    } else {
      setErrorMsg('');
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggested: string) => {
    setInputSlug(suggested);
    setNormalized(suggested);
    setIsAvailable(true);
    setIsReserved(false);
    setErrorMsg('');
    setSuggestions([]);
  };

  const handleProceedToConfirm = () => {
    if (!normalized || !isAvailable) return;
    if (normalized === storefront.slug) {
      onClose();
      return;
    }
    setStep('confirm');
  };

  const handleSaveSlug = () => {
    if (!normalized || !isAvailable) return;

    // Update in storage
    storage.updateStorefront(storefront.id, {
      slug: normalized,
      storeDomain: `${normalized}.${domain}`,
    });

    const updated = storage.getStorefronts().find((s) => s.id === storefront.id) || storefront;
    if (onUpdated) {
      onUpdated(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Storefront Subdomain</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage your unique web address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'edit' ? (
          <>
            {/* Current Active Subdomain */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Storefront Link</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{getStorefrontFullDomain(storefront.slug)}</span>
              </div>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-200/50">
                Active
              </span>
            </div>

            {/* Input Slug */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Change Storefront Slug
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputSlug}
                  onChange={handleInputChange}
                  placeholder="e.g. abebe-fashion"
                  className={`w-full pl-3 pr-28 py-2.5 bg-white dark:bg-slate-800 border text-xs font-mono rounded-xl focus:outline-none transition-all ${
                    isAvailable === false
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                      : isAvailable === true && normalized !== storefront.slug
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                />
                <div className="absolute right-3 flex items-center gap-1.5 text-xs text-slate-400 font-mono select-none">
                  .{domain}
                  {isAvailable === true && normalized !== storefront.slug && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {isAvailable === false && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Real-time preview */}
              {normalized && (
                <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  Full Address:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    https://{normalized}.{domain}
                  </strong>
                </p>
              )}

              {/* Error / Validation Msg */}
              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Suggestions Chips if taken or reserved */}
            {suggestions.length > 0 && (
              <div className="space-y-2 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Suggested Available Alternatives:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSelectSuggestion(sug)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-200 dark:border-amber-700 rounded-lg text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition-colors"
                    >
                      {sug}.{domain}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Aliases Info */}
            {storefront.previousSlugs && storefront.previousSlugs.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Historical Domain Aliases (Auto-Redirects)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {storefront.previousSlugs.map((prev) => (
                    <span
                      key={prev}
                      className="px-2 py-0.5 bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-mono rounded"
                    >
                      {prev}.{domain}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Customers visiting your previous URLs will automatically redirect to your current storefront address.
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToConfirm}
                disabled={!normalized || !isAvailable || normalized === storefront.slug}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Step */
          <div className="space-y-5">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                Confirm Storefront Link Change
              </div>
              <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
                <strong>Changing your store link may affect links you've already shared.</strong>
              </p>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/60 text-xs font-mono space-y-1">
                <div className="text-slate-500 line-through">
                  Old: https://{storefront.slug}.{domain}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                  New: https://{normalized}.{domain}
                </div>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                ✓ Your previous URL (<code className="font-bold">{storefront.slug}.{domain}</code>) will be saved as an auto-redirect alias so past customers won't lose access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setStep('edit')}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSaveSlug}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Update URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
