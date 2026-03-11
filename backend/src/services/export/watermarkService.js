// backend/src/services/export/watermarkService.js
const sharp = require('sharp');

/**
 * Add watermark to image
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} watermarkConfig - Watermark configuration
 * @returns {Promise<Buffer>} - Watermarked image buffer
 */
async function addWatermark(imageBuffer, watermarkConfig) {
  const {
    text,
    image,
    position = 'bottom-right',
    opacity = 0.5,
    size = 'medium',
    color = '#ffffff',
    fontSize = 24,
    fontFamily = 'Arial',
    margin = 20,
    rotation = 0
  } = watermarkConfig;

  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;

    let watermarkBuffer;

    if (text) {
      // Create text watermark
      const svg = createTextWatermarkSVG(text, {
        width,
        height,
        position,
        opacity,
        color,
        fontSize,
        fontFamily,
        margin,
        rotation
      });
      
      watermarkBuffer = Buffer.from(svg);
    } else if (image) {
      // Use image watermark
      let watermarkImage = sharp(image);
      
      // Resize watermark
      const sizeMap = { small: 0.1, medium: 0.2, large: 0.3 };
      const scale = sizeMap[size] || 0.2;
      const watermarkWidth = Math.round(width * scale);
      
      watermarkImage = watermarkImage.resize(watermarkWidth, null);
      
      // Apply opacity
      watermarkImage = watermarkImage.joinChannel(
        Buffer.from(
          Array(Math.round(watermarkWidth * (await watermarkImage.metadata()).height * (opacity * 255))).fill(255)
        )
      );
      
      watermarkBuffer = await watermarkImage.png().toBuffer();
    } else {
      throw new Error('Either text or image watermark must be provided');
    }

    // Calculate position
    const watermarkMetadata = await sharp(watermarkBuffer).metadata();
    const wmWidth = watermarkMetadata.width;
    const wmHeight = watermarkMetadata.height;
    
    const positions = calculatePosition(position, width, height, wmWidth, wmHeight, margin);

    // Composite watermark onto image
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkBuffer,
          ...positions,
          blend: 'over'
        }
      ])
      .toBuffer();

    return result;
  } catch (error) {
    throw new Error(`Watermark failed: ${error.message}`);
  }
}

/**
 * Create SVG for text watermark
 */
function createTextWatermarkSVG(text, options) {
  const {
    width,
    height,
    position,
    opacity,
    color,
    fontSize,
    fontFamily,
    margin,
    rotation
  } = options;

  const positions = calculatePosition(position, width, height, 0, 0, margin);
  
  // Escape text for SVG
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${positions.left || positions.right || width / 2}"
        y="${positions.top || positions.bottom || height / 2}"
        fill="${color}"
        fill-opacity="${opacity}"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${rotation}, ${width / 2}, ${height / 2})"
      >
        ${escapedText}
      </text>
    </svg>
  `;
}

/**
 * Calculate position coordinates
 */
function calculatePosition(position, canvasWidth, canvasHeight, wmWidth, wmHeight, margin) {
  const positions = {
    'top-left': { left: margin, top: margin },
    'top-right': { right: margin, top: margin },
    'top-center': { left: (canvasWidth - wmWidth) / 2, top: margin },
    'bottom-left': { left: margin, bottom: margin },
    'bottom-right': { right: margin, bottom: margin },
    'bottom-center': { left: (canvasWidth - wmWidth) / 2, bottom: margin },
    'center': { left: (canvasWidth - wmWidth) / 2, top: (canvasHeight - wmHeight) / 2 },
    'middle': { left: (canvasWidth - wmWidth) / 2, top: (canvasHeight - wmHeight) / 2 }
  };

  return positions[position] || positions['bottom-right'];
}

/**
 * Remove watermark (basic implementation)
 * This is a simplified version - real implementation would use AI inpainting
 */
async function removeWatermark(imageBuffer, watermarkArea) {
  // For now, just return the original image
  // In production, use AI inpainting to remove watermark
  const { x, y, width, height } = watermarkArea;
  
  // This is a placeholder - real implementation would use the AI inpainting service
  const imageProcessor = require('../image/processor');
  const { inpaint } = require('../ai/inpainting');
  
  try {
    return await inpaint(imageBuffer, { x, y, width, height });
  } catch (error) {
    throw new Error(`Watermark removal failed: ${error.message}`);
  }
}

module.exports = {
  addWatermark,
  removeWatermark
};
