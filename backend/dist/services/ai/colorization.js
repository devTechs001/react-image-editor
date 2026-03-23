// backend/src/services/ai/colorization.js
const {
  replicate
} = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');
const colorize = async (imageBuffer, options = {}) => {
  try {
    const {
      renderFactor = 35
    } = options;
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Use DeOldify for colorization
    const output = await replicate.run('arielreplicate/deoldify_image:0da600fab0c45a66211339f1c16b71345d22f26ef5f7111e58f57907b4c3d7c5', {
      input: {
        input_image: dataUri,
        render_factor: renderFactor
      }
    });
    const response = await axios.get(output, {
      responseType: 'arraybuffer'
    });
    const buffer = await sharp(Buffer.from(response.data)).png({
      quality: 95
    }).toBuffer();
    return {
      buffer
    };
  } catch (error) {
    console.error('Colorization error:', error);
    throw new Error('Failed to colorize image');
  }
};
const colorizeVideo = async (videoUrl, options = {}) => {
  try {
    const {
      renderFactor = 21
    } = options;
    const output = await replicate.run('arielreplicate/deoldify_video:0d8a6b1e6a5b5f9c8d2c3b4a5e6f7a8b9c0d1e2f', {
      input: {
        input_video: videoUrl,
        render_factor: renderFactor
      }
    });
    return {
      url: output
    };
  } catch (error) {
    console.error('Video colorization error:', error);
    throw new Error('Failed to colorize video');
  }
};
module.exports = {
  colorize,
  colorizeVideo
};