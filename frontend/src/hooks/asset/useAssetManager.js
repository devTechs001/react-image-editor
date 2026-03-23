// frontend/src/hooks/asset/useAssetManager.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  loadAsset,
  preloadAssets,
  getCachedAsset,
  isAssetLoaded,
  clearAsset,
  getCacheStats,
  AssetLibrary,
  AssetType,
  AssetSource
} from '@/services/assetManager';

/**
 * Hook for managing assets
 * @param {string} libraryName - Optional library name
 * @param {Object} options - Hook options
 */
export function useAssetManager(libraryName = null, options = {}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loadedAssets, setLoadedAssets] = useState(new Set());
  const [library, setLibrary] = useState(null);

  // Initialize library if name provided
  useEffect(() => {
    if (libraryName) {
      const lib = new AssetLibrary(libraryName, options);
      setLibrary(lib);
    }
  }, [libraryName, options]);

  /**
   * Load single asset
   */
  const load = useCallback(async (assetId, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const asset = await loadAsset(assetId, config);
      setLoadedAssets(prev => new Set([...prev, assetId]));
      return asset;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load multiple assets
   */
  const loadMany = useCallback(async (assets, onProgress = null) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const results = await preloadAssets(assets, (progress) => {
        setProgress(progress.percentage);
        onProgress?.(progress);
      });

      const loadedIds = Array.from(results.entries())
        .filter(([_, r]) => r.success)
        .map(([id, _]) => id);

      setLoadedAssets(prev => new Set([...prev, ...loadedIds]));
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get asset
   */
  const get = useCallback((assetId) => {
    return getCachedAsset(assetId);
  }, []);

  /**
   * Check if asset is loaded
   */
  const checkLoaded = useCallback((assetId) => {
    return isAssetLoaded(assetId);
  }, []);

  /**
   * Clear asset
   */
  const clear = useCallback((assetId) => {
    clearAsset(assetId);
    setLoadedAssets(prev => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
  }, []);

  /**
   * Get cache stats
   */
  const stats = useMemo(() => getCacheStats(), [loadedAssets]);

  /**
   * Add asset to library
   */
  const addToLibrary = useCallback((assetId, config) => {
    if (!library) return;
    library.add(assetId, config);
    setLibrary({ ...library });
  }, [library]);

  /**
   * Get assets from library
   */
  const getFromLibrary = useCallback((assetId) => {
    return library?.get(assetId) || null;
  }, [library]);

  /**
   * Search library
   */
  const searchLibrary = useCallback((query, filters = {}) => {
    return library?.search(query, filters) || [];
  }, [library]);

  /**
   * Get all library assets
   */
  const getAllFromLibrary = useCallback(() => {
    return library?.getAll() || [];
  }, [library]);

  return {
    loading,
    progress,
    error,
    loadedAssets,
    library,
    load,
    loadMany,
    get,
    checkLoaded,
    clear,
    stats,
    addToLibrary,
    getFromLibrary,
    searchLibrary,
    getAllFromLibrary
  };
}

/**
 * Hook for image assets
 */
export function useImageAssets(libraryName = 'images') {
  const assetManager = useAssetManager(libraryName, { type: AssetType.IMAGE });

  const loadImages = useCallback(async (imageConfigs) => {
    const assets = imageConfigs.map(config => ({
      ...config,
      type: AssetType.IMAGE
    }));
    return await assetManager.loadMany(assets);
  }, [assetManager]);

  return {
    ...assetManager,
    loadImages
  };
}

/**
 * Hook for font assets
 */
export function useFontAssets(fonts = []) {
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const loadFonts = useCallback(async () => {
    setLoading(true);
    const promises = fonts.map(async (font) => {
      try {
        const fontFace = new FontFace(font.name, `url(${font.url})`);
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
        setLoadedFonts(prev => new Set([...prev, font.name]));
        return { success: true, name: font.name };
      } catch (error) {
        return { success: false, name: font.name, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    setLoading(false);
    return results;
  }, [fonts]);

  useEffect(() => {
    if (fonts.length > 0) {
      loadFonts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loadedFonts: Array.from(loadedFonts),
    loading,
    loadFonts
  };
}

/**
 * Hook for background assets
 */
export function useBackgrounds() {
  return useAssetManager('backgrounds', {
    type: AssetType.IMAGE,
    category: 'background'
  });
}

/**
 * Hook for template assets
 */
export function useTemplates() {
  return useAssetManager('templates', {
    type: AssetType.IMAGE,
    category: 'template'
  });
}

/**
 * Hook for overlay assets
 */
export function useOverlays() {
  return useAssetManager('overlays', {
    type: AssetType.IMAGE,
    category: 'overlay'
  });
}

/**
 * Hook for watermark assets
 */
export function useWatermarks() {
  return useAssetManager('watermarks', {
    type: AssetType.IMAGE,
    category: 'watermark'
  });
}

/**
 * Hook for filter presets
 */
export function useFilters() {
  return useAssetManager('filters', {
    type: AssetType.LUT,
    category: 'filter'
  });
}

/**
 * Hook for sound assets
 */
export function useSounds() {
  const assetManager = useAssetManager('sounds', {
    type: AssetType.AUDIO,
    category: 'sound'
  });

  const [playingId, setPlayingId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const play = useCallback(async (assetId) => {
    const audio = await assetManager.load(assetId, { type: AssetType.AUDIO });
    if (audioElement) {
      audioElement.pause();
    }
    audio.currentTime = 0;
    await audio.play();
    setAudioElement(audio);
    setPlayingId(assetId);

    audio.onended = () => {
      setPlayingId(null);
      setAudioElement(null);
    };

    return audio;
  }, [assetManager, audioElement]);

  const stop = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setPlayingId(null);
      setAudioElement(null);
    }
  }, [audioElement]);

  return {
    ...assetManager,
    playingId,
    play,
    stop
  };
}

export default useAssetManager;
