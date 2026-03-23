// frontend/src/components/canvas/MultiCanvasManager.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, ChevronDown, Copy, Eye, Lock } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

export default function MultiCanvasManager() {
  const { layers, activeLayerId, setActiveLayerId, addLayer, removeLayer, duplicateLayer } = useEditor();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-20 left-6 w-64 z-40">
      <div className="bg-editor-surface border border-editor-border rounded-2xl shadow-elevated overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-10 flex items-center justify-between px-4 bg-editor-card/50 border-b border-editor-border hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-primary-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Active Canvases</span>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 0 : 180 }}>
            <ChevronDown size={14} className="text-surface-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-dark">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerId(layer.id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group",
                      activeLayerId === layer.id 
                        ? "bg-primary-500/10 border border-primary-500/20" 
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center overflow-hidden">
                      {layer.thumbnail ? (
                        <img src={layer.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Layers size={14} className="text-surface-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[11px] font-medium truncate",
                        activeLayerId === layer.id ? "text-white" : "text-surface-400"
                      )}>
                        {layer.name}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-white/10 text-surface-500"><Eye size={12} /></button>
                      <button className="p-1 rounded hover:bg-white/10 text-surface-500"><Copy size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-2 border-t border-editor-border bg-black/20">
                <Button 
                  variant="ghost" 
                  size="xs" 
                  fullWidth 
                  icon={Plus}
                  onClick={() => addLayer({ name: `New Canvas ${layers.length + 1}` })}
                >
                  New Canvas
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
