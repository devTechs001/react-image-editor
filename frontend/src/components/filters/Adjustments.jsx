// frontend/src/components/filters/Adjustments.jsx
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sun, Contrast, Droplets, Thermometer, Sparkles } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

const adjustmentGroups = [
  {
    title: 'Light',
    icon: Sun,
    adjustments: [
      { key: 'brightness', label: 'Brightness', min: -100, max: 100, default: 0 },
      { key: 'exposure', label: 'Exposure', min: -100, max: 100, default: 0 },
      { key: 'contrast', label: 'Contrast', min: -100, max: 100, default: 0 },
      { key: 'highlights', label: 'Highlights', min: -100, max: 100, default: 0 },
      { key: 'shadows', label: 'Shadows', min: -100, max: 100, default: 0 },
      { key: 'whites', label: 'Whites', min: -100, max: 100, default: 0 },
      { key: 'blacks', label: 'Blacks', min: -100, max: 100, default: 0 }
    ]
  },
  {
    title: 'Color',
    icon: Droplets,
    adjustments: [
      { key: 'saturation', label: 'Saturation', min: -100, max: 100, default: 0 },
      { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, default: 0 },
      { key: 'temperature', label: 'Temperature', min: -100, max: 100, default: 0 },
      { key: 'tint', label: 'Tint', min: -100, max: 100, default: 0 }
    ]
  },
  {
    title: 'Effects',
    icon: Sparkles,
    adjustments: [
      { key: 'clarity', label: 'Clarity', min: -100, max: 100, default: 0 },
      { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, default: 0 },
      { key: 'noise', label: 'Noise Reduction', min: 0, max: 100, default: 0 },
      { key: 'vignette', label: 'Vignette', min: -100, max: 100, default: 0 }
    ]
  }
];

export default function Adjustments({ onAdjustmentChange }) {
  const { adjustments, setAdjustment, resetAdjustments } = useEditor();
  const [expandedGroup, setExpandedGroup] = React.useState('Light');

  const handleAdjustmentChange = useCallback((key, value) => {
    setAdjustment(key, value);
    onAdjustmentChange?.(key, value);
  }, [setAdjustment, onAdjustmentChange]);

  const handleReset = useCallback(() => {
    resetAdjustments();
    onAdjustmentChange?.('reset', null);
  }, [resetAdjustments, onAdjustmentChange]);

  const hasChanges = Object.values(adjustments).some(value => value !== 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border">
        <h3 className="text-sm font-semibold text-white">Adjustments</h3>
        {hasChanges && (
          <Button
            variant="ghost"
            size="xs"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Adjustment Groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
        {adjustmentGroups.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroup === group.title;
          const groupHasChanges = group.adjustments.some(
            adj => adjustments[adj.key] !== adj.default
          );

          return (
            <div key={group.title} className="border-b border-editor-border">
              {/* Group Header */}
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.title)}
                className={cn(
                  'w-full flex items-center justify-between p-4',
                  'hover:bg-white/5 transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-surface-400" />
                  <span className="text-sm font-medium text-white">{group.title}</span>
                  {groupHasChanges && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </div>
                <motion.svg
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="w-4 h-4 text-surface-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {/* Group Content */}
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4">
                  {group.adjustments.map((adj) => (
                    <Slider
                      key={adj.key}
                      label={adj.label}
                      value={[adjustments[adj.key]]}
                      onValueChange={([value]) => handleAdjustmentChange(adj.key, value)}
                      min={adj.min}
                      max={adj.max}
                      size="sm"
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Quick Presets */}
      <div className="p-4 border-t border-editor-border">
        <span className="text-xs font-medium text-surface-500 mb-2 block">Quick Presets</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Auto', values: { brightness: 10, contrast: 15, saturation: 10 } },
            { label: 'Vivid', values: { saturation: 30, vibrance: 20, contrast: 10 } },
            { label: 'Soft', values: { contrast: -10, highlights: -20, shadows: 20 } }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                Object.entries(preset.values).forEach(([key, value]) => {
                  handleAdjustmentChange(key, value);
                });
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                'bg-editor-card border border-editor-border',
                'hover:border-primary-500/50 hover:bg-primary-500/10',
                'text-surface-300 hover:text-white'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}