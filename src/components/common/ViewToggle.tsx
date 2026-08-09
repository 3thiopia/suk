import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

export type ViewMode = 'cards' | 'table';

export interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
  className = '',
  size = 'md',
}: ViewToggleProps) {
  const isSm = size === 'sm';

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-neutral-200/90 bg-neutral-100/90 p-1 text-xs font-semibold shrink-0 shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => onViewModeChange('cards')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all duration-150 ${
          viewMode === 'cards'
            ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
        aria-label="Cards View"
        title="Cards View"
      >
        <LayoutGrid className={isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>Cards</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('table')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all duration-150 ${
          viewMode === 'table'
            ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
        aria-label="Table View"
        title="Table View"
      >
        <Table className={isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>Table</span>
      </button>
    </div>
  );
}
