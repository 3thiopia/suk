import React, { useState } from 'react';
import { Search, Package, Building2, Store, Tag, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { storage } from '../../lib/storage';
import { formatCurrency } from '../../lib/utils';
import { Product, BusinessProfile, Storefront } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string, params?: any) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  const products = storage.getProducts();
  const businesses = storage.getBusinesses();
  const storefronts = storage.getStorefronts();

  const trimmed = query.trim().toLowerCase();

  const matchedProducts = trimmed
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.brand.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.tags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];

  const matchedBusinesses = trimmed
    ? businesses.filter(
        (b) =>
          b.businessName.toLowerCase().includes(trimmed) ||
          b.category.toLowerCase().includes(trimmed) ||
          b.description.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedStorefronts = trimmed
    ? storefronts.filter(
        (s) =>
          s.storeName.toLowerCase().includes(trimmed) ||
          s.slug.toLowerCase().includes(trimmed) ||
          s.bannerTitle.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSelectProduct = (p: Product) => {
    onNavigate('/reseller/library', { productId: p.id });
    onClose();
  };

  const handleSelectBusiness = (b: BusinessProfile) => {
    onNavigate('/reseller/library', { businessId: b.id });
    onClose();
  };

  const handleSelectStorefront = (s: Storefront) => {
    onNavigate(`/store/${s.slug}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Marketplace Search" maxWidth="xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products, brands, business owners, categories, storefronts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
          />
        </div>

        {!trimmed ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Type to search across all products, brands, supplier businesses, and reseller storefronts...
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-6 divide-y divide-neutral-100 pr-1">
            {/* Products Section */}
            {matchedProducts.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Package className="h-3.5 w-3.5" />
                  Products ({matchedProducts.length})
                </div>
                <div className="space-y-1">
                  {matchedProducts.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="h-10 w-10 rounded-md object-cover border border-neutral-200" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{p.title}</p>
                          <p className="text-[11px] text-neutral-500">
                            {p.brand} • <span className="text-neutral-400">{p.category}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{formatCurrency(p.price)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Businesses Section */}
            {matchedBusinesses.length > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Building2 className="h-3.5 w-3.5" />
                  Business Owners ({matchedBusinesses.length})
                </div>
                <div className="space-y-1">
                  {matchedBusinesses.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBusiness(b)}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <img src={b.logoUrl} alt={b.businessName} className="h-9 w-9 rounded-lg object-cover border border-neutral-200" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{b.businessName}</p>
                          <p className="text-[11px] text-neutral-500">{b.category} • {b.followerCount} Followers</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storefronts Section */}
            {matchedStorefronts.length > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Store className="h-3.5 w-3.5" />
                  Reseller Storefronts ({matchedStorefronts.length})
                </div>
                <div className="space-y-1">
                  {matchedStorefronts.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStorefront(s)}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <img src={s.logoUrl} alt={s.storeName} className="h-9 w-9 rounded-lg object-cover border border-neutral-200" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{s.storeName}</p>
                          <p className="text-[11px] text-neutral-500">example.com/store/{s.slug}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length === 0 && matchedBusinesses.length === 0 && matchedStorefronts.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500">
                No matching products, businesses, or storefronts found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
