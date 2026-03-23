// backend/src/models/UserBehavior.js
const mongoose = require('mongoose');
const userBehaviorSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  behaviors: [{
    id: String,
    type: {
      type: String,
      enum: ['click', 'tool_selection', 'time_spent', 'error', 'success', 'mouse_pattern', 'keyboard_sequence', 'page_view', 'scroll', 'focus', 'blur']
    },
    data: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    context: mongoose.Schema.Types.Mixed
  }],
  analysis: {
    sessionDuration: Number,
    totalEvents: Number,
    eventTypes: mongoose.Schema.Types.Mixed,
    toolUsage: mongoose.Schema.Types.Mixed,
    timeDistribution: mongoose.Schema.Types.Mixed,
    errorRate: Number,
    successRate: Number,
    mousePatterns: mongoose.Schema.Types.Mixed,
    keyboardPatterns: mongoose.Schema.Types.Mixed,
    preferences: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  deviceInfo: {
    userAgent: String,
    screenSize: {
      width: Number,
      height: Number
    },
    platform: String,
    language: String
  },
  location: {
    url: String,
    path: String,
    hash: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userBehaviorSchema.index({
  userId: 1,
  timestamp: -1
});
userBehaviorSchema.index({
  sessionId: 1,
  timestamp: -1
});
userBehaviorSchema.index({
  'behaviors.type': 1,
  timestamp: -1
});
userBehaviorSchema.index({
  'analysis.successRate': -1
});

// Static methods
userBehaviorSchema.statics.getUserBehaviorHistory = async function (userId, options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate = null,
    endDate = null,
    eventType = null
  } = options;
  const query = {
    userId
  };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  if (eventType) {
    query['behaviors.type'] = eventType;
  }
  return this.find(query).sort({
    timestamp: -1
  }).limit(limit).skip(skip).populate('userId', 'username email');
};
userBehaviorSchema.statics.getUserStats = async function (userId, timeframe = '7d') {
  const endDate = new Date();
  const startDate = new Date();
  switch (timeframe) {
    case '1d':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  const pipeline = [{
    $match: {
      userId: mongoose.Types.ObjectId(userId),
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }
  }, {
    $group: {
      _id: null,
      totalSessions: {
        $sum: 1
      },
      totalEvents: {
        $sum: '$analysis.totalEvents'
      },
      avgSessionDuration: {
        $avg: '$analysis.sessionDuration'
      },
      avgSuccessRate: {
        $avg: '$analysis.successRate'
      },
      avgErrorRate: {
        $avg: '$analysis.errorRate'
      },
      uniqueTools: {
        $addToSet: '$analysis.toolUsage'
      }
    }
  }, {
    $project: {
      totalSessions: 1,
      totalEvents: 1,
      avgSessionDuration: {
        $round: ['$avgSessionDuration', 0]
      },
      avgSuccessRate: {
        $round: ['$avgSuccessRate', 2]
      },
      avgErrorRate: {
        $round: ['$avgErrorRate', 2]
      },
      uniqueToolsCount: {
        $size: '$uniqueTools'
      }
    }
  }];
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};
userBehaviorSchema.statics.getToolUsageStats = async function (userId, timeframe = '7d') {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const pipeline = [{
    $match: {
      userId: mongoose.Types.ObjectId(userId),
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }
  }, {
    $unwind: '$behaviors'
  }, {
    $match: {
      'behaviors.type': 'tool_selection'
    }
  }, {
    $group: {
      _id: '$behaviors.data.tool',
      usageCount: {
        $sum: 1
      },
      firstUsed: {
        $min: '$behaviors.timestamp'
      },
      lastUsed: {
        $max: '$behaviors.timestamp'
      }
    }
  }, {
    $sort: {
      usageCount: -1
    }
  }];
  return this.aggregate(pipeline);
};
userBehaviorSchema.statics.getSuccessPatterns = async function (userId, limit = 10) {
  const pipeline = [{
    $match: {
      userId: mongoose.Types.ObjectId(userId),
      'behaviors.type': 'success'
    }
  }, {
    $unwind: '$behaviors'
  }, {
    $match: {
      'behaviors.type': 'success'
    }
  }, {
    $sort: {
      'behaviors.timestamp': -1
    }
  }, {
    $limit: limit
  }, {
    $project: {
      operation: '$behaviors.data.operation',
      context: '$behaviors.context',
      timestamp: '$behaviors.timestamp'
    }
  }];
  return this.aggregate(pipeline);
};
userBehaviorSchema.statics.getErrorPatterns = async function (userId, limit = 10) {
  const pipeline = [{
    $match: {
      userId: mongoose.Types.ObjectId(userId),
      'behaviors.type': 'error'
    }
  }, {
    $unwind: '$behaviors'
  }, {
    $match: {
      'behaviors.type': 'error'
    }
  }, {
    $sort: {
      'behaviors.timestamp': -1
    }
  }, {
    $limit: limit
  }, {
    $project: {
      error: '$behaviors.data.message',
      context: '$behaviors.context',
      timestamp: '$behaviors.timestamp'
    }
  }];
  return this.aggregate(pipeline);
};

// Instance methods
userBehaviorSchema.methods.getBehaviorSummary = function () {
  const summary = {
    sessionId: this.sessionId,
    userId: this.userId,
    totalBehaviors: this.behaviors.length,
    sessionDuration: this.analysis?.sessionDuration || 0,
    successRate: this.analysis?.successRate || 0,
    errorRate: this.analysis?.errorRate || 0,
    toolUsage: this.analysis?.toolUsage || {},
    timestamp: this.timestamp
  };
  return summary;
};
userBehaviorSchema.methods.getMostUsedTools = function (limit = 5) {
  const toolUsage = this.analysis?.toolUsage || {};
  return Object.entries(toolUsage).sort(([, a], [, b]) => b - a).slice(0, limit).map(([tool, count]) => ({
    tool,
    count
  }));
};
userBehaviorSchema.methods.getPeakActivityHours = function () {
  const timeDistribution = this.analysis?.timeDistribution || {};
  return Object.entries(timeDistribution).sort(([, a], [, b]) => b - a).slice(0, 3).map(([hour, activity]) => ({
    hour: parseInt(hour),
    activity
  }));
};

// Middleware for automatic analysis
userBehaviorSchema.pre('save', function (next) {
  // Analyze behaviors if not already done
  if (!this.analysis && this.behaviors && this.behaviors.length > 0) {
    this.analysis = this.analyzeBehaviors();
  }
  next();
});

// Instance method for behavior analysis
userBehaviorSchema.methods.analyzeBehaviors = function () {
  const analysis = {
    sessionDuration: 0,
    totalEvents: this.behaviors.length,
    eventTypes: {},
    toolUsage: {},
    timeDistribution: {},
    errorRate: 0,
    successRate: 0,
    mousePatterns: {},
    keyboardPatterns: {},
    preferences: {}
  };
  if (this.behaviors.length === 0) {
    return analysis;
  }

  // Calculate session duration
  const firstEvent = this.behaviors[0];
  const lastEvent = this.behaviors[this.behaviors.length - 1];
  analysis.sessionDuration = lastEvent.timestamp - firstEvent.timestamp;

  // Count event types
  this.behaviors.forEach(behavior => {
    analysis.eventTypes[behavior.type] = (analysis.eventTypes[behavior.type] || 0) + 1;

    // Tool usage
    if (behavior.type === 'tool_selection' && behavior.data.tool) {
      analysis.toolUsage[behavior.data.tool] = (analysis.toolUsage[behavior.data.tool] || 0) + 1;
    }

    // Time distribution
    const hour = new Date(behavior.timestamp).getHours();
    analysis.timeDistribution[hour] = (analysis.timeDistribution[hour] || 0) + 1;

    // Mouse patterns
    if (behavior.type === 'mouse_pattern') {
      analysis.mousePatterns = {
        avgVelocity: behavior.data.avgVelocity || 0,
        totalDistance: behavior.data.totalDistance || 0,
        sampleCount: behavior.data.sampleCount || 0
      };
    }

    // Keyboard patterns
    if (behavior.type === 'keyboard_sequence') {
      analysis.keyboardPatterns = {
        sequenceLength: behavior.data.length || 0,
        shortcuts: behavior.data.shortcuts || []
      };
    }
  });

  // Calculate rates
  const totalEvents = analysis.totalEvents;
  analysis.errorRate = totalEvents > 0 ? (analysis.eventTypes.error || 0) / totalEvents * 100 : 0;
  analysis.successRate = totalEvents > 0 ? (analysis.eventTypes.success || 0) / totalEvents * 100 : 0;

  // Extract preferences
  analysis.preferences = this.extractPreferences();
  return analysis;
};
userBehaviorSchema.methods.extractPreferences = function () {
  const preferences = {
    preferredTools: {},
    workingHours: {},
    errorProneOperations: [],
    successfulPatterns: [],
    mouseSpeed: 'medium',
    keyboardUsage: 'medium',
    learningStyle: 'visual'
  };

  // Tool preferences
  const toolCounts = this.analysis?.toolUsage || {};
  preferences.preferredTools = Object.entries(toolCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([tool, count]) => ({
    tool,
    usage: count
  }));

  // Working hours
  const hours = this.analysis?.timeDistribution || {};
  preferences.workingHours = Object.entries(hours).sort(([, a], [, b]) => b - a).slice(0, 3).map(([hour, activity]) => ({
    hour: parseInt(hour),
    activity
  }));

  // Mouse speed
  const avgVelocity = this.analysis?.mousePatterns?.avgVelocity || 0;
  if (avgVelocity < 0.5) {
    preferences.mouseSpeed = 'slow';
  } else if (avgVelocity > 1.5) {
    preferences.mouseSpeed = 'fast';
  }

  // Keyboard usage
  const sequenceLength = this.analysis?.keyboardPatterns?.sequenceLength || 0;
  if (sequenceLength < 5) {
    preferences.keyboardUsage = 'minimal';
  } else if (sequenceLength > 15) {
    preferences.keyboardUsage = 'heavy';
  }
  return preferences;
};

// Virtual fields
userBehaviorSchema.virtual('behaviorsByType').get(function () {
  const behaviorsByType = {};
  this.behaviors.forEach(behavior => {
    if (!behaviorsByType[behavior.type]) {
      behaviorsByType[behavior.type] = [];
    }
    behaviorsByType[behavior.type].push(behavior);
  });
  return behaviorsByType;
});
userBehaviorSchema.virtual('recentErrors').get(function () {
  return this.behaviors.filter(b => b.type === 'error').sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
});
userBehaviorSchema.virtual('recentSuccesses').get(function () {
  return this.behaviors.filter(b => b.type === 'success').sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
});

// Static method to clean old data
userBehaviorSchema.statics.cleanupOldData = function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  return this.deleteMany({
    timestamp: {
      $lt: cutoffDate
    }
  });
};
module.exports = mongoose.model('UserBehavior', userBehaviorSchema);