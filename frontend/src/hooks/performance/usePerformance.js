// frontend/src/hooks/performance/usePerformance.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function usePerformance() {
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(null);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // Calculate FPS
  useEffect(() => {
    let animationId;
    
    const calculateFps = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;

      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(calculateFps);
    };

    animationId = requestAnimationFrame(calculateFps);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Get memory usage (Chrome only)
  useEffect(() => {
    const updateMemory = () => {
      if (performance.memory) {
        setMemory({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Performance mark
  const mark = useCallback((name) => {
    performance.mark(name);
  }, []);

  // Performance measure
  const measure = useCallback((name, startMark, endMark) => {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      return entries[entries.length - 1]?.duration;
    } catch (error) {
      return null;
    }
  }, []);

  // Clear marks and measures
  const clear = useCallback(() => {
    performance.clearMarks();
    performance.clearMeasures();
  }, []);

  // Format bytes to human readable
  const formatBytes = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  return {
    fps,
    memory: memory ? {
      used: formatBytes(memory.usedJSHeapSize),
      total: formatBytes(memory.totalJSHeapSize),
      limit: formatBytes(memory.jsHeapSizeLimit),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    } : null,
    mark,
    measure,
    clear
  };
}

export default usePerformance;