// backend/src/services/ai/objectDetection.js
const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/app');

/**
 * Detect objects in an image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} - Object detection results
 */
async function detectObjects(imageBuffer, options = {}) {
  const {
    minConfidence = 0.5,
    maxResults = 100,
    returnMasks = false
  } = options;
  try {
    // Use Google Cloud Vision
    if (config.google.applicationCredentials) {
      return await detectWithGoogle(imageBuffer, {
        minConfidence,
        maxResults
      });
    }

    // Use AWS Rekognition
    if (config.aws.accessKeyId) {
      return await detectWithAWS(imageBuffer, {
        minConfidence,
        maxResults
      });
    }

    // Use Hugging Face
    if (config.huggingface.apiKey) {
      return await detectWithHuggingFace(imageBuffer, {
        minConfidence,
        maxResults
      });
    }
    throw new Error('No object detection service configured');
  } catch (error) {
    throw new Error(`Object detection failed: ${error.message}`);
  }
}

/**
 * Detect objects using Google Cloud Vision
 */
async function detectWithGoogle(imageBuffer, options) {
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient({
    keyFilename: config.google.applicationCredentials
  });

  // Object localization
  const [objectResult] = await client.objectLocalization(imageBuffer);
  const localizedObjects = objectResult.localizedObjectAnnotations || [];

  // Label detection for additional context
  const [labelResult] = await client.labelDetection(imageBuffer);
  const labels = labelResult.labelAnnotations || [];
  const objects = localizedObjects.filter(obj => obj.score >= options.minConfidence).slice(0, options.maxResults).map((obj, index) => ({
    id: index,
    name: obj.name,
    confidence: obj.score,
    boundingBox: {
      vertices: obj.boundingPoly?.normalizedVertices?.map(v => ({
        x: v.x,
        y: v.y
      })) || []
    }
  }));
  return {
    objects,
    count: objects.length,
    labels: labels.map(l => ({
      name: l.description,
      confidence: l.score
    })),
    imageProperties: objectResult.fullImageAnnotationContext
  };
}

/**
 * Detect objects using AWS Rekognition
 */
async function detectWithAWS(imageBuffer, options) {
  const {
    RekognitionClient,
    DetectLabelsCommand
  } = require('@aws-sdk/client-rekognition');
  const client = new RekognitionClient({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    region: config.aws.region || 'us-east-1'
  });
  const command = new DetectLabelsCommand({
    Image: {
      Bytes: imageBuffer
    },
    MaxLabels: options.maxResults,
    MinConfidence: options.minConfidence * 100
  });
  const response = await client.send(command);
  const objects = response.Labels?.map((label, index) => ({
    id: index,
    name: label.Name,
    confidence: label.Confidence,
    instances: label.Instances?.map(inst => ({
      boundingBox: inst.BoundingBox,
      confidence: inst.Confidence
    })),
    parents: label.Parents?.map(p => p.Name),
    categories: label.Categories?.map(c => c.Name)
  })) || [];
  return {
    objects,
    count: objects.length,
    labelModelVersion: response.LabelModelVersion
  };
}

/**
 * Detect objects using Hugging Face (DETR model)
 */
async function detectWithHuggingFace(imageBuffer, options) {
  const response = await axios.post('https://api-inference.huggingface.co/models/facebook/detr-resnet-50', imageBuffer, {
    headers: {
      'Authorization': `Bearer ${config.huggingface.apiKey}`,
      'Content-Type': 'application/octet-stream'
    }
  });
  const detections = response.data.filter(det => det.score >= options.minConfidence).slice(0, options.maxResults).map((det, index) => ({
    id: index,
    name: det.label,
    confidence: det.score,
    boundingBox: {
      xmin: det.bbox.xmin,
      ymin: det.bbox.ymin,
      width: det.bbox.width,
      height: det.bbox.height
    }
  }));
  return {
    objects: detections,
    count: detections.length,
    model: 'facebook/detr-resnet-50'
  };
}

/**
 * Segment image into objects (instance segmentation)
 */
async function segmentObjects(imageBuffer, options = {}) {
  try {
    // Use Hugging Face for segmentation
    if (config.huggingface.apiKey) {
      const response = await axios.post('https://api-inference.huggingface.co/models/facebook/detr-resnet-50-panoptic', imageBuffer, {
        headers: {
          'Authorization': `Bearer ${config.huggingface.apiKey}`,
          'Content-Type': 'application/octet-stream'
        }
      });
      return {
        segments: response.data.segments || [],
        segmentationMap: response.data.segmentation
      };
    }
    throw new Error('Segmentation not configured');
  } catch (error) {
    throw new Error(`Object segmentation failed: ${error.message}`);
  }
}

/**
 * Track objects in video frames
 */
async function trackObjects(frames, options = {}) {
  const trackedObjects = [];
  const objectTracks = new Map();
  let nextObjectId = 0;
  for (const frame of frames) {
    const detection = await detectObjects(frame, options);

    // Match detections to existing tracks
    for (const obj of detection.objects) {
      let matched = false;
      for (const [trackId, track] of objectTracks) {
        if (track.name === obj.name && boundingBoxOverlap(track.lastBox, obj.boundingBox) > 0.3) {
          track.frames.push(obj);
          track.lastBox = obj.boundingBox;
          track.lastFrame = track.frames.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        const trackId = nextObjectId++;
        objectTracks.set(trackId, {
          id: trackId,
          name: obj.name,
          frames: [obj],
          lastBox: obj.boundingBox,
          lastFrame: 0
        });
      }
    }
  }
  return Array.from(objectTracks.values());
}

/**
 * Calculate bounding box overlap (IoU)
 */
function boundingBoxOverlap(box1, box2) {
  if (!box1 || !box2) return 0;
  const x1 = Math.max(box1.xmin || 0, box2.xmin || 0);
  const y1 = Math.max(box1.ymin || 0, box2.ymin || 0);
  const x2 = Math.min((box1.xmin || 0) + (box1.width || 0), (box2.xmin || 0) + (box2.width || 0));
  const y2 = Math.min((box1.ymin || 0) + (box1.height || 0), (box2.ymin || 0) + (box2.height || 0));
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = (box1.width || 0) * (box1.height || 0);
  const area2 = (box2.width || 0) * (box2.height || 0);
  const union = area1 + area2 - intersection;
  return union > 0 ? intersection / union : 0;
}
module.exports = {
  detectObjects,
  segmentObjects,
  trackObjects,
  detectWithGoogle,
  detectWithAWS,
  detectWithHuggingFace
};