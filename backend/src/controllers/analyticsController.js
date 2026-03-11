// backend/src/controllers/analyticsController.js
const Project = require('../models/Project');
const Asset = require('../models/Asset');
const Export = require('../models/Export');
const AILog = require('../models/AILog');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// Get user dashboard analytics
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Get counts
    const [
      projectCount,
      assetCount,
      exportCount,
      recentProjects,
      aiUsage
    ] = await Promise.all([
      Project.countDocuments({ user: userId, status: { $ne: 'deleted' } }),
      Asset.countDocuments({ user: userId }),
      Export.countDocuments({ user: userId, status: 'completed' }),
      Project.find({ user: userId, status: { $ne: 'deleted' } })
        .sort('-updatedAt')
        .limit(5)
        .select('name type thumbnail updatedAt'),
      AILog.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            credits: { $sum: '$creditsUsed' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Calculate storage
    const storageUsed = req.user.usage.storageUsed;
    const storageTotal = req.user.credits.storage;

    res.json({
      success: true,
      data: {
        stats: {
          projects: projectCount,
          assets: assetCount,
          exports: exportCount,
          aiCreditsUsed: req.user.usage.aiCreditsUsed,
          aiCreditsRemaining: req.user.credits.ai - req.user.usage.aiCreditsUsed
        },
        storage: {
          used: storageUsed,
          total: storageTotal,
          percentage: Math.round((storageUsed / storageTotal) * 100)
        },
        recentProjects,
        aiUsage
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get usage statistics
exports.getUsageStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    }

    const [projects, exports, aiLogs] = await Promise.all([
      Project.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Export.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AILog.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$operation',
            count: { $sum: 1 },
            credits: { $sum: '$creditsUsed' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period,
        projects,
        exports,
        aiOperations: aiLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get export statistics
exports.getExportStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Export.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$format',
          count: { $sum: 1 },
          totalSize: { $sum: '$output.size' },
          avgProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const recentExports = await Export.find({ user: userId })
      .sort('-createdAt')
      .limit(10)
      .populate('project', 'name');

    res.json({
      success: true,
      data: {
        byFormat: stats,
        recent: recentExports
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get AI usage statistics
exports.getAIStats = async (req, res, next) => {
  try {
    const stats = await AILog.getUserStats(
      req.user._id,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    );

    res.json({
      success: true,
      data: {
        stats,
        creditsUsed: req.user.usage.aiCreditsUsed,
        creditsRemaining: req.user.credits.ai - req.user.usage.aiCreditsUsed
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get overview
exports.getAdminOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      totalProjects,
      totalExports,
      totalAIOperations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      Project.countDocuments(),
      Export.countDocuments({ status: 'completed' }),
      AILog.countDocuments({ status: 'completed' })
    ]);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Plan distribution
    const planDistribution = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          projects: totalProjects,
          exports: totalExports,
          aiOperations: totalAIOperations
        },
        newUsers: {
          today: newUsersToday,
          thisMonth: newUsersThisMonth
        },
        userGrowth,
        planDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const users = await User.find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password -refreshTokens');

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get revenue statistics
exports.getRevenueStats = async (req, res, next) => {
  try {
    // This would integrate with Stripe for real revenue data
    const paidUsers = await User.aggregate([
      {
        $match: {
          plan: { $ne: 'free' },
          'subscription.status': 'active'
        }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const planPrices = {
      starter: 9,
      pro: 19,
      enterprise: 49
    };

    const mrr = paidUsers.reduce((sum, p) => {
      return sum + (p.count * (planPrices[p._id] || 0));
    }, 0);

    res.json({
      success: true,
      data: {
        mrr,
        paidUsers,
        totalPaidUsers: paidUsers.reduce((sum, p) => sum + p.count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};