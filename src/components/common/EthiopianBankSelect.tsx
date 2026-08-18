import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2, AlertCircle } from 'lucide-react';
import { PayoutBank } from '../../types/payout';

interface EthiopianBankSelectProps {
  banks: PayoutBank[];
  selectedBankId?: string;
  onSelectBank: (bank: PayoutBank) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
  placeholder?: string;
}

export function EthiopianBankSelect({
  banks,
  selectedBankId,
  onSelectBank,
  disabled = false,
  error,
  id = 'ethiopian-bank-select',
  placeholder = 'Select Ethiopian Bank',
}: EthiopianBankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredBanks = banks.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      b.name.toLowerCase().includes(query) ||
      (b.shortName && b.shortName.toLowerCase().includes(query)) ||
      (b.code && b.code.toLowerCase().includes(query))
    );
  });

  return (
    <div className="relative w-full" ref={containerRef} id={`${id}-container`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-all focus:outline-none focus:ring-2 ${
          disabled
            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
            : error
            ? 'bg-red-50/50 border-red-300 text-neutral-900 focus:ring-red-500'
            : isOpen
            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-neutral-900 shadow-xs'
            : 'bg-neutral-50/80 hover:bg-white border-neutral-300 hover:border-neutral-400 text-neutral-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Building2
            className={`h-4 w-4 shrink-0 ${
              selectedBank ? 'text-emerald-600' : 'text-neutral-400'
            }`}
          />
          {selectedBank ? (
            <div className="truncate">
              <span className="text-neutral-900 font-bold">{selectedBank.name}</span>
              {selectedBank.shortName && (
                <span className="ml-1.5 text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded-md font-medium">
                  {selectedBank.shortName}
                </span>
              )}
            </div>
          ) : (
            <span className="text-neutral-500 font-normal">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      {/* Searchable Dropdown Menu */}
      {isOpen && (
        <div
          id={`${id}-menu`}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Search Input Box */}
          <div className="p-2 border-b border-neutral-100 bg-neutral-50/80">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                id={`${id}-search-input`}
                placeholder="Search bank name (e.g. CBE, Awash, Dashen)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white pl-8.5 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* List of Banks */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-neutral-50 scrollbar-thin">
            {filteredBanks.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-neutral-500">
                No Ethiopian bank found matching "{searchQuery}".
              </div>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = bank.id === selectedBankId;
                return (
                  <button
                    key={bank.id}
                    id={`bank-option-${bank.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectBank(bank);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-neutral-100/80 text-neutral-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900">{bank.name}</div>
                      {bank.shortName && (
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {bank.shortName} {bank.code ? `• ${bank.code}` : ''}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="bg-neutral-50 px-3 py-2 border-t border-neutral-100 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>Official NBE Licensed Banks ({filteredBanks.length} listed)</span>
            <span className="font-medium text-emerald-700">Strict Standard List</span>
          </div>
        </div>
      )}
    </div>
  );
}
