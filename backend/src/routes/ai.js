import express from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { aiValidation } from '../validators/aiValidator.js';
import * as aiController from '../controllers/aiController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// AI Rate limiting (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many AI requests, please try again later',
});

router.use(aiLimiter);

router.post('/text-to-image', auth, validate(aiValidation.textToImage), aiController.textToImage);
router.post('/remove-background', auth, validate(aiValidation.removeBackground), aiController.removeBackground);
router.post('/upscale', auth, validate(aiValidation.upscale), aiController.upscale);
router.post('/detect-objects', auth, validate(aiValidation.detectObjects), aiController.detectObjectsInImage);
router.post('/detect-faces', auth, validate(aiValidation.detectFaces), aiController.detectFacesInImage);
router.post('/style-transfer', auth, validate(aiValidation.styleTransfer), aiController.applyStyleTransfer);
router.post('/enhance', auth, validate(aiValidation.enhance), aiController.enhanceImage);
router.post('/colorize', auth, validate(aiValidation.colorize), aiController.colorizeImage);
router.get('/usage', auth, aiController.getAIUsage);

export default router;