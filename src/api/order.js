import api from './axios';

export const orderApi = {
  // Customer
  checkout: (data) =>
    api.post('/customer/checkout', data),

  getOrders: (params = {}) =>
    api.get('/customer/orders', { params }),

  getOrderDetail: (id) =>
    api.get(`/customer/orders/${id}`),

  // Staff
  getStaffOrders: (params = {}) =>
    api.get('/staff/orders', { params }),

  updateOrderStatus: (id, status, notes = '') =>
    api.patch(`/orders/${id}/status`, { status, notes }),

  // Owner
  requestRefund: (id, reason) =>
    api.post(`/orders/${id}/refund`, { reason }),

  getOwnerOrders: (params = {}) =>
    api.get('/owner/orders', { params }),
};
