import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Phone,
  User,
  ShoppingBag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Store,
  Send,
  MessageSquare,
  Tag,
  ArrowRight,
  Copy,
  Check,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  CustomerIssueCategory,
  ResellerIssueCategory,
  Order,
} from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { PhoneActionButtons } from '../common/PhoneActionButtons';
import { EmptyState } from '../common/EmptyState';

const CUSTOMER_CATEGORIES: CustomerIssueCategory[] = [
  'Wrong product received',
  'Product not delivered',
  'Damaged item',
  'Missing item',
  'Incorrect quantity',
  'Refund request',
  'Delivery problem',
  'Other',
];

export function SupportTicketsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'customer' | 'reseller'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket form state
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newRelatedOrderId, setNewRelatedOrderId] = useState('');
  const [newCategory, setNewCategory] = useState<CustomerIssueCategory>('Damaged item');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [newInitialNote, setNewInitialNote] = useState('');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Ticket Detail state
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const tickets = storage.getTickets();
  const allOrders = storage.getOrders();

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesType = selectedType === 'all' || t.ticketType === selectedType;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(query) ||
      (t.customerPhone && t.customerPhone.toLowerCase().includes(query)) ||
      (t.customerName && t.customerName.toLowerCase().includes(query)) ||
      (t.resellerName && t.resellerName.toLowerCase().includes(query)) ||
      (t.relatedOrderId && t.relatedOrderId.toLowerCase().includes(query)) ||
      t.category.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query);

    return matchesType && matchesStatus && matchesPriority && matchesSearch;
  });

  // Ticket stats
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const investigatingCount = tickets.filter((t) => t.status === 'Investigating').length;
  const waitingCount = tickets.filter((t) => t.status === 'Waiting for Business').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  // Auto-fill customer details if related order is selected during ticket creation
  const handleOrderIdChange = (orderId: string) => {
    setNewRelatedOrderId(orderId);
    if (orderId) {
      const matchedOrder = allOrders.find(
        (o) => o.id.toLowerCase() === orderId.trim().toLowerCase() || o.id.includes(orderId.trim())
      );
      if (matchedOrder) {
        if (!newCustomerPhone && matchedOrder.customerPhone) {
          setNewCustomerPhone(matchedOrder.customerPhone);
        }
        if (!newCustomerName && matchedOrder.customerName) {
          setNewCustomerName(matchedOrder.customerName);
        }
      }
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerPhone.trim()) {
      alert('Customer Phone Number is required.');
      return;
    }
    if (!newDescription.trim()) {
      alert('Short Description is required.');
      return;
    }

    const created = storage.createCustomerTicket({
      customerPhone: newCustomerPhone,
      customerName: newCustomerName,
      relatedOrderId: newRelatedOrderId,
      category: newCategory,
      description: newDescription,
      priority: newPriority,
      initialNote: newInitialNote,
    });

    setCreateSuccessMsg(`Ticket ${created.id} created successfully!`);
    setTimeout(() => {
      setCreateSuccessMsg('');
      setIsCreateModalOpen(false);
      // Reset form
      setNewCustomerPhone('');
      setNewCustomerName('');
      setNewRelatedOrderId('');
      setNewCategory('Damaged item');
      setNewDescription('');
      setNewPriority('medium');
      setNewInitialNote('');
    }, 1500);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newNoteText.trim()) return;

    const updated = storage.addTicketNote(
      selectedTicket.id,
      'Platform Admin',
      'admin',
      newNoteText.trim()
    );

    if (updated) {
      setSelectedTicket(updated);
      setNewNoteText('');
    }
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    const updated = storage.updateTicketStatus(ticketId, status);
    if (updated && selectedTicket?.id === ticketId) {
      setSelectedTicket(updated);
    }
  };

  const handlePriorityChange = (ticketId: string, priority: TicketPriority) => {
    const updated = storage.updateTicketStatus(ticketId, selectedTicket?.status || 'Open', priority);
    if (updated && selectedTicket?.id === ticketId) {
      setSelectedTicket(updated);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">Open</span>;
      case 'Investigating':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">Investigating</span>;
      case 'Waiting for Business':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">Waiting for Business</span>;
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

  // Order detail lookup helper for detail modal
  const matchedOrder = selectedTicket?.relatedOrderId
    ? allOrders.find((o) => o.id === selectedTicket.relatedOrderId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-black text-neutral-900">Support Ticket System (MVP)</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Lightweight internal ticket management for Admin. Record customer complaints via phone/WhatsApp and manage reseller platform issues.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span>New Customer Ticket</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        <button
          onClick={() => {
            setSelectedType('all');
            setSelectedStatus('all');
          }}
          className={`rounded-2xl border p-3.5 text-left transition-all ${
            selectedStatus === 'all' && selectedType === 'all'
              ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
              : 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Tickets</span>
          <p className="text-xl font-black mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => setSelectedStatus('Open')}
          className={`rounded-2xl border p-3.5 text-left transition-all ${
            selectedStatus === 'Open'
              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
              : 'border-blue-200 bg-blue-50/50 text-blue-900 hover:bg-blue-100/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Open</span>
          <p className="text-xl font-black mt-1">{openCount}</p>
        </button>

        <button
          onClick={() => setSelectedStatus('Investigating')}
          className={`rounded-2xl border p-3.5 text-left transition-all ${
            selectedStatus === 'Investigating'
              ? 'border-amber-600 bg-amber-600 text-white shadow-md'
              : 'border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Investigating</span>
          <p className="text-xl font-black mt-1">{investigatingCount}</p>
        </button>

        <button
          onClick={() => setSelectedStatus('Waiting for Business')}
          className={`rounded-2xl border p-3.5 text-left transition-all ${
            selectedStatus === 'Waiting for Business'
              ? 'border-purple-600 bg-purple-600 text-white shadow-md'
              : 'border-purple-200 bg-purple-50/50 text-purple-900 hover:bg-purple-100/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Waiting Business</span>
          <p className="text-xl font-black mt-1">{waitingCount}</p>
        </button>

        <button
          onClick={() => setSelectedStatus('Resolved')}
          className={`rounded-2xl border p-3.5 text-left transition-all ${
            selectedStatus === 'Resolved' || selectedStatus === 'Closed'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
              : 'border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Resolved / Closed</span>
          <p className="text-xl font-black mt-1">{resolvedCount}</p>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
        {/* Ticket Type Segment */}
        <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1">
          <button
            onClick={() => setSelectedType('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedType === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setSelectedType('customer')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedType === 'customer' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Customer Issues ({tickets.filter((t) => t.ticketType === 'customer').length})
          </button>
          <button
            onClick={() => setSelectedType('reseller')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedType === 'reseller' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Reseller Issues ({tickets.filter((t) => t.ticketType === 'reseller').length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search ID, Phone, Order, Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-neutral-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Waiting for Business">Waiting for Business</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-neutral-800 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No Support Tickets Found"
          description="No tickets match your active type, status filters, or search term."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Customer Phone / Contact</th>
                  <th className="py-3 px-4">Issue Category</th>
                  <th className="py-3 px-4">Related Order</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-neutral-900">{ticket.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.ticketType === 'customer' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
                          Customer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                          Reseller
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.ticketType === 'customer' ? (
                        <div>
                          <PhoneActionButtons phone={ticket.customerPhone || ''} showNumber size="xs" />
                          {ticket.customerName && (
                            <p className="text-[10px] text-neutral-500 mt-0.5">{ticket.customerName}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-neutral-900">{ticket.resellerName}</p>
                          <p className="text-[10px] text-neutral-500">Reseller Account</p>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {ticket.category}
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.relatedOrderId ? (
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ticket.relatedOrderId}
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">{getPriorityBadge(ticket.priority)}</td>

                    <td className="py-3.5 px-4">{getStatusBadge(ticket.status)}</td>

                    <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                      {formatDate(ticket.updatedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-800 transition-all shadow-2xs"
                      >
                        <span>Manage Ticket</span>
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER TICKET MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Customer Support Ticket"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
            <strong>Admin Manual Entry:</strong> Record complaints received via phone, WhatsApp, or email. Customer phone number is required to identify the customer and look up orders.
          </div>

          {createSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {createSuccessMsg}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-neutral-900 mb-1">
                Customer Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 font-mono font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Customer Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">Related Order ID (Optional)</label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="e.g. ord_1001"
                value={newRelatedOrderId}
                onChange={(e) => handleOrderIdChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Tip: Enter an order ID to auto-fill customer phone/name if recorded.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-neutral-900 mb-1">Issue Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CustomerIssueCategory)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none"
              >
                {CUSTOMER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-bold text-neutral-900 focus:bg-white focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">
              Short Description / Complaint <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Customer states package arrived with crushed outer box and cracked cushion..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-900 mb-1">Initial Internal Admin Note (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Contacted Apex Audio supplier lead via WhatsApp. Waiting for warehouse investigation..."
              value={newInitialNote}
              onChange={(e) => setNewInitialNote(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-md"
            >
              Create Support Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* MANAGE TICKET DETAIL MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Support Ticket ${selectedTicket?.id}`}
        maxWidth="2xl"
      >
        {selectedTicket && (
          <div className="space-y-6 text-xs text-neutral-800">
            {/* Header Summary Box */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-neutral-900">{selectedTicket.id}</span>
                  {selectedTicket.ticketType === 'customer' ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                      Customer Issue
                    </span>
                  ) : (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                      Reseller Ticket
                    </span>
                  )}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <p className="text-xs font-bold text-neutral-900">{selectedTicket.category}</p>
                <p className="text-[11px] text-neutral-500">Created: {formatDate(selectedTicket.createdAt)}</p>
              </div>

              {/* Status & Priority Controls */}
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Ticket Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                    className="rounded-xl border border-neutral-300 bg-white p-2 font-bold text-xs text-neutral-900 shadow-2xs focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Waiting for Business">Waiting for Business</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value as TicketPriority)}
                    className="rounded-xl border border-neutral-300 bg-white p-2 font-bold text-xs text-neutral-900 shadow-2xs focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact & Primary Identifier Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2">
                <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 border-b pb-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Primary Contact Info
                </h3>

                {selectedTicket.ticketType === 'customer' ? (
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-1">Customer Phone Number:</span>
                      <PhoneActionButtons phone={selectedTicket.customerPhone || ''} showNumber size="sm" />
                    </div>

                    {selectedTicket.customerName && (
                      <div>
                        <span className="text-[10px] text-neutral-500">Customer Name:</span>
                        <p className="font-bold text-neutral-900">{selectedTicket.customerName}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-neutral-500">Reseller Name:</span>
                      <p className="font-bold text-neutral-900">{selectedTicket.resellerName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Order Info */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2">
                <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 border-b pb-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  Related Order Record
                </h3>

                {selectedTicket.relatedOrderId ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700">{selectedTicket.relatedOrderId}</span>
                      {matchedOrder && (
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-800">
                          Status: {matchedOrder.status}
                        </span>
                      )}
                    </div>

                    {matchedOrder ? (
                      <div className="text-[11px] text-neutral-600 space-y-1 bg-neutral-50 p-2 rounded-xl">
                        <p>Total: <strong>{formatCurrency(matchedOrder.totalAmount)}</strong></p>
                        <p>Address: {matchedOrder.shippingAddress.street}, {matchedOrder.shippingAddress.city}</p>
                        <p>Items: {matchedOrder.items.map((i) => i.productTitle).join(', ')}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500">Order ID linked manually by admin.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 py-2">No specific order linked to this ticket.</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-1.5">
              <h3 className="font-bold text-neutral-900 border-b pb-2">Complaint / Description</h3>
              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Admin Workflow & External Communication Actions */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-600" />
                External Communication & Investigation Workflow
              </h3>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                As per MVP workflow, manage communication with customer and business owner externally via phone, WhatsApp, or email. Record all findings in internal notes below.
              </p>
            </div>

            {/* Internal Notes Section */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-4">
              <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 border-b pb-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Internal Admin Notes ({selectedTicket.notes.length})
              </h3>

              {selectedTicket.notes.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No internal notes added yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {selectedTicket.notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-neutral-900">
                          {note.authorName} ({note.authorRole})
                        </span>
                        <span className="text-neutral-400">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-[11px] font-bold text-neutral-800">Add Internal Investigation Note</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Record call summary, business owner response, tracking updates..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Save Internal Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
