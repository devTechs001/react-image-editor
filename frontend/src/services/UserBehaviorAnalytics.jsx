// frontend/src/services/UserBehaviorAnalytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@/contexts/EditorContext';

export class UserBehaviorAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.behaviors = [];
    this.preferences = {};
    this.performanceMetrics = {};
    this.learningData = {};
    this.isRecording = false;
    this.observers = [];
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Get or generate user ID
    let userId = localStorage.getItem('ai_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ai_user_id', userId);
    }
    return userId;
  }

  // Start tracking user behavior
  startTracking() {
    this.isRecording = true;
    this.trackPageView();
    this.trackMouseMovement();
    this.trackKeyboardInput();
    this.trackToolUsage();
    this.trackTimeSpent();
    this.trackErrors();
    this.trackSuccessPatterns();
    
    console.log('🧠 User behavior tracking started');
  }

  // Stop tracking
  stopTracking() {
    this.isRecording = false;
    this.analyzeAndSendData();
    console.log('🧠 User behavior tracking stopped');
  }

  // Track page views and navigation
  trackPageView() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-page') {
          this.recordBehavior('page_view', {
            page: mutation.target.getAttribute('data-page'),
            timestamp: Date.now(),
            url: window.location.href
          });
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-page']
    });
  }

  // Track mouse movement and clicks
  trackMouseMovement() {
    let mouseData = [];
    let lastMoveTime = Date.now();

    const handleMouseMove = (e) => {
      if (!this.isRecording) return;
      
      const now = Date.now();
      if (now - lastMoveTime > 100) { // Sample every 100ms
        mouseData.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: now
        });
        
        if (mouseData.length > 100) {
          this.processMouseData(mouseData);
          mouseData = [];
        }
        lastMoveTime = now;
      }
    };

    const handleClick = (e) => {
      if (!this.isRecording) return;
      
      this.recordBehavior('click', {
        x: e.clientX,
        y: e.clientY,
        target: e.target.tagName,
        targetClass: e.target.className,
        timestamp: Date.now(),
        page: this.getCurrentPage()
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
  }

  // Track keyboard input patterns
  trackKeyboardInput() {
    let keySequence = [];
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      if (!this.isRecording) return;
      
      const now = Date.now();
      keySequence.push({
        key: e.key,
        code: e.code,
        timestamp: now,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey
      });

      // Process sequences for shortcuts and patterns
      if (now - lastKeyTime > 2000) {
        this.processKeySequence(keySequence);
        keySequence = [];
      }
      lastKeyTime = now;
    };

    document.addEventListener('keydown', handleKeyDown);
  }

  // Track tool usage patterns
  trackToolUsage() {
    // Track AI tool selection and usage
    const toolObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const element = mutation.target;
        if (element.hasAttribute('data-tool-selected')) {
          this.recordBehavior('tool_selection', {
            tool: element.getAttribute('data-tool-selected'),
            timestamp: Date.now(),
            context: this.getCurrentContext()
          });
        }
      });
    });

    toolObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-tool-selected']
    });
  }

  // Track time spent on different activities
  trackTimeSpent() {
    let currentActivity = null;
    let activityStartTime = Date.now();

    const updateActivity = (activity) => {
      if (currentActivity && activity !== currentActivity) {
        const duration = Date.now() - activityStartTime;
        this.recordBehavior('time_spent', {
          activity: currentActivity,
          duration: duration,
          timestamp: Date.now()
        });
      }
      currentActivity = activity;
      activityStartTime = Date.now();
    };

    // Track focus changes
    document.addEventListener('visibilitychange', () => {
      updateActivity(document.hidden ? 'inactive' : 'active');
    });

    // Track tool changes
    window.addEventListener('hashchange', () => {
      updateActivity(window.location.hash);
    });
  }

  // Track errors and failures
  trackErrors() {
    const handleError = (error, context) => {
      this.recordBehavior('error', {
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: Date.now(),
        page: this.getCurrentPage(),
        userAgent: navigator.userAgent
      });
    };

    window.addEventListener('error', (e) => handleError(e.error, 'javascript'));
    window.addEventListener('unhandledrejection', (e) => handleError(e.reason, 'promise'));
  }

  // Track successful patterns
  trackSuccessPatterns() {
    // Monitor for successful operations
    const successObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const element = mutation.target;
        if (element.hasAttribute('data-success')) {
          this.recordBehavior('success', {
            operation: element.getAttribute('data-success'),
            timestamp: Date.now(),
            context: this.getCurrentContext()
          });
        }
      });
    });

    successObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-success']
    });
  }

  // Process mouse movement data for patterns
  processMouseData(data) {
    if (data.length < 2) return;

    // Calculate movement patterns
    let totalDistance = 0;
    let velocities = [];

    for (let i = 1; i < data.length; i++) {
      const dx = data[i].x - data[i-1].x;
      const dy = data[i].y - data[i-1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDiff = data[i].timestamp - data[i-1].timestamp;
      
      totalDistance += distance;
      velocities.push(distance / timeDiff);
    }

    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

    this.recordBehavior('mouse_pattern', {
      avgVelocity,
      totalDistance,
      sampleCount: data.length,
      timestamp: Date.now()
    });
  }

  // Process keyboard sequences for shortcuts
  processKeySequence(sequence) {
    if (sequence.length < 2) return;

    // Look for common shortcuts
    const shortcuts = {
      'ctrl+z': 'undo',
      'ctrl+shift+z': 'redo',
      'ctrl+c': 'copy',
      'ctrl+v': 'paste',
      'ctrl+s': 'save'
    };

    const sequenceStr = sequence
      .map(k => (k.ctrlKey ? 'ctrl+' : '') + (k.shiftKey ? 'shift+' : '') + k.key.toLowerCase())
      .join(',');

    this.recordBehavior('keyboard_sequence', {
      sequence: sequenceStr,
      length: sequence.length,
      timestamp: Date.now()
    });
  }

  // Record a behavior event
  recordBehavior(type, data) {
    const behavior = {
      id: this.generateId(),
      sessionId: this.sessionId,
      userId: this.userId,
      type,
      data,
      timestamp: Date.now()
    };

    this.behaviors.push(behavior);
    
    // Notify observers
    this.observers.forEach(observer => observer(behavior));
    
    // Keep only recent behaviors (last 1000)
    if (this.behaviors.length > 1000) {
      this.behaviors = this.behaviors.slice(-1000);
    }
  }

  // Analyze collected data and send to AI system
  async analyzeAndSendData() {
    if (this.behaviors.length === 0) return;

    const analysis = this.analyzeBehaviors();
    
    try {
      const response = await fetch('/api/v1/ai/user-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          behaviors: this.behaviors,
          analysis: analysis
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.updatePreferences(result.preferences);
        this.updateLearningData(result.learningData);
      }
    } catch (error) {
      console.error('Failed to send behavior data:', error);
    }
  }

  // Analyze behavior patterns
  analyzeBehaviors() {
    const analysis = {
      sessionDuration: Date.now() - (this.behaviors[0]?.timestamp || Date.now()),
      totalEvents: this.behaviors.length,
      eventTypes: {},
      toolUsage: {},
      timeDistribution: {},
      errorRate: 0,
      successRate: 0,
      mousePatterns: {},
      keyboardPatterns: {},
      preferences: this.extractPreferences()
    };

    // Count event types
    this.behaviors.forEach(behavior => {
      analysis.eventTypes[behavior.type] = (analysis.eventTypes[behavior.type] || 0) + 1;
      
      if (behavior.type === 'tool_selection') {
        analysis.toolUsage[behavior.data.tool] = (analysis.toolUsage[behavior.data.tool] || 0) + 1;
      }
      
      if (behavior.type === 'error') {
        analysis.errorRate++;
      }
      
      if (behavior.type === 'success') {
        analysis.successRate++;
      }
    });

    // Calculate rates
    const totalEvents = this.behaviors.length;
    analysis.errorRate = totalEvents > 0 ? (analysis.errorRate / totalEvents) * 100 : 0;
    analysis.successRate = totalEvents > 0 ? (analysis.successRate / totalEvents) * 100 : 0;

    return analysis;
  }

  // Extract user preferences from behavior
  extractPreferences() {
    const preferences = {
      preferredTools: {},
      workingHours: {},
      errorProneOperations: [],
      successfulPatterns: [],
      mouseSpeed: 'medium',
      keyboardUsage: 'medium',
      learningStyle: 'visual'
    };

    // Analyze tool preferences
    const toolCounts = {};
    this.behaviors.forEach(behavior => {
      if (behavior.type === 'tool_selection') {
        toolCounts[behavior.data.tool] = (toolCounts[behavior.data.tool] || 0) + 1;
      }
    });

    // Sort and get top tools
    preferences.preferredTools = Object.entries(toolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, usage: count }));

    // Analyze time patterns
    const hours = {};
    this.behaviors.forEach(behavior => {
      const hour = new Date(behavior.timestamp).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    preferences.workingHours = Object.entries(hours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), activity: count }));

    return preferences;
  }

  // Update user preferences
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.notifyObservers('preferences_updated', this.preferences);
  }

  // Update learning data
  updateLearningData(newLearningData) {
    this.learningData = { ...this.learningData, ...newLearningData };
    this.notifyObservers('learning_updated', this.learningData);
  }

  // Get personalized recommendations
  async getRecommendations(context) {
    try {
      const response = await fetch('/api/v1/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId,
          sessionId: this.sessionId,
          context: context,
          preferences: this.preferences,
          recentBehaviors: this.behaviors.slice(-50)
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
    
    return { recommendations: [] };
  }

  // Get adaptive feedback
  async getFeedback(operation, result) {
    try {
      const response = await fetch('/api/v1/ai/adaptive-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId,
          sessionId: this.sessionId,
          operation: operation,
          result: result,
          userHistory: this.behaviors.slice(-20),
          preferences: this.preferences
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get feedback:', error);
    }
    
    return { feedback: 'No feedback available' };
  }

  // Add observer for behavior events
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  // Notify observers
  notifyObservers(event, data) {
    this.observers.forEach(observer => observer(event, data));
  }

  // Helper functions
  generateId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentPage() {
    return window.location.pathname + window.location.hash;
  }

  getCurrentContext() {
    return {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  // Get behavior summary
  getBehaviorSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalBehaviors: this.behaviors.length,
      preferences: this.preferences,
      learningData: this.learningData,
      isRecording: this.isRecording
    };
  }
}

// Create singleton instance
export const userBehaviorAnalytics = new UserBehaviorAnalytics();

// React Hook for using behavior analytics
export function useBehaviorAnalytics() {
  const [isTracking, setIsTracking] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Start tracking when component mounts
    userBehaviorAnalytics.startTracking();
    setIsTracking(true);

    // Set up observer for recommendations
    const handleUpdate = (event, data) => {
      if (event === 'preferences_updated') {
        // Trigger recommendation update
        updateRecommendations();
      }
    };

    userBehaviorAnalytics.addObserver(handleUpdate);

    return () => {
      userBehaviorAnalytics.removeObserver(handleUpdate);
      userBehaviorAnalytics.stopTracking();
      setIsTracking(false);
    };
  }, []);

  const updateRecommendations = useCallback(async (context = {}) => {
    const recs = await userBehaviorAnalytics.getRecommendations(context);
    setRecommendations(recs.recommendations || []);
  }, []);

  const getAdaptiveFeedback = useCallback(async (operation, result) => {
    const feedbackData = await userBehaviorAnalytics.getFeedback(operation, result);
    setFeedback(feedbackData);
    return feedbackData;
  }, []);

  const trackEvent = useCallback((type, data) => {
    userBehaviorAnalytics.recordBehavior(type, data);
  }, []);

  return {
    isTracking,
    recommendations,
    feedback,
    updateRecommendations,
    getAdaptiveFeedback,
    trackEvent,
    behaviorSummary: userBehaviorAnalytics.getBehaviorSummary()
  };
}
