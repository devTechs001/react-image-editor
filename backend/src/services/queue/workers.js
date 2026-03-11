// backend/src/queue/workers.js
const { Worker } = require('bullmq');
const logger = require('../utils/logger');
const imageProcessor = require('../services/image/processor');
const videoProcessor = require('../services/video/processor');
const emailService = require('../services/email/emailService');
const aiService = require('../services/ai');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

// Image Processing Worker
const imageWorker = new Worker('image-processing', async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing image job: ${job.id}, type: ${type}`);

  switch (type) {
    case 'resize':
      return await imageProcessor.resize(data);
    case 'compress':
      return await imageProcessor.compress(data);
    case 'convert':
      return await imageProcessor.convert(data);
    case 'thumbnail':
      return await imageProcessor.generateThumbnail(data);
    default:
      throw new Error(`Unknown image processing type: ${type}`);
  }
}, { connection });

// Export Worker
const exportWorker = new Worker('export', async (job) => {
  const { exportId, projectId, settings, userId } = job.data;
  logger.info(`Processing export job: ${job.id}`);

  const Export = require('../models/Export');
  const Project = require('../models/Project');

  try {
    // Update status to processing
    await Export.findByIdAndUpdate(exportId, { 
      status: 'processing',
      progress: 10 
    });

    // Get project
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Process based on type
    let result;
    switch (project.type) {
      case 'image':
        result = await imageProcessor.export(project, settings, (progress) => {
          Export.findByIdAndUpdate(exportId, { progress });
        });
        break;
      case 'video':
        result = await videoProcessor.export(project, settings, (progress) => {
          Export.findByIdAndUpdate(exportId, { progress });
        });
        break;
      default:
        throw new Error(`Unsupported project type: ${project.type}`);
    }

    // Update export with result
    await Export.findByIdAndUpdate(exportId, {
      status: 'completed',
      progress: 100,
      output: result,
      processingTime: Date.now() - job.timestamp
    });

    // Notify user via WebSocket
    const io = require('../app').io;
    io.emitToUser(userId, 'export:completed', {
      exportId,
      projectId,
      url: result.url
    });

    return result;
  } catch (error) {
    await Export.findByIdAndUpdate(exportId, {
      status: 'failed',
      error: { message: error.message }
    });

    const io = require('../app').io;
    io.emitToUser(userId, 'export:failed', {
      exportId,
      error: error.message
    });

    throw error;
  }
}, { connection });

// Email Worker
const emailWorker = new Worker('email', async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing email job: ${job.id}, type: ${type}`);

  switch (type) {
    case 'verification':
      return await emailService.sendVerificationEmail(data.email, data.token);
    case 'password-reset':
      return await emailService.sendPasswordResetEmail(data.email, data.token);
    case 'welcome':
      return await emailService.sendWelcomeEmail(data.email, data.name);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}, { connection });

// AI Processing Worker
const aiWorker = new Worker('ai-processing', async (job) => {
  const { type, data, userId } = job.data;
  logger.info(`Processing AI job: ${job.id}, type: ${type}`);

  const AILog = require('../models/AILog');
  const logId = data.logId;

  try {
    let result;

    switch (type) {
      case 'background_removal':
        result = await aiService.backgroundRemoval.remove(data.imageBuffer);
        break;
      case 'upscale':
        result = await aiService.imageUpscaling.upscale(data.imageBuffer, data.scale);
        break;
      case 'generate':
        result = await aiService.imageGeneration.generate(data.options);
        break;
      default:
        throw new Error(`Unknown AI processing type: ${type}`);
    }

    // Update log
    await AILog.findByIdAndUpdate(logId, {
      status: 'completed',
      output: result,
      metrics: { processingTime: Date.now() - job.timestamp }
    });

    // Notify user
    const io = require('../app').io;
    io.emitToUser(userId, 'ai:completed', {
      type,
      result: result.url || result
    });

    return result;
  } catch (error) {
    await AILog.findByIdAndUpdate(logId, {
      status: 'failed',
      error: { message: error.message }
    });

    throw error;
  }
}, { connection, concurrency: 2 });

// Worker event handlers
[imageWorker, exportWorker, emailWorker, aiWorker].forEach(worker => {
  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });
});

module.exports = {
  imageWorker,
  exportWorker,
  emailWorker,
  aiWorker
};