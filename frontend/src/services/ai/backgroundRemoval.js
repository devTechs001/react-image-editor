// frontend/src/services/ai/backgroundRemoval.js
import apiClient from '@/services/api/apiClient';

/**
 * Remove background from an image
 * @param {string|File} image - Image URL, base64, or File object
 * @param {Object} options - Background removal options
 * @param {string} options.model - Model to use (default: 'rembg')
 * @returns {Promise<string>} - Image with background removed (base64 or URL)
 */
export async function removeBackground(image, options = {}) {
  const { model = 'rembg' } = options;

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

  formData.append('model', model);

  const response = await apiClient.post('/ai/background/remove', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 2 minutes for AI processing
  });

  return response.data.data.image;
}

/**
 * Replace background with a new background
 * @param {string|File} image - Image URL, base64, or File object
 * @param {string} background - New background (color, image URL, or 'transparent')
 * @param {Object} options - Options
 * @returns {Promise<string>} - Image with new background
 */
export async function replaceBackground(image, background, options = {}) {
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

  if (background.startsWith('data:') || background.startsWith('http')) {
    if (background.startsWith('http')) {
      formData.append('backgroundUrl', background);
    } else {
      const response = await fetch(background);
      const blob = await response.blob();
      formData.append('background', blob, 'background.png');
    }
  } else {
    formData.append('backgroundColor', background);
  }

  const response = await apiClient.post('/ai/background/replace', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000
  });

  return response.data.data.image;
}

/**
 * Get background blur effect
 * @param {string|File} image - Image URL, base64, or File object
 * @param {number} blurAmount - Blur intensity (0-100)
 * @returns {Promise<string>} - Image with blurred background
 */
export async function blurBackground(image, blurAmount = 50) {
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

  formData.append('blurAmount', blurAmount.toString());

  const response = await apiClient.post('/ai/background/blur', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000
  });

  return response.data.data.image;
}

export default {
  removeBackground,
  replaceBackground,
  blurBackground
};
