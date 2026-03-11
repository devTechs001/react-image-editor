// frontend/src/hooks/performance/useThrottle.js
import { useRef, useCallback } from 'react';

/**
 * Custom hook for throttling function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function useThrottle(func, limit = 300) {
  const inThrottle = useRef(false);
  const lastFunc = useRef(null);
  const lastRan = useRef(0);

  const throttled = useCallback((...args) => {
    if (!inThrottle.current) {
      func.apply(this, args);
      inThrottle.current = true;
      lastRan.current = Date.now();
      
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    } else {
      // Clear any pending execution
      if (lastFunc.current) {
        clearTimeout(lastFunc.current);
      }
      
      // Schedule execution after throttle period
      lastFunc.current = setTimeout(() => {
        func.apply(this, args);
        lastFunc.current = null;
      }, limit - (Date.now() - lastRan.current));
    }
  }, [func, limit]);

  // Cleanup on unmount
  useCallback(() => {
    return () => {
      if (lastFunc.current) {
        clearTimeout(lastFunc.current);
      }
    };
  }, []);

  return throttled;
}

/**
 * Custom hook for throttling values
 * @param {*} value - Value to throttle
 * @param {number} interval - Interval in milliseconds
 * @returns {*} - Throttled value
 */
export function useThrottleValue(value, interval = 300) {
  const throttledValue = useRef(value);
  const lastUpdated = useRef(Date.now());
  const [, forceUpdate] = useState(0);

  const updateValue = useCallback((newValue) => {
    const now = Date.now();
    
    if (now - lastUpdated.current >= interval) {
      throttledValue.current = newValue;
      lastUpdated.current = now;
      forceUpdate(n => n + 1);
    }
  }, [interval]);

  // Update ref when value changes
  if (throttledValue.current !== value) {
    updateValue(value);
  }

  return throttledValue.current;
}

export default useThrottle;
