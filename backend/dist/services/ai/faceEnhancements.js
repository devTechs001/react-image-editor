// backend/src/services/ai/faceEnhancement.js
const {
  replicate
} = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');
const enhance = async (imageBuffer, options = {}) => {
  try {
    const {
      version = 'v1.4',
      upscale = 2,
      bgEnhance = true,
      faceUpsample = true
    } = options;
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Use GFPGAN for face enhancement
    const output = await replicate.run('tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3', {
      input: {
        img: dataUri,
        version,
        scale: upscale
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
    console.error('Face enhancement error:', error);
    throw new Error('Failed to enhance face');
  }
};
const detectFaces = async imageBuffer => {
  try {
    // Using a face detection model
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;
    const output = await replicate.run('sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56', {
      input: {
        image: dataUri,
        upscale: 1,
        face_upsample: false,
        codeformer_fidelity: 0.5
      }
    });

    // Return detected face regions
    return output.faces || [];
  } catch (error) {
    console.error('Face detection error:', error);
    throw new Error('Failed to detect faces');
  }
};
const swapFaces = async (sourceBuffer, targetBuffer, options = {}) => {
  try {
    const sourceBase64 = sourceBuffer.toString('base64');
    const targetBase64 = targetBuffer.toString('base64');
    const output = await replicate.run('lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d', {
      input: {
        source_image: `data:image/png;base64,${sourceBase64}`,
        target_image: `data:image/png;base64,${targetBase64}`
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
    console.error('Face swap error:', error);
    throw new Error('Failed to swap faces');
  }
};
module.exports = {
  enhance,
  detectFaces,
  swapFaces
};