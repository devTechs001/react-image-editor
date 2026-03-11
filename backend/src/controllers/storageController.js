// backend/src/controllers/storageController.js
const Asset = require('../models/Asset');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const {
  uploadToStorage,
  deleteFromStorage,
  getSignedDownloadUrl,
  generateUniqueKey
} = require('../services/storage/s3Storage');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, buckets } = require('../config/storage');

// Get storage usage
exports.getUsage = async (req, res, next) => {
  try {
    const assets = await Asset.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const totalUsed = assets.reduce((sum, a) => sum + a.totalSize, 0);
    const totalAllowed = req.user.credits.storage;

    res.json({
      success: true,
      data: {
        used: totalUsed,
        total: totalAllowed,
        percentage: Math.round((totalUsed / totalAllowed) * 100),
        byType: assets.reduce((acc, a) => {
          acc[a._id] = { count: a.count, size: a.totalSize };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get presigned upload URL
exports.getPresignedUploadUrl = async (req, res, next) => {
  try {
    const { filename, contentType, size } = req.body;

    // Check storage quota
    const currentUsage = req.user.usage.storageUsed;
    const allowedStorage = req.user.credits.storage;

    if (currentUsage + size > allowedStorage) {
      return next(new AppError('Storage quota exceeded', 403));
    }

    const key = generateUniqueKey(filename, `uploads/${req.user._id}/`);

    const command = new PutObjectCommand({
      Bucket: buckets.uploads,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({
      success: true,
      data: {
        uploadUrl,
        key,
        expiresIn: 3600
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get presigned download URL
exports.getPresignedDownloadUrl = async (req, res, next) => {
  try {
    const { key, expiresIn = 3600 } = req.body;

    const url = await getSignedDownloadUrl(key, buckets.uploads, expiresIn);

    res.json({
      success: true,
      data: { url, expiresIn }
    });
  } catch (error) {
    next(error);
  }
};

// Delete files
exports.deleteFiles = async (req, res, next) => {
  try {
    const { keys } = req.body;

    // Verify ownership
    const assets = await Asset.find({
      user: req.user._id,
      storageKey: { $in: keys }
    });

    if (assets.length !== keys.length) {
      return next(new AppError('Some files not found or not owned by user', 404));
    }

    // Delete from storage
    await Promise.all(keys.map(key => deleteFromStorage(key)));

    // Delete from database
    await Asset.deleteMany({
      user: req.user._id,
      storageKey: { $in: keys }
    });

    // Update storage usage
    const deletedSize = assets.reduce((sum, a) => sum + a.size, 0);
    req.user.usage.storageUsed = Math.max(0, req.user.usage.storageUsed - deletedSize);
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `${keys.length} file(s) deleted`
    });
  } catch (error) {
    next(error);
  }
};

// Move files
exports.moveFiles = async (req, res, next) => {
  try {
    const { assetIds, targetFolder } = req.body;

    await Asset.updateMany(
      { _id: { $in: assetIds }, user: req.user._id },
      { folder: targetFolder }
    );

    res.json({
      success: true,
      message: `${assetIds.length} file(s) moved`
    });
  } catch (error) {
    next(error);
  }
};

// Copy files
exports.copyFiles = async (req, res, next) => {
  try {
    const { assetIds, targetFolder } = req.body;

    const assets = await Asset.find({
      _id: { $in: assetIds },
      user: req.user._id
    });

    const copies = await Promise.all(assets.map(async (asset) => {
      const newKey = generateUniqueKey(asset.originalName, `uploads/${req.user._id}/`);
      
      // Copy in S3
      await s3Client.send(new CopyObjectCommand({
        Bucket: buckets.uploads,
        CopySource: `${buckets.uploads}/${asset.storageKey}`,
        Key: newKey
      }));

      // Create new asset record
      return Asset.create({
        ...asset.toObject(),
        _id: undefined,
        storageKey: newKey,
        folder: targetFolder || asset.folder,
        name: `${asset.name} (Copy)`,
        createdAt: undefined,
        updatedAt: undefined
      });
    }));

    // Update storage usage
    const copiedSize = copies.reduce((sum, a) => sum + a.size, 0);
    req.user.usage.storageUsed += copiedSize;
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: { copies }
    });
  } catch (error) {
    next(error);
  }
};