import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X, RotateCcw, Search, Check, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface CompactFilterSectionProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  activeCount: number;
  activeChips?: FilterChip[];
  onResetAll?: () => void;
  resultsCount?: number;
  resultsLabel?: string;
  sortControl?: React.ReactNode;
  rightControls?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

export function CompactFilterSection({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  activeCount,
  activeChips = [],
  onResetAll,
  resultsCount,
  resultsLabel = 'items',
  sortControl,
  rightControls,
  children,
  title = 'Filters',
}: CompactFilterSectionProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const displayedChips = showAllChips ? activeChips : activeChips.slice(0, 3);
  const hiddenChipsCount = activeChips.length - displayedChips.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 sm:p-4 shadow-2xs">
      {/* Search & Top Controls Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar (if search functionality enabled) */}
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-8 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Desktop Filter Controls (Inline Horizontal Bar) */}
        <div className="hidden sm:flex sm:items-center sm:gap-2 sm:flex-wrap">
          {children}
          {sortControl}
          {rightControls}
          {activeCount > 0 && onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-500" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Filter Trigger Button & Sort Row (Mobile Only) */}
        <div className="flex sm:hidden items-center justify-between gap-2 flex-wrap">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className={`flex flex-1 min-w-[90px] items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-bold transition-all active:scale-98 ${
              activeCount > 0
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-2xs'
                : 'border-neutral-200 bg-white text-neutral-800 shadow-2xs hover:bg-neutral-50'
            }`}
          >
            <SlidersHorizontal className={`h-4 w-4 ${activeCount > 0 ? 'text-emerald-700' : 'text-neutral-600'}`} />
            <span>Filter</span>
            {activeCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-[10px] font-extrabold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>

          {/* Sort Control on Mobile */}
          {sortControl && <div className="shrink-0">{sortControl}</div>}

          {/* Right Controls / View Toggle on Mobile */}
          {rightControls && <div className="shrink-0">{rightControls}</div>}

          {/* Quick Reset on Mobile if active filters exist */}
          {activeCount > 0 && onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-colors shrink-0"
              aria-label="Reset filters"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips (Mobile & Desktop) */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-neutral-100 text-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Active:</span>
          {displayedChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 max-w-[200px] truncate rounded-lg bg-neutral-100 border border-neutral-200/80 px-2 py-0.5 text-[11px] font-semibold text-neutral-800"
            >
              <span className="truncate">{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="text-neutral-400 hover:text-neutral-800 shrink-0"
                aria-label={`Remove ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {hiddenChipsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllChips(true)}
              className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              +{hiddenChipsCount} more
            </button>
          )}

          {showAllChips && activeChips.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllChips(false)}
              className="text-[11px] font-bold text-neutral-500 hover:underline"
            >
              Show less
            </button>
          )}

          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="ml-auto text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Results Count Footer (if provided) */}
      {resultsCount !== undefined && activeChips.length === 0 && (
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
          <span>
            Showing <strong className="text-neutral-900 font-bold">{resultsCount}</strong> {resultsLabel}
          </span>
        </div>
      )}

      {/* Mobile Filter Slide-Over Bottom Sheet / Modal */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs"
            />

            {/* Mobile Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-3xl border-t border-neutral-200 bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Sheet Handle */}
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-neutral-300" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-neutral-900">{title}</h3>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
                      {activeCount} active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sheet Body (Stacked mobile filter inputs) */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs font-medium text-neutral-800">
                <div className="space-y-4 filter-mobile-stacked">
                  {children}
                </div>
              </div>

              {/* Sheet Footer (Action Buttons) */}
              <div className="border-t border-neutral-100 bg-neutral-50/90 p-4 flex items-center gap-3">
                {onResetAll && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetAll();
                    }}
                    className="flex-1 rounded-xl border border-neutral-300 bg-white py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs active:scale-98"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-md active:scale-98"
                >
                  <Check className="h-4 w-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
