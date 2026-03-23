// frontend/src/services/api/exportAPI.js
import apiClient from './apiClient';

export const exportAPI = {
  // Export project
  async export(projectId, options) {
    const response = await apiClient.post(`/export/${projectId}`, options);
    return response.data.data;
  },

  // Get export status
  async getStatus(exportId) {
    const response = await apiClient.get(`/export/status/${exportId}`);
    return response.data.data;
  },

  // Download export
  async download(exportId) {
    const response = await apiClient.get(`/export/download/${exportId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get download URL
  async getDownloadUrl(exportId, expires = 3600) {
    const response = await apiClient.get(`/export/url/${exportId}`, {
      params: { expires }
    });
    return response.data.data;
  },

  // Batch export
  async batchExport(projectIds, options) {
    const response = await apiClient.post('/export/batch', {
      projectIds,
      options
    });
    return response.data.data;
  },

  // Get export history
  async getHistory(limit = 20) {
    const response = await apiClient.get('/export/history', {
      params: { limit }
    });
    return response.data.data;
  },

  // Delete export
  async delete(exportId) {
    const response = await apiClient.delete(`/export/${exportId}`);
    return response.data.data;
  },

  // Get export formats
  async getFormats(projectType) {
    const response = await apiClient.get('/export/formats', {
      params: { type: projectType }
    });
    return response.data.data;
  },

  // Get export presets
  async getPresets() {
    const response = await apiClient.get('/export/presets');
    return response.data.data;
  },

  // Save export preset
  async savePreset(name, options) {
    const response = await apiClient.post('/export/presets', { name, options });
    return response.data.data;
  },

  // Delete preset
  async deletePreset(presetId) {
    const response = await apiClient.delete(`/export/presets/${presetId}`);
    return response.data.data;
  },

  // Get export quota
  async getQuota() {
    const response = await apiClient.get('/export/quota');
    return response.data.data;
  },

  // Schedule export
  async schedule(projectId, options, scheduledTime) {
    const response = await apiClient.post(`/export/${projectId}/schedule`, {
      options,
      scheduledTime
    });
    return response.data.data;
  },

  // Cancel export
  async cancel(exportId) {
    const response = await apiClient.post(`/export/cancel/${exportId}`);
    return response.data.data;
  },

  // Share export
  async share(exportId, options = {}) {
    const response = await apiClient.post(`/export/${exportId}/share`, options);
    return response.data.data;
  },

  // Get export metadata
  async getMetadata(exportId) {
    const response = await apiClient.get(`/export/${exportId}/metadata`);
    return response.data.data;
  }
};

export default exportAPI;
