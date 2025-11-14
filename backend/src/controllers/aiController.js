import { aiQueue } from '../app.js';
import AILog from '../models/AILog.js';
import { generateImage } from '../services/ai/openAIService.js';
import { removeBackground as removeBg } from '../services/ai/backgroundRemoval.js';
import { upscaleImage } from '../services/ai/imageUpscaling.js';
import { detectObjects } from '../services/ai/objectDetection.js';
import { detectFaces } from '../services/ai/faceDetection.js';
import { transferStyle } from '../services/ai/styleTransfer.js';
import { logger } from '../utils/logger.js';

export const textToImage = async (req, res) => {
  try {
    const { prompt, negativePrompt, size = '1024x1024', quality = 'standard' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageUrl = await generateImage({
      prompt,
      negativePrompt,
      size,
      quality,
    });

    // Log AI usage
    await AILog.create({
      user: req.user._id,
      type: 'text-to-image',
      provider: 'openai',
      prompt,
      result: imageUrl,
      tokensUsed: prompt.length,
    });

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    logger.error('Text to image error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
};

export const removeBackground = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const job = await aiQueue.add('remove-background', {
      imageUrl,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Background removal started',
    });
  } catch (error) {
    logger.error('Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
};

export const upscale = async (req, res) => {
  try {
    const { imageUrl, scale = 4, faceEnhance = false } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const job = await aiQueue.add('upscale', {
      imageUrl,
      scale,
      faceEnhance,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Image upscaling started',
    });
  } catch (error) {
    logger.error('Upscaling error:', error);
    res.status(500).json({ error: 'Failed to upscale image' });
  }
};

export const detectObjectsInImage = async (req, res) => {
  try {
    const { imageUrl, threshold = 0.5 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const objects = await detectObjects(imageUrl, threshold);

    await AILog.create({
      user: req.user._id,
      type: 'object-detection',
      provider: 'google-vision',
      input: imageUrl,
      result: objects,
    });

    res.json({
      success: true,
      objects,
    });
  } catch (error) {
    logger.error('Object detection error:', error);
    res.status(500).json({ error: 'Failed to detect objects' });
  }
};

export const detectFacesInImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const faces = await detectFaces(imageUrl);

    await AILog.create({
      user: req.user._id,
      type: 'face-detection',
      provider: 'google-vision',
      input: imageUrl,
      result: faces,
    });

    res.json({
      success: true,
      faces,
    });
  } catch (error) {
    logger.error('Face detection error:', error);
    res.status(500).json({ error: 'Failed to detect faces' });
  }
};

export const applyStyleTransfer = async (req, res) => {
  try {
    const { imageUrl, styleUrl, strength = 0.7 } = req.body;

    if (!imageUrl || !styleUrl) {
      return res.status(400).json({ error: 'Image URL and style URL are required' });
    }

    const job = await aiQueue.add('style-transfer', {
      imageUrl,
      styleUrl,
      strength,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Style transfer started',
    });
  } catch (error) {
    logger.error('Style transfer error:', error);
    res.status(500).json({ error: 'Failed to apply style transfer' });
  }
};

export const enhanceImage = async (req, res) => {
  try {
    const { imageUrl, auto = true, options = {} } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const job = await aiQueue.add('enhance', {
      imageUrl,
      auto,
      options,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Image enhancement started',
    });
  } catch (error) {
    logger.error('Image enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
};

export const colorizeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const job = await aiQueue.add('colorize', {
      imageUrl,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Image colorization started',
    });
  } catch (error) {
    logger.error('Colorization error:', error);
    res.status(500).json({ error: 'Failed to colorize image' });
  }
};

export const getAIUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AILog.find(query).sort({ createdAt: -1 }).limit(100);

    const stats = await AILog.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' },
        },
      },
    ]);

    res.json({
      success: true,
      logs,
      stats,
    });
  } catch (error) {
    logger.error('AI usage error:', error);
    res.status(500).json({ error: 'Failed to get AI usage' });
  }
};