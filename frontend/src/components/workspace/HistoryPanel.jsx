// frontend/src/components/workspace/HistoryPanel.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Undo2,
  Redo2,
  Trash2,
  Image,
  Sliders,
  Crop,
  Type,
  Wand2,
  Layers
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import { formatDistanceToNow } from 'date-fns';

const actionIcons = {
  image: Image,
  adjustment: Sliders,
  crop: Crop,
  text: Type,
  ai: Wand2,
  layer: Layers,
  default: History
};

export default function HistoryPanel() {
  const {
    imageHistory,
    historyIndex,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditor();

  // Sample history items (in real app, these would come from state)
  const historyItems = useMemo(() => [
    { id: 1, action: 'Open Image', type: 'image', timestamp: Date.now() - 300000 },
    { id: 2, action: 'Auto Enhance', type: 'ai', timestamp: Date.now() - 240000 },
    { id: 3, action: 'Adjust Brightness', type: 'adjustment', timestamp: Date.now() - 180000 },
    { id: 4, action: 'Crop', type: 'crop', timestamp: Date.now() - 120000 },
    { id: 5, action: 'Add Text', type: 'text', timestamp: Date.now() - 60000 },
    { id: 6, action: 'Adjust Contrast', type: 'adjustment', timestamp: Date.now() - 30000 }
  ], []);

  const currentIndex = 5; // Would be derived from actual state

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border">
        <h3 className="text-sm font-semibold text-white">History</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undo}
            disabled={!canUndo}
            icon={Undo2}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={!canRedo}
            icon={Redo2}
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
        {historyItems.map((item, index) => {
          const Icon = actionIcons[item.type] || actionIcons.default;
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 transition-all',
                'border-b border-editor-border',
                isActive
                  ? 'bg-primary-500/10'
                  : isPast
                  ? 'opacity-50 hover:opacity-100'
                  : 'hover:bg-white/5',
                'text-left'
              )}
            >
              {/* Index Indicator */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-700 text-surface-400'
              )}>
                {index + 1}
              </div>

              {/* Icon */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                isActive ? 'bg-primary-500/20' : 'bg-surface-800'
              )}>
                <Icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-primary-400' : 'text-surface-400'
                )} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isActive ? 'text-primary-300' : 'text-white'
                )}>
                  {item.action}
                </p>
                <p className="text-xs text-surface-500">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-primary-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-editor-border">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          icon={Trash2}
          className="text-red-400 hover:bg-red-500/10"
        >
          Clear History
        </Button>
      </div>
    </div>
  );
}