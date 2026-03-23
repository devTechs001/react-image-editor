// backend/src/services/ai/imageGeneration.js
const {
  openai,
  replicate,
  stabilityAI
} = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');
const generate = async options => {
  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 30,
    guidance = 7.5,
    seed,
    model = 'sdxl'
  } = options;
  try {
    let imageUrl;
    let resultSeed;
    if (model === 'dalle3') {
      // Use OpenAI DALL-E 3
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: `${width}x${height}`,
        quality: 'standard',
        response_format: 'url'
      });
      imageUrl = response.data[0].url;
    } else {
      // Use Stability AI SDXL via Replicate
      const output = await replicate.run('stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: guidance,
          seed: seed || Math.floor(Math.random() * 1000000)
        }
      });
      imageUrl = output[0];
      resultSeed = seed;
    }

    // Download and optimize
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const buffer = await sharp(Buffer.from(response.data)).png({
      quality: 95
    }).toBuffer();
    return {
      buffer,
      seed: resultSeed
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate image');
  }
};
const generateVariations = async (imageBuffer, options = {}) => {
  const {
    count = 4,
    strength = 0.5
  } = options;
  try {
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;
    const output = await replicate.run('stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', {
      input: {
        image: dataUri,
        prompt: 'variations of this image',
        num_outputs: count,
        prompt_strength: strength
      }
    });
    const variations = await Promise.all(output.map(async url => {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      return sharp(Buffer.from(response.data)).png({
        quality: 90
      }).toBuffer();
    }));
    return variations;
  } catch (error) {
    console.error('Variation generation error:', error);
    throw new Error('Failed to generate variations');
  }
};
module.exports = {
  generate,
  generateVariations
};