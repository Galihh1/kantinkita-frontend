import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOwnerSubscription } from '../../hooks/useOwnerSubscription';
import { syncMyRole } from '../../api/admin';
import toast from 'react-hot-toast';
import {
  CheckCircle, Clock, AlertTriangle, Loader2,
  RefreshCw, Star, ChevronRight,
} from 'lucide-react';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Aktif',
    dot: 'bg-emerald-500 animate-pulse',
  },
  trial: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Trial',
    dot: 'bg-amber-500 animate-pulse',
  },
  pending: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Menunggu',
    dot: 'bg-blue-500 animate-pulse',
  },
  expired: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Berakhir',
    dot: 'bg-red-500',
  },
};

// ── Sync Role Button ───────────────────────────────────────────────────────────
export function SyncRoleButton({ compact = false }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: syncMyRole,
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Akun berhasil disinkronkan. Silakan logout & login kembali.');
      qc.invalidateQueries({ queryKey: ['owner-subscription-status'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Gagal sinkronisasi. Coba lagi.'),
  });

  return (
    <button
      id="btn-sync-role"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      title="Sinkronkan Role — gunakan jika menu tidak muncul setelah admin menyetujui pendaftaran"
      className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors
        ${compact
          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          : 'text-[#2D6A4F] bg-[#2D6A4F]/5 hover:bg-[#2D6A4F]/10 border border-[#2D6A4F]/20'
        }`}
    >
      {mutation.isPending
        ? <Loader2 size={13} className="animate-spin flex-shrink-0" />
        : <RefreshCw size={13} className="flex-shrink-0" />
      }
      {compact ? 'Sinkronkan akun' : 'Sinkronkan Role Akun'}
    </button>
  );
}

// ── Subscription Status Widget (for Sidebar) ───────────────────────────────────
export default function SubscriptionStatusWidget() {
  const navigate = useNavigate();
  const { status, isLoading, isActive, trialActive, trialDays, subDaysLeft, plan, hasPending } = useOwnerSubscription();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-3 mb-3 px-3 py-2 bg-gray-50 rounded-xl flex items-center gap-2">
        <Loader2 size={13} className="animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Memuat status...</span>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;
  const Icon = cfg.icon;

  // Teks deskripsi kondisional
  const description = (() => {
    if (isActive)    return `${subDaysLeft} hari lagi${plan ? ` · ${plan.charAt(0).toUpperCase() + plan.slice(1)}` : ''}`;
    if (hasPending)  return 'Menunggu persetujuan admin';
    if (trialActive) return `${trialDays} hari trial tersisa`;
    return 'Langganan berakhir';
  })();

  return (
    <div className={`mx-3 mb-3 rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold uppercase tracking-widest ${cfg.color}`}>
            {cfg.label}
          </p>
          <p className="text-[10px] text-gray-500 truncate">{description}</p>
        </div>
        <Icon size={14} className={`flex-shrink-0 ${cfg.color}`} />
      </button>

      {/* Expand actions */}
      {!collapsed && (
        <div className="px-3 pb-2.5 border-t border-current/10 pt-2 space-y-1.5" style={{ borderColor: cfg.border.replace('border-', '') }}>
          <button
            onClick={() => navigate('/owner/subscription')}
            className={`flex items-center justify-between w-full text-[11px] font-medium ${cfg.color} hover:underline`}
          >
            <span className="flex items-center gap-1">
              <Star size={11} /> Kelola Langganan
            </span>
            <ChevronRight size={11} />
          </button>
          <SyncRoleButton compact />
        </div>
      )}
    </div>
  );
}
