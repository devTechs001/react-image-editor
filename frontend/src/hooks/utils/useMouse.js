// frontend/src/hooks/utils/useMouse.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for tracking mouse position and events
 * @param {Object} options - Hook options
 */
export function useMouse(options = {}) {
  const {
    target = typeof window !== 'undefined' ? window : null,
    trackElement = false,
    throttle = 0
  } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const [buttons, setButtons] = useState(0);
  const lastUpdateRef = useRef(0);

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    
    // Throttle updates
    if (throttle > 0 && now - lastUpdateRef.current < throttle) {
      return;
    }
    lastUpdateRef.current = now;

    setPosition({ x: e.clientX, y: e.clientY });

    if (trackElement && target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      setElementPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [target, trackElement, throttle]);

  const handleMouseEnter = useCallback(() => {
    setIsInside(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsInside(false);
  }, []);

  const handleMouseDown = useCallback((e) => {
    setButtons(e.buttons);
  }, []);

  const handleMouseUp = useCallback((e) => {
    setButtons(e.buttons);
  }, []);

  useEffect(() => {
    if (!target) return;

    target.addEventListener('mousemove', handleMouseMove);
    target.addEventListener('mousedown', handleMouseDown);
    target.addEventListener('mouseup', handleMouseUp);

    if (trackElement && target instanceof HTMLElement) {
      target.addEventListener('mouseenter', handleMouseEnter);
      target.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      target.removeEventListener('mousemove', handleMouseMove);
      target.removeEventListener('mousedown', handleMouseDown);
      target.removeEventListener('mouseup', handleMouseUp);
      
      if (trackElement && target instanceof HTMLElement) {
        target.removeEventListener('mouseenter', handleMouseEnter);
        target.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [target, trackElement, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  return {
    position,
    elementPosition,
    isInside,
    buttons,
    isLeftDown: (buttons & 1) !== 0,
    isRightDown: (buttons & 2) !== 0,
    isMiddleDown: (buttons & 4) !== 0
  };
}

/**
 * Hook for tracking mouse clicks
 * @param {Object} options
 */
export function useClick(options = {}) {
  const {
    target = typeof window !== 'undefined' ? window : null,
    onClick,
    onDoubleClick,
    onContextMenu
  } = options;

  const [clicks, setClicks] = useState({ left: 0, right: 0, middle: 0 });
  const clickCountRef = useRef({ left: 0, right: 0, middle: 0 });

  const handleClick = useCallback((e) => {
    let button;
    if (e.button === 0) button = 'left';
    else if (e.button === 1) button = 'middle';
    else if (e.button === 2) button = 'right';
    else return;

    clickCountRef.current[button]++;
    setClicks({ ...clickCountRef.current });

    onClick?.(e);
  }, [onClick]);

  const handleDoubleClick = useCallback((e) => {
    onDoubleClick?.(e);
  }, [onDoubleClick]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    onContextMenu?.(e);
  }, [onContextMenu]);

  useEffect(() => {
    if (!target) return;

    target.addEventListener('click', handleClick);
    target.addEventListener('dblclick', handleDoubleClick);
    target.addEventListener('contextmenu', handleContextMenu);

    return () => {
      target.removeEventListener('click', handleClick);
      target.removeEventListener('dblclick', handleDoubleClick);
      target.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [target, handleClick, handleDoubleClick, handleContextMenu]);

  const resetClicks = useCallback(() => {
    clickCountRef.current = { left: 0, right: 0, middle: 0 };
    setClicks({ left: 0, right: 0, middle: 0 });
  }, []);

  return {
    clicks,
    resetClicks
  };
}

/**
 * Hook for drag and drop operations
 * @param {Object} options
 */
export function useDrag(options = {}) {
  const {
    target,
    onDragStart,
    onDrag,
    onDragEnd,
    dragThreshold = 5
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click

    const startX = e.clientX;
    const startY = e.clientY;
    setStartPosition({ x: startX, y: startY });
    setCurrentPosition({ x: startX, y: startY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    const currentX = e.clientX;
    const currentY = e.clientY;
    setCurrentPosition({ x: currentX, y: currentY });

    if (!isDraggingRef.current) {
      // Check if drag threshold is exceeded
      const dx = currentX - startPosition.x;
      const dy = currentY - startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > dragThreshold) {
        isDraggingRef.current = true;
        setIsDragging(true);
        onDragStart?.({
          startX: startPosition.x,
          startY: startPosition.y,
          initialEvent: e
        });
      }
    }

    if (isDraggingRef.current) {
      const dx = currentX - startPosition.x;
      const dy = currentY - startPosition.y;
      setDelta({ x: dx, y: dy });
      onDrag?.({
        startX: startPosition.x,
        startY: startPosition.y,
        currentX,
        currentY,
        deltaX: dx,
        deltaY: dy,
        event: e
      });
    }
  }, [startPosition, dragThreshold, onDragStart, onDrag]);

  const handleMouseUp = useCallback((e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      onDragEnd?.({
        startX: startPosition.x,
        startY: startPosition.y,
        endX: e.clientX,
        endY: e.clientY,
        deltaX: e.clientX - startPosition.x,
        deltaY: e.clientY - startPosition.y,
        event: e
      });
    }
  }, [startPosition, onDragEnd]);

  useEffect(() => {
    if (!target) return;

    target.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [target, handleMouseDown, handleMouseMove, handleMouseUp]);

  const cancelDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    startPosition,
    currentPosition,
    delta,
    cancelDrag
  };
}

/**
 * Hook for tracking hover state
 * @param {Object} options
 */
export function useHover(options = {}) {
  const {
    target,
    onHoverStart,
    onHoverEnd,
    delay = 0
  } = options;

  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsHovering(true);
        onHoverStart?.();
      }, delay);
    } else {
      setIsHovering(true);
      onHoverStart?.();
    }
  }, [delay, onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovering(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  useEffect(() => {
    if (!target) return;

    target.addEventListener('mouseenter', handleMouseEnter);
    target.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      target.removeEventListener('mouseenter', handleMouseEnter);
      target.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [target, handleMouseEnter, handleMouseLeave]);

  return { isHovering };
}

export default useMouse;
