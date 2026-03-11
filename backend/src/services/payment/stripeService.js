// backend/src/services/payment/stripeService.js
const Stripe = require('stripe');
const User = require('../../models/User');
const logger = require('../../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      aiCredits: 200,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
      exports: 50,
      removeWatermark: true,
      prioritySupport: false
    }
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      aiCredits: 1000,
      storage: 50 * 1024 * 1024 * 1024, // 50GB
      exports: -1, // Unlimited
      removeWatermark: true,
      prioritySupport: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      aiCredits: -1, // Unlimited
      storage: 500 * 1024 * 1024 * 1024, // 500GB
      exports: -1,
      removeWatermark: true,
      prioritySupport: true,
      customBranding: true
    }
  }
};

// Create or get Stripe customer
const getOrCreateCustomer = async (user) => {
  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString()
    }
  });

  user.subscription = user.subscription || {};
  user.subscription.stripeCustomerId = customer.id;
  await user.save({ validateBeforeSave: false });

  return customer.id;
};

// Create checkout session
const createCheckoutSession = async (userId, planId, options = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const plan = plans[planId];
  if (!plan) throw new Error('Invalid plan');

  const customerId = await getOrCreateCustomer(user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: plan.priceId,
      quantity: 1
    }],
    success_url: `${process.env.FRONTEND_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
    metadata: {
      userId: userId.toString(),
      planId
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        planId
      }
    },
    ...options
  });

  return { sessionId: session.id, url: session.url };
};

// Create customer portal session
const createPortalSession = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.subscription?.stripeCustomerId) {
    throw new Error('No subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/settings/billing`
  });

  return { url: session.url };
};

// Handle webhook events
const handleWebhook = async (event) => {
  logger.info(`Processing Stripe webhook: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionCanceled(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      logger.warn(`Unhandled webhook event: ${event.type}`);
  }
};

const handleCheckoutComplete = async (session) => {
  const userId = session.metadata.userId;
  const planId = session.metadata.planId;

  const user = await User.findById(userId);
  if (!user) return;

  const plan = plans[planId];
  user.plan = planId;
  user.subscription.stripeSubscriptionId = session.subscription;
  user.subscription.status = 'active';
  user.credits = {
    ai: plan.features.aiCredits,
    storage: plan.features.storage,
    exports: plan.features.exports
  };

  await user.save({ validateBeforeSave: false });
  logger.info(`User ${userId} subscribed to ${planId}`);
};

const handleSubscriptionUpdate = async (subscription) => {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });

  if (!user) return;

  user.subscription.status = subscription.status;
  user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  await user.save({ validateBeforeSave: false });
};

const handleSubscriptionCanceled = async (subscription) => {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });

  if (!user) return;

  user.plan = 'free';
  user.subscription.status = 'canceled';
  user.credits = {
    ai: 50,
    storage: 500 * 1024 * 1024, // 500MB
    exports: 10
  };

  await user.save({ validateBeforeSave: false });
  logger.info(`User ${user._id} subscription canceled`);
};

const handlePaymentSucceeded = async (invoice) => {
  const customerId = invoice.customer;

  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId
  });

  if (!user) return;

  // Reset monthly usage
  user.usage.aiCreditsUsed = 0;
  user.usage.exportsThisMonth = 0;
  user.usage.lastResetDate = new Date();

  await user.save({ validateBeforeSave: false });
};

const handlePaymentFailed = async (invoice) => {
  const customerId = invoice.customer;

  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId
  });

  if (!user) return;

  user.subscription.status = 'past_due';
  await user.save({ validateBeforeSave: false });

  // Send email notification
  const emailService = require('../email/emailService');
  await emailService.sendEmail({
    to: user.email,
    subject: 'Payment Failed - AI Media Editor',
    html: `
      <p>Hi ${user.name},</p>
      <p>We were unable to process your payment. Please update your payment method to continue using AI Media Editor.</p>
      <a href="${process.env.FRONTEND_URL}/settings/billing">Update Payment Method</a>
    `
  });
};

// Get subscription status
const getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.subscription?.stripeSubscriptionId) {
    return {
      plan: 'free',
      status: 'none',
      credits: user.credits,
      usage: user.usage
    };
  }

  const subscription = await stripe.subscriptions.retrieve(
    user.subscription.stripeSubscriptionId
  );

  return {
    plan: user.plan,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    credits: user.credits,
    usage: user.usage
  };
};

// Cancel subscription
const cancelSubscription = async (userId, immediately = false) => {
  const user = await User.findById(userId);
  if (!user?.subscription?.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  if (immediately) {
    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
  } else {
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
  }

  return { success: true };
};

// Resume subscription
const resumeSubscription = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.subscription?.stripeSubscriptionId) {
    throw new Error('No subscription found');
  }

  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    cancel_at_period_end: false
  });

  user.subscription.status = 'active';
  await user.save({ validateBeforeSave: false });

  return { success: true };
};

// Get invoices
const getInvoices = async (userId, limit = 10) => {
  const user = await User.findById(userId);
  if (!user?.subscription?.stripeCustomerId) {
    return [];
  }

  const invoices = await stripe.invoices.list({
    customer: user.subscription.stripeCustomerId,
    limit
  });

  return invoices.data.map(inv => ({
    id: inv.id,
    number: inv.number,
    date: new Date(inv.created * 1000),
    amount: inv.amount_paid / 100,
    currency: inv.currency.toUpperCase(),
    status: inv.status,
    pdfUrl: inv.invoice_pdf
  }));
};

module.exports = {
  plans,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
  getInvoices
};