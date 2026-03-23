// backend/src/controllers/assetController.js
const Asset = require('../models/Asset');
const {
  uploadToStorage,
  deleteFromStorage
} = require('../services/storage/s3Storage');
const {
  AppError
} = require('../middleware/errorHandler');
const multer = require('multer');

// Upload middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Upload asset
exports.uploadAsset = [upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }
    const {
      folder = 'root',
      projectId
    } = req.body;

    // Upload to storage
    const key = `assets/${req.user._id}/${folder}/${Date.now()}-${req.file.originalname}`;
    const url = await uploadToStorage(req.file.buffer, key, req.file.mimetype);

    // Create asset record
    const asset = await Asset.create({
      user: req.user._id,
      project: projectId,
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype.split('/')[0],
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
      storageProvider: 's3',
      storageKey: key,
      folder
    });

    // Update user storage usage
    await req.user.useCredits('storage', req.file.size);
    await req.user.save();
    res.status(201).json({
      success: true,
      data: {
        asset
      }
    });
  } catch (error) {
    next(error);
  }
}];

// Get all assets
exports.getAssets = async (req, res, next) => {
  try {
    const {
      type,
      folder,
      search,
      page = 1,
      limit = 50
    } = req.query;
    const query = {
      user: req.user._id
    };
    if (type) query.type = type;
    if (folder) query.folder = folder;
    if (search) {
      query.name = {
        $regex: search,
        $options: 'i'
      };
    }
    const assets = await Asset.find(query).sort({
      createdAt: -1
    }).limit(limit * 1).skip((page - 1) * limit);
    const count = await Asset.countDocuments(query);
    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get asset by ID
exports.getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }
    res.json({
      success: true,
      data: {
        asset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update asset
exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }
    const allowedFields = ['name', 'tags', 'folder', 'isPublic'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const updatedAsset = await Asset.findByIdAndUpdate(asset._id, updates, {
      new: true,
      runValidators: true
    });
    res.json({
      success: true,
      data: {
        asset: updatedAsset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete asset
exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    // Delete from storage
    await deleteFromStorage(asset.storageKey);

    // Delete record
    await asset.deleteOne();

    // Update user storage usage
    req.user.usage.storageUsed = Math.max(0, req.user.usage.storageUsed - asset.size);
    await req.user.save();
    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get asset folders
exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Asset.aggregate([{
      $match: {
        user: req.user._id
      }
    }, {
      $group: {
        _id: '$folder',
        count: {
          $sum: 1
        }
      }
    }]);
    res.json({
      success: true,
      data: {
        folders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get recent assets
exports.getRecent = async (req, res, next) => {
  try {
    const {
      limit = 20
    } = req.query;
    const assets = await Asset.find({
      user: req.user._id
    }).sort({
      createdAt: -1
    }).limit(parseInt(limit));
    res.json({
      success: true,
      data: {
        assets
      }
    });
  } catch (error) {
    next(error);
  }
};