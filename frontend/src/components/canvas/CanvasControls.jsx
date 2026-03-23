// frontend/src/components/canvas/CanvasControls.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Grid3x3,
  Move,
  Hand
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { TooltipWrapper } from '@/components/ui/Tooltip';
import { cn } from '@/utils/helpers/cn';

export default function CanvasControls({ className }) {
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    activeTool,
    setActiveTool,
    ui,
    setUI,
    showGrid,
    setShowGrid
  } = useEditor();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.25, 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.25, 0.1));
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const controls = [
    {
      icon: ZoomIn,
      label: 'Zoom In',
      onClick: handleZoomIn,
      shortcut: '+'
    },
    {
      icon: ZoomOut,
      label: 'Zoom Out',
      onClick: handleZoomOut,
      shortcut: '-'
    },
    {
      icon: Maximize,
      label: 'Fit to Screen',
      onClick: handleFitToScreen,
      shortcut: '0'
    },
    {
      icon: RotateCcw,
      label: 'Reset View',
      onClick: handleFitToScreen,
      shortcut: 'R'
    },
    { type: 'divider' },
    {
      icon: Hand,
      label: 'Pan Tool',
      onClick: () => setActiveTool('pan'),
      active: activeTool === 'pan',
      shortcut: 'H'
    },
    {
      icon: Grid3x3,
      label: 'Toggle Grid',
      onClick: toggleGrid,
      active: showGrid,
      shortcut: 'G'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-1 p-1.5 rounded-xl',
        'bg-editor-card/90 backdrop-blur-xl border border-editor-border shadow-elevated',
        className
      )}
    >
      {controls.map((control, index) => {
        if (control.type === 'divider') {
          return (
            <div key={index} className="w-px h-6 bg-editor-border mx-1" />
          );
        }

        const Icon = control.icon;

        return (
          <TooltipWrapper
            key={control.label}
            content={
              <div className="flex items-center gap-2">
                <span>{control.label}</span>
                {control.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-800 border border-surface-700">
                    {control.shortcut}
                  </kbd>
                )}
              </div>
            }
          >
            <button
              onClick={control.onClick}
              className={cn(
                'p-2 rounded-lg transition-all',
                control.active
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          </TooltipWrapper>
        );
      })}

      {/* Zoom Percentage */}
      <div className="px-3 py-1.5 text-xs font-mono text-surface-400 min-w-[60px] text-center">
        {Math.round(canvas.zoom * 100)}%
      </div>
    </motion.div>
  );
}