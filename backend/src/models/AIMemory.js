// backend/src/models/AIMemory.js
const mongoose = require('mongoose');

const aiMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  memoryType: {
    type: String,
    enum: ['preference', 'feedback', 'learning_progress', 'recommendation', 'error_pattern', 'success_pattern', 'workflow_pattern'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  context: {
    operation: String,
    tool: String,
    page: String,
    timestamp: Date,
    additionalData: mongoose.Schema.Types.Mixed
  },
  metadata: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    importance: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    frequency: {
      type: Number,
      default: 1
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    },
    tags: [String],
    relatedMemories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIMemory'
    }]
  },
  learningData: {
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    progressScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    masteryAreas: [String],
    improvementAreas: [String],
    recentPerformance: [{
      operation: String,
      success: Boolean,
      duration: Number,
      timestamp: Date,
      score: Number
    }],
    personalizedTips: [{
      tip: String,
      applicable: Boolean,
      effectiveness: Number,
      createdAt: Date
    }]
  },
  feedbackHistory: [{
    operation: String,
    feedback: mongoose.Schema.Types.Mixed,
    analysis: mongoose.Schema.Types.Mixed,
    userReaction: {
      helpful: Boolean,
      rating: Number,
      comment: String
    },
    timestamp: Date
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['tool', 'feature', 'workflow', 'learning', 'optimization']
    },
    title: String,
    description: String,
    action: String,
    confidence: Number,
    applied: Boolean,
    effectiveness: Number,
    timestamp: Date,
    expiresAt: Date
  }],
  patterns: {
    workflows: [{
      name: String,
      steps: [String],
      efficiency: Number,
      successRate: Number,
      frequency: Number,
      lastUsed: Date
    }],
    errors: [{
      type: String,
      frequency: Number,
      contexts: [String],
      solutions: [String],
      lastOccurrence: Date
    }],
    successes: [{
      type: String,
      frequency: Number,
      contexts: [String],
      factors: [String],
      lastOccurrence: Date
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
aiMemorySchema.index({ userId: 1, memoryType: 1 });
aiMemorySchema.index({ userId: 1, 'metadata.importance': -1 });
aiMemorySchema.index({ userId: 1, 'metadata.lastAccessed': -1 });
aiMemorySchema.index({ 'metadata.tags': 1 });
aiMemorySchema.index({ 'learningData.skillLevel': 1 });

// Static methods
aiMemorySchema.statics.getUserMemory = async function(userId, options = {}) {
  const {
    memoryType = null,
    limit = 50,
    sortBy = 'importance',
    sortOrder = -1,
    tags = null
  } = options;

  const query = { userId };
  
  if (memoryType) {
    query.memoryType = memoryType;
  }
  
  if (tags) {
    query['metadata.tags'] = { $in: tags };
  }

  const sort = {};
  sort[`metadata.${sortBy}`] = sortOrder;

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .populate('relatedMemories');
};

aiMemorySchema.statics.getRecommendations = async function(userId, context = {}) {
  const {
    operation = null,
    currentTool = null,
    skillLevel = null,
    limit = 10
  } = context;

  const query = { 
    userId,
    memoryType: 'recommendation',
    'recommendations.applied': { $ne: true }
  };

  if (operation) {
    query['recommendations.action'] = { $regex: operation, $options: 'i' };
  }

  if (currentTool) {
    query['recommendations.action'] = { $regex: currentTool, $options: 'i' };
  }

  return this.find(query)
    .sort({ 'recommendations.confidence': -1 })
    .limit(limit);
};

aiMemorySchema.statics.getLearningProgress = async function(userId) {
  return this.findOne({ 
    userId, 
    memoryType: 'learning_progress' 
  }).sort({ createdAt: -1 });
};

aiMemorySchema.statics.updateLearningProgress = async function(userId, operation, result) {
  try {
    let memory = await this.findOne({ 
      userId, 
      memoryType: 'learning_progress' 
    });

    if (!memory) {
      memory = new this({
        userId,
        memoryType: 'learning_progress',
        content: { operations: [] },
        learningData: {
          skillLevel: 'beginner',
          progressScore: 0,
          masteryAreas: [],
          improvementAreas: [],
          recentPerformance: [],
          personalizedTips: []
        }
      });
    }

    // Update recent performance
    memory.learningData.recentPerformance.push({
      operation,
      success: result.success || false,
      duration: result.duration || 0,
      timestamp: new Date(),
      score: result.score || 0
    });

    // Keep only last 50 performances
    if (memory.learningData.recentPerformance.length > 50) {
      memory.learningData.recentPerformance = memory.learningData.recentPerformance.slice(-50);
    }

    // Recalculate skill level and progress
    const recentPerformances = memory.learningData.recentPerformance.slice(-20);
    const successRate = recentPerformances.filter(p => p.success).length / recentPerformances.length;
    const avgScore = recentPerformances.reduce((sum, p) => sum + p.score, 0) / recentPerformances.length;

    // Update skill level
    if (successRate >= 0.9 && avgScore >= 0.8) {
      memory.learningData.skillLevel = 'expert';
    } else if (successRate >= 0.7 && avgScore >= 0.6) {
      memory.learningData.skillLevel = 'advanced';
    } else if (successRate >= 0.5 && avgScore >= 0.4) {
      memory.learningData.skillLevel = 'intermediate';
    } else {
      memory.learningData.skillLevel = 'beginner';
    }

    // Update progress score
    memory.learningData.progressScore = Math.min(100, successRate * 50 + avgScore * 50);

    // Update mastery and improvement areas
    await this.updateSkillAreas(memory, recentPerformances);

    memory.metadata.lastAccessed = new Date();
    memory.updatedAt = new Date();

    await memory.save();
    return memory;

  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw error;
  }
};

aiMemorySchema.statics.storeFeedback = async function(userId, operation, feedback, analysis) {
  try {
    const memory = new this({
      userId,
      memoryType: 'feedback',
      content: feedback,
      context: {
        operation,
        timestamp: new Date()
      },
      metadata: {
        confidence: analysis.confidence || 0.5,
        importance: 6
      },
      feedbackHistory: [{
        operation,
        feedback,
        analysis,
        timestamp: new Date()
      }]
    });

    await memory.save();
    return memory;

  } catch (error) {
    console.error('Error storing feedback:', error);
    throw error;
  }
};

aiMemorySchema.statics.getPersonalizedTips = async function(userId, context = {}) {
  const { operation = null, limit = 5 } = context;

  const query = { 
    userId,
    memoryType: 'preference',
    'learningData.personalizedTips.applicable': true
  };

  if (operation) {
    query['content.operation'] = operation;
  }

  return this.find(query)
    .sort({ 'learningData.personalizedTips.effectiveness': -1 })
    .limit(limit)
    .select('learningData.personalizedTips');
};

// Instance methods
aiMemorySchema.methods.addRecommendation = function(recommendation) {
  this.recommendations.push({
    ...recommendation,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Keep only recent recommendations
  if (this.recommendations.length > 20) {
    this.recommendations = this.recommendations.slice(-20);
  }

  return this.save();
};

aiMemorySchema.methods.updateRecommendationEffectiveness = function(recommendationId, applied, effectiveness) {
  const recommendation = this.recommendations.id(recommendationId);
  if (recommendation) {
    recommendation.applied = applied;
    recommendation.effectiveness = effectiveness;
  }

  return this.save();
};

aiMemorySchema.methods.addPersonalizedTip = function(tip) {
  this.learningData.personalizedTips.push({
    ...tip,
    createdAt: new Date()
  });

  // Keep only recent tips
  if (this.learningData.personalizedTips.length > 20) {
    this.learningData.personalizedTips = this.learningData.personalizedTips.slice(-20);
  }

  return this.save();
};

aiMemorySchema.methods.recordWorkflowPattern = function(workflow) {
  const existingPattern = this.patterns.workflows.find(w => w.name === workflow.name);
  
  if (existingPattern) {
    existingPattern.frequency += 1;
    existingPattern.efficiency = workflow.efficiency;
    existingPattern.successRate = workflow.successRate;
    existingPattern.lastUsed = new Date();
  } else {
    this.patterns.workflows.push({
      ...workflow,
      frequency: 1,
      lastUsed: new Date()
    });
  }

  return this.save();
};

aiMemorySchema.methods.recordErrorPattern = function(error) {
  const existingPattern = this.patterns.errors.find(e => e.type === error.type);
  
  if (existingPattern) {
    existingPattern.frequency += 1;
    existingPattern.lastOccurrence = new Date();
    if (!existingPattern.contexts.includes(error.context)) {
      existingPattern.contexts.push(error.context);
    }
    if (error.solution && !existingPattern.solutions.includes(error.solution)) {
      existingPattern.solutions.push(error.solution);
    }
  } else {
    this.patterns.errors.push({
      type: error.type,
      frequency: 1,
      contexts: [error.context],
      solutions: error.solution ? [error.solution] : [],
      lastOccurrence: new Date()
    });
  }

  return this.save();
};

aiMemorySchema.methods.recordSuccessPattern = function(success) {
  const existingPattern = this.patterns.successes.find(s => s.type === success.type);
  
  if (existingPattern) {
    existingPattern.frequency += 1;
    existingPattern.lastOccurrence = new Date();
    if (!existingPattern.contexts.includes(success.context)) {
      existingPattern.contexts.push(success.context);
    }
    if (success.factors) {
      success.factors.forEach(factor => {
        if (!existingPattern.factors.includes(factor)) {
          existingPattern.factors.push(factor);
        }
      });
    }
  } else {
    this.patterns.successes.push({
      type: success.type,
      frequency: 1,
      contexts: [success.context],
      factors: success.factors || [],
      lastOccurrence: new Date()
    });
  }

  return this.save();
};

// Helper function for updating skill areas
async function updateSkillAreas(memory, performances) {
  const operationCounts = {};
  const successCounts = {};
  const totalScores = {};

  // Count operations and successes
  performances.forEach(perf => {
    operationCounts[perf.operation] = (operationCounts[perf.operation] || 0) + 1;
    if (perf.success) {
      successCounts[perf.operation] = (successCounts[perf.operation] || 0) + 1;
    }
    totalScores[perf.operation] = (totalScores[perf.operation] || 0) + perf.score;
  });

  // Calculate mastery areas (high success rate and score)
  const masteryAreas = [];
  const improvementAreas = [];

  Object.keys(operationCounts).forEach(operation => {
    const successRate = successCounts[operation] / operationCounts[operation];
    const avgScore = totalScores[operation] / operationCounts[operation];

    if (successRate >= 0.8 && avgScore >= 0.7) {
      masteryAreas.push(operation);
    } else if (successRate < 0.5 || avgScore < 0.4) {
      improvementAreas.push(operation);
    }
  });

  memory.learningData.masteryAreas = masteryAreas;
  memory.learningData.improvementAreas = improvementAreas;
}

// Virtual fields
aiMemorySchema.virtual('isExpired').get(function() {
  return this.metadata.expiresAt && this.metadata.expiresAt < new Date();
});

aiMemorySchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

aiMemorySchema.virtual('recommendationCount').get(function() {
  return this.recommendations ? this.recommendations.length : 0;
});

// Static method to clean expired memories
aiMemorySchema.statics.cleanupExpiredMemories = function() {
  return this.deleteMany({
    'metadata.expiresAt': { $lt: new Date() }
  });
};

// Static method to get memory statistics
aiMemorySchema.statics.getMemoryStatistics = async function(userId) {
  const pipeline = [
    {
      $match: { userId: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: '$memoryType',
        count: { $sum: 1 },
        avgImportance: { $avg: '$metadata.importance' },
        avgConfidence: { $avg: '$metadata.confidence' }
      }
    }
  ];

  const results = await this.aggregate(pipeline);
  
  const statistics = {};
  results.forEach(result => {
    statistics[result._id] = {
      count: result.count,
      avgImportance: result.avgImportance,
      avgConfidence: result.avgConfidence
    };
  });

  return statistics;
};

module.exports = mongoose.model('AIMemory', aiMemorySchema);
