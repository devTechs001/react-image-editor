// frontend/src/services/ai/modelManager.js
/**
 * AI Model Manager
 * Extended model management with version control and updates
 */

import {
  loadModel,
  getLoadedModel,
  isModelLoaded,
  getModelInfo,
  getAllModelInfo,
  unloadModel,
  unloadAllModels,
  preloadModels,
  ModelType,
  MODEL_CONFIGS
} from './modelLoader';

export const ModelStatus = {
  NOT_LOADED: 'not_loaded',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
  UPDATING: 'updating'
};

/**
 * Model version registry
 */
const modelVersions = new Map();

/**
 * Model event listeners
 */
const eventListeners = new Map();

/**
 * Initialize model manager
 */
export function initializeModelManager() {
  // Load saved model preferences
  const savedPrefs = localStorage.getItem('model_preferences');
  if (savedPrefs) {
    try {
      const prefs = JSON.parse(savedPrefs);
      return prefs;
    } catch (e) {
      console.warn('Failed to load model preferences');
    }
  }
  return null;
}

/**
 * Save model preferences
 */
export function saveModelPreferences(prefs) {
  localStorage.setItem('model_preferences', JSON.stringify(prefs));
}

/**
 * Subscribe to model events
 */
export function onModelEvent(eventType, callback) {
  if (!eventListeners.has(eventType)) {
    eventListeners.set(eventType, new Set());
  }
  eventListeners.get(eventType).add(callback);
  
  return () => {
    eventListeners.get(eventType)?.delete(callback);
  };
}

/**
 * Emit model event
 */
function emitModelEvent(eventType, data) {
  const listeners = eventListeners.get(eventType);
  if (listeners) {
    listeners.forEach(callback => callback(data));
  }
}

/**
 * Load model with status tracking
 */
export async function loadModelWithStatus(modelType, options = {}) {
  const { onProgress, onError } = options;
  
  emitModelEvent('model:loading', { modelType });
  
  try {
    const model = await loadModel(modelType, {
      ...options,
      onProgress: (progress) => {
        emitModelEvent('model:progress', { modelType, ...progress });
        onProgress?.(progress);
      }
    });
    
    emitModelEvent('model:loaded', { modelType });
    return { status: ModelStatus.LOADED, model };
  } catch (error) {
    emitModelEvent('model:error', { modelType, error });
    onError?.(error);
    return { status: ModelStatus.ERROR, error: error.message };
  }
}

/**
 * Get model status
 */
export function getModelStatus(modelType) {
  if (isModelLoaded(modelType)) {
    return ModelStatus.LOADED;
  }
  
  // Check if loading
  const progress = getLoadingProgress(modelType);
  if (progress) {
    return ModelStatus.LOADING;
  }
  
  return ModelStatus.NOT_LOADED;
}

/**
 * Update model to latest version
 */
export async function updateModel(modelType, options = {}) {
  const { force = false, onProgress } = options;
  
  emitModelEvent('model:updating', { modelType });
  
  // Unload current model
  unloadModel(modelType);
  
  // Load with cache bypass
  try {
    const model = await loadModel(modelType, {
      useCache: !force,
      onProgress
    });
    
    // Track version
    modelVersions.set(modelType, {
      version: Date.now(),
      loadedAt: new Date().toISOString()
    });
    
    emitModelEvent('model:updated', { modelType });
    return { success: true, model };
  } catch (error) {
    emitModelEvent('model:update_error', { modelType, error });
    return { success: false, error: error.message };
  }
}

/**
 * Get model version info
 */
export function getModelVersion(modelType) {
  return modelVersions.get(modelType) || null;
}

/**
 * Smart model loading with fallbacks
 */
export async function smartLoadModel(primaryType, fallbacks = []) {
  const modelsToTry = [primaryType, ...fallbacks];
  
  for (const modelType of modelsToTry) {
    try {
      const result = await loadModelWithStatus(modelType);
      if (result.status === ModelStatus.LOADED) {
        return { modelType, ...result };
      }
    } catch (error) {
      console.warn(`Failed to load ${modelType}, trying next fallback`);
    }
  }
  
  throw new Error(`Failed to load any model from: ${modelsToTry.join(', ')}`);
}

/**
 * Lazy load model on demand
 */
export function createLazyLoader(modelType, options = {}) {
  let model = null;
  let loadPromise = null;
  
  return {
    async get() {
      if (model) return model;
      
      if (!loadPromise) {
        loadPromise = loadModel(modelType, options)
          .then(loadedModel => {
            model = loadedModel;
            return model;
          });
      }
      
      return loadPromise;
    },
    
    async reload() {
      model = null;
      loadPromise = null;
      return this.get();
    },
    
    isLoaded() {
      return model !== null;
    }
  };
}

/**
 * Model bundle for related models
 */
export class ModelBundle {
  constructor(name, modelTypes) {
    this.name = name;
    this.modelTypes = modelTypes;
    this.models = new Map();
    this.status = ModelStatus.NOT_LOADED;
  }
  
  async load(options = {}) {
    this.status = ModelStatus.LOADING;
    const results = await preloadModels(this.modelTypes, options.onProgress);
    
    let allSuccess = true;
    for (const [type, result] of results) {
      if (result.success) {
        const model = getLoadedModel(type);
        this.models.set(type, model);
      } else {
        allSuccess = false;
      }
    }
    
    this.status = allSuccess ? ModelStatus.LOADED : ModelStatus.ERROR;
    return { success: allSuccess, results };
  }
  
  get(type) {
    return this.models.get(type);
  }
  
  unload() {
    for (const type of this.modelTypes) {
      unloadModel(type);
    }
    this.models.clear();
    this.status = ModelStatus.NOT_LOADED;
  }
}

/**
 * Predefined model bundles
 */
export const ModelBundles = {
  HUMAN_ANALYSIS: new ModelBundle('human_analysis', [
    ModelType.BODY_PIX,
    ModelType.POSE_NET,
    ModelType.FACE_MESH
  ]),
  
  OBJECT_DETECTION: new ModelBundle('object_detection', [
    ModelType.COCO_SSD,
    ModelType.MOBILE_NET
  ]),
  
  HAND_TRACKING: new ModelBundle('hand_tracking', [
    ModelType.HANDPOSE
  ]),
  
  AUDIO_PROCESSING: new ModelBundle('audio_processing', [
    ModelType.SPEECH_COMMANDS
  ]),
  
  ALL_MODELS: new ModelBundle('all_models', Object.values(ModelType))
};

/**
 * Get recommended model for task
 */
export function getRecommendedModel(task) {
  const taskModelMap = {
    'background-removal': ModelType.BODY_PIX,
    'pose-detection': ModelType.POSE_NET,
    'face-detection': ModelType.FACE_MESH,
    'object-detection': ModelType.COCO_SSD,
    'image-classification': ModelType.MOBILE_NET,
    'hand-tracking': ModelType.HANDPOSE,
    'voice-command': ModelType.SPEECH_COMMANDS
  };
  
  return taskModelMap[task] || null;
}

/**
 * Model health check
 */
export async function checkModelHealth(modelType) {
  const info = getModelInfo(modelType);
  if (!info) {
    return { healthy: false, reason: 'Model not found' };
  }
  
  if (!info.loaded) {
    return { healthy: false, reason: 'Model not loaded' };
  }
  
  const model = getLoadedModel(modelType);
  if (!model) {
    return { healthy: false, reason: 'Model instance not found' };
  }
  
  // Run health check inference
  try {
    const dummyInput = tf.randomNormal([1, 224, 224, 3]);
    const start = performance.now();
    
    if (model.predict) {
      const result = model.predict(dummyInput);
      if (result.dispose) result.dispose();
    }
    
    const duration = performance.now() - start;
    dummyInput.dispose();
    
    return {
      healthy: true,
      inferenceTime: Math.round(duration),
      memoryUsage: tf.memory()
    };
  } catch (error) {
    return { healthy: false, reason: error.message };
  }
}

/**
 * Get all model health status
 */
export async function getAllModelHealth() {
  const health = {};
  for (const type of Object.values(ModelType)) {
    health[type] = await checkModelHealth(type);
  }
  return health;
}

// Import getLoadingProgress from modelLoader
import { getLoadingProgress } from './modelLoader';

export default {
  initializeModelManager,
  saveModelPreferences,
  onModelEvent,
  loadModelWithStatus,
  getModelStatus,
  updateModel,
  getModelVersion,
  smartLoadModel,
  createLazyLoader,
  ModelBundle,
  ModelBundles,
  getRecommendedModel,
  checkModelHealth,
  getAllModelHealth,
  ModelStatus
};
