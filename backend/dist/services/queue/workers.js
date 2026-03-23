// backend/src/services/queue/workers.js
const {
  imageProcessingQueue,
  videoProcessingQueue,
  aiProcessingQueue,
  exportQueue,
  emailQueue,
  cleanupQueue
} = require('./bullQueue');
const logger = require('../../utils/logger');
const imageProcessor = require('../image/processor');
const videoProcessor = require('../video/processor');
const emailService = require('../email/emailService');
const {
  exportImage,
  exportGif,
  exportVideo
} = require('../export/imageExport');
const {
  deleteFromStorage
} = require('../storage/s3Storage');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Export = require('../../models/Export');

/**
 * Initialize all queue workers
 */
function initializeWorkers() {
  logger.info('Initializing queue workers...');

  // Image processing worker
  imageProcessingQueue.process('resize', async job => {
    const {
      imageBuffer,
      options
    } = job.data;
    return await imageProcessor.resize({
      buffer: imageBuffer,
      ...options
    });
  });
  imageProcessingQueue.process('compress', async job => {
    const {
      imageBuffer,
      options
    } = job.data;
    return await imageProcessor.compress({
      buffer: imageBuffer,
      ...options
    });
  });
  imageProcessingQueue.process('convert', async job => {
    const {
      imageBuffer,
      options
    } = job.data;
    return await imageProcessor.convert({
      buffer: imageBuffer,
      ...options
    });
  });

  // Video processing worker
  videoProcessingQueue.process('transcode', async job => {
    const {
      videoPath,
      options
    } = job.data;
    job.progress(10);
    const result = await videoProcessor.transcode(videoPath, options);
    job.progress(90);
    return result;
  });
  videoProcessingQueue.process('thumbnail', async job => {
    const {
      videoPath,
      options
    } = job.data;
    return await videoProcessor.generateThumbnail(videoPath, options);
  });

  // AI processing worker
  aiProcessingQueue.process('background-removal', async job => {
    const {
      imageBuffer
    } = job.data;
    job.progress(20);

    // Call AI service
    const result = await callBackgroundRemovalService(imageBuffer);
    job.progress(90);
    return result;
  });
  aiProcessingQueue.process('enhance', async job => {
    const {
      imageBuffer,
      options
    } = job.data;
    job.progress(20);
    const result = await callImageEnhancementService(imageBuffer, options);
    job.progress(90);
    return result;
  });
  aiProcessingQueue.process('face-detection', async job => {
    const {
      imageBuffer
    } = job.data;
    const {
      detectFaces
    } = require('../ai/faceDetection');
    return await detectFaces(imageBuffer);
  });
  aiProcessingQueue.process('object-detection', async job => {
    const {
      imageBuffer
    } = job.data;
    const {
      detectObjects
    } = require('../ai/objectDetection');
    return await detectObjects(imageBuffer);
  });

  // Export worker
  exportQueue.process('image', async job => {
    const {
      projectId,
      options
    } = job.data;
    job.progress(10);
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    job.progress(30);
    const result = await exportImage(project, options);
    job.progress(90);
    return result;
  });
  exportQueue.process('gif', async job => {
    const {
      projectId,
      options
    } = job.data;
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return await exportGif(project, options);
  });
  exportQueue.process('video', async job => {
    const {
      projectId,
      options
    } = job.data;
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return await exportVideo(project, options);
  });

  // Email worker
  emailQueue.process('welcome', async job => {
    const {
      email,
      name
    } = job.data;
    await emailService.sendWelcomeEmail(email, name);
  });
  emailQueue.process('verification', async job => {
    const {
      email,
      token
    } = job.data;
    await emailService.sendVerificationEmail(email, token);
  });
  emailQueue.process('password-reset', async job => {
    const {
      email,
      token
    } = job.data;
    await emailService.sendPasswordResetEmail(email, token);
  });
  emailQueue.process('notification', async job => {
    const {
      email,
      subject,
      html
    } = job.data;
    await emailService.sendEmail(email, subject, html);
  });

  // Cleanup worker
  cleanupQueue.process('expired-uploads', async job => {
    const {
      olderThan
    } = job.data;
    await cleanupExpiredUploads(olderThan);
  });
  cleanupQueue.process('failed-jobs', async job => {
    const {
      queues
    } = job.data;
    for (const queue of queues) {
      await queue.clean(3600000, 'failed');
    }
  });
  logger.info('Queue workers initialized');
}

/**
 * Call background removal service (placeholder)
 */
async function callBackgroundRemovalService(imageBuffer) {
  const {
    removeBackground
  } = require('../ai/backgroundRemoval');
  return await removeBackground(imageBuffer);
}

/**
 * Call image enhancement service (placeholder)
 */
async function callImageEnhancementService(imageBuffer, options) {
  const {
    enhanceImage
  } = require('../ai/imageEnhancement');
  return await enhanceImage(imageBuffer, options);
}

/**
 * Cleanup expired uploads
 */
async function cleanupExpiredUploads(olderThan) {
  const cutoffDate = new Date(Date.now() - olderThan);

  // Find expired assets
  const expiredAssets = await require('../../models/Asset').find({
    createdAt: {
      $lt: cutoffDate
    }
  });

  // Delete from storage
  for (const asset of expiredAssets) {
    try {
      await deleteFromStorage(asset.storageKey);
      await asset.deleteOne();
    } catch (error) {
      logger.error(`Failed to cleanup asset ${asset._id}:`, error);
    }
  }
  logger.info(`Cleaned up ${expiredAssets.length} expired uploads`);
  return expiredAssets.length;
}

/**
 * Process job progress update
 */
function onJobProgress(queue, jobId, progress) {
  queue.getJob(jobId).then(job => {
    if (job) {
      job.progress(progress);
    }
  });
}
module.exports = {
  initializeWorkers,
  onJobProgress
};