import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/report';
import { useAuthStore } from '../store/authStore';

/**
 * Hook untuk mengambil status langganan Owner secara real-time.
 * Hanya aktif jika user adalah Owner.
 * Poll setiap 60 detik untuk deteksi perubahan status oleh Admin.
 */
export function useOwnerSubscription() {
  const { isRole } = useAuthStore();
  const isOwner = isRole('owner');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['owner-subscription-status'],
    queryFn: () => reportApi.getSubscription().then((r) => r.data.data),
    enabled: isOwner,
    refetchInterval: 60_000,       // poll tiap 1 menit
    staleTime: 30_000,
    retry: false,
  });

  const isActive      = data?.is_active ?? false;
  const trialActive   = data?.trial_active ?? false;
  const hasPending    = data?.subscription?.approval_status === 'pending';
  const trialDays     = Math.max(0, Math.ceil(data?.trial_days_remaining ?? 0));
  const subDaysLeft   = Math.max(0, Math.ceil(data?.days_remaining ?? 0));
  const plan          = data?.subscription?.plan ?? null;
  const billingEnd    = data?.subscription?.billing_end ?? null;

  // Hitung status ringkas untuk badge
  const status = (() => {
    if (isActive)    return 'active';
    if (hasPending)  return 'pending';
    if (trialActive) return 'trial';
    return 'expired';
  })();

  return {
    raw: data,
    isLoading,
    refetch,
    status,       // 'active' | 'pending' | 'trial' | 'expired'
    isActive,
    trialActive,
    hasPending,
    trialDays,
    subDaysLeft,
    plan,
    billingEnd,
  };
}
