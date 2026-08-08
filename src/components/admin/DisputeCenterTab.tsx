import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, MessageSquare, Shield, Clock, Search, Send, FileText, UserCheck } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Dispute, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

export function DisputeCenterTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [replyText, setReplyText] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');

  const disputes = storage.getDisputes();

  const filtered = disputes.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.complainantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = () => {
    if (!selectedDispute || !replyText.trim()) return;
    const currentUser = storage.getCurrentUser();
    storage.addDisputeMessage(selectedDispute.id, {
      senderId: currentUser.id,
      senderName: currentUser.name || 'Platform Admin',
      senderRole: 'admin',
      text: replyText.trim(),
    });

    // Refresh local dispute view
    const updated = storage.getDisputeById(selectedDispute.id);
    if (updated) setSelectedDispute(updated);
    setReplyText('');
  };

  const handleUpdateStatus = (status: Dispute['status'], resolutionDetails?: string) => {
    if (!selectedDispute) return;
    storage.updateDisputeStatus(selectedDispute.id, status, resolutionDetails, internalNoteInput);
    const updated = storage.getDisputeById(selectedDispute.id);
    if (updated) setSelectedDispute(updated);
    setInternalNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform Dispute Center</h2>
          <p className="text-xs text-neutral-500">
            Arbitrate conflicts between buyers, reseller storefronts, and brand owners. Handle refunds, item non-receipts, and quality complaints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search dispute, order ID..."
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
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Disputes List Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Dispute Ref & Date</th>
              <th className="py-3.5 px-4">Order Ref</th>
              <th className="py-3.5 px-4">Complainant</th>
              <th className="py-3.5 px-4">Reason & Category</th>
              <th className="py-3.5 px-4">Disputed Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Arbitration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                  <span>#{d.id}</span>
                  <p className="text-[10px] text-neutral-400 font-sans font-normal">{formatDate(d.createdAt)}</p>
                </td>

                <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800">#{d.orderId}</td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-neutral-900">{d.complainantName}</p>
                  <p className="text-[10px] text-neutral-500 capitalize">{d.complainantRole} Role</p>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-bold text-neutral-900 truncate">{d.reason}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{d.description}</p>
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-900">{formatCurrency(d.disputedAmount)}</td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      d.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'investigating'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : d.status === 'rejected'
                        ? 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {d.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    Arbitrate Case
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dispute Case Resolution & Message Drawer Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute Case Arbitration: #${selectedDispute.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Case Overview */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Order ID: #{selectedDispute.orderId}</span>
                  <h3 className="text-sm font-bold text-neutral-900">{selectedDispute.reason}</h3>
                  <p className="text-neutral-600 mt-1">{selectedDispute.description}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                    Disputed: {formatCurrency(selectedDispute.disputedAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Arbitration Status Actions */}
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
              <span className="font-bold text-neutral-800">Current Status: <span className="uppercase text-emerald-700 font-black">{selectedDispute.status}</span></span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('investigating')}
                  className="rounded-lg bg-purple-50 px-3 py-1.5 font-bold text-purple-700 border border-purple-200 hover:bg-purple-100"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => {
                    const res = prompt('Enter resolution summary for complainant and merchant:');
                    if (res) handleUpdateStatus('resolved', res);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Resolve Case (Refund/Settle)
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected', 'Claim rejected by platform admin upon review.')}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Reject Claim
                </button>
              </div>
            </div>

            {/* Dispute Message Thread */}
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-600" /> Case Message Thread ({selectedDispute.messages.length})
              </h4>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200 p-3 space-y-3 bg-neutral-50/50">
                {selectedDispute.messages.length === 0 ? (
                  <p className="text-center text-neutral-400 py-4">No messages sent yet. Start arbitration chat below.</p>
                ) : (
                  selectedDispute.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl p-3 space-y-1 ${
                        m.senderRole === 'admin'
                          ? 'bg-neutral-900 text-white ml-6'
                          : 'bg-white border border-neutral-200 text-neutral-800 mr-6'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`font-bold ${m.senderRole === 'admin' ? 'text-emerald-400' : 'text-neutral-900'}`}>
                          {m.senderName} ({m.senderRole})
                        </span>
                        <span className="opacity-60">{formatDate(m.timestamp)}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{m.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type official admin response or instructions..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white hover:bg-neutral-800"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
