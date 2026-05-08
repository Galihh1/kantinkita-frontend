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

  getStaffOrderDetail: (id) =>
    api.get(`/staff/orders/${id}`),

  updateStaffOrderStatus: (id, status) =>
    api.put(`/staff/orders/${id}/status`, { status }),

  confirmStaffPayment: (id, data) =>
    api.post(`/staff/orders/${id}/confirm-payment`, data),

  // Owner
  requestRefund: (id, reason) =>
    api.post(`/orders/${id}/refund`, { reason }),

  getOwnerOrders: (params = {}) =>
    api.get('/owner/orders', { params }),
};
