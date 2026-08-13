import React from 'react';
import { Modal } from '../common/Modal';
import { PhoneActionButtons } from '../common/PhoneActionButtons';
import { Order, OrderTimelineEvent } from '../../types';
import { storage } from '../../lib/storage';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckCircle2, Clock, Truck, Package, DollarSign, Bell, ShieldCheck, MapPin } from 'lucide-react';

interface OrderTimelineModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderTimelineModal({ order, onClose }: OrderTimelineModalProps) {
  if (!order) return null;

  const timeline = storage.getOrderTimeline(order.id);
  const storefront = storage.getStorefronts().find((sf) => sf.id === order.storefrontId);
  const business = storage.getBusinesses().find((b) => b.id === order.items[0]?.businessId);

  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Order Chronological Timeline: #${order.id}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Order Meta Header */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-neutral-900">Buyer: {order.customerName}</p>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                <span>{order.customerEmail}</span>
                <span>•</span>
                <PhoneActionButtons phone={order.customerPhone} showNumber size="xs" />
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                {order.status}
              </span>
              <p className="text-xs font-black text-neutral-900 mt-1">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 pt-2 text-[11px]">
            <div>
              <span className="text-neutral-400">Reseller Store:</span>{' '}
              <span className="font-bold text-neutral-800">{storefront?.storeName || order.storefrontName}</span>
            </div>
            <div>
              <span className="text-neutral-400">Supplier Brand:</span>{' '}
              <span className="font-bold text-neutral-800">{business?.businessName || 'Multiple Suppliers'}</span>
            </div>
          </div>
        </div>

        {/* Chronological Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {timeline.map((event, idx) => {
            const isLast = idx === timeline.length - 1;
            return (
              <div key={event.id} className="relative group">
                {/* Timeline Dot Icon */}
                <div
                  className={`absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
                    event.stage === 'delivered' || event.stage === 'payout'
                      ? 'border-emerald-600 text-emerald-600'
                      : event.stage === 'shipped'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-neutral-900 text-neutral-900'
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{event.title}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 pt-1">
                    <span>Actor:</span>
                    <span className="text-neutral-700 font-bold">{event.actor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
