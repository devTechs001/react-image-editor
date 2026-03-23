// frontend/src/components/canvas/HistoryStack.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Undo2, Redo2, RotateCcw, Clock } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

export default function HistoryStack() {
  const { history, historyIndex, undo, redo, setHistoryIndex } = useEditor();

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-3 sm:p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5 sm:gap-2">
            <History size={14} sm:size-16 className="text-primary-400" />
            History
          </h3>
          <div className="flex gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon-sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 size={12} sm:size-14 />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo2 size={12} sm:size-14 />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 scrollbar-thin scrollbar-dark space-y-1">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-center space-y-2">
              <Clock size={20} sm:size-24 className="text-surface-600" />
              <p className="text-[10px] sm:text-xs text-surface-500">No history actions yet</p>
            </div>
          ) : (
            history.map((item, index) => (
              <motion.button
                key={item.timestamp || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setHistoryIndex(index)}
                className={cn(
                  "w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-all text-left",
                  index === historyIndex 
                    ? "bg-primary-500/10 border border-primary-500/20 text-primary-400" 
                    : index > historyIndex 
                      ? "text-surface-600 grayscale italic opacity-50" 
                      : "text-surface-300 hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full",
                  index === historyIndex ? "bg-primary-500 shadow-glow" : "bg-surface-700"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium truncate">{item.action || 'Canvas Action'}</p>
                  <p className="text-[8px] sm:text-[10px] md:text-sm text-surface-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 sm:p-4 border-t border-editor-border">
        <Button variant="secondary" fullWidth size="sm" icon={RotateCcw}>
          <span className="text-xs sm:text-sm">Clear History</span>
        </Button>
      </div>
    </div>
  );
}
