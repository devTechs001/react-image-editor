import * as Tone from 'tone';
import WaveSurfer from 'wavesurfer.js';

export class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.analyser = null;
    this.wavesurfer = null;
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await Tone.start();
    }
  }

  async loadAudio(audioFile) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(audioFile);
    });
  }

  async trimAudio(audioBuffer, startTime, endTime) {
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const duration = endSample - startSample;

    const trimmedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      duration,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel);
      const trimmedData = trimmedBuffer.getChannelData(channel);

      for (let i = 0; i < duration; i++) {
        trimmedData[i] = sourceData[startSample + i];
      }
    }

    return trimmedBuffer;
  }

  async mergeAudio(audioBuffers) {
    if (audioBuffers.length === 0) return null;

    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = audioBuffers[0].numberOfChannels;

    // Calculate total duration
    const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);

    const mergedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      totalLength,
      sampleRate
    );

    let offset = 0;
    for (const buffer of audioBuffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceData = buffer.getChannelData(channel);
        const mergedData = mergedBuffer.getChannelData(channel);

        for (let i = 0; i < buffer.length; i++) {
          mergedData[offset + i] = sourceData[i];
        }
      }
      offset += buffer.length;
    }

    return mergedBuffer;
  }

  async mixAudio(audioBuffers, volumes = []) {
    if (audioBuffers.length === 0) return null;

    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = audioBuffers[0].numberOfChannels;
    const maxLength = Math.max(...audioBuffers.map((b) => b.length));

    const mixedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      maxLength,
      sampleRate
    );

    for (let bufferIndex = 0; bufferIndex < audioBuffers.length; bufferIndex++) {
      const buffer = audioBuffers[bufferIndex];
      const volume = volumes[bufferIndex] || 1.0;

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceData = buffer.getChannelData(channel);
        const mixedData = mixedBuffer.getChannelData(channel);

        for (let i = 0; i < buffer.length; i++) {
          mixedData[i] = (mixedData[i] || 0) + sourceData[i] * volume;
        }
      }
    }

    // Normalize to prevent clipping
    return this.normalizeAudio(mixedBuffer);
  }

  normalizeAudio(audioBuffer) {
    let maxValue = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        maxValue = Math.max(maxValue, Math.abs(data[i]));
      }
    }

    if (maxValue > 1.0) {
      const scale = 1.0 / maxValue;

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const data = audioBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          data[i] *= scale;
        }
      }
    }

    return audioBuffer;
  }

  async applyFade(audioBuffer, fadeInDuration = 0, fadeOutDuration = 0) {
    const sampleRate = audioBuffer.sampleRate;
    const fadeInSamples = Math.floor(fadeInDuration * sampleRate);
    const fadeOutSamples = Math.floor(fadeOutDuration * sampleRate);

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);

      // Fade in
      for (let i = 0; i < fadeInSamples; i++) {
        const gain = i / fadeInSamples;
        data[i] *= gain;
      }

      // Fade out
      const startFadeOut = data.length - fadeOutSamples;
      for (let i = 0; i < fadeOutSamples; i++) {
        const gain = 1 - i / fadeOutSamples;
        data[startFadeOut + i] *= gain;
      }
    }

    return audioBuffer;
  }

  async changeVolume(audioBuffer, volume) {
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        data[i] *= volume;
      }
    }

    return audioBuffer;
  }

  async applyEqualizer(audioBuffer, bands) {
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create EQ filters
    const filters = bands.map((band) => {
      const filter = offlineContext.createBiquadFilter();
      filter.type = band.type || 'peaking';
      filter.frequency.value = band.frequency;
      filter.Q.value = band.q || 1.0;
      filter.gain.value = band.gain;
      return filter;
    });

    // Connect filters in series
    let previousNode = source;
    filters.forEach((filter) => {
      previousNode.connect(filter);
      previousNode = filter;
    });

    previousNode.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  }

  async applyReverb(audioBuffer, options = {}) {
    const { decay = 2.0, preDelay = 0.01, wet = 0.5 } = options;

    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const convolver = offlineContext.createConvolver();
    convolver.buffer = this.createReverbImpulse(
      offlineContext,
      decay,
      preDelay,
      audioBuffer.sampleRate
    );

    const wetGain = offlineContext.createGain();
    wetGain.gain.value = wet;

    const dryGain = offlineContext.createGain();
    dryGain.gain.value = 1 - wet;

    source.connect(convolver);
    convolver.connect(wetGain);
    source.connect(dryGain);

    wetGain.connect(offlineContext.destination);
    dryGain.connect(offlineContext.destination);

    source.start();

    return await offlineContext.startRendering();
  }

  createReverbImpulse(context, decay, preDelay, sampleRate) {
    const length = sampleRate * decay;
    const impulse = context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const n = i / sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-n / decay);
      }
    }

    return impulse;
  }

  async applyCompressor(audioBuffer, options = {}) {
    const {
      threshold = -24,
      knee = 30,
      ratio = 12,
      attack = 0.003,
      release = 0.25,
    } = options;

    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.value = threshold;
    compressor.knee.value = knee;
    compressor.ratio.value = ratio;
    compressor.attack.value = attack;
    compressor.release.value = release;

    source.connect(compressor);
    compressor.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  }

  async noiseReduction(audioBuffer, options = {}) {
    const { threshold = 0.01 } = options;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);

      for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) < threshold) {
          data[i] = 0;
        }
      }
    }

    return audioBuffer;
  }

  async changeSpeed(audioBuffer, speed) {
    const newLength = Math.floor(audioBuffer.length / speed);
    const newBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);

      for (let i = 0; i < newLength; i++) {
        const sourceIndex = Math.floor(i * speed);
        newData[i] = sourceData[sourceIndex] || 0;
      }
    }

    return newBuffer;
  }

  async changePitch(audioBuffer, semitones) {
    const player = new Tone.Player().toDestination();
    player.buffer = this.audioBufferToToneBuffer(audioBuffer);

    const pitchShift = new Tone.PitchShift(semitones).toDestination();
    player.connect(pitchShift);

    // For full implementation, would need to render offline
    return audioBuffer;
  }

  async extractWaveformData(audioBuffer, samplesPerPixel = 100) {
    const waveformData = [];

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      const channelData = [];

      for (let i = 0; i < data.length; i += samplesPerPixel) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < samplesPerPixel; j++) {
          const sample = data[i + j] || 0;
          min = Math.min(min, sample);
          max = Math.max(max, sample);
        }

        channelData.push({ min, max });
      }

      waveformData.push(channelData);
    }

    return waveformData;
  }

  async analyzeFrequency(audioBuffer) {
    const offlineContext = new OfflineAudioContext(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(offlineContext.destination);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    return frequencyData;
  }

  async exportToWav(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // Data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  audioBufferToToneBuffer(audioBuffer) {
    const buffer = new Tone.Buffer();
    buffer.fromArray(audioBuffer.getChannelData(0));
    return buffer;
  }
}