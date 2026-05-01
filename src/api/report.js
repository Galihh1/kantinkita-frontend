import api from './axios';

export const reportApi = {
  getSalesReport: (params = {}) =>
    api.get('/owner/reports', { params }),

  getAggregateReport: (params = {}) =>
    api.get('/owner/reports/aggregate', { params }),

  exportPdf: (params = {}) =>
    api.get('/owner/reports/export/pdf', {
      params,
      responseType: 'blob',
    }),

  exportCsv: (params = {}) =>
    api.get('/owner/reports/export/csv', {
      params,
      responseType: 'blob',
    }),

  // Admin
  getAdminStats: () =>
    api.get('/admin/stats'),

  getAdminReport: (params = {}) =>
    api.get('/admin/reports', { params }),

  // Settings
  getSettings: () =>
    api.get('/admin/settings'),

  updateSettings: (settingsObj) => {
    // Transform flat object {key: val} to array [{key: k, value: v}]
    const settings = Object.entries(settingsObj).map(([key, value]) => ({ key, value }));
    return api.put('/admin/settings', { settings });
  },

  // Users (admin)
  getUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  toggleUser: (id) =>
    api.patch(`/admin/users/${id}/toggle`),

  createUser: (data) =>
    api.post('/admin/users', data),

  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  impersonateUser: (id) =>
    api.post(`/admin/users/${id}/impersonate`),


  // Audit logs
  getAuditLogs: (params = {}) =>
    api.get('/admin/audit-logs', { params }),

  // Error logs
  getErrorLogs: (params = {}) =>
    api.get('/admin/error-logs', { params }),

  resolveError: (id) =>
    api.patch(`/admin/error-logs/${id}/resolve`),

  // Backups
  getBackups: () =>
    api.get('/admin/backups'),

  createBackup: () =>
    api.post('/admin/backups'),

  downloadBackup: (filename) =>
    api.get(`/admin/backups/${filename}/download`, { responseType: 'blob' }),

  deleteBackup: (filename) =>
    api.delete(`/admin/backups/${filename}`),

  // Subscriptions
  getSubscription: () =>
    api.get('/owner/subscription'),

  getSubscriptionPlans: () =>
    api.get('/owner/subscription/plans'),

  subscribe: (data) =>
    api.post('/owner/subscription/subscribe', data),
};
