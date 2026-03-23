// frontend/src/services/export/index.js
/**
 * Export Services Module
 * Central export for all export-related functionality
 */

export {
  exportCanvasToBlob,
  exportCanvasToDataURL,
  downloadImage,
  exportLayers,
  exportWithMetadata,
  createThumbnail,
  exportResponsiveImages,
  ImageFormat,
  ImageQuality
} from './imageExporter';

export {
  compressImage,
  estimateFileSize,
  getOptimalFormat,
  batchCompress,
  progressiveOptimize,
  CompressionPreset
} from './compressionOptimizer';

export {
  applyWatermark,
  removeWatermark,
  batchApplyWatermark,
  WatermarkPosition,
  WatermarkType,
  WatermarkPresets
} from './watermark';

export {
  extractMetadata,
  addMetadata,
  removeMetadata,
  createMetadataTemplate,
  MetadataType
} from './metadataEditor';

export {
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
} from './batchProcessor';

export {
  exportCanvasVideo,
  exportGif,
  exportVideoWithAudio,
  exportTimeline,
  extractFramesFromVideo,
  downloadVideo,
  getSupportedVideoTypes,
  VideoFormat,
  VideoCodec,
  VideoQuality
} from './videoExporter';

export {
  exportGif,
  exportCanvasAnimation,
  createLoadingSpinnerGif,
  createAnimatedTextGif,
  downloadGif,
  GifQuality,
  GifDisposal
} from './gifExporter';

export {
  exportToPdf,
  exportMultipleToPdf,
  createPdfWithContent,
  downloadPdf,
  printPdf,
  PaperSize,
  Orientation,
  FitMode
} from './pdfExporter';
