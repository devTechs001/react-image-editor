// backend/src/controllers/aiController.js
const aiService = require('../services/ai');
const AILog = require('../models/AILog');
const {
  AppError
} = require('../middleware/errorHandler');
const {
  uploadToStorage
} = require('../services/storage/s3Storage');

// Remove Background
exports.removeBackground = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const startTime = Date.now();

    // Process image
    const result = await aiService.backgroundRemoval.remove(req.file.buffer);

    // Upload result
    const outputUrl = await uploadToStorage(result.buffer, `ai/bg-removed/${Date.now()}.png`, 'image/png');

    // Use credits
    req.user.useCredits('ai', 1);
    await req.user.save({
      validateBeforeSave: false
    });

    // Log AI usage
    await AILog.create({
      user: req.user._id,
      operation: 'background_removal',
      model: 'rembg',
      provider: 'replicate',
      status: 'completed',
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 1
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    // Log failure
    await AILog.create({
      user: req.user._id,
      operation: 'background_removal',
      model: 'rembg',
      provider: 'replicate',
      status: 'failed',
      error: {
        message: error.message
      }
    });
    next(error);
  }
};

// Enhance Image
exports.enhanceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const {
      enhanceType = 'general'
    } = req.body;
    const startTime = Date.now();
    const result = await aiService.imageEnhancement.enhance(req.file.buffer, enhanceType);
    const outputUrl = await uploadToStorage(result.buffer, `ai/enhanced/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 1);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'image_enhancement',
      model: 'gfpgan',
      provider: 'replicate',
      status: 'completed',
      settings: {
        enhanceType
      },
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 1
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upscale Image
exports.upscaleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const {
      scale = 2
    } = req.body;
    const startTime = Date.now();
    const result = await aiService.imageUpscaling.upscale(req.file.buffer, parseInt(scale));
    const outputUrl = await uploadToStorage(result.buffer, `ai/upscaled/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 2);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'upscaling',
      model: 'real-esrgan',
      provider: 'replicate',
      status: 'completed',
      settings: {
        scale
      },
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 2
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        scale,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Style Transfer
exports.styleTransfer = async (req, res, next) => {
  try {
    const {
      content,
      style
    } = req.files;
    if (!content || !style) {
      return next(new AppError('Both content and style images are required', 400));
    }
    const startTime = Date.now();
    const result = await aiService.styleTransfer.transfer(content[0].buffer, style[0].buffer);
    const outputUrl = await uploadToStorage(result.buffer, `ai/style-transfer/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 2);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'style_transfer',
      model: 'neural_style_transfer',
      provider: 'replicate',
      status: 'completed',
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 2
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Colorize Image
exports.colorizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const startTime = Date.now();
    const result = await aiService.colorization.colorize(req.file.buffer);
    const outputUrl = await uploadToStorage(result.buffer, `ai/colorized/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 1);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'colorization',
      model: 'deoldify',
      provider: 'replicate',
      status: 'completed',
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 1
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove Object
exports.removeObject = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const {
      mask
    } = req.body; // Base64 mask
    const startTime = Date.now();
    const result = await aiService.inpainting.removeObject(req.file.buffer, Buffer.from(mask, 'base64'));
    const outputUrl = await uploadToStorage(result.buffer, `ai/object-removed/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 2);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'object_removal',
      model: 'lama',
      provider: 'replicate',
      status: 'completed',
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 2
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enhance Face
exports.enhanceFace = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const startTime = Date.now();
    const result = await aiService.faceEnhancement.enhance(req.file.buffer);
    const outputUrl = await uploadToStorage(result.buffer, `ai/face-enhanced/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 1);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'face_enhancement',
      model: 'gfpgan',
      provider: 'replicate',
      status: 'completed',
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 1
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate Image
exports.generateImage = async (req, res, next) => {
  try {
    const {
      prompt,
      negativePrompt,
      width = 1024,
      height = 1024,
      steps = 30,
      guidance = 7.5,
      seed
    } = req.body;
    const startTime = Date.now();
    const result = await aiService.imageGeneration.generate({
      prompt,
      negativePrompt,
      width,
      height,
      steps,
      guidance,
      seed
    });
    const outputUrl = await uploadToStorage(result.buffer, `ai/generated/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 3);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'image_generation',
      model: 'sdxl',
      provider: 'stability',
      status: 'completed',
      input: {
        prompt,
        negativePrompt
      },
      settings: {
        width,
        height,
        steps,
        guidance,
        seed
      },
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 3
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        seed: result.seed,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Inpaint
exports.inpaint = async (req, res, next) => {
  try {
    const {
      image,
      mask
    } = req.files;
    const {
      prompt
    } = req.body;
    if (!image || !mask) {
      return next(new AppError('Both image and mask are required', 400));
    }
    const startTime = Date.now();
    const result = await aiService.inpainting.inpaint(image[0].buffer, mask[0].buffer, prompt);
    const outputUrl = await uploadToStorage(result.buffer, `ai/inpainted/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 2);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'inpainting',
      model: 'sdxl-inpaint',
      provider: 'stability',
      status: 'completed',
      input: {
        prompt
      },
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 2
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Smart Crop
exports.smartCrop = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Image file is required', 400));
    }
    const {
      aspectRatio,
      focusOn
    } = req.body;
    const startTime = Date.now();
    const result = await aiService.smartCrop.crop(req.file.buffer, {
      aspectRatio,
      focusOn
    });
    const outputUrl = await uploadToStorage(result.buffer, `ai/smart-cropped/${Date.now()}.png`, 'image/png');
    req.user.useCredits('ai', 1);
    await req.user.save({
      validateBeforeSave: false
    });
    await AILog.create({
      user: req.user._id,
      operation: 'smart_crop',
      model: 'object-detection',
      provider: 'local',
      status: 'completed',
      settings: {
        aspectRatio,
        focusOn
      },
      metrics: {
        processingTime: Date.now() - startTime
      },
      creditsUsed: 1
    });
    res.json({
      success: true,
      data: {
        url: outputUrl,
        cropInfo: result.cropInfo,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Usage Stats
exports.getUsageStats = async (req, res, next) => {
  try {
    const {
      period = 'month'
    } = req.query;
    let startDate;
    const endDate = new Date();
    switch (period) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    const stats = await AILog.getUserStats(req.user._id, startDate, endDate);
    const totalCredits = stats.reduce((sum, s) => sum + s.totalCredits, 0);
    const totalOperations = stats.reduce((sum, s) => sum + s.count, 0);
    res.json({
      success: true,
      data: {
        period,
        stats,
        summary: {
          totalOperations,
          totalCredits,
          remainingCredits: req.user.credits.ai - req.user.usage.aiCreditsUsed
        }
      }
    });
  } catch (error) {
    next(error);
  }
};