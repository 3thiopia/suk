import React, { useState, useMemo, useEffect } from 'react';
import { CategorySubcategorySelector } from '../common/CategorySubcategorySelector';
import { CompactFilterSection, FilterChip } from '../common/CompactFilterSection';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Archive,
  Package,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Sparkles,
  Scale,
  EyeOff,
  Info,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Copy,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  SlidersHorizontal,
  Layers,
  Clock,
  Coins,
  DollarSign,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Product, ProductStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ProductStatusBadge, AppealStatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { EmptyState } from '../common/EmptyState';
import { ProductAppealModal } from './ProductAppealModal';
import { MultiImageUploader } from '../common/MultiImageUploader';
import { useTranslation } from '../../lib/i18n/LanguageContext';

const SAMPLE_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
];

export function ProductManager() {
  const { t } = useTranslation();
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  // Persistent View Preference (Card View vs Table View)
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    if (!currentUser) return 'card';
    const saved = localStorage.getItem(`catalog_view_mode_${currentUser.id}`);
    if (saved === 'card' || saved === 'table') return saved;
    return 'card';
  });

  const handleSetViewMode = (mode: 'card' | 'table') => {
    setViewMode(mode);
    if (currentUser) {
      localStorage.setItem(`catalog_view_mode_${currentUser.id}`, mode);
    }
  };

  // Search & Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'commission'
  >('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Modal & Inspector States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [appealModalProduct, setAppealModalProduct] = useState<Product | null>(null);
  const [activeInspectorImage, setActiveInspectorImage] = useState<string>('');

  // Dropdown & Expand States
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Listen for global open-add-product-modal event (from mobile navbar floating action)
  useEffect(() => {
    const handleOpenAddEvent = () => {
      handleOpenCreateModal();
    };
    window.addEventListener('open-add-product-modal', handleOpenAddEvent);
    return () => window.removeEventListener('open-add-product-modal', handleOpenAddEvent);
  }, [business]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'Electronics',
    subcategory: 'Phones',
    description: '',
    price: 99.0,
    costPrice: 45.0,
    stock: 25,
    status: 'active' as ProductStatus,
    images: [SAMPLE_PRODUCT_IMAGES[0], SAMPLE_PRODUCT_IMAGES[1]] as string[],
    tags: 'wireless, premium',
    commissionRate: 15,
    commissionAmount: 0,
    commissionType: 'percentage' as 'percentage' | 'fixed',
  });

  if (!business) {
    return <div className="p-8 text-center text-sm text-neutral-500">Business profile missing.</div>;
  }

  const products = storage.getProductsByBusinessId(business.id);
  const categories = storage.getCategories();
  const hiddenProductsCount = products.filter((p) => p.isHidden).length;

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

        const matchesStatus =
          selectedStatus === 'all'
            ? true
            : selectedStatus === 'hidden'
            ? p.isHidden === true
            : p.status === selectedStatus && !p.isHidden;

        let matchesStock = true;
        if (stockFilter === 'in_stock') matchesStock = p.stock > 5;
        else if (stockFilter === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
        else if (stockFilter === 'out_of_stock') matchesStock = p.stock === 0;

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'stock_asc') return a.stock - b.stock;
        if (sortBy === 'stock_desc') return b.stock - a.stock;
        if (sortBy === 'commission') {
          const commA = a.commissionAmount || (a.price * (a.commissionRate || 0)) / 100;
          const commB = b.commissionAmount || (b.price * (b.commissionRate || 0)) / 100;
          return commB - commA;
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, stockFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, stockFilter, sortBy, itemsPerPage]);

  // Active Filter Chips & Count
  const productActiveChips = useMemo(() => {
    const chips: FilterChip[] = [];
    if (selectedCategory !== 'all') {
      chips.push({
        id: 'category',
        label: `Category: ${selectedCategory}`,
        onRemove: () => setSelectedCategory('all'),
      });
    }
    if (selectedStatus !== 'all') {
      chips.push({
        id: 'status',
        label: `Status: ${selectedStatus.replace(/_/g, ' ')}`,
        onRemove: () => setSelectedStatus('all'),
      });
    }
    if (stockFilter !== 'all') {
      chips.push({
        id: 'stock',
        label: `Stock: ${stockFilter.replace(/_/g, ' ')}`,
        onRemove: () => setStockFilter('all'),
      });
    }
    return chips;
  }, [selectedCategory, selectedStatus, stockFilter]);

  const activeFiltersCount = productActiveChips.length;

  // Paginated View
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      brand: business.businessName,
      category: 'Electronics',
      subcategory: 'Phones',
      description: '',
      price: 149.0,
      costPrice: 60.0,
      stock: 50,
      status: 'active',
      images: [SAMPLE_PRODUCT_IMAGES[0], SAMPLE_PRODUCT_IMAGES[1]],
      tags: 'new, featured',
      commissionRate: business.defaultCommissionRate || 15,
      commissionAmount: 0,
      commissionType: 'percentage',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const hasFixedAmount = typeof product.commissionAmount === 'number' && product.commissionAmount > 0;
    setFormData({
      title: product.title,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description,
      price: product.price,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      status: product.status,
      images: product.images && product.images.length > 0 ? [...product.images] : [SAMPLE_PRODUCT_IMAGES[0]],
      tags: (product.tags || []).join(', '),
      commissionRate: product.commissionRate || business.defaultCommissionRate || 15,
      commissionAmount: product.commissionAmount || 0,
      commissionType: hasFixedAmount ? 'fixed' : 'percentage',
    });
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const newTitle = `${product.title} (Copy)`;
    storage.createProduct({
      businessId: business.id,
      businessName: business.businessName,
      businessLogo: business.logoUrl,
      title: newTitle,
      brand: product.brand || business.businessName,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      status: product.status,
      images: product.images && product.images.length > 0 ? [...product.images] : [SAMPLE_PRODUCT_IMAGES[0]],
      tags: [...(product.tags || [])],
      commissionRate: product.commissionRate,
      commissionAmount: product.commissionAmount,
    });
    showToast(`Product duplicated as "${newTitle}"`);
    setOpenDropdownId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageList = formData.images.filter((img) => img.trim().length > 0);
    if (imageList.length === 0) {
      imageList.push(SAMPLE_PRODUCT_IMAGES[0]);
    }

    const parsedTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const commRate = formData.commissionType === 'percentage' ? Number(formData.commissionRate) : undefined;
    const commAmt = formData.commissionType === 'fixed' ? Number(formData.commissionAmount) : undefined;

    if (editingProduct) {
      storage.updateProduct(editingProduct.id, {
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        status: formData.status,
        images: imageList,
        tags: parsedTags,
        commissionRate: commRate,
        commissionAmount: commAmt,
      });
      showToast(`Updated "${formData.title}" and synced to resellers`);
    } else {
      storage.createProduct({
        businessId: business.id,
        businessName: business.businessName,
        businessLogo: business.logoUrl,
        title: formData.title,
        brand: formData.brand || business.businessName,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        status: formData.status,
        images: imageList,
        tags: parsedTags,
        commissionRate: commRate,
        commissionAmount: commAmt,
      });
      showToast(`Created new product "${formData.title}"`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will remove it from all reseller storefronts.`)) {
      storage.deleteProduct(id);
      showToast(`Deleted "${title}"`);
    }
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTableColumnSort = (field: 'title' | 'category' | 'price' | 'stock' | 'updated') => {
    if (field === 'title') {
      setSortBy(sortBy === 'title_asc' ? 'title_desc' : 'title_asc');
    } else if (field === 'price') {
      setSortBy(sortBy === 'price_asc' ? 'price_desc' : 'price_asc');
    } else if (field === 'stock') {
      setSortBy(sortBy === 'stock_asc' ? 'stock_desc' : 'stock_asc');
    } else if (field === 'updated') {
      setSortBy('newest');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in border border-neutral-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Primary Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{t('catalog.title', 'Brand Product Catalog')}</h1>
          <p className="text-xs text-neutral-500">
            {t('catalog.subtitle', 'Manage product catalog, inventory levels, prices, and reseller commissions.')}
          </p>
        </div>

        {/* Desktop / Tablet Primary Action Button - Prominent & Standalone */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="hidden sm:inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-98 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t('catalog.addProduct', 'Add Product')}</span>
        </button>
      </div>

      {/* Filter, Search & Sorting Bar */}
      <CompactFilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('catalog.searchProducts', 'Search products by title, brand, tag...')}
        activeCount={activeFiltersCount}
        activeChips={productActiveChips}
        resultsCount={filteredAndSortedProducts.length}
        resultsLabel="products"
        onResetAll={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setSelectedStatus('all');
          setStockFilter('all');
          setSortBy('newest');
        }}
        rightControls={
          <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => handleSetViewMode('card')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200/80'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title={t('catalog.cardView', 'Card View')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200/80'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title={t('catalog.tableView', 'Table View')}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        }
        sortControl={
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 w-full sm:w-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-neutral-800 focus:outline-none text-xs w-full cursor-pointer"
            >
              <option value="newest">Sort: Last Updated</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="commission">Highest Earnings</option>
            </select>
          </div>
        }
      >
        {/* Category Filter */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">{t('catalog.allCategories', 'All Categories')} ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">{t('catalog.allStatuses', 'All Statuses')}</option>
            <option value="active">{t('common.active', 'Active')}</option>
            <option value="out_of_stock">{t('catalog.outOfStock', 'Out of Stock')}</option>
            <option value="archived">{t('catalog.archived', 'Archived')}</option>
            <option value="hidden">{t('catalog.hiddenByAdmin', 'Hidden by Admin')} ({hiddenProductsCount})</option>
          </select>
        </div>

        {/* Stock Level Filter */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Stock Level</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (1 - 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </CompactFilterSection>

      {/* Hidden Moderated Products Alert Banner */}
      {hiddenProductsCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-xs">
                {hiddenProductsCount} Product{hiddenProductsCount > 1 ? 's' : ''} Hidden by Moderation
              </p>
              <p className="text-[11px] text-amber-800">
                Hidden items remain in your dashboard for reference but are restricted from reseller storefronts. Click <strong>Appeal Decision</strong> to submit a review request to administration.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus('hidden')}
            className="rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shrink-0"
          >
            View Hidden Products ({hiddenProductsCount})
          </button>
        </div>
      )}

      {/* PRODUCTS DISPLAY SECTION */}
      {filteredAndSortedProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="You haven't added any products to your catalog yet or no items match your selected filters."
          actionLabel="Create Product"
          onAction={handleOpenCreateModal}
        />
      ) : viewMode === 'card' ? (
        /* ================= CARD VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedProducts.map((p) => {
            const isExpanded = expandedCardIds.has(p.id);
            const commEarn = p.commissionAmount || (p.price * (p.commissionRate || 15)) / 100;
            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutOfStock = p.stock === 0;

            return (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-white ${
                  p.isHidden
                    ? 'border-amber-300 bg-amber-50/20 shadow-2xs'
                    : 'border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300'
                }`}
              >
                {/* Top Media & Badges */}
                <div>
                  <div
                    onClick={() => {
                      setViewingProduct(p);
                      setActiveInspectorImage(p.images[0] || SAMPLE_PRODUCT_IMAGES[0]);
                    }}
                    className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-neutral-100 cursor-pointer"
                  >
                    <img
                      src={p.images[0] || SAMPLE_PRODUCT_IMAGES[0]}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                      <ProductStatusBadge status={p.status} isHidden={p.isHidden} />
                      {p.isHidden && p.appealStatus && <AppealStatusBadge status={p.appealStatus} />}
                    </div>

                    {/* Image Count Indicator */}
                    {p.images && p.images.length > 1 && (
                      <span className="absolute bottom-2.5 left-3 rounded-full bg-neutral-900/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {p.images.length} photos
                      </span>
                    )}

                    {/* Quick Action Dropdown Trigger (Top Right) */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur-md hover:bg-white hover:text-neutral-900 transition-colors"
                          aria-label="Quick Actions Menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === p.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-0 mt-1 w-44 z-40 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl text-xs font-medium text-neutral-700 animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => {
                                  setViewingProduct(p);
                                  setActiveInspectorImage(p.images[0] || SAMPLE_PRODUCT_IMAGES[0]);
                                  setOpenDropdownId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Eye className="h-3.5 w-3.5 text-neutral-500" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleOpenEditModal(p);
                                  setOpenDropdownId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                                <span>Edit Product</span>
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(p)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Copy className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Duplicate</span>
                              </button>

                              {p.isHidden ? (
                                <button
                                  onClick={() => {
                                    setAppealModalProduct(p);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-amber-800 hover:bg-amber-50 font-bold"
                                >
                                  <Scale className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Appeal Decision</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const nextStatus = p.status === 'active' ? 'out_of_stock' : 'active';
                                    storage.updateProduct(p.id, { status: nextStatus });
                                    showToast(`Marked "${p.title}" as ${nextStatus.replace('_', ' ')}`);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-neutral-100 hover:text-neutral-900"
                                >
                                  <Archive className="h-3.5 w-3.5 text-neutral-500" />
                                  <span>{p.status === 'active' ? 'Mark Out of Stock' : 'Mark Active'}</span>
                                </button>
                              )}

                              <div className="my-1 border-t border-neutral-100" />
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleDelete(p.id, p.title);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 font-bold"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                <span>Delete Product</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <span className="truncate max-w-[60%] font-semibold text-neutral-700">{p.brand}</span>
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600 text-[10px]">
                        {p.category}
                      </span>
                    </div>

                    <h3
                      onClick={() => {
                        setViewingProduct(p);
                        setActiveInspectorImage(p.images[0] || SAMPLE_PRODUCT_IMAGES[0]);
                      }}
                      className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 cursor-pointer hover:underline"
                    >
                      {p.title}
                    </h3>

                    {/* Price & Stock Row */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-base font-extrabold text-neutral-900">
                          {formatCurrency(p.price)}
                        </span>
                        {p.costPrice ? (
                          <span className="ml-1.5 text-[11px] text-neutral-400 font-normal">
                            Cost: {formatCurrency(p.costPrice)}
                          </span>
                        ) : null}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <Package className="h-3 w-3" />
                        {p.stock} units
                      </span>
                    </div>

                    {/* Reseller Commission Box */}
                    <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-2 text-xs">
                      <span className="text-[11px] font-medium text-emerald-900">Reseller Comm:</span>
                      <span className="font-extrabold text-emerald-700">
                        {p.commissionAmount
                          ? formatCurrency(p.commissionAmount)
                          : `${p.commissionRate || 15}% (${formatCurrency(commEarn)})`}
                      </span>
                    </div>

                    {/* Last Updated Date */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-0.5">
                      <span>Last Updated:</span>
                      <span>{formatDate(p.updatedAt || p.createdAt)}</span>
                    </div>

                    {/* Mobile Expandable Details */}
                    <div className="sm:hidden pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => toggleExpandCard(p.id)}
                        className="flex w-full items-center justify-between text-[11px] font-bold text-neutral-600 hover:text-neutral-900"
                      >
                        <span>{isExpanded ? 'Hide Extra Details' : 'Expand Details'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 rounded-xl bg-neutral-50 p-2.5 text-[11px] text-neutral-700">
                          {p.subcategory && (
                            <p><strong className="text-neutral-900">Subcategory:</strong> {p.subcategory}</p>
                          )}
                          {p.costPrice ? (
                            <p>
                              <strong className="text-neutral-900">Est. Profit Margin:</strong>{' '}
                              {formatCurrency(p.price - p.costPrice)} ({Math.round(((p.price - p.costPrice) / p.price) * 100)}%)
                            </p>
                          ) : null}
                          {p.description && <p className="line-clamp-3 text-neutral-600">{p.description}</p>}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {p.tags.map((t, idx) => (
                                <span key={idx} className="rounded bg-neutral-200/80 px-1.5 py-0.2 text-[10px] font-mono text-neutral-700">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Quick Action Buttons */}
                <div className="flex items-center border-t border-neutral-100 p-2.5 bg-neutral-50/50 rounded-b-2xl gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-100 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDuplicateProduct(p)}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    title="Duplicate Item"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th
                    onClick={() => handleTableColumnSort('title')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Product</span>
                      <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleTableColumnSort('category')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleTableColumnSort('price')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleTableColumnSort('stock')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Stock</span>
                      <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Commission</th>
                  <th
                    onClick={() => handleTableColumnSort('updated')}
                    className="py-3 px-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Last Updated</span>
                      <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                {paginatedProducts.map((p) => {
                  const commEarn = p.commissionAmount || (p.price * (p.commissionRate || 15)) / 100;
                  const isLowStock = p.stock > 0 && p.stock <= 5;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        p.isHidden ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || SAMPLE_PRODUCT_IMAGES[0]}
                            alt={p.title}
                            className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                          />
                          <div>
                            <p className="font-bold text-neutral-900 leading-tight">{p.title}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {p.brand} {p.subcategory ? `• ${p.subcategory}` : ''}
                            </p>
                            {p.isHidden && (
                              <div className="mt-1 text-[10px] text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-200 font-mono inline-block">
                                Hidden: {p.hiddenReason || 'Policy review'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-600">{p.category}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-900 block">{formatCurrency(p.price)}</span>
                        {p.costPrice ? (
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            Cost: {formatCurrency(p.costPrice)}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <ProductStatusBadge status={p.status} isHidden={p.isHidden} />
                          {p.isHidden && p.appealStatus && <AppealStatusBadge status={p.appealStatus} />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {p.commissionAmount
                          ? formatCurrency(p.commissionAmount)
                          : `${p.commissionRate || 15}% (${formatCurrency(commEarn)})`}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {formatDate(p.updatedAt || p.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setViewingProduct(p);
                              setActiveInspectorImage(p.images[0] || SAMPLE_PRODUCT_IMAGES[0]);
                            }}
                            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            title="View Product Specs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Edit Product"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                            title="Duplicate Product"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {p.isHidden ? (
                            <button
                              onClick={() => setAppealModalProduct(p)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 ml-1"
                              title="Appeal Moderation"
                            >
                              <Scale className="h-3 w-3" />
                              <span>Appeal</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(p.id, p.title)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong>
                {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}
              </strong>{' '}
              of <strong>{filteredAndSortedProducts.length}</strong> items
            </span>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-bold text-neutral-800"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-2 font-mono font-bold text-neutral-900">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-white"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS INSPECTOR MODAL */}
      {viewingProduct && (
        <Modal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={`Product Inspector — ${viewingProduct.title}`}
          subtitle="Detailed overview, financials, inventory levels, and reseller configuration"
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Gallery Section */}
            <div className="space-y-2">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={activeInspectorImage || viewingProduct.images[0] || SAMPLE_PRODUCT_IMAGES[0]}
                  alt={viewingProduct.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <ProductStatusBadge status={viewingProduct.status} isHidden={viewingProduct.isHidden} />
                </div>
              </div>

              {viewingProduct.images && viewingProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewingProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveInspectorImage(img)}
                      className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        (activeInspectorImage || viewingProduct.images[0]) === img
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Financials & Stock Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-[10px] font-bold uppercase text-neutral-400 block">Retail Price</span>
                <span className="text-base font-black text-neutral-900">{formatCurrency(viewingProduct.price)}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-[10px] font-bold uppercase text-neutral-400 block">Cost Price</span>
                <span className="text-base font-black text-neutral-700">
                  {viewingProduct.costPrice ? formatCurrency(viewingProduct.costPrice) : 'N/A'}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Reseller Comm</span>
                <span className="text-base font-black text-emerald-700">
                  {viewingProduct.commissionAmount
                    ? formatCurrency(viewingProduct.commissionAmount)
                    : `${viewingProduct.commissionRate || 15}%`}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-[10px] font-bold uppercase text-neutral-400 block">Current Stock</span>
                <span className="text-base font-black text-neutral-900">{viewingProduct.stock} units</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="rounded-xl border border-neutral-200 p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-2">
                <span className="text-neutral-500">Brand Name:</span>
                <span className="font-bold text-neutral-900">{viewingProduct.brand}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-2">
                <span className="text-neutral-500">Category:</span>
                <span className="font-bold text-neutral-900">{viewingProduct.category}</span>
              </div>
              {viewingProduct.subcategory && (
                <div className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Subcategory:</span>
                  <span className="font-bold text-neutral-900">{viewingProduct.subcategory}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-2">
                <span className="text-neutral-500">Last Updated:</span>
                <span className="font-mono text-neutral-800">{formatDate(viewingProduct.updatedAt || viewingProduct.createdAt)}</span>
              </div>
              {viewingProduct.costPrice && (
                <div className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Est. Profit Per Sale:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(
                      viewingProduct.price -
                        viewingProduct.costPrice -
                        (viewingProduct.commissionAmount || (viewingProduct.price * (viewingProduct.commissionRate || 15)) / 100)
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-neutral-800 mb-1">Description & Specifications:</h4>
              <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                {viewingProduct.description || 'No description provided.'}
              </p>
            </div>

            {/* Tags */}
            {viewingProduct.tags && viewingProduct.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-neutral-800 mb-1.5">Product Tags:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProduct.tags.map((t, i) => (
                    <span key={i} className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-mono text-neutral-700">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  handleDuplicateProduct(viewingProduct);
                  setViewingProduct(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-600" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => {
                  handleOpenEditModal(viewingProduct);
                  setViewingProduct(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Product</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PRODUCT APPEAL MODAL */}
      {appealModalProduct && (
        <ProductAppealModal
          product={appealModalProduct}
          existingAppeal={storage.getProductAppealByProductId(appealModalProduct.id)}
          isOpen={!!appealModalProduct}
          onClose={() => setAppealModalProduct(null)}
        />
      )}

      {/* EDIT / CREATE FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Brand Product' : 'Add New Brand Product'}
        subtitle="Business Owner control. Updates automatically sync across all reseller storefronts."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Details */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
              <Package className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">1. Basic Details</h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apex H1 Wireless Headphones"
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Apex Audio"
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>
            </div>

            <CategorySubcategorySelector
              selectedCategory={formData.category}
              selectedSubcategory={formData.subcategory}
              onChangeCategory={(cat) => setFormData({ ...formData, category: cat })}
              onChangeSubcategory={(sub) => setFormData({ ...formData, subcategory: sub })}
            />
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
              <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">2. Pricing & Inventory</h4>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Retail Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Reseller Commission Configuration */}
          <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/60 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  3. Reseller Earnings & Commission
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">Configure profit margins for resellers promoting this item.</p>
              </div>

              <div className="flex items-center rounded-xl border border-emerald-300 bg-white p-1 text-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, commissionType: 'percentage' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                    formData.commissionType === 'percentage'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, commissionType: 'fixed' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                    formData.commissionType === 'fixed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Fixed ($)
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 items-center">
              {formData.commissionType === 'percentage' ? (
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-emerald-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">Fixed Commission ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.commissionAmount}
                    onChange={(e) => setFormData({ ...formData, commissionAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-emerald-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
              )}

              <div className="rounded-xl bg-white p-3 border border-emerald-200/90 flex items-center justify-between shadow-2xs">
                <span className="text-xs text-neutral-700 font-bold">Reseller Earns Per Sale:</span>
                <span className="text-base font-black text-emerald-700">
                  {formatCurrency(
                    formData.commissionType === 'fixed'
                      ? formData.commissionAmount
                      : (formData.price * formData.commissionRate) / 100
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Description & Tags */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
              <Info className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">4. Description & Tags</h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Product Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe product craftsmanship, specifications, warranty, features..."
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                >
                  <option value="active">Active (Available for Resellers)</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived (Hidden from catalog)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">Search Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="wireless, Bluetooth, audio"
                  className="w-full rounded-xl border border-neutral-300 bg-white min-h-[42px] px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Multi Image Direct Upload */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
              <ImageIcon className="h-4 w-4 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">5. Product Gallery & Cover Photo</h4>
            </div>

            <MultiImageUploader
              value={formData.images}
              onChange={(newImages) => setFormData({ ...formData, images: newImages })}
              label="Product Images & Photography *"
              description="Select multiple product photos from your device (Max 5 images total). Tap ⋮ on any image to set as Primary Cover or Delete."
              maxImages={5}
            />

            {/* Quick Sample Photography */}
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs">
              <span className="text-[11px] font-bold text-neutral-600 block mb-2">Or select from Quick Sample Photos:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRODUCT_IMAGES.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (formData.images.length >= 5) {
                        alert('Maximum 5 images allowed per product. Remove an image to add a new one.');
                        return;
                      }
                      if (!formData.images.includes(imgUrl)) {
                        setFormData({ ...formData, images: [...formData.images, imgUrl] });
                      }
                    }}
                    className="relative group overflow-hidden rounded-xl border border-neutral-200 hover:border-emerald-500 active:scale-95 transition-all"
                  >
                    <img src={imgUrl} alt="Preset" className="h-11 w-11 object-cover group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-neutral-900 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-95 transition-all"
            >
              {editingProduct ? 'Save & Sync to Resellers' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
