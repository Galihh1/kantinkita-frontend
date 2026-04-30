import api from './axios';

export const tenantApi = {
  getTenants: (params = {}) =>
    api.get('/tenants', { params }),

  getTenantDetail: (id) =>
    api.get(`/tenants/${id}`),

  getTenantMenus: (id, params = {}) =>
    api.get(`/tenants/${id}/menus`, { params }),

  // Staff / Owner
  getMyTenant: () =>
    api.get('/tenant/me'),

  updateMyTenant: (data) => {
    return api.post('/tenant/me', data);
  },

  getMenus: (params = {}) =>
    api.get('/staff/menus', { params }),

  createMenu: (data) =>
    api.post('/staff/menus', data),

  updateMenu: (id, data) => {
    // Laravel bug: PUT/PATCH doesn't parse multipart/form-data. 
    // We use POST with _method spoofing if it's FormData.
    if (data instanceof FormData) {
      return api.post(`/staff/menus/${id}`, data);
    }
    return api.put(`/staff/menus/${id}`, data);
  },

  deleteMenu: (id) =>
    api.delete(`/staff/menus/${id}`),

  toggleMenuAvailability: (id) =>
    api.put(`/staff/menus/${id}/availability`),

  getCategories: () =>
    api.get('/staff/categories'),

  createCategory: (data) =>
    api.post('/staff/categories', data),

  updateCategory: (id, data) =>
    api.put(`/staff/categories/${id}`, data),

  deleteCategory: (id) =>
    api.delete(`/staff/categories/${id}`),

  // Admin
  adminGetTenants: (params = {}) =>
    api.get('/admin/tenants', { params }),

  adminToggleTenant: (id) =>
    api.patch(`/admin/tenants/${id}/toggle`),

  // Staff management
  getStaffList: () =>
    api.get('/owner/staff'),

  createStaff: (data) =>
    api.post('/owner/staff', data),

  updateStaff: (id, data) =>
    api.put(`/owner/staff/${id}`, data),

  removeStaff: (id) =>
    api.delete(`/owner/staff/${id}`),

  toggleStaff: (id) =>
    api.put(`/owner/staff/${id}/toggle`),

};
