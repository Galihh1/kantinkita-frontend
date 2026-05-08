import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import ImpersonationBanner from '../shared/ImpersonationBanner';
import SubscriptionStatusWidget from '../shared/SubscriptionStatusWidget';
import { useOwnerSubscription } from '../../hooks/useOwnerSubscription';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

// ── Badge counts (polls every 30s) ────────────────────────────────────────────
function useBadgeCounts(navItems) {
  const { isRole } = useAuthStore();
  const isAdmin = isRole('admin');
  const isOwner = isRole('owner');
  const isStaff = isRole('staff');

  const needsOrders     = navItems.some((i) => i.badgeKey === 'orders');
  const needsPendingSub = navItems.some((i) => i.badgeKey === 'pending-subscriptions');
  const needsErrors     = navItems.some((i) => i.badgeKey === 'open-errors');

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ['badge-orders', isOwner ? 'owner' : 'staff'],
    queryFn: () =>
      api.get(isOwner ? '/owner/orders' : '/staff/orders', { params: { status: 'paid', per_page: 1 } })
        .then((r) => r.data.data?.total ?? r.data.data?.meta?.total ?? 0)
        .catch(() => 0),
    enabled: needsOrders && (isOwner || isStaff),
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: false,
  });

  const { data: pendingSubCount = 0 } = useQuery({
    queryKey: ['badge-pending-subs'],
    queryFn: () =>
      api.get('/admin/subscriptions', { params: { approval_status: 'pending', per_page: 1 } })
        .then((r) => r.data.data?.total ?? r.data.data?.meta?.total ?? 0)
        .catch(() => 0),
    enabled: needsPendingSub && isAdmin,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: false,
  });

  const { data: openErrorCount = 0 } = useQuery({
    queryKey: ['badge-open-errors'],
    queryFn: () =>
      api.get('/admin/error-logs', { params: { resolved_status: 'open', per_page: 1 } })
        .then((r) => r.data.data?.total ?? r.data.data?.meta?.total ?? 0)
        .catch(() => 0),
    enabled: needsErrors && isAdmin,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });

  return {
    'orders':                 ordersCount,
    'pending-subscriptions':  pendingSubCount,
    'open-errors':            openErrorCount,
  };
}


// ── Sidebar Component ──────────────────────────────────────────────────────────
function SidebarLayout({ navItems }) {
  const [open, setOpen] = useState(false);
  const { user, logout, can, isRole } = useAuthStore();
  const navigate = useNavigate();
  const isOwner = isRole('owner');
  const isStaff = isRole('staff');

  const { status: subStatus } = useOwnerSubscription();
  const badgeCounts = useBadgeCounts(navItems);

  // Close mobile sidebar on navigation
  useEffect(() => { setOpen(false); }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login', { replace: true });
    toast.success('Berhasil keluar');
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  // Show "no-permissions" warning for owners who haven't synced
  const missingPermissions = isOwner && filteredNavItems.length <= 1;

  const sidebar = (
    <aside className="flex flex-col w-60 bg-white border-r border-gray-100 h-full">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="font-bold text-[#2D6A4F] text-sm">KantinKita</p>
            <p className="text-[10px] text-gray-400 capitalize flex items-center gap-1">
              {user?.role?.name || user?.role}
              {/* Subscription status dot for owner */}
              {isOwner && (
                <span className={clsx(
                  'w-1.5 h-1.5 rounded-full inline-block',
                  subStatus === 'active'  ? 'bg-emerald-500'
                  : subStatus === 'trial' ? 'bg-amber-500'
                  : subStatus === 'pending' ? 'bg-blue-500'
                  : 'bg-red-500'
                )} />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Missing permissions warning */}
      {missingPermissions && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-semibold text-amber-800 mb-1">⚠️ Menu tidak lengkap</p>
          <p className="text-[10px] text-amber-600">
            Klik "Sinkronkan Role" di bawah setelah admin menyetujui pendaftaran Anda.
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(({ path, label, icon: Icon, badgeKey }) => (
            <NavLink
              key={path}
              to={path}
              end={path.split('/').length <= 2}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#f0fdf4] text-[#2D6A4F]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badgeKey && badgeCounts[badgeKey] > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {badgeCounts[badgeKey] > 99 ? '99+' : badgeCounts[badgeKey]}
                </span>
              )}
            </NavLink>
        ))}
      </nav>

      {/* Subscription Status Widget (owner only) */}
      {isOwner && <SubscriptionStatusWidget />}

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {user?.photo_url ? (
               <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
               user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          id="btn-sidebar-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0">{sidebar}</div>

        {/* Mobile Sidebar Overlay */}
        {open && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative z-50 flex w-60">{sidebar}</div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 flex-shrink-0">
            <button
              id="btn-mobile-menu"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setOpen(true)}
            >
              <Bars3Icon className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1" />

            {/* Subscription expiry warning in topbar (only when <= 7 days left) */}
            {isOwner && subStatus === 'active' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Langganan aktif
              </div>
            )}
            {isOwner && subStatus === 'expired' && (
              <button
                onClick={() => navigate('/owner/subscription')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Langganan berakhir — Perpanjang
              </button>
            )}
            {isOwner && subStatus === 'trial' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Mode Trial
              </div>
            )}

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.full_name}
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export { SidebarLayout };
