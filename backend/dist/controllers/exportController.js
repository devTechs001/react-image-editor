// backend/src/controllers/exportController.js
const Export = require('../models/Export');
const Project = require('../models/Project');
const {
  exportImage
} = require('../services/export/imageExport');
const {
  exportVideo
} = require('../services/export/videoExport');
const {
  exportGif
} = require('../services/export/gifExport');
const {
  exportPdf
} = require('../services/export/pdfExport');
const {
  uploadToStorage
} = require('../services/storage/s3Storage');
const {
  AppError
} = require('../middleware/errorHandler');

// Create export
exports.createExport = async (req, res, next) => {
  try {
    const {
      projectId,
      format,
      options = {}
    } = req.body;

    // Get project
    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id
    });
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check credits
    if (!req.user.hasCredits('exports', 1)) {
      return next(new AppError('Not enough export credits', 403));
    }

    // Create export record
    const exportRecord = await Export.create({
      user: req.user._id,
      project: projectId,
      format,
      options,
      status: 'processing'
    });

    // Process export based on format
    let result;
    switch (format.toLowerCase()) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'tiff':
        result = await exportImage(project, {
          format,
          ...options
        });
        break;
      case 'gif':
        result = await exportGif(project, options);
        break;
      case 'mp4':
      case 'webm':
        result = await exportVideo(project, {
          format,
          ...options
        });
        break;
      case 'pdf':
        result = await exportPdf(project, options);
        break;
      default:
        throw new AppError('Unsupported export format', 400);
    }

    // Upload to storage
    const key = `exports/${req.user._id}/${Date.now()}-${projectId}.${format}`;
    const url = await uploadToStorage(result.buffer, key, result.mimeType);

    // Update export record
    exportRecord.status = 'completed';
    exportRecord.url = url;
    exportRecord.fileSize = result.size;
    exportRecord.dimensions = result.dimensions;
    await exportRecord.save();

    // Update user credits
    req.user.useCredits('exports', 1);
    await req.user.save();
    res.json({
      success: true,
      data: {
        export: exportRecord,
        downloadUrl: url
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    // Update export status on error
    if (exportRecord) {
      exportRecord.status = 'failed';
      exportRecord.error = error.message;
      await exportRecord.save();
    }
    next(error);
  }
};

// Get export by ID
exports.getExport = async (req, res, next) => {
  try {
    const exportRecord = await Export.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!exportRecord) {
      return next(new AppError('Export not found', 404));
    }
    res.json({
      success: true,
      data: {
        export: exportRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all exports
exports.getExports = async (req, res, next) => {
  try {
    const {
      format,
      status,
      page = 1,
      limit = 20
    } = req.query;
    const query = {
      user: req.user._id
    };
    if (format) query.format = format;
    if (status) query.status = status;
    const exports = await Export.find(query).populate('project', 'name thumbnail').sort({
      createdAt: -1
    }).limit(limit * 1).skip((page - 1) * limit);
    const count = await Export.countDocuments(query);
    res.json({
      success: true,
      data: {
        exports,
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

// Delete export
exports.deleteExport = async (req, res, next) => {
  try {
    const exportRecord = await Export.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!exportRecord) {
      return next(new AppError('Export not found', 404));
    }
    await exportRecord.deleteOne();
    res.json({
      success: true,
      message: 'Export deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get export presets
exports.getPresets = async (req, res, next) => {
  try {
    const presets = [{
      id: 'web',
      name: 'Web Optimized',
      format: 'webp',
      quality: 80,
      scale: 1
    }, {
      id: 'print',
      name: 'Print Quality',
      format: 'png',
      quality: 100,
      scale: 1,
      dpi: 300
    }, {
      id: 'social',
      name: 'Social Media',
      format: 'jpg',
      quality: 90,
      scale: 1,
      maxWidth: 1080
    }, {
      id: 'thumbnail',
      name: 'Thumbnail',
      format: 'jpg',
      quality: 70,
      width: 300,
      height: 300
    }];
    res.json({
      success: true,
      data: {
        presets
      }
    });
  } catch (error) {
    next(error);
  }
};