// frontend/src/components/ui/Modal.jsx
import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from './Button';

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw]'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as="div"
          className="relative z-50"
          open={isOpen}
          onClose={closeOnOverlay ? onClose : () => {}}
          static
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full flex justify-center"
            >
              <Dialog.Panel
                className={cn(
                  'w-full bg-editor-card rounded-2xl shadow-elevated',
                  'border border-editor-border overflow-hidden',
                  modalSizes[size],
                  className
                )}
              >
                {/* Header */}
                {(title || showClose) && (
                  <div className="flex items-center justify-between p-6 border-b border-editor-border">
                    <div>
                      {title && (
                        <Dialog.Title className="text-lg font-semibold text-white">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-surface-400">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    
                    {showClose && (
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-dark">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-editor-border bg-editor-surface/50">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

// Dialog Components for convenience
Modal.Header = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

Modal.Body = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

Modal.Footer = ({ children, className }) => (
  <div className={cn('flex items-center justify-end gap-3 mt-6', className)}>
    {children}
  </div>
);