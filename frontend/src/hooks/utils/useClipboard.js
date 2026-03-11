// frontend/src/hooks/utils/useClipboard.js
import { useState, useCallback, useEffect } from 'react';

export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  const copy = useCallback(async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setIsCopied(true);
      setError(null);
      
      setTimeout(() => setIsCopied(false), timeout);
      return true;
    } catch (err) {
      setError(err.message);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  const copyImage = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setIsCopied(true);
        setError(null);
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      } else {
        setError('Clipboard API not available');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [timeout]);

  const paste = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText();
      } else {
        setError('Clipboard API not available');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const pasteImage = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          if (item.types.find(type => type.startsWith('image/'))) {
            const blob = await item.getType(item.types.find(type => type.startsWith('image/')));
            return URL.createObjectURL(blob);
          }
        }
      }
      setError('Clipboard API not available');
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isCopied,
    error,
    copy,
    copyImage,
    paste,
    pasteImage,
    clearError
  };
}

export default useClipboard;
