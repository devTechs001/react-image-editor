// backend/src/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const imageRoutes = require('./images');
const videoRoutes = require('./videos');
const audioRoutes = require('./audio');
const aiRoutes = require('./ai');
const userBehaviorRoutes = require('./userBehavior');
const templateRoutes = require('./templates');
const assetRoutes = require('./assets');
const exportRoutes = require('./export');
const storageRoutes = require('./storage');
const dashboardRoutes = require('./dashboard');
const webhookRoutes = require('./webhooks');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/images', imageRoutes);
router.use('/videos', videoRoutes);
router.use('/audio', audioRoutes);
router.use('/ai', aiRoutes);
router.use('/user-behavior', userBehaviorRoutes);
router.use('/templates', templateRoutes);
router.use('/assets', assetRoutes);
router.use('/export', exportRoutes);
router.use('/storage', storageRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/webhooks', webhookRoutes);

// API Documentation
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Media Editor API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      projects: '/api/v1/projects',
      images: '/api/v1/images',
      videos: '/api/v1/videos',
      audio: '/api/v1/audio',
      ai: '/api/v1/ai',
      userBehavior: '/api/v1/user-behavior',
      templates: '/api/v1/templates',
      assets: '/api/v1/assets',
      export: '/api/v1/export',
      storage: '/api/v1/storage',
      dashboard: '/api/v1/dashboard',
      webhooks: '/api/v1/webhooks'
    }
  });
});
module.exports = router;