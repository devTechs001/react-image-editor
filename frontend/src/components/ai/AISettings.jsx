// frontend/src/components/ai/AISettings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sparkles,
  Zap,
  Clock,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Palette
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';

const modelOptions = [
  { value: 'stable-diffusion-xl', label: 'Stable Diffusion XL', quality: 'Best', speed: 'Slow' },
  { value: 'stable-diffusion', label: 'Stable Diffusion', quality: 'Good', speed: 'Medium' },
  { value: 'midjourney', label: 'Midjourney V5', quality: 'Best', speed: 'Slow' },
  { value: 'dalle3', label: 'DALL-E 3', quality: 'Best', speed: 'Medium' },
  { value: 'fast', label: 'Fast Generate', quality: 'Standard', speed: 'Fast' }
];

const stylePresets = [
  { id: 'realistic', label: 'Realistic', preview: '📷' },
  { id: 'artistic', label: 'Artistic', preview: '🎨' },
  { id: 'anime', label: 'Anime', preview: '✨' },
  { id: 'cyberpunk', label: 'Cyberpunk', preview: '🤖' },
  { id: 'fantasy', label: 'Fantasy', preview: '🐉' },
  { id: 'minimal', label: 'Minimal', preview: '⬜' },
  { id: 'vintage', label: 'Vintage', preview: '📜' },
  { id: 'hdr', label: 'HDR', preview: '🌅' }
];

export default function AISettings({ onApply, onClose }) {
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-xl');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [settings, setSettings] = useState({
    guidanceScale: 7.5,
    steps: 30,
    width: 1024,
    height: 1024,
    seed: -1,
    useHighRes: true,
    useFaceEnhance: false,
    useUpscale: false,
    negativePrompt: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentModel = modelOptions.find(m => m.value === selectedModel);

  const applySettings = () => {
    onApply?.({
      model: selectedModel,
      style: selectedStyle,
      ...settings
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Settings</h2>
              <p className="text-xs text-surface-400">Configure generation parameters</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Model
          </label>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            options={modelOptions.map(m => ({ value: m.value, label: m.label }))}
          />
          {currentModel && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-surface-400">
                Quality: <span className="text-emerald-400">{currentModel.quality}</span>
              </span>
              <span className="text-surface-400">
                Speed: <span className={cn(
                  currentModel.speed === 'Fast' && 'text-emerald-400',
                  currentModel.speed === 'Medium' && 'text-amber-400',
                  currentModel.speed === 'Slow' && 'text-red-400'
                )}>{currentModel.speed}</span>
              </span>
            </div>
          )}
        </div>

        {/* Style Presets - Grid on mobile, more cols on desktop */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Style Preset
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2">
            {stylePresets.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                  selectedStyle === style.id
                    ? 'bg-primary-500/20 border-primary-500/50 text-white'
                    : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-500'
                )}
              >
                <span className="text-xl">{style.preview}</span>
                <span className="text-[10px] font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Guidance Scale
            </label>
            <span className="text-xs text-surface-400 font-mono">{settings.guidanceScale}</span>
          </div>
          <Slider
            value={settings.guidanceScale}
            onChange={(v) => setSettings(s => ({ ...s, guidanceScale: v }))}
            min={1}
            max={20}
            step={0.5}
          />
          <p className="text-xs text-surface-500">
            Higher values = more faithful to prompt, Lower = more creative
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Inference Steps
            </label>
            <span className="text-xs text-surface-400 font-mono">{settings.steps}</span>
          </div>
          <Slider
            value={settings.steps}
            onChange={(v) => setSettings(s => ({ ...s, steps: v }))}
            min={10}
            max={100}
            step={1}
          />
          <p className="text-xs text-surface-500">
            More steps = better quality but slower ({Math.round(settings.steps * 0.1)}s est.)
          </p>
        </div>

        {/* Resolution */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Resolution
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { w: 512, h: 512, label: '512²' },
              { w: 1024, h: 1024, label: '1024²' },
              { w: 2048, h: 2048, label: '2K²' }
            ].map((res) => (
              <button
                key={res.label}
                onClick={() => setSettings(s => ({ ...s, width: res.w, height: res.h }))}
                className={cn(
                  'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  settings.width === res.w && settings.height === res.h
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                )}
              >
                {res.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-4 border-t border-editor-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-300">High Resolution</span>
            </div>
            <Switch
              checked={settings.useHighRes}
              onChange={(v) => setSettings(s => ({ ...s, useHighRes: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-300">Face Enhancement</span>
            </div>
            <Switch
              checked={settings.useFaceEnhance}
              onChange={(v) => setSettings(s => ({ ...s, useFaceEnhance: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-300">AI Upscale</span>
            </div>
            <Switch
              checked={settings.useUpscale}
              onChange={(v) => setSettings(s => ({ ...s, useUpscale: v }))}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="pt-4 border-t border-editor-border">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Settings
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4 pt-4"
            >
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Seed (-1 for random)
                </label>
                <input
                  type="number"
                  value={settings.seed}
                  onChange={(e) => setSettings(s => ({ ...s, seed: parseInt(e.target.value) || -1 }))}
                  className="w-full input"
                  placeholder="-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2 flex items-center gap-2">
                  Negative Prompt
                  <span className="text-surface-500 cursor-help" title="What you don't want in the image">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </label>
                <textarea
                  value={settings.negativePrompt}
                  onChange={(e) => setSettings(s => ({ ...s, negativePrompt: e.target.value }))}
                  className="w-full input min-h-[80px] resize-none"
                  placeholder="ugly, blurry, low quality, distorted..."
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Apply Button - Full width on mobile */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={applySettings}
          className="mt-6"
        >
          <Sparkles className="w-4 h-4" />
          Apply Settings
        </Button>
      </div>
    </div>
  );
}
