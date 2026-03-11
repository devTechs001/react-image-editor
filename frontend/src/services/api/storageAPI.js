// frontend/src/services/api/storageAPI.js
import apiClient from './apiClient';

export const storageAPI = {
  // Get storage usage
  async getUsage() {
    const response = await apiClient.get('/storage/usage');
    return response.data.data;
  },

  // Upload file
  async upload(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (options.folder) formData.append('folder', options.folder);
    if (options.projectId) formData.append('projectId', options.projectId);
    if (options.public) formData.append('public', 'true');

    const response = await apiClient.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get file
  async get(id) {
    const response = await apiClient.get(`/storage/${id}`);
    return response.data.data;
  },

  // Get all files
  async getAll(params = {}) {
    const response = await apiClient.get('/storage', { params });
    return response.data.data;
  },

  // Update file metadata
  async update(id, data) {
    const response = await apiClient.put(`/storage/${id}`, data);
    return response.data.data;
  },

  // Delete file
  async delete(id) {
    const response = await apiClient.delete(`/storage/${id}`);
    return response.data.data;
  },

  // Batch delete
  async batchDelete(ids) {
    const response = await apiClient.post('/storage/batch-delete', { ids });
    return response.data.data;
  },

  // Create folder
  async createFolder(name, parent = null) {
    const response = await apiClient.post('/storage/folder', { name, parent });
    return response.data.data;
  },

  // Move file
  async move(id, folder) {
    const response = await apiClient.post(`/storage/${id}/move`, { folder });
    return response.data.data;
  },

  // Rename file
  async rename(id, name) {
    const response = await apiClient.post(`/storage/${id}/rename`, { name });
    return response.data.data;
  },

  // Copy file
  async copy(id, folder) {
    const response = await apiClient.post(`/storage/${id}/copy`, { folder });
    return response.data.data;
  },

  // Get signed URL
  async getSignedUrl(id, expires = 3600) {
    const response = await apiClient.get(`/storage/${id}/url`, {
      params: { expires }
    });
    return response.data.data;
  },

  // Search files
  async search(query, filters = {}) {
    const response = await apiClient.get('/storage/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  },

  // Get recent files
  async getRecent(limit = 20) {
    const response = await apiClient.get('/storage/recent', { params: { limit } });
    return response.data.data;
  }
};

export default storageAPI;
