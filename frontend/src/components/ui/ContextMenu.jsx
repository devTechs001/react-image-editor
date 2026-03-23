// frontend/src/components/ui/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function ContextMenu({ x, y, items, onClose, className }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off-screen
  const adjustedX = Math.min(x, window.innerWidth - (window.innerWidth < 640 ? 160 : 200));
  const adjustedY = Math.min(y, window.innerHeight - (items.length * (window.innerWidth < 640 ? 36 : 40) + 20));

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: adjustedX, top: adjustedY }}
        className={cn(
          "fixed z-[9999] w-40 sm:w-48 py-1.5 rounded-xl bg-editor-card border border-editor-border shadow-elevated backdrop-blur-xl",
          className
        )}
      >
        {items.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="h-px bg-editor-border my-1 mx-2" />;
          }
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 text-xs sm:text-sm transition-colors",
                item.variant === 'danger' 
                  ? "text-red-400 hover:bg-red-500/10" 
                  : "text-surface-300 hover:bg-white/5 hover:text-white",
                item.disabled && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              {Icon && <Icon size={14} sm:size-16 />}
              <span className="flex-1 text-left font-medium text-xs sm:text-sm">{item.label}</span>
              {item.shortcut && (
                <span className="text-[8px] sm:text-[10px] font-bold text-surface-600 uppercase tracking-widest">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
