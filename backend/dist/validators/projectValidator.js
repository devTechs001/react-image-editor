// backend/src/validators/projectValidator.js
const {
  body,
  param,
  query
} = require('express-validator');
const createProjectValidator = [body('name').trim().notEmpty().withMessage('Project name is required').isLength({
  max: 255
}).withMessage('Name cannot exceed 255 characters'), body('type').notEmpty().withMessage('Project type is required').isIn(['image', 'video', 'audio']).withMessage('Invalid project type'), body('canvas.width').notEmpty().withMessage('Canvas width is required').isInt({
  min: 1,
  max: 10000
}).withMessage('Width must be between 1 and 10000'), body('canvas.height').notEmpty().withMessage('Canvas height is required').isInt({
  min: 1,
  max: 10000
}).withMessage('Height must be between 1 and 10000'), body('canvas.backgroundColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid background color format'), body('description').optional().trim().isLength({
  max: 1000
}).withMessage('Description cannot exceed 1000 characters')];
const updateProjectValidator = [body('name').optional().trim().isLength({
  max: 255
}).withMessage('Name cannot exceed 255 characters'), body('description').optional().trim().isLength({
  max: 1000
}).withMessage('Description cannot exceed 1000 characters'), body('tags').optional().isArray().withMessage('Tags must be an array'), body('tags.*').optional().trim().isLength({
  max: 50
}).withMessage('Tag cannot exceed 50 characters')];
const getProjectsValidator = [query('page').optional().isInt({
  min: 1
}).withMessage('Page must be a positive integer'), query('limit').optional().isInt({
  min: 1,
  max: 100
}).withMessage('Limit must be between 1 and 100'), query('type').optional().isIn(['image', 'video', 'audio']).withMessage('Invalid type'), query('status').optional().isIn(['draft', 'active', 'archived']).withMessage('Invalid status'), query('sort').optional().isIn(['-createdAt', 'createdAt', '-updatedAt', 'updatedAt', 'name', '-name']).withMessage('Invalid sort option')];
const projectIdValidator = [param('id').isMongoId().withMessage('Invalid project ID')];
module.exports = {
  createProjectValidator,
  updateProjectValidator,
  getProjectsValidator,
  projectIdValidator
};