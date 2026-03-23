// frontend/src/hooks/utils/useKeyboard.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for handling keyboard events and shortcuts
 * @param {Object} options - Hook options
 */
export function useKeyboard(options = {}) {
  const {
    onKeyPress,
    onKeyDown,
    onKeyUp,
    shortcuts = {},
    preventDefault = true,
    target = typeof window !== 'undefined' ? window : null
  } = options;

  const [pressedKeys, setPressedKeys] = useState(new Set());
  const shortcutsRef = useRef(shortcuts);
  const pressedKeysRef = useRef(new Set());

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Handle key down
  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    
    // Track pressed keys
    pressedKeysRef.current.add(key);
    setPressedKeys(new Set(pressedKeysRef.current));

    // Check for shortcut matches
    const shortcut = shortcutsRef.current[key];
    if (shortcut) {
      const modifiers = shortcut.modifiers || [];
      const hasAllModifiers = modifiers.every(mod => {
        if (mod === 'ctrl' || mod === 'cmd') return e.ctrlKey || e.metaKey;
        if (mod === 'shift') return e.shiftKey;
        if (mod === 'alt') return e.altKey;
        return false;
      });

      if (hasAllModifiers) {
        if (preventDefault) {
          e.preventDefault();
        }
        shortcut.action?.(e);
      }
    }

    // Call custom handler
    onKeyDown?.(e);

    // Call generic key press handler
    onKeyPress?.(e);
  }, [onKeyPress, onKeyDown, preventDefault]);

  // Handle key up
  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    
    // Remove from pressed keys
    pressedKeysRef.current.delete(key);
    setPressedKeys(new Set(pressedKeysRef.current));

    // Call custom handler
    onKeyUp?.(e);
  }, [onKeyUp]);

  // Set up event listeners
  useEffect(() => {
    if (!target) return;

    target.addEventListener('keydown', handleKeyDown);
    target.addEventListener('keyup', handleKeyUp);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
    };
  }, [target, handleKeyDown, handleKeyUp]);

  // Check if a key is currently pressed
  const isKeyPressed = useCallback((key) => {
    return pressedKeysRef.current.has(key.toLowerCase());
  }, []);

  // Check if multiple keys are pressed
  const areKeysPressed = useCallback((...keys) => {
    return keys.every(key => pressedKeysRef.current.has(key.toLowerCase()));
  }, []);

  // Register a shortcut dynamically
  const registerShortcut = useCallback((key, action, modifiers = []) => {
    shortcutsRef.current[key.toLowerCase()] = { action, modifiers };
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((key) => {
    delete shortcutsRef.current[key.toLowerCase()];
  }, []);

  return {
    pressedKeys: Array.from(pressedKeys),
    isKeyPressed,
    areKeysPressed,
    registerShortcut,
    unregisterShortcut
  };
}

/**
 * Hook for handling specific keyboard shortcuts
 * @param {Array<Object>} shortcutDefs - Array of shortcut definitions
 */
export function useShortcuts(shortcutDefs) {
  const shortcuts = {};

  shortcutDefs.forEach(({ key, action, modifiers = [], preventDefault: pd = true }) => {
    shortcuts[key.toLowerCase()] = {
      action: (e) => {
        if (pd) e.preventDefault();
        action(e);
      },
      modifiers
    };
  });

  return useKeyboard({ shortcuts });
}

/**
 * Common keyboard shortcuts preset
 */
export const commonShortcuts = {
  undo: { key: 'z', modifiers: ['ctrl'] },
  redo: { key: 'z', modifiers: ['ctrl', 'shift'] },
  save: { key: 's', modifiers: ['ctrl'] },
  open: { key: 'o', modifiers: ['ctrl'] },
  copy: { key: 'c', modifiers: ['ctrl'] },
  paste: { key: 'v', modifiers: ['ctrl'] },
  cut: { key: 'x', modifiers: ['ctrl'] },
  selectAll: { key: 'a', modifiers: ['ctrl'] },
  deselect: { key: 'a', modifiers: ['ctrl', 'shift'] },
  duplicate: { key: 'd', modifiers: ['ctrl'] },
  delete: { key: 'delete' },
  zoomIn: { key: '+', modifiers: ['ctrl'] },
  zoomOut: { key: '-', modifiers: ['ctrl'] },
  zoomFit: { key: '0', modifiers: ['ctrl'] },
  fullscreen: { key: 'f11' },
  help: { key: '/', modifiers: ['ctrl'] },
  search: { key: 'f', modifiers: ['ctrl'] },
  find: { key: 'f', modifiers: ['ctrl'] }
};

export default useKeyboard;
