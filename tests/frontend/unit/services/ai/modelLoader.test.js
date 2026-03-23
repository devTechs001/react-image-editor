// tests/frontend/unit/services/ai/modelLoader.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as tf from '@tensorflow/tfjs';
import {
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
  getModelMemoryUsage,
  optimizeModels,
  ModelType,
  ModelSource,
  MODEL_CONFIGS
} from '@/services/ai/modelLoader';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  loadGraphModel: vi.fn(() => Promise.resolve({
    predict: vi.fn(),
    dispose: vi.fn()
  })),
  loadLayersModel: vi.fn(() => Promise.resolve({
    predict: vi.fn(),
    dispose: vi.fn()
  })),
  randomNormal: vi.fn(() => ({
    dispose: vi.fn()
  })),
  memory: vi.fn(() => ({
    numTensors: 100,
    numBytes: 1000
  })),
  ready: vi.fn(() => Promise.resolve()),
  getBackend: vi.fn(() => 'webgl'),
  setBackend: vi.fn(() => Promise.resolve()),
  env: vi.fn(() => ({
    set: vi.fn()
  }))
}));

describe('modelLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unloadAllModels();
  });

  afterEach(() => {
    unloadAllModels();
  });

  describe('loadModel', () => {
    it('loads model from CDN by default', async () => {
      const model = await loadModel(ModelType.MOBILE_NET);
      
      expect(tf.loadGraphModel).toHaveBeenCalled();
      expect(model).toBeTruthy();
    });

    it('loads model from local source', async () => {
      await loadModel(ModelType.MOBILE_NET, { source: ModelSource.LOCAL });
      
      expect(tf.loadGraphModel).toHaveBeenCalledWith(
        expect.stringContaining('/models/mobilenet/'),
        expect.any(Object)
      );
    });

    it('loads model from custom path', async () => {
      const customPath = 'https://example.com/custom/model.json';
      await loadModel(ModelType.MOBILE_NET, { customPath });
      
      expect(tf.loadGraphModel).toHaveBeenCalledWith(customPath, expect.any(Object));
    });

    it('uses cached model when useCache is true', async () => {
      await loadModel(ModelType.MOBILE_NET);
      await loadModel(ModelType.MOBILE_NET);
      
      // Should only call loadGraphModel once due to caching
      expect(tf.loadGraphModel).toHaveBeenCalledTimes(1);
    });

    it('bypasses cache when useCache is false', async () => {
      await loadModel(ModelType.MOBILE_NET, { useCache: true });
      await loadModel(ModelType.MOBILE_NET, { useCache: false });
      
      expect(tf.loadGraphModel).toHaveBeenCalledTimes(2);
    });

    it('calls progress callback during loading', async () => {
      const onProgress = vi.fn();
      
      // Mock to trigger progress
      tf.loadGraphModel.mockImplementationOnce(async (url, options) => {
        if (options.onProgress) {
          options.onProgress({ numLoadedTensors: 50, numTotalTensors: 100 });
        }
        return { predict: vi.fn(), dispose: vi.fn() };
      });
      
      await loadModel(ModelType.MOBILE_NET, { onProgress });
      
      expect(onProgress).toHaveBeenCalledWith({
        percentage: 50,
        loaded: 50,
        total: 100
      });
    });

    it('throws error for unknown model type', async () => {
      await expect(loadModel('unknown-type')).rejects.toThrow('Unknown model type');
    });

    it('throws error when loading fails', async () => {
      tf.loadGraphModel.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(loadModel(ModelType.MOBILE_NET)).rejects.toThrow('Network error');
    });
  });

  describe('getLoadedModel', () => {
    it('returns null for unloaded model', () => {
      const model = getLoadedModel(ModelType.MOBILE_NET);
      expect(model).toBeNull();
    });

    it('returns model after loading', async () => {
      await loadModel(ModelType.MOBILE_NET);
      const model = getLoadedModel(ModelType.MOBILE_NET);
      expect(model).toBeTruthy();
    });
  });

  describe('isModelLoaded', () => {
    it('returns false for unloaded model', () => {
      expect(isModelLoaded(ModelType.MOBILE_NET)).toBe(false);
    });

    it('returns true after loading', async () => {
      await loadModel(ModelType.MOBILE_NET);
      expect(isModelLoaded(ModelType.MOBILE_NET)).toBe(true);
    });
  });

  describe('getModelInfo', () => {
    it('returns model info', () => {
      const info = getModelInfo(ModelType.MOBILE_NET);
      
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('description');
      expect(info.name).toBe('MobileNet');
    });

    it('includes loaded status', async () => {
      await loadModel(ModelType.MOBILE_NET);
      const info = getModelInfo(ModelType.MOBILE_NET);
      
      expect(info.loaded).toBe(true);
      expect(info.loadedAt).toBeTruthy();
    });
  });

  describe('getAllModelInfo', () => {
    it('returns info for all models', () => {
      const allInfo = getAllModelInfo();
      
      expect(Array.isArray(allInfo)).toBe(true);
      expect(allInfo.length).toBe(Object.keys(MODEL_CONFIGS).length);
    });

    it('includes loaded status for each model', () => {
      const allInfo = getAllModelInfo();
      
      allInfo.forEach(info => {
        expect(info).toHaveProperty('loaded');
        expect(info).toHaveProperty('type');
        expect(info).toHaveProperty('name');
      });
    });
  });

  describe('unloadModel', () => {
    it('unloads loaded model', async () => {
      await loadModel(ModelType.MOBILE_NET);
      expect(isModelLoaded(ModelType.MOBILE_NET)).toBe(true);
      
      unloadModel(ModelType.MOBILE_NET);
      expect(isModelLoaded(ModelType.MOBILE_NET)).toBe(false);
    });

    it('does nothing for unloaded model', () => {
      expect(() => unloadModel(ModelType.MOBILE_NET)).not.toThrow();
    });
  });

  describe('unloadAllModels', () => {
    it('unloads all loaded models', async () => {
      await loadModel(ModelType.MOBILE_NET);
      await loadModel(ModelType.COCO_SSD);
      
      unloadAllModels();
      
      expect(isModelLoaded(ModelType.MOBILE_NET)).toBe(false);
      expect(isModelLoaded(ModelType.COCO_SSD)).toBe(false);
    });
  });

  describe('getLoadingProgress', () => {
    it('returns null when not loading', () => {
      const progress = getLoadingProgress(ModelType.MOBILE_NET);
      expect(progress).toBeNull();
    });
  });

  describe('preloadModels', () => {
    it('preloads multiple models', async () => {
      const models = [ModelType.MOBILE_NET, ModelType.COCO_SSD];
      const results = await preloadModels(models);
      
      expect(results.size).toBe(2);
      expect(results.get(ModelType.MOBILE_NET)).toHaveProperty('success', true);
      expect(results.get(ModelType.COCO_SSD)).toHaveProperty('success', true);
    });

    it('calls progress callback', async () => {
      const onProgress = vi.fn();
      const models = [ModelType.MOBILE_NET];
      
      await preloadModels(models, onProgress);
      
      expect(onProgress).toHaveBeenCalled();
    });

    it('handles partial failures', async () => {
      tf.loadGraphModel.mockRejectedValueOnce(new Error('Failed'));
      
      const models = [ModelType.MOBILE_NET];
      const results = await preloadModels(models);
      
      expect(results.get(ModelType.MOBILE_NET)).toHaveProperty('success', false);
    });
  });

  describe('loadCustomModel', () => {
    it('loads graph model', async () => {
      await loadCustomModel('https://example.com/model.json', 'graph');
      expect(tf.loadGraphModel).toHaveBeenCalledWith('https://example.com/model.json');
    });

    it('loads layers model', async () => {
      await loadCustomModel('https://example.com/model.json', 'layers');
      expect(tf.loadLayersModel).toHaveBeenCalledWith('https://example.com/model.json');
    });

    it('throws error for unknown type', async () => {
      await expect(
        loadCustomModel('https://example.com/model.json', 'unknown')
      ).rejects.toThrow('Unknown model type');
    });
  });

  describe('getModelMemoryUsage', () => {
    it('returns memory usage info', () => {
      const usage = getModelMemoryUsage();
      
      expect(usage).toHaveProperty('totalTensors');
      expect(usage).toHaveProperty('totalBytes');
      expect(usage).toHaveProperty('loadedModels');
      expect(usage).toHaveProperty('modelTypes');
    });
  });

  describe('optimizeModels', () => {
    it('sets WebGL backend', () => {
      optimizeModels({ backend: 'webgl' });
      expect(tf.setBackend).toHaveBeenCalledWith('webgl');
    });

    it('sets CPU backend', () => {
      optimizeModels({ backend: 'cpu' });
      expect(tf.setBackend).toHaveBeenCalledWith('cpu');
    });

    it('configures WebGL environment', () => {
      optimizeModels({ backend: 'webgl' });
      expect(tf.env().set).toHaveBeenCalled();
    });
  });

  describe('ModelType', () => {
    it('has all model type constants', () => {
      expect(ModelType.BODY_PIX).toBe('body-pix');
      expect(ModelType.FACE_MESH).toBe('face-mesh');
      expect(ModelType.POSE_NET).toBe('pose-net');
      expect(ModelType.MOBILE_NET).toBe('mobilenet');
      expect(ModelType.COCO_SSD).toBe('coco-ssd');
      expect(ModelType.SPEECH_COMMANDS).toBe('speech-commands');
      expect(ModelType.HANDPOSE).toBe('handpose');
    });
  });

  describe('ModelSource', () => {
    it('has all source constants', () => {
      expect(ModelSource.LOCAL).toBe('local');
      expect(ModelSource.CDN).toBe('cdn');
      expect(ModelSource.CUSTOM).toBe('custom');
    });
  });

  describe('MODEL_CONFIGS', () => {
    it('has configuration for each model type', () => {
      Object.values(ModelType).forEach(type => {
        expect(MODEL_CONFIGS[type]).toBeDefined();
        expect(MODEL_CONFIGS[type]).toHaveProperty('name');
        expect(MODEL_CONFIGS[type]).toHaveProperty('description');
        expect(MODEL_CONFIGS[type]).toHaveProperty('defaultModelPath');
        expect(MODEL_CONFIGS[type]).toHaveProperty('localPath');
        expect(MODEL_CONFIGS[type]).toHaveProperty('type');
      });
    });
  });
});
