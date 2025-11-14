import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { imageValidation } from '../validators/imageValidator.js';
import * as imageController from '../controllers/imageController.js';

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload image
router.post('/upload', auth, upload.single('image'), imageController.uploadImage);

// Process image
router.post('/:imageId/process', auth, validate(imageValidation.process), imageController.processImage);

// Apply filter
router.post('/:imageId/filter', auth, validate(imageValidation.filter), imageController.applyFilter);

// Resize image
router.post('/:imageId/resize', auth, validate(imageValidation.resize), imageController.resizeImage);

// Crop image
router.post('/:imageId/crop', auth, validate(imageValidation.crop), imageController.cropImage);

// Enhance image
router.post('/:imageId/enhance', auth, imageController.enhanceImage);

// Remove background
router.post('/:imageId/remove-background', auth, imageController.removeImageBackground);

// Get image analysis
router.get('/:imageId/analysis', auth, imageController.getImageAnalysis);

export default router;