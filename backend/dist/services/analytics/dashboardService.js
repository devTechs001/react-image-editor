// backend/src/services/analytics/dashboardService.js
const User = require('../../models/User');
const Project = require('../../models/Project');
const Asset = require('../../models/Asset');

// Get user dashboard statistics
const getUserStats = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get project counts
  const totalProjects = await Project.countDocuments({
    user: userId
  });
  const activeProjects = await Project.countDocuments({
    user: userId,
    status: 'active'
  });

  // Get asset counts
  const totalAssets = await Asset.countDocuments({
    user: userId
  });

  // Calculate storage used
  const storageUsed = user.usage.storageUsed;
  const storageLimit = user.credits.storage;
  const storagePercentage = storageUsed / storageLimit * 100;

  // Calculate AI credits
  const aiCreditsRemaining = user.credits.ai - user.usage.aiCreditsUsed;
  const aiCreditsPercentage = (user.credits.ai - user.usage.aiCreditsUsed) / user.credits.ai * 100;

  // Calculate exports
  const exportsRemaining = user.credits.exports - user.usage.exportsThisMonth;
  const exportsPercentage = (user.credits.exports - user.usage.exportsThisMonth) / user.credits.exports * 100;

  // Get recent projects
  const recentProjects = await Project.find({
    user: userId
  }).sort({
    updatedAt: -1
  }).limit(5).select('name type thumbnail updatedAt status');

  // Get activity summary (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const projectsCreatedThisWeek = await Project.countDocuments({
    user: userId,
    createdAt: {
      $gte: sevenDaysAgo
    }
  });
  const assetsUploadedThisWeek = await Asset.countDocuments({
    user: userId,
    createdAt: {
      $gte: sevenDaysAgo
    }
  });
  return {
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      role: user.role
    },
    stats: {
      totalProjects,
      activeProjects,
      totalAssets,
      storage: {
        used: storageUsed,
        limit: storageLimit,
        percentage: Math.round(storagePercentage * 100) / 100
      },
      aiCredits: {
        remaining: aiCreditsRemaining,
        total: user.credits.ai,
        percentage: Math.round(aiCreditsPercentage * 100) / 100
      },
      exports: {
        remaining: exportsRemaining,
        total: user.credits.exports,
        percentage: Math.round(exportsPercentage * 100) / 100
      }
    },
    activity: {
      projectsCreatedThisWeek,
      assetsUploadedThisWeek
    },
    recentProjects,
    subscription: {
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      plan: user.plan
    }
  };
};

// Get admin dashboard statistics
const getAdminStats = async () => {
  // Total users
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    isActive: true,
    isVerified: true
  });

  // Users by plan
  const usersByPlan = await User.aggregate([{
    $group: {
      _id: '$plan',
      count: {
        $sum: 1
      }
    }
  }]);

  // Total projects
  const totalProjects = await Project.countDocuments();

  // Total assets
  const totalAssets = await Asset.countDocuments();

  // Recent users (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: thirtyDaysAgo
    }
  });

  // Revenue (if subscription data available)
  const payingUsers = await User.countDocuments({
    plan: {
      $in: ['pro', 'enterprise']
    },
    'subscription.status': 'active'
  });
  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      byPlan: usersByPlan.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    projects: {
      total: totalProjects
    },
    assets: {
      total: totalAssets
    },
    revenue: {
      payingUsers
    }
  };
};

// Get quick actions for dashboard
const getQuickActions = userPlan => {
  const actions = [{
    id: 'new-project',
    label: 'New Project',
    icon: 'folder-plus',
    route: '/projects/new',
    available: true
  }, {
    id: 'upload-asset',
    label: 'Upload Asset',
    icon: 'upload',
    route: '/assets/upload',
    available: true
  }, {
    id: 'browse-templates',
    label: 'Browse Templates',
    icon: 'layout-grid',
    route: '/templates',
    available: true
  }];

  // Add AI-specific actions for pro/enterprise users
  if (['pro', 'enterprise'].includes(userPlan)) {
    actions.push({
      id: 'ai-generate',
      label: 'AI Generate',
      icon: 'sparkles',
      route: '/ai/generate',
      available: true
    });
  }
  return actions;
};
module.exports = {
  getUserStats,
  getAdminStats,
  getQuickActions
};