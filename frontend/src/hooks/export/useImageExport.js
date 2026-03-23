// frontend/src/hooks/export/useImageExport.js
import { useState, useCallback, useMemo } from 'react';
import {
  exportCanvasToBlob,
  exportCanvasToDataURL,
  downloadImage,
  createThumbnail,
  exportResponsiveImages,
  ImageFormat,
  ImageQuality
} from '@/services/export/imageExporter';
import { compressImage, getOptimalFormat } from '@/services/export/compressionOptimizer';
import { applyWatermark } from '@/services/export/watermark';
import { addMetadata, removeMetadata } from '@/services/export/metadataEditor';

/**
 * Hook for handling image export operations
 * @param {HTMLCanvasElement|null} canvas - The canvas to export
 * @param {Object} defaultOptions - Default export options
 */
export function useImageExport(canvas, defaultOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  const exportOptions = useMemo(() => ({
    format: ImageFormat.PNG,
    quality: ImageQuality.HIGH,
    scale: 1,
    maxWidth: null,
    maxHeight: null,
    ...defaultOptions
  }), [defaultOptions]);

  /**
   * Export canvas to blob
   */
  const exportToBlob = useCallback(async (options = {}) => {
    if (!canvas) {
      throw new Error('Canvas is not available');
    }

    setIsExporting(true);
    setError(null);
    setProgress(0);

    try {
      const mergedOptions = { ...exportOptions, ...options };
      setProgress(20);
      
      const blob = await exportCanvasToBlob(canvas, mergedOptions);
      
      setProgress(100);
      setLastExport({ blob, type: blob.type, size: blob.size });
      
      return blob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [canvas, exportOptions]);

  /**
   * Export and download immediately
   */
  const exportAndDownload = useCallback(async (options = {}) => {
    const blob = await exportToBlob(options);
    const filename = options.filename || 'export';
    downloadImage(blob, filename);
    return blob;
  }, [exportToBlob]);

  /**
   * Export with compression
   */
  const exportCompressed = useCallback(async (options = {}) => {
    if (!canvas) throw new Error('Canvas is not available');

    setIsExporting(true);
    setError(null);

    try {
      const { targetSize, format, quality = 0.75 } = options;
      const optimalFormat = format || getOptimalFormat(canvas, { preferSmallSize: !!targetSize });
      
      setProgress(30);
      const blob = await compressImage(canvas, optimalFormat, quality, { targetSize });
      
      setProgress(100);
      setLastExport({ blob, type: blob.type, size: blob.size, compressed: true });
      
      return blob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [canvas]);

  /**
   * Export with watermark
   */
  const exportWithWatermark = useCallback(async (watermarkConfig, exportOptions = {}) => {
    if (!canvas) throw new Error('Canvas is not available');

    setIsExporting(true);
    setError(null);

    try {
      setProgress(30);
      const watermarkedCanvas = await applyWatermark(canvas, watermarkConfig);
      
      setProgress(60);
      const blob = await exportCanvasToBlob(watermarkedCanvas, exportOptions);
      
      setProgress(100);
      setLastExport({ blob, type: blob.type, size: blob.size, watermarked: true });
      
      return blob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [canvas]);

  /**
   * Export with metadata
   */
  const exportWithMetadata = useCallback(async (metadata, options = {}) => {
    if (!canvas) throw new Error('Canvas is not available');

    setIsExporting(true);
    setError(null);

    try {
      const blob = await exportToBlob(options);
      
      setProgress(50);
      // Note: Full metadata embedding requires backend or library support
      const blobWithMetadata = await addMetadata(blob, metadata);
      
      setProgress(100);
      setLastExport({ blob: blobWithMetadata, type: blobWithMetadata.type, size: blobWithMetadata.size, hasMetadata: true });
      
      return blobWithMetadata;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [exportToBlob]);

  /**
   * Create thumbnail
   */
  const createThumbnailMemo = useCallback(async (size = 256) => {
    if (!canvas) throw new Error('Canvas is not available');

    try {
      const thumbnail = await createThumbnail(canvas, size);
      return thumbnail;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [canvas]);

  /**
   * Export responsive images (multiple sizes)
   */
  const exportResponsive = useCallback(async (sizes = [320, 640, 1024, 1920]) => {
    if (!canvas) throw new Error('Canvas is not available');

    setIsExporting(true);
    setError(null);

    try {
      const exports = await exportResponsiveImages(canvas, sizes);
      setLastExport({ exports, type: 'responsive' });
      return exports;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [canvas]);

  /**
   * Reset export state
   */
  const reset = useCallback(() => {
    setIsExporting(false);
    setProgress(0);
    setError(null);
    setLastExport(null);
  }, []);

  return {
    isExporting,
    progress,
    error,
    lastExport,
    exportToBlob,
    exportAndDownload,
    exportCompressed,
    exportWithWatermark,
    exportWithMetadata,
    createThumbnail: createThumbnailMemo,
    exportResponsive,
    reset
  };
}

/**
 * Hook for handling batch image export
 */
export function useBatchExport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [cancelled, setCancelled] = useState(false);

  const processBatch = useCallback(async (items, processor, options = {}) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setErrors([]);
    setCancelled(false);

    const batchResults = [];
    const batchErrors = [];

    for (let i = 0; i < items.length; i++) {
      if (cancelled) break;

      try {
        const result = await processor(items[i], i);
        batchResults.push(result);
      } catch (err) {
        batchErrors.push({ index: i, error: err.message });
      }

      setProgress(((i + 1) / items.length) * 100);
    }

    setResults(batchResults);
    setErrors(batchErrors);
    setIsProcessing(false);

    return { results: batchResults, errors: batchErrors };
  }, []);

  const cancel = useCallback(() => {
    setCancelled(true);
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setResults([]);
    setErrors([]);
    setCancelled(false);
  }, []);

  return {
    isProcessing,
    progress,
    results,
    errors,
    cancelled,
    processBatch,
    cancel,
    reset
  };
}

/**
 * Hook for export queue management
 */
export function useExportQueue() {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  const addToQueue = useCallback((job) => {
    setQueue(prev => [...prev, { ...job, id: Date.now(), status: 'pending' }]);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue(prev => prev.filter(job => job.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentJob(null);
  }, []);

  const processQueue = useCallback(async (processor) => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);

    for (const job of queue) {
      if (job.status === 'completed') continue;

      setCurrentJob(job);
      setQueue(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'processing' } : j
      ));

      try {
        await processor(job);
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'completed' } : j
        ));
      } catch (err) {
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'failed', error: err.message } : j
        ));
      }
    }

    setCurrentJob(null);
    setIsProcessing(false);
  }, [queue, isProcessing]);

  return {
    queue,
    isProcessing,
    currentJob,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue
  };
}

export default useImageExport;
