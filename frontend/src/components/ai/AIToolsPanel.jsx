// frontend/src/components/ai/AIToolsPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Image,
  Palette,
  Scissors,
  Layers,
  Zap,
  ArrowRight,
  Upload,
  Download,
  Settings2,
  RotateCcw,
  Compare,
  Move,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import { useEditor } from '@/contexts/EditorContext';
import toast from 'react-hot-toast';
import { transformImage, TransformType, StylePreset } from '@/services/ai/imageTransform';
import { swapFaces } from '@/services/ai/faceSwap';
import { applyTemplate, templates, TemplateCategory } from '@/services/templates/templateManager';

const aiTools = [
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    icon: Palette,
    description: 'Apply artistic styles to your image',
    type: TransformType.STYLE_TRANSFER
  },
  {
    id: 'background-remove',
    name: 'Remove Background',
    icon: Scissors,
    description: 'AI-powered background removal',
    type: TransformType.BACKGROUND_REMOVE
  },
  {
    id: 'face-swap',
    name: 'Face Swap',
    icon: Compare,
    description: 'Swap faces between images',
    type: 'face-swap'
  },
  {
    id: 'super-resolution',
    name: 'AI Upscale',
    icon: Zap,
    description: 'Enhance and upscale images',
    type: TransformType.SUPER_RESOLUTION
  },
  {
    id: 'face-enhance',
    name: 'Face Enhance',
    icon: Sparkles,
    description: 'Enhance facial features',
    type: TransformType.FACE_ENHANCE
  },
  {
    id: 'animate',
    name: 'Animate',
    icon: Move,
    description: 'Add subtle motion to images',
    type: TransformType.ANIMATE
  },
  {
    id: 'colorize',
    name: 'Colorize',
    icon: Palette,
    description: 'Add color to B&W images',
    type: TransformType.COLORIZATION
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: Layers,
    description: 'Quick transformation presets',
    type: 'template'
  }
];

export default function AIToolsPanel({ onClose }) {
  const { currentImage, setCurrentImageData, addToHistory } = useEditor();
  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [faceSwapSource, setFaceSwapSource] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(StylePreset.REALISTIC);
  const [strength, setStrength] = useState(0.7);

  const handleToolSelect = (tool) => {
    if (tool.id === 'templates') {
      setShowTemplates(true);
    } else if (tool.id === 'face-swap') {
      setSelectedTool(tool);
    } else {
      setSelectedTool(tool);
    }
  };

  const applyTransformation = async () => {
    if (!currentImage) {
      toast.error('No image loaded');
      return;
    }

    setIsProcessing(true);
    
    try {
      let result;
      
      if (selectedTool.type === 'face-swap') {
        if (!faceSwapSource) {
          toast.error('Please select a source face image');
          setIsProcessing(false);
          return;
        }
        result = await swapFaces(faceSwapSource, currentImage, {
          blendStrength: strength
        });
      } else {
        result = await transformImage(currentImage, {
          type: selectedTool.type,
          style: selectedStyle,
          strength
        });
      }

      // Update canvas with result
      setCurrentImageData(result);
      addToHistory('ai-transform', { tool: selectedTool.id });
      
      toast.success('Transformation applied!');
      setSelectedTool(null);
    } catch (error) {
      console.error('Transformation failed:', error);
      toast.error('Transformation failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyTemplateTransform = async (templateId) => {
    if (!currentImage) {
      toast.error('No image loaded');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await applyTemplate(currentImage, templateId);
      setCurrentImageData(result);
      addToHistory('template-apply', { template: templateId });
      
      toast.success('Template applied!');
      setShowTemplates(false);
    } catch (error) {
      console.error('Template application failed:', error);
      toast.error('Template application failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Tools</h2>
              <p className="text-xs text-surface-400">Transform your images with AI</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
        <AnimatePresence mode="wait">
          {!selectedTool && !showTemplates ? (
            /* Tool Grid */
            <motion.div
              key="tools"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {aiTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool)}
                      className={cn(
                        'p-4 rounded-xl border text-left',
                        'bg-surface-800/50 border-surface-700',
                        'hover:border-primary-500/30 hover:bg-surface-800',
                        'transition-all group'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                        'bg-primary-500/10 text-primary-400',
                        'group-hover:bg-primary-500/20 group-hover:text-primary-300'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-surface-400">
                        {tool.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : showTemplates ? (
            /* Templates View */
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Templates</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
                <button
                  onClick={() => {}}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-500 text-white"
                >
                  All
                </button>
                {Object.values(TemplateCategory).map((cat) => (
                  <button
                    key={cat}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-700 text-surface-300 hover:bg-surface-600"
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-2 gap-3">
                {Object.values(templates).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplateTransform(template.id)}
                    disabled={isProcessing}
                    className={cn(
                      'p-3 rounded-xl border text-left',
                      'bg-surface-800/50 border-surface-700',
                      'hover:border-primary-500/30 transition-all',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="aspect-square rounded-lg bg-surface-700 mb-2 overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%2364748b" font-size="12">Preview</text></svg>';
                        }}
                      />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-surface-400 line-clamp-1">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Tool Settings View */
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedTool(null)}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Button>
                <div className="flex items-center gap-2">
                  <selectedTool.icon className="w-5 h-5 text-primary-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {selectedTool.name}
                  </h3>
                </div>
              </div>

              {/* Face Swap Source */}
              {selectedTool.id === 'face-swap' && (
                <div className="space-y-3">
                  <label className="text-sm text-surface-300">
                    Source Face Image
                  </label>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-6 text-center',
                      faceSwapSource
                        ? 'border-primary-500/30 bg-primary-500/10'
                        : 'border-surface-600 hover:border-surface-500'
                    )}
                  >
                    {faceSwapSource ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-300">
                          Image selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFaceSwapSource(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-surface-500 mb-2" />
                        <p className="text-sm text-surface-400 mb-2">
                          Click to upload source face
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  const img = new Image();
                                  img.onload = () => setFaceSwapSource(img);
                                  img.src = e.target.result;
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          Choose Image
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Style Selection */}
              {selectedTool.type === TransformType.STYLE_TRANSFER && (
                <div className="space-y-3">
                  <label className="text-sm text-surface-300">Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(StylePreset).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={cn(
                          'py-2 px-3 rounded-lg text-xs font-medium capitalize',
                          selectedStyle === style
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                        )}
                      >
                        {style.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Strength Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-surface-300">Strength</label>
                  <span className="text-xs text-surface-400 font-mono">
                    {Math.round(strength * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              {/* Apply Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={applyTransformation}
                loading={isProcessing}
                className="mt-6"
              >
                <Wand2 className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Apply Transformation'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
