import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Search, RefreshCw, Save, Plus, Minus, Layers } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';

export function BusinessInventory() {
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  if (!business) {
    return <div className="p-8 text-center text-xs text-neutral-500">Business profile not found.</div>;
  }

  const products = storage.getProductsByBusinessId(business.id);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const stockVal = stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stock;

    let matchesStock = true;
    if (filterStock === 'low') matchesStock = stockVal > 0 && stockVal <= 10;
    if (filterStock === 'out') matchesStock = stockVal === 0;
    if (filterStock === 'in') matchesStock = stockVal > 10;

    return matchesSearch && matchesStock;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const inStockCount = products.filter((p) => p.stock > 10).length;

  const handleStockChange = (productId: string, newStock: number) => {
    const val = Math.max(0, newStock);
    setStockEdits((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleSaveInventory = () => {
    Object.entries(stockEdits).forEach(([productId, stockVal]) => {
      const numVal = Number(stockVal) || 0;
      const status = numVal === 0 ? 'out_of_stock' : 'active';
      storage.updateProduct(productId, { stock: numVal, status });
    });
    setStockEdits({});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const hasEdits = Object.keys(stockEdits).length > 0;

  const inventoryColumns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product Details',
      priority: 'primary',
      cell: (product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-10 w-10 rounded-xl object-cover border shrink-0"
          />
          <div>
            <p className="font-bold text-neutral-900">{product.title}</p>
            <span className="text-[10px] text-neutral-400">
              {product.brand} • {product.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Wholesale Price',
      priority: 'secondary',
      cell: (product) => (
        <span className="font-extrabold text-neutral-900">{formatCurrency(product.price)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Current Stock',
      priority: 'secondary',
      cell: (product) => {
        const currentVal = stockEdits[product.id] !== undefined ? stockEdits[product.id] : product.stock;
        return (
          <div>
            <span className="font-mono font-bold text-sm text-neutral-900">{currentVal}</span>
            {stockEdits[product.id] !== undefined && (
              <span className="ml-2 text-[10px] font-bold text-amber-600">(edited)</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Stock Status',
      priority: 'secondary',
      cell: (product) => {
        const currentVal = stockEdits[product.id] !== undefined ? stockEdits[product.id] : product.stock;
        if (currentVal === 0) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
              Out of Stock
            </span>
          );
        }
        if (currentVal <= 10) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              Low Stock Alert
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            In Stock
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Quick Adjust Inventory',
      priority: 'optional',
      align: 'right',
      cell: (product) => {
        const currentVal = stockEdits[product.id] !== undefined ? stockEdits[product.id] : product.stock;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleStockChange(product.id, currentVal - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              title="Decrease by 1"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              value={currentVal}
              onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
              className="w-16 rounded-lg border border-neutral-300 py-1 text-center font-mono text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
            <button
              onClick={() => handleStockChange(product.id, currentVal + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              title="Increase by 1"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleStockChange(product.id, currentVal + 10)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100"
            >
              +10
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-black text-neutral-900">Inventory & Stock Control</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Real-time warehouse inventory management for {business.businessName}. Track reserve levels and prevent stockouts on reseller storefronts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasEdits && (
            <button
              onClick={handleSaveInventory}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
            >
              <Save className="h-4 w-4 text-emerald-400" />
              <span>Save Changes ({Object.keys(stockEdits).length})</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Inventory levels updated successfully across all reseller storefront sync feeds!
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <button
          onClick={() => setFilterStock('all')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterStock === 'all' ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' : 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Products</span>
          <p className="text-2xl font-black mt-1">{products.length}</p>
        </button>

        <button
          onClick={() => setFilterStock('in')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterStock === 'in' ? 'border-emerald-700 bg-emerald-700 text-white shadow-md' : 'border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Healthy Stock</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-1">{inStockCount}</p>
        </button>

        <button
          onClick={() => setFilterStock('low')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterStock === 'low' ? 'border-amber-600 bg-amber-600 text-white shadow-md' : 'border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Low Stock (&le;10)</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black mt-1">{lowStockCount}</p>
        </button>

        <button
          onClick={() => setFilterStock('out')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterStock === 'out' ? 'border-rose-600 bg-rose-600 text-white shadow-md' : 'border-rose-200 bg-rose-50/50 text-rose-900 hover:bg-rose-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Out of Stock</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black mt-1">{outOfStockCount}</p>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search items by title, brand, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 shadow-2xs"
        />
      </div>

      {/* Responsive Inventory Data Table */}
      <ResponsiveDataTable
        data={filteredProducts}
        columns={inventoryColumns}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        emptyTitle="No Inventory Items Found"
        emptyDescription="No products match your current stock filter or search query."
      />
    </div>
  );
}
