import sharp from 'sharp';
import { imageQueue } from '../app.js';
import Image from '../models/Image.js';
import { uploadToS3 } from '../services/storage/s3Storage.js';
import { applyAIEnhancement } from '../services/ai/imageEnhancement.js';
import { removeBackground } from '../services/ai/backgroundRemoval.js';
import { logger } from '../utils/logger.js';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { projectId, name, description } = req.body;

    // Process image
    const processedImage = await sharp(req.file.buffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to S3
    const imageUrl = await uploadToS3(processedImage, {
      folder: `projects/${projectId}/images`,
      filename: `${Date.now()}-${req.file.originalname}`,
    });

    // Get metadata
    const metadata = await sharp(req.file.buffer).metadata();

    // Save to database
    const image = new Image({
      user: req.user._id,
      project: projectId,
      name: name || req.file.originalname,
      description,
      url: imageUrl,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: req.file.size,
    });

    await image.save();

    res.status(201).json({
      success: true,
      image,
    });
  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const processImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { operations } = req.body;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Add to processing queue
    const job = await imageQueue.add('process', {
      imageId,
      operations,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Image processing started',
    });
  } catch (error) {
    logger.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

export const applyFilter = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { filter, options } = req.body;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Download image
    const response = await fetch(image.url);
    const buffer = await response.arrayBuffer();

    let processedImage = sharp(Buffer.from(buffer));

    // Apply filter
    switch (filter) {
      case 'grayscale':
        processedImage = processedImage.grayscale();
        break;
      case 'blur':
        processedImage = processedImage.blur(options.sigma || 5);
        break;
      case 'sharpen':
        processedImage = processedImage.sharpen();
        break;
      case 'rotate':
        processedImage = processedImage.rotate(options.angle || 90);
        break;
      case 'flip':
        processedImage = processedImage.flip();
        break;
      case 'flop':
        processedImage = processedImage.flop();
        break;
      case 'negate':
        processedImage = processedImage.negate();
        break;
      case 'normalize':
        processedImage = processedImage.normalize();
        break;
      case 'modulate':
        processedImage = processedImage.modulate(options);
        break;
      case 'tint':
        processedImage = processedImage.tint(options.color);
        break;
    }

    const outputBuffer = await processedImage.toBuffer();

    // Upload processed image
    const imageUrl = await uploadToS3(outputBuffer, {
      folder: `projects/${image.project}/processed`,
      filename: `${Date.now()}-filtered.jpg`,
    });

    res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    logger.error('Filter application error:', error);
    res.status(500).json({ error: 'Failed to apply filter' });
  }
};

export const resizeImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { width, height, fit = 'cover' } = req.body;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const response = await fetch(image.url);
    const buffer = await response.arrayBuffer();

    const resizedImage = await sharp(Buffer.from(buffer))
      .resize(width, height, { fit })
      .toBuffer();

    const imageUrl = await uploadToS3(resizedImage, {
      folder: `projects/${image.project}/resized`,
      filename: `${Date.now()}-resized.jpg`,
    });

    res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    logger.error('Image resize error:', error);
    res.status(500).json({ error: 'Failed to resize image' });
  }
};

export const cropImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { left, top, width, height } = req.body;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const response = await fetch(image.url);
    const buffer = await response.arrayBuffer();

    const croppedImage = await sharp(Buffer.from(buffer))
      .extract({ left, top, width, height })
      .toBuffer();

    const imageUrl = await uploadToS3(croppedImage, {
      folder: `projects/${image.project}/cropped`,
      filename: `${Date.now()}-cropped.jpg`,
    });

    res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    logger.error('Image crop error:', error);
    res.status(500).json({ error: 'Failed to crop image' });
  }
};

export const enhanceImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Add to AI queue
    const job = await aiQueue.add('enhance', {
      imageId,
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

export const removeImageBackground = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const enhancedUrl = await removeBackground(image.url);

    res.json({
      success: true,
      url: enhancedUrl,
    });
  } catch (error) {
    logger.error('Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
};

export const getImageAnalysis = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const response = await fetch(image.url);
    const buffer = await response.arrayBuffer();

    const stats = await sharp(Buffer.from(buffer)).stats();
    const metadata = await sharp(Buffer.from(buffer)).metadata();

    res.json({
      success: true,
      analysis: {
        metadata,
        stats,
        dominantColor: stats.dominant,
        isTransparent: metadata.hasAlpha,
      },
    });
  } catch (error) {
    logger.error('Image analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
};