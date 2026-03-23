// frontend/src/components/ui/Popover.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function Popover({ 
  trigger, 
  children, 
  side = 'bottom', 
  align = 'center',
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute z-[100] mt-2 rounded-2xl bg-editor-card border border-editor-border shadow-elevated p-4 min-w-[200px] backdrop-blur-xl",
              side === 'top' && "bottom-full mb-2",
              side === 'bottom' && "top-full mt-2",
              side === 'left' && "right-full mr-2 top-0",
              side === 'right' && "left-full ml-2 top-0",
              align === 'center' && "left-1/2 -translate-x-1/2",
              align === 'end' && "right-0",
              align === 'start' && "left-0",
              className
            )}
          >
            {/* Arrow indicator would go here */}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
