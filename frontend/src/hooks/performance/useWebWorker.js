// frontend/src/hooks/performance/useWebWorker.js
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing Web Workers
 * @param {string} workerPath - Path to worker script
 * @param {Object} options - Worker options
 */
export function useWebWorker(workerPath, options = {}) {
  const [worker, setWorker] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());
  let messageId = 0;

  // Initialize worker
  useEffect(() => {
    try {
      const newWorker = new Worker(workerPath, options);
      
      newWorker.onmessage = (event) => {
        const { id, type, data, error: workerError } = event.data;
        
        if (type === 'ready') {
          setIsReady(true);
          return;
        }

        // Call the appropriate callback
        const callback = callbacksRef.current.get(id);
        if (callback) {
          if (workerError) {
            callback.reject(new Error(workerError));
          } else {
            callback.resolve(data);
          }
          callbacksRef.current.delete(id);
        }

        setResult(data);
        setIsProcessing(false);
      };

      newWorker.onerror = (err) => {
        setError(err.message);
        setIsProcessing(false);
      };

      workerRef.current = newWorker;
      setWorker(newWorker);
    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [workerPath]);

  // Post message to worker
  const postMessage = useCallback((data, transfer = []) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = messageId++;
      callbacksRef.current.set(id, { resolve, reject });

      workerRef.current.postMessage({ id, data }, transfer);
      setIsProcessing(true);
    });
  }, []);

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setWorker(null);
      setIsReady(false);
    }
  }, []);

  // Restart worker
  const restart = useCallback(() => {
    terminate();
    setTimeout(() => {
      const newWorker = new Worker(workerPath, options);
      workerRef.current = newWorker;
      setWorker(newWorker);
    }, 100);
  }, [terminate, workerPath, options]);

  return {
    worker,
    isReady,
    error,
    result,
    isProcessing,
    postMessage,
    terminate,
    restart
  };
}

export default useWebWorker;
