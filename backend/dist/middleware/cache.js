// backend/src/middleware/cache.js
const {
  getRedis
} = require('../config/redis');
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    const redis = getRedis();
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        return res.json(data);
      }

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function
      res.json = body => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          redis.setex(key, duration, JSON.stringify(body)).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        return originalJson(body);
      };
      next();
    } catch (error) {
      // If cache fails, continue without caching
      next();
    }
  };
};
const clearCache = pattern => {
  return async (req, res, next) => {
    const redis = getRedis();

    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json function
    res.json = async body => {
      // Clear cache after successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const keys = await redis.keys(`cache:${pattern}`);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        } catch (error) {
          console.error('Cache clear error:', error);
        }
      }
      return originalJson(body);
    };
    next();
  };
};
module.exports = {
  cache,
  clearCache
};