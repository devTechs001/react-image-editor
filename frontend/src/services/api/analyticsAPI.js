// frontend/src/services/api/analyticsAPI.js
import apiClient from './apiClient';

export const analyticsAPI = {
  // Get dashboard analytics
  async getDashboard(timeRange = '7d') {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { timeRange }
    });
    return response.data.data;
  },

  // Get usage statistics
  async getUsage(period = 'current_month') {
    const response = await apiClient.get('/analytics/usage', {
      params: { period }
    });
    return response.data.data;
  },

  // Get project statistics
  async getProjectStats(projectId, timeRange = '30d') {
    const response = await apiClient.get(`/analytics/projects/${projectId}`, {
      params: { timeRange }
    });
    return response.data.data;
  },

  // Get export statistics
  async getExportStats(timeRange = '30d') {
    const response = await apiClient.get('/analytics/exports', {
      params: { timeRange }
    });
    return response.data.data;
  },

  // Get AI usage
  async getAIUsage(period = 'current_month') {
    const response = await apiClient.get('/analytics/ai-usage', {
      params: { period }
    });
    return response.data.data;
  },

  // Get storage breakdown
  async getStorageBreakdown() {
    const response = await apiClient.get('/analytics/storage');
    return response.data.data;
  },

  // Get activity timeline
  async getActivity(limit = 50) {
    const response = await apiClient.get('/analytics/activity', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get performance metrics
  async getPerformance(metrics = ['views', 'downloads', 'shares']) {
    const response = await apiClient.get('/analytics/performance', {
      params: { metrics }
    });
    return response.data.data;
  },

  // Get trending templates
  async getTrendingTemplates(limit = 10) {
    const response = await apiClient.get('/analytics/trending-templates', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get user insights
  async getUserInsights() {
    const response = await apiClient.get('/analytics/insights');
    return response.data.data;
  }
};

export default analyticsAPI;
