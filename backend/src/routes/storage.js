// backend/src/routes/storage.js
const express = require('express');
const router = express.Router();

const storageController = require('../controllers/storageController');
const { auth } = require('../middleware/auth');
const { uploadAny, handleUploadError } = require('../middleware/upload');

router.use(auth);

// Get storage usage
router.get('/usage', storageController.getUsage);

// Get presigned upload URL
router.post('/presign-upload', storageController.getPresignedUploadUrl);

// Get presigned download URL
router.post('/presign-download', storageController.getPresignedDownloadUrl);

// Delete files
router.post('/delete', storageController.deleteFiles);

// Move files
router.post('/move', storageController.moveFiles);

// Copy files
router.post('/copy', storageController.copyFiles);

module.exports = router;