// backend/src/services/ai/smartCrop.js
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');

let model = null;

const loadModel = async () => {
  if (!model) {
    model = await cocoSsd.load();
  }
  return model;
};

const crop = async (imageBuffer, options = {}) => {
  try {
    const {
      aspectRatio = 1,
      focusOn = 'auto', // 'auto', 'face', 'center', 'rule-of-thirds'
      padding = 0.1
    } = options;

    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    let cropInfo = {
      x: 0,
      y: 0,
      width,
      height
    };

    if (focusOn === 'auto' || focusOn === 'object') {
      // Use object detection to find main subject
      const model = await loadModel();
      
      // Convert buffer to tensor
      const image = await sharp(imageBuffer)
        .resize(640, 640, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const tensor = tf.tensor3d(
        new Uint8Array(image.data),
        [image.info.height, image.info.width, image.info.channels]
      );

      const predictions = await model.detect(tensor);
      tensor.dispose();

      if (predictions.length > 0) {
        // Find the most prominent object
        const mainObject = predictions.reduce((prev, current) => 
          (prev.score > current.score) ? prev : current
        );

        // Scale bbox back to original size
        const scaleX = width / image.info.width;
        const scaleY = height / image.info.height;

        const centerX = (mainObject.bbox[0] + mainObject.bbox[2] / 2) * scaleX;
        const centerY = (mainObject.bbox[1] + mainObject.bbox[3] / 2) * scaleY;

        cropInfo = calculateCropFromCenter(centerX, centerY, width, height, aspectRatio, padding);
      } else {
        // Fallback to center crop
        cropInfo = calculateCenterCrop(width, height, aspectRatio);
      }
    } else if (focusOn === 'center') {
      cropInfo = calculateCenterCrop(width, height, aspectRatio);
    } else if (focusOn === 'rule-of-thirds') {
      // Focus on upper-left third intersection
      const centerX = width / 3;
      const centerY = height / 3;
      cropInfo = calculateCropFromCenter(centerX, centerY, width, height, aspectRatio, padding);
    }

    // Apply crop
    const croppedBuffer = await sharp(imageBuffer)
      .extract({
        left: Math.round(cropInfo.x),
        top: Math.round(cropInfo.y),
        width: Math.round(cropInfo.width),
        height: Math.round(cropInfo.height)
      })
      .toBuffer();

    return {
      buffer: croppedBuffer,
      cropInfo
    };
  } catch (error) {
    console.error('Smart crop error:', error);
    throw new Error('Failed to smart crop image');
  }
};

const calculateCenterCrop = (width, height, aspectRatio) => {
  let cropWidth, cropHeight;

  if (width / height > aspectRatio) {
    cropHeight = height;
    cropWidth = height * aspectRatio;
  } else {
    cropWidth = width;
    cropHeight = width / aspectRatio;
  }

  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight
  };
};

const calculateCropFromCenter = (centerX, centerY, width, height, aspectRatio, padding) => {
  let cropWidth, cropHeight;

  if (width / height > aspectRatio) {
    cropHeight = height * (1 - padding * 2);
    cropWidth = cropHeight * aspectRatio;
  } else {
    cropWidth = width * (1 - padding * 2);
    cropHeight = cropWidth / aspectRatio;
  }

  let x = centerX - cropWidth / 2;
  let y = centerY - cropHeight / 2;

  // Ensure crop is within bounds
  x = Math.max(0, Math.min(width - cropWidth, x));
  y = Math.max(0, Math.min(height - cropHeight, y));

  return { x, y, width: cropWidth, height: cropHeight };
};

const suggestCrops = async (imageBuffer, aspectRatios = [1, 16/9, 4/5, 9/16]) => {
  const suggestions = [];

  for (const ratio of aspectRatios) {
    const { cropInfo } = await crop(imageBuffer, { aspectRatio: ratio });
    suggestions.push({
      aspectRatio: ratio,
      crop: cropInfo
    });
  }

  return suggestions;
};

module.exports = { crop, suggestCrops };