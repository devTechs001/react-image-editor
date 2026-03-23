// backend/src/routes/ai.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/auth');
const { requireCredits } = require('../middleware/authorize');
const { validate } = require('../middleware/validation');
const { uploadImage } = require('../middleware/upload');

// Python AI Service URL
const PYTHON_AI_SERVICE = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8001';

// Helper function to proxy requests to Python AI service
async function proxyToPythonService(req, res, endpoint, options = {}) {
  try {
    const url = `${PYTHON_AI_SERVICE}${endpoint}`;
    
    // Handle file uploads
    if (req.file) {
      const formData = new FormData();
      formData.append('image', req.file.buffer, req.file.originalname);
      
      // Add form fields
      Object.keys(req.body).forEach(key => {
        formData.append(key, req.body[key]);
      });
      
      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      return res.json(response.data);
    }
    
    // Handle regular JSON requests
    const method = options.method || 'POST';
    const data = options.data || req.body;
    
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return res.json(response.data);
  } catch (error) {
    console.error('Python AI Service Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable'
    });
  }
}

// Routes
router.use(auth);

// Computer Vision Routes
router.post('/vision/object-detection',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/object-detection')
);

router.post('/vision/semantic-segmentation',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/semantic-segmentation')
);

router.post('/vision/face-analysis',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/face-analysis')
);

router.post('/vision/pose-estimation',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/pose-estimation')
);

router.post('/vision/ocr',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/ocr')
);

router.post('/vision/depth-estimation',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/vision/depth-estimation')
);

// Natural Language Processing Routes
router.post('/nlp/text-generation',
  requireCredits('ai', 1),
  validate([
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('model').optional().isIn(['gpt-2', 'gpt-4', 'claude']),
    body('max_tokens').optional().isInt({ min: 10, max: 2000 }),
    body('temperature').optional().isFloat({ min: 0.1, max: 2.0 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/text-generation')
);

router.post('/nlp/sentiment-analysis',
  requireCredits('ai', 1),
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('model').optional().isIn(['roberta', 'bert', 'distilbert'])
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/sentiment-analysis')
);

router.post('/nlp/translation',
  requireCredits('ai', 1),
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('source_language').optional().isLength({ min: 2, max: 5 }),
    body('target_language').optional().isLength({ min: 2, max: 5 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/translation')
);

router.post('/nlp/summarization',
  requireCredits('ai', 1),
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('compression_ratio').optional().isFloat({ min: 0.1, max: 0.9 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/summarization')
);

router.post('/nlp/keyword-extraction',
  requireCredits('ai', 1),
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('max_keywords').optional().isInt({ min: 1, max: 50 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/keyword-extraction')
);

router.post('/nlp/speech-to-text',
  requireCredits('ai', 2),
  uploadImage.single('audio'),
  validate([
    body('language').optional().isLength({ min: 2, max: 5 }),
    body('model').optional().isIn(['whisper', 'google'])
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/nlp/speech-to-text')
);

// Generative AI Routes
router.post('/genai/image-generation',
  requireCredits('ai', 3),
  validate([
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('model').optional().isIn(['stable-diffusion', 'dall-e', 'midjourney']),
    body('style').optional().isIn(['photorealistic', 'artistic', 'anime', 'fantasy', 'vintage', 'minimalist']),
    body('width').optional().isInt({ min: 256, max: 1024 }),
    body('height').optional().isInt({ min: 256, max: 1024 }),
    body('steps').optional().isInt({ min: 10, max: 50 }),
    body('guidance').optional().isFloat({ min: 1, max: 20 }),
    body('batch_size').optional().isInt({ min: 1, max: 4 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/genai/image-generation')
);

router.post('/genai/image-enhancement',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  validate([
    body('enhancements').optional().isArray(),
    body('model').optional().isIn(['esrgan', 'real-esrgan', 'edsr'])
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/genai/image-enhancement')
);

// Reinforcement Learning Routes
router.post('/rl/train-agent',
  requireCredits('ai', 5),
  validate([
    body('algorithm').optional().isIn(['dqn', 'ppo', 'a3c', 'sac']),
    body('environment').optional().isIn(['image-classification', 'object-detection', 'segmentation']),
    body('total_episodes').optional().isInt({ min: 100, max: 10000 })
  ]),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/rl/train-agent')
);

router.get('/rl/training-status/:trainingId',
  (req, res) => proxyToPythonService(req, res, `/api/v1/ai/rl/training-status/${req.params.trainingId}`, { method: 'GET' })
);

router.post('/rl/train-step/:trainingId',
  requireCredits('ai', 1),
  validate([
    body('num_episodes').optional().isInt({ min: 1, max: 100 })
  ]),
  (req, res) => proxyToPythonService(req, res, `/api/v1/ai/rl/train-step/${req.params.trainingId}`)
);

router.post('/rl/save-model',
  requireCredits('ai', 1),
  (req, res) => proxyToPythonService(req, res, '/api/v1/ai/rl/save-model')
);

router.get('/rl/training-plot/:trainingId',
  (req, res) => proxyToPythonService(req, res, `/api/v1/ai/rl/training-plot/${req.params.trainingId}`, { method: 'GET' })
);

router.get('/rl/convergence-metrics/:trainingId',
  (req, res) => proxyToPythonService(req, res, `/api/v1/ai/rl/convergence-metrics/${req.params.trainingId}`, { method: 'GET' })
);

// Existing Routes (keeping original functionality)

// Background Removal
router.post('/remove-background',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  aiController.removeBackground
);

// Image Enhancement
router.post('/enhance',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  aiController.enhanceImage
);

// AI Upscaling
router.post('/upscale',
  requireCredits('ai', 2),
  uploadImage.single('image'),
  body('scale').optional().isIn([2, 4]).withMessage('Scale must be 2 or 4'),
  validate([body('scale')]),
  aiController.upscaleImage
);

// Style Transfer
router.post('/style-transfer',
  requireCredits('ai', 2),
  uploadImage.fields([
    { name: 'content', maxCount: 1 },
    { name: 'style', maxCount: 1 }
  ]),
  aiController.styleTransfer
);

// Colorization
router.post('/colorize',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  aiController.colorizeImage
);

// Object Removal
router.post('/remove-object',
  requireCredits('ai', 2),
  uploadImage.single('image'),
  body('mask').notEmpty().withMessage('Mask is required'),
  validate([body('mask')]),
  aiController.removeObject
);

// Face Enhancement
router.post('/enhance-face',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  aiController.enhanceFace
);

// Image Generation
router.post('/generate',
  requireCredits('ai', 3),
  validate([
    body('prompt')
      .notEmpty().withMessage('Prompt is required')
      .isLength({ max: 1000 }).withMessage('Prompt too long'),
    body('negativePrompt').optional().isLength({ max: 500 }),
    body('width').optional().isInt({ min: 256, max: 2048 }),
    body('height').optional().isInt({ min: 256, max: 2048 }),
    body('steps').optional().isInt({ min: 1, max: 100 }),
    body('guidance').optional().isFloat({ min: 1, max: 20 })
  ]),
  aiController.generateImage
);

// Inpainting
router.post('/inpaint',
  requireCredits('ai', 2),
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mask', maxCount: 1 }
  ]),
  body('prompt').notEmpty().withMessage('Prompt is required'),
  validate([body('prompt')]),
  aiController.inpaint
);

// Smart Crop
router.post('/smart-crop',
  requireCredits('ai', 1),
  uploadImage.single('image'),
  body('aspectRatio').optional().isFloat({ min: 0.1, max: 10 }),
  aiController.smartCrop
);

// Get AI usage stats
router.get('/stats', aiController.getUsageStats);

module.exports = router;