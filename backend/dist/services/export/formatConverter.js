// backend/src/services/export/formatConverter.js
const sharp = require('sharp');

/**
 * Convert image between formats
 * @param {Buffer} imageBuffer - Source image buffer
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Converted image buffer and metadata
 */
async function convertFormat(imageBuffer, options = {}) {
  const {
    format = 'png',
    quality = 90,
    width,
    height,
    fit = 'contain',
    background = '#ffffff',
    preserveAspectRatio = true
  } = options;
  try {
    let pipeline = sharp(imageBuffer);

    // Get original metadata
    const metadata = await pipeline.metadata();

    // Resize if dimensions provided
    if (width || height) {
      const resizeOptions = {
        fit,
        background: parseColor(background)
      };
      if (preserveAspectRatio) {
        resizeOptions.withoutEnlargement = true;
      }
      pipeline = pipeline.resize(width, height, resizeOptions);
    }

    // Format-specific options
    const formatOptions = {};
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        formatOptions.quality = quality;
        formatOptions.mozjpeg = true;
        formatOptions.progressive = true;
        break;
      case 'png':
        formatOptions.compressionLevel = Math.round((100 - quality) / 10);
        formatOptions.adaptiveFiltering = true;
        break;
      case 'webp':
        formatOptions.quality = quality;
        formatOptions.nearLossless = quality > 90;
        break;
      case 'avif':
        formatOptions.quality = quality;
        formatOptions.effort = 4;
        break;
      case 'tiff':
        formatOptions.quality = quality;
        formatOptions.compression = 'lzw';
        break;
      case 'gif':
        formatOptions.colors = 256;
        formatOptions.dither = true;
        break;
      case 'heic':
      case 'heif':
        formatOptions.quality = quality;
        formatOptions.compression = 'hevc';
        break;
    }

    // Convert to target format
    const result = await pipeline.toFormat(format, formatOptions).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      size: result.data.length,
      mimeType: `image/${format === 'jpg' ? 'jpeg' : format}`,
      dimensions: {
        width: result.info.width,
        height: result.info.height
      },
      format,
      compressionRatio: metadata.size ? (1 - result.data.length / metadata.size) * 100 : 0
    };
  } catch (error) {
    throw new Error(`Format conversion failed: ${error.message}`);
  }
}

/**
 * Batch convert multiple images
 * @param {Array} images - Array of image buffers
 * @param {Object} options - Conversion options
 * @returns {Promise<Array>} - Array of converted images
 */
async function batchConvert(images, options = {}) {
  const results = [];
  for (const image of images) {
    try {
      const result = await convertFormat(image, options);
      results.push({
        success: true,
        ...result
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message
      });
    }
  }
  return results;
}

/**
 * Get supported formats
 * @returns {Array} - Array of supported format names
 */
function getSupportedFormats() {
  return sharp.format;
}

/**
 * Detect image format
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<string>} - Detected format
 */
async function detectFormat(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  return metadata.format;
}

/**
 * Parse color string to RGB object
 */
function parseColor(color) {
  if (typeof color === 'object') return color;
  const hex = color.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16) || 255,
    g: parseInt(hex.substring(2, 4), 16) || 255,
    b: parseInt(hex.substring(4, 6), 16) || 255,
    alpha: 1
  };
}
module.exports = {
  convertFormat,
  batchConvert,
  getSupportedFormats,
  detectFormat
};