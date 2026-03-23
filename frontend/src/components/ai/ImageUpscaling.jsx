// frontend/src/components/ai/ImageUpscaling.jsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Download,
  Zap,
  Settings2,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const upscaleModels = [
  { 
    id: 'esrgan', 
    name: 'ESRGAN', 
    description: 'Enhanced Super-Resolution GAN',
    maxScale: 4,
    quality: 'excellent',
    speed: 'medium'
  },
  { 
    id: 'real-esrgan', 
    name: 'Real-ESRGAN', 
    description: 'Real-world photo enhancement',
    maxScale: 4,
    quality: 'excellent',
    speed: 'slow'
  },
  { 
    id: 'srcnn', 
    name: 'SRCNN', 
    description: 'Fast super-resolution CNN',
    maxScale: 4,
    quality: 'good',
    speed: 'fast'
  },
  { 
    id: 'edsr', 
    name: 'EDSR', 
    description: 'Enhanced Deep Super-Resolution',
    maxScale: 4,
    quality: 'excellent',
    speed: 'medium'
  }
];

const qualityPresets = [
  { id: 'draft', name: 'Draft', scale: 2, quality: 60 },
  { id: 'standard', name: 'Standard', scale: 2, quality: 80 },
  { id: 'high', name: 'High Quality', scale: 4, quality: 90 },
  { id: 'ultra', name: 'Ultra Quality', scale: 4, quality: 95 }
];

export default function ImageUpscaling({ onComplete }) {
  const { image, setImage, addToHistory, setAIProcessing } = useEditor();
  const [selectedModel, setSelectedModel] = useState(upscaleModels[0]);
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(80);
  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const canvasRef = useRef(null);

  const handleUpscale = useCallback(async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setAIProcessing(true);

    try {
      // Simulate AI upscaling process
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress((i / steps) * 100);
      }

      // Create upscaled image (simulation)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = image;
      });

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Apply upscaling algorithm (simplified for demo)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = quality > 80 ? 'high' : quality > 60 ? 'medium' : 'low';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const upscaledImage = canvas.toDataURL('image/png', quality / 100);
      
      // Show preview
      setPreviewImage(upscaledImage);
      
      // Auto-apply after preview
      setTimeout(() => {
        setImage(upscaledImage);
        addToHistory(upscaledImage);
        onComplete?.(upscaledImage);
        toast.success(`Image upscaled ${scale}x successfully!`);
      }, 2000);

    } catch (error) {
      console.error('Upscaling failed:', error);
      toast.error('Upscaling failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setAIProcessing(false);
    }
  }, [image, scale, quality, selectedModel, setImage, addToHistory, onComplete, setAIProcessing]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setScale(preset.scale);
    setQuality(preset.quality);
  };

  const handleDownload = () => {
    if (!previewImage) return;
    
    const link = document.createElement('a');
    link.download = `upscaled_${scale}x_${Date.now()}.png`;
    link.href = previewImage;
    link.click();
    
    toast.success('Image downloaded successfully!');
  };

  if (!image) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-editor-card border border-editor-border flex items-center justify-center mx-auto mb-4">
            <Maximize2 className="w-8 h-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Upscaling</h3>
          <p className="text-sm text-surface-400">
            Upload an image to enhance its resolution using advanced AI algorithms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">AI Upscaling</h3>
            <p className="text-[9px] sm:text-[10px] text-surface-500 font-medium uppercase tracking-wider">Super Resolution</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-dark space-y-4 sm:space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-white">AI Model</h4>
          <div className="grid grid-cols-1 gap-2">
            {upscaleModels.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  selectedModel.id === model.id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-editor-card border-editor-border text-surface-400 hover:border-surface-600"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{model.name}</span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    model.speed === 'fast' ? "bg-green-500/20 text-green-400" :
                    model.speed === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {model.speed}
                  </span>
                </div>
                <p className="text-xs text-surface-500">{model.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Presets */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-medium text-white">Quality Presets</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {qualityPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all",
                  selectedPreset === preset.id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-editor-card border-editor-border text-surface-400 hover:border-surface-600"
                )}
              >
                <div className="text-xs sm:text-sm font-medium">{preset.name}</div>
                <div className="text-[9px] sm:text-xs text-surface-500">{preset.scale}x</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-white">Custom Settings</h4>
            <button
              onClick={() => setAdvancedSettings(!advancedSettings)}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              {advancedSettings ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="space-y-4">
            <Slider
              label={`Scale: ${scale}x`}
              value={[scale]}
              onValueChange={([val]) => setScale(val)}
              min={2}
              max={selectedModel.maxScale}
              step={1}
              size="sm"
            />

            <Slider
              label={`Quality: ${quality}%`}
              value={[quality]}
              onValueChange={([val]) => setQuality(val)}
              min={10}
              max={100}
              size="sm"
            />
          </div>

          {advancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-editor-border"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Noise Reduction</label>
                  <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-surface-500 block mb-1">Sharpening</label>
                  <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-white">
                    <option>None</option>
                    <option>Light</option>
                    <option>Moderate</option>
                    <option>Strong</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Processing Progress */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Upscaling image...</span>
              </div>
              <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-surface-500 text-center">
                {Math.round(progress)}% complete
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview */}
        <AnimatePresence>
          {previewImage && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-medium text-white">Preview</h4>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Upscaled {scale}x</span>
                </div>
              </div>
              
              <div className="relative group">
                <img
                  src={previewImage}
                  alt="Upscaled preview"
                  className="w-full rounded-lg border border-editor-border"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setImage(previewImage);
                      addToHistory(previewImage);
                      toast.success('Upscaled image applied!');
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-editor-border">
          <Button
            variant="primary"
            fullWidth
            onClick={handleUpscale}
            disabled={isProcessing}
            loading={isProcessing}
            icon={isProcessing ? Loader2 : Zap}
          >
            {isProcessing ? 'Upscaling...' : `Upscale ${scale}x`}
          </Button>
          
          {previewImage && (
            <Button
              variant="secondary"
              fullWidth
              icon={Download}
              onClick={handleDownload}
            >
              Download Result
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}