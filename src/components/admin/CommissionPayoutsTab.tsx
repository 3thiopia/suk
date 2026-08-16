import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Store,
  UserCheck,
  CreditCard,
  Send,
  History,
  FileText,
  Settings,
  Phone,
  Mail,
  Receipt,
  Download,
  AlertTriangle,
  ChevronRight,
  Info,
  Sliders,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import {
  CreatorCommissionBalance,
  CreatorPayout,
  CreatorPayoutStatus,
  PayoutPaymentMethod,
} from '../../types';
import { formatCurrency, formatETB, formatDate, formatShortDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

export function CommissionPayoutsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'balances' | 'history'>('balances');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'not_eligible' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'unpaid_desc' | 'earned_desc' | 'name_asc' | 'status'>('unpaid_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [payingCreator, setPayingCreator] = useState<CreatorCommissionBalance | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<PayoutPaymentMethod>('telebirr');
  const [payReference, setPayReference] = useState('');
  const [payPeriod, setPayPeriod] = useState('');
  const [payNote, setPayNote] = useState('');
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState<{ title: string; message: string } | null>(null);

  // Min Payout Threshold Configuration Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [newMinPayout, setNewMinPayout] = useState<string>(() => storage.getMinPayoutAmount().toString());
  const [configSuccess, setConfigSuccess] = useState(false);

  // Creator Payout History Drawer / Modal
  const [selectedCreatorForHistory, setSelectedCreatorForHistory] = useState<CreatorCommissionBalance | null>(null);

  // Data
  const currentMinPayout = storage.getMinPayoutAmount();
  const summaryStats = storage.getPayoutSummaryStats();
  const allBalances = storage.getCreatorCommissionBalances();
  const allPayouts = storage.getCreatorPayouts();

  // Filtered & Sorted Balances
  const filteredBalances = useMemo(() => {
    return allBalances
      .filter((item) => {
        // Status filter
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.creatorName.toLowerCase().includes(q);
          const matchEmail = item.creatorEmail.toLowerCase().includes(q);
          const matchPhone = item.creatorPhone.toLowerCase().includes(q);
          const matchStore = item.storefrontName.toLowerCase().includes(q);
          const matchSlug = item.storefrontSlug?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchStore && !matchSlug) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'unpaid_desc') {
          return b.unpaidCommission - a.unpaidCommission;
        }
        if (sortBy === 'earned_desc') {
          return b.totalCommissionEarned - a.totalCommissionEarned;
        }
        if (sortBy === 'name_asc') {
          return a.creatorName.localeCompare(b.creatorName);
        }
        if (sortBy === 'status') {
          const order: Record<CreatorPayoutStatus, number> = {
            eligible: 1,
            not_eligible: 2,
            paid: 3,
          };
          return (order[a.status] || 99) - (order[b.status] || 99);
        }
        return 0;
      });
  }, [allBalances, statusFilter, searchQuery, sortBy]);

  // Open "Mark as Paid" modal for a specific creator
  const handleOpenPayModal = (creator: CreatorCommissionBalance) => {
    setPayingCreator(creator);
    setPayAmount(creator.unpaidCommission > 0 ? creator.unpaidCommission.toString() : '0');
    setPayMethod('telebirr');
    setPayReference(`TB-${Math.floor(10000000 + Math.random() * 90000000)}`);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setPayPeriod(`Settlement ending ${formattedDate}`);
    setPayNote('');
    setFormError('');
    setShowConfirmStep(false);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!payingCreator) return;

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid payout amount greater than 0 ETB.');
      return;
    }

    if (amountNum > payingCreator.unpaidCommission) {
      setFormError(
        `Amount cannot exceed available unpaid commission balance of ${formatETB(payingCreator.unpaidCommission)}.`
      );
      return;
    }

    if (!payReference.trim()) {
      setFormError('Please enter a transaction reference or receipt number for audit tracking.');
      return;
    }

    setShowConfirmStep(true);
  };

  const handleConfirmPayment = () => {
    if (!payingCreator) return;

    try {
      const amountNum = parseFloat(payAmount);
      const recorded = storage.recordCreatorManualPayment({
        creatorId: payingCreator.creatorId,
        amount: amountNum,
        paymentMethod: payMethod,
        transactionReference: payReference.trim(),
        note: payNote.trim(),
        commissionPeriod: payPeriod.trim(),
      });

      setSuccessToast({
        title: 'Payment Recorded Successfully',
        message: `Successfully marked ${formatETB(amountNum)} as paid to ${payingCreator.creatorName} via ${payMethod.toUpperCase()} (Ref: ${payReference}).`,
      });

      setPayingCreator(null);
      setShowConfirmStep(false);

      setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to record manual payment.');
      setShowConfirmStep(false);
    }
  };

  const handleSaveMinPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newMinPayout);
    if (isNaN(val) || val < 0) return;

    storage.setMinPayoutAmount(val);
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setIsConfigModalOpen(false);
    }, 1200);
  };

  const paymentMethodLabels: Record<PayoutPaymentMethod, { label: string; sub: string }> = {
    telebirr: { label: 'Telebirr', sub: 'Ethio Telecom Mobile Money' },
    bank_transfer: { label: 'Bank Transfer (CBE/Awash/Dashen)', sub: 'Commercial Bank of Ethiopia or Private Bank' },
    cbe_birr: { label: 'CBE Birr', sub: 'CBE Mobile Payment' },
    cash: { label: 'Cash Handover', sub: 'Direct Cash Settlement' },
    other: { label: 'Other Method', sub: 'Direct transfer or wallet' },
  };

  return (
    <div className="space-y-6" id="creator-payouts-management-container">
      {/* Toast Notification */}
      {successToast && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black">{successToast.title}</p>
              <p className="text-[11px] text-emerald-800">{successToast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner & Minimum Payout Configuration Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs">
              ETB
            </span>
            <h2 className="text-lg font-black text-neutral-900">Creator Commission Payout System</h2>
            <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[10px] font-bold text-neutral-600">
              Manual Settlement
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-3xl">
            Track creator commission eligibility, monitor unpaid vs paid balances, and record manual settlements (Telebirr, CBE, Bank Transfer) with strict audit protection.
          </p>
        </div>

        {/* Minimum Payout Amount Control */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Min Payout Threshold</p>
              <p className="text-sm font-black text-neutral-900 font-mono">{formatETB(currentMinPayout)}</p>
            </div>
            <button
              onClick={() => {
                setNewMinPayout(currentMinPayout.toString());
                setIsConfigModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              title="Configure minimum payout threshold"
            >
              <Settings className="h-3.5 w-3.5 text-neutral-500" />
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Top Level Summary Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Unpaid Commissions */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Unpaid Commissions Owed</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 font-mono">
            {formatETB(summaryStats.totalUnpaidCommissions)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Across {allBalances.filter((b) => b.unpaidCommission > 0).length} creators with pending balances
          </p>
        </div>

        {/* Eligible for Payment */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800">Eligible For Payout Now</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700 font-mono">
            {summaryStats.eligibleCreatorsCount} <span className="text-sm font-bold">Creators</span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            Balance meets or exceeds {formatETB(currentMinPayout)} threshold
          </p>
        </div>

        {/* Total Settled & Paid Out */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Total Settled (Paid to Date)</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-neutral-900 font-mono">
            {formatETB(summaryStats.totalPaidAmount)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            {allPayouts.length} recorded manual payouts
          </p>
        </div>

        {/* Below Minimum Threshold */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Below Payout Threshold</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-neutral-700 font-mono">
            {summaryStats.notEligibleCreatorsCount} <span className="text-sm font-bold">Creators</span>
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Commission balance &lt; {formatETB(currentMinPayout)}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('balances')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeSubTab === 'balances'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Creator Balances & Eligibility
            {summaryStats.eligibleCreatorsCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-neutral-900">
                {summaryStats.eligibleCreatorsCount} Ready
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeSubTab === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <History className="h-4 w-4" />
            Manual Payout Ledger ({allPayouts.length})
          </button>
        </div>

        {activeSubTab === 'balances' && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  viewMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: CREATOR BALANCES & ELIGIBILITY */}
      {activeSubTab === 'balances' && (
        <div className="space-y-4">
          {/* Filters & Search Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All Creators ({allBalances.length})
              </button>
              <button
                onClick={() => setStatusFilter('eligible')}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === 'eligible'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Eligible for Payment ({summaryStats.eligibleCreatorsCount})
              </button>
              <button
                onClick={() => setStatusFilter('not_eligible')}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === 'not_eligible'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Not Eligible ({summaryStats.notEligibleCreatorsCount})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === 'paid'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Paid / Fully Settled ({allBalances.filter((b) => b.status === 'paid').length})
              </button>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search creator, phone, store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs font-bold text-neutral-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="unpaid_desc">Highest Unpaid Balance</option>
                  <option value="earned_desc">Highest Total Earned</option>
                  <option value="status">Payout Eligibility Status</option>
                  <option value="name_asc">Creator Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' ? (
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="py-3.5 px-4">Creator & Storefront</th>
                      <th className="py-3.5 px-4">Total Earned</th>
                      <th className="py-3.5 px-4">Already Paid</th>
                      <th className="py-3.5 px-4">Unpaid Commission</th>
                      <th className="py-3.5 px-4">Payout Status</th>
                      <th className="py-3.5 px-4">Last Payout</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {filteredBalances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          <AlertCircle className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                          <p className="text-sm font-bold text-neutral-700">No creators found</p>
                          <p className="text-xs text-neutral-400">Try changing your search keywords or filter status.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBalances.map((item) => {
                        const isEligible = item.status === 'eligible';
                        const isPaid = item.status === 'paid';
                        const deficit = Math.max(0, currentMinPayout - item.unpaidCommission);

                        return (
                          <tr
                            key={item.creatorId}
                            className={`hover:bg-neutral-50/80 transition-colors ${
                              isEligible ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            {/* Creator info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                  alt={item.creatorName}
                                  className="h-10 w-10 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-neutral-900">{item.creatorName}</span>
                                    {isEligible && (
                                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-black uppercase">
                                        Eligible
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-500 font-medium">{item.storefrontName}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                                    <span className="font-mono">{item.creatorPhone}</span>
                                    <span>•</span>
                                    <span>{item.creatorEmail}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Total Earned */}
                            <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                              {formatETB(item.totalCommissionEarned)}
                            </td>

                            {/* Already Paid */}
                            <td className="py-3.5 px-4 font-mono text-neutral-600">
                              {item.alreadyPaid > 0 ? (
                                <span className="font-bold text-neutral-900">{formatETB(item.alreadyPaid)}</span>
                              ) : (
                                <span className="text-neutral-400">0 ETB</span>
                              )}
                            </td>

                            {/* Unpaid Commission */}
                            <td className="py-3.5 px-4 font-mono">
                              {item.unpaidCommission > 0 ? (
                                <span
                                  className={`text-sm font-black ${
                                    isEligible ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {formatETB(item.unpaidCommission)}
                                </span>
                              ) : (
                                <span className="text-neutral-400 font-bold">0 ETB</span>
                              )}
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              {isEligible && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" /> Eligible for Payment
                                  </span>
                                  <p className="text-[10px] text-emerald-700">
                                    &ge; {formatETB(currentMinPayout)} min limit
                                  </p>
                                </div>
                              )}
                              {!isEligible && !isPaid && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                    <Clock className="h-3 w-3" /> Not Eligible
                                  </span>
                                  <p className="text-[10px] text-neutral-500">
                                    Needs <span className="font-bold text-amber-700 font-mono">{formatETB(deficit)}</span> more
                                  </p>
                                </div>
                              )}
                              {isPaid && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[10px] font-bold text-neutral-600">
                                  <Check className="h-3 w-3 text-neutral-400" /> Fully Settled
                                </span>
                              )}
                            </td>

                            {/* Last Payout Info */}
                            <td className="py-3.5 px-4">
                              {item.lastPayoutDate ? (
                                <div className="text-[11px]">
                                  <p className="font-bold text-neutral-800">{formatShortDate(item.lastPayoutDate)}</p>
                                  <p className="text-[10px] text-neutral-400 uppercase font-mono">
                                    {item.lastPayoutMethod} • {item.lastPayoutReference || 'Manual'}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[11px] text-neutral-400 italic">No previous payouts</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenPayModal(item)}
                                  disabled={item.unpaidCommission <= 0}
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black shadow-2xs transition-all ${
                                    isEligible
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                      : item.unpaidCommission > 0
                                      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                  }`}
                                  title={
                                    item.unpaidCommission <= 0
                                      ? 'No unpaid commission balance'
                                      : `Mark manual payment to ${item.creatorName}`
                                  }
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  <span>Mark as Paid</span>
                                </button>

                                <button
                                  onClick={() => setSelectedCreatorForHistory(item)}
                                  className="rounded-xl border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 shadow-2xs transition-colors"
                                  title="View detailed payout ledger & history"
                                >
                                  <History className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARD GRID VIEW */
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBalances.map((item) => {
                const isEligible = item.status === 'eligible';
                const isPaid = item.status === 'paid';
                const deficit = Math.max(0, currentMinPayout - item.unpaidCommission);

                return (
                  <div
                    key={item.creatorId}
                    className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                      isEligible
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                        : 'border-neutral-200'
                    }`}
                  >
                    {/* Top Row: Creator header & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={item.creatorName}
                            className="h-12 w-12 rounded-2xl object-cover border border-neutral-200 shadow-2xs"
                          />
                          <div>
                            <h4 className="text-sm font-black text-neutral-900">{item.creatorName}</h4>
                            <p className="text-xs font-semibold text-neutral-500">{item.storefrontName}</p>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{item.creatorPhone}</p>
                          </div>
                        </div>

                        {/* Badge */}
                        {isEligible && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Eligible
                          </span>
                        )}
                        {!isEligible && !isPaid && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <Clock className="h-3 w-3" /> Not Eligible
                          </span>
                        )}
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[10px] font-bold text-neutral-600">
                            <Check className="h-3 w-3 text-neutral-400" /> Settled
                          </span>
                        )}
                      </div>

                      {/* Financial Breakdown Grid */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center border border-neutral-100">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase">Earned</p>
                          <p className="text-xs font-black text-neutral-900 font-mono mt-0.5">
                            {formatETB(item.totalCommissionEarned)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase">Paid</p>
                          <p className="text-xs font-bold text-neutral-600 font-mono mt-0.5">
                            {formatETB(item.alreadyPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase">Unpaid</p>
                          <p
                            className={`text-xs font-black font-mono mt-0.5 ${
                              isEligible ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {formatETB(item.unpaidCommission)}
                          </p>
                        </div>
                      </div>

                      {/* Progress / Requirement note */}
                      {!isEligible && !isPaid && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-bold text-neutral-500 mb-1">
                            <span>Payout Progress</span>
                            <span>{Math.min(100, Math.round((item.unpaidCommission / currentMinPayout) * 100))}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{
                                width: `${Math.min(100, (item.unpaidCommission / currentMinPayout) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-1">
                            Needs <span className="font-bold text-amber-700 font-mono">{formatETB(deficit)}</span> more to reach {formatETB(currentMinPayout)} minimum.
                          </p>
                        </div>
                      )}

                      {isEligible && (
                        <p className="mt-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-lg p-2 border border-emerald-200/60">
                          ✓ Exceeds {formatETB(currentMinPayout)} minimum threshold. Ready for manual payout.
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => handleOpenPayModal(item)}
                        disabled={item.unpaidCommission <= 0}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black shadow-2xs transition-all ${
                          isEligible
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            : item.unpaidCommission > 0
                            ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay Commission</span>
                      </button>

                      <button
                        onClick={() => setSelectedCreatorForHistory(item)}
                        className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 shadow-2xs transition-colors"
                        title="View history"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: HISTORICAL SETTLEMENT & PAYOUT LEDGER */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-black text-neutral-900">Manual Payment Audit Ledger</h3>
              <p className="text-xs text-neutral-500">
                Complete historical record of all manual commissions paid to Ethiopian Creators with bank & Telebirr transaction references.
              </p>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center gap-2 text-xs font-bold text-neutral-600">
              <span className="rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1 font-mono">
                Total Paid: {formatETB(summaryStats.totalPaidAmount)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3.5 px-4">Payout ID & Date</th>
                    <th className="py-3.5 px-4">Creator / Storefront</th>
                    <th className="py-3.5 px-4">Amount Paid</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Transaction Reference #</th>
                    <th className="py-3.5 px-4">Settlement Period</th>
                    <th className="py-3.5 px-4">Admin Auditor</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {allPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        <History className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                        <p className="text-sm font-bold text-neutral-700">No manual payouts recorded yet</p>
                        <p className="text-xs text-neutral-400">When you mark a creator commission as paid, it will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    allPayouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-neutral-50 transition-colors">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                          <span>#{pay.id}</span>
                          <p className="text-[10px] text-neutral-400 font-sans font-normal">{formatDate(pay.paidAt)}</p>
                        </td>

                        {/* Creator */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{pay.creatorName}</p>
                          <p className="text-[11px] text-neutral-500 font-medium">{pay.storefrontName}</p>
                          {pay.creatorPhone && (
                            <p className="text-[10px] text-neutral-400 font-mono">{pay.creatorPhone}</p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                          {formatETB(pay.amount)}
                        </td>

                        {/* Method */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-800 uppercase font-mono">
                            <CreditCard className="h-3 w-3 text-neutral-500" />
                            {pay.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                          {pay.transactionReference || <span className="italic text-neutral-400">Direct Handover</span>}
                        </td>

                        {/* Period */}
                        <td className="py-3.5 px-4 text-[11px] text-neutral-600">
                          {pay.commissionPeriod || 'N/A'}
                        </td>

                        {/* Admin */}
                        <td className="py-3.5 px-4 text-[11px] text-neutral-700">
                          <p className="font-bold">{pay.paidByAdminName || 'System Admin'}</p>
                          {pay.note && (
                            <p className="text-[10px] text-neutral-500 italic mt-0.5 truncate max-w-[150px]">
                              "{pay.note}"
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: "MARK AS PAID" RECORDING MODAL */}
      {payingCreator && (
        <Modal
          isOpen={!!payingCreator}
          onClose={() => {
            setPayingCreator(null);
            setShowConfirmStep(false);
          }}
          title={
            showConfirmStep
              ? 'Confirm Manual Commission Payment'
              : `Record Manual Payment for ${payingCreator.creatorName}`
          }
        >
          {!showConfirmStep ? (
            /* STEP 1: FILL PAYMENT DETAILS */
            <form onSubmit={handleProceedToConfirm} className="space-y-4 text-xs">
              {/* Creator Summary Card */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={payingCreator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={payingCreator.creatorName}
                      className="h-10 w-10 rounded-xl object-cover border border-neutral-200"
                    />
                    <div>
                      <p className="font-black text-neutral-900 text-sm">{payingCreator.creatorName}</p>
                      <p className="text-neutral-500 font-medium">{payingCreator.storefrontName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{payingCreator.creatorPhone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Available Unpaid Balance</p>
                    <p className="text-base font-black text-emerald-700 font-mono">
                      {formatETB(payingCreator.unpaidCommission)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-[11px]">
                  <div>
                    <span className="text-neutral-400">Total Earned: </span>
                    <span className="font-bold text-neutral-700 font-mono">
                      {formatETB(payingCreator.totalCommissionEarned)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Already Paid: </span>
                    <span className="font-bold text-neutral-700 font-mono">
                      {formatETB(payingCreator.alreadyPaid)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Error */}
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-red-800 border border-red-200 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Payout Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-800">
                    Payment Amount (ETB) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(payingCreator.unpaidCommission.toString())}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Pay Full Available ({formatETB(payingCreator.unpaidCommission)})
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={payingCreator.unpaidCommission}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Enter amount in ETB"
                    className="w-full rounded-xl border border-neutral-300 p-3 pl-3 pr-12 text-sm font-black font-mono text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                  <span className="absolute right-3 top-3.5 font-mono font-bold text-xs text-neutral-400">ETB</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  System strictly prevents paying more than available unpaid balance ({formatETB(payingCreator.unpaidCommission)}).
                </p>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(paymentMethodLabels) as PayoutPaymentMethod[]).map((key) => {
                    const isSelected = payMethod === key;
                    const info = paymentMethodLabels[key];
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setPayMethod(key)}
                        className={`text-left p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <p className="font-bold text-xs">{info.label}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          {info.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Reference / Receipt # */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Transaction Reference Number / Receipt # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. TB-98421045 or CBE-TXN-88402199"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs font-mono font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Reference from Telebirr transaction confirmation SMS or bank deposit slip.
                </p>
              </div>

              {/* Settlement Period */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Settlement Period</label>
                <input
                  type="text"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                  placeholder="e.g. August 1 - August 15, 2026"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              {/* Admin Note / Memo */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Admin Audit Note (Optional)</label>
                <textarea
                  rows={2}
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Paid bi-weekly commission settlement via Telebirr to recipient phone number."
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPayingCreator(null)}
                  className="rounded-xl border border-neutral-200 px-4 py-2.5 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-neutral-800"
                >
                  Review & Confirm Payment <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: CLEAR CONFIRMATION */
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Confirm Manual Payout Execution</span>
                </div>
                <p className="text-amber-800">
                  Please verify that you have executed the manual payment outside the system (via Telebirr or Bank Transfer) before confirming.
                </p>
              </div>

              {/* Verification Details Table */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Recipient Creator:</span>
                  <span className="font-bold text-neutral-900">
                    {payingCreator.creatorName} ({payingCreator.storefrontName})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Recipient Phone:</span>
                  <span className="font-bold text-neutral-900 font-mono">{payingCreator.creatorPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Payment Amount:</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {formatETB(parseFloat(payAmount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Payment Method:</span>
                  <span className="font-bold text-neutral-900 uppercase font-mono">
                    {paymentMethodLabels[payMethod].label}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Transaction Reference:</span>
                  <span className="font-bold text-neutral-900 font-mono">{payReference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Settlement Period:</span>
                  <span className="font-bold text-neutral-800">{payPeriod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Remaining Balance After Payout:</span>
                  <span className="font-bold text-neutral-700 font-mono">
                    {formatETB(Math.max(0, payingCreator.unpaidCommission - (parseFloat(payAmount) || 0)))}
                  </span>
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2.5 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" /> Confirm & Mark as Paid
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* MODAL 2: CONFIGURE MINIMUM PAYOUT THRESHOLD */}
      {isConfigModalOpen && (
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title="Configure Platform Minimum Payout Amount"
        >
          <form onSubmit={handleSaveMinPayout} className="space-y-4 text-xs">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <p className="text-neutral-600">
                A Creator becomes <strong>Eligible for Payment</strong> only when their unpaid commission reaches or exceeds this minimum amount.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <span>Current setting:</span>
                <span className="font-mono bg-white border border-neutral-200 px-2 py-0.5 rounded-lg text-emerald-700">
                  {formatETB(currentMinPayout)}
                </span>
              </div>
            </div>

            {configSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-800 border border-emerald-200 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Minimum payout threshold updated to {formatETB(parseFloat(newMinPayout) || 0)}!
              </div>
            )}

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                New Minimum Payout Amount (ETB) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={newMinPayout}
                  onChange={(e) => setNewMinPayout(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full rounded-xl border border-neutral-300 p-3 pl-3 pr-12 text-sm font-black font-mono text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <span className="absolute right-3 top-3.5 font-mono font-bold text-xs text-neutral-400">ETB</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Common defaults: <strong>500 ETB</strong>, <strong>1,000 ETB</strong>, or <strong>2,500 ETB</strong>.
              </p>
            </div>

            {/* Live Impact Preview */}
            <div className="rounded-xl border border-neutral-200 bg-white p-3 space-y-1 text-[11px]">
              <span className="font-bold text-neutral-700">Live Threshold Impact:</span>
              <p className="text-neutral-500">
                With a {formatETB(parseFloat(newMinPayout) || 0)} minimum,{' '}
                <strong className="text-neutral-900 font-mono">
                  {allBalances.filter((b) => b.unpaidCommission >= (parseFloat(newMinPayout) || 0) && b.unpaidCommission > 0).length}
                </strong>{' '}
                creators will immediately become eligible for payout.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-5 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                Save Threshold
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: CREATOR DETAILED PAYOUT HISTORY */}
      {selectedCreatorForHistory && (
        <Modal
          isOpen={!!selectedCreatorForHistory}
          onClose={() => setSelectedCreatorForHistory(null)}
          title={`Payout & Settlement Ledger: ${selectedCreatorForHistory.creatorName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header Summary */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCreatorForHistory.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={selectedCreatorForHistory.creatorName}
                  className="h-10 w-10 rounded-xl object-cover border border-neutral-200"
                />
                <div>
                  <p className="font-black text-neutral-900 text-sm">{selectedCreatorForHistory.creatorName}</p>
                  <p className="text-neutral-500 font-medium">{selectedCreatorForHistory.storefrontName}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{selectedCreatorForHistory.creatorPhone}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-neutral-400">Available Unpaid</p>
                <p className="text-base font-black text-emerald-700 font-mono">
                  {formatETB(selectedCreatorForHistory.unpaidCommission)}
                </p>
              </div>
            </div>

            {/* Payouts list for this creator */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-800 text-xs">Recorded Settlements & Manual Payouts</h4>
              {storage.getCreatorPayoutsByCreatorId(selectedCreatorForHistory.creatorId).length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-neutral-400">
                  <History className="mx-auto h-6 w-6 text-neutral-300 mb-1" />
                  <p className="text-xs font-bold text-neutral-600">No recorded payments yet</p>
                  <p className="text-[11px] text-neutral-400">When manual payments are recorded, they will be logged here.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white overflow-hidden">
                  {storage.getCreatorPayoutsByCreatorId(selectedCreatorForHistory.creatorId).map((pay) => (
                    <div key={pay.id} className="p-3 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 text-xs">#{pay.id}</span>
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-700 font-mono uppercase">
                            {pay.paymentMethod.replace('_', ' ')}
                          </span>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[9px] font-bold uppercase">
                            Paid
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Period: {pay.commissionPeriod} • Paid {formatDate(pay.paidAt)}
                        </p>
                        {pay.transactionReference && (
                          <p className="text-[10px] text-neutral-600 font-mono mt-0.5">
                            Ref: <strong>{pay.transactionReference}</strong>
                          </p>
                        )}
                        {pay.note && (
                          <p className="text-[10px] text-neutral-500 italic mt-0.5">
                            "{pay.note}"
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          {formatETB(pay.amount)}
                        </span>
                        <p className="text-[10px] text-neutral-400">By {pay.paidByAdminName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCreatorForHistory(null)}
                className="rounded-xl bg-neutral-900 px-5 py-2 font-bold text-white hover:bg-neutral-800"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
