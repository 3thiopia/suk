import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, FolderTree, Tag, X, AlertCircle } from 'lucide-react';
import { CategoryWithSubcategories, INITIAL_PLATFORM_CATEGORIES, getSubcategoriesForCategory } from '../../data/categoriesData';
import { Subcategory } from '../../types';

interface CategorySubcategorySelectorProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onChangeCategory: (category: string) => void;
  onChangeSubcategory: (subcategory: string) => void;
  categoriesList?: CategoryWithSubcategories[];
  label?: string;
  required?: boolean;
  isLoading?: boolean;
  categoryError?: string | null;
  subcategoryError?: string | null;
}

export function CategorySubcategorySelector({
  selectedCategory,
  selectedSubcategory,
  onChangeCategory,
  onChangeSubcategory,
  categoriesList = INITIAL_PLATFORM_CATEGORIES,
  label = 'Category & Subcategory *',
  required = true,
  isLoading = false,
  categoryError = null,
  subcategoryError = null,
}: CategorySubcategorySelectorProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Active categories only
  const activeCategories = (categoriesList || []).filter((c) => c.isActive !== false);

  // Ensure 'Other' is always at the bottom of the category list
  const sortedCategories = [...activeCategories].sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return a.sortOrder && b.sortOrder ? a.sortOrder - b.sortOrder : a.name.localeCompare(b.name);
  });

  const filteredCategories = sortedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(catSearch.toLowerCase()))
  );

  const availableSubcategories = getSubcategoriesForCategory(categoriesList || [], selectedCategory);

  const filteredSubcategories = availableSubcategories.filter((sub) =>
    sub.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleSelectCategory = (catName: string) => {
    onChangeCategory(catName);
    // Explicitly reset subcategory when category changes as per user requirements
    onChangeSubcategory('');
    setIsCategoryModalOpen(false);
    setCatSearch('');
  };

  const handleSelectSubcategory = (subName: string) => {
    onChangeSubcategory(subName);
    setIsSubcategoryModalOpen(false);
    setSubSearch('');
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Category Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1">
            Category {required && '*'}
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={isLoading || activeCategories.length === 0}
              onClick={() => setIsCategoryModalOpen(true)}
              className={`w-full flex items-center justify-between rounded-xl border min-h-[42px] px-3.5 py-2.5 text-left text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 transition-all shadow-2xs cursor-pointer hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100 ${
                categoryError
                  ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-200 focus:ring-rose-500'
                  : 'border-neutral-300 bg-white focus:ring-neutral-900'
              }`}
            >
              <span className={`truncate font-semibold ${selectedCategory ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {isLoading
                  ? 'Loading categories...'
                  : activeCategories.length === 0
                  ? 'No categories available'
                  : selectedCategory || 'Select Category...'}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500 shrink-0 ml-2" />
            </button>
          </div>
          {categoryError && (
            <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
              <span>{categoryError}</span>
            </p>
          )}
        </div>

        {/* Subcategory Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1">
            Subcategory
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={!selectedCategory || isLoading}
              onClick={() => setIsSubcategoryModalOpen(true)}
              className={`w-full flex items-center justify-between rounded-xl border min-h-[42px] px-3.5 py-2.5 text-left text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 transition-all shadow-2xs cursor-pointer hover:border-neutral-400 ${
                !selectedCategory || isLoading ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-300' : ''
              } ${
                subcategoryError
                  ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-200 focus:ring-rose-500'
                  : 'border-neutral-300 bg-white focus:ring-neutral-900'
              }`}
            >
              <span className={`truncate font-semibold ${selectedSubcategory ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {selectedSubcategory || (selectedCategory ? 'Select Subcategory...' : 'Choose Category first')}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500 shrink-0 ml-2" />
            </button>
          </div>
          {subcategoryError && (
            <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
              <span>{subcategoryError}</span>
            </p>
          )}
        </div>
      </div>

      {/* Selected Category Tag Display */}
      {selectedCategory && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100/80 px-3 py-1.5 rounded-lg border border-neutral-200/80 w-fit">
          <FolderTree className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-neutral-900">{selectedCategory}</span>
          {selectedSubcategory && (
            <>
              <span className="text-neutral-400">→</span>
              <span className="font-semibold text-neutral-700">{selectedSubcategory}</span>
            </>
          )}
        </div>
      )}

      {/* Modal / Sheet for Category Selection */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Select Product Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="p-3 border-b border-neutral-100 bg-neutral-50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
              </div>
            </div>

            {/* Category list */}
            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-neutral-100/50">
              {filteredCategories.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No category found matching "{catSearch}".
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'hover:bg-neutral-100 text-neutral-800 font-medium'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm">{cat.name}</div>
                        {cat.description && (
                          <div className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {cat.description}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 ml-2 text-emerald-400" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Sheet for Subcategory Selection */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-neutral-900 text-sm">Select Subcategory</h3>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">Category: {selectedCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="p-3 border-b border-neutral-100 bg-neutral-50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
              </div>
            </div>

            {/* Subcategory list */}
            <div className="overflow-y-auto p-2 space-y-1">
              {filteredSubcategories.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No subcategory found matching "{subSearch}".
                </div>
              ) : (
                filteredSubcategories.map((sub) => {
                  const isSelected = selectedSubcategory === sub.name;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubcategory(sub.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'hover:bg-neutral-100 text-neutral-800 font-medium'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{sub.name}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 ml-2 text-emerald-400" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
