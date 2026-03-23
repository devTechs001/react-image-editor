// backend/src/models/Export.js
const mongoose = require('mongoose');
const exportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  format: {
    type: String,
    required: true,
    enum: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'mp4', 'webm', 'mov', 'mp3', 'wav']
  },
  settings: {
    quality: {
      type: Number,
      default: 100
    },
    scale: {
      type: Number,
      default: 1
    },
    width: Number,
    height: Number,
    fps: Number,
    bitrate: Number,
    codec: String,
    preserveMetadata: {
      type: Boolean,
      default: true
    },
    watermark: {
      enabled: {
        type: Boolean,
        default: false
      },
      text: String,
      position: String,
      opacity: Number
    },
    compression: {
      enabled: {
        type: Boolean,
        default: false
      },
      level: String
    }
  },
  output: {
    url: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  error: {
    message: String,
    code: String
  },
  processingTime: Number,
  // in milliseconds
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Indexes
exportSchema.index({
  user: 1,
  createdAt: -1
});
exportSchema.index({
  status: 1
});
exportSchema.index({
  expiresAt: 1
}, {
  expireAfterSeconds: 0
});
module.exports = mongoose.model('Export', exportSchema);