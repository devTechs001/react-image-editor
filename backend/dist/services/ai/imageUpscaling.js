// backend/src/services/ai/imageUpscaling.js
const {
  replicate
} = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');
const upscale = async (imageBuffer, scale = 2) => {
  try {
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Use Real-ESRGAN for upscaling
    const output = await replicate.run('nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', {
      input: {
        image: dataUri,
        scale: scale,
        face_enhance: false
      }
    });
    const response = await axios.get(output, {
      responseType: 'arraybuffer'
    });
    const buffer = await sharp(Buffer.from(response.data)).png({
      quality: 95
    }).toBuffer();
    const metadata = await sharp(buffer).metadata();
    return {
      buffer,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    };
  } catch (error) {
    console.error('Upscaling error:', error);
    throw new Error('Failed to upscale image');
  }
};
module.exports = {
  upscale
};