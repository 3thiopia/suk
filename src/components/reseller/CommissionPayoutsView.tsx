import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  History,
  Phone,
  FileText,
  Info,
  Check,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { formatETB, formatDate, formatShortDate } from '../../lib/utils';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';
import { CreatorPayout } from '../../types';

export function CommissionPayoutsView() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);
  const minPayoutAmount = storage.getMinPayoutAmount();

  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  // Subscribe to storage updates for real-time reactivity
  const [, setStorageTick] = useState(0);
  React.useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStorageTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  if (!storefront) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
        <h3 className="text-sm font-bold text-neutral-800">No Storefront Found</h3>
        <p className="text-xs text-neutral-500 mt-1">Please set up your creator storefront to start earning commissions.</p>
      </div>
    );
  }

  // Get balance details calculated by storage
  const balances = storage.getCreatorCommissionBalances();
  const myBalance = balances.find((b) => b.creatorId === currentUser.id) || {
    creatorId: currentUser.id,
    creatorName: currentUser.name,
    creatorEmail: currentUser.email,
    creatorPhone: currentUser.phone || '',
    storefrontId: storefront.id,
    storefrontName: storefront.storeName,
    totalCommissionEarned: storefront.totalEarnings || 0,
    alreadyPaid: 0,
    unpaidCommission: storefront.pendingPayout || 0,
    status: (storefront.pendingPayout >= minPayoutAmount && storefront.pendingPayout > 0
      ? 'eligible'
      : storefront.pendingPayout === 0
      ? 'paid'
      : 'not_eligible') as any,
    minPayoutRequirement: minPayoutAmount,
  };

  const manualPayouts = storage.getCreatorPayoutsByCreatorId(currentUser.id);

  const isEligible = myBalance.status === 'eligible';
  const isPaid = myBalance.status === 'paid';
  const deficit = Math.max(0, minPayoutAmount - myBalance.unpaidCommission);

  const payoutColumns: Column<CreatorPayout>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      priority: 'primary',
      cell: (p) => <span className="font-mono font-bold text-neutral-900">#{p.id}</span>,
    },
    {
      key: 'paidAt',
      header: 'Payment Date',
      priority: 'primary',
      cell: (p) => <span className="text-neutral-700 font-medium">{formatDate(p.paidAt)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      priority: 'primary',
      cell: (p) => <span className="font-mono font-black text-emerald-700">{formatETB(p.amount)}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      priority: 'secondary',
      cell: (p) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-800 uppercase font-mono">
          <CreditCard className="h-3 w-3 text-neutral-500" />
          {p.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'transactionReference',
      header: 'Transaction Reference #',
      priority: 'secondary',
      cell: (p) => (
        <span className="font-mono font-bold text-neutral-900">
          {p.transactionReference || <span className="italic text-neutral-400">Direct Handover</span>}
        </span>
      ),
    },
    {
      key: 'commissionPeriod',
      header: 'Settlement Period',
      priority: 'secondary',
      cell: (p) => <span className="text-neutral-600 text-xs">{p.commissionPeriod || 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'secondary',
      cell: () => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
          <CheckCircle2 className="h-3 w-3" /> Paid
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6" id="creator-commission-view">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-neutral-900">Creator Commission & Payouts</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Track your earned commissions from customer orders, review unpaid balances, and monitor manual settlements via Telebirr or Bank Transfer.
        </p>
      </div>

      {/* Eligibility Status Banner */}
      {isEligible ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-200 text-emerald-900 px-2 py-0.5 text-[10px] font-black uppercase">
                  Eligible for Payout
                </span>
                <span className="text-xs text-emerald-800 font-bold">Minimum Requirement Met</span>
              </div>
              <p className="text-sm font-black text-emerald-950 mt-1">
                Your available balance of {formatETB(myBalance.unpaidCommission)} meets the {formatETB(minPayoutAmount)} minimum threshold.
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Platform admins will process your manual payout via Telebirr or Bank Transfer during the upcoming settlement window.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-emerald-200 text-right">
            <p className="text-[10px] font-bold uppercase text-emerald-800">Available Unpaid Balance</p>
            <p className="text-xl font-black text-emerald-700 font-mono">{formatETB(myBalance.unpaidCommission)}</p>
          </div>
        </div>
      ) : isPaid ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <span className="rounded-full bg-neutral-200 text-neutral-800 px-2 py-0.5 text-[10px] font-black uppercase">
              All Settled
            </span>
            <p className="text-sm font-bold text-neutral-800 mt-1">
              All earned commissions have been paid out in full!
            </p>
            <p className="text-xs text-neutral-500">
              Share your storefront link to make more sales and earn new commissions.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-[10px] font-black uppercase">
                    Not Eligible Yet
                  </span>
                  <span className="text-xs text-amber-800 font-bold">Below Minimum Threshold</span>
                </div>
                <p className="text-sm font-bold text-neutral-900 mt-1">
                  You need <span className="font-black text-amber-800 font-mono">{formatETB(deficit)}</span> more to reach the {formatETB(minPayoutAmount)} minimum payout threshold.
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Current unpaid commission balance: <strong className="font-mono text-neutral-900">{formatETB(myBalance.unpaidCommission)}</strong>.
                </p>
              </div>
            </div>

            <div className="shrink-0 bg-white rounded-xl p-3 border border-amber-200 text-right">
              <p className="text-[10px] font-bold uppercase text-neutral-400">Current Balance</p>
              <p className="text-lg font-black text-amber-700 font-mono">{formatETB(myBalance.unpaidCommission)}</p>
            </div>
          </div>

          {/* Progress bar towards threshold */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-neutral-600 mb-1">
              <span>Progress towards payout</span>
              <span>{Math.min(100, Math.round((myBalance.unpaidCommission / minPayoutAmount) * 100))}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-amber-200/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, (myBalance.unpaidCommission / minPayoutAmount) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Total Earned Commissions</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-neutral-900 font-mono">
            {formatETB(myBalance.totalCommissionEarned)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">All-time delivered order earnings</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Already Paid Out</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-neutral-900 font-mono">
            {formatETB(myBalance.alreadyPaid)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">{manualPayouts.length} past manual settlements</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500">Minimum Payout Requirement</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-700 font-mono">
            {formatETB(minPayoutAmount)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Set by platform operator</p>
        </div>
      </div>

      {/* Manual Payouts Policy Notice */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs">
          <Info className="h-4 w-4 text-emerald-600" />
          <span>How SUK Manual Creator Payouts Work</span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Commissions are tracked from all delivered orders placed through your storefront link. When your unpaid balance reaches or exceeds the <strong>{formatETB(minPayoutAmount)}</strong> minimum payout threshold, SUK Admins process your payout manually via <strong>Telebirr</strong> or <strong>Bank Transfer</strong>. You will receive a notification and reference receipt for every payout.
        </p>
      </div>

      {/* Payout History Table */}
      <div className="space-y-4">
        <ResponsiveDataTable
          title="Manual Settlement & Payout History"
          data={manualPayouts}
          columns={payoutColumns}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          emptyTitle="No Payout History Yet"
          emptyDescription="When platform admins process your commission settlements, they will be logged here."
        />
      </div>
    </div>
  );
}
