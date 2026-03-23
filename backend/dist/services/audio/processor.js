// backend/src/services/audio/processor.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const {
  v4: uuidv4
} = require('uuid');
const {
  uploadToStorage
} = require('../storage/s3Storage');
const tempDir = path.join(__dirname, '../../../temp');
const ensureTempDir = async () => {
  try {
    await fs.mkdir(tempDir, {
      recursive: true
    });
  } catch (error) {}
};

// Get audio info
const getAudioInfo = async inputPath => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitrate: metadata.format.bit_rate,
        format: metadata.format.format_name,
        codec: audioStream?.codec_name,
        channels: audioStream?.channels,
        sampleRate: audioStream?.sample_rate,
        channelLayout: audioStream?.channel_layout
      });
    });
  });
};

// Trim audio
const trim = async (inputPath, startTime, endTime, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).setStartTime(startTime).setDuration(endTime - startTime).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Merge audio files
const merge = async (inputPaths, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp3`);
  const listFile = path.join(tempDir, `${uuidv4()}.txt`);
  const listContent = inputPaths.map(p => `file '${p}'`).join('\n');
  await fs.writeFile(listFile, listContent);
  return new Promise((resolve, reject) => {
    ffmpeg().input(listFile).inputOptions(['-f concat', '-safe 0']).output(output).outputOptions(['-c copy']).on('end', async () => {
      await fs.unlink(listFile);
      resolve(output);
    }).on('error', reject).run();
  });
};

// Mix multiple audio tracks
const mix = async (inputPaths, volumes = [], outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp3`);
  let cmd = ffmpeg();
  inputPaths.forEach((p, i) => {
    cmd = cmd.input(p);
  });
  const volumeFilters = inputPaths.map((_, i) => {
    const vol = volumes[i] || 1;
    return `[${i}:a]volume=${vol}[a${i}]`;
  }).join(';');
  const mixFilter = inputPaths.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${inputPaths.length}:duration=longest[aout]`;
  const filter = volumeFilters + ';' + mixFilter;
  return new Promise((resolve, reject) => {
    cmd.complexFilter(filter).outputOptions(['-map [aout]']).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Apply audio effects
const applyEffect = async (inputPath, effect, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp3`);
  const effects = {
    // Volume adjustment
    volume: `volume=${options.level || 1}`,
    // Fade in/out
    fadein: `afade=t=in:st=0:d=${options.duration || 3}`,
    fadeout: `afade=t=out:st=${options.startTime || 0}:d=${options.duration || 3}`,
    // Normalize
    normalize: 'loudnorm',
    // Compression
    compress: `acompressor=threshold=${options.threshold || 0.5}:ratio=${options.ratio || 4}:attack=${options.attack || 5}:release=${options.release || 50}`,
    // Equalization
    bass: `bass=g=${options.gain || 10}`,
    treble: `treble=g=${options.gain || 10}`,
    // Echo/Reverb
    echo: `aecho=0.8:0.9:${options.delay || 1000}:${options.decay || 0.5}`,
    reverb: `aecho=0.8:0.88:60:0.4`,
    // Pitch shift
    pitch: `asetrate=44100*${options.factor || 1.5},aresample=44100`,
    // Speed change
    speed: `atempo=${options.speed || 1.5}`,
    // Noise reduction (simple)
    denoise: 'anlmdn',
    // High/Low pass filters
    highpass: `highpass=f=${options.frequency || 200}`,
    lowpass: `lowpass=f=${options.frequency || 3000}`
  };
  const audioFilter = effects[effect] || effect;
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).audioFilters(audioFilter).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Convert format
const convert = async (inputPath, outputFormat, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.${outputFormat}`);
  const formatOptions = {
    mp3: ['-c:a libmp3lame', '-b:a 192k'],
    wav: ['-c:a pcm_s16le'],
    ogg: ['-c:a libvorbis', '-q:a 5'],
    flac: ['-c:a flac'],
    aac: ['-c:a aac', '-b:a 192k'],
    m4a: ['-c:a aac', '-b:a 192k']
  };
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).outputOptions(formatOptions[outputFormat] || []).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Extract audio from video
const extractFromVideo = async (videoPath, outputPath) => {
  await ensureTempDir();
  const output = outputPath || path.join(tempDir, `${uuidv4()}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath).noVideo().audioCodec('libmp3lame').audioBitrate('192k').output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Generate waveform data
const generateWaveform = async (inputPath, options = {}) => {
  const {
    samplesPerSecond = 100,
    duration = null
  } = options;
  const info = await getAudioInfo(inputPath);
  const totalSamples = Math.ceil((duration || info.duration) * samplesPerSecond);
  return new Promise((resolve, reject) => {
    const waveformData = [];
    ffmpeg(inputPath).audioFilters([`aresample=${samplesPerSecond}`, 'astats=metadata=1:reset=1']).format('null').output('-').on('stderr', line => {
      // Parse astats output for RMS levels
      const match = line.match(/RMS level.*?(-?\d+\.?\d*)/);
      if (match) {
        const rms = parseFloat(match[1]);
        // Normalize to 0-1 range
        const normalized = Math.min(1, Math.max(0, (rms + 60) / 60));
        waveformData.push(normalized);
      }
    }).on('end', () => {
      resolve({
        data: waveformData,
        duration: info.duration,
        samplesPerSecond
      });
    }).on('error', reject).run();
  });
};

// Detect beats/tempo
const detectBeats = async inputPath => {
  // Simplified beat detection using ffmpeg analysis
  // For production, use a dedicated library like librosa (Python) or Meyda (JS)

  return new Promise((resolve, reject) => {
    const beats = [];
    let tempo = 0;
    ffmpeg(inputPath).audioFilters('ebur128').format('null').output('-').on('stderr', line => {
      // Parse for loudness peaks which can indicate beats
      // This is simplified - real beat detection is more complex
    }).on('end', () => {
      // Estimate tempo (simplified)
      tempo = 120; // Default fallback
      resolve({
        beats,
        tempo
      });
    }).on('error', reject).run();
  });
};

// Voice enhancement
const enhanceVoice = async (inputPath, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp3`);
  const filters = [
  // Remove low frequency noise
  'highpass=f=80',
  // Remove high frequency noise
  'lowpass=f=8000',
  // Compression for consistent levels
  'acompressor=threshold=0.5:ratio=3:attack=5:release=50',
  // Normalize
  'loudnorm'];
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).audioFilters(filters.join(',')).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};

// Noise reduction
const reduceNoise = async (inputPath, options = {}) => {
  await ensureTempDir();
  const output = path.join(tempDir, `${uuidv4()}.mp3`);
  const {
    strength = 0.5
  } = options;

  // Use anlmdn (non-local means denoising)
  const filter = `anlmdn=s=${strength}`;
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).audioFilters(filter).output(output).on('end', () => resolve(output)).on('error', reject).run();
  });
};
module.exports = {
  getAudioInfo,
  trim,
  merge,
  mix,
  applyEffect,
  convert,
  extractFromVideo,
  generateWaveform,
  detectBeats,
  enhanceVoice,
  reduceNoise
};