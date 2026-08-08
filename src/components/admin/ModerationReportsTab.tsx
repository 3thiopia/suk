import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon, XCircle, Search, UserX, MessageSquare } from 'lucide-react';
import { storage } from '../../lib/storage';
import { ModerationReport } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

export function ModerationReportsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const reports = storage.getReports();

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateReportStatus = (status: ModerationReport['status']) => {
    if (!selectedReport) return;
    storage.updateReportStatus(selectedReport.id, status, adminNoteInput);
    setSelectedReport(null);
    setAdminNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform Moderation Reports</h2>
          <p className="text-xs text-neutral-500">
            Audit abuse flags, counterfeit reports, misleading storefront listings, and community compliance violations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search report, reason, reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700"
          >
            <option value="all">All Report Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="action_taken">Action Taken</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports List Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Report ID & Date</th>
              <th className="py-3.5 px-4">Target Entity</th>
              <th className="py-3.5 px-4">Reporter</th>
              <th className="py-3.5 px-4">Reason & Description</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Moderation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                  <span>#{r.id}</span>
                  <p className="text-[10px] text-neutral-400 font-sans font-normal">{formatDate(r.createdAt)}</p>
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-900">
                  <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10px] uppercase text-neutral-700 mr-1 font-mono">
                    {r.targetType}
                  </span>
                  #{r.targetId}
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-neutral-900">{r.reporterName}</p>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-bold text-neutral-900 truncate">{r.reason}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{r.details}</p>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      r.status === 'actioned'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : r.status === 'reviewed'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : r.status === 'dismissed'
                        ? 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setAdminNoteInput(r.adminNotes || '');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    Investigate Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Review Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Investigate Moderation Report: #${selectedReport.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-neutral-900">Target: {selectedReport.targetType.toUpperCase()} #{selectedReport.targetId}</span>
                <span className="text-neutral-500">Filed by: {selectedReport.reporterName}</span>
              </div>
              <p className="font-bold text-neutral-900">Reason: {selectedReport.reason}</p>
              <p className="text-neutral-600 leading-relaxed">{selectedReport.details}</p>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Admin Action Notes</label>
              <textarea
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Log internal action details or warning message issued..."
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleUpdateReportStatus('dismissed')}
                className="rounded-xl border border-neutral-200 px-3 py-2 font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleUpdateReportStatus('reviewed')}
                className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-2 font-bold text-purple-700 hover:bg-purple-100"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => handleUpdateReportStatus('actioned')}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-red-700"
              >
                Take Enforcement Action
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
