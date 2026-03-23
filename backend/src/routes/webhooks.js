// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe webhook (raw body needed for signature verification)
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.stripeWebhook);

// PayPal webhook
router.post('/paypal', webhookController.paypalWebhook);

// AI Processing webhook
router.post('/ai-processing', webhookController.aiProcessingWebhook);

// Export completion webhook
router.post('/export', webhookController.exportWebhook);

// Video processing webhook
router.post('/video', webhookController.videoProcessingWebhook);

// GitHub webhook
router.post('/github', webhookController.githubWebhook);

// Generic webhook for third-party integrations
router.post('/generic', webhookController.genericWebhook);

// Webhook test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoints are active',
    available: [
      '/webhooks/stripe',
      '/webhooks/paypal',
      '/webhooks/ai-processing',
      '/webhooks/export',
      '/webhooks/video',
      '/webhooks/github',
      '/webhooks/generic'
    ]
  });
});

module.exports = router;
