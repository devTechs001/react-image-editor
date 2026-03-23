// backend/src/services/video/processor.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const {
  v4: uuidv4
} = require('uuid');
const {
  uploadToStorage,
  getSignedDownloadUrl
} = require('../storage/s3Storage');
const tempDir = path.join(__dirname, '../../../temp');

// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    await fs.mkdir(tempDir, {
      recursive: true
    });
  } catch (error) {
    // Directory exists
  }
};

// Get video info
const getVideoInfo = async inputPath => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitrate: metadata.format.bit_rate,
        format: metadata.format.format_name,
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate),
          bitrate: videoStream.bit_rate
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          channels: audioStream.channels,
          sampleRate: audioStream.sample_rate,
          bitrate: audioStream.bit_rate
        } : null
      });
    });
  });
};

// Trim video
const trim = async (inputPath, startTime, endTime, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).setStartTime(startTime).setDuration(endTime - startTime).output(output).outputOptions(['-c:v copy', '-c:a copy']).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Merge videos
const merge = async (inputPaths, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);
  const listFile = path.join(tempDir, `${uuidv4()}.txt`);

  // Create concat list file
  const listContent = inputPaths.map(p => `file '${p}'`).join('\n');
  await fs.writeFile(listFile, listContent);
  return new Promise((resolve, reject) => {
    ffmpeg().input(listFile).inputOptions(['-f concat', '-safe 0']).output(output).outputOptions(['-c copy']).on('end', async () => {
      await fs.unlink(listFile);
      resolve(output);
    }).on('error', reject).run();
  });
};

// Add transition between clips
const addTransition = async (clip1Path, clip2Path, transitionType = 'fade', duration = 1) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp4`);
  const filterComplex = transitionType === 'fade' ? `[0:v][1:v]xfade=transition=fade:duration=${duration}:offset=auto[v];[0:a][1:a]acrossfade=d=${duration}[a]` : `[0:v][1:v]xfade=transition=${transitionType}:duration=${duration}:offset=auto[v];[0:a][1:a]acrossfade=d=${duration}[a]`;
  return new Promise((resolve, reject) => {
    ffmpeg().input(clip1Path).input(clip2Path).complexFilter(filterComplex).outputOptions(['-map [v]', '-map [a]']).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Apply filter/effect
const applyFilter = async (inputPath, filter, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);
  const filters = {
    grayscale: 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
    sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
    negative: 'negate',
    blur: 'boxblur=5:5',
    sharpen: 'unsharp=5:5:1.0:5:5:0.0',
    vintage: 'curves=vintage',
    vignette: 'vignette',
    mirror: 'hflip',
    flip: 'vflip',
    rotate90: 'transpose=1',
    rotate180: 'transpose=1,transpose=1',
    rotate270: 'transpose=2'
  };
  const videoFilter = filters[filter] || filter;
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).videoFilters(videoFilter).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Resize video
const resize = async (inputPath, width, height, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).size(`${width}x${height}`).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Change speed
const changeSpeed = async (inputPath, speed, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp4`);
  const videoSpeed = 1 / speed;
  const audioSpeed = speed;
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).videoFilters(`setpts=${videoSpeed}*PTS`).audioFilters(`atempo=${audioSpeed}`).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Add text overlay
const addTextOverlay = async (inputPath, text, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp4`);
  const {
    x = '(w-text_w)/2',
    y = '(h-text_h)/2',
    fontSize = 48,
    fontColor = 'white',
    fontFile = null,
    startTime = 0,
    endTime = null
  } = options;
  let drawText = `drawtext=text='${text}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}`;
  if (fontFile) {
    drawText += `:fontfile=${fontFile}`;
  }
  if (startTime > 0 || endTime !== null) {
    drawText += `:enable='between(t,${startTime},${endTime || 9999})'`;
  }
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).videoFilters(drawText).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Add image overlay (watermark)
const addImageOverlay = async (inputPath, imagePath, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp4`);
  const {
    x = 10,
    y = 10,
    scale = 1,
    opacity = 1
  } = options;
  const overlayFilter = `[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${opacity}[ovr];[0:v][ovr]overlay=${x}:${y}`;
  return new Promise((resolve, reject) => {
    ffmpeg().input(inputPath).input(imagePath).complexFilter(overlayFilter).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Extract frames
const extractFrames = async (inputPath, options = {}) => {
  await ensureTempDir();
  const outputDir = path.join(tempDir, uuidv4());
  await fs.mkdir(outputDir);
  const {
    fps = 1,
    startTime = 0,
    duration = null
  } = options;
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath).outputOptions([`-vf fps=${fps}`]).output(`${outputDir}/frame-%04d.jpg`);
    if (startTime > 0) {
      cmd = cmd.setStartTime(startTime);
    }
    if (duration) {
      cmd = cmd.setDuration(duration);
    }
    cmd.on('end', async () => {
      const files = await fs.readdir(outputDir);
      const framePaths = files.map(f => path.join(outputDir, f)).sort();
      resolve(framePaths);
    }).on('error', reject).run();
  });
};

// Generate thumbnail
const generateThumbnail = async (inputPath, timestamp = 0, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.jpg`);
  const {
    width = 320,
    height = 180
  } = options;
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).screenshots({
      timestamps: [timestamp],
      filename: path.basename(output),
      folder: path.dirname(output),
      size: `${width}x${height}`
    }).on('end', () => resolve(output)).on('error', reject);
  });
};

// Compress video
const compress = async (inputPath, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp4`);
  const {
    crf = 23,
    // 0-51, lower = better quality
    preset = 'medium',
    // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
    maxBitrate = null,
    audioBitrate = '128k'
  } = options;
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath).videoCodec('libx264').audioCodec('aac').outputOptions([`-crf ${crf}`, `-preset ${preset}`, `-b:a ${audioBitrate}`]);
    if (maxBitrate) {
      cmd = cmd.outputOptions([`-maxrate ${maxBitrate}`, `-bufsize ${maxBitrate}`]);
    }
    cmd.output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Convert format
const convert = async (inputPath, outputFormat, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.${outputFormat}`);
  const formatOptions = {
    mp4: ['-c:v libx264', '-c:a aac'],
    webm: ['-c:v libvpx-vp9', '-c:a libopus'],
    gif: ['-vf fps=10,scale=480:-1:flags=lanczos', '-loop 0'],
    mov: ['-c:v prores_ks', '-c:a pcm_s16le']
  };
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).outputOptions(formatOptions[outputFormat] || []).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Export video project
const exportVideo = async (project, settings, onProgress) => {
  await ensureTempDir();
  const {
    format = 'mp4',
    quality = 'high',
    resolution = 'original',
    fps = null
  } = settings;

  // Quality presets
  const qualityPresets = {
    high: {
      crf: 18,
      preset: 'slow'
    },
    medium: {
      crf: 23,
      preset: 'medium'
    },
    low: {
      crf: 28,
      preset: 'fast'
    }
  };
  const preset = qualityPresets[quality] || qualityPresets.medium;
  try {
    onProgress?.(10);

    // Build video from project layers/timeline
    // This is a simplified version - actual implementation would be more complex
    const outputPath = path.join(tempDir, `${project._id}-${Date.now()}.${format}`);

    // Process video based on project data
    // ... complex video composition logic ...

    onProgress?.(70);

    // Compress and finalize
    const finalPath = await compress(outputPath, {
      crf: preset.crf,
      preset: preset.preset
    });
    onProgress?.(90);

    // Upload to storage
    const buffer = await fs.readFile(finalPath);
    const key = `exports/${project._id}/${Date.now()}.${format}`;
    const url = await uploadToStorage(buffer, key, `video/${format}`);

    // Get file info
    const info = await getVideoInfo(finalPath);

    // Cleanup temp files
    await fs.unlink(finalPath);
    if (finalPath !== outputPath) {
      await fs.unlink(outputPath).catch(() => {});
    }
    onProgress?.(100);
    return {
      url,
      size: info.size,
      duration: info.duration,
      dimensions: {
        width: info.video?.width,
        height: info.video?.height
      }
    };
  } catch (error) {
    throw new Error(`Video export failed: ${error.message}`);
  }
};

// Cleanup temp files
const cleanup = async paths => {
  for (const p of paths) {
    try {
      await fs.unlink(p);
    } catch (error) {
      // Ignore errors
    }
  }
};
module.exports = {
  getVideoInfo,
  trim,
  merge,
  addTransition,
  applyFilter,
  resize,
  changeSpeed,
  addTextOverlay,
  addImageOverlay,
  extractFrames,
  generateThumbnail,
  compress,
  convert,
  export: exportVideo,
  cleanup
};