import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getStatusLabel, getStatusColor, OWNER_FILTER_TABS } from '../../utils/orderStatus';

const TABS = [
  { value: '',              label: 'Semua'         },
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'paid',          label: 'Dibayar'       },
  { value: 'processing',   label: 'Diproses'       },
  { value: 'completed',    label: 'Selesai'        },
  { value: 'cancelled',    label: 'Dibatalkan'     },
  { value: 'refunded',     label: 'Dikembalikan'   },
];

export default function OwnerOrders() {
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['owner-orders', { status, page }],
    queryFn: () => orderApi.getOwnerOrders({ status: status || undefined, page }).then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const orders = data?.data?.data ?? [];
  const meta   = data?.data   ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Semua Pesanan</h1>
        <p className="text-sm text-gray-500">Monitor seluruh pesanan masuk ke kantin Anda secara real-time</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              status === t.value
                ? 'bg-[#2D6A4F] text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2D6A4F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No. Order', 'Customer', 'Item', 'Total', 'Status', 'Waktu'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8"><SkeletonList count={5} /></td></tr>
              ) : isError ? (
                <tr><td colSpan={6}>
                  <EmptyState title="Gagal memuat pesanan" description="Periksa koneksi Anda atau coba lagi nanti." />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState title="Tidak ada pesanan" description="Belum ada pesanan yang masuk pada filter ini." />
                </td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.user?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{order.user?.phone ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {order.items?.length ?? 0} item
                    {order.items?.[0] && (
                      <span className="block text-gray-400 truncate max-w-[140px]">
                        {order.items[0].menu?.name}{order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                    {formatCurrency(order.grand_total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta.last_page > 1 && (
        <Pagination currentPage={page} totalPages={meta.last_page} onPageChange={setPage}
          totalItems={meta.total} perPage={meta.per_page} />
      )}
    </div>
  );
}
