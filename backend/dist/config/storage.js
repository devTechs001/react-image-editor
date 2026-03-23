// backend/src/config/storage.js
const {
  S3Client
} = require('@aws-sdk/client-s3');
const cloudinary = require('cloudinary').v2;

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
module.exports = {
  s3Client,
  cloudinary,
  buckets: {
    uploads: process.env.S3_BUCKET_UPLOADS || 'ai-media-editor-uploads',
    exports: process.env.S3_BUCKET_EXPORTS || 'ai-media-editor-exports',
    thumbnails: process.env.S3_BUCKET_THUMBNAILS || 'ai-media-editor-thumbnails'
  }
};