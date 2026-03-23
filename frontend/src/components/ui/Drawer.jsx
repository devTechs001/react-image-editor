// frontend/src/components/ui/Drawer.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right', 
  size = 320,
  className 
}) {
  const drawerVariants = {
    closed: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : position === 'top' ? '-100%' : 0,
    },
    open: {
      x: 0,
      y: 0,
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              [position]: 0,
              [(position === 'left' || position === 'right') ? 'width' : 'height']: typeof size === 'number' ? `${Math.min(size, window.innerWidth < 640 ? window.innerWidth - 16 : size)}px` : size,
              [(position === 'left' || position === 'right') ? 'height' : 'width']: '100%',
            }}
            className={cn(
              "fixed bg-editor-surface border-editor-border z-[101] shadow-elevated flex flex-col",
              position === 'right' && "border-l",
              position === 'left' && "border-r",
              position === 'top' && "border-b",
              position === 'bottom' && "border-t rounded-t-3xl",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-editor-border">
              <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-white/5 text-surface-400 hover:text-white transition-all"
              >
                <X size={16} sm:size-20 />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
