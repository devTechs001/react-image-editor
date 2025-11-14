import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { videoValidation } from '../validators/videoValidator.js';
import * as videoController from '../controllers/videoController.js';

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

router.post('/upload', auth, upload.single('video'), videoController.uploadVideo);
router.post('/:videoId/trim', auth, validate(videoValidation.trim), videoController.trimVideo);
router.post('/merge', auth, validate(videoValidation.merge), videoController.mergeVideos);
router.post('/:videoId/filter', auth, validate(videoValidation.filter), videoController.applyVideoFilter);
router.post('/:videoId/speed', auth, validate(videoValidation.speed), videoController.changeVideoSpeed);
router.post('/:videoId/extract-audio', auth, videoController.extractAudio);
router.post('/:videoId/watermark', auth, validate(videoValidation.watermark), videoController.addWatermark);
router.post('/:videoId/compress', auth, validate(videoValidation.compress), videoController.compressVideo);
router.post('/:videoId/gif', auth, validate(videoValidation.gif), videoController.createGIF);
router.post('/:videoId/stabilize', auth, videoController.stabilizeVideo);

export default router;