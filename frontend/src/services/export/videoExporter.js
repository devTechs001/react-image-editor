// frontend/src/services/export/videoExporter.js
import { ImageFormat } from './imageExporter';

/**
 * Video Export Service
 * Handles video export in various formats with encoding options
 */

export const VideoFormat = {
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  AVI: 'video/avi',
  MOV: 'video/quicktime',
  GIF: 'image/gif'
};

export const VideoCodec = {
  H264: 'H264',
  H265: 'H265',
  VP8: 'VP8',
  VP9: 'VP9',
  AV1: 'AV1'
};

export const VideoQuality = {
  LOW: { width: 640, height: 360, bitrate: 500000 },
  MEDIUM: { width: 1280, height: 720, bitrate: 2500000 },
  HIGH: { width: 1920, height: 1080, bitrate: 5000000 },
  ULTRA: { width: 3840, height: 2160, bitrate: 20000000 }
};

/**
 * Export canvas frames as video
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Array<Object>} frames - Array of frame configurations
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} - Video blob
 */
export async function exportCanvasVideo(canvas, frames, options = {}) {
  const {
    format = VideoFormat.WEBM,
    quality = VideoQuality.HIGH,
    fps = 30,
    mimeType = 'video/webm;codecs=vp9'
  } = options;

  // Check for MediaRecorder support
  if (!supportsMediaRecorder()) {
    throw new Error('MediaRecorder is not supported in this browser');
  }

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: quality.bitrate
  });

  const chunks = [];
  
  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: format });
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      reject(e.error);
    };

    // Start recording
    mediaRecorder.start(100); // Collect data every 100ms

    // Render frames
    renderFrames(canvas, frames, fps).then(() => {
      mediaRecorder.stop();
    });
  });
}

/**
 * Render frames to canvas for video export
 */
async function renderFrames(canvas, frames, fps) {
  const ctx = canvas.getContext('2d');
  const frameDuration = 1000 / fps;

  for (const frame of frames) {
    const startTime = Date.now();

    // Clear and render frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (frame.image) {
      ctx.drawImage(frame.image, frame.x || 0, frame.y || 0, frame.width || canvas.width, frame.height || canvas.height);
    }

    if (frame.text) {
      ctx.font = frame.font || '24px Arial';
      ctx.fillStyle = frame.color || '#FFFFFF';
      ctx.fillText(frame.text, frame.textX || 0, frame.textY || 50);
    }

    // Wait for frame duration
    const elapsed = Date.now() - startTime;
    if (elapsed < frameDuration) {
      await sleep(frameDuration - elapsed);
    }
  }
}

/**
 * Export animation as GIF
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Array<ImageData>} frames - Array of frame data
 * @param {Object} options - GIF options
 * @returns {Promise<Blob>} - GIF blob
 */
export async function exportGif(canvas, frames, options = {}) {
  const {
    fps = 15,
    width = canvas.width,
    height = canvas.height,
    quality = 10
  } = options;

  // Use GIF encoder (simplified - would use gif.js library in production)
  const gifEncoder = await loadGifEncoder();
  
  if (gifEncoder) {
    return await encodeGifWithLibrary(gifEncoder, frames, { width, height, fps, quality });
  }

  // Fallback: create APNG
  return await exportApng(canvas, frames, fps);
}

/**
 * Load GIF encoder library
 */
async function loadGifEncoder() {
  // Try to load gif.js dynamically
  if (window.GIF) {
    return window.GIF;
  }

  try {
    const script = document.createElement('script');
    script.src = '/wasm/gif.js';
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
    
    return window.GIF;
  } catch (error) {
    console.warn('GIF encoder not available:', error);
    return null;
  }
}

/**
 * Encode GIF using library
 */
async function encodeGifWithLibrary(GIF, frames, options) {
  const gif = new GIF({
    width: options.width,
    height: options.height,
    quality: options.quality,
    workerScript: '/wasm/gif.worker.js',
    fps: options.fps
  });

  for (const frame of frames) {
    gif.addFrame(frame, { copy: true, delay: 1000 / options.fps });
  }

  return new Promise((resolve) => {
    gif.on('finished', (blob) => {
      resolve(blob);
    });
    gif.render();
  });
}

/**
 * Export as APNG (Animated PNG)
 */
async function exportApng(canvas, frames, fps) {
  // Simplified APNG export
  // Full implementation would use apng-js library
  const chunks = [];
  
  for (const frame of frames) {
    const blob = await canvasToBlob(canvas);
    chunks.push(blob);
  }

  // Return first frame as placeholder
  // Full APNG would combine all frames
  return chunks[0] || await canvasToBlob(canvas);
}

/**
 * Export video with audio track
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {AudioBuffer} audioBuffer - Audio to include
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} - Video with audio blob
 */
export async function exportVideoWithAudio(canvas, audioBuffer, options = {}) {
  const { fps = 30, format = VideoFormat.WEBM } = options;

  const stream = canvas.captureStream(fps);
  
  // Create audio stream from AudioBuffer
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  const destination = audioContext.createMediaStreamDestination();
  source.connect(destination);
  
  // Add audio track to video stream
  stream.addTrack(destination.stream.getAudioTracks()[0]);
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9,opus',
    videoBitsPerSecond: VideoQuality.HIGH.bitrate
  });

  const chunks = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: format }));
    };

    mediaRecorder.onerror = (e) => reject(e.error);

    mediaRecorder.start(100);
    source.start(0);

    source.onended = () => {
      mediaRecorder.stop();
    };
  });
}

/**
 * Export timeline as video
 * @param {Object} timeline - Timeline configuration
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} options - Export options
 * @returns {Promise<Blob>} - Video blob
 */
export async function exportTimeline(timeline, canvas, options = {}) {
  const { fps = 30, quality = VideoQuality.HIGH } = options;
  
  const duration = timeline.duration || 10; // seconds
  const totalFrames = Math.floor(duration * fps);
  const frames = [];

  // Generate frames from timeline
  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    const frameState = evaluateTimeline(timeline, time);
    frames.push(frameState);
  }

  return await exportCanvasVideo(canvas, frames, { ...options, fps, quality });
}

/**
 * Evaluate timeline at specific time
 */
function evaluateTimeline(timeline, time) {
  const state = {
    image: null,
    text: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  // Find active layer at this time
  for (const layer of timeline.layers || []) {
    if (time >= layer.startTime && time <= layer.endTime) {
      const progress = (time - layer.startTime) / (layer.endTime - layer.startTime);
      
      if (layer.type === 'image' && layer.image) {
        state.image = layer.image;
        state.x = interpolate(layer.x || 0, layer.endX || 0, progress);
        state.y = interpolate(layer.y || 0, layer.endY || 0, progress);
        state.width = interpolate(layer.width || 0, layer.endWidth || 0, progress);
        state.height = interpolate(layer.height || 0, layer.endHeight || 0, progress);
      }
      
      if (layer.type === 'text' && layer.text) {
        state.text = layer.text;
        state.textX = interpolate(layer.textX || 0, layer.endTextX || 0, progress);
        state.textY = interpolate(layer.textY || 0, layer.endTextY || 0, progress);
      }
    }
  }

  return state;
}

/**
 * Interpolate between two values
 */
function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

/**
 * Extract frames from video
 * @param {File|Blob} videoFile - Video file
 * @param {Object} options - Extraction options
 * @returns {Promise<Array<HTMLCanvasElement>>} - Array of frame canvases
 */
export async function extractFramesFromVideo(videoFile, options = {}) {
  const { fps = 1, startTime = 0, endTime = null } = options;
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    
    video.onloadedmetadata = () => {
      const duration = endTime || video.duration;
      const frameInterval = 1 / fps;
      const frames = [];
      let currentTime = startTime;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const extractFrame = () => {
        if (currentTime >= duration) {
          URL.revokeObjectObjectURL(url);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        frames.push(canvas.cloneNode(true));
        currentTime += frameInterval;
        extractFrame();
      };

      extractFrame();
    };

    video.onerror = reject;
  });
}

/**
 * Check MediaRecorder support
 */
function supportsMediaRecorder() {
  return typeof MediaRecorder !== 'undefined';
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Canvas to blob helper
 */
async function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, ImageFormat.PNG);
  });
}

/**
 * Get supported video MIME types
 */
export function getSupportedVideoTypes() {
  const types = [];
  
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    types.push('video/webm;codecs=vp9');
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    types.push('video/webm;codecs=vp8');
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
    types.push('video/webm;codecs=h264');
  }
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    types.push('video/mp4');
  }

  return types;
}

/**
 * Download video blob
 */
export function downloadVideo(blob, filename = 'export') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const extension = getVideoExtension(blob.type);
  link.download = `${filename}.${extension}`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectObjectURL(url), 100);
}

/**
 * Get video extension from MIME type
 */
function getVideoExtension(mimeType) {
  const extensions = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/avi': 'avi',
    'video/quicktime': 'mov',
    'image/gif': 'gif'
  };
  return extensions[mimeType] || 'webm';
}

export default {
  exportCanvasVideo,
  exportGif,
  exportVideoWithAudio,
  exportTimeline,
  extractFramesFromVideo,
  downloadVideo,
  getSupportedVideoTypes,
  VideoFormat,
  VideoCodec,
  VideoQuality
};
