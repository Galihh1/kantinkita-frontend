import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CustomerLayout from '../components/layout/CustomerLayout';
import StaffLayout from '../components/layout/StaffLayout';
import OwnerLayout from '../components/layout/OwnerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// ── Auth ─────────────────────────────────────────────────
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const GoogleCallback = lazy(() => import('../pages/auth/GoogleCallback'));
const OtpVerification = lazy(() => import('../pages/auth/OtpVerification'));
const AccountSetup = lazy(() => import('../pages/auth/AccountSetup'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// ── Customer ─────────────────────────────────────────────
const Home = lazy(() => import('../pages/customer/Home'));
const TenantDetail = lazy(() => import('../pages/customer/TenantDetail'));
const Cart = lazy(() => import('../pages/customer/Cart'));
const Checkout = lazy(() => import('../pages/customer/Checkout'));
const OrderHistory = lazy(() => import('../pages/customer/OrderHistory'));
const Profile = lazy(() => import('../pages/customer/Profile'));

// ── Staff ─────────────────────────────────────────────────
const StaffDashboard = lazy(() => import('../pages/staff/Dashboard'));
const StaffMenuMgmt = lazy(() => import('../pages/staff/MenuManagement'));

// ── Owner ─────────────────────────────────────────────────
const OwnerDashboard = lazy(() => import('../pages/owner/Dashboard'));
const OwnerReport = lazy(() => import('../pages/owner/Report'));
const OwnerRefund = lazy(() => import('../pages/owner/Refund'));
const StaffManagement = lazy(() => import('../pages/owner/StaffManagement'));
const Subscription = lazy(() => import('../pages/owner/Subscription'));

// ── Admin ─────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const TenantManagement = lazy(() => import('../pages/admin/TenantManagement'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const PermissionManagement = lazy(() => import('../pages/admin/PermissionManagement'));
const RolePermissionManager = lazy(() => import('../pages/admin/RolePermissionManager'));
const DocumentTypeManagement = lazy(() => import('../pages/admin/DocumentTypeManagement'));
const SubscriptionManagement = lazy(() => import('../pages/admin/SubscriptionManagement'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const AuditLog = lazy(() => import('../pages/admin/AuditLog'));
const ErrorMonitoring = lazy(() => import('../pages/admin/ErrorMonitoring'));
const BackupRestore = lazy(() => import('../pages/admin/BackupRestore'));

// ── Utility ───────────────────────────────────────────────
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const NotFound = lazy(() => import('../pages/NotFound'));

const F = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);


export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<F><Login /></F>} />
      <Route path="/register" element={<F><Register /></F>} />
      <Route path="/auth/google/callback" element={<F><GoogleCallback /></F>} />
      <Route path="/auth/otp" element={<F><OtpVerification /></F>} />
      <Route path="/forgot-password" element={<F><ForgotPassword /></F>} />
      <Route path="/reset-password" element={<F><ResetPassword /></F>} />

      {/* Account Setup (Protected but no layout) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account-setup" element={<F><AccountSetup /></F>} />
      </Route>

      {/* Customer */}
      <Route element={<ProtectedRoute roles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<F><Home /></F>} />
          <Route path="/tenant/:id" element={<F><TenantDetail /></F>} />
          <Route path="/cart" element={<F><Cart /></F>} />
          <Route path="/checkout" element={<F><Checkout /></F>} />
          <Route path="/orders" element={<F><OrderHistory /></F>} />
          <Route path="/profile" element={<F><Profile /></F>} />
        </Route>
      </Route>

      {/* Staff */}
      <Route element={<ProtectedRoute roles={['staff']} />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<F><StaffDashboard /></F>} />
          <Route path="/staff/menus" element={<F><StaffMenuMgmt /></F>} />
        </Route>
      </Route>

      {/* Owner */}
      <Route element={<ProtectedRoute roles={['owner']} />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner" element={<F><OwnerDashboard /></F>} />
          <Route path="/owner/report" element={<F><OwnerReport /></F>} />
          <Route path="/owner/refund" element={<F><OwnerRefund /></F>} />
          <Route path="/owner/staff" element={<F><StaffManagement /></F>} />
          <Route path="/owner/subscription" element={<F><Subscription /></F>} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<F><AdminDashboard /></F>} />
          <Route path="/admin/tenants" element={<F><TenantManagement /></F>} />
          <Route path="/admin/users" element={<F><UserManagement /></F>} />
          <Route path="/admin/permissions" element={<F><PermissionManagement /></F>} />
          <Route path="/admin/roles/matrix" element={<F><RolePermissionManager /></F>} />
          <Route path="/admin/document-types" element={<F><DocumentTypeManagement /></F>} />
          <Route path="/admin/subscriptions" element={<F><SubscriptionManagement /></F>} />
          <Route path="/admin/settings" element={<F><Settings /></F>} />
          <Route path="/admin/audit" element={<F><AuditLog /></F>} />
          <Route path="/admin/errors" element={<F><ErrorMonitoring /></F>} />
          <Route path="/admin/backups" element={<F><BackupRestore /></F>} />
        </Route>
      </Route>

      {/* Utility */}
      <Route path="/unauthorized" element={<F><Unauthorized /></F>} />
      <Route path="*" element={<F><NotFound /></F>} />
    </Routes>
  );
}
