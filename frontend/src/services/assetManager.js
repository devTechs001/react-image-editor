// frontend/src/services/assetManager.js
/**
 * Asset Manager Service
 * Handles loading, caching, and managing media assets
 */

export const AssetType = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FONT: 'font',
  TEMPLATE: 'template',
  FILTER: 'filter',
  OVERLAY: 'overlay',
  BACKGROUND: 'background',
  SOUND: 'sound',
  WATERMARK: 'watermark',
  LUT: 'lut',
  BRUSH: 'brush'
};

export const AssetSource = {
  LOCAL: 'local',
  REMOTE: 'remote',
  DATA_URL: 'data-url',
  BLOB: 'blob'
};

/**
 * Asset cache
 */
const assetCache = new Map();
const metadataCache = new Map();

/**
 * Load asset
 * @param {string} id - Asset ID
 * @param {Object} options - Loading options
 * @returns {Promise<any>} - Loaded asset
 */
export async function loadAsset(id, options = {}) {
  const {
    type = AssetType.IMAGE,
    source = AssetSource.REMOTE,
    url,
    useCache = true
  } = options;

  // Check cache
  if (useCache && assetCache.has(id)) {
    const cached = assetCache.get(id);
    if (!cached.expired || cached.expires > Date.now()) {
      return cached.data;
    }
  }

  try {
    let asset;

    switch (type) {
      case AssetType.IMAGE:
        asset = await loadImageAsset(url, source);
        break;
      case AssetType.VIDEO:
        asset = await loadVideoAsset(url, source);
        break;
      case AssetType.AUDIO:
        asset = await loadAudioAsset(url, source);
        break;
      case AssetType.FONT:
        asset = await loadFontAsset(id, url);
        break;
      default:
        asset = await loadGenericAsset(url, source);
    }

    // Cache asset
    assetCache.set(id, {
      data: asset,
      loadedAt: Date.now(),
      expires: options.ttl ? Date.now() + options.ttl : Infinity,
      type,
      source
    });

    return asset;
  } catch (error) {
    console.error(`Failed to load asset ${id}:`, error);
    throw error;
  }
}

/**
 * Load image asset
 */
async function loadImageAsset(url, source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
    
    if (source === AssetSource.DATA_URL || source === AssetSource.BLOB) {
      img.src = url;
    } else {
      img.src = url + '?t=' + Date.now(); // Cache busting
    }
  });
}

/**
 * Load video asset
 */
async function loadVideoAsset(url, source) {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.preload = 'auto';
  
  return new Promise((resolve, reject) => {
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
    video.src = url;
    video.load();
  });
}

/**
 * Load audio asset
 */
async function loadAudioAsset(url, source) {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  
  return new Promise((resolve, reject) => {
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
    audio.src = url;
    audio.load();
  });
}

/**
 * Load font asset
 */
async function loadFontAsset(fontName, url) {
  const fontFace = new FontFace(fontName, `url(${url})`);
  
  try {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
    await document.fonts.ready;
    return loadedFont;
  } catch (error) {
    throw new Error(`Failed to load font: ${fontName}`);
  }
}

/**
 * Load generic asset
 */
async function loadGenericAsset(url, source) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${url}`);
  }
  return await response.blob();
}

/**
 * Preload multiple assets
 * @param {Array<Object>} assets - Array of asset configs
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Map>} - Loaded assets map
 */
export async function preloadAssets(assets, onProgress = null) {
  const results = new Map();
  const total = assets.length;
  let loaded = 0;

  const loadPromises = assets.map(async (asset) => {
    try {
      const data = await loadAsset(asset.id, asset);
      results.set(asset.id, { success: true, data });
    } catch (error) {
      results.set(asset.id, { success: false, error: error.message });
    }
    
    loaded++;
    if (onProgress) {
      onProgress({ loaded, total, percentage: Math.round((loaded / total) * 100) });
    }
  });

  await Promise.all(loadPromises);
  return results;
}

/**
 * Get cached asset
 * @param {string} id - Asset ID
 * @returns {any|null} - Cached asset or null
 */
export function getCachedAsset(id) {
  const cached = assetCache.get(id);
  if (!cached) return null;
  
  if (cached.expired && cached.expires < Date.now()) {
    assetCache.delete(id);
    return null;
  }
  
  return cached.data;
}

/**
 * Check if asset is loaded
 * @param {string} id - Asset ID
 * @returns {boolean} - True if loaded
 */
export function isAssetLoaded(id) {
  return assetCache.has(id);
}

/**
 * Get asset metadata
 * @param {string} id - Asset ID
 * @returns {Object|null} - Asset metadata
 */
export function getAssetMetadata(id) {
  return metadataCache.get(id) || null;
}

/**
 * Set asset metadata
 * @param {string} id - Asset ID
 * @param {Object} metadata - Metadata
 */
export function setAssetMetadata(id, metadata) {
  metadataCache.set(id, { ...metadata, updatedAt: Date.now() });
}

/**
 * Clear asset from cache
 * @param {string} id - Asset ID
 */
export function clearAsset(id) {
  assetCache.delete(id);
  metadataCache.delete(id);
}

/**
 * Clear all assets
 */
export function clearAllAssets() {
  assetCache.clear();
  metadataCache.clear();
}

/**
 * Get cache stats
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let totalSize = 0;
  let expiredCount = 0;
  
  for (const [id, cached] of assetCache.entries()) {
    if (cached.expired && cached.expires < now) {
      expiredCount++;
    }
    
    // Estimate size
    if (cached.data instanceof Blob) {
      totalSize += cached.data.size;
    } else if (cached.data instanceof HTMLImageElement) {
      // Estimate based on dimensions
      totalSize += cached.data.width * cached.data.height * 4;
    }
  }
  
  return {
    totalAssets: assetCache.size,
    expiredAssets: expiredCount,
    estimatedSize: totalSize,
    estimatedSizeFormatted: formatBytes(totalSize)
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create asset URL from file
 * @param {File} file - File object
 * @returns {string} - Object URL
 */
export function createAssetUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke asset URL
 * @param {string} url - Object URL to revoke
 */
export function revokeAssetUrl(url) {
  URL.revokeObjectURL(url);
}

/**
 * Convert asset to data URL
 * @param {Blob|HTMLImageElement} asset - Asset to convert
 * @returns {Promise<string>} - Data URL
 */
export async function assetToDataUrl(asset) {
  if (asset instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(asset);
    });
  }
  
  if (asset instanceof HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = asset.width;
    canvas.height = asset.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(asset, 0, 0);
    return canvas.toDataURL();
  }
  
  throw new Error('Unsupported asset type');
}

/**
 * Asset library manager
 */
export class AssetLibrary {
  constructor(name, options = {}) {
    this.name = name;
    this.assets = new Map();
    this.categories = new Map();
    this.options = {
      autoLoad: false,
      lazyLoad: true,
      ...options
    };
  }
  
  /**
   * Add asset to library
   */
  add(id, config) {
    this.assets.set(id, {
      id,
      ...config,
      addedAt: Date.now()
    });
    
    // Add to category
    if (config.category) {
      if (!this.categories.has(config.category)) {
        this.categories.set(config.category, new Set());
      }
      this.categories.get(config.category).add(id);
    }
    
    return this;
  }
  
  /**
   * Add multiple assets
   */
  addMany(assets) {
    assets.forEach(asset => this.add(asset.id, asset));
    return this;
  }
  
  /**
   * Get asset
   */
  get(id) {
    return this.assets.get(id);
  }
  
  /**
   * Get assets by category
   */
  getByCategory(category) {
    const ids = this.categories.get(category);
    if (!ids) return [];
    
    return Array.from(ids).map(id => this.assets.get(id));
  }
  
  /**
   * Get all assets
   */
  getAll() {
    return Array.from(this.assets.values());
  }
  
  /**
   * Search assets
   */
  search(query, options = {}) {
    const { type, category, tags } = options;
    const lowerQuery = query.toLowerCase();
    
    return this.getAll().filter(asset => {
      const matchesQuery = !query || 
        asset.name?.toLowerCase().includes(lowerQuery) ||
        asset.description?.toLowerCase().includes(lowerQuery) ||
        asset.tags?.some(t => t.toLowerCase().includes(lowerQuery));
      
      const matchesType = !type || asset.type === type;
      const matchesCategory = !category || asset.category === category;
      const matchesTags = !tags || tags.every(t => asset.tags?.includes(t));
      
      return matchesQuery && matchesType && matchesCategory && matchesTags;
    });
  }
  
  /**
   * Load asset from library
   */
  async load(id) {
    const asset = this.assets.get(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }
    
    if (this.options.lazyLoad || !asset.loaded) {
      const data = await loadAsset(id, asset);
      asset.data = data;
      asset.loaded = true;
    }
    
    return asset.data;
  }
  
  /**
   * Load all assets
   */
  async loadAll(onProgress = null) {
    const assets = this.getAll().map(a => ({ id: a.id, ...a }));
    return await preloadAssets(assets, onProgress);
  }
  
  /**
   * Remove asset
   */
  remove(id) {
    const asset = this.assets.get(id);
    if (asset?.category) {
      this.categories.get(asset.category)?.delete(id);
    }
    this.assets.delete(id);
    clearAsset(id);
  }
  
  /**
   * Get library stats
   */
  getStats() {
    return {
      totalAssets: this.assets.size,
      categories: this.categories.size,
      loadedAssets: Array.from(this.assets.values()).filter(a => a.loaded).length,
      cacheStats: getCacheStats()
    };
  }
}

/**
 * Create predefined asset libraries
 */
export function createAssetLibraries() {
  const libraries = {
    backgrounds: new AssetLibrary('backgrounds', { autoLoad: false }),
    templates: new AssetLibrary('templates', { autoLoad: false }),
    filters: new AssetLibrary('filters', { autoLoad: false }),
    overlays: new AssetLibrary('overlays', { autoLoad: false }),
    fonts: new AssetLibrary('fonts', { autoLoad: false }),
    sounds: new AssetLibrary('sounds', { autoLoad: false }),
    watermarks: new AssetLibrary('watermarks', { autoLoad: false })
  };
  
  return libraries;
}

export default {
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
};
