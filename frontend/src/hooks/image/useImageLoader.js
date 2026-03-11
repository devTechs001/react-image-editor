// frontend/src/hooks/image/useImageLoader.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for loading images
 * @param {Object} options - Loading options
 */
export function useImageLoader(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const {
    crossOrigin = 'anonymous',
    maxRetries = 3,
    timeout = 30000
  } = options;

  // Load image from URL
  const loadFromUrl = useCallback(async (url) => {
    setLoading(true);
    setError(null);

    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          mode: crossOrigin ? 'cors' : 'no-cors'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        const img = await loadImage(imageUrl, crossOrigin);
        
        setImage(img);
        setMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          size: blob.size,
          type: blob.type
        });

        setLoading(false);
        return { img, metadata: { width: img.naturalWidth, height: img.naturalHeight } };
      } catch (err) {
        retries++;
        
        if (retries >= maxRetries) {
          setError(err.message);
          setLoading(false);
          throw err;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }, [crossOrigin, maxRetries]);

  // Load image from File
  const loadFromFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = await loadImage(imageUrl, false);
      
      setImage(img);
      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        size: file.size,
        type: file.type,
        name: file.name
      });

      setLoading(false);
      return { img, metadata: { width: img.naturalWidth, height: img.naturalHeight } };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Load image from base64
  const loadFromBase64 = useCallback(async (base64) => {
    setLoading(true);
    setError(null);

    try {
      const img = await loadImage(base64, crossOrigin);
      
      setImage(img);
      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });

      setLoading(false);
      return { img, metadata: { width: img.naturalWidth, height: img.naturalHeight } };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [crossOrigin]);

  // Clear loaded image
  const clear = useCallback(() => {
    if (image) {
      URL.revokeObjectURL(image.src);
    }
    setImage(null);
    setMetadata(null);
    setError(null);
    setLoading(false);
  }, [image]);

  return {
    loading,
    error,
    image,
    metadata,
    loadFromUrl,
    loadFromFile,
    loadFromBase64,
    clear
  };
}

// Helper function to load image
function loadImage(src, crossOrigin) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export default useImageLoader;
