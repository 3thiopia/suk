import React, { useState, useEffect } from 'react';
import { ViewToggle, ViewMode } from './ViewToggle';
import { EmptyState } from './EmptyState';
import { Package } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  priority?: 'primary' | 'secondary' | 'optional';
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  onSort?: () => void;
}

export interface ResponsiveDataTableProps<T> {
  data: T[];
  columns?: Column<T>[];
  keyExtractor?: (item: T, index: number) => string | number;

  // Custom Card & Table renderers
  renderCard?: (item: T, index: number) => React.ReactNode;
  renderTable?: (data: T[]) => React.ReactNode;
  children?: React.ReactNode; // Alternative for custom table/content

  // Controlled or uncontrolled view mode
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  defaultViewMode?: ViewMode;
  showViewToggle?: boolean;

  // Header & Controls
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;

  // Empty state
  emptyState?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  // Styling
  className?: string;
  gridClassName?: string;
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  keyExtractor,

  renderCard,
  renderTable,
  children,

  viewMode: controlledViewMode,
  onViewModeChange,
  defaultViewMode,
  showViewToggle = true,

  title,
  subtitle,
  headerExtra,

  emptyState,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your current criteria.',

  className = '',
  gridClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
}: ResponsiveDataTableProps<T>) {
  // Determine initial view mode: on mobile (<640px) default to 'cards'
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>(() => {
    if (defaultViewMode) return defaultViewMode;
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'cards';
    }
    return 'table';
  });

  // Automatically adapt to mobile screen size on resize if uncontrolled
  useEffect(() => {
    if (controlledViewMode !== undefined) return;
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Default to cards on small screens if not explicitly set
        setInternalViewMode((prev) => (prev === 'table' ? 'cards' : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controlledViewMode]);

  const currentViewMode = controlledViewMode ?? internalViewMode;

  const handleViewChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    if (item && typeof item === 'object' && 'id' in item) {
      return String((item as any).id);
    }
    return index;
  };

  // Render Card layout if columns are defined and no custom renderCard is provided
  const renderAutoCard = (item: T, index: number) => {
    if (!columns) return null;

    const primaryCols = columns.filter((c) => c.priority === 'primary') || [];
    const secondaryCols = columns.filter((c) => c.priority === 'secondary' || !c.priority);
    const optionalCols = columns.filter((c) => c.priority === 'optional');

    const headerCols = primaryCols.length > 0 ? primaryCols : columns.slice(0, 2);
    const bodyCols = primaryCols.length > 0 ? [...secondaryCols, ...optionalCols] : columns.slice(2);

    return (
      <div
        key={getKey(item, index)}
        className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs hover:shadow-md transition-all duration-200"
      >
        {/* Card Header (Primary Fields) */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 mb-3">
          <div className="space-y-1 min-w-0 flex-1">
            {headerCols.map((col) => (
              <div key={col.key} className={col.className}>
                {col.cell(item, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Card Body (Label → Value Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {bodyCols.map((col) => (
            <div
              key={col.key}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-xl bg-neutral-50/80 border border-neutral-100 ${
                col.className || ''
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 shrink-0">
                {col.header}
              </span>
              <div className="font-semibold text-neutral-900 truncate">{col.cell(item, index)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Table layout if columns are defined and no custom renderTable is provided
  const renderAutoTable = () => {
    if (!columns) return null;

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-4 font-bold ${col.headerClassName || ''} ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {data.map((item, index) => (
                <tr key={getKey(item, index)} className="hover:bg-neutral-50/80 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${col.className || ''} ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {col.cell(item, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {(title || headerExtra || showViewToggle) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
            <div>
              {title && <h3 className="text-base font-bold text-neutral-900">{title}</h3>}
              {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {headerExtra}
              {showViewToggle && (
                <ViewToggle viewMode={currentViewMode} onViewModeChange={handleViewChange} size="sm" />
              )}
            </div>
          </div>
        )}
        {emptyState || (
          <EmptyState
            icon={Package}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 w-full max-w-full overflow-hidden ${className}`}>
      {/* Table / Cards Header Controls */}
      {(title || subtitle || headerExtra || showViewToggle) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
          <div>
            {title && <h3 className="text-base font-bold text-neutral-900">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            {showViewToggle && (
              <ViewToggle viewMode={currentViewMode} onViewModeChange={handleViewChange} size="sm" />
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {currentViewMode === 'cards' ? (
        <div className={gridClassName}>
          {data.map((item, index) =>
            renderCard ? renderCard(item, index) : renderAutoCard(item, index)
          )}
        </div>
      ) : (
        <div className="w-full max-w-full overflow-hidden">
          {renderTable
            ? renderTable(data)
            : children || renderAutoTable()}
        </div>
      )}
    </div>
  );
}
