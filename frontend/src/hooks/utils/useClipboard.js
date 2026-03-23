// frontend/src/hooks/utils/useClipboard.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for clipboard operations
 * @param {Object} options
 */
export function useClipboard(options = {}) {
  const {
    timeout = 2000,
    onCopy,
    onError,
    autoReset = true
  } = options;

  const [copiedText, setCopiedText] = useState(null);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Check clipboard API support
  const isSupported = typeof navigator !== 'undefined' && navigator.clipboard;

  // Copy text to clipboard
  const copy = useCallback(async (text) => {
    if (!text) {
      setError('No text provided');
      return false;
    }

    setIsCopying(true);
    setError(null);

    try {
      if (isSupported) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          throw new Error('Failed to copy text');
        }
        
        document.body.removeChild(textarea);
      }

      setCopiedText(text);
      setHistory(prev => [...prev.slice(-9), { text, timestamp: Date.now() }]);
      onCopy?.(text);

      if (autoReset) {
        setTimeout(() => {
          setCopiedText(null);
        }, timeout);
      }

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to copy';
      setError(errorMessage);
      onError?.(err);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [isSupported, timeout, autoReset, onCopy, onError]);

  // Read text from clipboard
  const paste = useCallback(async () => {
    setError(null);

    try {
      if (isSupported) {
        const text = await navigator.clipboard.readText();
        return text;
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to paste';
      setError(errorMessage);
      throw err;
    }
  }, [isSupported]);

  // Clear clipboard history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Get item from history
  const getFromHistory = useCallback((index) => {
    return history[history.length - 1 - index] || null;
  }, [history]);

  return {
    copiedText,
    isCopying,
    error,
    history,
    copy,
    paste,
    clearHistory,
    getFromHistory,
    isSupported
  };
}

/**
 * Hook for copying image to clipboard
 */
export function useClipboardImage() {
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState(null);

  const copyImage = useCallback(async (canvasOrBlob) => {
    setIsCopying(true);
    setError(null);

    try {
      let blob;
      
      if (canvasOrBlob instanceof HTMLCanvasElement) {
        blob = await new Promise(resolve => canvasOrBlob.toBlob(resolve, 'image/png'));
      } else if (canvasOrBlob instanceof Blob) {
        blob = canvasOrBlob;
      } else {
        throw new Error('Invalid input: expected Canvas or Blob');
      }

      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to copy image');
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  return {
    isCopying,
    error,
    copyImage
  };
}

/**
 * Hook for clipboard event listeners
 */
export function useClipboardEvents(options = {}) {
  const {
    onPaste,
    onCut,
    onCopy
  } = options;

  useEffect(() => {
    const handlePaste = async (e) => {
      if (onPaste) {
        e.preventDefault();
        const items = e.clipboardData?.items;
        
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const blob = item.getAsFile();
              onPaste({ type: 'image', blob });
              return;
            } else if (item.type === 'text/plain') {
              item.getAsString((text) => {
                onPaste({ type: 'text', text });
              });
              return;
            }
          }
        }
      }
    };

    const handleCut = (e) => {
      onCut?.(e);
    };

    const handleCopy = (e) => {
      onCopy?.(e);
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('cut', handleCut);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('copy', handleCopy);
    };
  }, [onPaste, onCut, onCopy]);
}

/**
 * HOC for adding clipboard functionality to components
 */
export function withClipboard(WrappedComponent) {
  return function ClipboardWrappedComponent(props) {
    const clipboard = useClipboard();
    return <WrappedComponent {...props} clipboard={clipboard} />;
  };
}

export default useClipboard;
