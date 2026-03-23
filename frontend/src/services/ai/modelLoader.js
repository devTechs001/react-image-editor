// frontend/src/services/ai/modelLoader.js
/**
 * AI Model Loader Service
 * Handles loading and managing TensorFlow.js and other AI models
 */

import * as tf from '@tensorflow/tfjs';

export const ModelType = {
  BODY_PIX: 'body-pix',
  FACE_MESH: 'face-mesh',
  POSE_NET: 'pose-net',
  MOBILE_NET: 'mobilenet',
  COCO_SSD: 'coco-ssd',
  SPEECH_COMMANDS: 'speech-commands',
  FACE_RECOGNITION: 'face-recognition',
  HANDPOSE: 'handpose',
  DEPTH_ESTIMATION: 'depth-estimation'
};

export const ModelSource = {
  LOCAL: 'local',
  CDN: 'cdn',
  CUSTOM: 'custom'
};

/**
 * Model configuration registry
 */
const MODEL_CONFIGS = {
  [ModelType.BODY_PIX]: {
    name: 'BodyPix',
    description: 'Human body segmentation',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/bodypix/mobilenet/float/050/model-stride16.json',
    localPath: '/models/bodypix/model.json',
    type: 'graph'
  },
  [ModelType.FACE_MESH]: {
    name: 'FaceMesh',
    description: 'Facial landmark detection (468 points)',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/facemesh/model.json',
    localPath: '/models/facemesh/model.json',
    type: 'graph'
  },
  [ModelType.POSE_NET]: {
    name: 'PoseNet',
    description: 'Human pose estimation',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/050/model-stride16.json',
    localPath: '/models/posenet/model.json',
    type: 'graph'
  },
  [ModelType.MOBILE_NET]: {
    name: 'MobileNet',
    description: 'Image classification',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json',
    localPath: '/models/mobilenet/model.json',
    type: 'graph'
  },
  [ModelType.COCO_SSD]: {
    name: 'COCO-SSD',
    description: 'Object detection (80 classes)',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/coco-ssd/model.json',
    localPath: '/models/coco-ssd/model.json',
    type: 'graph'
  },
  [ModelType.SPEECH_COMMANDS]: {
    name: 'Speech Commands',
    description: 'Audio command recognition',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/speech_commands_v0.01/model.json',
    localPath: '/models/speech-commands/model.json',
    type: 'layers'
  },
  [ModelType.HANDPOSE]: {
    name: 'HandPose',
    description: 'Hand landmark detection',
    defaultModelPath: 'https://storage.googleapis.com/tfjs-models/savedmodel/handpose/model.json',
    localPath: '/models/handpose/model.json',
    type: 'graph'
  }
};

/**
 * Model cache for loaded models
 */
const modelCache = new Map();

/**
 * Load progress tracking
 */
const loadProgress = new Map();

/**
 * Load AI model
 * @param {string} modelType - Type of model to load
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} - Loaded model
 */
export async function loadModel(modelType, options = {}) {
  const {
    source = ModelSource.CDN,
    customPath = null,
    useCache = true,
    onProgress = null
  } = options;

  // Check cache
  if (useCache && modelCache.has(modelType)) {
    const cached = modelCache.get(modelType);
    if (cached.loaded && cached.model) {
      return cached.model;
    }
  }

  const config = MODEL_CONFIGS[modelType];
  if (!config) {
    throw new Error(`Unknown model type: ${modelType}`);
  }

  // Determine model path
  let modelPath = customPath;
  if (!modelPath) {
    modelPath = source === ModelSource.LOCAL ? config.localPath : config.defaultModelPath;
  }

  // Track progress
  const progressId = `${modelType}_${Date.now()}`;
  loadProgress.set(progressId, { loaded: 0, total: 0 });

  try {
    // Load model based on type
    let model;
    if (config.type === 'graph') {
      model = await tf.loadGraphModel(modelPath, {
        fromCache: false,
        onProgress: (progress) => handleProgress(progressId, progress, onProgress)
      });
    } else if (config.type === 'layers') {
      model = await tf.loadLayersModel(modelPath, {
        fromCache: false,
        onProgress: (progress) => handleProgress(progressId, progress, onProgress)
      });
    } else {
      throw new Error(`Unknown model type: ${config.type}`);
    }

    // Warm up model
    await warmupModel(model, config);

    // Cache model
    modelCache.set(modelType, {
      model,
      loaded: true,
      loadedAt: Date.now(),
      config
    });

    loadProgress.delete(progressId);

    return model;
  } catch (error) {
    loadProgress.delete(progressId);
    console.error(`Failed to load model ${modelType}:`, error);
    throw error;
  }
}

/**
 * Handle loading progress
 */
function handleProgress(progressId, progress, onProgress) {
  const current = loadProgress.get(progressId);
  if (current) {
    current.loaded = progress.numLoadedTensors;
    current.total = progress.numTotalTensors;
    
    const percentage = current.total > 0 
      ? Math.round((current.loaded / current.total) * 100) 
      : 0;
    
    loadProgress.set(progressId, current);
    
    if (onProgress) {
      onProgress({
        percentage,
        loaded: current.loaded,
        total: current.total
      });
    }
  }
}

/**
 * Warm up model with dummy input
 */
async function warmupModel(model, config) {
  try {
    // Create dummy input based on model type
    let dummyInput;
    
    if (config.name === 'MobileNet') {
      dummyInput = tf.randomNormal([1, 224, 224, 3]);
    } else if (config.name === 'COCO-SSD') {
      dummyInput = tf.randomNormal([1, 512, 512, 3]);
    } else {
      dummyInput = tf.randomNormal([1, 257, 257, 3]);
    }

    // Run prediction
    if (model.predict) {
      const result = model.predict(dummyInput);
      // Dispose result
      if (result.dispose) {
        result.dispose();
      }
    }

    // Dispose dummy input
    dummyInput.dispose();
    
    // Force garbage collection
    await tf.ready();
  } catch (error) {
    console.warn('Model warmup failed:', error);
  }
}

/**
 * Get loaded model
 * @param {string} modelType - Type of model
 * @returns {Object|null} - Loaded model or null
 */
export function getLoadedModel(modelType) {
  const cached = modelCache.get(modelType);
  return cached?.model || null;
}

/**
 * Check if model is loaded
 * @param {string} modelType - Type of model
 * @returns {boolean} - True if loaded
 */
export function isModelLoaded(modelType) {
  const cached = modelCache.get(modelType);
  return cached?.loaded || false;
}

/**
 * Get model info
 * @param {string} modelType - Type of model
 * @returns {Object|null} - Model info
 */
export function getModelInfo(modelType) {
  const config = MODEL_CONFIGS[modelType];
  const cached = modelCache.get(modelType);
  
  return {
    ...config,
    loaded: cached?.loaded || false,
    loadedAt: cached?.loadedAt || null,
    size: cached?.size || null
  };
}

/**
 * Get all model info
 * @returns {Array<Object>} - Array of model info
 */
export function getAllModelInfo() {
  return Object.entries(MODEL_CONFIGS).map(([type, config]) => {
    const cached = modelCache.get(type);
    return {
      type,
      ...config,
      loaded: cached?.loaded || false,
      loadedAt: cached?.loadedAt || null
    };
  });
}

/**
 * Unload model from memory
 * @param {string} modelType - Type of model
 */
export function unloadModel(modelType) {
  const cached = modelCache.get(modelType);
  if (cached?.model) {
    // Dispose model tensors
    if (cached.model.dispose) {
      cached.model.dispose();
    }
    modelCache.delete(modelType);
  }
}

/**
 * Unload all models
 */
export function unloadAllModels() {
  for (const modelType of modelCache.keys()) {
    unloadModel(modelType);
  }
  modelCache.clear();
}

/**
 * Get loading progress
 * @param {string} modelType - Type of model
 * @returns {Object|null} - Progress info
 */
export function getLoadingProgress(modelType) {
  for (const [key, progress] of loadProgress.entries()) {
    if (key.startsWith(modelType)) {
      return progress;
    }
  }
  return null;
}

/**
 * Preload multiple models
 * @param {Array<string>} modelTypes - Types of models to preload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Map>} - Loaded models map
 */
export async function preloadModels(modelTypes, onProgress = null) {
  const results = new Map();
  const total = modelTypes.length;
  let completed = 0;

  for (const modelType of modelTypes) {
    try {
      await loadModel(modelType, {
        onProgress: (progress) => {
          if (onProgress) {
            onProgress({
              modelType,
              ...progress,
              overallProgress: Math.round((completed + progress.percentage / 100) / total * 100)
            });
          }
        }
      });
      completed++;
      results.set(modelType, { success: true });
    } catch (error) {
      results.set(modelType, { success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Load model from custom URL
 * @param {string} url - Model URL
 * @param {string} type - Model type (graph or layers)
 * @returns {Promise<Object>} - Loaded model
 */
export async function loadCustomModel(url, type = 'graph') {
  if (type === 'graph') {
    return await tf.loadGraphModel(url);
  } else if (type === 'layers') {
    return await tf.loadLayersModel(url);
  }
  throw new Error(`Unknown model type: ${type}`);
}

/**
 * Convert model to JSON for serialization
 * @param {string} modelType - Type of model
 * @returns {Object|null} - Model config as JSON
 */
export function modelToJson(modelType) {
  const info = getModelInfo(modelType);
  if (!info) return null;
  
  return {
    type: modelType,
    name: info.name,
    loaded: info.loaded,
    loadedAt: info.loadedAt,
    source: info.loaded ? (modelCache.get(modelType).source || 'unknown') : 'not_loaded'
  };
}

/**
 * Create model from JSON
 * @param {Object} json - Model JSON config
 * @returns {Promise<Object>} - Loaded model
 */
export async function modelFromJson(json) {
  return await loadModel(json.type);
}

/**
 * Get memory usage for loaded models
 * @returns {Object} - Memory usage info
 */
export function getModelMemoryUsage() {
  const memory = tf.memory();
  const modelInfo = getAllModelInfo();
  const loadedModels = modelInfo.filter(m => m.loaded);
  
  return {
    totalTensors: memory.numTensors,
    totalBytes: memory.numBytes,
    loadedModels: loadedModels.length,
    modelTypes: loadedModels.map(m => m.type)
  };
}

/**
 * Optimize models for performance
 * @param {Object} options - Optimization options
 */
export function optimizeModels(options = {}) {
  const {
    backend = 'webgl',
    precision = 'float32'
  } = options;

  // Set TensorFlow.js backend
  if (backend === 'webgl' && tf.getBackend() !== 'webgl') {
    tf.setBackend('webgl');
  } else if (backend === 'cpu' && tf.getBackend() !== 'cpu') {
    tf.setBackend('cpu');
  }

  // Configure backend
  if (backend === 'webgl') {
    tf.env().set('WEBGL_PACK', true);
    tf.env().set('WEBGL_MULTI_SHADER_BYTECODE', true);
  }
}

export default {
  loadModel,
  getLoadedModel,
  isModelLoaded,
  getModelInfo,
  getAllModelInfo,
  unloadModel,
  unloadAllModels,
  getLoadingProgress,
  preloadModels,
  loadCustomModel,
  modelToJson,
  modelFromJson,
  getModelMemoryUsage,
  optimizeModels,
  ModelType,
  ModelSource,
  MODEL_CONFIGS
};
