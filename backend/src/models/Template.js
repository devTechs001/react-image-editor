// backend/src/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['social', 'marketing', 'presentation', 'print', 'video', 'other']
  },
  subcategory: String,
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok', 'pinterest', null]
  },
  thumbnail: {
    type: String,
    required: true
  },
  preview: String,
  canvas: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    backgroundColor: { type: String, default: '#ffffff' }
  },
  layers: [{
    type: mongoose.Schema.Types.Mixed
  }],
  fonts: [{
    family: String,
    url: String
  }],
  colors: [{
    name: String,
    value: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stats: {
    uses: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ platform: 1, isActive: 1 });
templateSchema.index({ featured: 1, isActive: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ name: 'text', description: 'text' });

// Increment uses
templateSchema.methods.incrementUses = function() {
  this.stats.uses += 1;
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);