// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const {
  body
} = require('express-validator');
const userController = require('../controllers/userController');
const {
  auth
} = require('../middleware/auth');
const {
  authorize
} = require('../middleware/authorize');
const {
  validate
} = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Get current user profile
router.get('/me', userController.getMe);

// Update current user profile
router.put('/me', [validate([body('name').optional().trim().isLength({
  max: 100
}), body('avatar').optional().isURL(), body('bio').optional().trim().isLength({
  max: 500
})])], userController.updateMe);

// Get all users (admin only)
router.get('/', authorize('admin'), userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user (admin only)
router.put('/:id', authorize('admin'), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Get user projects
router.get('/:id/projects', userController.getUserProjects);

// Get user activity
router.get('/:id/activity', userController.getUserActivity);
module.exports = router;