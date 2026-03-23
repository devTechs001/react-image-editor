// frontend/src/components/workspace/RightPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sliders,
  Sparkles,
  Palette,
  History,
  ChevronLeft,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import LayersPanel from '@/components/layers/LayersPanel';
import Adjustments from '@/components/filters/Adjustments';
import FilterPanel from '@/components/filters/FilterPanel';
import AIHub from '@/components/ai/AIHub';
import BackgroundRemoval from '@/components/ai/BackgroundRemoval';
import AutoEnhance from '@/components/ai/AutoEnhance';
import FaceSwap from '@/components/ai/FaceSwap';
import BackgroundReplacement from '@/components/ai/BackgroundReplacement';
import Colorization from '@/components/ai/Colorization';
import Denoising from '@/components/ai/Denoising';
import StyleTransfer from '@/components/ai/StyleTransfer';
import FaceDetection from '@/components/ai/FaceDetection';
import ObjectDetection from '@/components/ai/ObjectDetection';
import AIPrompts from '@/components/ai/AIPrompts';
import HistoryStack from '@/components/canvas/HistoryStack';
import AssetsPanel from './AssetsPanel';
import LibraryPanel from './LibraryPanel';
import PresetsPanel from './PresetsPanel';
import PropertiesPanel from './PropertiesPanel';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

const tabs = [
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'properties', icon: Sliders, label: 'Properties' },
  { id: 'assets', icon: ImageIcon, label: 'Assets' },
  { id: 'presets', icon: Palette, label: 'Presets' },
  { id: 'ai', icon: Sparkles, label: 'AI' },
  { id: 'history', icon: History, label: 'History' }
];

export default function RightPanel({ className }) {
  const { 
    ui, 
    activeTab, 
    setActiveTab,
    image,
    setImage,
    addToHistory
  } = useEditor();
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  // Safe access to ui state
  const rightPanelOpen = ui?.rightPanelOpen ?? true;

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(240, Math.min(400, newWidth)));
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
    // If a tool is active, render that tool's panel
    if (activeTab === 'ai' && ui.activeAITool) {
      switch (ui.activeAITool) {
        case 'background-remove':
          return <BackgroundRemoval image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'enhance':
          return <AutoEnhance image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'face-swap':
          return <FaceSwap image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'background-replace':
          return <BackgroundReplacement image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'colorize':
          return <Colorization image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'denoise':
          return <Denoising image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'style-transfer':
          return <StyleTransfer image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'face-detect':
          return <FaceDetection image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'object-detect':
          return <ObjectDetection image={image} onComplete={(result) => {
            setImage(result);
            addToHistory(result);
          }} />;
        case 'generate':
          return <AIPrompts onGenerate={(prompt) => {
            // Generation logic would go here
          }} />;
        default:
          return <AIHub onToolSelect={(tool) => setUI({ ...ui, activeAITool: tool.id })} />;
      }
    }

    switch (activeTab) {
      case 'layers':
        return <LayersPanel />;
      case 'assets':
        return <AssetsPanel />;
      case 'presets':
        return <PresetsPanel />;
      case 'properties':
        return <PropertiesPanel />;
      case 'library':
        return <LibraryPanel />;
      case 'ai':
        return <AIHub onToolSelect={(tool) => setUI({ ...ui, activeAITool: tool.id })} />;
      case 'history':
        return <HistoryStack />;
      default:
        return <LayersPanel />;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        initial={false}
        animate={{
          x: rightPanelOpen ? 0 : '100%',
          width: rightPanelOpen ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? width : '100%') : 0
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed right-0 top-0 bottom-0',
          'bg-editor-surface border-l border-editor-border',
          'z-50 overflow-hidden',
          'flex flex-col',
          'md:relative md:z-auto',
          className
        )}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-2.5 sm:p-3 border-b border-editor-border bg-editor-surface">
          <h3 className="text-xs sm:text-sm font-semibold text-white">
            {tabs.find(t => t.id === activeTab)?.label || 'Panel'}
          </h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {}}
            className="text-surface-400"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Desktop Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:block absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-10 hover:bg-primary-500/50 transition-colors"
        />

        {/* Tab Navigation - Mobile: Horizontal scroll, Desktop: Vertical */}
        <div className="md:hidden flex overflow-x-auto scrollbar-hide border-b border-editor-border bg-editor-surface">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center gap-1 px-3 sm:px-4 py-2.5 sm:py-3',
                  'border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-surface-400'
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] sm:text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
          {renderContent()}
        </div>
      </motion.div>
    </>
  );
}
