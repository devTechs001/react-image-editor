// frontend/src/hooks/utils/useKeyboard.js
import { useEffect, useCallback, useRef } from 'react';

export function useKeyboard(shortcuts = {}, options = {}) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);
  
  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    
    // Build shortcut key
    const parts = [];
    if (ctrlKey || metaKey) parts.push('mod');
    if (shiftKey) parts.push('shift');
    if (altKey) parts.push('alt');
    parts.push(key.toLowerCase());
    
    const shortcutKey = parts.join('+');
    const handler = shortcutsRef.current[shortcutKey];

    if (handler) {
      if (preventDefault) {
        event.preventDefault();
      }
      handler(event);
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Special handler for input fields
  const useInputKeyboard = useCallback((inputRef, inputShortcuts = {}) => {
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const handleInputKeyDown = (event) => {
        const { key } = event;
        const handler = inputShortcuts[key];
        
        if (handler) {
          event.preventDefault();
          handler(event);
        }
      };

      input.addEventListener('keydown', handleInputKeyDown);
      return () => {
        input.removeEventListener('keydown', handleInputKeyDown);
      };
    }, [inputRef, inputShortcuts]);
  }, []);

  return { useInputKeyboard };
}

// Common keyboard shortcuts
export const commonShortcuts = {
  undo: 'mod+z',
  redo: 'mod+shift+z',
  save: 'mod+s',
  copy: 'mod+c',
  paste: 'mod+v',
  cut: 'mod+x',
  selectAll: 'mod+a',
  delete: 'delete',
  backspace: 'backspace',
  zoomIn: 'mod+plus',
  zoomOut: 'mod+minus',
  resetZoom: 'mod+0',
  fitToScreen: 'mod+1'
};

export default useKeyboard;
