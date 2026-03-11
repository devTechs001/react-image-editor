// backend/src/services/ai/backgroundRemoval.js
const { replicate } = require('../../config/ai');
const sharp = require('sharp');
const axios = require('axios');

const remove = async (imageBuffer) => {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Run Rembg model on Replicate
    const output = await replicate.run(
      'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      {
        input: {
          image: dataUri
        }
      }
    );

    // Download result
    const response = await axios.get(output, { responseType: 'arraybuffer' });
    const resultBuffer = Buffer.from(response.data);

    // Optimize output with sharp
    const optimized = await sharp(resultBuffer)
      .png({ quality: 90 })
      .toBuffer();

    return { buffer: optimized };
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background');
  }
};

module.exports = { remove };