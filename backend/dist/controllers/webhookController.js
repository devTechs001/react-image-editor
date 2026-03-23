// backend/src/controllers/webhookController.js
const crypto = require('crypto');
const config = require('../config/app');
const User = require('../models/User');
const logger = require('../utils/logger');

// Stripe webhook
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = config.stripe.webhookSecret;
    let event;
    try {
      event = require('stripe')(config.stripe.secretKey).webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }
    res.json({
      received: true
    });
  } catch (error) {
    next(error);
  }
};

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;

  // Update user subscription
  user.subscription.stripeCustomerId = session.customer;
  user.subscription.stripeSubscriptionId = session.subscription;
  user.subscription.status = 'active';

  // Set plan based on plan ID
  if (planId?.includes('pro')) {
    user.plan = 'pro';
  } else if (planId?.includes('enterprise')) {
    user.plan = 'enterprise';
  }

  // Add credits based on plan
  if (user.plan === 'pro') {
    user.credits.ai = 500;
    user.credits.storage = 1024 * 1024 * 1024 * 10; // 10GB
    user.credits.exports = 100;
  } else if (user.plan === 'enterprise') {
    user.credits.ai = 2000;
    user.credits.storage = 1024 * 1024 * 1024 * 100; // 100GB
    user.credits.exports = 1000;
  }
  await user.save();
  logger.info(`User ${userId} subscription activated: ${user.plan}`);
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });
  if (!user) return;
  user.subscription.status = subscription.status;
  if (subscription.status === 'active') {
    user.isActive = true;
  } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
    // Grace period logic could be added here
  }
  await user.save();
  logger.info(`User ${user._id} subscription updated: ${subscription.status}`);
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });
  if (!user) return;
  user.subscription.status = 'canceled';
  user.plan = 'free';
  user.credits.ai = 50;
  user.credits.storage = 1024 * 1024 * 500; // 500MB
  user.credits.exports = 10;
  await user.save();
  logger.info(`User ${user._id} subscription canceled, downgraded to free`);
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  logger.info(`Invoice payment succeeded: ${invoice.id}`);
  // Could add credits or extend subscription here
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  const user = await User.findOne({
    'subscription.stripeCustomerId': invoice.customer
  });
  if (!user) return;
  user.subscription.status = 'past_due';
  await user.save();
  logger.warn(`User ${user._id} payment failed, subscription past due`);

  // Send email notification
  try {
    const emailService = require('../services/email/emailService');
    await emailService.sendPaymentFailedEmail(user.email, user.name);
  } catch (error) {
    logger.error('Failed to send payment failed email:', error);
  }
}

// PayPal webhook (placeholder)
exports.paypalWebhook = async (req, res, next) => {
  try {
    const eventType = req.body.event_type;
    logger.info('PayPal webhook received:', eventType);

    // Handle PayPal events similar to Stripe
    // Implementation depends on PayPal webhook structure

    res.json({
      received: true
    });
  } catch (error) {
    next(error);
  }
};

// GitHub webhook for deployments (placeholder)
exports.githubWebhook = async (req, res, next) => {
  try {
    const event = req.headers['x-github-event'];
    logger.info('GitHub webhook received:', event);

    // Handle GitHub events
    // Could trigger deployments, updates, etc.

    res.json({
      received: true
    });
  } catch (error) {
    next(error);
  }
};

// AI Processing webhook (for async AI jobs)
exports.aiProcessingWebhook = async (req, res, next) => {
  try {
    const {
      jobId,
      status,
      result,
      error
    } = req.body;
    logger.info('AI Processing webhook received:', {
      jobId,
      status
    });

    // Find the job in database and update status
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }
    job.status = status;
    job.completedAt = new Date();
    if (status === 'completed') {
      job.result = result;

      // Notify user via WebSocket
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(job.user.toString()).emit('ai:completed', {
        jobId: job._id,
        result
      });

      // Send email notification
      const User = require('../models/User');
      const user = await User.findById(job.user);
      if (user) {
        const emailService = require('../services/email/emailService');
        await emailService.sendAITaskCompletedEmail(user.email, job.type);
      }
    } else if (status === 'failed') {
      job.error = error;

      // Notify user of failure
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(job.user.toString()).emit('ai:failed', {
        jobId: job._id,
        error
      });
    }
    await job.save();
    res.json({
      received: true
    });
  } catch (error) {
    logger.error('AI Processing webhook error:', error);
    next(error);
  }
};

// Export completion webhook
exports.exportWebhook = async (req, res, next) => {
  try {
    const {
      exportId,
      status,
      downloadUrl,
      error
    } = req.body;
    logger.info('Export webhook received:', {
      exportId,
      status
    });
    const Export = require('../models/Export');
    const exportDoc = await Export.findById(exportId).populate('user');
    if (!exportDoc) {
      return res.status(404).json({
        error: 'Export not found'
      });
    }
    exportDoc.status = status;
    exportDoc.completedAt = new Date();
    if (status === 'completed') {
      exportDoc.downloadUrl = downloadUrl;

      // Decrement export quota
      const User = require('../models/User');
      const user = exportDoc.user;
      if (user) {
        user.usage.exportsThisMonth = (user.usage.exportsThisMonth || 0) + 1;
        await user.save();

        // Notify via WebSocket
        const {
          getIO
        } = require('../websocket/socketServer');
        const io = getIO();
        io.to(user._id.toString()).emit('export:completed', {
          exportId: exportDoc._id,
          downloadUrl
        });

        // Send email
        const emailService = require('../services/email/emailService');
        await emailService.sendExportCompletedEmail(user.email, exportDoc.name);
      }
    } else if (status === 'failed') {
      exportDoc.error = error;
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(exportDoc.user._id.toString()).emit('export:failed', {
        exportId: exportDoc._id,
        error
      });
    }
    await exportDoc.save();
    res.json({
      received: true
    });
  } catch (error) {
    logger.error('Export webhook error:', error);
    next(error);
  }
};

// Video processing webhook
exports.videoProcessingWebhook = async (req, res, next) => {
  try {
    const {
      jobId,
      status,
      result,
      progress
    } = req.body;
    logger.info('Video processing webhook received:', {
      jobId,
      status,
      progress
    });
    const VideoJob = require('../models/VideoJob');
    const job = await VideoJob.findById(jobId).populate('user');
    if (!job) {
      return res.status(404).json({
        error: 'Video job not found'
      });
    }
    if (progress !== undefined) {
      job.progress = progress;

      // Send progress update via WebSocket
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(job.user._id.toString()).emit('video:progress', {
        jobId: job._id,
        progress
      });
    }
    if (status === 'completed') {
      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(job.user._id.toString()).emit('video:completed', {
        jobId: job._id,
        result
      });
      const emailService = require('../services/email/emailService');
      await emailService.sendVideoProcessingCompletedEmail(job.user.email, job.name);
    } else if (status === 'failed') {
      job.status = 'failed';
      job.error = error;
      const {
        getIO
      } = require('../websocket/socketServer');
      const io = getIO();
      io.to(job.user._id.toString()).emit('video:failed', {
        jobId: job._id,
        error
      });
    }
    await job.save();
    res.json({
      received: true
    });
  } catch (error) {
    logger.error('Video processing webhook error:', error);
    next(error);
  }
};

// Generic webhook for third-party integrations
exports.genericWebhook = async (req, res, next) => {
  try {
    const {
      source,
      event,
      data
    } = req.body;
    logger.info('Generic webhook received:', {
      source,
      event
    });

    // Log webhook event
    const WebhookLog = require('../models/WebhookLog');
    await WebhookLog.create({
      source,
      event,
      data,
      receivedAt: new Date()
    });

    // Process based on source and event
    switch (source) {
      case 'zapier':
        await handleZapierWebhook(event, data);
        break;
      case 'make':
        await handleMakeWebhook(event, data);
        break;
      case 'n8n':
        await handleN8NWebhook(event, data);
        break;
      default:
        logger.warn(`Unknown webhook source: ${source}`);
    }
    res.json({
      received: true
    });
  } catch (error) {
    logger.error('Generic webhook error:', error);
    next(error);
  }
};

// Helper functions for automation platforms
async function handleZapierWebhook(event, data) {
  logger.info('Processing Zapier webhook:', event);
  // Implement Zapier-specific logic
}
async function handleMakeWebhook(event, data) {
  logger.info('Processing Make webhook:', event);
  // Implement Make-specific logic
}
async function handleN8NWebhook(event, data) {
  logger.info('Processing n8n webhook:', event);
  // Implement n8n-specific logic
}