// frontend/src/components/ui/Notification.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

export default function Notification({ 
  items = [], 
  onRemove, 
  onClearAll,
  className 
}) {
  return (
    <div className={cn("fixed top-16 sm:top-20 right-3 sm:right-6 z-[9999] w-72 sm:w-80 space-y-2 sm:space-y-3 pointer-events-none", className)}>
      {items.length > 1 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClearAll}
          className="ml-auto flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface-800 border border-surface-700 text-[8px] sm:text-[10px] font-bold text-surface-400 hover:text-white hover:border-surface-600 transition-all pointer-events-auto shadow-elevated"
        >
          <Trash2 size={10} />
          CLEAR ALL
        </motion.button>
      )}

      <AnimatePresence mode="popLayout">
        {items.map((note) => {
          const icons = {
            success: <CheckCircle className="text-emerald-400" size={14} />,
            error: <AlertCircle className="text-red-400" size={14} />,
            info: <Info className="text-blue-400" size={14} />,
            warning: <AlertCircle className="text-amber-400" size={14} />,
            default: <Bell className="text-primary-400" size={14} />
          };

          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={cn(
                "p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-editor-card border border-editor-border shadow-elevated backdrop-blur-xl pointer-events-auto relative group overflow-hidden",
                note.type === 'error' && "border-red-500/20 bg-red-500/5",
                note.type === 'success' && "border-emerald-500/20 bg-emerald-500/5"
              )}
            >
              {/* Progress bar for auto-dismissing notes */}
              {note.duration && (
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: note.duration / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-0.5 bg-primary-500/30" 
                />
              )}

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5">{icons[note.type || 'default']}</div>
                <div className="flex-1 min-w-0 pr-3 sm:pr-4">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{note.title}</h4>
                  <p className="text-[10px] sm:text-xs text-surface-400 leading-relaxed">{note.message}</p>
                </div>
                <button 
                  onClick={() => onRemove(note.id)}
                  className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 p-0.5 sm:p-1 rounded-lg text-surface-600 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
