// backend/src/routes/assets.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const {
  auth
} = require('../middleware/auth');
const {
  ownsResource
} = require('../middleware/authorize');
const {
  uploadAny,
  handleUploadError
} = require('../middleware/upload');
router.use(auth);
router.route('/').get(assetController.getAssets).post(uploadAny.array('files', 10), handleUploadError, assetController.uploadAssets);
router.route('/:id').get(ownsResource('Asset'), assetController.getAsset).put(ownsResource('Asset'), assetController.updateAsset).delete(ownsResource('Asset'), assetController.deleteAsset);
router.get('/:id/download', ownsResource('Asset'), assetController.downloadAsset);
router.post('/bulk-delete', assetController.bulkDelete);
router.post('/move', assetController.moveAssets);

// Folders
router.get('/folders', assetController.getFolders);
router.post('/folders', assetController.createFolder);
router.delete('/folders/:name', assetController.deleteFolder);
module.exports = router;