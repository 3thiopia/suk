import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Store, Globe, DollarSign, Bell } from 'lucide-react';
import { storage } from '../../lib/storage';

export function ResellerSettings() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [storeName, setStoreName] = useState(storefront?.storeName || '');
  const [slug, setSlug] = useState(storefront?.slug || '');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!storefront) {
    return <div className="p-8 text-center text-xs text-neutral-500">Storefront profile not found.</div>;
  }

  const handleSave = () => {
    storage.updateStorefront(storefront.id, {
      storeName,
      slug,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-black text-neutral-900">Creator Storefront Settings</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Configure store domain URL, store name, payout bank details, and notification preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
        >
          <Save className="h-4 w-4 text-emerald-400" />
          <span>Save Preferences</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Storefront settings saved successfully!
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Domain & Brand Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm border-b pb-3">
            <Store className="h-4 w-4 text-emerald-600" />
            Storefront Identity & URL
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Public URL Slug</label>
              <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1 pl-3">
                <span className="text-neutral-400 font-mono text-xs">/store/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent p-1.5 font-mono font-bold text-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payout & Bank Info */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm border-b pb-3">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Commission Payout Method
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Payout Account</label>
              <input
                type="text"
                value={currentUser.email}
                disabled
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 p-2.5 font-medium text-neutral-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
              Commissions are automatically settled monthly into your linked bank account upon customer delivery confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
