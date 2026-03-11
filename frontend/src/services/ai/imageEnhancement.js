// frontend/src/services/ai/imageEnhancement.js
import apiClient from '@/services/api/apiClient';

/**
 * Enhance an image using AI
 * @param {string|File} image - Image URL, base64, or File object
 * @param {Object} options - Enhancement options
 * @param {string} options.preset - Enhancement preset (balanced, vivid, portrait, landscape, night)
 * @param {number} options.intensity - Enhancement intensity (0-1)
 * @returns {Promise<string>} - Enhanced image URL
 */
export async function enhanceImage(image, options = {}) {
  const { preset = 'balanced', intensity = 0.75 } = options;

  const formData = new FormData();
  
  if (image instanceof File) {
    formData.append('image', image);
  } else if (image.startsWith('data:')) {
    const response = await fetch(image);
    const blob = await response.blob();
    formData.append('image', blob, 'image.png');
  } else {
    formData.append('imageUrl', image);
  }

  formData.append('preset', preset);
  formData.append('intensity', intensity.toString());

  const response = await apiClient.post('/ai/enhance', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 2 minutes for AI processing
  });

  return response.data.data.enhancedImage;
}

/**
 * Get enhancement preview (lower resolution for quick preview)
 * @param {string|File} image - Image URL, base64, or File object
 * @param {Object} options - Enhancement options
 * @returns {Promise<string>} - Preview image URL
 */
export async function getEnhancementPreview(image, options = {}) {
  const formData = new FormData();
  
  if (image instanceof File) {
    formData.append('image', image);
  } else if (image.startsWith('data:')) {
    const response = await fetch(image);
    const blob = await response.blob();
    formData.append('image', blob, 'image.png');
  } else {
    formData.append('imageUrl', image);
  }

  formData.append('preview', 'true');

  const response = await apiClient.post('/ai/enhance/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.previewImage;
}

/**
 * Get available enhancement presets
 * @returns {Promise<Array>} - List of available presets
 */
export async function getEnhancementPresets() {
  const response = await apiClient.get('/ai/enhance/presets');
  return response.data.data.presets;
}

/**
 * Batch enhance multiple images
 * @param {File[]} images - Array of image files
 * @param {Object} options - Enhancement options
 * @returns {Promise<Object>} - Job ID for tracking progress
 */
export async function batchEnhance(images, options = {}) {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });
  formData.append('preset', options.preset || 'balanced');
  formData.append('intensity', (options.intensity || 0.75).toString());

  const response = await apiClient.post('/ai/enhance/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data;
}

/**
 * Check enhancement job status
 * @param {string} jobId - Job ID from batch enhance
 * @returns {Promise<Object>} - Job status and results
 */
export async function getEnhancementStatus(jobId) {
  const response = await apiClient.get(`/ai/enhance/status/${jobId}`);
  return response.data.data;
}

export default {
  enhanceImage,
  getEnhancementPreview,
  getEnhancementPresets,
  batchEnhance,
  getEnhancementStatus
};
