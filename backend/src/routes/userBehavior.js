// backend/src/routes/userBehavior.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const UserBehavior = require('../models/UserBehavior');
const User = require('../models/User');
const AIMemory = require('../models/AIMemory');
const { validate } = require('../middleware/validation');

// Store and analyze user behavior
router.post('/analyze',
  auth,
  validate([
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('behaviors').isArray().withMessage('Behaviors must be an array'),
    body('analysis').optional().isObject()
  ]),
  async (req, res) => {
    try {
      const { sessionId, userId, behaviors, analysis } = req.body;

      // Store behavior data
      const behaviorRecord = new UserBehavior({
        sessionId,
        userId,
        behaviors,
        analysis,
        timestamp: new Date()
      });

      await behaviorRecord.save();

      // Update user preferences
      await updateUserPreferences(userId, analysis);

      // Train AI model with new data
      await trainUserModel(userId, behaviors);

      // Generate insights
      const insights = await generateUserInsights(userId, behaviors);

      res.json({
        success: true,
        message: 'Behavior data analyzed successfully',
        insights,
        preferences: analysis?.preferences || {},
        learningData: analysis?.learningData || {}
      });

    } catch (error) {
      console.error('Behavior analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze behavior data'
      });
    }
  }
);

// Get personalized recommendations
router.post('/recommendations',
  auth,
  validate([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('context').optional().isObject(),
    body('preferences').optional().isObject(),
    body('recentBehaviors').optional().isArray()
  ]),
  async (req, res) => {
    try {
      const { userId, context = {}, preferences = {}, recentBehaviors = [] } = req.body;

      // Get user's behavior history
      const userHistory = await UserBehavior.find({ userId })
        .sort({ timestamp: -1 })
        .limit(100);

      // Get AI memory for this user
      const aiMemory = await AIMemory.findOne({ userId }) || {};

      // Generate recommendations
      const recommendations = await generateRecommendations(userId, {
        userHistory,
        preferences,
        recentBehaviors,
        context,
        aiMemory
      });

      res.json({
        success: true,
        recommendations,
        confidence: calculateRecommendationConfidence(recommendations, userHistory.length)
      });

    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    }
  }
);

// Get adaptive feedback
router.post('/adaptive-feedback',
  auth,
  validate([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('operation').notEmpty().withMessage('Operation is required'),
    body('result').optional().isObject(),
    body('userHistory').optional().isArray(),
    body('preferences').optional().isObject()
  ]),
  async (req, res) => {
    try {
      const { userId, operation, result = {}, userHistory = [], preferences = {} } = req.body;

      // Analyze operation result
      const analysis = await analyzeOperationResult(userId, operation, result, userHistory);

      // Generate adaptive feedback
      const feedback = await generateAdaptiveFeedback(userId, {
        operation,
        result,
        analysis,
        preferences,
        userHistory
      });

      // Store feedback for learning
      await storeFeedback(userId, operation, feedback, analysis);

      res.json({
        success: true,
        feedback,
        analysis,
        suggestions: feedback.suggestions || [],
        nextSteps: feedback.nextSteps || []
      });

    } catch (error) {
      console.error('Adaptive feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate adaptive feedback'
      });
    }
  }
);

// Get user behavior analytics
router.get('/analytics/:userId',
  auth,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = '7d' } = req.query;

      // Calculate date range
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
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Get behavior data
      const behaviorData = await UserBehavior.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: 1 });

      // Generate analytics
      const analytics = await generateBehaviorAnalytics(behaviorData);

      res.json({
        success: true,
        analytics,
        timeframe,
        dataPoints: behaviorData.length
      });

    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate analytics'
      });
    }
  }
);

// Update user preferences
router.put('/preferences',
  auth,
  validate([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('preferences').isObject().withMessage('Preferences must be an object')
  ]),
  async (req, res) => {
    try {
      const { userId, preferences } = req.body;

      // Update user preferences in database
      await User.updateOne(
        { _id: userId },
        { 
          $set: { 
            'aiPreferences': preferences,
            'updatedAt': new Date()
          }
        },
        { upsert: true }
      );

      res.json({
        success: true,
        message: 'Preferences updated successfully'
      });

    } catch (error) {
      console.error('Preferences update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences'
      });
    }
  }
);

// Helper functions

async function updateUserPreferences(userId, analysis) {
  if (!analysis?.preferences) return;

  try {
    await User.updateOne(
      { _id: userId },
      { 
        $set: { 
          'aiPreferences': analysis.preferences,
          'lastActivity': new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}

async function trainUserModel(userId, behaviors) {
  // This would integrate with ML service to train user-specific models
  try {
    // Prepare training data
    const trainingData = behaviors.map(behavior => ({
      type: behavior.type,
      data: behavior.data,
      timestamp: behavior.timestamp,
      context: behavior.context
    }));

    // Send to Python ML service for training
    const response = await fetch(`${process.env.PYTHON_AI_SERVICE_URL}/api/v1/ai/rl/train-user-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        trainingData,
        modelType: 'behavior_prediction'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('User model training initiated:', result);
    }
  } catch (error) {
    console.error('Error training user model:', error);
  }
}

async function generateUserInsights(userId, behaviors) {
  const insights = {
    patterns: [],
    recommendations: [],
    improvements: [],
    metrics: {}
  };

  // Analyze behavior patterns
  const toolUsage = {};
  const timePatterns = {};
  const errorPatterns = [];

  behaviors.forEach(behavior => {
    if (behavior.type === 'tool_selection') {
      toolUsage[behavior.data.tool] = (toolUsage[behavior.data.tool] || 0) + 1;
    }
    
    if (behavior.type === 'time_spent') {
      const hour = new Date(behavior.timestamp).getHours();
      timePatterns[hour] = (timePatterns[hour] || 0) + 1;
    }
    
    if (behavior.type === 'error') {
      errorPatterns.push(behavior);
    }
  });

  // Generate insights
  insights.metrics = {
    totalEvents: behaviors.length,
    uniqueTools: Object.keys(toolUsage).length,
    errorRate: (errorPatterns.length / behaviors.length) * 100,
    mostUsedTool: Object.entries(toolUsage).sort(([,a], [,b]) => b - a)[0]?.[0],
    peakActivityHour: Object.entries(timePatterns).sort(([,a], [,b]) => b - a)[0]?.[0]
  };

  // Generate recommendations based on patterns
  if (insights.metrics.errorRate > 20) {
    insights.recommendations.push({
      type: 'improvement',
      message: 'Consider simplifying your workflow to reduce errors',
      priority: 'high'
    });
  }

  if (insights.metrics.mostUsedTool) {
    insights.recommendations.push({
      type: 'optimization',
      message: `You use ${insights.metrics.mostUsedTool} frequently. Consider learning advanced features.`,
      priority: 'medium'
    });
  }

  return insights;
}

async function generateRecommendations(userId, data) {
  const { userHistory, preferences, recentBehaviors, context, aiMemory } = data;
  
  const recommendations = [];

  // Analyze recent behavior for context
  const recentTools = recentBehaviors
    .filter(b => b.type === 'tool_selection')
    .map(b => b.data.tool);

  // Generate tool recommendations
  if (context.page === 'editor') {
    if (recentTools.includes('object-detection')) {
      recommendations.push({
        type: 'tool',
        title: 'Try Face Detection',
        description: 'Since you used object detection, face detection might be useful for portrait photos.',
        action: '/editor?tool=face-detect',
        confidence: 0.8
      });
    }

    if (preferences?.preferredTools?.some(t => t.tool.includes('vision'))) {
      recommendations.push({
        type: 'feature',
        title: 'Advanced Vision Features',
        description: 'Explore our computer vision capabilities for professional results.',
        action: '/editor?tab=vision',
        confidence: 0.9
      });
    }
  }

  // Generate learning recommendations
  if (aiMemory?.learningProgress?.vision < 0.5) {
    recommendations.push({
      type: 'learning',
      title: 'Vision AI Tutorial',
      description: 'Learn the basics of computer vision with our interactive tutorial.',
      action: '/tutorials/vision-ai',
      confidence: 0.7
    });
  }

  // Generate workflow recommendations
  const workflowPatterns = analyzeWorkflowPatterns(userHistory);
  if (workflowPatterns.inefficient) {
    recommendations.push({
      type: 'workflow',
      title: 'Optimize Your Workflow',
      description: 'We notice some inefficiencies in your workflow. Here are some tips.',
      action: '/help/workflow-optimization',
      confidence: 0.6
    });
  }

  return recommendations;
}

function calculateRecommendationConfidence(recommendations, dataPoints) {
  if (recommendations.length === 0) return 0;
  
  const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
  const dataFactor = Math.min(dataPoints / 100, 1); // More data = higher confidence
  
  return Math.round(avgConfidence * dataFactor * 100) / 100;
}

async function analyzeOperationResult(userId, operation, result, userHistory) {
  const analysis = {
    success: result.success || false,
    duration: result.duration || 0,
    errors: result.errors || [],
    efficiency: 0,
    userSatisfaction: 0,
    difficulty: 'medium'
  };

  // Compare with historical data
  const similarOperations = userHistory.filter(h => h.type === operation);
  
  if (similarOperations.length > 0) {
    const avgDuration = similarOperations.reduce((sum, h) => sum + (h.data.duration || 0), 0) / similarOperations.length;
    const successRate = similarOperations.filter(h => h.data.success).length / similarOperations.length;
    
    analysis.efficiency = avgDuration > 0 ? avgDuration / analysis.duration : 1;
    analysis.difficulty = analysis.efficiency > 1.2 ? 'easy' : analysis.efficiency < 0.8 ? 'hard' : 'medium';
  }

  return analysis;
}

async function generateAdaptiveFeedback(userId, data) {
  const { operation, result, analysis, preferences, userHistory } = data;
  
  const feedback = {
    message: '',
    type: 'neutral',
    suggestions: [],
    nextSteps: [],
    encouragement: ''
  };

  // Generate feedback based on success/failure
  if (analysis.success) {
    feedback.type = 'positive';
    feedback.message = `Great job! ${operation} completed successfully.`;
    feedback.encouragement = 'Keep up the excellent work!';
    
    if (analysis.efficiency > 1.2) {
      feedback.suggestions.push('You completed this faster than usual. Try more challenging settings.');
    }
  } else {
    feedback.type = 'constructive';
    feedback.message = `Let's improve your ${operation} technique.`;
    
    if (analysis.errors.length > 0) {
      feedback.suggestions.push('Review the error messages and try adjusting your approach.');
    }
    
    if (analysis.difficulty === 'hard') {
      feedback.suggestions.push('This operation is quite advanced. Consider starting with simpler tasks.');
    }
  }

  // Generate next steps based on user progress
  const userLevel = determineUserLevel(userHistory);
  
  if (userLevel === 'beginner') {
    feedback.nextSteps.push('Try the tutorial for this feature.');
    feedback.nextSteps.push('Practice with sample images.');
  } else if (userLevel === 'intermediate') {
    feedback.nextSteps.push('Experiment with advanced settings.');
    feedback.nextSteps.push('Combine with other AI features.');
  } else {
    feedback.nextSteps.push('Try creating custom workflows.');
    feedback.nextSteps.push('Share your techniques with the community.');
  }

  return feedback;
}

function determineUserLevel(userHistory) {
  const totalOperations = userHistory.length;
  const successRate = userHistory.filter(h => h.data.success).length / totalOperations;
  
  if (totalOperations < 10) return 'beginner';
  if (totalOperations < 50 || successRate < 0.7) return 'intermediate';
  return 'advanced';
}

function analyzeWorkflowPatterns(userHistory) {
  const patterns = {
    efficient: true,
    bottlenecks: [],
    suggestions: []
  };

  // Analyze tool switching patterns
  const toolSwitches = userHistory.filter(h => h.type === 'tool_selection');
  
  if (toolSwitches.length > 20) {
    patterns.inefficient = true;
    patterns.suggestions.push('Consider using keyboard shortcuts to reduce tool switching.');
  }

  // Analyze error patterns
  const errors = userHistory.filter(h => h.type === 'error');
  if (errors.length > 5) {
    patterns.inefficient = true;
    patterns.suggestions.push('Review the help documentation for common issues.');
  }

  return patterns;
}

async function storeFeedback(userId, operation, feedback, analysis) {
  try {
    await AIMemory.updateOne(
      { userId },
      {
        $push: {
          feedbackHistory: {
            operation,
            feedback,
            analysis,
            timestamp: new Date()
          }
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error storing feedback:', error);
  }
}

async function generateBehaviorAnalytics(behaviorData) {
  const analytics = {
    overview: {},
    patterns: {},
    trends: {},
    predictions: {}
  };

  // Overview metrics
  analytics.overview = {
    totalSessions: behaviorData.length,
    avgSessionDuration: behaviorData.reduce((sum, session) => sum + (session.analysis?.sessionDuration || 0), 0) / behaviorData.length,
    totalEvents: behaviorData.reduce((sum, session) => sum + (session.analysis?.totalEvents || 0), 0),
    avgSuccessRate: behaviorData.reduce((sum, session) => sum + (session.analysis?.successRate || 0), 0) / behaviorData.length
  };

  // Patterns analysis
  const toolUsage = {};
  const timePatterns = {};
  
  behaviorData.forEach(session => {
    if (session.analysis?.toolUsage) {
      Object.entries(session.analysis.toolUsage).forEach(([tool, count]) => {
        toolUsage[tool] = (toolUsage[tool] || 0) + count;
      });
    }
    
    if (session.analysis?.workingHours) {
      session.analysis.workingHours.forEach(({ hour, activity }) => {
        timePatterns[hour] = (timePatterns[hour] || 0) + activity;
      });
    }
  });

  analytics.patterns = {
    mostUsedTools: Object.entries(toolUsage).sort(([,a], [,b]) => b - a).slice(0, 5),
    peakHours: Object.entries(timePatterns).sort(([,a], [,b]) => b - a).slice(0, 3),
    toolDiversity: Object.keys(toolUsage).length
  };

  return analytics;
}

module.exports = router;
