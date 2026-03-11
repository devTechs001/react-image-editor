// frontend/src/services/api/imageAPI.js
import apiClient from './apiClient';

export const imageAPI = {
  // Upload image
  async upload(file, options = {}) {
    const formData = new FormData();
    formData.append('image', file);
    if (options.projectId) formData.append('projectId', options.projectId);
    if (options.folder) formData.append('folder', options.folder);

    const response = await apiClient.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get image
  async get(id) {
    const response = await apiClient.get(`/images/${id}`);
    return response.data.data;
  },

  // Get all images
  async getAll(params = {}) {
    const response = await apiClient.get('/images', { params });
    return response.data.data;
  },

  // Update image
  async update(id, data) {
    const response = await apiClient.put(`/images/${id}`, data);
    return response.data.data;
  },

  // Delete image
  async delete(id) {
    const response = await apiClient.delete(`/images/${id}`);
    return response.data.data;
  },

  // Resize image
  async resize(id, options) {
    const response = await apiClient.post(`/images/${id}/resize`, options);
    return response.data.data;
  },

  // Crop image
  async crop(id, options) {
    const response = await apiClient.post(`/images/${id}/crop`, options);
    return response.data.data;
  },

  // Apply filter
  async applyFilter(id, filter, options = {}) {
    const response = await apiClient.post(`/images/${id}/filter`, {
      filter,
      ...options
    });
    return response.data.data;
  },

  // Apply adjustments
  async applyAdjustments(id, adjustments) {
    const response = await apiClient.post(`/images/${id}/adjust`, adjustments);
    return response.data.data;
  },

  // Convert format
  async convert(id, format, options = {}) {
    const response = await apiClient.post(`/images/${id}/convert`, {
      format,
      ...options
    });
    return response.data.data;
  },

  // Compress image
  async compress(id, quality = 80) {
    const response = await apiClient.post(`/images/${id}/compress`, { quality });
    return response.data.data;
  },

  // Generate thumbnail
  async generateThumbnail(id, width = 300, height = 300) {
    const response = await apiClient.post(`/images/${id}/thumbnail`, {
      width,
      height
    });
    return response.data.data;
  },

  // Get metadata
  async getMetadata(id) {
    const response = await apiClient.get(`/images/${id}/metadata`);
    return response.data.data;
  },

  // Batch process
  async batchProcess(ids, operation, options = {}) {
    const response = await apiClient.post('/images/batch', {
      ids,
      operation,
      options
    });
    return response.data.data;
  }
};

export default imageAPI;
