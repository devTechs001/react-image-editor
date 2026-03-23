// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const {
  auth
} = require('../middleware/auth');

// All dashboard routes require authentication
router.use(auth);

// Get user dashboard
router.get('/', dashboardController.getUserDashboard);

// Get admin dashboard
router.get('/admin', dashboardController.getAdminDashboard);
module.exports = router;