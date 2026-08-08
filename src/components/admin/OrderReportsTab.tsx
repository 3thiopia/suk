import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Building2,
  Store,
  ShoppingBag,
  Eye,
  Send,
  Lock,
  ExternalLink,
  Image as ImageIcon,
  UserCheck,
  AlertOctagon,
  XCircle,
  FileText,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { OrderReport, OrderReportStatus, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { OrderStatusBadge } from '../common/Badge';

export function OrderReportsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<OrderReport | null>(null);

  // Modal interaction forms
  const [statusInput, setStatusInput] = useState<OrderReportStatus>('open');
  const [noteInput, setNoteInput] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  const [inquiryTarget, setInquiryTarget] = useState<'business' | 'reseller' | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');

  const reports = storage.getOrderReports();

  const filtered = reports.filter((r) => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (r.id || '').toLowerCase().includes(term) ||
      (r.orderId || '').toLowerCase().includes(term) ||
      (r.resellerName || '').toLowerCase().includes(term) ||
      (r.businessName || '').toLowerCase().includes(term) ||
      (r.category || '').toLowerCase().includes(term);
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = reports.filter((r) => r.status === 'open').length;
  const investigatingCount = reports.filter((r) => r.status === 'investigating').length;
  const waitingCount = reports.filter(
    (r) => r.status === 'waiting_business_response' || r.status === 'waiting_reseller_response'
  ).length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;

  const handleOpenReportModal = (report: OrderReport) => {
    setSelectedReport(report);
    setStatusInput(report.status);
    setNoteInput('');
    setIsInternalOnly(false);
    setResolutionInput(report.resolutionDetails || '');
    setInquiryTarget(null);
    setInquiryMessage('');
  };

  const handleUpdateStatus = (newStatus: OrderReportStatus) => {
    if (!selectedReport) return;
    const updated = storage.updateOrderReportStatus(
      selectedReport.id,
      newStatus,
      noteInput.trim() ? noteInput.trim() : undefined,
      newStatus === 'resolved' || newStatus === 'closed' ? resolutionInput.trim() : undefined
    );

    if (updated) {
      setSelectedReport(updated);
      setStatusInput(updated.status);
      setNoteInput('');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !noteInput.trim()) return;

    const currentUser = storage.getCurrentUser();
    const updated = storage.addOrderReportNote(
      selectedReport.id,
      currentUser.name || 'Platform Admin',
      currentUser.role || 'admin',
      noteInput.trim(),
      isInternalOnly
    );

    if (updated) {
      setSelectedReport(updated);
      setNoteInput('');
    }
  };

  const handleSendInquiry = (target: 'business' | 'reseller') => {
    if (!selectedReport || !inquiryMessage.trim()) return;

    const targetStatus: OrderReportStatus =
      target === 'business' ? 'waiting_business_response' : 'waiting_reseller_response';

    const updated = storage.updateOrderReportStatus(
      selectedReport.id,
      targetStatus,
      `[Admin Request to ${target === 'business' ? 'Business Owner' : 'Reseller'}]: ${inquiryMessage.trim()}`,
      undefined,
      target
    );

    if (updated) {
      setSelectedReport(updated);
      setStatusInput(updated.status);
      setInquiryMessage('');
      setInquiryTarget(null);
    }
  };

  const getStatusBadgeClass = (status: OrderReportStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'waiting_business_response':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiting_reseller_response':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-neutral-900">Reseller Order Issue Reports</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit reseller complaints linked to specific orders. Manage status, request vendor response, and resolve disputes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search report ID, order ID, reseller, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 focus:outline-none"
          >
            <option value="all">All Report Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="waiting_business_response">Waiting Business Response</option>
            <option value="waiting_reseller_response">Waiting Reseller Response</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <span className="text-xs font-semibold text-red-700">Open Reports</span>
          <p className="text-2xl font-black text-red-900 mt-1">{openCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <span className="text-xs font-semibold text-amber-700">Under Investigation</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{investigatingCount}</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
          <span className="text-xs font-semibold text-purple-700">Awaiting Response</span>
          <p className="text-2xl font-black text-purple-900 mt-1">{waitingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <span className="text-xs font-semibold text-emerald-700">Resolved / Closed</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3.5 px-4">Report ID & Date</th>
                <th className="py-3.5 px-4">Linked Order</th>
                <th className="py-3.5 px-4">Reseller & Storefront</th>
                <th className="py-3.5 px-4">Business Owner</th>
                <th className="py-3.5 px-4">Category & Details</th>
                <th className="py-3.5 px-4">Report Status</th>
                <th className="py-3.5 px-4 text-right">Inspect Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No order reports match your search filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      <span>#{report.id}</span>
                      <p className="text-[10px] text-neutral-400 font-sans font-normal">{formatDate(report.createdAt)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-neutral-900">#{report.orderId}</span>
                        <p className="text-[11px] font-medium text-neutral-600 truncate max-w-[140px]">{report.itemsSummary}</p>
                        <div className="mt-0.5">
                          <OrderStatusBadge status={report.orderStatus} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900">{report.resellerName}</p>
                      <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Store className="h-3 w-3 text-neutral-400" />
                        <span>{report.storefrontName}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{report.businessName || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-red-700 block">{report.category}</span>
                      <p className="text-[11px] text-neutral-600 line-clamp-1 max-w-[220px]">{report.description}</p>
                      {report.attachments && report.attachments.length > 0 && (
                        <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1 mt-0.5">
                          <ImageIcon className="h-3 w-3" /> {report.attachments.length} attachment(s)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(report.status)}`}>
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReportModal(report)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 shadow-2xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Audit Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Report Inspector Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Order Report #${selectedReport.id}`}
          subtitle={`Investigate reseller complaint linked to Order #${selectedReport.orderId}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
            {/* Report Header Overview Banner */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Report Category</span>
                  <h3 className="text-base font-black text-red-700">{selectedReport.category}</h3>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Status</span>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Linked Order & Parties Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Linked Order</span>
                  <p className="font-mono font-bold text-neutral-900">#{selectedReport.orderId}</p>
                  <p className="text-[10px] text-neutral-500">{formatDate(selectedReport.orderDate)}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Order Status</span>
                  <div className="mt-0.5">
                    <OrderStatusBadge status={selectedReport.orderStatus} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Reseller / Storefront</span>
                  <p className="font-bold text-neutral-900 truncate">{selectedReport.resellerName}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{selectedReport.storefrontName}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Business Owner</span>
                  <p className="font-bold text-neutral-900 truncate">{selectedReport.businessName || 'N/A'}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Comm: {formatCurrency(selectedReport.resellerCommission)}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="pt-2.5 border-t border-neutral-200 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Items Summary</span>
                <p className="font-medium text-neutral-800">{selectedReport.itemsSummary} (Total: {formatCurrency(selectedReport.totalAmount)})</p>
              </div>
            </div>

            {/* Description & Attachments */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Reseller Issue Description</h4>
                <div className="rounded-xl border border-neutral-200 bg-white p-3.5 text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {selectedReport.description}
                </div>
              </div>

              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Submitted Proof Attachments</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedReport.attachments.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 hover:border-neutral-900 transition-colors"
                      >
                        {imgUrl.startsWith('data:image') || imgUrl.startsWith('http') ? (
                          <img src={imgUrl} alt={`Proof ${idx + 1}`} className="h-28 w-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="h-28 flex items-center justify-center text-xs font-bold text-neutral-500">Document #{idx + 1}</div>
                        )}
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          Attachment #{idx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Action Bar */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Admin Moderation & Status Actions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Change Report Status</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as OrderReportStatus)}
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2 px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="waiting_business_response">Waiting Business Response</option>
                      <option value="waiting_reseller_response">Waiting Reseller Response</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(statusInput)}
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shrink-0"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Direct Outreach / Inquiries</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryTarget('business')}
                      className={`flex-1 rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                        inquiryTarget === 'business'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5 text-purple-600" />
                      <span>Contact Business Owner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryTarget('reseller')}
                      className={`flex-1 rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                        inquiryTarget === 'reseller'
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <Store className="h-3.5 w-3.5 text-blue-600" />
                      <span>Request Reseller Info</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inquiry Input Box */}
              {inquiryTarget && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>
                      Inquiry to {inquiryTarget === 'business' ? `Business Owner (${selectedReport.businessName})` : `Reseller (${selectedReport.resellerName})`}
                    </span>
                    <button onClick={() => setInquiryTarget(null)} className="text-purple-500 hover:text-purple-800">
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={`Type official inquiry/request to ${inquiryTarget === 'business' ? 'business owner regarding fulfillment status' : 'reseller for extra evidence'}...`}
                    className="w-full rounded-lg border border-purple-200 bg-white p-2 text-xs text-neutral-900 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSendInquiry(inquiryTarget)}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-800 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send Official Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution Summary (When status is resolved/closed) */}
              {(statusInput === 'resolved' || statusInput === 'closed') && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-emerald-800">Resolution Summary (Sent to reseller)</label>
                  <textarea
                    rows={2}
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    placeholder="Enter resolution details (e.g., refund issued, business confirmed dispatch, commission adjusted)..."
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Admin Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">Add Note / Log Record</label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalOnly}
                      onChange={(e) => setIsInternalOnly(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900"
                    />
                    <span className="flex items-center gap-1 font-semibold text-neutral-600">
                      <Lock className="h-3 w-3 text-amber-600" /> Internal note (visible only to admins)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Type note or investigation update..."
                    className="flex-1 rounded-xl border border-neutral-200 bg-white py-2 px-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Notes & Log Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Investigation Notes & History</h4>
              {selectedReport.notes.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No notes recorded yet for this report.</p>
              ) : (
                <div className="space-y-2">
                  {selectedReport.notes.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl border p-3 text-xs space-y-1 ${
                        n.isInternalOnly ? 'border-amber-200 bg-amber-50/60' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">{n.authorName}</span>
                          <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[10px] font-mono text-neutral-600 uppercase">
                            {n.authorRole}
                          </span>
                          {n.isInternalOnly && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded">
                              <Lock className="h-3 w-3" /> Admin Internal Only
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-neutral-800 text-[11px] whitespace-pre-wrap">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
