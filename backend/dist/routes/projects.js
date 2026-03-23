// backend/src/routes/projects.js
const express = require('express');
const {
  body,
  param,
  query
} = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const {
  auth
} = require('../middleware/auth');
const {
  ownsResource
} = require('../middleware/authorize');
const {
  validate
} = require('../middleware/validation');
const {
  cache,
  clearCache
} = require('../middleware/cache');

// Validation rules
const createProjectValidation = [body('name').trim().notEmpty().withMessage('Project name is required').isLength({
  max: 255
}).withMessage('Name cannot exceed 255 characters'), body('type').notEmpty().withMessage('Project type is required').isIn(['image', 'video', 'audio']).withMessage('Invalid project type'), body('canvas.width').notEmpty().withMessage('Canvas width is required').isInt({
  min: 1,
  max: 10000
}).withMessage('Width must be between 1 and 10000'), body('canvas.height').notEmpty().withMessage('Canvas height is required').isInt({
  min: 1,
  max: 10000
}).withMessage('Height must be between 1 and 10000')];
const updateProjectValidation = [body('name').optional().trim().isLength({
  max: 255
}).withMessage('Name cannot exceed 255 characters'), body('description').optional().trim().isLength({
  max: 1000
}).withMessage('Description cannot exceed 1000 characters')];

// Routes
router.use(auth);
router.route('/').get(cache(60), projectController.getProjects).post(validate(createProjectValidation), clearCache('/projects*'), projectController.createProject);
router.route('/:id').get(ownsResource('Project'), projectController.getProject).put(ownsResource('Project'), validate(updateProjectValidation), projectController.updateProject).delete(ownsResource('Project'), projectController.deleteProject);
router.post('/:id/duplicate', ownsResource('Project'), projectController.duplicateProject);
router.post('/:id/share', ownsResource('Project'), projectController.shareProject);
router.get('/shared/:shareLink', projectController.getSharedProject);
router.put('/:id/layers', ownsResource('Project'), projectController.updateLayers);
router.put('/:id/adjustments', ownsResource('Project'), projectController.updateAdjustments);
router.post('/:id/auto-save', ownsResource('Project'), projectController.autoSave);
router.post('/:id/collaborators', ownsResource('Project'), projectController.addCollaborator);
router.delete('/:id/collaborators/:userId', ownsResource('Project'), projectController.removeCollaborator);
module.exports = router;