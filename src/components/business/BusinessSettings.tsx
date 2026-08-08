import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Shield, Truck, Mail, Bell, CreditCard, Building } from 'lucide-react';
import { storage } from '../../lib/storage';

export function BusinessSettings() {
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  const [fulfillmentSLA, setFulfillmentSLA] = useState('24_hours');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [returnPolicyDays, setReturnPolicyDays] = useState(30);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!business) {
    return <div className="p-8 text-center text-xs text-neutral-500">Business profile not found.</div>;
  }

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-black text-neutral-900">Brand Operations Settings</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Configure order auto-acceptance, fulfillment SLAs, return windows, and notification preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
        >
          <Save className="h-4 w-4 text-emerald-400" />
          <span>Save Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Brand operation preferences saved successfully!
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fulfillment & SLA Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm border-b pb-3">
            <Truck className="h-4 w-4 text-emerald-600" />
            Fulfillment SLA & Automation
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Target Dispatch SLA Window</label>
              <select
                value={fulfillmentSLA}
                onChange={(e) => setFulfillmentSLA(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-medium text-neutral-900 focus:bg-white focus:outline-none"
              >
                <option value="12_hours">12 Hours (Same Day Dispatch)</option>
                <option value="24_hours">24 Hours (Next Day Dispatch)</option>
                <option value="48_hours">48 Hours (Standard)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <div>
                <p className="font-bold text-neutral-800">Auto-Accept Reseller Orders</p>
                <p className="text-[11px] text-neutral-500">Automatically accept orders when inventory is available</p>
              </div>
              <input
                type="checkbox"
                checked={autoAcceptOrders}
                onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                className="h-4 w-4 rounded accent-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Customer & Return Policy */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm border-b pb-3">
            <Shield className="h-4 w-4 text-emerald-600" />
            Returns & Warranty SLA
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Return Window (Days)</label>
              <input
                type="number"
                value={returnPolicyDays}
                onChange={(e) => setReturnPolicyDays(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-mono text-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
              <strong>Brand Warranty Guarantee:</strong> All orders shipped through Suk marketplace include brand supplier fulfillment warranty.
            </div>
          </div>
        </div>

        {/* Notifications & Dispatch Alerts */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs md:col-span-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm border-b pb-3">
            <Bell className="h-4 w-4 text-emerald-600" />
            Order Alerts & Communication
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <div>
                <p className="font-bold text-neutral-800">Instant Email Order Alerts</p>
                <p className="text-[11px] text-neutral-500">Receive instant email whenever a reseller places an order</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <div>
                <p className="font-bold text-neutral-800">Weekly Performance Report</p>
                <p className="text-[11px] text-neutral-500">Weekly email breakdown of fulfillment speeds and revenue</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-neutral-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
