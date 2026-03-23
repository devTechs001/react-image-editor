// frontend/src/components/filters/ColorBalance.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Slider from '@/components/ui/Slider';
import Button from '@/components/ui/Button';

export default function ColorBalance({ onApply, onClose }) {
  const [values, setValues] = useState({
    shadowsCyan: 0,
    shadowsMagenta: 0,
    shadowsYellow: 0,
    midtonesCyan: 0,
    midtonesMagenta: 0,
    midtonesYellow: 0,
    highlightsCyan: 0,
    highlightsMagenta: 0,
    highlightsYellow: 0,
    preserveLuminosity: true
  });

  const handleSliderChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setValues({
      shadowsCyan: 0,
      shadowsMagenta: 0,
      shadowsYellow: 0,
      midtonesCyan: 0,
      midtonesMagenta: 0,
      midtonesYellow: 0,
      highlightsCyan: 0,
      highlightsMagenta: 0,
      highlightsYellow: 0,
      preserveLuminosity: true
    });
  };

  const apply = () => {
    onApply?.(values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Color Balance
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={reset}>
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Shadows */}
      <div className="space-y-3 p-3 bg-surface-800/50 rounded-xl">
        <h4 className="text-xs font-medium text-surface-300">Shadows</h4>
        <div className="space-y-3">
          <ColorSlider
            label="Cyan / Red"
            value={values.shadowsCyan}
            onChange={(v) => handleSliderChange('shadowsCyan', v)}
            min={-100}
            max={100}
            negativeColor="#ef4444"
            positiveColor="#06b6d4"
          />
          <ColorSlider
            label="Magenta / Green"
            value={values.shadowsMagenta}
            onChange={(v) => handleSliderChange('shadowsMagenta', v)}
            min={-100}
            max={100}
            negativeColor="#a855f7"
            positiveColor="#22c55e"
          />
          <ColorSlider
            label="Yellow / Blue"
            value={values.shadowsYellow}
            onChange={(v) => handleSliderChange('shadowsYellow', v)}
            min={-100}
            max={100}
            negativeColor="#eab308"
            positiveColor="#3b82f6"
          />
        </div>
      </div>

      {/* Midtones */}
      <div className="space-y-3 p-3 bg-surface-800/50 rounded-xl">
        <h4 className="text-xs font-medium text-surface-300">Midtones</h4>
        <div className="space-y-3">
          <ColorSlider
            label="Cyan / Red"
            value={values.midtonesCyan}
            onChange={(v) => handleSliderChange('midtonesCyan', v)}
            min={-100}
            max={100}
            negativeColor="#ef4444"
            positiveColor="#06b6d4"
          />
          <ColorSlider
            label="Magenta / Green"
            value={values.midtonesMagenta}
            onChange={(v) => handleSliderChange('midtonesMagenta', v)}
            min={-100}
            max={100}
            negativeColor="#a855f7"
            positiveColor="#22c55e"
          />
          <ColorSlider
            label="Yellow / Blue"
            value={values.midtonesYellow}
            onChange={(v) => handleSliderChange('midtonesYellow', v)}
            min={-100}
            max={100}
            negativeColor="#eab308"
            positiveColor="#3b82f6"
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3 p-3 bg-surface-800/50 rounded-xl">
        <h4 className="text-xs font-medium text-surface-300">Highlights</h4>
        <div className="space-y-3">
          <ColorSlider
            label="Cyan / Red"
            value={values.highlightsCyan}
            onChange={(v) => handleSliderChange('highlightsCyan', v)}
            min={-100}
            max={100}
            negativeColor="#ef4444"
            positiveColor="#06b6d4"
          />
          <ColorSlider
            label="Magenta / Green"
            value={values.highlightsMagenta}
            onChange={(v) => handleSliderChange('highlightsMagenta', v)}
            min={-100}
            max={100}
            negativeColor="#a855f7"
            positiveColor="#22c55e"
          />
          <ColorSlider
            label="Yellow / Blue"
            value={values.highlightsYellow}
            onChange={(v) => handleSliderChange('highlightsYellow', v)}
            min={-100}
            max={100}
            negativeColor="#eab308"
            positiveColor="#3b82f6"
          />
        </div>
      </div>

      {/* Preserve Luminosity */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-surface-400">Preserve Luminosity</label>
        <input
          type="checkbox"
          checked={values.preserveLuminosity}
          onChange={(e) => setValues(s => ({ ...s, preserveLuminosity: e.target.checked }))}
          className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-500 focus:ring-primary-500"
        />
      </div>

      {/* Apply Button */}
      <Button variant="primary" size="lg" fullWidth onClick={apply}>
        Apply Color Balance
      </Button>
    </div>
  );
}

function ColorSlider({ label, value, onChange, min, max, negativeColor, positiveColor }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-surface-400">{label}</span>
        <span className={cn(
          'font-mono',
          value < 0 ? 'text-red-400' : value > 0 ? 'text-blue-400' : 'text-surface-400'
        )}>
          {value > 0 ? '+' : ''}{value}
        </span>
      </div>
      <div className="relative h-2 bg-surface-700 rounded-full">
        <div
          className="absolute inset-y-0 left-1/2 rounded-full"
          style={{
            left: value < 0 ? `${50 + (value / (max - min) * 100)}%` : '50%',
            right: value > 0 ? `${50 - (value / (max - min) * 100)}%` : '50%',
            background: value < 0 
              ? `linear-gradient(to right, ${negativeColor}, transparent)`
              : `linear-gradient(to left, ${positiveColor}, transparent)`
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(50% + ${(value / (max - min)) * 100}% - 8px)` }}
        />
      </div>
    </div>
  );
}
