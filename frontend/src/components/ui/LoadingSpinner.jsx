// frontend/src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const sizes = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4'
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  label
}) {
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    current: 'border-current'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className={cn(
          'rounded-full border-t-transparent',
          sizes[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {label && (
        <span className="text-sm text-surface-400">{label}</span>
      )}
    </div>
  );
}

// Full screen loading
export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-editor-bg z-50">
      <div className="text-center">
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-2">{message}</h3>
          <p className="text-sm text-surface-500">Please wait...</p>
        </motion.div>
      </div>
    </div>
  );
}