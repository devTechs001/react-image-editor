// frontend/src/services/export/batchProcessor.js
import { exportCanvasToBlob, ImageFormat, ImageQuality } from './imageExporter';
import { compressImage } from './compressionOptimizer';
import { applyWatermark } from './watermark';
import { addMetadata, removeMetadata } from './metadataEditor';

/**
 * Batch Processor Service
 * Handles batch processing of multiple images with queue management
 */

export const BatchStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export const BatchOperation = {
  EXPORT: 'export',
  COMPRESS: 'compress',
  WATERMARK: 'watermark',
  RESIZE: 'resize',
  CONVERT: 'convert',
  METADATA: 'metadata'
};

/**
 * Batch job class for managing batch operations
 */
export class BatchJob {
  constructor(id, items, operation, options = {}) {
    this.id = id;
    this.items = items;
    this.operation = operation;
    this.options = options;
    this.status = BatchStatus.PENDING;
    this.progress = 0;
    this.results = [];
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    this.cancelled = false;
  }

  setProgress(progress) {
    this.progress = progress;
    if (this.onProgress) {
      this.onProgress({ progress, completed: this.results.length, total: this.items.length });
    }
  }

  addResult(result) {
    this.results.push(result);
  }

  addError(error, index) {
    this.errors.push({ index, error: error.message });
  }

  complete() {
    this.status = BatchStatus.COMPLETED;
    this.endTime = Date.now();
    if (this.onComplete) {
      this.onComplete({
        results: this.results,
        errors: this.errors,
        duration: this.endTime - this.startTime
      });
    }
  }

  fail(error) {
    this.status = BatchStatus.FAILED;
    this.endTime = Date.now();
    if (this.onError) {
      this.onError(error);
    }
  }

  cancel() {
    this.cancelled = true;
    this.status = BatchStatus.CANCELLED;
    this.endTime = Date.now();
  }

  getDuration() {
    return this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime;
  }
}

/**
 * Process batch export
 * @param {Array<HTMLCanvasElement>} canvases - Canvases to export
 * @param {Object} options - Export options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchExport(canvases, options = {}, onProgress = null) {
  const job = new BatchJob(generateId(), canvases, BatchOperation.EXPORT, options);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  try {
    for (let i = 0; i < canvases.length; i++) {
      if (job.cancelled) break;

      try {
        const blob = await exportCanvasToBlob(canvases[i], options);
        job.addResult({
          index: i,
          blob,
          name: options.filenamePattern 
            ? replaceFilenamePattern(options.filenamePattern, i, canvases.length)
            : `export_${i}`
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / canvases.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch compression
 * @param {Array<File|Blob>} files - Files to compress
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchCompress(files, options = {}, onProgress = null) {
  const job = new BatchJob(generateId(), files, BatchOperation.COMPRESS, options);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  try {
    for (let i = 0; i < files.length; i++) {
      if (job.cancelled) break;

      try {
        const compressed = await compressImage(files[i], options.format, options.quality, options);
        const originalSize = files[i].size;
        const compressedSize = compressed.size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        job.addResult({
          index: i,
          blob: compressed,
          originalSize,
          compressedSize,
          savings: `${savings}%`,
          name: files[i].name || `compressed_${i}`
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / files.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch watermark
 * @param {Array<HTMLCanvasElement>} canvases - Canvases to watermark
 * @param {Object} watermarkConfig - Watermark configuration
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchWatermark(canvases, watermarkConfig, onProgress = null) {
  const job = new BatchJob(generateId(), canvases, BatchOperation.WATERMARK, watermarkConfig);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  try {
    for (let i = 0; i < canvases.length; i++) {
      if (job.cancelled) break;

      try {
        const watermarked = await applyWatermark(canvases[i], watermarkConfig);
        job.addResult({
          index: i,
          canvas: watermarked,
          name: `watermarked_${i}`
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / canvases.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch resize
 * @param {Array<HTMLCanvasElement>} canvases - Canvases to resize
 * @param {Object} options - Resize options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchResize(canvases, options = {}, onProgress = null) {
  const job = new BatchJob(generateId(), canvases, BatchOperation.RESIZE, options);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  const { maxWidth, maxHeight, maintainAspect = true } = options;

  try {
    for (let i = 0; i < canvases.length; i++) {
      if (job.cancelled) break;

      try {
        const resized = resizeCanvas(canvases[i], maxWidth, maxHeight, maintainAspect);
        job.addResult({
          index: i,
          canvas: resized,
          originalWidth: canvases[i].width,
          originalHeight: canvases[i].height,
          newWidth: resized.width,
          newHeight: resized.height,
          name: `resized_${i}`
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / canvases.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch format conversion
 * @param {Array<File|Blob>} files - Files to convert
 * @param {Object} options - Conversion options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchConvert(files, options = {}, onProgress = null) {
  const job = new BatchJob(generateId(), files, BatchOperation.CONVERT, options);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  const { targetFormat = ImageFormat.JPEG, quality = ImageQuality.HIGH } = options;

  try {
    for (let i = 0; i < files.length; i++) {
      if (job.cancelled) break;

      try {
        const canvas = await fileToCanvas(files[i]);
        const converted = await exportCanvasToBlob(canvas, { format: targetFormat, quality });
        
        job.addResult({
          index: i,
          blob: converted,
          originalFormat: files[i].type,
          newFormat: targetFormat,
          name: changeExtension(files[i].name || `converted_${i}`, getExtensionFromMime(targetFormat))
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / files.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch metadata operations
 * @param {Array<File>} files - Files to process
 * @param {Object} options - Metadata options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchMetadata(files, options = {}, onProgress = null) {
  const job = new BatchJob(generateId(), files, BatchOperation.METADATA, options);
  job.onProgress = onProgress;
  job.startTime = Date.now();

  const { operation = 'add', metadata = {} } = options;

  try {
    for (let i = 0; i < files.length; i++) {
      if (job.cancelled) break;

      try {
        let result;
        if (operation === 'add') {
          result = await addMetadata(files[i], metadata);
        } else if (operation === 'remove') {
          result = await removeMetadata(files[i]);
        }

        job.addResult({
          index: i,
          blob: result,
          operation,
          name: files[i].name
        });
      } catch (error) {
        job.addError(error, i);
      }

      job.setProgress(((i + 1) / files.length) * 100);
    }

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Process batch with multiple operations (pipeline)
 * @param {Array<File|HTMLCanvasElement>} items - Items to process
 * @param {Array<Object>} pipeline - Array of operations to apply in order
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<BatchJob>} - Batch job with results
 */
export async function batchPipeline(items, pipeline, onProgress = null) {
  const job = new BatchJob(generateId(), items, 'pipeline', { pipeline });
  job.onProgress = onProgress;
  job.startTime = Date.now();

  try {
    let currentItems = [...items];

    for (let p = 0; p < pipeline.length; p++) {
      const operation = pipeline[p];
      const operationProgress = (p / pipeline.length) * 100;
      
      let results = [];
      
      for (let i = 0; i < currentItems.length; i++) {
        if (job.cancelled) break;

        try {
          const result = await applyOperation(currentItems[i], operation);
          results.push(result);
        } catch (error) {
          job.addError(error, i);
          results.push(currentItems[i]); // Keep original on error
        }
      }

      currentItems = results;
      job.setProgress(operationProgress + ((p + 1) / pipeline.length) * 100 / pipeline.length);
    }

    job.results = currentItems.map((item, i) => ({
      index: i,
      result: item
    }));

    job.complete();
  } catch (error) {
    job.fail(error);
  }

  return job;
}

/**
 * Apply single operation to item
 */
async function applyOperation(item, operation) {
  switch (operation.type) {
    case 'resize':
      return resizeCanvas(item, operation.maxWidth, operation.maxHeight);
    case 'watermark':
      return await applyWatermark(item, operation.config);
    case 'compress':
      return await compressImage(item, operation.format, operation.quality);
    default:
      return item;
  }
}

/**
 * Resize canvas helper
 */
function resizeCanvas(canvas, maxWidth, maxHeight, maintainAspect = true) {
  const resized = document.createElement('canvas');
  let width = canvas.width;
  let height = canvas.height;

  if (maintainAspect) {
    const ratio = Math.min(
      maxWidth ? maxWidth / width : Infinity,
      maxHeight ? maxHeight / height : Infinity
    );
    if (ratio < 1) {
      width *= ratio;
      height *= ratio;
    }
  } else {
    width = maxWidth;
    height = maxHeight;
  }

  resized.width = Math.floor(width);
  resized.height = Math.floor(height);
  const ctx = resized.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);

  return resized;
}

/**
 * Convert file to canvas
 */
async function fileToCanvas(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate unique ID
 */
function generateId() {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Replace filename pattern
 */
function replaceFilenamePattern(pattern, index, total) {
  return pattern
    .replace('{index}', String(index).padStart(3, '0'))
    .replace('{total}', String(total))
    .replace('{timestamp}', Date.now().toString());
}

/**
 * Change file extension
 */
function changeExtension(filename, newExt) {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return `${filename}.${newExt}`;
  return `${filename.substring(0, lastDot)}.${newExt}`;
}

/**
 * Get extension from MIME type
 */
function getExtensionFromMime(mime) {
  const extensions = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return extensions[mime] || 'bin';
}

/**
 * Download all batch results as ZIP
 */
export async function downloadBatchAsZip(job, zipFilename = 'batch_export.zip') {
  // Note: Full ZIP implementation would use JSZip library
  // This is a simplified version that downloads individually
  
  for (const result of job.results) {
    if (result.blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(result.blob);
      link.download = result.name || `file_${result.index}`;
      link.click();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
    }
  }
}

export default {
  BatchJob,
  BatchStatus,
  BatchOperation,
  batchExport,
  batchCompress,
  batchWatermark,
  batchResize,
  batchConvert,
  batchMetadata,
  batchPipeline,
  downloadBatchAsZip
};
