// backend/src/services/export/batchExport.js
const async = require('async');
const { exportImage } = require('./imageExport');
const { exportGif } = require('./gifExport');
const { exportVideo } = require('./videoExport');
const { exportPdf } = require('./pdfExport');
const { uploadToStorage } = require('../storage/s3Storage');
const logger = require('../../utils/logger');

/**
 * Batch export multiple projects
 * @param {Array} projects - Array of project documents
 * @param {Object} options - Export options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of export results
 */
async function batchExport(projects, options = {}, onProgress) {
  const {
    format = 'png',
    concurrency = 3
  } = options;

  const results = [];
  const total = projects.length;
  let completed = 0;

  const exportFunction = getExportFunction(format);

  await async.eachLimit(projects, concurrency, async (project) => {
    try {
      const result = await exportFunction(project, options);
      
      // Upload to storage
      const key = `exports/batch/${project._id}-${Date.now()}.${format}`;
      const url = await uploadToStorage(result.buffer, key, result.mimeType);
      
      results.push({
        projectId: project._id,
        success: true,
        url,
        ...result
      });
    } catch (error) {
      logger.error(`Batch export failed for project ${project._id}:`, error);
      results.push({
        projectId: project._id,
        success: false,
        error: error.message
      });
    }

    completed++;
    onProgress?.({
      total,
      completed,
      failed: results.filter(r => !r.success).length,
      progress: Math.round((completed / total) * 100)
    });
  });

  return results;
}

/**
 * Get export function for format
 */
function getExportFunction(format) {
  const exporters = {
    png: exportImage,
    jpg: exportImage,
    jpeg: exportImage,
    webp: exportImage,
    tiff: exportImage,
    gif: exportGif,
    mp4: exportVideo,
    webm: exportVideo,
    pdf: exportPdf
  };

  return exporters[format?.toLowerCase()] || exportImage;
}

/**
 * Schedule batch export
 * @param {Object} user - User document
 * @param {Array} projectIds - Array of project IDs
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Job information
 */
async function scheduleBatchExport(user, projectIds, options = {}) {
  const Queue = require('../queue/bullQueue');
  
  const job = await Queue.add('batchExport', {
    userId: user._id,
    projectIds,
    options
  }, {
    priority: user.plan === 'enterprise' ? 1 : user.plan === 'pro' ? 5 : 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });

  return {
    jobId: job.id,
    status: 'queued',
    estimatedTime: projectIds.length * 30 // 30 seconds per export estimate
  };
}

/**
 * Get batch export status
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} - Job status
 */
async function getBatchExportStatus(jobId) {
  const Queue = require('../queue/bullQueue');
  
  const job = await Queue.getJob(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }

  const state = await job.getState();
  const result = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    jobId,
    status: state,
    progress: job.progress(),
    result,
    error: failedReason,
    createdAt: job.timestamp,
    finishedAt: job.finishedOn
  };
}

module.exports = {
  batchExport,
  scheduleBatchExport,
  getBatchExportStatus
};
