// frontend/src/components/workspace/QuickActions.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  Scissors,
  Image,
  Palette,
  Zap,
  Sun,
  Contrast,
  Focus,
  RotateCcw,
  Crop,
  Maximize,
  Eraser,
  Brush,
  Type,
  Shapes,
  Download,
  Share2,
  MoreHorizontal,
  Undo2,
  Redo2,
  Play,
  Layers,
  Eye,
  Lock,
  Trash2,
  Copy,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import { useEditor } from '@/contexts/EditorContext';
import toast from 'react-hot-toast';

const quickActions = [
  {
    id: 'ai-enhance',
    label: 'AI Enhance',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500',
    description: 'Automatically enhance image quality'
  },
  {
    id: 'bg-remove',
    label: 'Remove BG',
    icon: Scissors,
    color: 'from-pink-500 to-rose-500',
    description: 'Remove background with AI'
  },
  {
    id: 'auto-crop',
    label: 'Auto Crop',
    icon: Crop,
    color: 'from-blue-500 to-cyan-500',
    description: 'Intelligently crop to subject'
  },
  {
    id: 'super-res',
    label: 'Upscale 2x',
    icon: Focus,
    color: 'from-emerald-500 to-green-500',
    description: 'AI-powered upscaling'
  },
  {
    id: 'style-transfer',
    label: 'Style Transfer',
    icon: Palette,
    color: 'from-amber-500 to-orange-500',
    description: 'Apply artistic styles'
  },
  {
    id: 'object-remove',
    label: 'Erase Object',
    icon: Eraser,
    color: 'from-red-500 to-orange-500',
    description: 'Remove unwanted objects'
  }
];

const editActions = [
  { id: 'undo', label: 'Undo', icon: Undo2, shortcut: '⌘Z' },
  { id: 'redo', label: 'Redo', icon: Redo2, shortcut: '⌘⇧Z' },
  { id: 'flip-h', label: 'Flip H', icon: FlipHorizontal },
  { id: 'flip-v', label: 'Flip V', icon: FlipVertical },
  { id: 'rotate-left', label: 'Rotate Left', icon: RotateCcw },
  { id: 'rotate-right', label: 'Rotate Right', icon: RotateCcw }
];

export default function QuickActions({ onAction }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { image, undo, redo } = useEditor();

  const handleAction = (action) => {
    const handlers = {
      'ai-enhance': () => {
        toast.loading('Enhancing image...', { duration: 2000 });
        // AI enhancement logic
      },
      'bg-remove': () => {
        toast.loading('Removing background...', { duration: 3000 });
        // Background removal logic
      },
      'auto-crop': () => {
        toast.success('Auto-crop applied');
      },
      'super-res': () => {
        toast.loading('Upscaling image...', { duration: 5000 });
      },
      'style-transfer': () => {
        toast.success('Style transfer panel opened');
      },
      'object-remove': () => {
        toast.success('Select area to erase');
      },
      'undo': () => undo(),
      'redo': () => redo(),
      'flip-h': () => toast.success('Flipped horizontally'),
      'flip-v': () => toast.success('Flipped vertically'),
      'rotate-left': () => toast.success('Rotated left'),
      'rotate-right': () => toast.success('Rotated right')
    };

    const handler = handlers[action.id];
    if (handler) {
      handler();
      onAction?.(action);
    }
  };

  return (
    <div className="bg-surface-900/80 backdrop-blur-xl border border-surface-700 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-surface-400" />
        </button>
      </div>

      {/* AI Actions Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(action)}
              className={cn(
                'relative group p-3 rounded-xl bg-gradient-to-br',
                action.color,
                'shadow-lg hover:shadow-xl transition-shadow'
              )}
              title={action.description}
            >
              <Icon className="w-5 h-5 text-white mx-auto" />
              <span className="text-[10px] text-white/80 mt-1 block">
                {action.label}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-surface-700">
                {action.description}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Edit Actions */}
      <div className="border-t border-surface-700 pt-3">
        <div className="flex items-center gap-1">
          {editActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="icon-sm"
                onClick={() => handleAction(action)}
                className="text-surface-400 hover:text-white hover:bg-surface-700"
                title={action.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-surface-700 mt-3 pt-3 space-y-2"
        >
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'adjustments', label: 'Adjust', icon: Sun },
              { id: 'filters', label: 'Filters', icon: Palette },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'layers', label: 'Layers', icon: Layers }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <Icon className="w-5 h-5 text-surface-400" />
                  <span className="text-[10px] text-surface-500">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
