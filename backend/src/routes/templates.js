// backend/src/routes/templates.js
const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const templateController = require('../controllers/templateController');
const { auth, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { cache } = require('../middleware/cache');

// Public routes
router.get('/', optionalAuth, cache(300), templateController.getTemplates);
router.get('/featured', cache(300), templateController.getFeaturedTemplates);
router.get('/categories', cache(600), templateController.getCategories);
router.get('/:id', optionalAuth, templateController.getTemplate);

// Protected routes
router.use(auth);

router.post('/:id/use', templateController.useTemplate);
router.post('/:id/like', templateController.likeTemplate);

// Admin routes
router.post('/', authorize('admin'), templateController.createTemplate);
router.put('/:id', authorize('admin'), templateController.updateTemplate);
router.delete('/:id', authorize('admin'), templateController.deleteTemplate);

module.exports = router;