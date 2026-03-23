// backend/src/config/ai.js
const OpenAI = require('openai');
const Replicate = require('replicate');
const {
  HfInference
} = require('@huggingface/inference');

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Replicate Configuration
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Hugging Face Configuration
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Stability AI Configuration
const stabilityAI = {
  apiKey: process.env.STABILITY_API_KEY,
  baseUrl: 'https://api.stability.ai/v1'
};
module.exports = {
  openai,
  replicate,
  hf,
  stabilityAI,
  models: {
    // Image Generation
    sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    dalle3: 'dall-e-3',
    // Image Enhancement
    realEsrgan: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    gfpgan: 'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
    // Background Removal
    removeBg: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    // Style Transfer
    styleTransfer: 'tommoore515/neural_style_transfer:62bb8c6beeeaae6da2bf7c7e35ff05dc7ed17f19f9b0bc30bec2b05c5b299b37'
  }
};