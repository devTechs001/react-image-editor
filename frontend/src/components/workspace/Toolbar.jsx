// frontend/src/components/workspace/Toolbar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2,
  Hand,
  Type,
  Square,
  Circle,
  Minus,
  Pencil,
  Eraser,
  Pipette,
  Crop,
  RotateCw,
  FlipHorizontal,
  Wand2,
  Layers,
  Image,
  ZoomIn
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { TooltipWrapper, TooltipProvider } from '@/components/ui/Tooltip';
import { cn } from '@/utils/helpers/cn';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
  { type: 'divider' },
  { id: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
  { id: 'rotate', icon: RotateCw, label: 'Rotate', shortcut: 'R' },
  { type: 'divider' },
  { id: 'brush', icon: Pencil, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
  { type: 'divider' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'U' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { type: 'divider' },
  { id: 'ai', icon: Wand2, label: 'AI Tools', shortcut: 'A' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom', shortcut: 'Z' }
];

export default function Toolbar({ orientation = 'vertical', className }) {
  const { activeTool, setActiveTool } = useEditor();
  const [hoveredTool, setHoveredTool] = useState(null);

  const isVertical = orientation === 'vertical';

  return (
    <TooltipProvider>
      <div
        className={cn(
          'bg-editor-surface/90 backdrop-blur-xl border-editor-border',
          isVertical
            ? 'w-14 border-r flex flex-col items-center py-3'
            : 'h-14 border-b flex items-center px-3',
          className
        )}
      >
        <div
          className={cn(
            'flex gap-1',
            isVertical ? 'flex-col' : 'flex-row'
          )}
        >
          {tools.map((tool, index) => {
            if (tool.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  className={cn(
                    'bg-editor-border',
                    isVertical ? 'w-8 h-px my-2' : 'h-8 w-px mx-2'
                  )}
                />
              );
            }

            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <TooltipWrapper
                key={tool.id}
                content={
                  <div className="flex items-center gap-2">
                    <span>{tool.label}</span>
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-800 border border-surface-700">
                      {tool.shortcut}
                    </kbd>
                  </div>
                }
                side={isVertical ? 'right' : 'bottom'}
              >
                <motion.button
                  onClick={() => setActiveTool(tool.id)}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  className={cn(
                    'relative p-2.5 rounded-xl transition-all',
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeToolIndicator"
                      className={cn(
                        'absolute bg-primary-500 rounded-full',
                        isVertical
                          ? 'w-1 h-6 -right-0.5 top-1/2 -translate-y-1/2'
                          : 'h-1 w-6 -bottom-0.5 left-1/2 -translate-x-1/2'
                      )}
                    />
                  )}
                </motion.button>
              </TooltipWrapper>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}