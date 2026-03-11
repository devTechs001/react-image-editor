// frontend/src/components/ui/Slider.jsx
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/helpers/cn';

export default function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showTooltip = false,
  label,
  formatValue,
  onValueChange,
  ...props
}) {
  const [localValue, setLocalValue] = React.useState(value || defaultValue || [min]);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleValueChange = (newValue) => {
    setLocalValue(newValue);
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : localValue;

  return (
    <div className={cn('w-full', className)}>
      {(label || showTooltip) && (
        <div className="flex items-center justify-between mb-2">
          {label && <label className="text-sm font-medium text-surface-300">{label}</label>}
          {showTooltip && (
            <span className="text-xs font-mono text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded">
              {formatValue ? formatValue(currentValue[0]) : currentValue[0]}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        value={currentValue}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-surface-700">
          <SliderPrimitive.Range
            className="absolute h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            style={{
              background: isDragging
                ? 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                : undefined
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary-500 bg-editor-card',
            'shadow-glow transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-editor-bg',
            isDragging && 'scale-125 shadow-glow-lg'
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}
