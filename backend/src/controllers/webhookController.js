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
      event = require('stripe')(config.stripe.secretKey).webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
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

    res.json({ received: true });
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
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
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
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
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
  const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
  
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
    
    res.json({ received: true });
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
    
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
