// frontend/src/components/ui/Avatar.jsx
import React from 'react';
import { cn } from '@/utils/helpers/cn';

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl'
};

const avatarVariants = {
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  secondary: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
};

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  variant = 'primary',
  className,
  showStatus = false,
  status = 'online',
  ...props
}) {
  const [imageError, setImageError] = React.useState(false);

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-surface-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden border-2',
        avatarSizes[size],
        avatarVariants[variant],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        <span className="font-semibold">{fallback}</span>
      ) : (
        <span className="font-semibold">{(alt || 'U').charAt(0).toUpperCase()}</span>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-editor-card',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}
