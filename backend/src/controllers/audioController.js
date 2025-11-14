import { audioQueue } from '../app.js';
import Audio from '../models/Audio.js';
import { uploadToS3 } from '../services/storage/s3Storage.js';
import { speechToText } from '../services/ai/googleVisionService.js';
import { textToSpeech } from '../services/ai/googleVisionService.js';
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp');

export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { projectId, name, description } = req.body;

    // Upload to S3
    const audioUrl = await uploadToS3(req.file.buffer, {
      folder: `projects/${projectId}/audio`,
      filename: `${Date.now()}-${req.file.originalname}`,
      contentType: req.file.mimetype,
    });

    // Save to database
    const audio = new Audio({
      user: req.user._id,
      project: projectId,
      name: name || req.file.originalname,
      description,
      url: audioUrl,
      format: path.extname(req.file.originalname).slice(1),
      size: req.file.size,
    });

    await audio.save();

    res.status(201).json({
      success: true,
      audio,
    });
  } catch (error) {
    logger.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
};

export const trimAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { startTime, endTime } = req.body;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const job = await audioQueue.add('trim', {
      audioId,
      audioUrl: audio.url,
      startTime,
      endTime,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Audio trimming started',
    });
  } catch (error) {
    logger.error('Audio trim error:', error);
    res.status(500).json({ error: 'Failed to trim audio' });
  }
};

export const mergeAudio = async (req, res) => {
  try {
    const { audioIds } = req.body;

    const audioFiles = await Audio.find({ _id: { $in: audioIds } });

    if (audioFiles.length !== audioIds.length) {
      return res.status(404).json({ error: 'One or more audio files not found' });
    }

    const job = await audioQueue.add('merge', {
      audioFiles: audioFiles.map((a) => ({ id: a._id, url: a.url })),
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Audio merging started',
    });
  } catch (error) {
    logger.error('Audio merge error:', error);
    res.status(500).json({ error: 'Failed to merge audio' });
  }
};

export const applyAudioEffect = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { effect, options } = req.body;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const job = await audioQueue.add('effect', {
      audioId,
      audioUrl: audio.url,
      effect,
      options,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Effect application started',
    });
  } catch (error) {
    logger.error('Audio effect error:', error);
    res.status(500).json({ error: 'Failed to apply effect' });
  }
};

export const changeVolume = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { volume } = req.body;

    if (volume < 0 || volume > 2) {
      return res.status(400).json({ error: 'Volume must be between 0 and 2' });
    }

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const job = await audioQueue.add('volume', {
      audioId,
      audioUrl: audio.url,
      volume,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Volume change started',
    });
  } catch (error) {
    logger.error('Volume change error:', error);
    res.status(500).json({ error: 'Failed to change volume' });
  }
};

export const noiseReduction = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { threshold = 0.01 } = req.body;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const job = await audioQueue.add('noise-reduction', {
      audioId,
      audioUrl: audio.url,
      threshold,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Noise reduction started',
    });
  } catch (error) {
    logger.error('Noise reduction error:', error);
    res.status(500).json({ error: 'Failed to reduce noise' });
  }
};

export const convertFormat = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { format, bitrate = '192k' } = req.body;

    const allowedFormats = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const job = await audioQueue.add('convert', {
      audioId,
      audioUrl: audio.url,
      format,
      bitrate,
      userId: req.user._id,
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Format conversion started',
    });
  } catch (error) {
    logger.error('Format conversion error:', error);
    res.status(500).json({ error: 'Failed to convert format' });
  }
};

export const transcribeAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { language = 'en-US' } = req.body;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const transcription = await speechToText(audio.url, language);

    res.json({
      success: true,
      transcription,
    });
  } catch (error) {
    logger.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
};

export const generateSpeech = async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-C', speed = 1.0 } = req.body;

    const audioBuffer = await textToSpeech(text, { voice, speed });

    const audioUrl = await uploadToS3(audioBuffer, {
      folder: `generated/speech`,
      filename: `${Date.now()}-speech.mp3`,
      contentType: 'audio/mpeg',
    });

    const audio = new Audio({
      user: req.user._id,
      name: 'Generated Speech',
      url: audioUrl,
      format: 'mp3',
      size: audioBuffer.length,
      isGenerated: true,
    });

    await audio.save();

    res.json({
      success: true,
      audio,
    });
  } catch (error) {
    logger.error('Speech generation error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
};