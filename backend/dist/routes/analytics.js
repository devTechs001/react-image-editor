// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const {
  auth
} = require('../middleware/auth');
const {
  authorize
} = require('../middleware/authorize');
const {
  cache
} = require('../middleware/cache');
router.use(auth);

// User analytics
router.get('/dashboard', cache(60), analyticsController.getDashboard);
router.get('/usage', analyticsController.getUsageStats);
router.get('/exports', analyticsController.getExportStats);
router.get('/ai', analyticsController.getAIStats);

// Admin analytics
router.get('/admin/overview', authorize('admin'), analyticsController.getAdminOverview);
router.get('/admin/users', authorize('admin'), analyticsController.getUserStats);
router.get('/admin/revenue', authorize('admin'), analyticsController.getRevenueStats);
module.exports = router;