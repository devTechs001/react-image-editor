// backend/src/services/ai/styleTransfer.js
const {
  replicate
} = require('../../config/ai');
const axios = require('axios');
const sharp = require('sharp');
const styles = {
  'mosaic': 'mosaic',
  'candy': 'candy',
  'rain_princess': 'rain_princess',
  'udnie': 'udnie',
  'pointilism': 'pointilism',
  'starry_night': 'starry_night',
  'scream': 'scream',
  'wave': 'wave'
};
const transfer = async (contentBuffer, styleBuffer, options = {}) => {
  try {
    const {
      styleStrength = 1.0
    } = options;
    const contentBase64 = contentBuffer.toString('base64');
    const styleBase64 = styleBuffer.toString('base64');
    const output = await replicate.run('tommoore515/neural_style_transfer:62bb8c6beeeaae6da2bf7c7e35ff05dc7ed17f19f9b0bc30bec2b05c5b299b37', {
      input: {
        content_image: `data:image/png;base64,${contentBase64}`,
        style_image: `data:image/png;base64,${styleBase64}`,
        style_weight: styleStrength
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
    console.error('Style transfer error:', error);
    throw new Error('Failed to apply style transfer');
  }
};
const applyPresetStyle = async (contentBuffer, styleName, options = {}) => {
  try {
    if (!styles[styleName]) {
      throw new Error(`Unknown style: ${styleName}`);
    }
    const contentBase64 = contentBuffer.toString('base64');
    const output = await replicate.run('jcjohnson/fast-neural-style:a]9a7fbd6f01e1c8fc77fc4a5c7f6e1c3f4f5e6d7c8b', {
      input: {
        input: `data:image/png;base64,${contentBase64}`,
        model: styleName
      }
    });
    const response = await axios.get(output, {
      responseType: 'arraybuffer'
    });
    const buffer = await sharp(Buffer.from(response.data)).png({
      quality: 95
    }).toBuffer();
    return {
      buffer,
      style: styleName
    };
  } catch (error) {
    console.error('Preset style error:', error);
    throw new Error('Failed to apply preset style');
  }
};
const getAvailableStyles = () => {
  return Object.keys(styles).map(key => ({
    id: key,
    name: styles[key],
    thumbnail: `/assets/styles/${key}.jpg`
  }));
};
module.exports = {
  transfer,
  applyPresetStyle,
  getAvailableStyles
};