// frontend/src/components/ai/AdaptiveAIFeedback.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Award,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronRight,
  Star,
  BarChart3,
  BookOpen,
  Settings,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useBehaviorAnalytics } from '@/services/UserBehaviorAnalytics';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

export default function AdaptiveAIFeedback({ operation, result, onDismiss, onAction }) {
  const [feedback, setFeedback] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [learningProgress, setLearningProgress] = useState(null);
  
  const { getAdaptiveFeedback, updateRecommendations, trackEvent } = useBehaviorAnalytics();

  // Get adaptive feedback when operation completes
  useEffect(() => {
    if (operation && result) {
      loadFeedback();
    }
  }, [operation, result]);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get adaptive feedback
      const feedbackData = await getAdaptiveFeedback(operation, result);
      
      if (feedbackData) {
        setFeedback(feedbackData);
        
        // Update recommendations based on context
        await updateRecommendations({
          currentOperation: operation,
          result: result,
          page: 'editor'
        });
        
        // Track feedback event
        trackEvent('ai_feedback_received', {
          operation,
          success: result.success,
          feedbackType: feedbackData.type
        });
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, [operation, result, getAdaptiveFeedback, updateRecommendations, trackEvent]);

  const handleReaction = useCallback(async (reaction) => {
    setUserReaction(reaction);
    
    try {
      // Send reaction to backend for learning
      const response = await fetch('/api/v1/ai/feedback-reaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          feedback,
          reaction,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        // Track reaction event
        trackEvent('ai_feedback_reaction', {
          operation,
          reaction,
          helpful: reaction === 'helpful'
        });
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  }, [operation, feedback, trackEvent]);

  const handleRecommendationClick = useCallback(async (recommendation) => {
    try {
      // Track recommendation click
      trackEvent('ai_recommendation_clicked', {
        operation,
        recommendation: recommendation.title,
        type: recommendation.type
      });

      // Execute recommendation action
      if (recommendation.action && onAction) {
        await onAction(recommendation);
      }

      // Mark recommendation as applied
      await fetch('/api/v1/ai/recommendation-applied', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          operation,
          applied: true
        })
      });
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  }, [operation, onAction, trackEvent]);

  if (isLoading) {
    return (
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          <div className="text-sm text-surface-400">AI analyzing your performance...</div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  const getFeedbackIcon = () => {
    switch (feedback.type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'constructive':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'informative':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Brain className="w-5 h-5 text-purple-400" />;
    }
  };

  const getFeedbackColor = () => {
    switch (feedback.type) {
      case 'positive':
        return 'border-green-500/30 bg-green-500/10';
      case 'constructive':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'informative':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-purple-500/30 bg-purple-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-surface-800 border rounded-xl p-4 space-y-4",
        getFeedbackColor()
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getFeedbackIcon()}
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">AI Feedback</h4>
            <p className="text-sm text-surface-300">{feedback.message}</p>
            
            {feedback.encouragement && (
              <p className="text-sm text-surface-400 mt-2 italic">
                "{feedback.encouragement}"
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          onClick={onDismiss}
          className="text-surface-400 hover:text-white"
        />
      </div>

      {/* Skill Level Indicator */}
      {feedback.skillLevel && (
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-surface-400">
            Skill Level: <span className="text-yellow-400 capitalize">{feedback.skillLevel}</span>
          </span>
        </div>
      )}

      {/* Suggestions */}
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Suggestions</span>
          </div>
          <ul className="space-y-1">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-surface-300 flex items-start space-x-2">
                <ChevronRight className="w-3 h-3 text-surface-500 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {feedback.nextSteps && feedback.nextSteps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Next Steps</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.nextSteps.map((step, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => handleRecommendationClick({
                  id: `step_${index}`,
                  title: step,
                  action: step,
                  type: 'next_step'
                })}
                className="text-xs"
              >
                {step}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Performance Analysis */}
      {feedback.analysis && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Performance Analysis</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-surface-400"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-surface-900 rounded-lg p-3 space-y-2"
              >
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-surface-400">Success Rate:</span>
                    <span className="text-white ml-2">
                      {Math.round((feedback.analysis.success || 0) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-400">Efficiency:</span>
                    <span className="text-white ml-2">
                      {Math.round((feedback.analysis.efficiency || 0) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-400">Duration:</span>
                    <span className="text-white ml-2">
                      {feedback.analysis.duration ? `${(feedback.analysis.duration / 1000).toFixed(1)}s` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-400">Difficulty:</span>
                    <span className="text-white ml-2 capitalize">
                      {feedback.analysis.difficulty || 'medium'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* User Reaction */}
      {!userReaction && (
        <div className="flex items-center justify-between pt-2 border-t border-surface-700">
          <span className="text-xs text-surface-400">Was this feedback helpful?</span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ThumbsUp}
              onClick={() => handleReaction('helpful')}
              className="text-green-400 hover:text-green-300"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={ThumbsDown}
              onClick={() => handleReaction('not_helpful')}
              className="text-red-400 hover:text-red-300"
            />
          </div>
        </div>
      )}

      {userReaction && (
        <div className="flex items-center space-x-2 text-xs text-surface-400">
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span>Thank you for your feedback!</span>
        </div>
      )}
    </motion.div>
  );
}

// Component for displaying learning progress
export function LearningProgress({ userId }) {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLearningProgress();
  }, [userId]);

  const loadLearningProgress = async () => {
    try {
      const response = await fetch(`/api/v1/ai/learning-progress/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading learning progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-400 animate-pulse" />
          <div className="text-sm text-surface-400">Loading learning progress...</div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h4 className="text-white font-medium">Learning Progress</h4>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-400">Overall Progress</span>
          <span className="text-sm text-white">{progress.progressScore}%</span>
        </div>
        <div className="w-full bg-surface-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.progressScore}%` }}
          />
        </div>
      </div>

      {/* Skill Level */}
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-surface-400">Current Level:</span>
        <span className="text-sm text-yellow-400 capitalize">{progress.skillLevel}</span>
      </div>

      {/* Mastery Areas */}
      {progress.masteryAreas && progress.masteryAreas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">Mastery Areas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.masteryAreas.map((area, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {progress.improvementAreas && progress.improvementAreas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white">Areas to Improve</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.improvementAreas.map((area, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Performance */}
      {progress.recentPerformance && progress.recentPerformance.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">Recent Performance</span>
          </div>
          <div className="space-y-1">
            {progress.recentPerformance.slice(-5).map((perf, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-surface-400">{perf.operation}</span>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    perf.success ? 'text-green-400' : 'text-red-400'
                  )}>
                    {perf.success ? '✓' : '✗'}
                  </span>
                  <span className="text-white">{Math.round(perf.score * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component for personalized recommendations
export function PersonalizedRecommendations({ context = {} }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [context]);

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/v1/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(context)
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          <div className="text-sm text-surface-400">Generating personalized recommendations...</div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h4 className="text-white font-medium">Personalized Recommendations</h4>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-900 rounded-lg p-3 border border-surface-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="text-white font-medium text-sm mb-1">{rec.title}</h5>
                <p className="text-xs text-surface-400 mb-2">{rec.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-surface-500">
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </span>
                  {rec.type && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {rec.type}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                onClick={() => window.location.href = rec.action}
                className="ml-2"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
