import api from './axios';

export const adminApi = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  impersonateUser: (id) => api.post(`/admin/users/${id}/impersonate`),

  // Roles
  getRoles: () => api.get('/admin/roles'),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  syncRolePermissions: (id, data) => api.post(`/admin/roles/${id}/sync`, data),

  // Permissions
  getPermissions: () => api.get('/admin/permissions'),
  createPermission: (data) => api.post('/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/permissions/${id}`),

  // Document Types
  getDocumentTypes: () => api.get('/admin/document-types'),
  createDocumentType: (data) => api.post('/admin/document-types', data),
  updateDocumentType: (id, data) => api.put(`/admin/document-types/${id}`, data),
  deleteDocumentType: (id) => api.delete(`/admin/document-types/${id}`),

  // Subscriptions
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getSubscriptionStats: () => api.get('/admin/subscriptions/stats'),
  approveSubscription: (id, data) => api.put(`/admin/subscriptions/${id}/approve`, data),
  rejectSubscription: (id, data) => api.put(`/admin/subscriptions/${id}/reject`, data),

  // Tenants
  getTenants: (params) => api.get('/admin/tenants', { params }),
  createTenant: (data) => api.post('/admin/tenants', data),
  updateTenant: (id, data) => api.put(`/admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/admin/tenants/${id}`),
  toggleTenant: (id) => api.patch(`/admin/tenants/${id}/toggle`),
};
