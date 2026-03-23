// frontend/src/services/api/videoAPI.js
import apiClient from './apiClient';

export const videoAPI = {
  // Process video
  async process(videoData) {
    const response = await apiClient.post('/videos/process', videoData);
    return response.data.data;
  },

  // Get video processing status
  async getStatus(jobId) {
    const response = await apiClient.get(`/videos/status/${jobId}`);
    return response.data.data;
  },

  // Export video
  async export(projectId, options) {
    const response = await apiClient.post(`/videos/${projectId}/export`, options);
    return response.data.data;
  },

  // Get export result
  async getExport(exportId) {
    const response = await apiClient.get(`/videos/exports/${exportId}`);
    return response.data.data;
  },

  // Upload video
  async upload(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name || file.name);
    formData.append('projectId', metadata.projectId);

    const response = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Trim video
  async trim(projectId, startTime, endTime) {
    const response = await apiClient.post(`/videos/${projectId}/trim`, {
      startTime,
      endTime
    });
    return response.data.data;
  },

  // Merge videos
  async merge(projectIds, options = {}) {
    const response = await apiClient.post('/videos/merge', {
      projectIds,
      ...options
    });
    return response.data.data;
  },

  // Add audio to video
  async addAudio(projectId, audioId, options = {}) {
    const response = await apiClient.post(`/videos/${projectId}/audio`, {
      audioId,
      ...options
    });
    return response.data.data;
  },

  // Add text overlay
  async addText(projectId, text, options = {}) {
    const response = await apiClient.post(`/videos/${projectId}/text`, {
      text,
      ...options
    });
    return response.data.data;
  },

  // Apply filter
  async applyFilter(projectId, filter, intensity = 1) {
    const response = await apiClient.post(`/videos/${projectId}/filter`, {
      filter,
      intensity
    });
    return response.data.data;
  },

  // Apply transition
  async applyTransition(projectId, clipId, transition, duration = 1) {
    const response = await apiClient.post(`/videos/${projectId}/transition`, {
      clipId,
      transition,
      duration
    });
    return response.data.data;
  },

  // Change speed
  async changeSpeed(projectId, speed) {
    const response = await apiClient.post(`/videos/${projectId}/speed`, { speed });
    return response.data.data;
  },

  // Extract audio
  async extractAudio(projectId) {
    const response = await apiClient.post(`/videos/${projectId}/extract-audio`);
    return response.data.data;
  },

  // Generate thumbnail
  async generateThumbnail(projectId, timestamp = 0) {
    const response = await apiClient.post(`/videos/${projectId}/thumbnail`, { timestamp });
    return response.data.data;
  },

  // Get video info
  async getInfo(projectId) {
    const response = await apiClient.get(`/videos/${projectId}/info`);
    return response.data.data;
  },

  // Cancel processing
  async cancel(jobId) {
    const response = await apiClient.post(`/videos/cancel/${jobId}`);
    return response.data.data;
  }
};

export default videoAPI;
