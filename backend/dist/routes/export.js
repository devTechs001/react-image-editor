// backend/src/routes/export.js
const express = require('express');
const {
  body
} = require('express-validator');
const router = express.Router();
const exportController = require('../controllers/exportController');
const {
  auth
} = require('../middleware/auth');
const {
  requireCredits,
  ownsResource
} = require('../middleware/authorize');
const {
  validate
} = require('../middleware/validation');
const exportValidation = [body('projectId').notEmpty().withMessage('Project ID is required'), body('format').notEmpty().withMessage('Format is required').isIn(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'mp4', 'webm', 'mov', 'mp3', 'wav']).withMessage('Invalid export format'), body('quality').optional().isInt({
  min: 1,
  max: 100
}), body('scale').optional().isFloat({
  min: 0.1,
  max: 4
})];
router.use(auth);
router.post('/', requireCredits('exports', 1), validate(exportValidation), exportController.createExport);
router.get('/', exportController.getExports);
router.get('/:id', exportController.getExport);
router.get('/:id/download', exportController.downloadExport);
router.delete('/:id', exportController.deleteExport);

// Batch export
router.post('/batch', requireCredits('exports', 5), exportController.batchExport);
module.exports = router;