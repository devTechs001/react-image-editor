// frontend/src/services/api/templatesAPI.js
import apiClient from './apiClient';

export const templatesAPI = {
  // Get all templates
  async getAll(params = {}) {
    const response = await apiClient.get('/templates', { params });
    return response.data.data;
  },

  // Get template by ID
  async get(id) {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data.data;
  },

  // Search templates
  async search(query, filters = {}) {
    const response = await apiClient.get('/templates/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  },

  // Get featured templates
  async getFeatured(limit = 10) {
    const response = await apiClient.get('/templates/featured', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get trending templates
  async getTrending(limit = 10) {
    const response = await apiClient.get('/templates/trending', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get templates by category
  async getByCategory(category, page = 1, limit = 20) {
    const response = await apiClient.get(`/templates/category/${category}`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  // Get templates by platform
  async getByPlatform(platform, page = 1, limit = 20) {
    const response = await apiClient.get(`/templates/platform/${platform}`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  // Get user's favorite templates
  async getFavorites() {
    const response = await apiClient.get('/templates/favorites');
    return response.data.data;
  },

  // Add template to favorites
  async addToFavorites(id) {
    const response = await apiClient.post(`/templates/${id}/favorite`);
    return response.data.data;
  },

  // Remove template from favorites
  async removeFromFavorites(id) {
    const response = await apiClient.delete(`/templates/${id}/favorite`);
    return response.data.data;
  },

  // Use template (creates project from template)
  async use(id, projectName) {
    const response = await apiClient.post(`/templates/${id}/use`, { projectName });
    return response.data.data;
  },

  // Get template categories
  async getCategories() {
    const response = await apiClient.get('/templates/categories');
    return response.data.data;
  },

  // Get template platforms
  async getPlatforms() {
    const response = await apiClient.get('/templates/platforms');
    return response.data.data;
  },

  // Submit user template
  async submit(data) {
    const response = await apiClient.post('/templates/submit', data);
    return response.data.data;
  }
};

export default templatesAPI;
