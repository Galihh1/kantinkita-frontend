import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  QrCodeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { orderApi } from '../../api/order';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_BADGE = {
  pending:    { variant: 'gray',    label: 'Menunggu Pembayaran' },
  paid:       { variant: 'info',    label: 'Sudah Bayar' },
  processing: { variant: 'orange',  label: 'Sedang Diproses' },
  completed:  { variant: 'success', label: 'Selesai' },
  cancelled:  { variant: 'error',   label: 'Dibatalkan' },
};

const PAYMENT_METHODS = [
  { value: 'cash',     label: 'Tunai',       icon: BanknotesIcon,  color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'qris',     label: 'QRIS',        icon: QrCodeIcon,     color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'transfer', label: 'Transfer',    icon: CreditCardIcon, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export default function StaffOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedMethod, setSelectedMethod]   = useState('cash');
  const [notes, setNotes]                      = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch order detail
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['staff-order-detail', id],
    queryFn: () => orderApi.getStaffOrderDetail(id).then(r => r.data.data),
    staleTime: 0,
  });

  // Confirm manual payment
  const confirmMutation = useMutation({
    mutationFn: () => orderApi.confirmStaffPayment(id, {
      payment_method: selectedMethod,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      toast.success('Pembayaran berhasil dikonfirmasi!');
      qc.invalidateQueries({ queryKey: ['staff-order-detail', id] });
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      setShowConfirmModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal konfirmasi pembayaran'),
  });

  // Update order status
  const statusMutation = useMutation({
    mutationFn: (status) => orderApi.updateStaffOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Status pesanan diperbarui');
      qc.invalidateQueries({ queryKey: ['staff-order-detail', id] });
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal memperbarui status'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError || !order) return (
    <div className="text-center py-20 text-gray-400">
      <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p className="font-semibold">Pesanan tidak ditemukan</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(-1)}>Kembali</Button>
    </div>
  );

  const badge   = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const payment = order.payment;

  // Apakah perlu konfirmasi pembayaran manual?
  const needsManualConfirm = ['pending', 'processing'].includes(order.status)
    && (!payment || payment.status !== 'paid');

  // Sudah bayar via Midtrans?
  const paidViaMidtrans = payment?.payment_method === 'midtrans' && payment?.status === 'paid';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-xs text-gray-500 font-mono">#{order.order_number}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={badge.variant} dot>{badge.label}</Badge>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Pelanggan</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center font-bold text-[#2D6A4F] text-sm">
            {(order.user?.full_name ?? 'P')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800">{order.user?.full_name ?? 'Pelanggan'}</p>
            <p className="text-xs text-gray-500">{order.user?.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Item Pesanan</h2>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 gap-4">
              <div className="flex items-center gap-3">
                {item.menu?.photo_url ? (
                  <img src={item.menu.photo_url} alt={item.menu_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">🍽️</div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.menu_name}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold text-gray-700 shrink-0">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-orange-700 bg-orange-50 rounded-xl px-3 py-2">
              <span className="font-bold">Catatan:</span> {order.notes}
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">Total</span>
          <span className="text-lg font-black text-[#2D6A4F]">{formatCurrency(order.grand_total ?? order.total_price)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Status Pembayaran</h2>

        {payment ? (
          <div className="flex items-center gap-3">
            {payment.status === 'paid' ? (
              <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <ClockIcon className="w-6 h-6 text-orange-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-gray-800 capitalize">
                {payment.payment_method?.toUpperCase()} — {payment.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
              </p>
              {payment.paid_at && (
                <p className="text-xs text-gray-400">{formatDate(payment.paid_at)}</p>
              )}
              {payment.notes && (
                <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-orange-600">
            <ClockIcon className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold">Belum ada data pembayaran</p>
          </div>
        )}
      </div>

      {/* Manual Payment Confirmation */}
      {needsManualConfirm && !paidViaMidtrans && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-black text-amber-800">Konfirmasi Pembayaran Manual</h2>
            <p className="text-xs text-amber-600 mt-1">
              Gunakan ini jika customer membayar langsung (tunai, QRIS, atau transfer bank) — bukan melalui Midtrans.
            </p>
          </div>

          {/* Payment method selector */}
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMethod(value)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-bold',
                  selectedMethod === value
                    ? color + ' shadow-md scale-105'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Optional notes */}
          <textarea
            placeholder="Catatan (opsional, misal: No. ref transfer)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full text-xs p-3 rounded-xl bg-white border border-amber-200 focus:ring-2 focus:ring-amber-300 outline-none resize-none placeholder-gray-300"
          />

          <Button
            variant="primary"
            fullWidth
            loading={confirmMutation.isPending}
            onClick={() => setShowConfirmModal(true)}
            className="bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200"
          >
            ✅ Konfirmasi Pembayaran {PAYMENT_METHODS.find(m => m.value === selectedMethod)?.label}
          </Button>
        </div>
      )}

      {/* Status actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Aksi Status</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          {order.status === 'paid' && (
            <Button
              variant="primary"
              fullWidth
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate('processing')}
            >
              🔄 Proses Pesanan
            </Button>
          )}
          {order.status === 'processing' && (
            <Button
              variant="secondary"
              fullWidth
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate('completed')}
            >
              ✅ Tandai Selesai
            </Button>
          )}
          {['paid', 'processing'].includes(order.status) && (
            <Button
              variant="outline"
              fullWidth
              loading={statusMutation.isPending}
              onClick={() => { if (confirm('Batalkan pesanan ini?')) statusMutation.mutate('cancelled'); }}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              ❌ Batalkan
            </Button>
          )}
          {['completed', 'cancelled'].includes(order.status) && (
            <p className="text-center text-sm text-gray-400 w-full py-2">Pesanan sudah final, tidak ada aksi tersedia.</p>
          )}
        </div>
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-black text-gray-900 text-lg">Konfirmasi Pembayaran?</h3>
            <p className="text-sm text-gray-500">
              Tandai pesanan <span className="font-bold text-gray-700">#{order.order_number}</span> sebagai lunas via{' '}
              <span className="font-bold text-amber-600 capitalize">{selectedMethod}</span>.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowConfirmModal(false)}>Batal</Button>
              <Button
                variant="primary"
                fullWidth
                loading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Ya, Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
