// backend/src/services/ai/index.js
const backgroundRemoval = require('./backgroundRemoval');
const imageEnhancement = require('./imageEnhancement');
const imageUpscaling = require('./imageUpscaling');
const styleTransfer = require('./styleTransfer');
const colorization = require('./colorization');
const inpainting = require('./inpainting');
const imageGeneration = require('./imageGeneration');
const faceEnhancement = require('./faceEnhancement');
const smartCrop = require('./smartCrop');

module.exports = {
  backgroundRemoval,
  imageEnhancement,
  imageUpscaling,
  styleTransfer,
  colorization,
  inpainting,
  imageGeneration,
  faceEnhancement,
  smartCrop
};