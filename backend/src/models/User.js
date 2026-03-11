// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/app');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'pro', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  },
  subscription: {
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'none'],
      default: 'none'
    },
    currentPeriodEnd: Date
  },
  credits: {
    ai: { type: Number, default: 50 },
    storage: { type: Number, default: 1024 * 1024 * 500 }, // 500MB
    exports: { type: Number, default: 10 }
  },
  usage: {
    aiCreditsUsed: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    exportsThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    defaultExportFormat: { type: String, default: 'png' },
    defaultQuality: { type: Number, default: 100 }
  },
  socialLinks: {
    google: String,
    github: String,
    twitter: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  refreshTokens: [{
    token: String,
    expires: Date,
    device: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for projects count
userSchema.virtual('projectsCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Pre-save middleware - hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiration }
  );
};

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  const token = jwt.sign(
    { id: this._id },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiration }
  );
  
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verifyToken;
};

// Check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.aiCreditsUsed = 0;
    this.usage.exportsThisMonth = 0;
    this.usage.lastResetDate = now;
    return true;
  }
  return false;
};

// Check if user has enough credits
userSchema.methods.hasCredits = function(type, amount = 1) {
  switch (type) {
    case 'ai':
      return (this.credits.ai - this.usage.aiCreditsUsed) >= amount;
    case 'storage':
      return (this.credits.storage - this.usage.storageUsed) >= amount;
    case 'exports':
      return (this.credits.exports - this.usage.exportsThisMonth) >= amount;
    default:
      return false;
  }
};

// Use credits
userSchema.methods.useCredits = function(type, amount = 1) {
  switch (type) {
    case 'ai':
      this.usage.aiCreditsUsed += amount;
      break;
    case 'storage':
      this.usage.storageUsed += amount;
      break;
    case 'exports':
      this.usage.exportsThisMonth += amount;
      break;
  }
};

module.exports = mongoose.model('User', userSchema);