import api from './axios';

export const cartApi = {
  getCart: () =>
    api.get('/cart'),

  addItem: (menuId, quantity) =>
    api.post('/cart', { menu_id: menuId, quantity }),

  updateItem: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity }),

  removeItem: (cartItemId) =>
    api.delete(`/cart/${cartItemId}`),

  clearCart: () =>
    api.delete('/cart'),
};
