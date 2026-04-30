import api from './axios';

export const authApi = {
  checkCompany: (company_code) =>
    api.post('/auth/check-company', { company_code }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  updateProfile: (data) => {
    return api.post('/auth/profile', data); // Use explicit POST for file uploads
  },

  changePassword: (data) =>
    api.put('/auth/password', data),

  verifyGoogleOtp: (data) => api.post('/auth/google/verify-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
