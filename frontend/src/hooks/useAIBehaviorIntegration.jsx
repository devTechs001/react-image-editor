// frontend/src/hooks/useAIBehaviorIntegration.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useBehaviorAnalytics } from '@/services/UserBehaviorAnalytics';
import toast from 'react-hot-toast';

export function useAIBehaviorIntegration() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationStartTime, setOperationStartTime] = useState(null);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [learningProgress, setLearningProgress] = useState(null);
  
  const { 
    trackEvent, 
    getAdaptiveFeedback, 
    updateRecommendations, 
    behaviorSummary 
  } = useBehaviorAnalytics();

  const operationHistory = useRef([]);

  // Initialize tracking
  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    trackEvent('session_start', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }, [trackEvent]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    trackEvent('session_end', {
      timestamp: Date.now(),
      duration: Date.now() - (operationHistory.current[0]?.timestamp || Date.now())
    });
  }, [trackEvent]);

  // Track AI operation start
  const trackOperationStart = useCallback((operation, context = {}) => {
    const startTime = Date.now();
    setCurrentOperation(operation);
    setOperationStartTime(startTime);
    
    trackEvent('operation_start', {
      operation,
      startTime,
      context,
      timestamp: startTime
    });

    // Track tool selection
    if (context.tool) {
      trackEvent('tool_selection', {
        tool: context.tool,
        operation,
        timestamp: startTime
      });
    }
  }, [trackEvent]);

  // Track AI operation result
  const trackOperationResult = useCallback(async (operation, result, context = {}) => {
    const endTime = Date.now();
    const duration = endTime - (operationStartTime || endTime);
    
    // Track operation completion
    const eventType = result.success ? 'success' : 'error';
    trackEvent(eventType, {
      operation,
      result,
      duration,
      context,
      timestamp: endTime
    });

    // Store in history
    operationHistory.current.push({
      operation,
      result,
      duration,
      timestamp: endTime,
      context
    });

    // Get adaptive feedback
    try {
      const feedback = await getAdaptiveFeedback(operation, result);
      setAdaptiveFeedback(feedback);
      
      // Track feedback received
      trackEvent('feedback_received', {
        operation,
        feedbackType: feedback?.type,
        timestamp: endTime
      });
    } catch (error) {
      console.error('Error getting adaptive feedback:', error);
    }

    // Update recommendations
    try {
      await updateRecommendations({
        currentOperation: operation,
        result,
        context,
        page: 'editor'
      });
    } catch (error) {
      console.error('Error updating recommendations:', error);
    }

    setCurrentOperation(null);
    setOperationStartTime(null);

    return { feedback: adaptiveFeedback, duration };
  }, [trackEvent, getAdaptiveFeedback, updateRecommendations, operationStartTime, adaptiveFeedback]);

  // Track user interaction with AI components
  const trackAIInteraction = useCallback((interactionType, data = {}) => {
    trackEvent('ai_interaction', {
      interactionType,
      data,
      currentOperation,
      timestamp: Date.now()
    });
  }, [trackEvent, currentOperation]);

  // Track parameter changes
  const trackParameterChange = useCallback((parameter, oldValue, newValue, context = {}) => {
    trackEvent('parameter_change', {
      parameter,
      oldValue,
      newValue,
      context,
      currentOperation,
      timestamp: Date.now()
    });
  }, [trackEvent, currentOperation]);

  // Track model selection
  const trackModelSelection = useCallback((model, category, context = {}) => {
    trackEvent('model_selection', {
      model,
      category,
      context,
      currentOperation,
      timestamp: Date.now()
    });
  }, [trackEvent, currentOperation]);

  // Track error handling
  const trackError = useCallback((error, operation, context = {}) => {
    trackEvent('error', {
      error: error.message,
      stack: error.stack,
      operation,
      context,
      currentOperation,
      timestamp: Date.now()
    });
  }, [trackEvent, currentOperation]);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async (context = {}) => {
    try {
      const response = await fetch('/api/v1/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          context: {
            ...context,
            currentOperation,
            recentOperations: operationHistory.current.slice(-10)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        return data.recommendations;
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
    
    return [];
  }, [currentOperation, operationHistory]);

  // Track recommendation interaction
  const trackRecommendationInteraction = useCallback((recommendation, action) => {
    trackEvent('recommendation_interaction', {
      recommendation: recommendation.title,
      action, // 'clicked', 'dismissed', 'applied'
      timestamp: Date.now()
    });

    // Send to backend for learning
    fetch('/api/v1/ai/recommendation-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        recommendation,
        action,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Error tracking recommendation interaction:', error);
    });
  }, [trackEvent]);

  // Get learning progress
  const getLearningProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/ai/learning-progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningProgress(data);
        return data;
      }
    } catch (error) {
      console.error('Error getting learning progress:', error);
    }
    
    return null;
  }, []);

  // Track learning milestone
  const trackLearningMilestone = useCallback((milestone, context = {}) => {
    trackEvent('learning_milestone', {
      milestone,
      context,
      timestamp: Date.now()
    });

    // Show achievement notification
    toast.success(`🎉 Achievement Unlocked: ${milestone}`, {
      duration: 5000,
      icon: '🏆'
    });
  }, [trackEvent]);

  // Analyze user patterns
  const analyzePatterns = useCallback(() => {
    const recentOperations = operationHistory.current.slice(-20);
    
    // Calculate success rate
    const successCount = recentOperations.filter(op => op.result.success).length;
    const successRate = recentOperations.length > 0 ? successCount / recentOperations.length : 0;
    
    // Calculate average duration
    const avgDuration = recentOperations.reduce((sum, op) => sum + op.duration, 0) / recentOperations.length;
    
    // Find most used operations
    const operationCounts = {};
    recentOperations.forEach(op => {
      operationCounts[op.operation] = (operationCounts[op.operation] || 0) + 1;
    });
    
    const mostUsedOperation = Object.entries(operationCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return {
      successRate,
      avgDuration,
      mostUsedOperation,
      totalOperations: recentOperations.length
    };
  }, [operationHistory]);

  // Get adaptive suggestions based on patterns
  const getAdaptiveSuggestions = useCallback(() => {
    const patterns = analyzePatterns();
    const suggestions = [];

    if (patterns.successRate < 0.5) {
      suggestions.push({
        type: 'improvement',
        message: 'Consider reviewing tutorials for better results',
        priority: 'high'
      });
    }

    if (patterns.avgDuration > 10000) { // 10 seconds
      suggestions.push({
        type: 'optimization',
        message: 'Try adjusting parameters for faster processing',
        priority: 'medium'
      });
    }

    if (patterns.mostUsedOperation) {
      suggestions.push({
        type: 'exploration',
        message: `You're great at ${patterns.mostUsedOperation}! Try related features.`,
        priority: 'low'
      });
    }

    return suggestions;
  }, [analyzePatterns]);

  // Auto-tracker for common AI operations
  const useAutoTracker = useCallback((operationName) => {
    return {
      start: (context) => trackOperationStart(operationName, context),
      result: (result, context) => trackOperationResult(operationName, result, context),
      error: (error, context) => trackError(error, operationName, context),
      interaction: (type, data) => trackAIInteraction(type, data),
      parameterChange: (param, oldVal, newVal) => trackParameterChange(param, oldVal, newVal, { operation: operationName }),
      modelSelection: (model, category) => trackModelSelection(model, category, { operation: operationName })
    };
  }, [trackOperationStart, trackOperationResult, trackError, trackAIInteraction, trackParameterChange, trackModelSelection]);

  return {
    // Tracking state
    isTracking,
    currentOperation,
    adaptiveFeedback,
    recommendations,
    learningProgress,
    
    // Core tracking methods
    trackOperationStart,
    trackOperationResult,
    trackAIInteraction,
    trackParameterChange,
    trackModelSelection,
    trackError,
    
    // Advanced features
    getPersonalizedRecommendations,
    trackRecommendationInteraction,
    getLearningProgress,
    trackLearningMilestone,
    
    // Analysis
    analyzePatterns,
    getAdaptiveSuggestions,
    
    // Auto-tracker
    useAutoTracker,
    
    // History
    operationHistory: operationHistory.current,
    behaviorSummary
  };
}

// Higher-order component for automatic AI tracking
export function withAITracking(WrappedComponent) {
  return function AITrackedComponent(props) {
    const aiBehavior = useAIBehaviorIntegration();
    
    return (
      <WrappedComponent 
        {...props}
        aiBehavior={aiBehavior}
      />
    );
  };
}

// Hook for specific AI component tracking
export function useAIComponentTracking(componentName) {
  const aiBehavior = useAIBehaviorIntegration();
  
  const tracker = aiBehavior.useAutoTracker(componentName);
  
  // Component-specific tracking
  const trackComponentEvent = useCallback((eventType, data) => {
    aiBehavior.trackAIInteraction(`${componentName}_${eventType}`, data);
  }, [aiBehavior, componentName]);

  const trackComponentError = useCallback((error, context = {}) => {
    aiBehavior.trackError(error, componentName, context);
  }, [aiBehavior, componentName]);

  const trackComponentSuccess = useCallback((result, context = {}) => {
    aiBehavior.trackOperationResult(componentName, { success: true, ...result }, context);
  }, [aiBehavior, componentName]);

  return {
    ...tracker,
    trackComponentEvent,
    trackComponentError,
    trackComponentSuccess
  };
}
