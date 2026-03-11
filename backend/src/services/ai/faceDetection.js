// backend/src/services/ai/faceDetection.js
const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/app');

/**
 * Detect faces in an image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} - Face detection results
 */
async function detectFaces(imageBuffer, options = {}) {
  const {
    returnLandmarks = true,
    returnAttributes = true,
    minFaceSize = 20
  } = options;

  try {
    // Use Google Cloud Vision
    if (config.google.applicationCredentials) {
      return await detectWithGoogle(imageBuffer, options);
    }

    // Use AWS Rekognition
    if (config.aws.accessKeyId) {
      return await detectWithAWS(imageBuffer, options);
    }

    // Use Azure Face API
    if (config.azure.faceKey) {
      return await detectWithAzure(imageBuffer, options);
    }

    // Fallback: Return empty result
    return {
      faces: [],
      count: 0,
      imageWidth: 0,
      imageHeight: 0
    };
  } catch (error) {
    throw new Error(`Face detection failed: ${error.message}`);
  }
}

/**
 * Detect faces using Google Cloud Vision
 */
async function detectWithGoogle(imageBuffer, options) {
  const vision = require('@google-cloud/vision');
  
  const client = new vision.ImageAnnotatorClient({
    keyFilename: config.google.applicationCredentials
  });

  const [result] = await client.faceDetection(imageBuffer);
  const faceAnnotations = result.faceAnnotations || [];

  const faces = faceAnnotations.map((face, index) => ({
    id: index,
    boundingBox: {
      vertices: face.boundingPoly?.vertices?.map(v => ({ x: v.x, y: v.y })) || []
    },
    landmarks: options.returnLandmarks ? face.landmarks?.map(l => ({
      type: l.type,
      position: l.position
    })) : [],
    confidence: face.detectionConfidence || 1,
    attributes: {
      joyLikelihood: face.joyLikelihood,
      sorrowLikelihood: face.sorrowLikelihood,
      angerLikelihood: face.angerLikelihood,
      surpriseLikelihood: face.surpriseLikelihood,
      underExposedLikelihood: face.underExposedLikelihood,
      blurredLikelihood: face.blurredLikelihood,
      headwearLikelihood: face.headwearLikelihood
    },
    angles: {
      roll: face.rollAngle,
      pan: face.panAngle,
      tilt: face.tiltAngle
    }
  }));

  return {
    faces,
    count: faces.length,
    imageWidth: result.fullImageAnnotationContext?.imageWidth,
    imageHeight: result.fullImageAnnotationContext?.imageHeight
  };
}

/**
 * Detect faces using AWS Rekognition
 */
async function detectWithAWS(imageBuffer, options) {
  const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition');

  const client = new RekognitionClient({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    region: config.aws.region || 'us-east-1'
  });

  const command = new DetectFacesCommand({
    Image: { Bytes: imageBuffer },
    Attributes: options.returnAttributes ? ['ALL'] : ['DEFAULT']
  });

  const response = await client.send(command);

  const faces = response.FaceDetails?.map((face, index) => ({
    id: index,
    boundingBox: face.BoundingBox,
    confidence: face.Confidence,
    landmarks: face.Landmarks?.map(l => ({
      type: l.Type,
      position: l.X && l.Y ? { x: l.X, y: l.Y } : null
    })),
    attributes: {
      gender: face.Gender,
      ageRange: face.AgeRange,
      emotions: face.Emotions,
      eyesOpen: face.EyesOpen,
      mouthOpen: face.MouthOpen,
      mustache: face.Mustache,
      beard: face.Beard,
      eyeglasses: face.Eyeglasses,
      sunglasses: face.Sunglasses,
      smile: face.Smile
    },
    pose: face.Pose,
    quality: face.Quality
  }));

  return {
    faces,
    count: faces.length
  };
}

/**
 * Detect faces using Azure Face API
 */
async function detectWithAzure(imageBuffer, options) {
  const response = await axios.post(
    `${config.azure.faceEndpoint}/face/v1.0/detect`,
    imageBuffer,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': config.azure.faceKey,
        'Content-Type': 'application/octet-stream'
      },
      params: {
        returnFaceId: 'true',
        returnFaceLandmarks: options.returnLandmarks ? 'true' : 'false',
        returnFaceAttributes: options.returnAttributes 
          ? 'age,gender,emotion,facialHair,glasses,headPose,smile,mask,blur,exposure,noise,occlusion,accessories,hair,makeup,accessories' 
          : 'none'
      }
    }
  );

  const faces = response.data.map((face, index) => ({
    id: index,
    faceId: face.faceId,
    boundingBox: face.faceRectangle,
    landmarks: face.faceLandmarks,
    attributes: face.faceAttributes
  }));

  return {
    faces,
    count: faces.length
  };
}

/**
 * Analyze face attributes
 */
async function analyzeFaceAttributes(imageBuffer, faceId) {
  // Implementation depends on the provider being used
  const result = await detectFaces(imageBuffer);
  const face = result.faces.find(f => f.id === faceId || f.faceId === faceId);
  
  if (!face) {
    throw new Error('Face not found');
  }

  return {
    face,
    analysis: {
      dominantEmotion: face.attributes?.emotions?.reduce((a, b) => 
        a.confidence > b.confidence ? a : b
      )?.type,
      estimatedAge: face.attributes?.ageRange 
        ? (face.attributes.ageRange.low + face.attributes.ageRange.high) / 2 
        : null,
      gender: face.attributes?.gender?.value,
      isSmiling: face.attributes?.smile?.value,
      wearingGlasses: face.attributes?.glasses?.value !== 'NoGlasses'
    }
  };
}

/**
 * Compare two faces for similarity
 */
async function compareFaces(imageBuffer1, imageBuffer2) {
  // This would use the provider's face comparison API
  // For now, return a placeholder
  return {
    similarity: 0,
    isMatch: false,
    confidence: 0
  };
}

module.exports = {
  detectFaces,
  analyzeFaceAttributes,
  compareFaces,
  detectWithGoogle,
  detectWithAWS,
  detectWithAzure
};
