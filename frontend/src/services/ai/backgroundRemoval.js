// frontend/src/services/ai/backgroundRemoval.js
import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

let model = null;

async function loadModel() {
  if (!model) {
    await tf.ready();
    model = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });
  }
  return model;
}

export async function removeBackground(imageSource) {
  try {
    // Load model
    const net = await loadModel();

    // Create image element
    const img = await createImageElement(imageSource);

    // Perform segmentation
    const segmentation = await net.segmentPerson(img, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: 0.7
    });

    // Create canvas for result
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply mask - set alpha to 0 for background pixels
    for (let i = 0; i < segmentation.data.length; i++) {
      if (segmentation.data[i] === 0) {
        data[i * 4 + 3] = 0; // Set alpha to 0 for background
      }
    }

    // Apply feathering/smoothing to edges
    const smoothedData = smoothEdges(imageData, segmentation);
    ctx.putImageData(smoothedData, 0, 0);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
}

function createImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });
}

function smoothEdges(imageData, segmentation) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Simple edge smoothing using neighboring pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      
      // Check if this is an edge pixel
      const neighbors = [
        segmentation.data[i - 1],
        segmentation.data[i + 1],
        segmentation.data[i - width],
        segmentation.data[i + width]
      ];

      const sum = neighbors.reduce((a, b) => a + b, 0);
      
      // If mixed neighbors (edge pixel)
      if (sum > 0 && sum < 4) {
        const alpha = (sum / 4) * 255;
        data[i * 4 + 3] = Math.round(alpha);
      }
    }
  }

  return imageData;
}

export async function replaceBackground(imageSource, backgroundSource) {
  const foreground = await removeBackground(imageSource);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Load images
  const bgImg = await createImageElement(backgroundSource);
  const fgImg = await createImageElement(foreground);

  canvas.width = fgImg.width;
  canvas.height = fgImg.height;

  // Draw background (scaled to fit)
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Draw foreground
  ctx.drawImage(fgImg, 0, 0);

  return canvas.toDataURL('image/png');
}

export default {
  removeBackground,
  replaceBackground
};