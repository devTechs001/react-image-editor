// frontend/src/components/ui/Switch.jsx
import React, { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const Switch = forwardRef(({
  className,
  label,
  description,
  checked,
  onCheckedChange,
  size = 'md',
  variant = 'default',
  disabled = false,
  ...props
}, ref) => {
  const sizes = {
    sm: {
      root: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      root: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5'
    },
    lg: {
      root: 'h-7 w-14',
      thumb: 'h-6 w-6',
      translate: 'translate-x-7'
    }
  };

  const variants = {
    default: 'data-[state=checked]:bg-primary-500',
    success: 'data-[state=checked]:bg-emerald-500',
    warning: 'data-[state=checked]:bg-amber-500',
    danger: 'data-[state=checked]:bg-red-500'
  };

  const sizeStyles = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SwitchPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent transition-all duration-200',
          'bg-surface-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-editor-bg',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeStyles.root,
          variants[variant]
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
            'data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary-500/30',
            sizeStyles.thumb,
            `data-[state=checked]:${sizeStyles.translate}`,
            'data-[state=unchecked]:translate-x-0.5'
          )}
        />
      </SwitchPrimitive.Root>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={cn(
              'text-sm font-medium text-surface-200',
              disabled && 'text-surface-500'
            )}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-surface-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;