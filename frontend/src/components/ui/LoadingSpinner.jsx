// frontend/src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const spinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'primary',
  fullscreen = false
}) {
  const variantColors = {
    primary: 'text-primary-400',
    secondary: 'text-surface-400',
    white: 'text-white'
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={cn(spinnerSizes[size], variantColors[variant])} />
          </motion.div>
          {text && (
            <p className="mt-4 text-sm text-white font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(spinnerSizes[size], variantColors[variant])}
      >
        <Loader2 />
      </motion.div>
      {text && (
        <p className="ml-2 text-sm text-surface-400">{text}</p>
      )}
    </div>
  );
}

// Skeleton loader
export function Skeleton({ className, variant = 'rect', width, height }) {
  const variants = {
    rect: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded'
  };

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-surface-700 animate-pulse',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

// Card skeleton
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}
