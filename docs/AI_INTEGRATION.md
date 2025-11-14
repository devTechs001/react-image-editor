# 🤖 AI/ML Integration Guide

## Overview

This guide covers all AI and machine learning integrations in the platform.

## Supported AI Services

### 1. TensorFlow.js (Client-Side)

#### Installation

```javascript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
```

#### Available Models

**Body Segmentation**

```javascript
import * as bodyPix from '@tensorflow-models/body-pix';

const net = await bodyPix.load({
  architecture: 'MobileNetV1',
  outputStride: 16,
  multiplier: 0.75,
  quantBytes: 2,
});

const segmentation = await net.segmentPerson(imageElement);
```

**Object Detection**

```javascript
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const model = await cocoSsd.load();
const predictions = await model.detect(imageElement);
```

**Face Landmarks**

```javascript
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detector = await faceLandmarksDetection.createDetector(model, {
  runtime: 'tfjs',
  refineLandmarks: true,
});

const faces = await detector.estimateFaces(imageElement);
```

**Pose Detection**

```javascript
import * as poseDetection from '@tensorflow-models/pose-detection';

const model = poseDetection.SupportedModels.MoveNet;
const detector = await poseDetection.createDetector(model, {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
});

const poses = await detector.estimatePoses(imageElement);
```

### 2. OpenAI API (Server-Side)

#### Image Generation (DALL-E 3)

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'A futuristic cityscape at sunset',
  n: 1,
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid',
});

const imageUrl = response.data[0].url;
```

#### GPT-4 Vision

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What's in this image?' },
        {
          type: 'image_url',
          image_url: {
            url: imageDataUrl,
          },
        },
      ],
    },
  ],
  max_tokens: 300,
});

const description = response.choices[0].message.content;
```

### 3. Stability AI (Stable Diffusion)

```javascript
import StabilityAI from '@stability-ai/sdk';

const stability = new StabilityAI({
  apiKey: process.env.STABILITY_AI_KEY,
});

// Text-to-Image
const response = await stability.generate({
  prompt: 'A beautiful mountain landscape',
  negativePrompt: 'blurry, low quality',
  width: 1024,
  height: 1024,
  samples: 1,
  steps: 50,
  cfgScale: 7,
  sampler: 'K_DPMPP_2M',
});

// Image-to-Image
const response = await stability.imageToImage({
  init_image: imageBuffer,
  prompt: 'Turn this into a watercolor painting',
  strength: 0.7,
});
```

### 4. Replicate API

```javascript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Run Real-ESRGAN (Image Upscaling)
const output = await replicate.run(
  'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
  {
    input: {
      image: imageUrl,
      scale: 4,
      face_enhance: true,
    },
  }
);

// Background Removal
const output = await replicate.run(
  'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  {
    input: {
      image: imageUrl,
    },
  }
);
```

### 5. MediaPipe (Advanced Face/Hand/Pose)

```javascript
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Pose } from '@mediapipe/pose';

// Face Mesh
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults((results) => {
  if (results.multiFaceLandmarks) {
    // Process face landmarks
    const landmarks = results.multiFaceLandmarks[0];
  }
});

// Hand Tracking
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
```

## Custom AI Services

### Background Removal Service

```javascript
// frontend/src/services/ai/backgroundRemoval.js
import * as bodyPix from '@tensorflow-models/body-pix';

export class BackgroundRemovalService {
  constructor() {
    this.net = null;
  }

  async initialize() {
    this.net = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    });
  }

  async removeBackground(imageElement, options = {}) {
    const {
      threshold = 0.5,
      blur = 0,
      edgeBlur = 3,
      backgroundColor = 'transparent',
    } = options;

    const segmentation = await this.net.segmentPerson(imageElement, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: threshold,
    });

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(imageElement, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Apply mask
    for (let i = 0; i < segmentation.data.length; i++) {
      if (segmentation.data[i] === 0) {
        // Background pixel
        pixels[i * 4 + 3] = 0; // Set alpha to 0
      }
    }

    // Apply edge blur
    if (edgeBlur > 0) {
      this.applyEdgeBlur(imageData, segmentation.data, edgeBlur);
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }

  applyEdgeBlur(imageData, mask, radius) {
    // Edge blur implementation
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;

        if (mask[i] === 1) {
          // Check if edge pixel
          const isEdge = this.isEdgePixel(mask, width, height, x, y);

          if (isEdge) {
            // Apply blur
            const alpha = pixels[i * 4 + 3];
            pixels[i * 4 + 3] = Math.max(0, alpha - radius * 20);
          }
        }
      }
    }
  }

  isEdgePixel(mask, width, height, x, y) {
    const neighbors = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const ni = ny * width + nx;
        if (mask[ni] === 0) return true;
      }
    }

    return false;
  }

  dispose() {
    if (this.net) {
      this.net.dispose();
    }
  }
}
```

### Image Enhancement Service

```javascript
// frontend/src/services/ai/imageEnhancement.js
export class ImageEnhancementService {
  async autoEnhance(canvas, options = {}) {
    const {
      brightness = true,
      contrast = true,
      saturation = true,
      sharpness = true,
    } = options;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Analyze image
    const stats = this.analyzeImage(imageData);

    // Apply enhancements
    if (brightness) {
      this.adjustBrightness(imageData, stats.brightness);
    }

    if (contrast) {
      this.adjustContrast(imageData, stats.contrast);
    }

    if (saturation) {
      this.adjustSaturation(imageData, stats.saturation);
    }

    if (sharpness) {
      this.applySharpen(imageData);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  analyzeImage(imageData) {
    const pixels = imageData.data;
    let totalBrightness = 0;
    let minBrightness = 255;
    let maxBrightness = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    const avgBrightness = totalBrightness / (pixels.length / 4);
    const contrast = maxBrightness - minBrightness;

    return {
      brightness: avgBrightness < 100 ? 1.2 : avgBrightness > 180 ? 0.8 : 1,
      contrast: contrast < 100 ? 1.3 : contrast > 200 ? 0.9 : 1,
      saturation: 1.1,
    };
  }

  adjustBrightness(imageData, factor) {
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.min(255, pixels[i] * factor);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * factor);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * factor);
    }
  }

  adjustContrast(imageData, factor) {
    const pixels = imageData.data;
    const contrastFactor = (259 * (factor * 255 + 255)) / (255 * (259 - factor * 255));

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.min(255, Math.max(0, contrastFactor * (pixels[i] - 128) + 128));
      pixels[i + 1] = Math.min(
        255,
        Math.max(0, contrastFactor * (pixels[i + 1] - 128) + 128)
      );
      pixels[i + 2] = Math.min(
        255,
        Math.max(0, contrastFactor * (pixels[i + 2] - 128) + 128)
      );
    }
  }

  adjustSaturation(imageData, factor) {
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.2989 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];

      pixels[i] = Math.min(255, gray + factor * (pixels[i] - gray));
      pixels[i + 1] = Math.min(255, gray + factor * (pixels[i + 1] - gray));
      pixels[i + 2] = Math.min(255, gray + factor * (pixels[i + 2] - gray));
    }
  }

  applySharpen(imageData) {
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    this.convolve(imageData, kernel);
  }

  convolve(imageData, kernel) {
    const width = imageData.width;
    const height = imageData.height;
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const srcIdx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += src[srcIdx] * kernel[kernelIdx];
            }
          }

          const dstIdx = (y * width + x) * 4 + c;
          dst[dstIdx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }
}
```

## Performance Optimization

### Web Workers for AI Processing

```javascript
// frontend/src/workers/ai-processor.worker.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let model = null;

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'LOAD_MODEL':
      await loadModel(data.modelUrl);
      self.postMessage({ type: 'MODEL_LOADED' });
      break;

    case 'PROCESS_IMAGE':
      const result = await processImage(data.imageData);
      self.postMessage({ type: 'PROCESSING_COMPLETE', result });
      break;

    case 'DISPOSE':
      if (model) {
        model.dispose();
      }
      tf.dispose();
      break;
  }
});

async function loadModel(modelUrl) {
  model = await tf.loadGraphModel(modelUrl);
}

async function processImage(imageData) {
  const tensor = tf.browser.fromPixels(imageData);
  const preprocessed = tf.image.resizeBilinear(tensor, [256, 256]).div(255);
  const batched = preprocessed.expandDims(0);

  const predictions = await model.predict(batched);
  const result = await predictions.data();

  tensor.dispose();
  preprocessed.dispose();
  batched.dispose();
  predictions.dispose();

  return Array.from(result);
}
```

### Using the Worker

```javascript
// frontend/src/hooks/ai/useAIProcessor.js
import { useRef, useCallback } from 'react';

export function useAIProcessor() {
  const workerRef = useRef(null);

  const initialize = useCallback(async (modelUrl) => {
    workerRef.current = new Worker(
      new URL('../../workers/ai-processor.worker.js', import.meta.url),
      { type: 'module' }
    );

    return new Promise((resolve) => {
      workerRef.current.postMessage({ type: 'LOAD_MODEL', data: { modelUrl } });

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'MODEL_LOADED') {
          resolve();
        }
      };
    });
  }, []);

  const processImage = useCallback(async (imageData) => {
    return new Promise((resolve) => {
      workerRef.current.postMessage({ type: 'PROCESS_IMAGE', data: { imageData } });

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'PROCESSING_COMPLETE') {
          resolve(e.data.result);
        }
      };
    });
  }, []);

  const dispose = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'DISPOSE' });
      workerRef.current.terminate();
    }
  }, []);

  return { initialize, processImage, dispose };
}
```

## Best Practices

1. **Model Loading**: Load models once and reuse
2. **Memory Management**: Dispose tensors after use
3. **Batch Processing**: Process multiple images together
4. **Web Workers**: Offload heavy processing to workers
5. **Progressive Enhancement**: Start with low-quality preview
6. **Error Handling**: Always handle API failures gracefully
7. **Rate Limiting**: Respect API rate limits
8. **Caching**: Cache AI results when possible

## Cost Optimization

1. **Client-Side First**: Use TensorFlow.js for simple tasks
2. **Backend for Complex**: Use cloud APIs for complex processing
3. **Image Preprocessing**: Resize images before sending to APIs
4. **Batch Requests**: Combine multiple requests when possible
5. **Caching**: Cache expensive AI operations
6. **User Limits**: Implement usage quotas

## Testing AI Features

```javascript
// tests/ai/backgroundRemoval.test.js
import { BackgroundRemovalService } from '@services/ai/backgroundRemoval';

describe('Background Removal', () => {
  let service;

  beforeEach(() => {
    service = new BackgroundRemovalService();
  });

  afterEach(() => {
    service.dispose();
  });

  it('should initialize model', async () => {
    await service.initialize();
    expect(service.net).not.toBeNull();
  });

  it('should remove background', async () => {
    await service.initialize();
    const image = await loadTestImage();
    const result = await service.removeBackground(image);

    expect(result).toBeInstanceOf(HTMLCanvasElement);
    expect(result.width).toBe(image.width);
    expect(result.height).toBe(image.height);
  });
});
```