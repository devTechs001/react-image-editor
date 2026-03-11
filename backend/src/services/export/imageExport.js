// backend/src/services/export/imageExport.js
const sharp = require('sharp');
const Project = require('../../models/Project');

/**
 * Export project as image
 * @param {Object} project - Project document
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Exported image buffer and metadata
 */
async function exportImage(project, options = {}) {
  const {
    format = 'png',
    quality = 100,
    scale = 1,
    width,
    height,
    backgroundColor = project.canvas?.backgroundColor || '#ffffff'
  } = options;

  try {
    const canvasWidth = Math.round((project.canvas?.width || 1920) * scale);
    const canvasHeight = Math.round((project.canvas?.height || 1080) * scale);

    // Create base canvas with background color
    let pipeline = sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: {
          r: parseInt(backgroundColor.slice(1, 3), 16) || 255,
          g: parseInt(backgroundColor.slice(3, 5), 16) || 255,
          b: parseInt(backgroundColor.slice(5, 7), 16) || 255,
          alpha: 1
        }
      }
    });

    // Composite layers in order
    const compositeInputs = [];
    
    if (project.layers && project.layers.length > 0) {
      for (const layer of project.layers.filter(l => l.visible !== false)) {
        if (layer.data?.imageUrl) {
          // Fetch layer image
          const axios = require('axios');
          const response = await axios.get(layer.data.imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 10000
          });
          
          let layerBuffer = Buffer.from(response.data);
          
          // Resize layer
          const layerWidth = Math.round((layer.size?.width || 100) * scale);
          const layerHeight = Math.round((layer.size?.height || 100) * scale);
          
          layerBuffer = await sharp(layerBuffer)
            .resize(layerWidth, layerHeight, { fit: 'fill' })
            .toBuffer();
          
          // Apply rotation if needed
          if (layer.rotation) {
            layerBuffer = await sharp(layerBuffer)
              .rotate(layer.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .toBuffer();
          }
          
          compositeInputs.push({
            input: layerBuffer,
            left: Math.round((layer.position?.x || 0) * scale),
            top: Math.round((layer.position?.y || 0) * scale),
            blend: layer.blendMode || 'over'
          });
        }
      }
    }

    // Apply composite if we have layers
    if (compositeInputs.length > 0) {
      pipeline = pipeline.composite(compositeInputs);
    }

    // Apply format-specific options
    const formatOptions = {};
    
    if (format === 'jpeg' || format === 'jpg') {
      formatOptions.quality = quality;
      formatOptions.mozjpeg = true;
    } else if (format === 'png') {
      formatOptions.compressionLevel = Math.round((100 - quality) / 10);
    } else if (format === 'webp') {
      formatOptions.quality = quality;
    } else if (format === 'tiff') {
      formatOptions.quality = quality;
      formatOptions.compression = 'lzw';
    }

    // Convert to target format
    const result = await pipeline
      .toFormat(format, formatOptions)
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: result.data,
      size: result.data.length,
      mimeType: `image/${format === 'jpg' ? 'jpeg' : format}`,
      dimensions: {
        width: result.info.width,
        height: result.info.height
      },
      format
    };
  } catch (error) {
    throw new Error(`Image export failed: ${error.message}`);
  }
}

/**
 * Export multiple images (batch)
 * @param {Array} projects - Array of project documents
 * @param {Object} options - Export options
 * @returns {Promise<Array>} - Array of exported images
 */
async function batchExportImage(projects, options = {}) {
  const results = [];
  
  for (const project of projects) {
    try {
      const result = await exportImage(project, options);
      results.push({
        projectId: project._id,
        success: true,
        ...result
      });
    } catch (error) {
      results.push({
        projectId: project._id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  exportImage,
  batchExportImage
};
