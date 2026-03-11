// backend/src/queue/bullQueue.js
const { Queue, Worker, QueueScheduler } = require('bullmq');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

// Create queues
const imageProcessingQueue = new Queue('image-processing', { connection });
const videoProcessingQueue = new Queue('video-processing', { connection });
const exportQueue = new Queue('export', { connection });
const emailQueue = new Queue('email', { connection });
const aiProcessingQueue = new Queue('ai-processing', { connection });

// Create schedulers
new QueueScheduler('image-processing', { connection });
new QueueScheduler('video-processing', { connection });
new QueueScheduler('export', { connection });
new QueueScheduler('email', { connection });
new QueueScheduler('ai-processing', { connection });

// Add job helper
const addJob = async (queueName, jobName, data, options = {}) => {
  const queues = {
    'image-processing': imageProcessingQueue,
    'video-processing': videoProcessingQueue,
    'export': exportQueue,
    'email': emailQueue,
    'ai-processing': aiProcessingQueue
  };

  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  const job = await queue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50,
    ...options
  });

  logger.info(`Job ${jobName} added to ${queueName} queue: ${job.id}`);
  return job;
};

module.exports = {
  imageProcessingQueue,
  videoProcessingQueue,
  exportQueue,
  emailQueue,
  aiProcessingQueue,
  addJob
};