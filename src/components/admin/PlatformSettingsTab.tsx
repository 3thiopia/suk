import React, { useState } from 'react';
import { Settings, Shield, Save, DollarSign, Mail, AlertTriangle } from 'lucide-react';
import { storage } from '../../lib/storage';
import { PlatformSettings } from '../../types';

export function PlatformSettingsTab() {
  const [settings, setSettings] = useState<PlatformSettings>(() => storage.getPlatformSettings());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updatePlatformSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform Global Configuration</h2>
          <p className="text-xs text-neutral-500">
            Control branding, default reseller commission rates, settlement payout limits, support contacts, and system availability.
          </p>
        </div>

        {isSaved && (
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
            ✓ Settings Saved & Broadcasted
          </span>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Branding & Marketplace Identity</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Marketplace Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none font-bold"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Branded as "Su<span className="text-emerald-600 font-bold">k</span>"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Support Email Contact</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Commission & Financial Rules</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Platform Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultCommissionRate}
                onChange={(e) => setSettings({ ...settings, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono font-bold"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Default markup split for marketplace resellers</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Min Payout Threshold ($)</label>
              <input
                type="number"
                value={settings.minPayoutThreshold}
                onChange={(e) => setSettings({ ...settings, minPayoutThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono font-bold"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Minimum accrued earnings to trigger monthly ACH transfer</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Operational Governance</h3>

          <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/50">
            <div>
              <p className="text-xs font-bold text-amber-900">Maintenance Mode</p>
              <p className="text-[11px] text-amber-700">When enabled, buyer checkouts are temporarily paused for system upgrades.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition-colors"
          >
            <Save className="h-4 w-4 text-emerald-400" /> Save Platform Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
