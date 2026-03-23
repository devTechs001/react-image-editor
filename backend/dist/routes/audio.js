// backend/src/routes/audio.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const audioController = require('../controllers/audioController');
const {
  auth
} = require('../middleware/auth');
const {
  upload
} = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Upload audio
router.post('/upload', upload.single('audio'), audioController.uploadAudio);

// Get all audio files
router.get('/', audioController.getAudioFiles);

// Get audio by ID
router.get('/:id', audioController.getAudio);

// Update audio metadata
router.put('/:id', audioController.updateAudio);

// Delete audio
router.delete('/:id', audioController.deleteAudio);

// Download audio
router.get('/:id/download', audioController.downloadAudio);

// Get waveform data
router.get('/:id/waveform', audioController.getWaveform);

// Trim audio
router.post('/:id/trim', audioController.trimAudio);

// Apply effects
router.post('/:id/effects', audioController.applyEffects);

// Convert format
router.post('/:id/convert', audioController.convertAudio);

// Merge audio files
router.post('/merge', audioController.mergeAudio);
module.exports = router;