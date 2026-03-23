// frontend/src/components/ui/Skeleton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  animation = 'shimmer',
  ...props
}) {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded'
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-surface-800',
        variants[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'circle' ? '100%' : '1rem')
      }}
      {...props}
    >
      {animation === 'shimmer' && (
        <motion.div
          className="w-full h-full"
          animate={{
            backgroundPosition: ['-200% 0', '200% 0']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            backgroundSize: '200% 100%'
          }}
        />
      )}

      {animation === 'pulse' && (
        <motion.div
          className="w-full h-full"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {animation === 'wave' && (
        <motion.div
          className="w-full h-full relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// Skeleton Text Component
export function SkeletonText({ lines = 3, gap = 'gap-2', className }) {
  return (
    <div className={cn('flex flex-col', gap, className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="0.875rem"
          className={cn(
            i === lines - 1 && 'w-3/4',
            i === 0 && 'w-full',
            i > 0 && i < lines - 1 && 'w-5/6'
          )}
        />
      ))}
    </div>
  );
}

// Skeleton Image Component
export function SkeletonImage({ className, aspectRatio = 'square' }) {
  const ratios = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <Skeleton
      className={cn(ratios[aspectRatio], className)}
      animation="shimmer"
    />
  );
}

// Skeleton Avatar Component
export function SkeletonAvatar({ size = 'md' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circle"
      className={cn(sizes[size])}
      animation="pulse"
    />
  );
}

// Skeleton Card Component
export function SkeletonCard({ showImage = true, showTitle = true, showFooter = true }) {
  return (
    <div className="p-4 space-y-4">
      {showImage && (
        <SkeletonImage aspectRatio="video" />
      )}
      {showTitle && (
        <div className="space-y-2">
          <Skeleton variant="text" height="1.25rem" className="w-3/4" />
          <Skeleton variant="text" height="0.875rem" className="w-full" />
        </div>
      )}
      {showFooter && (
        <div className="flex items-center gap-2 pt-2">
          <SkeletonAvatar size="sm" />
          <div className="flex-1">
            <Skeleton variant="text" height="0.75rem" className="w-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton List Component
export function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <div className="flex-1">
            <Skeleton variant="text" height="0.875rem" className="w-2/3" />
          </div>
          <Skeleton variant="rect" width="4rem" height="1.5rem" />
        </div>
      ))}
    </div>
  );
}

// Skeleton Table Component
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="0.75rem" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" height="0.875rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton Grid Component
export function SkeletonGrid({ items = 8, columns = 4 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
