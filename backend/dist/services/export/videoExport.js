// backend/src/services/export/videoExport.js
const {
  spawn
} = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const sharp = require('sharp');

/**
 * Export project as video
 * @param {Object} project - Project document
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Exported video buffer and metadata
 */
async function exportVideo(project, options = {}) {
  const {
    format = 'mp4',
    quality = 'high',
    fps = 30,
    width,
    height,
    bitrate = '5M'
  } = options;
  try {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-export-'));
    const frames = [];

    // Generate frames from animation timeline
    const duration = project.animation?.duration || 5000;
    const totalFrames = Math.floor(duration / 1000 * fps);
    for (let i = 0; i < totalFrames; i++) {
      const time = i / totalFrames * duration;
      const framePath = path.join(tempDir, `frame-${i.toString().padStart(6, '0')}.png`);
      await renderFrameAtTime(project, time, framePath, {
        width,
        height
      });
      frames.push(framePath);
    }

    // Create video using ffmpeg
    const outputPath = path.join(tempDir, `output.${format}`);
    await runFfmpegVideo(frames, outputPath, {
      fps,
      quality,
      bitrate,
      format
    });

    // Read the resulting video
    const videoBuffer = await fs.readFile(outputPath);

    // Cleanup temp files
    await fs.rm(tempDir, {
      recursive: true,
      force: true
    });
    return {
      buffer: videoBuffer,
      size: videoBuffer.length,
      mimeType: getVideoMimeType(format),
      dimensions: {
        width: width || project.canvas?.width || 1920,
        height: height || project.canvas?.height || 1080
      },
      format,
      duration: totalFrames / fps * 1000,
      fps
    };
  } catch (error) {
    throw new Error(`Video export failed: ${error.message}`);
  }
}

/**
 * Render frame at specific time
 */
async function renderFrameAtTime(project, time, outputPath, options) {
  const canvasWidth = options.width || project.canvas?.width || 1920;
  const canvasHeight = options.height || project.canvas?.height || 1080;
  const backgroundColor = project.canvas?.backgroundColor || '#000000';

  // Create frame with sharp
  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: parseColor(backgroundColor)
    }
  }).png().toFile(outputPath);
}

/**
 * Run ffmpeg to create video
 */
function runFfmpegVideo(frames, outputPath, options) {
  return new Promise((resolve, reject) => {
    const {
      fps,
      quality,
      bitrate,
      format
    } = options;
    const framePattern = path.join(path.dirname(frames[0]), 'frame-%06d.png');

    // Quality presets
    const qualityPresets = {
      low: '28',
      medium: '23',
      high: '18',
      ultra: '15'
    };
    const crf = qualityPresets[quality] || '18';
    const args = ['-framerate', fps.toString(), '-i', framePattern, '-c:v', format === 'webm' ? 'libvpx-vp9' : 'libx264', '-crf', crf, '-b:v', bitrate, '-pix_fmt', 'yuv420p', '-y', outputPath];
    if (format === 'webm') {
      args.push('-b:a', '128k');
    }
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.stdout.on('data', data => {
      console.log(`ffmpeg: ${data}`);
    });
    ffmpeg.stderr.on('data', data => {
      console.error(`ffmpeg stderr: ${data}`);
    });
    ffmpeg.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', err => {
      reject(err);
    });
  });
}

/**
 * Get MIME type for video format
 */
function getVideoMimeType(format) {
  const types = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo'
  };
  return types[format] || 'video/mp4';
}

/**
 * Parse color string to RGB object
 */
function parseColor(color) {
  const hex = color.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16) || 0,
    g: parseInt(hex.substring(2, 4), 16) || 0,
    b: parseInt(hex.substring(4, 6), 16) || 0,
    alpha: 1
  };
}
module.exports = {
  exportVideo
};