// frontend/src/services/api/audioAPI.js
import apiClient from './apiClient';

export const audioAPI = {
  // Process audio
  async process(audioData) {
    const response = await apiClient.post('/audio/process', audioData);
    return response.data.data;
  },

  // Get processing status
  async getStatus(jobId) {
    const response = await apiClient.get(`/audio/status/${jobId}`);
    return response.data.data;
  },

  // Export audio
  async export(projectId, options) {
    const response = await apiClient.post(`/audio/${projectId}/export`, options);
    return response.data.data;
  },

  // Upload audio
  async upload(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name || file.name);
    formData.append('projectId', metadata.projectId);

    const response = await apiClient.post('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Trim audio
  async trim(projectId, startTime, endTime) {
    const response = await apiClient.post(`/audio/${projectId}/trim`, {
      startTime,
      endTime
    });
    return response.data.data;
  },

  // Merge audio tracks
  async merge(projectIds, options = {}) {
    const response = await apiClient.post('/audio/merge', {
      projectIds,
      ...options
    });
    return response.data.data;
  },

  // Apply effect
  async applyEffect(projectId, effect, params = {}) {
    const response = await apiClient.post(`/audio/${projectId}/effect`, {
      effect,
      params
    });
    return response.data.data;
  },

  // Normalize audio
  async normalize(projectId, targetLevel = -16) {
    const response = await apiClient.post(`/audio/${projectId}/normalize`, {
      targetLevel
    });
    return response.data.data;
  },

  // Apply fade
  async applyFade(projectId, type, duration = 1) {
    const response = await apiClient.post(`/audio/${projectId}/fade`, {
      type, // 'in' or 'out'
      duration
    });
    return response.data.data;
  },

  // Change volume
  async changeVolume(projectId, volume) {
    const response = await apiClient.post(`/audio/${projectId}/volume`, { volume });
    return response.data.data;
  },

  // Change speed/pitch
  async changeSpeed(projectId, speed, preservePitch = true) {
    const response = await apiClient.post(`/audio/${projectId}/speed`, {
      speed,
      preservePitch
    });
    return response.data.data;
  },

  // Apply EQ
  async applyEQ(projectId, bands) {
    const response = await apiClient.post(`/audio/${projectId}/eq`, { bands });
    return response.data.data;
  },

  // Apply compression
  async applyCompression(projectId, threshold, ratio, attack, release) {
    const response = await apiClient.post(`/audio/${projectId}/compress`, {
      threshold,
      ratio,
      attack,
      release
    });
    return response.data.data;
  },

  // Apply reverb
  async applyReverb(projectId, roomSize, decay, wetLevel) {
    const response = await apiClient.post(`/audio/${projectId}/reverb`, {
      roomSize,
      decay,
      wetLevel
    });
    return response.data.data;
  },

  // Noise reduction
  async reduceNoise(projectId, amount = 0.5) {
    const response = await apiClient.post(`/audio/${projectId}/denoise`, { amount });
    return response.data.data;
  },

  // Extract vocals
  async extractVocals(projectId) {
    const response = await apiClient.post(`/audio/${projectId}/extract-vocals`);
    return response.data.data;
  },

  // Generate waveform
  async generateWaveform(projectId) {
    const response = await apiClient.post(`/audio/${projectId}/waveform`);
    return response.data.data;
  },

  // Get audio info
  async getInfo(projectId) {
    const response = await apiClient.get(`/audio/${projectId}/info`);
    return response.data.data;
  },

  // Cancel processing
  async cancel(jobId) {
    const response = await apiClient.post(`/audio/cancel/${jobId}`);
    return response.data.data;
  }
};

export default audioAPI;
