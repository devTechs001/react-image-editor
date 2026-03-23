// frontend/src/components/layout/ResizablePanel.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function ResizablePanel({
  children,
  direction = 'horizontal',
  initialSize = 300,
  minSize = 150,
  maxSize = 600,
  onResize,
  className,
  showHandle = true
}) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  const startResizing = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing) {
        let newSize;
        if (direction === 'horizontal') {
          newSize = e.clientX;
          // If panel is on the right, calculation might differ, but for general use:
          const rect = panelRef.current?.getBoundingClientRect();
          if (rect && rect.left > window.innerWidth / 2) {
            newSize = window.innerWidth - e.clientX;
          }
        } else {
          newSize = e.clientY;
        }

        if (newSize >= minSize && newSize <= maxSize) {
          setSize(newSize);
          onResize?.(newSize);
        }
      }
    },
    [isResizing, direction, minSize, maxSize, onResize]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div
      ref={panelRef}
      className={cn(
        'relative flex flex-shrink-0',
        direction === 'horizontal' ? 'h-full' : 'w-full',
        className
      )}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: size,
      }}
    >
      <div className="flex-1 overflow-hidden">{children}</div>
      
      {showHandle && (
        <div
          onMouseDown={startResizing}
          className={cn(
            'absolute z-50 transition-colors hover:bg-primary-500/50',
            direction === 'horizontal'
              ? 'right-0 top-0 bottom-0 w-1 cursor-col-resize'
              : 'bottom-0 left-0 right-0 h-1 cursor-row-resize',
            isResizing && 'bg-primary-500'
          )}
        />
      )}
    </div>
  );
}
