// backend/src/models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'paused'],
    default: 'active'
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'manual'],
    default: 'stripe'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  stripePriceId: String,
  paypalSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  cancelReason: String,
  trialStart: Date,
  trialEnd: Date,
  metadata: {
    type: Map,
    of: String
  },
  billingHistory: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    currency: String,
    status: String,
    invoiceId: String,
    invoiceUrl: String
  }],
  upgrades: [{
    fromPlan: String,
    toPlan: String,
    date: { type: Date, default: Date.now },
    prorationAmount: Number
  }]
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

// Check if subscription is in trial
subscriptionSchema.methods.isInTrial = function() {
  if (!this.trialEnd) return false;
  return new Date() < this.trialEnd;
};

// Get days until renewal
subscriptionSchema.methods.getDaysUntilRenewal = function() {
  if (!this.currentPeriodEnd) return null;
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: cutoff },
    cancelAtPeriodEnd: false
  }).populate('user');
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
