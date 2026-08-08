import React, { useState } from 'react';
import { Building2, Upload, Globe, Check, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { storage } from '../../lib/storage';
import { SingleImageUploader } from '../common/SingleImageUploader';

const SAMPLE_LOGOS = [
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
];

const SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
];

export function BusinessProfileEditor() {
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    businessName: business?.businessName || '',
    category: business?.category || 'Electronics & Audio',
    description: business?.description || '',
    website: business?.website || '',
    logoUrl: business?.logoUrl || SAMPLE_LOGOS[0],
    bannerUrl: business?.bannerUrl || SAMPLE_BANNERS[0],
    defaultCommissionRate: business?.defaultCommissionRate || 15,
  });

  if (!business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateBusinessProfile(business.id, formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Brand Business Profile</h1>
          <p className="text-xs text-neutral-500">
            Manage your supplier brand identity, logo artwork, banner, and public bio visible to resellers.
          </p>
        </div>
        <a
          href={`#/supplier/${business.id}`}
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = `/supplier/${business.id}`;
            // trigger hashchange / navigation
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
          <span>Preview Public Supplier Profile</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        {/* Banner Preview */}
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 h-40 bg-neutral-100">
          <img src={formData.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-neutral-900/30 flex items-end p-4">
            <div className="flex items-center gap-3">
              <img src={formData.logoUrl} alt="Logo" className="h-14 w-14 rounded-xl object-cover border-2 border-white shadow-md" />
              <div className="text-white drop-shadow-md">
                <h3 className="font-bold text-base">{formData.businessName || 'Business Name'}</h3>
                <p className="text-xs text-neutral-200">{formData.category}</p>
              </div>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <Check className="h-4 w-4 text-emerald-600" />
            Business profile successfully updated!
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-neutral-800">Business Name *</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800">Industry Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="Electronics & Audio">Electronics & Audio</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Apparel & Accessories">Apparel & Accessories</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800">Brand Description *</label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-neutral-800">Official Website URL</label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-950">Default Reseller Commission Rate (%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              required
              value={formData.defaultCommissionRate}
              onChange={(e) => setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-bold"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Default commission percentage paid to resellers when a product has no specific override.
            </p>
          </div>
        </div>

        {/* Direct Image Uploaders */}
        <SingleImageUploader
          value={formData.logoUrl}
          onChange={(url) => setFormData({ ...formData, logoUrl: url })}
          label="Official Brand Logo *"
          description="Upload your company or brand logo."
          aspectRatio="square"
        />

        <SingleImageUploader
          value={formData.bannerUrl}
          onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
          label="Marketplace Banner Artwork"
          description="Upload banner header image displayed to resellers in the brand marketplace."
          aspectRatio="banner"
        />

        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
          >
            Save Brand Profile
          </button>
        </div>
      </form>
    </div>
  );
}
