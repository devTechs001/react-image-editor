import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export class VideoProcessor {
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.loaded = false;
    this.progress = 0;
  }

  async initialize() {
    if (this.loaded) return;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.ffmpeg.on('progress', ({ progress }) => {
      this.progress = Math.round(progress * 100);
    });

    this.loaded = true;
  }

  async trimVideo(videoFile, startTime, endTime) {
    await this.initialize();

    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    await this.ffmpeg.exec([
      '-i',
      inputName,
      '-ss',
      startTime.toString(),
      '-to',
      endTime.toString(),
      '-c',
      'copy',
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup([inputName, outputName]);

    return blob;
  }

  async mergeVideos(videoFiles) {
    await this.initialize();

    const fileListContent = videoFiles
      .map((_, index) => `file 'input${index}.mp4'`)
      .join('\n');

    await this.ffmpeg.writeFile('filelist.txt', fileListContent);

    for (let i = 0; i < videoFiles.length; i++) {
      await this.ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(videoFiles[i]));
    }

    await this.ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'filelist.txt',
      '-c',
      'copy',
      'output.mp4',
    ]);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    const filesToClean = [
      'filelist.txt',
      'output.mp4',
      ...videoFiles.map((_, i) => `input${i}.mp4`),
    ];
    await this.cleanup(filesToClean);

    return blob;
  }

  async addAudioToVideo(videoFile, audioFile, options = {}) {
    await this.initialize();

    const { volume = 1.0, fadeIn = 0, fadeOut = 0 } = options;

    await this.ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));
    await this.ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

    const args = [
      '-i',
      'video.mp4',
      '-i',
      'audio.mp3',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-shortest',
    ];

    if (volume !== 1.0) {
      args.push('-filter:a', `volume=${volume}`);
    }

    args.push('output.mp4');

    await this.ffmpeg.exec(args);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup(['video.mp4', 'audio.mp3', 'output.mp4']);

    return blob;
  }

  async extractAudio(videoFile, format = 'mp3') {
    await this.initialize();

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-vn',
      '-acodec',
      format === 'mp3' ? 'libmp3lame' : 'pcm_s16le',
      '-ar',
      '44100',
      '-ac',
      '2',
      `output.${format}`,
    ]);

    const data = await this.ffmpeg.readFile(`output.${format}`);
    const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    const blob = new Blob([data.buffer], { type: mimeType });

    await this.cleanup(['input.mp4', `output.${format}`]);

    return blob;
  }

  async applyFilter(videoFile, filterName, options = {}) {
    await this.initialize();

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    const filters = {
      grayscale: 'hue=s=0',
      sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
      brightness: `eq=brightness=${options.brightness || 0}`,
      contrast: `eq=contrast=${options.contrast || 1}`,
      saturation: `eq=saturation=${options.saturation || 1}`,
      blur: `boxblur=${options.blur || 5}`,
      sharpen: 'unsharp=5:5:1.0:5:5:0.0',
      vignette: 'vignette',
      rotate: `rotate=${options.angle || 0}*PI/180`,
    };

    const filterStr = filters[filterName] || filters.grayscale;

    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-vf',
      filterStr,
      '-c:a',
      'copy',
      'output.mp4',
    ]);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup(['input.mp4', 'output.mp4']);

    return blob;
  }

  async changeSpeed(videoFile, speed) {
    await this.initialize();

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    const videoSpeed = 1 / speed;
    const audioSpeed = speed;

    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-filter_complex',
      `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]atempo=${audioSpeed}[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      'output.mp4',
    ]);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup(['input.mp4', 'output.mp4']);

    return blob;
  }

  async extractFrames(videoFile, options = {}) {
    await this.initialize();

    const { fps = 1, format = 'png', quality = 2 } = options;

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-vf',
      `fps=${fps}`,
      '-q:v',
      quality.toString(),
      `frame_%04d.${format}`,
    ]);

    const files = await this.ffmpeg.listDir('/');
    const frameFiles = files.filter((f) => f.name.startsWith('frame_'));

    const frames = [];
    for (const file of frameFiles) {
      const data = await this.ffmpeg.readFile(file.name);
      const blob = new Blob([data.buffer], { type: `image/${format}` });
      frames.push(blob);
    }

    await this.cleanup(['input.mp4', ...frameFiles.map((f) => f.name)]);

    return frames;
  }

  async createGIF(videoFile, options = {}) {
    await this.initialize();

    const { width = 480, fps = 10, startTime = 0, duration = 5 } = options;

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-ss',
      startTime.toString(),
      '-t',
      duration.toString(),
      '-vf',
      `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop',
      '0',
      'output.gif',
    ]);

    const data = await this.ffmpeg.readFile('output.gif');
    const blob = new Blob([data.buffer], { type: 'image/gif' });

    await this.cleanup(['input.mp4', 'output.gif']);

    return blob;
  }

  async addWatermark(videoFile, watermarkImage, options = {}) {
    await this.initialize();

    const { position = 'bottomright', opacity = 1.0, scale = 0.1 } = options;

    await this.ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));
    await this.ffmpeg.writeFile('watermark.png', await fetchFile(watermarkImage));

    const positions = {
      topleft: '10:10',
      topright: 'W-w-10:10',
      bottomleft: '10:H-h-10',
      bottomright: 'W-w-10:H-h-10',
      center: '(W-w)/2:(H-h)/2',
    };

    const overlay = positions[position] || positions.bottomright;

    await this.ffmpeg.exec([
      '-i',
      'video.mp4',
      '-i',
      'watermark.png',
      '-filter_complex',
      `[1:v]scale=iw*${scale}:ih*${scale}[wm];[0:v][wm]overlay=${overlay}:format=auto,format=yuv420p`,
      '-c:a',
      'copy',
      'output.mp4',
    ]);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup(['video.mp4', 'watermark.png', 'output.mp4']);

    return blob;
  }

  async compressVideo(videoFile, options = {}) {
    await this.initialize();

    const { quality = 'medium', resolution = 'original' } = options;

    const qualityPresets = {
      low: { crf: 35, preset: 'ultrafast' },
      medium: { crf: 28, preset: 'medium' },
      high: { crf: 23, preset: 'slow' },
      ultra: { crf: 18, preset: 'veryslow' },
    };

    const resolutions = {
      '480p': 'scale=-2:480',
      '720p': 'scale=-2:720',
      '1080p': 'scale=-2:1080',
      original: null,
    };

    const preset = qualityPresets[quality] || qualityPresets.medium;

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    const args = ['-i', 'input.mp4', '-c:v', 'libx264', '-crf', preset.crf.toString()];

    if (resolutions[resolution]) {
      args.push('-vf', resolutions[resolution]);
    }

    args.push('-preset', preset.preset, '-c:a', 'aac', '-b:a', '128k', 'output.mp4');

    await this.ffmpeg.exec(args);

    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    await this.cleanup(['input.mp4', 'output.mp4']);

    return blob;
  }

  async getVideoInfo(videoFile) {
    await this.initialize();

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    let info = '';
    this.ffmpeg.on('log', ({ message }) => {
      info += message + '\n';
    });

    try {
      await this.ffmpeg.exec(['-i', 'input.mp4']);
    } catch (e) {
      // FFmpeg returns error code for info
    }

    await this.cleanup(['input.mp4']);

    return this.parseVideoInfo(info);
  }

  parseVideoInfo(info) {
    const duration = info.match(/Duration: (\d{2}):(\d{2}):(\d{2})\./);
    const resolution = info.match(/(\d{3,5})x(\d{3,5})/);
    const fps = info.match(/(\d+\.?\d*) fps/);
    const bitrate = info.match(/bitrate: (\d+) kb\/s/);

    return {
      duration: duration
        ? parseInt(duration[1]) * 3600 + parseInt(duration[2]) * 60 + parseInt(duration[3])
        : 0,
      width: resolution ? parseInt(resolution[1]) : 0,
      height: resolution ? parseInt(resolution[2]) : 0,
      fps: fps ? parseFloat(fps[1]) : 0,
      bitrate: bitrate ? parseInt(bitrate[1]) : 0,
    };
  }

  async cleanup(files) {
    for (const file of files) {
      try {
        await this.ffmpeg.deleteFile(file);
      } catch (e) {
        // Ignore errors
      }
    }
  }

  getProgress() {
    return this.progress;
  }
}