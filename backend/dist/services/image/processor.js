// backend/src/services/image/processor.js
const sharp = require('sharp');
const path = require('path');
const {
  uploadToStorage
} = require('../storage/s3Storage');

// Resize image
const resize = async ({
  buffer,
  width,
  height,
  fit = 'cover',
  format = 'png'
}) => {
  try {
    let pipeline = sharp(buffer);
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit,
        withoutEnlargement: true
      });
    }
    const result = await pipeline.toFormat(format, {
      quality: 90
    }).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Resize failed: ${error.message}`);
  }
};

// Compress image
const compress = async ({
  buffer,
  quality = 80,
  format
}) => {
  try {
    const metadata = await sharp(buffer).metadata();
    const outputFormat = format || metadata.format || 'jpeg';
    const options = {};
    if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
      options.quality = quality;
      options.mozjpeg = true;
    } else if (outputFormat === 'png') {
      options.compressionLevel = Math.round((100 - quality) / 10);
    } else if (outputFormat === 'webp') {
      options.quality = quality;
    }
    const result = await sharp(buffer).toFormat(outputFormat, options).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info,
      compressionRatio: (1 - result.data.length / buffer.length) * 100
    };
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
};

// Convert format
const convert = async ({
  buffer,
  format,
  options = {}
}) => {
  try {
    const result = await sharp(buffer).toFormat(format, options).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

// Generate thumbnail
const generateThumbnail = async ({
  buffer,
  width = 300,
  height = 300
}) => {
  try {
    const result = await sharp(buffer).resize(width, height, {
      fit: 'cover',
      position: 'centre'
    }).jpeg({
      quality: 80
    }).toBuffer();
    return {
      buffer: result
    };
  } catch (error) {
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }
};

// Apply adjustments
const applyAdjustments = async ({
  buffer,
  adjustments
}) => {
  try {
    let pipeline = sharp(buffer);
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0,
      hue = 0,
      sharpness = 0,
      blur = 0,
      gamma = 1
    } = adjustments;

    // Modulate (brightness, saturation, hue)
    if (brightness !== 0 || saturation !== 0 || hue !== 0) {
      pipeline = pipeline.modulate({
        brightness: 1 + brightness / 100,
        saturation: 1 + saturation / 100,
        hue
      });
    }

    // Contrast using linear
    if (contrast !== 0) {
      const contrastFactor = 1 + contrast / 100;
      pipeline = pipeline.linear(contrastFactor, -(128 * (contrastFactor - 1)));
    }

    // Gamma
    if (gamma !== 1) {
      pipeline = pipeline.gamma(gamma);
    }

    // Sharpen
    if (sharpness > 0) {
      pipeline = pipeline.sharpen(sharpness / 10);
    }

    // Blur
    if (blur > 0) {
      pipeline = pipeline.blur(blur);
    }
    const result = await pipeline.toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Adjustments failed: ${error.message}`);
  }
};

// Crop image
const crop = async ({
  buffer,
  x,
  y,
  width,
  height
}) => {
  try {
    const result = await sharp(buffer).extract({
      left: x,
      top: y,
      width,
      height
    }).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Crop failed: ${error.message}`);
  }
};

// Rotate image
const rotate = async ({
  buffer,
  angle,
  background = '#ffffff'
}) => {
  try {
    const result = await sharp(buffer).rotate(angle, {
      background
    }).toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Rotation failed: ${error.message}`);
  }
};

// Flip image
const flip = async ({
  buffer,
  direction = 'horizontal'
}) => {
  try {
    let pipeline = sharp(buffer);
    if (direction === 'horizontal') {
      pipeline = pipeline.flop();
    } else {
      pipeline = pipeline.flip();
    }
    const result = await pipeline.toBuffer({
      resolveWithObject: true
    });
    return {
      buffer: result.data,
      info: result.info
    };
  } catch (error) {
    throw new Error(`Flip failed: ${error.message}`);
  }
};

// Get image metadata
const getMetadata = async buffer => {
  try {
    const metadata = await sharp(buffer).metadata();
    const stats = await sharp(buffer).stats();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
      space: metadata.space,
      density: metadata.density,
      isProgressive: metadata.isProgressive,
      stats: {
        dominant: stats.dominant,
        isOpaque: stats.isOpaque
      }
    };
  } catch (error) {
    throw new Error(`Metadata extraction failed: ${error.message}`);
  }
};

// Export project as image
const exportProject = async (project, settings, onProgress) => {
  try {
    const {
      format = 'png',
      quality = 100,
      scale = 1
    } = settings;
    onProgress?.(20);

    // Create canvas with project dimensions
    const {
      width,
      height,
      backgroundColor
    } = project.canvas;
    const scaledWidth = Math.round(width * scale);
    const scaledHeight = Math.round(height * scale);

    // Start with background
    let composite = sharp({
      create: {
        width: scaledWidth,
        height: scaledHeight,
        channels: 4,
        background: backgroundColor || '#ffffff'
      }
    });
    onProgress?.(40);

    // Composite layers (simplified - actual implementation would be more complex)
    const compositeInputs = [];
    for (const layer of project.layers.filter(l => l.visible)) {
      if (layer.data?.imageUrl) {
        // Download and process layer image
        const axios = require('axios');
        const response = await axios.get(layer.data.imageUrl, {
          responseType: 'arraybuffer'
        });
        let layerBuffer = Buffer.from(response.data);

        // Apply layer transformations
        layerBuffer = await sharp(layerBuffer).resize(Math.round(layer.size.width * scale), Math.round(layer.size.height * scale)).rotate(layer.rotation || 0).toBuffer();
        compositeInputs.push({
          input: layerBuffer,
          left: Math.round(layer.position.x * scale),
          top: Math.round(layer.position.y * scale),
          blend: layer.blendMode || 'over'
        });
      }
    }
    onProgress?.(70);
    if (compositeInputs.length > 0) {
      composite = composite.composite(compositeInputs);
    }

    // Apply format and quality
    const formatOptions = {};
    if (format === 'jpeg' || format === 'jpg') {
      formatOptions.quality = quality;
    } else if (format === 'png') {
      formatOptions.compressionLevel = Math.round((100 - quality) / 10);
    } else if (format === 'webp') {
      formatOptions.quality = quality;
    }
    const result = await composite.toFormat(format, formatOptions).toBuffer({
      resolveWithObject: true
    });
    onProgress?.(90);

    // Upload to storage
    const key = `exports/${project._id}/${Date.now()}.${format}`;
    const url = await uploadToStorage(result.data, key, `image/${format}`);
    onProgress?.(100);
    return {
      url,
      size: result.data.length,
      dimensions: {
        width: result.info.width,
        height: result.info.height
      }
    };
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
};
module.exports = {
  resize,
  compress,
  convert,
  generateThumbnail,
  applyAdjustments,
  crop,
  rotate,
  flip,
  getMetadata,
  export: exportProject
};