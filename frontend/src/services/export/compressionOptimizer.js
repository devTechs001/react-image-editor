// frontend/src/services/export/compressionOptimizer.js
import { canvasToBlob } from '@/utils/image/imageUtils';

/**
 * Compression Optimizer Service
 * Handles intelligent image compression with quality/size optimization
 */

export const CompressionPreset = {
  LOSSLESS: { quality: 1, method: 'none' },
  HIGH_QUALITY: { quality: 0.92, method: 'smart' },
  BALANCED: { quality: 0.75, method: 'smart' },
  SMALL_SIZE: { quality: 0.6, method: 'aggressive' },
  TINY: { quality: 0.4, method: 'aggressive' }
};

/**
 * Compress image with smart optimization
 * @param {HTMLCanvasElement|Blob} source - Canvas or blob to compress
 * @param {string} format - Output format
 * @param {number} quality - Quality level (0-1)
 * @param {Object} options - Additional options
 * @returns {Promise<Blob>} - Compressed blob
 */
export async function compressImage(source, format = 'image/jpeg', quality = 0.75, options = {}) {
  const {
    maxWidth = null,
    maxHeight = null,
    targetSize = null, // Target file size in bytes
    method = 'smart'
  } = options;

  let canvas = source;
  
  // Convert blob to canvas if needed
  if (source instanceof Blob) {
    canvas = await blobToCanvas(source);
  }

  // Resize if needed
  if (maxWidth || maxHeight) {
    canvas = resizeCanvas(canvas, maxWidth, maxHeight);
  }

  // Smart compression - iteratively find best quality
  if (method === 'smart' && targetSize) {
    return await smartCompress(canvas, format, targetSize);
  }

  // Aggressive compression with additional optimizations
  if (method === 'aggressive') {
    return await aggressiveCompress(canvas, format, quality);
  }

  // Standard compression
  return await canvasToBlob(canvas, format, quality);
}

/**
 * Smart compression - finds optimal quality for target size
 * @param {HTMLCanvasElement} canvas - The canvas to compress
 * @param {string} format - Output format
 * @param {number} targetSize - Target size in bytes
 * @returns {Promise<Blob>} - Optimized blob
 */
async function smartCompress(canvas, format, targetSize) {
  let minQuality = 0.1;
  let maxQuality = 1;
  let bestBlob = null;
  let bestQuality = 0.75;

  // Binary search for optimal quality
  for (let i = 0; i < 5; i++) {
    const testQuality = (minQuality + maxQuality) / 2;
    const blob = await canvasToBlob(canvas, format, testQuality);

    if (blob.size <= targetSize) {
      bestBlob = blob;
      bestQuality = testQuality;
      minQuality = testQuality; // Try higher quality
    } else {
      maxQuality = testQuality; // Need lower quality
    }

    if (bestBlob && Math.abs(blob.size - targetSize) < targetSize * 0.05) {
      // Within 5% of target, good enough
      break;
    }
  }

  return bestBlob || await canvasToBlob(canvas, format, bestQuality);
}

/**
 * Aggressive compression with additional optimizations
 * @param {HTMLCanvasElement} canvas - The canvas to compress
 * @param {string} format - Output format
 * @param {number} quality - Base quality
 * @returns {Promise<Blob>} - Compressed blob
 */
async function aggressiveCompress(canvas, format, quality) {
  // Apply preprocessing for better compression
  const processedCanvas = await preprocessForCompression(canvas);
  return await canvasToBlob(processedCanvas, format, quality);
}

/**
 * Preprocess canvas for better compression
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {Promise<HTMLCanvasElement>} - Processed canvas
 */
async function preprocessForCompression(canvas) {
  const processed = document.createElement('canvas');
  processed.width = canvas.width;
  processed.height = canvas.height;
  const ctx = processed.getContext('2d');

  // Draw with slight blur to reduce high-frequency noise
  ctx.filter = 'blur(0.3px)';
  ctx.drawImage(canvas, 0, 0);

  return processed;
}

/**
 * Convert blob to canvas
 * @param {Blob} blob - Image blob
 * @returns {Promise<HTMLCanvasElement>} - Canvas element
 */
async function blobToCanvas(blob) {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Resize canvas maintaining aspect ratio
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} maxWidth - Max width
 * @param {number} maxHeight - Max height
 * @returns {HTMLCanvasElement} - Resized canvas
 */
function resizeCanvas(canvas, maxWidth, maxHeight) {
  if (!maxWidth && !maxHeight) return canvas;

  let width = canvas.width;
  let height = canvas.height;

  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  const resized = document.createElement('canvas');
  resized.width = Math.floor(width);
  resized.height = Math.floor(height);
  const ctx = resized.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);

  return resized;
}

/**
 * Estimate file size before export
 * @param {HTMLCanvasElement} canvas - The canvas
 * @param {string} format - Output format
 * @param {number} quality - Quality level
 * @returns {number} - Estimated size in bytes
 */
export function estimateFileSize(canvas, format = 'image/jpeg', quality = 0.75) {
  // Rough estimation based on dimensions and quality
  const pixels = canvas.width * canvas.height;
  const bytesPerPixel = format === 'image/png' ? 4 : 3;
  const compressionRatio = format === 'image/png' ? 0.3 : quality * 0.15;
  
  return Math.floor(pixels * bytesPerPixel * compressionRatio);
}

/**
 * Get optimal format for image content
 * @param {HTMLCanvasElement} canvas - The canvas to analyze
 * @param {Object} requirements - Export requirements
 * @returns {string} - Recommended format
 */
export function getOptimalFormat(canvas, requirements = {}) {
  const {
    needsTransparency = false,
    needsAnimation = false,
    preferSmallSize = false,
    preferQuality = false
  } = requirements;

  // Check if image has transparency
  const hasTransparency = checkTransparency(canvas);

  if (needsAnimation) {
    return 'image/gif';
  }

  if (needsTransparency || hasTransparency) {
    if (preferSmallSize) {
      return 'image/webp'; // WebP supports transparency with better compression
    }
    return 'image/png';
  }

  if (preferQuality) {
    return 'image/png'; // Lossless
  }

  if (preferSmallSize) {
    return 'image/avif'; // Best compression, but limited support
  }

  return 'image/jpeg'; // Good balance
}

/**
 * Check if canvas has transparent pixels
 * @param {HTMLCanvasElement} canvas - The canvas to check
 * @returns {boolean} - True if has transparency
 */
function checkTransparency(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Sample pixels (check every 10th pixel for performance)
  for (let i = 3; i < data.length; i += 40) {
    if (data[i] < 255) {
      return true;
    }
  }

  return false;
}

/**
 * Batch compress multiple images
 * @param {Array<HTMLCanvasElement|Blob>} images - Images to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Array<Blob>>} - Compressed blobs
 */
export async function batchCompress(images, options = {}) {
  const results = [];
  
  for (const image of images) {
    try {
      const compressed = await compressImage(image, options.format, options.quality, options);
      results.push(compressed);
    } catch (error) {
      console.error('Failed to compress image:', error);
      results.push(null);
    }
  }
  
  return results;
}

/**
 * Progressive JPEG optimization
 * @param {HTMLCanvasElement} canvas - The canvas
 * @param {number} quality - Quality level
 * @returns {Promise<Blob>} - Optimized blob
 */
export async function progressiveOptimize(canvas, quality = 0.75) {
  // Note: True progressive JPEG requires library support
  // This is a simplified version that applies quality optimization
  return await compressImage(canvas, 'image/jpeg', quality, {
    method: 'smart',
    targetSize: estimateFileSize(canvas, 'image/jpeg', quality) * 0.9
  });
}

export default {
  compressImage,
  estimateFileSize,
  getOptimalFormat,
  batchCompress,
  progressiveOptimize,
  CompressionPreset
};
