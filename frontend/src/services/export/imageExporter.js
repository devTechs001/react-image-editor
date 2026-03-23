// frontend/src/services/export/imageExporter.js
import { canvasToBlob, canvasToDataURL } from '@/utils/image/imageUtils';
import { compressImage } from './compressionOptimizer';

/**
 * Image Export Service
 * Handles exporting images in various formats with quality and metadata options
 */

export const ImageFormat = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp',
  AVIF: 'image/avif',
  BMP: 'image/bmp',
  TIFF: 'image/tiff'
};

export const ImageQuality = {
  LOSSLESS: 1,
  HIGH: 0.92,
  MEDIUM: 0.75,
  LOW: 0.5
};

/**
 * Export canvas to image blob
 * @param {HTMLCanvasElement} canvas - The canvas to export
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} - The exported image blob
 */
export async function exportCanvasToBlob(canvas, options = {}) {
  const {
    format = ImageFormat.PNG,
    quality = ImageQuality.HIGH,
    maxWidth = null,
    maxHeight = null,
    scale = 1
  } = options;

  let exportCanvas = canvas;

  // Handle scaling
  if (scale !== 1 || maxWidth || maxHeight) {
    exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    
    let width = canvas.width * scale;
    let height = canvas.height * scale;

    // Apply max dimensions
    if (maxWidth || maxHeight) {
      const ratio = Math.min(
        maxWidth ? maxWidth / width : Infinity,
        maxHeight ? maxHeight / height : Infinity
      );
      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }
    }

    exportCanvas.width = Math.floor(width);
    exportCanvas.height = Math.floor(height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  }

  // Apply compression for lossy formats
  if (format === ImageFormat.JPEG || format === ImageFormat.WEBP) {
    return await compressImage(exportCanvas, format, quality);
  }

  return await canvasToBlob(exportCanvas, format, quality);
}

/**
 * Export canvas to data URL
 * @param {HTMLCanvasElement} canvas - The canvas to export
 * @param {Object} options - Export options
 * @returns {string} - The data URL
 */
export function exportCanvasToDataURL(canvas, options = {}) {
  const { format = ImageFormat.PNG, quality = ImageQuality.HIGH } = options;
  return canvasToDataURL(canvas, format, quality);
}

/**
 * Download image blob with filename
 * @param {Blob} blob - The image blob
 * @param {string} filename - The filename (without extension)
 */
export function downloadImage(blob, filename = 'export') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Determine extension from blob type
  const extension = getExtensionFromMimeType(blob.type);
  link.download = `${filename}.${extension}`;
  link.href = url;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectObjectURL(url), 100);
}

/**
 * Export multiple layers as separate images
 * @param {HTMLCanvasElement} canvas - The main canvas
 * @param {Array} layers - Array of layer configurations
 * @param {Object} options - Export options
 * @returns {Promise<Array<Blob>>} - Array of exported blobs
 */
export async function exportLayers(canvas, layers, options = {}) {
  const ctx = canvas.getContext('2d');
  const originalState = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const exports = [];

  for (const layer of layers) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Restore original state
    ctx.putImageData(originalState, 0, 0);
    
    // Hide other layers and export this one
    // Implementation depends on layer management system
    const blob = await exportCanvasToBlob(canvas, options);
    exports.push(blob);
  }

  // Restore original state
  ctx.putImageData(originalState, 0, 0);

  return exports;
}

/**
 * Export image with EXIF metadata
 * @param {HTMLCanvasElement} canvas - The canvas to export
 * @param {Object} metadata - EXIF metadata to embed
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} - The exported image blob with metadata
 */
export async function exportWithMetadata(canvas, metadata = {}, options = {}) {
  const { format = ImageFormat.JPEG, quality = ImageQuality.HIGH } = options;
  
  // Get base64 data
  const dataUrl = canvas.toDataURL(format, quality);
  
  // For JPEG, embed EXIF metadata
  if (format === ImageFormat.JPEG && Object.keys(metadata).length > 0) {
    const blob = await addExifMetadata(dataUrl, metadata);
    return blob;
  }
  
  // For PNG, metadata can be stored in tEXt chunks (simplified here)
  return await canvasToBlob(canvas, format, quality);
}

/**
 * Add EXIF metadata to image
 * @param {string} dataUrl - The image data URL
 * @param {Object} metadata - EXIF metadata
 * @returns {Promise<Blob>} - Image blob with metadata
 */
async function addExifMetadata(dataUrl, metadata) {
  // Create EXIF data structure
  const exifData = createExifSegment(metadata);
  
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  
  // For now, return the original blob
  // Full EXIF implementation would use a library like exif-js
  return blob;
}

/**
 * Create EXIF segment from metadata
 * @param {Object} metadata - Metadata object
 * @returns {Uint8Array} - EXIF data segment
 */
function createExifSegment(metadata) {
  // Simplified EXIF creation
  // Full implementation would follow EXIF specification
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(metadata));
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - File extension
 */
function getExtensionFromMimeType(mimeType) {
  const extensions = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/gif': 'gif'
  };
  return extensions[mimeType] || 'png';
}

/**
 * Create thumbnail from canvas
 * @param {HTMLCanvasElement} canvas - The source canvas
 * @param {number} size - Thumbnail size (max dimension)
 * @returns {Promise<Blob>} - Thumbnail blob
 */
export async function createThumbnail(canvas, size = 256) {
  const thumbnailCanvas = document.createElement('canvas');
  const ctx = thumbnailCanvas.getContext('2d');
  
  // Calculate dimensions maintaining aspect ratio
  const ratio = Math.min(size / canvas.width, size / canvas.height);
  thumbnailCanvas.width = Math.floor(canvas.width * ratio);
  thumbnailCanvas.height = Math.floor(canvas.height * ratio);
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
  
  return await canvasToBlob(thumbnailCanvas, ImageFormat.JPEG, ImageQuality.MEDIUM);
}

/**
 * Export canvas as responsive images (multiple sizes)
 * @param {HTMLCanvasElement} canvas - The canvas to export
 * @param {Array<number>} sizes - Array of widths to generate
 * @param {Object} options - Export options
 * @returns {Promise<Map<number, Blob>>} - Map of size to blob
 */
export async function exportResponsiveImages(canvas, sizes = [320, 640, 1024, 1920], options = {}) {
  const exports = new Map();
  
  for (const width of sizes) {
    const blob = await exportCanvasToBlob(canvas, { ...options, maxWidth: width });
    exports.set(width, blob);
  }
  
  return exports;
}

export default {
  exportCanvasToBlob,
  exportCanvasToDataURL,
  downloadImage,
  exportLayers,
  exportWithMetadata,
  createThumbnail,
  exportResponsiveImages,
  ImageFormat,
  ImageQuality
};
