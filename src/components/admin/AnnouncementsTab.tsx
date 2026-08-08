import React, { useState } from 'react';
import { Megaphone, Send, Users, Building2, Store, Plus } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Announcement } from '../../types';
import { formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storage.getAnnouncements());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('all');

  const handleBroadcast = () => {
    if (!title.trim() || !message.trim()) return;
    storage.createAnnouncement(title.trim(), message.trim(), targetAudience);
    setTitle('');
    setMessage('');
    setIsModalOpen(false);
    setAnnouncements(storage.getAnnouncements());
    alert('Announcement broadcasted & dispatched to targeted users!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform System Announcements</h2>
          <p className="text-xs text-neutral-500">
            Broadcast urgent policy updates, payout schedule maintenance alerts, or platform news to all sellers or resellers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Broadcast Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((anc) => (
          <div key={anc.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-neutral-900 text-sm">{anc.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    anc.targetAudience === 'all'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : anc.targetAudience === 'businesses'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  Target: {anc.targetAudience}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">{formatDate(anc.createdAt)}</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed pl-6">{anc.message}</p>

            <div className="pl-6 pt-1 text-[10px] text-neutral-400">
              Dispatched by: <span className="font-bold text-neutral-700">{anc.createdBy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast Platform Announcement">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as Announcement['targetAudience'])}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white font-semibold text-neutral-700"
              >
                <option value="all">📢 All Registered Users (Brand Owners & Resellers)</option>
                <option value="businesses">🏢 Brand Owners / Product Suppliers Only</option>
                <option value="resellers">🏪 Reseller Storefront Operators Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Announcement Headline</label>
              <input
                type="text"
                placeholder="e.g. Scheduled Maintenance & Payout Policy Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Announcement Message Body</label>
              <textarea
                placeholder="Provide clear details regarding policy, payout timeline, or system upgrades..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                <Send className="h-3.5 w-3.5 text-emerald-400" /> Dispatch Announcement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
