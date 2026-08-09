import React, { useState } from 'react';
import { DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { storage } from '../../lib/storage';
import { formatCurrency, formatDate, formatShortDate } from '../../lib/utils';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';

export function CommissionPayoutsView() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [threshold, setThreshold] = useState(storefront?.minPayoutThreshold || 50.00);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  if (!storefront) return null;

  const payouts = storage.getPayoutsByReseller(currentUser.id);

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (threshold < 50) {
      setErrorMsg('You cannot set payout threshold below the platform minimum ($50.00).');
      return;
    }

    storage.updateStorefront(storefront.id, { minPayoutThreshold: threshold });
    setSuccessMsg('Payout threshold successfully updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const isEligibleForNextBatch = storefront.pendingPayout >= storefront.minPayoutThreshold;

  const payoutColumns: Column<any>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      priority: 'primary',
      cell: (p) => <span className="font-mono font-bold text-neutral-900">#{p.id}</span>,
    },
    {
      key: 'period',
      header: 'Period',
      priority: 'secondary',
      cell: (p) => <span className="text-neutral-600">{p.periodStart} to {p.periodEnd}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      priority: 'secondary',
      cell: (p) => <span className="font-extrabold text-emerald-700">{formatCurrency(p.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'secondary',
      cell: () => <Badge variant="success">PROCESSED</Badge>,
    },
    {
      key: 'date',
      header: 'Transfer Date',
      priority: 'secondary',
      cell: (p) => <span className="text-neutral-500">{formatDate(p.payoutDate)}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Commission & Monthly Payouts</h1>
        <p className="text-xs text-neutral-500">
          Commission accumulates on every storefront order and is distributed via monthly automated admin payouts.
        </p>
      </div>

      {/* Analytics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Accumulated Total Earnings"
          value={formatCurrency(storefront.totalEarnings)}
          subtitle="All-time storefront sales commissions"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Current Pending Payout"
          value={formatCurrency(storefront.pendingPayout)}
          subtitle={isEligibleForNextBatch ? 'Ready for next monthly payout' : 'Below payout threshold'}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Payout Threshold"
          value={formatCurrency(storefront.minPayoutThreshold)}
          subtitle="Platform min: $50.00"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Threshold Configuration Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Configure Payout Threshold</h3>
            <p className="text-xs text-neutral-500">
              Resellers may increase payout threshold to accumulate larger payouts. You cannot set it below $50.00.
            </p>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            Current: {formatCurrency(storefront.minPayoutThreshold)}
          </span>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveThreshold} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-bold">$</span>
            <input
              type="number"
              step="10"
              min="50"
              required
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 50)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-7 pr-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 font-bold"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 shadow-2xs"
          >
            Update Threshold
          </button>
        </form>
      </div>

      {/* Payout History Table */}
      <div className="space-y-4">
        <ResponsiveDataTable
          title="Payout History"
          data={payouts}
          columns={payoutColumns}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          emptyTitle="No Payout History"
          emptyDescription="No monthly payouts processed yet."
        />
      </div>
    </div>
  );
}
