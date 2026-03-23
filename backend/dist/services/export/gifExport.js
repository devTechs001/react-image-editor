// backend/src/services/export/gifExport.js
const sharp = require('sharp');
const {
  spawn
} = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

/**
 * Export project as GIF animation
 * @param {Object} project - Project document
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Exported GIF buffer and metadata
 */
async function exportGif(project, options = {}) {
  const {
    fps = 10,
    quality = 80,
    width,
    height,
    colors = 256,
    dither = true
  } = options;
  try {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gif-export-'));
    const frames = [];

    // Generate frames from animation timeline
    if (project.animation?.keyframes && project.animation.keyframes.length > 0) {
      // For projects with animation, generate multiple frames
      const duration = project.animation.duration || 5000; // 5 seconds default
      const totalFrames = Math.floor(duration / 1000 * fps);
      for (let i = 0; i < totalFrames; i++) {
        const time = i / totalFrames * duration;
        const framePath = path.join(tempDir, `frame-${i.toString().padStart(4, '0')}.png`);

        // Render frame at specific time (simplified)
        await renderFrameAtTime(project, time, framePath, options);
        frames.push(framePath);
      }
    } else {
      // Static project - create a simple animated GIF (e.g., pulse effect)
      const frameCount = 10;
      for (let i = 0; i < frameCount; i++) {
        const framePath = path.join(tempDir, `frame-${i.toString().padStart(4, '0')}.png`);
        await renderFrameAtTime(project, i * 100, framePath, options);
        frames.push(framePath);
      }
    }

    // Use ffmpeg to create GIF
    const outputPath = path.join(tempDir, 'output.gif');
    await runFfmpeg(frames, outputPath, {
      fps,
      quality,
      colors,
      dither
    });

    // Read the resulting GIF
    const gifBuffer = await fs.readFile(outputPath);

    // Cleanup temp files
    await fs.rm(tempDir, {
      recursive: true,
      force: true
    });
    return {
      buffer: gifBuffer,
      size: gifBuffer.length,
      mimeType: 'image/gif',
      dimensions: {
        width: width || project.canvas?.width || 1920,
        height: height || project.canvas?.height || 1080
      },
      format: 'gif',
      frames: frames.length,
      duration: frames.length / fps * 1000
    };
  } catch (error) {
    throw new Error(`GIF export failed: ${error.message}`);
  }
}

/**
 * Render a single frame at a specific time
 */
async function renderFrameAtTime(project, time, outputPath, options) {
  // This is a simplified implementation
  // In production, this would evaluate all animations at the given time

  const canvasWidth = options.width || project.canvas?.width || 1920;
  const canvasHeight = options.height || project.canvas?.height || 1080;
  const backgroundColor = project.canvas?.backgroundColor || '#ffffff';

  // Create frame with sharp
  await sharp({
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
  }).png().toFile(outputPath);
}

/**
 * Run ffmpeg to create GIF from frames
 */
function runFfmpeg(frames, outputPath, options) {
  return new Promise((resolve, reject) => {
    const {
      fps,
      quality,
      colors,
      dither
    } = options;

    // Create frame pattern for ffmpeg
    const framePattern = path.join(path.dirname(frames[0]), 'frame-%04d.png');
    const args = ['-framerate', fps.toString(), '-i', framePattern, '-vf', `split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=${dither ? 'bayer:bayer_scale=5' : 'none'}`, '-y', outputPath];
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
module.exports = {
  exportGif
};