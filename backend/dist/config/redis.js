// backend/src/config/redis.js
const Redis = require('ioredis');
const config = require('./app');
const logger = require('../utils/logger');
let redis = null;
const createRedisClient = () => {
  if (redis) return redis;
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db,
    retryStrategy: times => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  });
  redis.on('connect', () => {
    logger.info('Redis connected');
  });
  redis.on('error', err => {
    logger.error('Redis error:', err);
  });
  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });
  return redis;
};
module.exports = {
  createRedisClient,
  getRedis: () => redis || createRedisClient()
};