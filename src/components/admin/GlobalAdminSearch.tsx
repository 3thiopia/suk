import React, { useState } from 'react';
import { Search, Building2, Store, Package, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import { storage } from '../../lib/storage';

interface GlobalAdminSearchProps {
  onSelectResult: (tab: string, entityId?: string) => void;
}

export function GlobalAdminSearch({ onSelectResult }: GlobalAdminSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const businesses = storage.getBusinesses();
  const storefronts = storage.getStorefronts();
  const products = storage.getProducts();
  const orders = storage.getOrders();
  const disputes = storage.getDisputes();

  const trimmed = (query || '').trim().toLowerCase();

  const matchingBusinesses = trimmed
    ? businesses.filter((b) => (b.businessName || '').toLowerCase().includes(trimmed) || (b.category || '').toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const matchingResellers = trimmed
    ? storefronts.filter((sf) => (sf.storeName || '').toLowerCase().includes(trimmed) || (sf.slug || '').toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const matchingProducts = trimmed
    ? products.filter((p) => (p.title || '').toLowerCase().includes(trimmed) || (p.brand || '').toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const matchingOrders = trimmed
    ? orders.filter((o) => (o.id || '').toLowerCase().includes(trimmed) || (o.customerName || '').toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const matchingDisputes = trimmed
    ? disputes.filter((d) => (d.id || '').toLowerCase().includes(trimmed) || (d.reason || '').toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const hasResults =
    matchingBusinesses.length > 0 ||
    matchingResellers.length > 0 ||
    matchingProducts.length > 0 ||
    matchingOrders.length > 0 ||
    matchingDisputes.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Global Admin Search (Brands, Resellers, Orders...)"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="h-9 w-72 rounded-xl border border-neutral-200 bg-neutral-100/80 pl-9 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
        />
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 top-11 z-50 w-96 max-h-96 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl space-y-3">
          {!hasResults ? (
            <p className="p-3 text-center text-xs text-neutral-400">No matching platform records found for "{query}"</p>
          ) : (
            <>
              {matchingBusinesses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Supplier Brands
                  </span>
                  {matchingBusinesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectResult('businesses');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 text-left text-xs"
                    >
                      <span className="font-bold text-neutral-900">{b.businessName}</span>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}

              {matchingResellers.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
                    <Store className="h-3 w-3" /> Resellers
                  </span>
                  {matchingResellers.map((sf) => (
                    <button
                      key={sf.id}
                      onClick={() => {
                        onSelectResult('resellers');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 text-left text-xs"
                    >
                      <span className="font-bold text-neutral-900">{sf.storeName}</span>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}

              {matchingProducts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
                    <Package className="h-3 w-3" /> Products
                  </span>
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectResult('products');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 text-left text-xs"
                    >
                      <span className="font-bold text-neutral-900 truncate">{p.title}</span>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}

              {matchingOrders.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" /> Orders
                  </span>
                  {matchingOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        onSelectResult('orders');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 text-left text-xs"
                    >
                      <span className="font-bold text-neutral-900">#{o.id} ({o.customerName})</span>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}

              {matchingDisputes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Disputes
                  </span>
                  {matchingDisputes.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectResult('disputes');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 text-left text-xs"
                    >
                      <span className="font-bold text-neutral-900">Dispute #{d.id} ({d.reason})</span>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
