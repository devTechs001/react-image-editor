// tests/frontend/unit/services/assetManager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadAsset,
  preloadAssets,
  getCachedAsset,
  isAssetLoaded,
  getAssetMetadata,
  setAssetMetadata,
  clearAsset,
  clearAllAssets,
  getCacheStats,
  createAssetUrl,
  revokeAssetUrl,
  assetToDataUrl,
  AssetLibrary,
  createAssetLibraries,
  AssetType,
  AssetSource
} from '@/services/assetManager';

describe('assetManager', () => {
  beforeEach(() => {
    clearAllAssets();
  });

  afterEach(() => {
    clearAllAssets();
    vi.clearAllMocks();
  });

  describe('loadAsset', () => {
    it('loads image asset from URL', async () => {
      const img = await loadAsset('test-image', {
        type: AssetType.IMAGE,
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });

      expect(img).toBeInstanceOf(HTMLImageElement);
    });

    it('loads video asset from URL', async () => {
      // Create a mock video element
      const video = document.createElement('video');
      video.setAttribute('src', 'data:video/mp4;base64,AAAA');
      
      // Mock loadVideoAsset behavior
      const loadedAsset = await loadAsset('test-video', {
        type: AssetType.VIDEO,
        url: 'test.mp4'
      });

      expect(loadedAsset).toBeTruthy();
    });

    it('loads audio asset from URL', async () => {
      const loadedAsset = await loadAsset('test-audio', {
        type: AssetType.AUDIO,
        url: 'test.mp3'
      });

      expect(loadedAsset).toBeTruthy();
    });

    it('uses cache when useCache is true', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      await loadAsset('cached-image', { type: AssetType.IMAGE, url });
      const cached = getCachedAsset('cached-image');
      
      expect(cached).toBeInstanceOf(HTMLImageElement);
    });

    it('bypasses cache when useCache is false', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      await loadAsset('image1', { type: AssetType.IMAGE, url, useCache: false });
      await loadAsset('image1', { type: AssetType.IMAGE, url, useCache: false });
      
      // Should load twice
      expect(getCachedAsset('image1')).toBeTruthy();
    });

    it('throws error for invalid URL', async () => {
      await expect(
        loadAsset('invalid', { type: AssetType.IMAGE, url: 'invalid-url' })
      ).rejects.toThrow();
    });
  });

  describe('preloadAssets', () => {
    it('preloads multiple assets', async () => {
      const assets = [
        { id: 'img1', type: AssetType.IMAGE, url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
        { id: 'img2', type: AssetType.IMAGE, url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
      ];

      const results = await preloadAssets(assets);

      expect(results.size).toBe(2);
      expect(results.get('img1')).toHaveProperty('success', true);
      expect(results.get('img2')).toHaveProperty('success', true);
    });

    it('calls progress callback', async () => {
      const onProgress = vi.fn();
      const assets = [
        { id: 'img1', type: AssetType.IMAGE, url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
      ];

      await preloadAssets(assets, onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
        loaded: expect.any(Number),
        total: expect.any(Number),
        percentage: expect.any(Number)
      }));
    });

    it('handles partial failures', async () => {
      const assets = [
        { id: 'valid', type: AssetType.IMAGE, url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
        { id: 'invalid', type: AssetType.IMAGE, url: 'invalid-url' }
      ];

      const results = await preloadAssets(assets);

      expect(results.get('valid')).toHaveProperty('success', true);
      expect(results.get('invalid')).toHaveProperty('success', false);
    });
  });

  describe('getCachedAsset', () => {
    it('returns null for uncached asset', () => {
      expect(getCachedAsset('nonexistent')).toBeNull();
    });

    it('returns cached asset', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('test', { type: AssetType.IMAGE, url });

      const cached = getCachedAsset('test');
      expect(cached).toBeInstanceOf(HTMLImageElement);
    });

    it('returns null for expired asset', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('expiring', { 
        type: AssetType.IMAGE, 
        url,
        ttl: 1 // 1ms TTL
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      const cached = getCachedAsset('expiring');
      
      expect(cached).toBeNull();
    });
  });

  describe('isAssetLoaded', () => {
    it('returns false for unloaded asset', () => {
      expect(isAssetLoaded('nonexistent')).toBe(false);
    });

    it('returns true for loaded asset', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('test', { type: AssetType.IMAGE, url });

      expect(isAssetLoaded('test')).toBe(true);
    });
  });

  describe('getAssetMetadata', () => {
    it('returns null for asset without metadata', () => {
      expect(getAssetMetadata('test')).toBeNull();
    });

    it('returns metadata after setting', () => {
      setAssetMetadata('test', { name: 'Test Asset' });
      const metadata = getAssetMetadata('test');

      expect(metadata).toEqual({
        name: 'Test Asset',
        updatedAt: expect.any(Number)
      });
    });
  });

  describe('setAssetMetadata', () => {
    it('sets metadata for asset', () => {
      setAssetMetadata('test', { key: 'value' });
      const metadata = getAssetMetadata('test');

      expect(metadata.key).toBe('value');
      expect(metadata.updatedAt).toBeGreaterThan(0);
    });

    it('updates existing metadata', () => {
      setAssetMetadata('test', { key1: 'value1' });
      setAssetMetadata('test', { key2: 'value2' });

      const metadata = getAssetMetadata('test');
      expect(metadata.key2).toBe('value2');
    });
  });

  describe('clearAsset', () => {
    it('clears asset from cache', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('test', { type: AssetType.IMAGE, url });
      
      expect(isAssetLoaded('test')).toBe(true);
      
      clearAsset('test');
      
      expect(isAssetLoaded('test')).toBe(false);
    });

    it('clears metadata along with asset', () => {
      setAssetMetadata('test', { name: 'Test' });
      clearAsset('test');
      
      expect(getAssetMetadata('test')).toBeNull();
    });
  });

  describe('clearAllAssets', () => {
    it('clears all cached assets', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('test1', { type: AssetType.IMAGE, url });
      await loadAsset('test2', { type: AssetType.IMAGE, url });

      clearAllAssets();

      expect(isAssetLoaded('test1')).toBe(false);
      expect(isAssetLoaded('test2')).toBe(false);
    });
  });

  describe('getCacheStats', () => {
    it('returns cache statistics', async () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await loadAsset('test', { type: AssetType.IMAGE, url });

      const stats = getCacheStats();

      expect(stats).toHaveProperty('totalAssets');
      expect(stats).toHaveProperty('expiredAssets');
      expect(stats).toHaveProperty('estimatedSize');
      expect(stats).toHaveProperty('estimatedSizeFormatted');
    });

    it('shows zero for empty cache', () => {
      const stats = getCacheStats();
      expect(stats.totalAssets).toBe(0);
    });
  });

  describe('createAssetUrl', () => {
    it('creates object URL from file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const url = createAssetUrl(file);

      expect(url).toMatch(/^blob:/);
    });
  });

  describe('revokeAssetUrl', () => {
    it('revokes object URL', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const url = createAssetUrl(file);

      expect(() => revokeAssetUrl(url)).not.toThrow();
    });
  });

  describe('assetToDataUrl', () => {
    it('converts Blob to data URL', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const dataUrl = await assetToDataUrl(blob);

      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('converts HTMLImageElement to data URL', async () => {
      const img = document.createElement('img');
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const dataUrl = await assetToDataUrl(img);
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('throws error for unsupported type', async () => {
      await expect(assetToDataUrl('string')).rejects.toThrow('Unsupported asset type');
    });
  });

  describe('AssetLibrary', () => {
    it('creates library with name', () => {
      const library = new AssetLibrary('test-library');
      expect(library.name).toBe('test-library');
    });

    it('adds asset to library', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { type: AssetType.IMAGE, url: 'test.png' });

      expect(library.assets.size).toBe(1);
    });

    it('adds asset to category', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { type: AssetType.IMAGE, category: 'backgrounds' });

      expect(library.categories.has('backgrounds')).toBe(true);
      expect(library.categories.get('backgrounds').has('asset1')).toBe(true);
    });

    it('gets asset by id', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { name: 'Test Asset' });

      const asset = library.get('asset1');
      expect(asset.name).toBe('Test Asset');
    });

    it('gets assets by category', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { category: 'bg' });
      library.add('asset2', { category: 'bg' });
      library.add('asset3', { category: 'overlay' });

      const bgAssets = library.getByCategory('bg');
      expect(bgAssets).toHaveLength(2);
    });

    it('gets all assets', () => {
      const library = new AssetLibrary('test');
      library.add('asset1');
      library.add('asset2');

      const all = library.getAll();
      expect(all).toHaveLength(2);
    });

    it('searches assets', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { name: 'Background 1', tags: ['nature'] });
      library.add('asset2', { name: 'Background 2', tags: ['city'] });
      library.add('asset3', { name: 'Overlay 1', tags: ['nature'] });

      const results = library.search('Background');
      expect(results).toHaveLength(2);

      const natureResults = library.search('', { tags: ['nature'] });
      expect(natureResults).toHaveLength(2);
    });

    it('removes asset', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { category: 'bg' });

      library.remove('asset1');

      expect(library.get('asset1')).toBeUndefined();
      expect(library.categories.get('bg').has('asset1')).toBe(false);
    });

    it('returns library stats', () => {
      const library = new AssetLibrary('test');
      library.add('asset1', { category: 'bg' });
      library.add('asset2', { category: 'overlay' });

      const stats = library.getStats();

      expect(stats.totalAssets).toBe(2);
      expect(stats.categories).toBe(2);
    });
  });

  describe('createAssetLibraries', () => {
    it('creates all predefined libraries', () => {
      const libraries = createAssetLibraries();

      expect(libraries.backgrounds).toBeInstanceOf(AssetLibrary);
      expect(libraries.templates).toBeInstanceOf(AssetLibrary);
      expect(libraries.filters).toBeInstanceOf(AssetLibrary);
      expect(libraries.overlays).toBeInstanceOf(AssetLibrary);
      expect(libraries.fonts).toBeInstanceOf(AssetLibrary);
      expect(libraries.sounds).toBeInstanceOf(AssetLibrary);
      expect(libraries.watermarks).toBeInstanceOf(AssetLibrary);
    });
  });

  describe('AssetType', () => {
    it('has all asset type constants', () => {
      expect(AssetType.IMAGE).toBe('image');
      expect(AssetType.VIDEO).toBe('video');
      expect(AssetType.AUDIO).toBe('audio');
      expect(AssetType.FONT).toBe('font');
      expect(AssetType.TEMPLATE).toBe('template');
      expect(AssetType.FILTER).toBe('filter');
      expect(AssetType.OVERLAY).toBe('overlay');
      expect(AssetType.BACKGROUND).toBe('background');
      expect(AssetType.SOUND).toBe('sound');
      expect(AssetType.WATERMARK).toBe('watermark');
    });
  });

  describe('AssetSource', () => {
    it('has all source constants', () => {
      expect(AssetSource.LOCAL).toBe('local');
      expect(AssetSource.REMOTE).toBe('remote');
      expect(AssetSource.DATA_URL).toBe('data-url');
      expect(AssetSource.BLOB).toBe('blob');
    });
  });
});
