import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getStatusLabel, getStatusColor } from '../../utils/orderStatus';
import { ArrowLeftIcon, ShoppingBagIcon, BuildingStorefrontIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const PAYMENT_LABEL = {
  midtrans:       'Pembayaran Online (Midtrans)',
  cash:           'Bayar Tunai di Kasir',
  qris:           'QRIS',
  bca:            'Transfer BCA',
  dana:           'DANA',
};

export default function OrderDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderApi.getOrderDetail(id).then((r) => r.data.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading) return <LoadingSpinner label="Memuat detail pesanan..." />;
  if (isError || !order) return (
    <div className="text-center py-16">
      <p className="text-gray-500 font-medium">Pesanan tidak ditemukan.</p>
      <button onClick={() => navigate('/orders')} className="mt-3 text-sm text-[#2D6A4F] font-semibold hover:underline">
        Kembali ke Riwayat
      </button>
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Back button */}
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2D6A4F] transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Kembali ke Riwayat
      </button>

      {/* Status Banner */}
      <div className={`rounded-2xl p-4 border ${
        order.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
        order.status === 'cancelled' ? 'bg-red-50 border-red-100' :
        order.status === 'paid'      ? 'bg-blue-50 border-blue-100' :
        'bg-amber-50 border-amber-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Status Pesanan</p>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">No. Pesanan</p>
            <p className="font-mono text-sm font-bold text-gray-700">#{order.order_number}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{formatDateTime(order.created_at)}</p>
      </div>

      {/* Tenant Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Kantin</h2>
        </div>
        <p className="text-sm font-medium text-gray-800">{order.tenant?.tenant_name ?? '—'}</p>
        {order.notes && (
          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-2">
            Catatan: {order.notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBagIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Item Pesanan</h2>
        </div>
        <div className="space-y-3">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.menu?.photo_url && (
                  <img src={item.menu.photo_url} alt={item.menu?.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.menu?.name ?? item.menu_id}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCardIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Rincian Pembayaran</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.service_fee) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Biaya Layanan</span>
              <span>{formatCurrency(order.service_fee)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-[#2D6A4F]">{formatCurrency(order.grand_total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-1">
            <span>Metode Bayar</span>
            <span>{PAYMENT_LABEL[order.payment_method] ?? order.payment_method ?? '—'}</span>
          </div>
          {order.payment?.transaction_id && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>ID Transaksi</span>
              <span className="font-mono">{order.payment.transaction_id}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
