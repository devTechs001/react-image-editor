// backend/src/routes/ai.js
const express = require('express');
const {
  body
} = require('express-validator');
const router = express.Router();
const aiController = require('../controllers/aiController');
const {
  auth
} = require('../middleware/auth');
const {
  requireCredits
} = require('../middleware/authorize');
const {
  validate
} = require('../middleware/validation');
const {
  uploadImage
} = require('../middleware/upload');

// Routes
router.use(auth);

// Background Removal
router.post('/remove-background', requireCredits('ai', 1), uploadImage.single('image'), aiController.removeBackground);

// Image Enhancement
router.post('/enhance', requireCredits('ai', 1), uploadImage.single('image'), aiController.enhanceImage);

// AI Upscaling
router.post('/upscale', requireCredits('ai', 2), uploadImage.single('image'), body('scale').optional().isIn([2, 4]).withMessage('Scale must be 2 or 4'), validate([body('scale')]), aiController.upscaleImage);

// Style Transfer
router.post('/style-transfer', requireCredits('ai', 2), uploadImage.fields([{
  name: 'content',
  maxCount: 1
}, {
  name: 'style',
  maxCount: 1
}]), aiController.styleTransfer);

// Colorization
router.post('/colorize', requireCredits('ai', 1), uploadImage.single('image'), aiController.colorizeImage);

// Object Removal
router.post('/remove-object', requireCredits('ai', 2), uploadImage.single('image'), body('mask').notEmpty().withMessage('Mask is required'), validate([body('mask')]), aiController.removeObject);

// Face Enhancement
router.post('/enhance-face', requireCredits('ai', 1), uploadImage.single('image'), aiController.enhanceFace);

// Image Generation
router.post('/generate', requireCredits('ai', 3), validate([body('prompt').notEmpty().withMessage('Prompt is required').isLength({
  max: 1000
}).withMessage('Prompt too long'), body('negativePrompt').optional().isLength({
  max: 500
}), body('width').optional().isInt({
  min: 256,
  max: 2048
}), body('height').optional().isInt({
  min: 256,
  max: 2048
}), body('steps').optional().isInt({
  min: 1,
  max: 100
}), body('guidance').optional().isFloat({
  min: 1,
  max: 20
})]), aiController.generateImage);

// Inpainting
router.post('/inpaint', requireCredits('ai', 2), uploadImage.fields([{
  name: 'image',
  maxCount: 1
}, {
  name: 'mask',
  maxCount: 1
}]), body('prompt').notEmpty().withMessage('Prompt is required'), validate([body('prompt')]), aiController.inpaint);

// Smart Crop
router.post('/smart-crop', requireCredits('ai', 1), uploadImage.single('image'), body('aspectRatio').optional().isFloat({
  min: 0.1,
  max: 10
}), aiController.smartCrop);

// Get AI usage stats
router.get('/stats', aiController.getUsageStats);
module.exports = router;