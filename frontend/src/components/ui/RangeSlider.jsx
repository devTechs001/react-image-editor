// frontend/src/components/ui/RangeSlider.jsx
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/helpers/cn';

export default function RangeSlider({ 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onValueChange, 
  label,
  className 
}) {
  return (
    <div className={cn("w-full space-y-2 sm:space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between px-1">
          <label className="text-[8px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest">{label}</label>
          <span className="text-[8px] sm:text-[10px] font-bold text-primary-400 tabular-nums">
            {value[0]}
            {value.length > 1 && ` - ${value[1]}`}
          </span>
        </div>
      )}
      
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-4 sm:h-5"
        value={value}
        max={max}
        min={min}
        step={step}
        onValueChange={onValueChange}
      >
        <SliderPrimitive.Track className="bg-surface-800 border border-surface-700 relative grow rounded-full h-1 sm:h-1.5 overflow-hidden">
          <SliderPrimitive.Range className="absolute bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full" />
        </SliderPrimitive.Track>
        
        {value.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block w-3 h-3 sm:w-4 sm:h-4 bg-white shadow-glow border-2 border-primary-500 rounded-full hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-transform cursor-grab active:cursor-grabbing"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}
