// backend/src/models/AILog.js
const mongoose = require('mongoose');
const aiLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  operation: {
    type: String,
    required: true,
    enum: ['background_removal', 'image_enhancement', 'upscaling', 'style_transfer', 'colorization', 'object_removal', 'face_enhancement', 'image_generation', 'inpainting', 'text_to_image', 'image_to_image', 'video_generation', 'audio_generation', 'transcription', 'text_to_speech', 'other']
  },
  model: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['openai', 'stability', 'replicate', 'huggingface', 'local', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  input: {
    type: mongoose.Schema.Types.Mixed
  },
  output: {
    type: mongoose.Schema.Types.Mixed
  },
  settings: {
    type: mongoose.Schema.Types.Mixed
  },
  metrics: {
    processingTime: Number,
    inputTokens: Number,
    outputTokens: Number,
    cost: Number
  },
  creditsUsed: {
    type: Number,
    default: 1
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
aiLogSchema.index({
  user: 1,
  createdAt: -1
});
aiLogSchema.index({
  operation: 1,
  status: 1
});
aiLogSchema.index({
  provider: 1,
  model: 1
});

// Get user's AI usage stats
aiLogSchema.statics.getUserStats = async function (userId, startDate, endDate) {
  return this.aggregate([{
    $match: {
      user: new mongoose.Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      status: 'completed'
    }
  }, {
    $group: {
      _id: '$operation',
      count: {
        $sum: 1
      },
      totalCredits: {
        $sum: '$creditsUsed'
      },
      avgProcessingTime: {
        $avg: '$metrics.processingTime'
      }
    }
  }]);
};
module.exports = mongoose.model('AILog', aiLogSchema);