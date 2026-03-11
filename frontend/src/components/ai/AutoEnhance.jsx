// frontend/src/components/ai/AutoEnhance.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Download, Compare, Sliders } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';
import { enhanceImage } from '@/services/ai/imageEnhancement';

const enhancementPresets = [
  { id: 'balanced', label: 'Balanced', icon: Sparkles },
  { id: 'vivid', label: 'Vivid', icon: Sparkles },
  { id: 'portrait', label: 'Portrait', icon: Sparkles },
  { id: 'landscape', label: 'Landscape', icon: Sparkles },
  { id: 'night', label: 'Night', icon: Sparkles }
];

export default function AutoEnhance({ image, onComplete }) {
  const { setAIProcessing, setAIResults } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [intensity, setIntensity] = useState(75);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);

  const handleEnhance = useCallback(async () => {
    if (!image) return;

    setProcessing(true);
    setAIProcessing(true);

    try {
      const enhancedImage = await enhanceImage(image, {
        preset: selectedPreset,
        intensity: intensity / 100
      });
      setResult(enhancedImage);
      setAIResults({ autoEnhance: enhancedImage });
    } catch (error) {
      console.error('Auto enhancement failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, selectedPreset, intensity, setAIProcessing, setAIResults]);

  const handleApply = useCallback(() => {
    if (result) {
      onComplete?.(result);
    }
  }, [result, onComplete]);

  const handleComparisonMove = useCallback((e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setComparisonPosition(percentage);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Auto Enhance</h3>
            <p className="text-xs text-surface-500">AI-powered image enhancement</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[url('/assets/checker.svg')]"
          onMouseMove={showComparison ? handleComparisonMove : undefined}
        >
          {/* Original */}
          {image && (
            <img
              src={image}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
              style={showComparison ? { clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` } : {}}
            />
          )}

          {/* Enhanced */}
          {result && (
            <img
              src={result}
              alt="Enhanced"
              className="absolute inset-0 w-full h-full object-contain"
              style={showComparison ? { clipPath: `inset(0 0 0 ${comparisonPosition}%)` } : {}}
            />
          )}

          {/* Comparison Slider */}
          {showComparison && result && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${comparisonPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Compare className="w-4 h-4 text-surface-600" />
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <LoadingSpinner size="lg" variant="primary" />
                <p className="mt-4 text-sm text-white font-medium">Enhancing image...</p>
                <p className="text-xs text-surface-400">AI is analyzing and improving quality</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison Labels */}
          {showComparison && result && (
            <>
              <span className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
                Original
              </span>
              <span className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
                Enhanced
              </span>
            </>
          )}
        </div>

        {/* Compare Toggle */}
        {result && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg mx-auto mb-4 transition-all',
              showComparison
                ? 'bg-primary-500/20 text-primary-300'
                : 'bg-editor-card text-surface-400 hover:text-white'
            )}
          >
            <Compare className="w-4 h-4" />
            <span className="text-sm font-medium">Compare</span>
          </button>
        )}

        {/* Presets */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-surface-500 mb-3">Enhancement Style</h4>
          <div className="grid grid-cols-5 gap-2">
            {enhancementPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                    selectedPreset === preset.id
                      ? 'bg-primary-500/20 border border-primary-500/50'
                      : 'bg-editor-card border border-editor-border hover:border-surface-500'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4',
                    selectedPreset === preset.id ? 'text-primary-400' : 'text-surface-400'
                  )} />
                  <span className={cn(
                    'text-xs',
                    selectedPreset === preset.id ? 'text-primary-300' : 'text-surface-500'
                  )}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="mb-4">
          <Slider
            label="Intensity"
            value={[intensity]}
            min={0}
            max={100}
            step={1}
            showTooltip
            onValueChange={([value]) => setIntensity(value)}
          />
        </div>

        {/* Info */}
        <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Smart Enhancement</p>
              <p className="text-xs text-surface-400 mt-1">
                AI analyzes your image and applies optimal adjustments for brightness, contrast, color, and sharpness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-editor-border">
        {!result ? (
          <Button
            variant="primary"
            fullWidth
            onClick={handleEnhance}
            loading={processing}
            disabled={!image}
            icon={Wand2}
          >
            Auto Enhance
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleEnhance}
              icon={Wand2}
            >
              Redo
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
