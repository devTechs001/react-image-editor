// frontend/src/components/ui/ColorPicker.jsx
import React, { useState, useCallback, useRef } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, Check, Copy } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const presetColors = [
  '#ffffff', '#000000', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981',
  '#6b7280', '#1f2937', '#374151', '#4b5563', '#9ca3af'
];

export default function ColorPicker({
  color,
  onChange,
  label,
  showInput = true,
  showPresets = true,
  showEyeDropper = true,
  className
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const handleEyeDropper = useCallback(async () => {
    if (!window.EyeDropper) {
      toast.error('Eye dropper not supported in this browser');
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
      toast.success('Color picked!');
    } catch (error) {
      // User cancelled
    }
  }, [onChange]);

  const copyColor = useCallback(() => {
    navigator.clipboard.writeText(color);
    toast.success('Color copied!');
  }, [color]);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Color Swatch Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'w-10 h-10 rounded-xl border-2 border-white/20 shadow-lg transition-all',
            'hover:border-white/40 hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          style={{ backgroundColor: color }}
        />

        {/* Color Input */}
        {showInput && (
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed={false}
              className={cn(
                'w-full pl-7 pr-10 py-2 rounded-lg bg-white/5 border border-white/10',
                'text-white font-mono text-sm uppercase',
                'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              )}
            />
            <button
              onClick={copyColor}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Eye Dropper */}
        {showEyeDropper && window.EyeDropper && (
          <button
            onClick={handleEyeDropper}
            className={cn(
              'p-2.5 rounded-lg bg-white/5 border border-white/10',
              'text-surface-400 hover:text-white hover:bg-white/10',
              'transition-all focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          >
            <Pipette className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Color Picker Popover */}
      <AnimatePresence>
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              ref={pickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 mt-2 p-4 rounded-xl',
                'bg-editor-card border border-editor-border shadow-elevated'
              )}
            >
              <HexColorPicker
                color={color}
                onChange={onChange}
                className="!w-52"
              />

              {/* Preset Colors */}
              {showPresets && (
                <div className="mt-4">
                  <span className="text-xs font-medium text-surface-500 mb-2 block">
                    Presets
                  </span>
                  <div className="grid grid-cols-10 gap-1">
                    {presetColors.map((presetColor) => (
                      <button
                        key={presetColor}
                        onClick={() => onChange(presetColor)}
                        className={cn(
                          'w-5 h-5 rounded-md border border-white/20 transition-all',
                          'hover:scale-110 hover:border-white/40',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500',
                          color === presetColor && 'ring-2 ring-primary-500'
                        )}
                        style={{ backgroundColor: presetColor }}
                      >
                        {color === presetColor && (
                          <Check className="w-3 h-3 mx-auto text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}