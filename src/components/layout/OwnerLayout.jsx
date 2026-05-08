import React from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowUturnLeftIcon,
  UsersIcon,
  StarIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { SidebarLayout } from './SidebarLayout';

const NAV_ITEMS = [
  { path: '/owner',              label: 'Dashboard',      icon: ChartBarIcon,              permission: 'read-laporan'  },
  { path: '/owner/orders',       label: 'Pesanan',        icon: ShoppingBagIcon,           permission: 'read-pesanan',  badgeKey: 'orders' },
  { path: '/owner/menus',        label: 'Menu',           icon: Squares2X2Icon,            permission: 'read-menu'     },
  { path: '/owner/report',       label: 'Laporan',        icon: DocumentChartBarIcon,      permission: 'read-laporan'  },
  { path: '/owner/refund',       label: 'Refund',         icon: ArrowUturnLeftIcon,        permission: 'read-pesanan'  },
  { path: '/owner/staff',        label: 'Staff',          icon: UsersIcon,                 permission: 'read-user'     },
  { path: '/owner/subscription', label: 'Subscription',   icon: StarIcon },
  { path: '/owner/settings',     label: 'Pengaturan Kantin', icon: Cog6ToothIcon },
];

export default function OwnerLayout() {
  return <SidebarLayout navItems={NAV_ITEMS} />;
}
