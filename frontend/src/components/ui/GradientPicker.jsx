// frontend/src/components/ui/GradientPicker.jsx
import React, { useState } from 'react';
import { Plus, Trash2, RotateCw, Palette } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { cn } from '@/utils/helpers/cn';

export default function GradientPicker({ value, onChange, className }) {
  const [stops, setStops] = useState(value?.stops || [
    { color: '#6366f1', offset: 0 },
    { color: '#8b5cf6', offset: 100 }
  ]);
  const [angle, setAngle] = useState(value?.angle || 90);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const updateStop = (index, updates) => {
    const nextStops = [...stops];
    nextStops[index] = { ...nextStops[index], ...updates };
    setStops(nextStops);
    onChange?.({ stops: nextStops, angle });
  };

  const addStop = () => {
    const nextStops = [...stops];
    const lastStop = nextStops[nextStops.length - 1];
    nextStops.push({ color: lastStop.color, offset: Math.min(100, lastStop.offset + 10) });
    setStops(nextStops);
    onChange?.({ stops: nextStops, angle });
  };

  const removeStop = (index) => {
    if (stops.length <= 2) return;
    const nextStops = stops.filter((_, i) => i !== index);
    setStops(nextStops);
    setActiveStopIndex(0);
    onChange?.({ stops: nextStops, angle });
  };

  const gradientPreview = `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`;

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Visual Preview */}
      <div 
        className="h-16 sm:h-24 w-full rounded-xl sm:rounded-2xl border-2 border-editor-border shadow-inner relative group"
        style={{ background: gradientPreview }}
      >
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg backdrop-blur-md">
            Gradient Preview
          </span>
        </div>
      </div>

      {/* Stop Slider */}
      <div className="relative h-10 sm:h-12 flex items-center px-2">
        <div className="absolute left-2 right-2 h-1.5 sm:h-2 rounded-full bg-surface-800 border border-surface-700 overflow-hidden">
          <div className="w-full h-full" style={{ background: `linear-gradient(90deg, ${stops.map(s => `${s.color} ${s.offset}%`).join(', ')})` }} />
        </div>
        {stops.map((stop, i) => (
          <button
            key={i}
            onClick={() => setActiveStopIndex(i)}
            style={{ left: `${stop.offset}%` }}
            className={cn(
              "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-transform hover:scale-125 z-10",
              activeStopIndex === i ? "border-white scale-125 shadow-glow" : "border-surface-400"
            )}
          >
            <div className="w-full h-full rounded-full" style={{ backgroundColor: stop.color }} />
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest">
            <span>Angle</span>
            <span className="text-primary-400">{angle}°</span>
          </div>
          <input 
            type="range" min="0" max="360" value={angle}
            onChange={(e) => {
              setAngle(Number(e.target.value));
              onChange?.({ stops, angle: Number(e.target.value) });
            }}
            className="range-slider"
          />
        </div>
        
        <div className="flex items-end gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <button onClick={addStop} className="flex-1 sm:flex-initial sm:w-auto p-2 sm:p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-white transition-all flex items-center justify-center">
            <Plus size={14} sm:size-16 />
          </button>
          <button 
            onClick={() => removeStop(activeStopIndex)}
            disabled={stops.length <= 2}
            className="flex-1 sm:flex-initial sm:w-auto p-2 sm:p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-red-400 disabled:opacity-30 transition-all flex items-center justify-center"
          >
            <Trash2 size={14} sm:size-16 />
          </button>
        </div>
      </div>

      {/* Stop Editor */}
      <div className="pt-3 sm:pt-4 border-t border-editor-border space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Palette size={12} sm:size-14 className="text-primary-400" />
          <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">Stop {activeStopIndex + 1} Color</span>
        </div>
        <ColorPicker 
          color={stops[activeStopIndex].color} 
          onChange={(color) => updateStop(activeStopIndex, { color })} 
        />
      </div>
    </div>
  );
}
