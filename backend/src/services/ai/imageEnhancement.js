// backend/src/services/ai/imageEnhancement.js
const { replicate, openai } = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');

const enhance = async (imageBuffer, type = 'general') => {
  try {
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    let output;

    switch (type) {
      case 'general':
        // Use Real-ESRGAN for general enhancement
        output = await replicate.run(
          'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
          {
            input: {
              image: dataUri,
              scale: 1,
              face_enhance: true
            }
          }
        );
        break;

      case 'portrait':
        // Use GFPGAN for portrait enhancement
        output = await replicate.run(
          'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
          {
            input: {
              img: dataUri,
              version: 'v1.4',
              scale: 2
            }
          }
        );
        break;

      case 'low-light':
        // Use a low-light enhancement model
        output = await replicate.run(
          'cjwbw/llve:c2efd0ce18db3ed4af5b18d4e5a18b8d3f5e7c94',
          {
            input: {
              image: dataUri
            }
          }
        );
        break;

      case 'deblur':
        // Use a deblurring model
        output = await replicate.run(
          'megvii-research/nafnet:9a7f5d09e34a9f3dc14c6f5c7b8e9d0c1f2a3b4c',
          {
            input: {
              image: dataUri,
              task: 'Deblur'
            }
          }
        );
        break;

      case 'denoise':
        // Use a denoising model
        output = await replicate.run(
          'megvii-research/nafnet:9a7f5d09e34a9f3dc14c6f5c7b8e9d0c1f2a3b4c',
          {
            input: {
              image: dataUri,
              task: 'Denoise'
            }
          }
        );
        break;

      default:
        throw new Error(`Unknown enhancement type: ${type}`);
    }

    const response = await axios.get(output, { responseType: 'arraybuffer' });
    const buffer = await sharp(Buffer.from(response.data))
      .png({ quality: 95 })
      .toBuffer();

    return { buffer, type };
  } catch (error) {
    console.error('Image enhancement error:', error);
    throw new Error(`Failed to enhance image: ${error.message}`);
  }
};

const autoEnhance = async (imageBuffer) => {
  try {
    // Analyze image first
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();

    // Determine what enhancements are needed
    const enhancements = [];

    // Check brightness
    const avgBrightness = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;
    if (avgBrightness < 80) {
      enhancements.push({ type: 'brightness', value: 1.2 });
    } else if (avgBrightness > 200) {
      enhancements.push({ type: 'brightness', value: 0.9 });
    }

    // Check contrast
    const avgStdDev = (stats.channels[0].stdev + stats.channels[1].stdev + stats.channels[2].stdev) / 3;
    if (avgStdDev < 40) {
      enhancements.push({ type: 'contrast', value: 1.3 });
    }

    // Check saturation
    if (metadata.channels === 3) {
      const saturation = calculateSaturation(stats);
      if (saturation < 0.3) {
        enhancements.push({ type: 'saturation', value: 1.3 });
      }
    }

    // Apply enhancements
    let enhancedBuffer = imageBuffer;
    let pipeline = sharp(imageBuffer);

    for (const enhancement of enhancements) {
      switch (enhancement.type) {
        case 'brightness':
        case 'saturation':
          pipeline = pipeline.modulate({
            [enhancement.type]: enhancement.value
          });
          break;
        case 'contrast':
          pipeline = pipeline.linear(enhancement.value, -(128 * (enhancement.value - 1)));
          break;
      }
    }

    // Apply sharpening
    pipeline = pipeline.sharpen(1, 1, 0.5);

    enhancedBuffer = await pipeline.toBuffer();

    return {
      buffer: enhancedBuffer,
      appliedEnhancements: enhancements
    };
  } catch (error) {
    console.error('Auto enhance error:', error);
    throw new Error('Failed to auto-enhance image');
  }
};

const calculateSaturation = (stats) => {
  const r = stats.channels[0].mean;
  const g = stats.channels[1].mean;
  const b = stats.channels[2].mean;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
};

module.exports = { enhance, autoEnhance };