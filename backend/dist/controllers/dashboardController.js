// backend/src/controllers/dashboardController.js
const dashboardService = require('../services/analytics/dashboardService');
const {
  AppError
} = require('../middleware/errorHandler');

// Get user dashboard
const getUserDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getUserStats(req.user._id);
    const quickActions = dashboardService.getQuickActions(req.user.plan);
    res.json({
      success: true,
      data: {
        ...stats,
        quickActions
      }
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return next(new AppError(error.message, 404));
    }
    next(error);
  }
};

// Get admin dashboard
const getAdminDashboard = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Access denied. Admin only.', 403));
    }
    const stats = await dashboardService.getAdminStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getUserDashboard,
  getAdminDashboard
};