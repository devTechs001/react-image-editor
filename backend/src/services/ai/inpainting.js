// backend/src/services/ai/inpainting.js
const { replicate, stabilityAI } = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');

const inpaint = async (imageBuffer, maskBuffer, prompt, options = {}) => {
  try {
    const {
      negativePrompt = '',
      strength = 0.8,
      guidanceScale = 7.5,
      steps = 30
    } = options;

    const imageBase64 = imageBuffer.toString('base64');
    const maskBase64 = maskBuffer.toString('base64');

    // Use Stability AI for inpainting
    const output = await replicate.run(
      'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
      {
        input: {
          image: `data:image/png;base64,${imageBase64}`,
          mask: `data:image/png;base64,${maskBase64}`,
          prompt,
          negative_prompt: negativePrompt,
          strength,
          guidance_scale: guidanceScale,
          num_inference_steps: steps
        }
      }
    );

    const response = await axios.get(output[0], { responseType: 'arraybuffer' });
    const buffer = await sharp(Buffer.from(response.data))
      .png({ quality: 95 })
      .toBuffer();

    return { buffer };
  } catch (error) {
    console.error('Inpainting error:', error);
    throw new Error('Failed to inpaint image');
  }
};

const removeObject = async (imageBuffer, maskBuffer) => {
  try {
    const imageBase64 = imageBuffer.toString('base64');
    const maskBase64 = maskBuffer.toString('base64');

    // Use LaMa for object removal
    const output = await replicate.run(
      'andreas128/lama:e3dac16c7a19c2aff86a97ced9b2bd8e09c7e64c208a0a62e0d4a30d15c9fb1c',
      {
        input: {
          image: `data:image/png;base64,${imageBase64}`,
          mask: `data:image/png;base64,${maskBase64}`
        }
      }
    );

    const response = await axios.get(output, { responseType: 'arraybuffer' });
    const buffer = await sharp(Buffer.from(response.data))
      .png({ quality: 95 })
      .toBuffer();

    return { buffer };
  } catch (error) {
    console.error('Object removal error:', error);
    throw new Error('Failed to remove object');
  }
};

const outpaint = async (imageBuffer, direction, prompt, options = {}) => {
  try {
    const { expandBy = 256 } = options;
    
    const metadata = await sharp(imageBuffer).metadata();
    let newWidth = metadata.width;
    let newHeight = metadata.height;
    let left = 0, top = 0;

    // Calculate new dimensions based on direction
    switch (direction) {
      case 'left':
        newWidth += expandBy;
        left = expandBy;
        break;
      case 'right':
        newWidth += expandBy;
        break;
      case 'top':
        newHeight += expandBy;
        top = expandBy;
        break;
      case 'bottom':
        newHeight += expandBy;
        break;
      case 'all':
        newWidth += expandBy * 2;
        newHeight += expandBy * 2;
        left = expandBy;
        top = expandBy;
        break;
    }

    // Create canvas with expanded size
    const canvas = await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{ input: imageBuffer, left, top }])
    .png()
    .toBuffer();

    // Create mask for the new areas
    const maskCanvas = await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 1,
        background: { r: 255 }
      }
    })
    .composite([{
      input: await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 1,
          background: { r: 0 }
        }
      }).png().toBuffer(),
      left,
      top
    }])
    .png()
    .toBuffer();

    // Use inpainting on the expanded areas
    return await inpaint(canvas, maskCanvas, prompt, options);
  } catch (error) {
    console.error('Outpainting error:', error);
    throw new Error('Failed to outpaint image');
  }
};

module.exports = { inpaint, removeObject, outpaint };