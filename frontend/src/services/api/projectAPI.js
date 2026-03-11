// frontend/src/services/api/projectAPI.js
import apiClient from './apiClient';

export const projectAPI = {
  // Create project
  async create(projectData) {
    const response = await apiClient.post('/projects', projectData);
    return response.data.data;
  },

  // Get all projects
  async getAll(params = {}) {
    const response = await apiClient.get('/projects', { params });
    return response.data.data;
  },

  // Get project by ID
  async getById(id) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  // Update project
  async update(id, data) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  // Delete project
  async delete(id) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data.data;
  },

  // Duplicate project
  async duplicate(id) {
    const response = await apiClient.post(`/projects/${id}/duplicate`);
    return response.data.data;
  },

  // Export project
  async export(id, options) {
    const response = await apiClient.post(`/projects/${id}/export`, options);
    return response.data.data;
  },

  // Get project thumbnail
  async getThumbnail(id) {
    const response = await apiClient.get(`/projects/${id}/thumbnail`);
    return response.data.data;
  },

  // Update project layers
  async updateLayers(id, layers) {
    const response = await apiClient.put(`/projects/${id}/layers`, { layers });
    return response.data.data;
  },

  // Add to history
  async addToHistory(id, action, data) {
    const response = await apiClient.post(`/projects/${id}/history`, {
      action,
      data
    });
    return response.data.data;
  },

  // Search projects
  async search(query, filters = {}) {
    const response = await apiClient.get('/projects/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  },

  // Get recent projects
  async getRecent(limit = 10) {
    const response = await apiClient.get('/projects/recent', { params: { limit } });
    return response.data.data;
  }
};

export default projectAPI;
