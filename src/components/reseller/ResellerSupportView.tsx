import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Send,
  HelpCircle,
  MessageSquare,
  Search,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import {
  SupportTicket,
  ResellerIssueCategory,
  TicketPriority,
  TicketStatus,
} from '../../types';
import { formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';

const RESELLER_CATEGORIES: ResellerIssueCategory[] = [
  'Commission issue',
  'Payout issue',
  'Technical problem',
  'Storefront issue',
  'Product catalog issue',
  'Other',
];

interface ResellerSupportViewProps {
  onNavigate?: (path: string) => void;
}

export function ResellerSupportView({ onNavigate }: ResellerSupportViewProps) {
  const currentUser = storage.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  // New ticket state
  const [newCategory, setNewCategory] = useState<ResellerIssueCategory>('Commission issue');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const resellerTickets = storage.getTicketsByReseller(currentUser.id);

  const filteredTickets = resellerTickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const created = storage.createResellerTicket({
      resellerId: currentUser.id,
      resellerName: currentUser.name || 'Reseller Partner',
      category: newCategory,
      description: newDescription,
      priority: newPriority,
    });

    setSubmitSuccess(`Ticket ${created.id} submitted to platform support!`);
    setTimeout(() => {
      setSubmitSuccess('');
      setIsSubmitModalOpen(false);
      setNewDescription('');
      setNewCategory('Commission issue');
      setNewPriority('medium');
    }, 1500);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">Open</span>;
      case 'Investigating':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">Investigating</span>;
      case 'Waiting for Business':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">In Review</span>;
      case 'Resolved':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Resolved</span>;
      case 'Closed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-0.5 text-[10px] font-bold text-neutral-700">Closed</span>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase text-rose-800">Urgent</span>;
      case 'high':
        return <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-800">High</span>;
      case 'medium':
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">Medium</span>;
      case 'low':
        return <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-600">Low</span>;
    }
  };

  const ticketColumns: Column<SupportTicket>[] = [
    {
      key: 'id',
      header: 'Ticket ID',
      priority: 'primary',
      cell: (t) => <span className="font-mono font-black text-neutral-900">{t.id}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      priority: 'secondary',
      cell: (t) => <span className="font-bold text-neutral-900">{t.category}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      priority: 'secondary',
      cell: (t) => <span className="text-neutral-600 truncate max-w-xs block">{t.description}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      priority: 'secondary',
      cell: (t) => getPriorityBadge(t.priority),
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'secondary',
      cell: (t) => getStatusBadge(t.status),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      priority: 'secondary',
      cell: (t) => <span className="text-[11px] text-neutral-500">{formatDate(t.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      priority: 'optional',
      align: 'right',
      cell: (t) => (
        <button
          onClick={() => setSelectedTicket(t)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold text-neutral-900 hover:bg-neutral-50 shadow-2xs"
        >
          View Status
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-black text-neutral-900">Creator Platform Support</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Submit issues directly to platform support regarding commissions, payouts, storefront configuration, or technical questions.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span>Submit Support Ticket</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Notice regarding Customer Complaints:</p>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Creators do not handle customer order complaints directly. Customers contact platform admin support directly if an issue arises with an order (damaged items, wrong item, delivery problems). Use this form solely for platform-related issues with your creator account.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
          />
        </div>

        <span className="text-xs font-bold text-neutral-500">
          Total Submitted: {resellerTickets.length}
        </span>
      </div>

      {/* Ticket List */}
      <ResponsiveDataTable
        data={filteredTickets}
        columns={ticketColumns}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        emptyTitle="No Support Tickets Found"
        emptyDescription="You haven't submitted any support tickets yet or none match your search."
      />

      {/* SUBMIT TICKET MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Reseller Support Ticket"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          {submitSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {submitSuccess}
            </div>
          )}

          <div>
            <label className="block font-bold text-neutral-900 mb-1">Platform Issue Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ResellerIssueCategory)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none"
            >
              {RESELLER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none"
            >
              <option value="low">Low - General Question</option>
              <option value="medium">Medium - Standard Request</option>
              <option value="high">High - Storefront Impact</option>
              <option value="urgent">Urgent - Payment / Account Issue</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">
              Issue Description / Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide specific details, order references, or error messages..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* TICKET DETAIL VIEW MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket Status: ${selectedTicket?.id}`}
        maxWidth="md"
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs text-neutral-800">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono font-black text-sm text-neutral-900">{selectedTicket.id}</span>
                <p className="font-bold text-neutral-800 mt-0.5">{selectedTicket.category}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Your Details</span>
              <p className="p-3 rounded-xl bg-neutral-50 text-neutral-800 leading-relaxed mt-1">
                {selectedTicket.description}
              </p>
            </div>

            <div className="text-[11px] text-neutral-500 space-y-1">
              <p>Submitted: {formatDate(selectedTicket.createdAt)}</p>
              <p>Last Update: {formatDate(selectedTicket.updatedAt)}</p>
            </div>

            {selectedTicket.notes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <span className="font-bold text-neutral-900">Platform Admin Response Notes</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTicket.notes.map((note) => (
                    <div key={note.id} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-[11px]">
                      <div className="flex justify-between font-bold text-emerald-900 mb-1">
                        <span>{note.authorName}</span>
                        <span className="text-[10px] text-emerald-700">{formatDate(note.createdAt)}</span>
                      </div>
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
