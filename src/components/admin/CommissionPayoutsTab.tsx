import React, { useState } from 'react';
import { DollarSign, Zap, CheckCircle2, Clock, FileText, Send, Building2, Store } from 'lucide-react';
import { storage } from '../../lib/storage';
import { CommissionPayout } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

export function CommissionPayoutsTab() {
  const [paymentModalPayout, setPaymentModalPayout] = useState<CommissionPayout | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const payouts = storage.getPayouts();
  const storefronts = storage.getStorefronts();

  const eligibleForPayout = storefronts.filter(
    (sf) => sf.pendingPayout >= sf.minPayoutThreshold && sf.pendingPayout > 0
  );

  const totalPendingPayoutAmount = storefronts.reduce((sum, sf) => sum + sf.pendingPayout, 0);
  const totalPaidOutAmount = payouts
    .filter((p) => p.status === 'processed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleRunMonthlyPayouts = () => {
    if (confirm(`Run automated monthly payouts for ${eligibleForPayout.length} eligible reseller storefronts?`)) {
      const generated = storage.runMonthlyPayouts();
      alert(`Successfully processed ${generated.length} reseller payouts!`);
    }
  };

  const handleRecordPaymentSubmit = () => {
    if (!paymentModalPayout || !paymentReference.trim()) return;
    storage.markPayoutPaid(paymentModalPayout.id, paymentReference.trim());
    setPaymentModalPayout(null);
    setPaymentReference('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Automated Payout Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Commission & Payout Management</h2>
          <p className="text-xs text-neutral-500">
            Oversee platform reseller commission settlements, execute monthly ACH/Stripe transfer cycles, and record bank transaction references.
          </p>
        </div>

        <button
          onClick={handleRunMonthlyPayouts}
          disabled={eligibleForPayout.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Run Monthly Payout Batch ({eligibleForPayout.length} Eligible)
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-bold text-neutral-500">Total Settled Payouts</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(totalPaidOutAmount)}</p>
          <p className="mt-1 text-[11px] text-neutral-400">{payouts.length} payout records generated</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-bold text-neutral-500">Unsettled Pending Commissions</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{formatCurrency(totalPendingPayoutAmount)}</p>
          <p className="mt-1 text-[11px] text-neutral-400">Held in escrow until monthly settlement</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-bold text-neutral-500">Eligible Resellers Today</p>
          <p className="mt-2 text-2xl font-black text-neutral-900">{eligibleForPayout.length} Storefronts</p>
          <p className="mt-1 text-[11px] text-neutral-400">Exceed minimum payout thresholds</p>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Historical Settlement & Payout Ledger</h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Payout ID & Date</th>
              <th className="py-3.5 px-4">Reseller Storefront</th>
              <th className="py-3.5 px-4">Settlement Period</th>
              <th className="py-3.5 px-4">Payout Amount</th>
              <th className="py-3.5 px-4">Bank Reference #</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {payouts.map((pay) => (
              <tr key={pay.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                  <span>#{pay.id}</span>
                  <p className="text-[10px] text-neutral-400 font-sans font-normal">{formatDate(pay.payoutDate)}</p>
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-900">{pay.storefrontName}</td>

                <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600">
                  {pay.periodStart} to {pay.periodEnd}
                </td>

                <td className="py-3.5 px-4 font-bold text-emerald-700">{formatCurrency(pay.amount)}</td>

                <td className="py-3.5 px-4 font-mono text-neutral-600">
                  {pay.paymentReference || <span className="italic text-neutral-400">Pending ACH ref</span>}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      pay.status === 'processed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" /> {pay.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      setPaymentModalPayout(pay);
                      setPaymentReference(pay.paymentReference || `ACH-${Math.floor(10000000 + Math.random() * 90000000)}`);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <FileText className="h-3 w-3 text-neutral-500" />
                    Record Reference
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Reference Modal */}
      {paymentModalPayout && (
        <Modal
          isOpen={!!paymentModalPayout}
          onClose={() => setPaymentModalPayout(null)}
          title={`Record Bank Reference for Payout #${paymentModalPayout.id}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600">
              Attach bank ACH wire trace, Stripe payout reference, or settlement transaction ID for reseller <strong>{paymentModalPayout.storefrontName}</strong>.
            </p>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Transaction Reference Number</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. ACH-98234192 / po_1N8x2y..."
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPaymentModalPayout(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPaymentSubmit}
                className="rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                Save Reference
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
