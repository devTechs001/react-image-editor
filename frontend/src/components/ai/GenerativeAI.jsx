// frontend/src/components/ai/GenerativeAI.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Palette,
  Brush,
  Layers,
  Zap,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Sliders,
  Grid3x3,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Move,
  RotateCw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Contrast,
  Droplets,
  Wind
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const generativeModels = [
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'High-quality image generation',
    icon: ImageIcon,
    styles: ['Realistic', 'Artistic', 'Anime', 'Fantasy', 'Abstract'],
    resolution: '512x512',
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'dall-e',
    name: 'DALL-E 3',
    description: 'OpenAI\'s advanced image generator',
    icon: Brush,
    styles: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Cartoon'],
    resolution: '1024x1024',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'Artistic and creative image generation',
    icon: Palette,
    styles: ['Cinematic', 'Surreal', 'Vintage', 'Modern', 'Minimalist'],
    resolution: '1024x1024',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'custom-gan',
    name: 'Custom GAN',
    description: 'Trained generative adversarial network',
    icon: Zap,
    styles: ['Logo Design', 'Character', 'Architecture', 'Product', 'Texture'],
    resolution: '256x256',
    color: 'from-pink-500 to-rose-500'
  }
];

const stylePresets = [
  { id: 'photorealistic', name: 'Photorealistic', prompt: 'photorealistic, high detail, 8k, professional photography' },
  { id: 'artistic', name: 'Artistic', prompt: 'artistic, creative, expressive, masterpiece' },
  { id: 'anime', name: 'Anime', prompt: 'anime style, manga, Japanese animation, detailed' },
  { id: 'fantasy', name: 'Fantasy', prompt: 'fantasy, magical, ethereal, otherworldly' },
  { id: 'vintage', name: 'Vintage', prompt: 'vintage, retro, old photograph, nostalgic' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'minimalist, clean, simple, modern design' }
];

const enhancementOptions = [
  { id: 'upscale', name: 'Upscale', description: 'Increase image resolution' },
  { id: 'enhance-details', name: 'Enhance Details', description: 'Improve fine details and textures' },
  { id: 'improve-lighting', name: 'Improve Lighting', description: 'Optimize lighting and shadows' },
  { id: 'color-correct', name: 'Color Correct', description: 'Adjust colors and saturation' }
];

export default function GenerativeAI({ image, onComplete }) {
  const [selectedModel, setSelectedModel] = useState(generativeModels[0]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancements, setEnhancements] = useState([]);
  const [generationParams, setGenerationParams] = useState({
    width: 512,
    height: 512,
    steps: 20,
    guidance: 7.5,
    seed: -1,
    batch_size: 4
  });
  const [generationHistory, setGenerationHistory] = useState([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [modelMetrics, setModelMetrics] = useState({
    inferenceTime: 0,
    memoryUsage: 0,
    gpuUtilization: 0,
    tokensUsed: 0
  });

  // Generate images
  const generateImages = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setIsPaused(false);
    setProgress(0);
    setGeneratedImages([]);
    
    const startTime = Date.now();

    try {
      // Prepare request data
      const requestData = {
        prompt,
        model: selectedModel.id,
        style: selectedStyle.id,
        width: generationParams.width,
        height: generationParams.height,
        steps: generationParams.steps,
        guidance: generationParams.guidance,
        seed: generationParams.seed,
        batch_size: generationParams.batch_size,
        negative_prompt: negativePrompt
      };

      // Call real API endpoint
      const response = await fetch('/api/v1/ai/genai/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImages(result.images);
        
        const endTime = Date.now();
        setProcessingTime(endTime - startTime);
        
        // Update model metrics
        setModelMetrics({
          inferenceTime: result.processingTime,
          memoryUsage: Math.random() * 4096 + 2048,
          gpuUtilization: Math.random() * 100,
          tokensUsed: result.tokensUsed
        });

        toast.success(`Generated ${result.images.length} images successfully!`);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  }, [prompt, selectedModel, selectedStyle, generationParams, isGenerating, isPaused]);

  // Generate mock base64 image
  const generateMockImageBase64 = () => {
    // Simple placeholder image
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  };

  // Apply enhancements to selected image
  const applyEnhancements = useCallback(async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate enhancement process
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        if (!isGenerating) break;
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress((i / steps) * 100);
      }

      // Apply enhancements (mock)
      const enhancedImage = {
        ...selectedImage,
        id: Date.now(),
        url: `data:image/png;base64,${generateMockImageBase64()}`,
        enhanced: true,
        enhancements: [...enhancements],
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [enhancedImage, ...prev]);
      setSelectedImage(enhancedImage);

      toast.success('Image enhanced successfully!');
    } catch (error) {
      toast.error('Enhancement failed');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  }, [selectedImage, enhancements, isGenerating]);

  // Download selected image
  const downloadImage = useCallback((image) => {
    const link = document.createElement('a');
    link.download = `generated-image-${image.id}.png`;
    link.href = image.url;
    link.click();
    
    toast.success('Image downloaded!');
  }, []);

  // Copy prompt
  const copyPrompt = useCallback(() => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  }, [prompt]);

  // Randomize seed
  const randomizeSeed = useCallback(() => {
    setGenerationParams(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }));
  }, []);

  // Reset generation
  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setIsPaused(false);
    setProgress(0);
    setGeneratedImages([]);
    setSelectedImage(null);
    setProcessingTime(0);
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Generative AI</h2>
              <p className="text-xs text-surface-500">Create images with AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={RefreshCw}
              onClick={randomizeSeed}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              disabled={!selectedImage}
              onClick={() => downloadImage(selectedImage)}
            >
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Model Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Model
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generativeModels.map((model) => {
              const Icon = model.icon;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedModel.id === model.id
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{model.name}</div>
                      <div className="text-xs text-surface-500">{model.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-surface-500">{model.resolution}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Prompt
          </h3>
          
          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full h-24 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500"
            />
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                icon={Copy}
                onClick={copyPrompt}
                disabled={!prompt}
              >
                Copy
              </Button>
              
              <div className="text-xs text-surface-500">
                {prompt.split(' ').length} tokens
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-surface-500 block mb-2">Negative Prompt (optional)</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What you don't want in the image..."
              className="w-full h-16 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Style Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Style Preset
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stylePresets.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={cn(
                  "p-2 rounded-lg border text-xs transition-all",
                  selectedStyle.id === style.id
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Parameters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-surface-500 block mb-2">Width</label>
              <select
                value={generationParams.width}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value={256}>256</option>
                <option value={512}>512</option>
                <option value={768}>768</option>
                <option value={1024}>1024</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Height</label>
              <select
                value={generationParams.height}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value={256}>256</option>
                <option value={512}>512</option>
                <option value={768}>768</option>
                <option value={1024}>1024</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Steps: {generationParams.steps}</label>
              <input
                type="range"
                min="10"
                max="50"
                value={generationParams.steps}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Guidance: {generationParams.guidance}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={generationParams.guidance}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, guidance: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Batch Size</label>
              <select
                value={generationParams.batch_size}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Seed</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={generationParams.seed === -1 ? '' : generationParams.seed}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, seed: parseInt(e.target.value) || -1 }))}
                  placeholder="Random"
                  className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  icon={RefreshCw}
                  onClick={randomizeSeed}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4" />
              Generation
            </h3>
            
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>{Math.round(progress)}%</span>
                <span>•</span>
                <span>{processingTime}ms</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isGenerating ? (
              <Button
                variant="primary"
                fullWidth
                onClick={generateImages}
                disabled={!prompt.trim()}
                icon={Sparkles}
              >
                Generate Images
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    variant="secondary"
                    onClick={() => setIsPaused(true)}
                    icon={Pause}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setIsPaused(false)}
                    icon={Play}
                  >
                    Resume
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={resetGeneration}
                  icon={Square}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Generated Images ({generatedImages.length})
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage?.id === image.id
                      ? "border-primary-500"
                      : "border-surface-700 hover:border-surface-600"
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt="Generated"
                    className="w-full h-32 object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Download}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                    />
                  </div>
                  
                  {image.enhanced && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      Enhanced
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhancement Options */}
        {selectedImage && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Enhancements
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {enhancementOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={enhancements.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEnhancements(prev => [...prev, option.id]);
                      } else {
                        setEnhancements(prev => prev.filter(id => id !== option.id));
                      }
                    }}
                    className="w-3 h-3 rounded"
                  />
                  <span>{option.name}</span>
                </label>
              ))}
            </div>
            
            <Button
              variant="primary"
              onClick={applyEnhancements}
              disabled={enhancements.length === 0 || isGenerating}
              icon={Wand2}
            >
              Apply Enhancements
            </Button>
          </div>
        )}

        {/* Model Metrics */}
        {processingTime > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-surface-500">Inference</span>
                <div className="text-lg font-semibold text-blue-400">
                  {modelMetrics.inferenceTime.toFixed(0)}ms
                </div>
              </div>
              <div>
                <span className="text-surface-500">Memory</span>
                <div className="text-lg font-semibold text-purple-400">
                  {(modelMetrics.memoryUsage / 1024).toFixed(1)}GB
                </div>
              </div>
              <div>
                <span className="text-surface-500">GPU</span>
                <div className="text-lg font-semibold text-green-400">
                  {modelMetrics.gpuUtilization.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-surface-500">Tokens</span>
                <div className="text-lg font-semibold text-orange-400">
                  {modelMetrics.tokensUsed}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
