// frontend/src/components/workspace/RightPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sliders,
  Sparkles,
  Palette,
  History,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import LayersPanel from '@/components/layers/LayersPanel';
import Adjustments from '@/components/filters/Adjustments';
import FilterPanel from '@/components/filters/FilterPanel';
import AIHub from '@/components/ai/AIHub';
import HistoryPanel from './HistoryPanel';
import { cn } from '@/utils/helpers/cn';

const tabs = [
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'adjustments', icon: Sliders, label: 'Adjust' },
  { id: 'filters', icon: Palette, label: 'Filters' },
  { id: 'ai', icon: Sparkles, label: 'AI Tools' },
  { id: 'history', icon: History, label: 'History' }
];

export default function RightPanel({ className }) {
  const { ui, setActiveTab, toggleRightPanel } = useEditor();
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(280, Math.min(480, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const renderContent = () => {
    switch (ui.activeTab) {
      case 'layers':
        return <LayersPanel />;
      case 'adjustments':
        return <Adjustments />;
      case 'filters':
        return <FilterPanel />;
      case 'ai':
        return <AIHub />;
      case 'history':
        return <HistoryPanel />;
      default:
        return <LayersPanel />;
    }
  };

  return (
    <div
      className={cn(
        'relative flex bg-editor-surface border-l border-editor-border',
        className
      )}
      style={{ width: ui.rightPanelOpen ? width : 0 }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-10',
          'hover:bg-primary-500/50 transition-colors',
          isResizing && 'bg-primary-500'
        )}
      />

      {/* Toggle Button */}
      <button
        onClick={toggleRightPanel}
        className={cn(
          'absolute -left-4 top-1/2 -translate-y-1/2 z-20',
          'w-4 h-8 flex items-center justify-center',
          'bg-editor-card border border-editor-border rounded-l-lg',
          'text-surface-400 hover:text-white hover:bg-editor-hover',
          'transition-all'
        )}
      >
        {ui.rightPanelOpen ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {ui.rightPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col w-full"
          >
            {/* Tabs */}
            <div className="flex items-center border-b border-editor-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = ui.activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-3 transition-all relative',
                      isActive
                        ? 'text-primary-400'
                        : 'text-surface-400 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-2xs font-medium">{tab.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ui.activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}