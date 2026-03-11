// frontend/src/components/ui/Slider.jsx
import React, { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/helpers/cn';

const Slider = forwardRef(({
  className,
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const currentValue = value?.[0] ?? 0;

  const trackSizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const thumbSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const variants = {
    default: {
      track: 'bg-surface-700',
      range: 'bg-gradient-to-r from-primary-500 to-secondary-500',
      thumb: 'bg-white border-2 border-primary-500'
    },
    success: {
      track: 'bg-surface-700',
      range: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      thumb: 'bg-white border-2 border-emerald-500'
    },
    warning: {
      track: 'bg-surface-700',
      range: 'bg-gradient-to-r from-amber-500 to-orange-500',
      thumb: 'bg-white border-2 border-amber-500'
    },
    danger: {
      track: 'bg-surface-700',
      range: 'bg-gradient-to-r from-red-500 to-rose-500',
      thumb: 'bg-white border-2 border-red-500'
    }
  };

  const variantStyles = variants[variant];

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-surface-300">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-mono text-primary-400">
              {valuePrefix}{currentValue}{valueSuffix}
            </span>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        ref={ref}
        className="relative flex w-full touch-none select-none items-center"
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative w-full grow overflow-hidden rounded-full',
            trackSizes[size],
            variantStyles.track
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              'absolute h-full rounded-full',
              variantStyles.range
            )}
          />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb
          className={cn(
            'block rounded-full shadow-lg ring-offset-editor-bg transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'hover:scale-110 active:scale-95',
            'cursor-grab active:cursor-grabbing',
            thumbSizes[size],
            variantStyles.thumb
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;