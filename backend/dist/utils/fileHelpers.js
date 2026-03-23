// backend/src/utils/fileHelpers.js
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${name}-${timestamp}-${random}${ext}`;
}

/**
 * Sanitize filename
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').toLowerCase();
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} - File size
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file MIME type from extension
 * @param {string} filename - Filename
 * @returns {string} - MIME type
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} - Whether file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, {
    recursive: true
  });
}

/**
 * Delete file
 * @param {string} filePath - Path to file
 */
async function deleteFile(filePath) {
  await fs.unlink(filePath);
}

/**
 * Move file
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
async function moveFile(source, destination) {
  await fs.rename(source, destination);
}

/**
 * Copy file
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
async function copyFile(source, destination) {
  await fs.copyFile(source, destination);
}

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} - File extension
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * Get filename without extension
 * @param {string} filename - Filename
 * @returns {string} - Filename without extension
 */
function getFilenameWithoutExtension(filename) {
  return path.basename(filename, path.extname(filename));
}

/**
 * Validate file type
 * @param {string} filename - Filename
 * @param {Array<string>} allowedTypes - Allowed MIME types or extensions
 * @returns {boolean} - Whether file type is allowed
 */
function validateFileType(filename, allowedTypes) {
  const ext = getFileExtension(filename);
  const mimeType = getMimeType(filename);
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return ext === type.toLowerCase();
    }
    if (type.includes('/')) {
      return mimeType === type || mimeType.startsWith(type.split('/')[0] + '/');
    }
    return ext === `.${type}`;
  });
}

/**
 * Calculate file hash
 * @param {Buffer} buffer - File buffer
 * @param {string} algorithm - Hash algorithm
 * @returns {string} - File hash
 */
function calculateHash(buffer, algorithm = 'md5') {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

/**
 * Get temporary file path
 * @param {string} extension - File extension
 * @returns {string} - Temporary file path
 */
function getTempPath(extension = '.tmp') {
  const tempDir = require('os').tmpdir();
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
  return path.join(tempDir, filename);
}

/**
 * Clean up old files in directory
 * @param {string} dirPath - Directory path
 * @param {number} maxAge - Max age in milliseconds
 */
async function cleanupOldFiles(dirPath, maxAge) {
  const now = Date.now();
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);
    if (now - stats.mtimeMs > maxAge) {
      await fs.unlink(filePath);
    }
  }
}
module.exports = {
  generateUniqueFilename,
  sanitizeFilename,
  getFileSize,
  formatFileSize,
  getMimeType,
  fileExists,
  ensureDirectory,
  deleteFile,
  moveFile,
  copyFile,
  getFileExtension,
  getFilenameWithoutExtension,
  validateFileType,
  calculateHash,
  getTempPath,
  cleanupOldFiles
};