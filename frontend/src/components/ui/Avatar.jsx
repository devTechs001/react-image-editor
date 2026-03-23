// frontend/src/components/ui/Avatar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
  '3xl': 'w-24 h-24 text-3xl'
};

const avatarVariants = {
  primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  secondary: 'bg-surface-500/20 text-surface-400 border-surface-500/30',
  gradient: 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
};

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  variant = 'primary',
  className,
  status,
  onClick,
  fallback = true
}) {
  const [imageError, setImageError] = useState(false);

  const showFallback = imageError || !src;
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-surface-500',
    busy: 'bg-red-500',
    away: 'bg-amber-500'
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={handleClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'border-2',
        avatarSizes[size],
        showFallback ? avatarVariants[variant] : '',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {showFallback ? (
        fallback ? (
          <span className="font-semibold">
            {initials || <User className={cn('w-1/2 h-1/2', size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />}
          </span>
        ) : null
      ) : (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-1/3 h-1/3 rounded-full border-2 border-editor-bg',
            statusColors[status]
          )}
        />
      )}
    </motion.div>
  );
}

// Avatar Group Component
export function AvatarGroup({ avatars, max = 4, size = 'md' }) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-editor-bg hover:z-10 transition-z"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-700 text-surface-300 font-medium',
            avatarSizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
