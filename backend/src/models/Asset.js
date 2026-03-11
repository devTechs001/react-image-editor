// backend/src/models/Asset.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'font', 'other'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  storageProvider: {
    type: String,
    enum: ['s3', 'cloudinary', 'local'],
    default: 's3'
  },
  storageKey: {
    type: String,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number, // For video/audio
  metadata: {
    format: String,
    colorSpace: String,
    hasAlpha: Boolean,
    orientation: Number,
    dpi: Number,
    // Video specific
    codec: String,
    frameRate: Number,
    bitrate: Number,
    // Audio specific
    sampleRate: Number,
    channels: Number,
    // EXIF data
    exif: mongoose.Schema.Types.Mixed
  },
  tags: [{
    type: String,
    trim: true
  }],
  folder: {
    type: String,
    default: 'root'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  versions: [{
    url: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    createdAt: { type: Date, default: Date.now }
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    model: String,
    prompt: String,
    settings: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ user: 1, type: 1 });
assetSchema.index({ user: 1, folder: 1 });
assetSchema.index({ user: 1, tags: 1 });
assetSchema.index({ name: 'text' });

// Virtual for formatted size
assetSchema.virtual('formattedSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

module.exports = mongoose.model('Asset', assetSchema);