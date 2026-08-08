import React, { useState } from 'react';
import { ShieldCheck, Search, Clock, UserCheck } from 'lucide-react';
import { storage } from '../../lib/storage';
import { formatDate } from '../../lib/utils';

export function AuditLogsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const logs = storage.getAuditLogs();

  const filtered = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform Governance Audit Trail</h2>
          <p className="text-xs text-neutral-500">
            Immutable, time-stamped ledger of operator administrative actions, policy enforcement, status changes, and payout executions.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter by action, admin, or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Timestamp & IP</th>
              <th className="py-3.5 px-4">Admin Operator</th>
              <th className="py-3.5 px-4">Action Executed</th>
              <th className="py-3.5 px-4">Target Entity</th>
              <th className="py-3.5 px-4">Log Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                  <span>{formatDate(log.timestamp)}</span>
                  <p className="text-[10px] text-neutral-400 font-normal">IP: {log.ipAddress || '127.0.0.1'}</p>
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-900">{log.adminName}</td>

                <td className="py-3.5 px-4">
                  <span className="rounded-lg bg-neutral-900 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                    {log.action}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-semibold text-neutral-800">
                  <span className="capitalize text-neutral-500 font-normal">{log.targetType}:</span> #{log.targetId}
                </td>

                <td className="py-3.5 px-4 text-neutral-600 max-w-sm leading-relaxed">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
