// frontend/src/components/ui/Accordion.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

export default function Accordion({ items, className, allowMultiple = false }) {
  const [openIndices, setOpenIndices] = useState(new Set([0]));

  const toggleIndex = (index) => {
    const nextIndices = new Set(openIndices);
    if (nextIndices.has(index)) {
      nextIndices.delete(index);
    } else {
      if (!allowMultiple) nextIndices.clear();
      nextIndices.add(index);
    }
    setOpenIndices(nextIndices);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const isOpen = openIndices.has(index);
        return (
          <div key={index} className="border border-editor-border rounded-xl overflow-hidden bg-editor-card/30">
            <button
              onClick={() => toggleIndex(index)}
              className="w-full px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {item.icon && <item.icon size={16} sm:size-18 className="text-surface-400" />}
                <span className="text-xs sm:text-sm font-semibold text-white">{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-surface-500"
              >
                <ChevronDown size={14} sm:size-16 />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-3 sm:px-4 pb-4 pt-0 border-t border-editor-border/50 text-xs sm:text-sm text-surface-400 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
