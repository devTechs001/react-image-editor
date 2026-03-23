// frontend/src/services/api/assetAPI.js
import apiClient from './apiClient';

export const assetAPI = {
  // Get all assets
  async getAll(params = {}) {
    const response = await apiClient.get('/assets', { params });
    return response.data.data;
  },

  // Get asset by ID
  async get(id) {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data.data;
  },

  // Upload asset
  async upload(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name || file.name);
    formData.append('type', metadata.type || 'image');
    formData.append('folder', metadata.folder || 'root');
    formData.append('tags', JSON.stringify(metadata.tags || []));

    const response = await apiClient.post('/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Update asset
  async update(id, data) {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data.data;
  },

  // Delete asset
  async delete(id) {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data.data;
  },

  // Batch delete assets
  async batchDelete(ids) {
    const response = await apiClient.post('/assets/batch-delete', { ids });
    return response.data.data;
  },

  // Move asset to folder
  async move(id, folder) {
    const response = await apiClient.post(`/assets/${id}/move`, { folder });
    return response.data.data;
  },

  // Rename asset
  async rename(id, name) {
    const response = await apiClient.post(`/assets/${id}/rename`, { name });
    return response.data.data;
  },

  // Copy asset
  async copy(id) {
    const response = await apiClient.post(`/assets/${id}/copy`);
    return response.data.data;
  },

  // Get asset folders
  async getFolders() {
    const response = await apiClient.get('/assets/folders');
    return response.data.data;
  },

  // Create folder
  async createFolder(name, parent = null) {
    const response = await apiClient.post('/assets/folder', { name, parent });
    return response.data.data;
  },

  // Delete folder
  async deleteFolder(id) {
    const response = await apiClient.delete(`/assets/folder/${id}`);
    return response.data.data;
  },

  // Search assets
  async search(query, filters = {}) {
    const response = await apiClient.get('/assets/search', {
      params: { q: query, ...filters }
    });
    return response.data.data;
  },

  // Get recent assets
  async getRecent(limit = 20) {
    const response = await apiClient.get('/assets/recent', {
      params: { limit }
    });
    return response.data.data;
  },

  // Get asset usage (which projects use it)
  async getUsage(id) {
    const response = await apiClient.get(`/assets/${id}/usage`);
    return response.data.data;
  },

  // Get asset metadata
  async getMetadata(id) {
    const response = await apiClient.get(`/assets/${id}/metadata`);
    return response.data.data;
  },

  // Generate asset thumbnail
  async generateThumbnail(id) {
    const response = await apiClient.post(`/assets/${id}/thumbnail`);
    return response.data.data;
  },

  // Get signed URL for asset
  async getSignedUrl(id, expires = 3600) {
    const response = await apiClient.get(`/assets/${id}/url`, {
      params: { expires }
    });
    return response.data.data;
  }
};

export default assetAPI;
