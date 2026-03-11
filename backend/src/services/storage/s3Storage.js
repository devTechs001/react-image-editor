// backend/src/services/storage/s3Storage.js
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, buckets } = require('../../config/storage');
const crypto = require('crypto');

const uploadToStorage = async (buffer, key, contentType, bucket = buckets.uploads) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000'
    });

    await s3Client.send(command);

    // Return public URL or signed URL
    const url = `https://${bucket}.s3.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file');
  }
};

const getSignedDownloadUrl = async (key, bucket = buckets.uploads, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw new Error('Failed to generate download URL');
  }
};

const deleteFromStorage = async (key, bucket = buckets.uploads) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file');
  }
};

const generateUniqueKey = (originalName, prefix = '') => {
  const ext = originalName.split('.').pop();
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${prefix}${timestamp}-${hash}.${ext}`;
};

module.exports = {
  uploadToStorage,
  getSignedDownloadUrl,
  deleteFromStorage,
  generateUniqueKey
};