// frontend/src/hooks/performance/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} - Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Debounce options
 * @returns {Function} - Debounced function
 */
export function useDebounceCallback(func, wait = 300, options = {}) {
  const { leading = false, trailing = true, maxWait } = options;

  let timeout = null;
  let lastCallTime = null;
  let lastInvokeTime = 0;
  let lastArgs = [];
  let lastThis = null;
  let result = null;
  let maxing = false;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  const maxWaitDuration = maxWait ? Math.max(0, maxWait) : null;
  maxing = maxWaitDuration !== null;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    let remaining = wait - timeSinceLastCall;
    const shouldInvoke = timeSinceLastCall >= wait;

    if (maxing) {
      remaining = Math.min(remaining, maxWaitDuration - timeSinceLastInvoke);
    }

    return shouldInvoke ? 0 : remaining;
  }

  function timerExpired() {
    const time = Date.now();
    const remaining = remainingWait(time);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      result = invokeFunc(time);
    } else {
      timeout = setTimeout(timerExpired, remaining);
    }
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = remainingWait(time) <= 0;

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      result = invokeFunc(time);
    } else if (!timeout && trailing) {
      timeout = setTimeout(timerExpired, remaining);
    }

    return result;
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = null;
  };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastInvokeTime = Date.now();
    return invokeFunc(lastInvokeTime);
  };

  return debounced;
}

export default useDebounce;
