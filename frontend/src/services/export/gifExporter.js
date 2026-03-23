// frontend/src/services/export/gifExporter.js
import { ImageFormat } from './imageExporter';

/**
 * GIF Export Service
 * Handles GIF encoding with optimization options
 */

export const GifQuality = {
  LOW: { colors: 64, dither: false },
  MEDIUM: { colors: 128, dither: true },
  HIGH: { colors: 256, dither: true },
  BEST: { colors: 256, dither: 'FloydSteinberg' }
};

export const GifDisposal = {
  NONE: 0,
  BACKGROUND: 1,
  PREVIOUS: 2,
  KEEP: 3
};

/**
 * Export frames as GIF
 * @param {Array<HTMLCanvasElement|ImageData>} frames - Array of frames
 * @param {Object} options - GIF options
 * @returns {Promise<Blob>} - GIF blob
 */
export async function exportGif(frames, options = {}) {
  const {
    width,
    height,
    fps = 10,
    quality = GifQuality.HIGH,
    loop = true,
    disposal = GifDisposal.NONE
  } = options;

  // Determine dimensions from first frame
  const frameWidth = width || (frames[0] instanceof HTMLCanvasElement ? frames[0].width : frames[0].width);
  const frameHeight = height || (frames[0] instanceof HTMLCanvasElement ? frames[0].height : frames[0].height);

  // Try to use gif.js library
  if (window.GIF || await tryLoadGifLibrary()) {
    return await encodeWithGifJs(frames, { width: frameWidth, height: frameHeight, fps, quality, loop });
  }

  // Fallback to manual encoding
  return await encodeGifManual(frames, { width: frameWidth, height: frameHeight, fps, quality });
}

/**
 * Try to load gif.js library
 */
async function tryLoadGifLibrary() {
  if (window.GIF) return true;

  try {
    // Load main GIF library
    await loadScript('/wasm/gif.js');
    return !!window.GIF;
  } catch (error) {
    console.warn('gif.js not available, using fallback:', error);
    return false;
  }
}

/**
 * Load script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Encode GIF using gif.js
 */
async function encodeWithGifJs(frames, options) {
  const { width, height, fps, quality, loop } = options;
  const delay = Math.round(1000 / fps);

  const gif = new window.GIF({
    width,
    height,
    quality: Math.round((256 - quality.colors) / 256 * 10),
    workerScript: '/wasm/gif.worker.js',
    workers: 2,
    repeat: loop ? 0 : null
  });

  // Add frames
  for (const frame of frames) {
    const canvas = frame instanceof HTMLCanvasElement ? frame : imageDataToCanvas(frame);
    gif.addFrame(canvas, { 
      copy: true, 
      delay,
      dispose: GifDisposal.NONE
    });
  }

  return new Promise((resolve, reject) => {
    gif.on('finished', (blob) => {
      resolve(blob);
    });
    gif.on('failed', (error) => {
      reject(error);
    });
    gif.render();
  });
}

/**
 * Manual GIF encoding (simplified LZW-based)
 * This is a basic implementation - production would use a library
 */
async function encodeGifManual(frames, options) {
  const { width, height, fps, quality } = options;
  const delay = Math.round(1000 / fps);

  // Convert frames to ImageData
  const imageDataFrames = frames.map(frame => {
    if (frame instanceof ImageData) return frame;
    if (frame instanceof HTMLCanvasElement) {
      return frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
    }
    return frame;
  });

  // Quantize colors
  const quantizedFrames = imageDataFrames.map(frame => 
    quantizeColors(frame, quality.colors)
  );

  // Create GIF structure
  const gifData = createGifStructure(quantizedFrames, { width, height, delay, quality });

  return new Blob([gifData], { type: ImageFormat.GIF });
}

/**
 * Convert ImageData to canvas
 */
function imageDataToCanvas(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Color quantization using median cut algorithm
 */
function quantizeColors(imageData, colorCount) {
  const data = imageData.data;
  const pixels = [];

  // Collect unique colors
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a > 0) {
      pixels.push({ r, g, b, a });
    }
  }

  // Simple quantization (simplified median cut)
  const colorMap = new Map();
  const quantizedData = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / (256 / colorCount)) * (256 / colorCount);
    const g = Math.round(data[i + 1] / (256 / colorCount)) * (256 / colorCount);
    const b = Math.round(data[i + 2] / (256 / colorCount)) * (256 / colorCount);
    
    const key = `${r},${g},${b}`;
    if (!colorMap.has(key)) {
      colorMap.set(key, colorMap.size);
    }

    quantizedData[i] = r;
    quantizedData[i + 1] = g;
    quantizedData[i + 2] = b;
    quantizedData[i + 3] = data[i + 3];
  }

  return new ImageData(quantizedData, imageData.width, imageData.height);
}

/**
 * Create GIF file structure
 */
function createGifStructure(frames, options) {
  const { width, height, delay } = options;
  
  const chunks = [];

  // Header
  chunks.push(stringToBytes('GIF89a'));

  // Logical Screen Descriptor
  chunks.push(numberToLittleEndian(width, 2));
  chunks.push(numberToLittleEndian(height, 2));
  chunks.push(new Uint8Array([0x87, 0x00, 0x00])); // Global color table flag, bg color, aspect ratio

  // Global Color Table (black to white gradient, simplified)
  for (let i = 0; i < 256; i++) {
    chunks.push(new Uint8Array([i, i, i]));
  }

  // Image blocks
  for (const frame of frames) {
    // Graphic Control Extension
    chunks.push(new Uint8Array([0x21, 0xF9, 0x04]));
    chunks.push(new Uint8Array([0x00])); // Disposal method
    chunks.push(numberToLittleEndian(delay / 10, 2)); // Delay time
    chunks.push(new Uint8Array([0x00, 0x00])); // Transparent color index

    // Image Descriptor
    chunks.push(new Uint8Array([0x2C]));
    chunks.push(numberToLittleEndian(0, 2)); // Left position
    chunks.push(numberToLittleEndian(0, 2)); // Top position
    chunks.push(numberToLittleEndian(width, 2));
    chunks.push(numberToLittleEndian(height, 2));
    chunks.push(new Uint8Array([0x00])); // Local color table flag

    // Image Data (simplified - would need proper LZW compression)
    chunks.push(new Uint8Array([0x08])); // LZW minimum code size
    chunks.push(new Uint8Array([0x00])); // Block size
    chunks.push(new Uint8Array([0x00])); // Block terminator
  }

  // Trailer
  chunks.push(new Uint8Array([0x3B]));

  // Concatenate all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Convert number to little-endian bytes
 */
function numberToLittleEndian(num, bytes) {
  const result = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    result[i] = (num >> (i * 8)) & 0xFF;
  }
  return result;
}

/**
 * Convert string to bytes
 */
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Export canvas animation as GIF
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} animation - Animation configuration
 * @param {Object} options - GIF options
 * @returns {Promise<Blob>} - GIF blob
 */
export async function exportCanvasAnimation(canvas, animation, options = {}) {
  const { duration = 5, fps = 15 } = animation;
  const totalFrames = Math.floor(duration * fps);
  const frames = [];

  // Render animation frames
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render frame based on animation type
    if (animation.type === 'rotation') {
      renderRotationFrame(ctx, canvas, animation, progress);
    } else if (animation.type === 'fade') {
      renderFadeFrame(ctx, canvas, animation, progress);
    } else if (animation.type === 'slide') {
      renderSlideFrame(ctx, canvas, animation, progress);
    }

    frames.push(canvas.cloneNode(true));
  }

  return await exportGif(frames, options);
}

/**
 * Render rotation frame
 */
function renderRotationFrame(ctx, canvas, animation, progress) {
  const angle = (animation.fromAngle || 0) + progress * (animation.toAngle || 360);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  
  if (animation.image) {
    ctx.drawImage(animation.image, -canvas.width / 2, -canvas.height / 2);
  }
  
  ctx.restore();
}

/**
 * Render fade frame
 */
function renderFadeFrame(ctx, canvas, animation, progress) {
  const fromOpacity = animation.fromOpacity !== undefined ? animation.fromOpacity : 0;
  const toOpacity = animation.toOpacity !== undefined ? animation.toOpacity : 1;
  const opacity = fromOpacity + progress * (toOpacity - fromOpacity);
  
  ctx.globalAlpha = opacity;
  
  if (animation.image) {
    ctx.drawImage(animation.image, 0, 0);
  }
  
  ctx.globalAlpha = 1;
}

/**
 * Render slide frame
 */
function renderSlideFrame(ctx, canvas, animation, progress) {
  const fromX = animation.fromX || 0;
  const toX = animation.toX || canvas.width;
  const x = fromX + progress * (toX - fromX);
  
  const fromY = animation.fromY || 0;
  const toY = animation.toY || 0;
  const y = fromY + progress * (toY - fromY);
  
  if (animation.image) {
    ctx.drawImage(animation.image, x, y);
  }
}

/**
 * Create loading spinner GIF
 */
export async function createLoadingSpinnerGif(options = {}) {
  const {
    size = 64,
    lineWidth = 4,
    colors = ['#4F46E5', '#7C3AED', '#EC4899'],
    fps = 24,
    duration = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const frames = [];
  const totalFrames = fps * duration;

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    
    ctx.clearRect(0, 0, size, size);
    
    // Draw spinner
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(progress * Math.PI * 2);
    
    for (let j = 0; j < colors.length; j++) {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 - lineWidth, 
        (j / colors.length) * Math.PI * 2 - Math.PI / 6,
        (j / colors.length) * Math.PI * 2 + Math.PI / 6
      );
      ctx.strokeStyle = colors[j];
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    
    ctx.restore();
    
    frames.push(canvas.cloneNode(true));
  }

  return await exportGif(frames, { width: size, height: size, fps, quality: GifQuality.HIGH });
}

/**
 * Create animated text GIF
 */
export async function createAnimatedTextGif(text, options = {}) {
  const {
    width = 400,
    height = 100,
    fontSize = 32,
    fontFamily = 'Arial',
    color = '#FFFFFF',
    backgroundColor = '#1F2937',
    animation = 'typewriter',
    fps = 24
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const frames = [];
  const totalFrames = fps * 2; // 2 seconds

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    
    if (animation === 'typewriter') {
      const charIndex = Math.floor(progress * text.length);
      ctx.fillText(text.slice(0, charIndex), 20, height / 2);
    } else if (animation === 'fade') {
      ctx.globalAlpha = Math.sin(progress * Math.PI);
      ctx.fillText(text, 20, height / 2);
      ctx.globalAlpha = 1;
    } else if (animation === 'slide') {
      const x = (1 - progress) * width - 20;
      ctx.fillText(text, x, height / 2);
    }
    
    frames.push(canvas.cloneNode(true));
  }

  return await exportGif(frames, { width, height, fps, quality: GifQuality.HIGH });
}

/**
 * Download GIF
 */
export function downloadGif(blob, filename = 'animation') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.gif`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectObjectURL(url), 100);
}

export default {
  exportGif,
  exportCanvasAnimation,
  createLoadingSpinnerGif,
  createAnimatedTextGif,
  downloadGif,
  GifQuality,
  GifDisposal
};
