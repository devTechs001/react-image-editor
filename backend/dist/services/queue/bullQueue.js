// backend/src/services/queue/bullQueue.js
const Bull = require('bull');
const config = require('../../config/app');
const logger = require('../../utils/logger');

// Create queue connections
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  maxRetriesPerRequest: null
};

// Main job queues
const imageProcessingQueue = new Bull('image-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});
const videoProcessingQueue = new Bull('video-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 500,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});
const aiProcessingQueue = new Bull('ai-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  }
});
const exportQueue = new Bull('export', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});
const emailQueue = new Bull('email', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
    attempts: 5,
    backoff: {
      type: 'fixed',
      delay: 60000
    }
  }
});
const cleanupQueue = new Bull('cleanup', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 50,
    attempts: 1
  }
});

// Queue events logging
[imageProcessingQueue, videoProcessingQueue, aiProcessingQueue, exportQueue, emailQueue].forEach(queue => {
  queue.on('error', error => {
    logger.error(`Queue ${queue.name} error:`, error);
  });
  queue.on('failed', (job, error) => {
    logger.warn(`Queue ${queue.name} job ${job.id} failed:`, error.message);
  });
  queue.on('completed', (job, result) => {
    logger.info(`Queue ${queue.name} job ${job.id} completed`);
  });
});

// Helper functions
async function addJob(queueName, data, options = {}) {
  let queue;
  switch (queueName) {
    case 'image-processing':
      queue = imageProcessingQueue;
      break;
    case 'video-processing':
      queue = videoProcessingQueue;
      break;
    case 'ai-processing':
      queue = aiProcessingQueue;
      break;
    case 'export':
      queue = exportQueue;
      break;
    case 'email':
      queue = emailQueue;
      break;
    case 'cleanup':
      queue = cleanupQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  const job = await queue.add(data, {
    priority: options.priority || 10,
    delay: options.delay || 0,
    attempts: options.attempts,
    backoff: options.backoff,
    data: options.data
  });
  return job;
}
async function getJobStatus(queueName, jobId) {
  let queue;
  switch (queueName) {
    case 'image-processing':
      queue = imageProcessingQueue;
      break;
    case 'video-processing':
      queue = videoProcessingQueue;
      break;
    case 'ai-processing':
      queue = aiProcessingQueue;
      break;
    case 'export':
      queue = exportQueue;
      break;
    case 'email':
      queue = emailQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  const job = await queue.getJob(jobId);
  if (!job) {
    return null;
  }
  const state = await job.getState();
  return {
    id: job.id,
    name: job.name,
    state,
    progress: job.progress(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    attemptsMade: job.attemptsMade
  };
}
async function getQueueStats(queueName) {
  let queue;
  switch (queueName) {
    case 'image-processing':
      queue = imageProcessingQueue;
      break;
    case 'video-processing':
      queue = videoProcessingQueue;
      break;
    case 'ai-processing':
      queue = aiProcessingQueue;
      break;
    case 'export':
      queue = exportQueue;
      break;
    case 'email':
      queue = emailQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  const [waiting, active, completed, failed, delayed, paused] = await Promise.all([queue.getWaitingCount(), queue.getActiveCount(), queue.getCompletedCount(), queue.getFailedCount(), queue.getDelayedCount(), queue.getPausedCount()]);
  return {
    name: queue.name,
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused
  };
}
async function cleanQueue(queueName, gracePeriod = 3600000) {
  let queue;
  switch (queueName) {
    case 'image-processing':
      queue = imageProcessingQueue;
      break;
    case 'video-processing':
      queue = videoProcessingQueue;
      break;
    case 'ai-processing':
      queue = aiProcessingQueue;
      break;
    case 'export':
      queue = exportQueue;
      break;
    case 'email':
      queue = emailQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  await queue.clean(gracePeriod, 'completed');
  await queue.clean(gracePeriod, 'failed');
  logger.info(`Cleaned queue ${queueName}`);
}

// Close all queues gracefully
async function closeAllQueues() {
  await Promise.all([imageProcessingQueue.close(), videoProcessingQueue.close(), aiProcessingQueue.close(), exportQueue.close(), emailQueue.close(), cleanupQueue.close()]);
  logger.info('All queues closed');
}
module.exports = {
  imageProcessingQueue,
  videoProcessingQueue,
  aiProcessingQueue,
  exportQueue,
  emailQueue,
  cleanupQueue,
  addJob,
  getJobStatus,
  getQueueStats,
  cleanQueue,
  closeAllQueues
};