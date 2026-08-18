import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { formatETB, formatDate } from '../../lib/utils';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';
import { CreatorPayout, CreatorPayoutAccount } from '../../types';
import { CopyableField } from '../common/CopyableField';

interface CommissionPayoutsViewProps {
  onNavigate?: (path: string, params?: any) => void;
}

export function CommissionPayoutsView({ onNavigate }: CommissionPayoutsViewProps) {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);
  const minPayoutAmount = storage.getMinPayoutAmount();

  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  const [payoutAccount, setPayoutAccount] = useState<CreatorPayoutAccount | null>(() =>
    storage.getCreatorPayoutAccount(currentUser.id)
  );

  // Subscribe to storage updates for real-time reactivity
  const [, setStorageTick] = useState(0);
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStorageTick((prev) => prev + 1);
      setPayoutAccount(storage.getCreatorPayoutAccount(currentUser.id));
    });
    return unsubscribe;
  }, [currentUser.id]);

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
          {p.transactionReference ? (
            <CopyableField
              valueToCopy={p.transactionReference}
              label="Transaction reference"
              successMessage="Reference copied"
              size="xs"
              showLabel={false}
              textClassName="font-mono font-bold text-neutral-900"
            />
          ) : (
            <span className="italic text-neutral-400">Direct Handover</span>
          )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-neutral-900">Creator Commission & Payouts</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track your earned commissions from customer orders, review unpaid balances, and configure your Ethiopian Bank payout account.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('/reseller/settings')}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Manage Payout Account</span>
          </button>
        )}
      </div>

      {/* Linked Payout Account Preview Card */}
      <div className="rounded-2xl border border-neutral-200 bg-linear-to-r from-neutral-50 via-white to-neutral-50 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-emerald-400 shadow-xs">
              {payoutAccount?.payoutMethod === 'ethiopian_bank' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <Smartphone className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Linked Payout Account
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              </div>

              {payoutAccount?.payoutMethod === 'ethiopian_bank' ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm font-black text-neutral-900 truncate">
                    {payoutAccount.bankName || 'Ethiopian Bank'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
                    <span className="font-medium text-neutral-500">Account:</span>
                    {payoutAccount.accountNumber ? (
                      <CopyableField
                        valueToCopy={payoutAccount.accountNumber}
                        label="Account number"
                        successMessage="Account number copied"
                        size="xs"
                        showLabel={false}
                        textClassName="font-mono font-bold text-neutral-900"
                      />
                    ) : (
                      <span className="font-mono font-bold text-neutral-900">••••</span>
                    )}
                    <span className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                      ({payoutAccount.accountHolderName || currentUser.name})
                    </span>
                  </div>
                </div>
              ) : payoutAccount?.payoutMethod === 'telebirr' ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm font-black text-neutral-900">Telebirr Wallet</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
                    <span className="font-medium text-neutral-500">Phone:</span>
                    <CopyableField
                      valueToCopy={payoutAccount.telebirrPhone || currentUser.phone}
                      label="Telebirr number"
                      successMessage="Telebirr number copied"
                      size="xs"
                      showLabel={false}
                      textClassName="font-mono font-bold text-neutral-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  <p className="text-xs text-amber-700 font-medium">
                    No verified payout account linked yet. Please configure your Ethiopian bank account.
                  </p>
                </div>
              )}
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/reseller/settings')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
            >
              <span>Change Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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
                Platform admins will process your manual payout via your linked Ethiopian Bank or Telebirr account during the upcoming settlement cycle.
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
