// frontend/src/services/export/watermark.js
import { ImageFormat, ImageQuality } from './imageExporter';

/**
 * Watermark Service
 * Handles adding and managing watermarks on images
 */

export const WatermarkPosition = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  MIDDLE_LEFT: 'middle-left',
  CENTER: 'center',
  MIDDLE_RIGHT: 'middle-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
  TILE: 'tile'
};

export const WatermarkType = {
  TEXT: 'text',
  IMAGE: 'image',
  LOGO: 'logo'
};

/**
 * Apply watermark to canvas
 * @param {HTMLCanvasElement} canvas - The canvas to watermark
 * @param {Object} config - Watermark configuration
 * @returns {Promise<HTMLCanvasElement>} - Watermarked canvas
 */
export async function applyWatermark(canvas, config) {
  const {
    type = WatermarkType.TEXT,
    text = '',
    image = null,
    position = WatermarkPosition.BOTTOM_RIGHT,
    opacity = 0.5,
    scale = 1,
    rotation = 0,
    padding = 20,
    fontSize = 24,
    fontFamily = 'Arial',
    color = '#FFFFFF',
    backgroundColor = null,
    backgroundOpacity = 0,
    tileSpacing = 100,
    blendMode = 'source-over'
  } = config;

  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext('2d');

  // Draw original image
  ctx.drawImage(canvas, 0, 0);

  // Save context state
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = blendMode;

  if (type === WatermarkType.TEXT) {
    await applyTextWatermark(ctx, {
      text,
      position,
      padding,
      fontSize: fontSize * scale,
      fontFamily,
      color,
      rotation,
      backgroundColor,
      backgroundOpacity,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
  } else if (type === WatermarkType.IMAGE || type === WatermarkType.LOGO) {
    await applyImageWatermark(ctx, image, {
      position,
      padding,
      scale,
      rotation,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
  }

  ctx.restore();
  return output;
}

/**
 * Apply text watermark
 */
async function applyTextWatermark(ctx, config) {
  const {
    text,
    position,
    padding,
    fontSize,
    fontFamily,
    color,
    rotation,
    backgroundColor,
    backgroundOpacity,
    canvasWidth,
    canvasHeight
  } = config;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
  const textHeight = fontSize * lines.length;

  let x, y;
  const pos = getPositionCoordinates(position, canvasWidth, canvasHeight, textWidth, textHeight, padding);

  if (position === WatermarkPosition.TILE) {
    await applyTiledTextWatermark(ctx, {
      text,
      fontSize,
      fontFamily,
      color,
      rotation: rotation || -30,
      spacing: 150,
      canvasWidth,
      canvasHeight
    });
    return;
  }

  x = pos.x;
  y = pos.y;

  // Draw background if specified
  if (backgroundColor) {
    ctx.save();
    ctx.globalAlpha = backgroundOpacity;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x - padding / 2, y - textHeight - padding / 2, textWidth + padding, textHeight + padding);
    ctx.restore();
  }

  // Apply rotation
  if (rotation) {
    ctx.translate(x + textWidth / 2, y - textHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-(x + textWidth / 2), -(y - textHeight / 2));
  }

  // Draw text lines
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y - textHeight + fontSize + (index * fontSize));
  });
}

/**
 * Apply image watermark
 */
async function applyImageWatermark(ctx, image, config) {
  const {
    position,
    padding,
    scale,
    rotation,
    canvasWidth,
    canvasHeight
  } = config;

  if (!image) return;

  // Load image if it's a URL or File
  let imgElement = image;
  if (typeof image === 'string' || image instanceof File) {
    imgElement = await loadImage(image);
  }

  // Calculate scaled dimensions
  const baseWidth = Math.min(canvasWidth * 0.3, imgElement.width);
  const aspectRatio = imgElement.height / imgElement.width;
  const scaledWidth = baseWidth * scale;
  const scaledHeight = scaledWidth * aspectRatio;

  if (position === WatermarkPosition.TILE) {
    await applyTiledImageWatermark(ctx, imgElement, {
      scaledWidth,
      scaledHeight,
      spacing: 150,
      canvasWidth,
      canvasHeight
    });
    return;
  }

  const pos = getPositionCoordinates(position, canvasWidth, canvasHeight, scaledWidth, scaledHeight, padding);

  ctx.save();

  // Apply rotation
  if (rotation) {
    ctx.translate(pos.x + scaledWidth / 2, pos.y + scaledHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imgElement, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
  } else {
    ctx.drawImage(imgElement, pos.x, pos.y, scaledWidth, scaledHeight);
  }

  ctx.restore();
}

/**
 * Get position coordinates based on position string
 */
function getPositionCoordinates(position, canvasWidth, canvasHeight, elementWidth, elementHeight, padding) {
  switch (position) {
    case WatermarkPosition.TOP_LEFT:
      return { x: padding, y: elementHeight + padding };
    case WatermarkPosition.TOP_CENTER:
      return { x: (canvasWidth - elementWidth) / 2, y: elementHeight + padding };
    case WatermarkPosition.TOP_RIGHT:
      return { x: canvasWidth - elementWidth - padding, y: elementHeight + padding };
    case WatermarkPosition.MIDDLE_LEFT:
      return { x: padding, y: (canvasHeight + elementHeight) / 2 };
    case WatermarkPosition.CENTER:
      return { x: (canvasWidth - elementWidth) / 2, y: (canvasHeight + elementHeight) / 2 };
    case WatermarkPosition.MIDDLE_RIGHT:
      return { x: canvasWidth - elementWidth - padding, y: (canvasHeight + elementHeight) / 2 };
    case WatermarkPosition.BOTTOM_LEFT:
      return { x: padding, y: canvasHeight - elementHeight - padding };
    case WatermarkPosition.BOTTOM_CENTER:
      return { x: (canvasWidth - elementWidth) / 2, y: canvasHeight - elementHeight - padding };
    case WatermarkPosition.BOTTOM_RIGHT:
    default:
      return { x: canvasWidth - elementWidth - padding, y: canvasHeight - elementHeight - padding };
  }
}

/**
 * Apply tiled text watermark
 */
async function applyTiledTextWatermark(ctx, config) {
  const { text, fontSize, fontFamily, color, rotation, spacing, canvasWidth, canvasHeight } = config;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;

  const textWidth = ctx.measureText(text).width;
  const diagonal = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2);

  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

  for (let x = -diagonal; x < diagonal * 2; x += textWidth + spacing) {
    for (let y = -diagonal; y < diagonal * 2; y += fontSize + spacing) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}

/**
 * Apply tiled image watermark
 */
async function applyTiledImageWatermark(ctx, image, config) {
  const { scaledWidth, scaledHeight, spacing, canvasWidth, canvasHeight } = config;

  for (let x = 0; x < canvasWidth; x += scaledWidth + spacing) {
    for (let y = 0; y < canvasHeight; y += scaledHeight + spacing) {
      ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    }
  }
}

/**
 * Load image from URL or File
 */
async function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Create watermark preset configurations
 */
export const WatermarkPresets = {
  // Discreet corner watermark
  discreet: {
    opacity: 0.3,
    scale: 0.5,
    position: WatermarkPosition.BOTTOM_RIGHT,
    padding: 30
  },

  // Bold centered watermark
  bold: {
    opacity: 0.15,
    scale: 1.5,
    position: WatermarkPosition.CENTER,
    rotation: -45
  },

  // Tiled protection
  tiled: {
    opacity: 0.1,
    scale: 0.8,
    position: WatermarkPosition.TILE
  },

  // Professional logo placement
  professional: {
    opacity: 0.8,
    scale: 0.3,
    position: WatermarkPosition.BOTTOM_RIGHT,
    padding: 40
  },

  // Copyright style
  copyright: {
    opacity: 0.6,
    fontSize: 14,
    position: WatermarkPosition.BOTTOM_CENTER,
    padding: 20
  }
};

/**
 * Remove watermark (basic - works best with known positions)
 * Note: True watermark removal requires AI inpainting
 */
export async function removeWatermark(canvas, watermarkArea) {
  const { x, y, width, height } = watermarkArea;
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext('2d');

  // Draw original
  ctx.drawImage(canvas, 0, 0);

  // Get surrounding pixels for basic inpainting
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  // Simple blur-based removal (not perfect, but functional)
  for (let i = 0; i < data.length; i += 4) {
    // Average with surrounding pixels
    data[i] = (data[i] + data[Math.max(0, i - 4)]) / 2;
    data[i + 1] = (data[i + 1] + data[Math.max(0, i + 4 - 4)]) / 2;
    data[i + 2] = (data[i + 2] + data[Math.max(0, i + 8 - 4)]) / 2;
  }

  ctx.putImageData(imageData, x, y);
  return output;
}

/**
 * Batch apply watermark to multiple canvases
 */
export async function batchApplyWatermark(canvases, config) {
  const results = [];
  for (const canvas of canvases) {
    const watermarked = await applyWatermark(canvas, config);
    results.push(watermarked);
  }
  return results;
}

export default {
  applyWatermark,
  removeWatermark,
  batchApplyWatermark,
  WatermarkPosition,
  WatermarkType,
  WatermarkPresets
};
