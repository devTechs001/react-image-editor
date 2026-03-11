// backend/src/utils/constants.js

// API Response status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// User roles
const USER_ROLES = {
  USER: 'user',
  PRO: 'pro',
  ADMIN: 'admin'
};

// Subscription plans
const PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Plan limits
const PLAN_LIMITS = {
  [PLANS.FREE]: {
    aiCredits: 10,
    storageGB: 0.5,
    exportsPerMonth: 10,
    maxProjectSize: 10 * 1024 * 1024, // 10MB
    maxResolution: 1920 * 1080
  },
  [PLANS.STARTER]: {
    aiCredits: 50,
    storageGB: 5,
    exportsPerMonth: 50,
    maxProjectSize: 50 * 1024 * 1024, // 50MB
    maxResolution: 3840 * 2160
  },
  [PLANS.PRO]: {
    aiCredits: 500,
    storageGB: 50,
    exportsPerMonth: 500,
    maxProjectSize: 200 * 1024 * 1024, // 200MB
    maxResolution: 7680 * 4320
  },
  [PLANS.ENTERPRISE]: {
    aiCredits: 2000,
    storageGB: 500,
    exportsPerMonth: -1, // unlimited
    maxProjectSize: 1024 * 1024 * 1024, // 1GB
    maxResolution: -1 // unlimited
  }
};

// Supported image formats
const IMAGE_FORMATS = {
  INPUT: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/tiff'],
  OUTPUT: ['png', 'jpeg', 'jpg', 'webp', 'gif', 'tiff', 'avif', 'heic']
};

// Supported video formats
const VIDEO_FORMATS = {
  INPUT: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  OUTPUT: ['mp4', 'webm', 'gif']
};

// Supported audio formats
const AUDIO_FORMATS = {
  INPUT: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/flac'],
  OUTPUT: ['mp3', 'wav', 'ogg', 'webm']
};

// Blend modes
const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

// Filter types
const FILTER_TYPES = {
  BASIC: ['blur', 'sharpen', 'brightness', 'contrast', 'saturation', 'hue', 'sepia', 'grayscale'],
  ADVANCED: ['curves', 'levels', 'color-balance', 'hsl'],
  ARTISTIC: ['vintage', 'dramatic', 'fade', 'instant', 'nostalgic', 'polaroid'],
  EFFECTS: ['vignette', 'grain', 'glow', 'tilt-shift', 'lens-blur']
};

// Export presets
const EXPORT_PRESETS = {
  WEB: { format: 'webp', quality: 80, scale: 1 },
  SOCIAL: { format: 'jpg', quality: 90, maxWidth: 1080 },
  PRINT: { format: 'png', quality: 100, dpi: 300 },
  THUMBNAIL: { format: 'jpg', quality: 70, width: 300, height: 300 }
};

// Cache durations (in seconds)
const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  VERY_LONG: 86400  // 24 hours
};

// Rate limits
const RATE_LIMITS = {
  DEFAULT: { windowMs: 15 * 60 * 1000, max: 100 },  // 100 requests per 15 minutes
  UPLOAD: { windowMs: 60 * 60 * 1000, max: 50 },     // 50 uploads per hour
  AI: { windowMs: 60 * 60 * 1000, max: 20 },         // 20 AI operations per hour
  EXPORT: { windowMs: 60 * 60 * 1000, max: 30 }      // 30 exports per hour
};

// File size limits (in bytes)
const FILE_LIMITS = {
  IMAGE: 50 * 1024 * 1024,    // 50MB
  VIDEO: 500 * 1024 * 1024,   // 500MB
  AUDIO: 100 * 1024 * 1024,   // 100MB
  PROJECT: 100 * 1024 * 1024  // 100MB
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

// Sort options
const SORT_OPTIONS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
  SIZE: 'size'
};

// Sort directions
const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  PLANS,
  PLAN_LIMITS,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  AUDIO_FORMATS,
  BLEND_MODES,
  FILTER_TYPES,
  EXPORT_PRESETS,
  CACHE_TTL,
  RATE_LIMITS,
  FILE_LIMITS,
  PAGINATION,
  SORT_OPTIONS,
  SORT_DIRECTIONS
};
