// frontend/src/services/api/authAPI.js
import apiClient from './apiClient';

export const authAPI = {
  // Register new user
  async register(name, email, password) {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password
    });
    return response.data.data;
  },

  // Login
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    return response.data.data;
  },

  // Logout
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  // Update profile
  async updateProfile(data) {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.data.user;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data.data;
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data.data;
  },

  // Reset password
  async resetPassword(token, password) {
    const response = await apiClient.post(`/auth/reset-password/${token}`, {
      password
    });
    return response.data.data;
  },

  // Verify email
  async verifyEmail(token) {
    const response = await apiClient.post(`/auth/verify-email/${token}`);
    return response.data.data;
  },

  // Resend verification email
  async resendVerification() {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data.data;
  },

  // Refresh token
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },

  // Google OAuth
  googleLoginUrl() {
    return `${apiClient.defaults.baseURL}/auth/google`;
  }
};

export default authAPI;
