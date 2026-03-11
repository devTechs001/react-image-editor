// frontend/src/services/api/aiAPI.js
import apiClient from './apiClient';

export const aiAPI = {
  // Background removal
  async removeBackground(image, options = {}) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }

    const response = await apiClient.post('/ai/background/remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Image enhancement
  async enhanceImage(image, options = {}) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }
    formData.append('preset', options.preset || 'balanced');
    formData.append('intensity', options.intensity?.toString() || '0.75');

    const response = await apiClient.post('/ai/enhance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Image generation
  async generateImage(prompt, options = {}) {
    const response = await apiClient.post('/ai/generate', {
      prompt,
      ...options
    });
    return response.data.data;
  },

  // Style transfer
  async transferStyle(image, style, options = {}) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }
    if (style instanceof File) {
      formData.append('style', style);
    } else {
      formData.append('styleUrl', style);
    }
    formData.append('intensity', options.intensity?.toString() || '0.5');

    const response = await apiClient.post('/ai/style-transfer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Object detection
  async detectObjects(image) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }

    const response = await apiClient.post('/ai/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Face detection
  async detectFaces(image) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }

    const response = await apiClient.post('/ai/face/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Image upscaling
  async upscaleImage(image, scale = 2) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }
    formData.append('scale', scale.toString());

    const response = await apiClient.post('/ai/upscale', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Inpainting
  async inpaint(image, mask, options = {}) {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append('image', image);
    } else {
      formData.append('imageUrl', image);
    }
    if (mask instanceof File) {
      formData.append('mask', mask);
    } else {
      formData.append('maskUrl', mask);
    }

    const response = await apiClient.post('/ai/inpaint', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get AI usage stats
  async getUsage() {
    const response = await apiClient.get('/ai/usage');
    return response.data.data;
  }
};

export default aiAPI;
