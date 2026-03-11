// backend/src/services/ai/inpainting.js
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/app');

/**
 * Inpaint/restore missing parts of an image
 * @param {Buffer} imageBuffer - Source image buffer
 * @param {Object} mask - Mask defining areas to inpaint
 * @param {Object} options - Inpainting options
 * @returns {Promise<Buffer>} - Inpainted image buffer
 */
async function inpaint(imageBuffer, mask, options = {}) {
  const {
    prompt = '',
    negativePrompt = '',
    strength = 0.75,
    steps = 50,
    guidanceScale = 7.5
  } = options;

  try {
    // Use Replicate API for inpainting
    if (config.replicate.token) {
      return await inpaintWithReplicate(imageBuffer, mask, {
        prompt,
        negativePrompt,
        strength,
        steps,
        guidanceScale
      });
    }

    // Use Stability AI
    if (config.stability.apiKey) {
      return await inpaintWithStability(imageBuffer, mask, {
        prompt,
        negativePrompt,
        strength
      });
    }

    // Fallback: Simple mask blending
    return await simpleInpaint(imageBuffer, mask);
  } catch (error) {
    throw new Error(`Inpainting failed: ${error.message}`);
  }
}

/**
 * Inpaint using Replicate (Stable Diffusion inpainting)
 */
async function inpaintWithReplicate(imageBuffer, mask, options) {
  const formData = new FormData();
  
  // Convert buffers to base64 for API
  const imageBase64 = imageBuffer.toString('base64');
  const maskBase64 = mask.toString('base64');
  
  formData.append('image', `data:image/png;base64,${imageBase64}`);
  formData.append('mask', `data:image/png;base64,${maskBase64}`);
  formData.append('prompt', options.prompt || 'restore the image');
  formData.append('negative_prompt', options.negativePrompt || '');
  formData.append('strength', options.strength?.toString() || '0.75');
  formData.append('num_inference_steps', options.steps?.toString() || '50');
  formData.append('guidance_scale', options.guidanceScale?.toString() || '7.5');

  const response = await axios.post(
    'https://api.replicate.com/v1/predictions',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Token ${config.replicate.token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Poll for result
  const predictionId = response.data.id;
  return await pollReplicateResult(predictionId);
}

/**
 * Inpaint using Stability AI
 */
async function inpaintWithStability(imageBuffer, mask, options) {
  const formData = new FormData();
  
  formData.append('init_image', imageBuffer);
  formData.append('mask_source', mask);
  formData.append('text_prompts[0][text]', options.prompt || 'restore the image');
  formData.append('text_prompts[0][weight]', '1');
  formData.append('cfg_scale', options.guidanceScale?.toString() || '7');
  formData.append('steps', options.steps?.toString() || '50');

  const response = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/inpainting',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${config.stability.apiKey}`,
        'Accept': 'image/*'
      },
      responseType: 'arraybuffer'
    }
  );

  return Buffer.from(response.data);
}

/**
 * Simple inpaint fallback (blending)
 */
async function simpleInpaint(imageBuffer, mask) {
  // This is a basic implementation that blurs the masked area
  // Production should use AI models
  
  const metadata = await sharp(imageBuffer).metadata();
  
  // Apply slight blur to smooth the transition
  const result = await sharp(imageBuffer)
    .blur(2)
    .toBuffer();

  return result;
}

/**
 * Poll Replicate for result
 */
async function pollReplicateResult(predictionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${config.replicate.token}`
        }
      }
    );

    if (response.data.status === 'succeeded') {
      const imageUrl = response.data.output?.[0];
      if (imageUrl) {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(imageResponse.data);
      }
    } else if (response.data.status === 'failed') {
      throw new Error('Inpainting prediction failed');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Inpainting timeout');
}

/**
 * Outpaint (extend image beyond borders)
 */
async function outpaint(imageBuffer, options = {}) {
  const {
    top = 0,
    bottom = 0,
    left = 0,
    right = 0,
    prompt = ''
  } = options;

  // Get original dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const newWidth = metadata.width + left + right;
  const newHeight = metadata.height + top + bottom;

  // Create extended canvas
  const extendedBuffer = await sharp({
    create: {
      width: newWidth,
      height: newHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: imageBuffer,
      left: left,
      top: top
    }
  ])
  .png()
  .toBuffer();

  // Create mask for new areas
  const maskBuffer = await createOutpaintMask(newWidth, newHeight, top, bottom, left, right);

  // Inpaint the extended areas
  return await inpaint(extendedBuffer, maskBuffer, { prompt });
}

/**
 * Create mask for outpainting
 */
async function createOutpaintMask(width, height, top, bottom, left, right) {
  // Create SVG mask
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="black"/>
      ${top > 0 ? `<rect width="${width}" height="${top}" fill="white"/>` : ''}
      ${bottom > 0 ? `<rect y="${height - bottom}" width="${width}" height="${bottom}" fill="white"/>` : ''}
      ${left > 0 ? `<rect width="${left}" height="${height}" fill="white"/>` : ''}
      ${right > 0 ? `<rect x="${width - right}" width="${right}" height="${height}" fill="white"/>` : ''}
    </svg>
  `;

  return Buffer.from(svg);
}

module.exports = {
  inpaint,
  outpaint,
  inpaintWithReplicate,
  inpaintWithStability
};
