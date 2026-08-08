import React, { useState } from 'react';
import { Store, Search, Shield, AlertTriangle, ExternalLink, DollarSign, Wallet, ShoppingBag, Ban, PauseCircle, Lock, Unlock } from 'lucide-react';
import { storage } from '../../lib/storage';
import { UserAccountStatus, Storefront } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

interface ResellerManagementTabProps {
  onNavigate: (path: string) => void;
}

export function ResellerManagementTab({ onNavigate }: ResellerManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [banModalStorefront, setBanModalStorefront] = useState<Storefront | null>(null);
  const [suspendModalStorefront, setSuspendModalStorefront] = useState<Storefront | null>(null);
  const [disableModalStorefront, setDisableModalStorefront] = useState<Storefront | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
  const [suspensionEndDate, setSuspensionEndDate] = useState('');

  const storefronts = storage.getStorefronts();
  const users = storage.getUsers();
  const orders = storage.getOrders();

  const filtered = storefronts.filter((sf) => {
    return (
      sf.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleConfirmBan = () => {
    if (!banModalStorefront || !actionReason.trim()) return;
    storage.banUser(banModalStorefront.resellerId, actionReason.trim(), banType);
    setBanModalStorefront(null);
    setActionReason('');
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalStorefront || !actionReason.trim()) return;
    storage.suspendUser(suspendModalStorefront.resellerId, actionReason.trim(), suspensionEndDate || undefined);
    setSuspendModalStorefront(null);
    setActionReason('');
    setSuspensionEndDate('');
  };

  const handleConfirmToggleDisable = () => {
    if (!disableModalStorefront) return;
    const nextState = !disableModalStorefront.isDisabled;
    storage.toggleStorefrontDisabled(disableModalStorefront.id, nextState, actionReason.trim() || undefined);
    setDisableModalStorefront(null);
    setActionReason('');
  };

  const handleReactivate = (sf: Storefront) => {
    storage.reactivateUser(sf.resellerId, 'Reactivated by platform administrator');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Reseller Storefront Governance</h2>
          <p className="text-xs text-neutral-500">
            Monitor white-label storefront operations, reseller commissions, payout status, and enforce platform compliance.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search storefront name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Reseller Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Storefront & URL</th>
              <th className="py-3.5 px-4">Theme & Layout</th>
              <th className="py-3.5 px-4">Total Earnings</th>
              <th className="py-3.5 px-4">Pending Payout</th>
              <th className="py-3.5 px-4">Store Access</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4 text-right">Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filtered.map((sf) => {
              const resellerUser = users.find((u) => u.id === sf.resellerId);
              const currentStatus: UserAccountStatus = sf.status || resellerUser?.status || 'active';

              return (
                <tr key={sf.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={sf.logoUrl} alt={sf.storeName} className="h-9 w-9 rounded-xl object-cover border" />
                      <div>
                        <p className="font-bold text-neutral-900">{sf.storeName}</p>
                        <button
                          onClick={() => onNavigate(`/store/${sf.slug}`)}
                          className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 hover:underline"
                        >
                          /store/{sf.slug} <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[10px] font-bold capitalize text-neutral-700">
                      {sf.themeColor} • {sf.layoutMode}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-neutral-900">{formatCurrency(sf.totalEarnings)}</td>

                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${sf.pendingPayout >= sf.minPayoutThreshold ? 'text-emerald-700 font-extrabold' : 'text-neutral-600'}`}>
                      {formatCurrency(sf.pendingPayout)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {sf.isDisabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800 border border-red-300">
                        <Lock className="h-3 w-3" /> Storefront Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Unlock className="h-3 w-3" /> Publicly Active
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        currentStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : currentStatus === 'suspended'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setDisableModalStorefront(sf);
                          setActionReason(sf.disabledReason || '');
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          sf.isDisabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {sf.isDisabled ? 'Enable Store' : 'Disable Store'}
                      </button>

                      {currentStatus === 'active' ? (
                        <button
                          onClick={() => {
                            setSuspendModalStorefront(sf);
                            setActionReason('');
                            setSuspensionEndDate('');
                          }}
                          className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 hover:bg-amber-100"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(sf)}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          Reactivate
                        </button>
                      )}

                      {currentStatus !== 'banned' && (
                        <button
                          onClick={() => {
                            setBanModalStorefront(sf);
                            setActionReason('');
                            setBanType('permanent');
                          }}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200 hover:bg-red-100"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disable / Enable Storefront Modal */}
      {disableModalStorefront && (
        <Modal
          isOpen={!!disableModalStorefront}
          onClose={() => setDisableModalStorefront(null)}
          title={`${disableModalStorefront.isDisabled ? 'Enable' : 'Disable'} Storefront: ${disableModalStorefront.storeName}`}
        >
          <div className="space-y-4 text-xs text-neutral-700">
            <p className="text-neutral-600">
              {disableModalStorefront.isDisabled
                ? 'Enabling this storefront will restore public visitor browsing and allow customers to place checkout orders again.'
                : 'Disabling this storefront will prevent public visitors from viewing products or making purchases on this reseller website.'}
            </p>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Reason / Admin Note</label>
              <textarea
                rows={3}
                placeholder="Specify reason (e.g., Compliance audit or copyright review)..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setDisableModalStorefront(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleDisable}
                className={`rounded-xl px-5 py-2 font-bold text-white ${
                  disableModalStorefront.isDisabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {disableModalStorefront.isDisabled ? 'Enable Storefront' : 'Disable Storefront'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Ban Reseller Modal */}
      {banModalStorefront && (
        <Modal isOpen={!!banModalStorefront} onClose={() => setBanModalStorefront(null)} title={`Ban Reseller: ${banModalStorefront.storeName}`}>
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-800">
              <Ban className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ban Account Enforcement</p>
                <p className="text-[11px] text-red-700">
                  Banning this reseller will terminate their session, disable their storefront automatically, block payouts and commission accruals, and display the Account Restricted page to them.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Ban Reason (Displayed to User & Audit Log)</label>
              <textarea
                rows={3}
                placeholder="Specify exact reason for ban (e.g., Fraudulent commission claims, misleading marketing, policy violation)..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Ban Classification</label>
              <select
                value={banType}
                onChange={(e) => setBanType(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-neutral-300 px-3 text-xs font-semibold text-neutral-800"
              >
                <option value="permanent">Permanent Ban (Indefinite)</option>
                <option value="temporary">Temporary Ban (Subject to Appeal)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setBanModalStorefront(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={!actionReason.trim()}
                className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Account Ban
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend Reseller Modal */}
      {suspendModalStorefront && (
        <Modal isOpen={!!suspendModalStorefront} onClose={() => setSuspendModalStorefront(null)} title={`Suspend Reseller: ${suspendModalStorefront.storeName}`}>
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-start gap-3 text-amber-800">
              <PauseCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Suspension</p>
                <p className="text-[11px] text-amber-700">
                  Suspending this reseller temporarily blocks their dashboard access. Note: Per platform governance policy, their storefront remains accessible unless you explicitly disable it.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Suspension Reason</label>
              <textarea
                rows={3}
                placeholder="Specify reason for temporary suspension..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Suspension End Date (Optional)</label>
              <input
                type="date"
                value={suspensionEndDate}
                onChange={(e) => setSuspensionEndDate(e.target.value)}
                className="w-full h-9 rounded-xl border border-neutral-300 px-3 text-xs text-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSuspendModalStorefront(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                disabled={!actionReason.trim()}
                className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

