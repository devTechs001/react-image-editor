// frontend/src/hooks/core/useRenderLoop.js
import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing animation/render loops
 * @param {Function} callback - Callback function called each frame
 * @param {boolean} enabled - Whether the loop is enabled
 * @param {number} fps - Target FPS (0 for max)
 */
export function useRenderLoop(callback, enabled = true, fps = 0) {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const frameInterval = fps > 0 ? 1000 / fps : 0;
  const lastFrameTime = useRef(0);

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Skip frame if targeting specific FPS and not enough time has passed
      if (frameInterval > 0 && deltaTime < frameInterval) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      
      previousTimeRef.current = time;
      callback(deltaTime, time);
    } else {
      previousTimeRef.current = time;
    }
    
    requestRef.current = requestAnimationFrame(animate);
  }, [callback, frameInterval]);

  useEffect(() => {
    if (enabled) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, animate]);

  const stop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!requestRef.current && enabled) {
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [enabled, animate]);

  return { stop, start };
}

export default useRenderLoop;
