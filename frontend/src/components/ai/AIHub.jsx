// frontend/src/components/ai/AIHub.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Scissors,
  Palette,
  Zap,
  Brain,
  Stars,
  Maximize2,
  PaintBucket,
  Eraser,
  Layers,
  Camera,
  User,
  Smile,
  Brush,
  Type,
  ArrowRight,
  Waves,
  Scan,
  Target
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

const aiTools = [
  {
    id: 'enhance',
    name: 'AI Enhance',
    description: 'Automatically enhance your image quality',
    icon: Wand2,
    color: 'from-violet-500 to-purple-500',
    category: 'enhance'
  },
  {
    id: 'background-remove',
    name: 'Remove Background',
    description: 'Remove backgrounds with one click',
    icon: Scissors,
    color: 'from-pink-500 to-rose-500',
    category: 'edit',
    popular: true
  },
  {
    id: 'background-replace',
    name: 'Replace Background',
    description: 'Swap backgrounds with professional scenes',
    icon: ImageIcon,
    color: 'from-blue-500 to-indigo-500',
    category: 'edit'
  },
  {
    id: 'upscale',
    name: 'AI Upscale',
    description: 'Upscale images up to 4x resolution',
    icon: Maximize2,
    color: 'from-blue-500 to-cyan-500',
    category: 'enhance'
  },
  {
    id: 'colorize',
    name: 'Colorize',
    description: 'Add color to black & white photos',
    icon: PaintBucket,
    color: 'from-amber-500 to-orange-500',
    category: 'enhance'
  },
  {
    id: 'denoise',
    name: 'AI Denoise',
    description: 'Remove noise and grain from photos',
    icon: Waves,
    color: 'from-cyan-500 to-blue-500',
    category: 'enhance'
  },
  {
    id: 'face-detect',
    name: 'Face Detection',
    description: 'Identify faces and landmarks',
    icon: Scan,
    color: 'from-rose-500 to-red-500',
    category: 'portrait'
  },
  {
    id: 'object-detect',
    name: 'Object Detection',
    description: 'Identify and isolate objects',
    icon: Target,
    color: 'from-indigo-500 to-violet-500',
    category: 'edit'
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Apply artistic styles to your images',
    icon: Palette,
    color: 'from-fuchsia-500 to-pink-500',
    category: 'creative'
  },
  {
    id: 'face-enhance',
    name: 'Face Enhancement',
    description: 'Enhance facial features and details',
    icon: Smile,
    color: 'from-rose-500 to-red-500',
    category: 'portrait'
  },
  {
    id: 'portrait-mode',
    name: 'Portrait Mode',
    description: 'Add professional blur effects',
    icon: Camera,
    color: 'from-indigo-500 to-violet-500',
    category: 'portrait'
  },
  {
    id: 'generate',
    name: 'AI Generate',
    description: 'Generate images from text prompts',
    icon: Stars,
    color: 'from-primary-500 to-secondary-500',
    category: 'creative',
    popular: true
  },
  {
    id: 'inpaint',
    name: 'AI Inpainting',
    description: 'Fill in missing or selected areas',
    icon: Brush,
    color: 'from-lime-500 to-green-500',
    category: 'edit'
  },
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Create images from descriptions',
    icon: Type,
    color: 'from-cyan-500 to-blue-500',
    category: 'creative'
  },
  {
    id: 'smart-crop',
    name: 'Smart Crop',
    description: 'AI-powered intelligent cropping',
    icon: Layers,
    color: 'from-teal-500 to-emerald-500',
    category: 'edit'
  }
];

const categories = [
  { id: 'all', label: 'All Tools' },
  { id: 'enhance', label: 'Enhance' },
  { id: 'edit', label: 'Edit' },
  { id: 'creative', label: 'Creative' },
  { id: 'portrait', label: 'Portrait' }
];

export default function AIHub({ onToolSelect }) {
  const { aiProcessing, setAIProcessing } = useEditor();
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredTool, setHoveredTool] = useState(null);

  const filteredTools = aiTools.filter(
    tool => activeCategory === 'all' || tool.category === activeCategory
  );

  const handleToolClick = async (tool) => {
    setAIProcessing(true);
    try {
      await onToolSelect?.(tool);
    } finally {
      setAIProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Tools</h3>
            <p className="text-xs text-surface-500">Powered by advanced AI</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeCategory === cat.id
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              
              return (
                <motion.button
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToolClick(tool)}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  disabled={aiProcessing}
                  className={cn(
                    'relative p-4 rounded-xl text-left transition-all group',
                    'bg-editor-card border border-editor-border',
                    'hover:border-primary-500/50 hover:bg-primary-500/5',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {/* Popular Badge */}
                  {tool.popular && (
                    <span className="absolute -top-1 -right-1 px-2 py-0.5 text-2xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      Popular
                    </span>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3',
                    tool.color
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-medium text-white text-sm mb-1 group-hover:text-primary-300 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-surface-500 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      opacity: hoveredTool === tool.id ? 1 : 0,
                      x: hoveredTool === tool.id ? 0 : -10
                    }}
                    className="absolute bottom-4 right-4"
                  >
                    <ArrowRight className="w-4 h-4 text-primary-400" />
                  </motion.div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Credits Info */}
      <div className="p-4 border-t border-editor-border">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-xs font-medium text-white">AI Credits</p>
              <p className="text-xs text-surface-500">47 / 50 remaining</p>
            </div>
          </div>
          <Button variant="secondary" size="xs">
            Get More
          </Button>
        </div>
      </div>
    </div>
  );
}