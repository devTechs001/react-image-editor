import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { videoQueue } from '../app.js';
import Video from '../models/Video.js';
import { uploadToS3 } from '../services/storage/s3Storage.js';
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
await fs.mkdir(TEMP_DIR, { recursive: true });

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { projectId, name, description } = req.body;
    const tempPath = path.join(TEMP_DIR, `${uuidv4()}.mp4`);

    await fs.writeFile(tempPath, req.file.buffer);

    // Get video metadata
    const metadata = await getVideoMetadata(tempPath);

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(tempPath);
    const thumbnailBuffer = await fs.readFile(thumbnailPath);

    // Upload to S3
    const [videoUrl, thumbnailUrl] = await Promise.all([
      uploadToS3(req.file.buffer, {
        folder: `projects/${projectId}/videos`,
        filename: `${Date.now()}-${req.file.originalname}`,
        contentType: 'video/mp4',
      }),
      uploadToS3(thumbnailBuffer, {
        folder: `projects/${projectId}/thumbnails`,
        filename: `${Date.now()}-thumbnail.jpg`,
      }),
    ]);

    // Save to database
    const video = new Video({
      user: req.user._id,
      project: projectId,
      name: name || req.file.originalname,
      description,
      url: videoUrl,
      thumbnail: thumbnailUrl,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      codec: metadata.codec,
      size: req.file.size,
    });

    await video.save();

    // Cleanup
    await Promise.all([fs.unlink(tempPath), fs.unlink(thumbnailPath)]);

    res.status(201).json({
      success: true,
      video,
    });
  } catch (error) {
    logger.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

export const trimVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { startTime, endTime } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('trim', {
      videoId,
      videoUrl: video.url,
      startTime,
      endTime,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Video trimming started',
    });
  } catch (error) {
    logger.error('Video trim error:', error);
    res.status(500).json({ error: 'Failed to trim video' });
  }
};

export const mergeVideos = async (req, res) => {
  try {
    const { videoIds } = req.body;

    const videos = await Video.find({ _id: { $in: videoIds } });

    if (videos.length !== videoIds.length) {
      return res.status(404).json({ error: 'One or more videos not found' });
    }

    const job = await videoQueue.add('merge', {
      videos: videos.map((v) => ({ id: v._id, url: v.url })),
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Video merging started',
    });
  } catch (error) {
    logger.error('Video merge error:', error);
    res.status(500).json({ error: 'Failed to merge videos' });
  }
};

export const applyVideoFilter = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { filter, options } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('filter', {
      videoId,
      videoUrl: video.url,
      filter,
      options,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Filter application started',
    });
  } catch (error) {
    logger.error('Video filter error:', error);
    res.status(500).json({ error: 'Failed to apply filter' });
  }
};

export const changeVideoSpeed = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { speed } = req.body;

    if (speed <= 0 || speed > 10) {
      return res.status(400).json({ error: 'Speed must be between 0 and 10' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('speed', {
      videoId,
      videoUrl: video.url,
      speed,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Speed change started',
    });
  } catch (error) {
    logger.error('Video speed change error:', error);
    res.status(500).json({ error: 'Failed to change video speed' });
  }
};

export const extractAudio = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { format = 'mp3' } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('extract-audio', {
      videoId,
      videoUrl: video.url,
      format,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Audio extraction started',
    });
  } catch (error) {
    logger.error('Audio extraction error:', error);
    res.status(500).json({ error: 'Failed to extract audio' });
  }
};

export const addWatermark = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { watermarkUrl, position, opacity, scale } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('watermark', {
      videoId,
      videoUrl: video.url,
      watermarkUrl,
      position,
      opacity,
      scale,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Watermark addition started',
    });
  } catch (error) {
    logger.error('Watermark error:', error);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
};

export const compressVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { quality = 'medium', resolution } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('compress', {
      videoId,
      videoUrl: video.url,
      quality,
      resolution,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Video compression started',
    });
  } catch (error) {
    logger.error('Video compression error:', error);
    res.status(500).json({ error: 'Failed to compress video' });
  }
};

export const createGIF = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { startTime = 0, duration = 5, width = 480, fps = 10 } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('gif', {
      videoId,
      videoUrl: video.url,
      startTime,
      duration,
      width,
      fps,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'GIF creation started',
    });
  } catch (error) {
    logger.error('GIF creation error:', error);
    res.status(500).json({ error: 'Failed to create GIF' });
  }
};

export const stabilizeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { shakiness = 5, smoothing = 10 } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const job = await videoQueue.add('stabilize', {
      videoId,
      videoUrl: video.url,
      shakiness,
      smoothing,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Video stabilization started',
    });
  } catch (error) {
    logger.error('Video stabilization error:', error);
    res.status(500).json({ error: 'Failed to stabilize video' });
  }
};

// Helper functions
async function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');

      resolve({
        duration: metadata.format.duration,
        width: videoStream.width,
        height: videoStream.height,
        fps: eval(videoStream.r_frame_rate),
        codec: videoStream.codec_name,
        bitrate: metadata.format.bit_rate,
      });
    });
  });
}

async function generateThumbnail(videoPath) {
  const thumbnailPath = path.join(TEMP_DIR, `${uuidv4()}-thumb.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: path.basename(thumbnailPath),
        folder: TEMP_DIR,
        size: '320x240',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', reject);
  });
}