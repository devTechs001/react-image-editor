// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('./errorHandler');
const config = require('../config/app');

// Memory storage for processing before cloud upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed.`, 400), false);
  }
};

// Image upload
const uploadImage = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10
  },
  fileFilter: fileFilter(config.upload.allowedImageTypes)
});

// Video upload
const uploadVideo = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize * 10, // 500MB for videos
    files: 5
  },
  fileFilter: fileFilter(config.upload.allowedVideoTypes)
});

// Audio upload
const uploadAudio = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10
  },
  fileFilter: fileFilter(config.upload.allowedAudioTypes)
});

// Mixed upload (any supported type)
const uploadAny = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10
  },
  fileFilter: fileFilter([
    ...config.upload.allowedImageTypes,
    ...config.upload.allowedVideoTypes,
    ...config.upload.allowedAudioTypes
  ])
});

// Generate unique filename
const generateFilename = (originalname) => {
  const ext = path.extname(originalname);
  const hash = crypto.randomBytes(16).toString('hex');
  return `${hash}${ext}`;
};

// Handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files.', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field.', 400));
    }
  }
  next(err);
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadAny,
  generateFilename,
  handleUploadError
};