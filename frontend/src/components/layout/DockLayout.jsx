// frontend/src/components/layout/DockLayout.jsx
import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';
import { X, Maximize2, Minimize2, MoreVertical } from 'lucide-react';

const DockWindow = ({ title, children, onClose, onMaximize, isMaximized }) => (
  <motion.div
    layout
    className={cn(
      "flex flex-col bg-editor-card border border-editor-border rounded-xl shadow-elevated overflow-hidden",
      isMaximized ? "fixed inset-4 z-50" : "relative"
    )}
  >
    <div className="h-10 flex items-center justify-between px-4 bg-editor-surface border-b border-editor-border cursor-grab active:cursor-grabbing">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onMaximize} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-500 hover:text-white transition-colors">
          {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-500 hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-dark">
      {children}
    </div>
  </motion.div>
);

export default function DockLayout({ items = [] }) {
  const [windows, setWindows] = useState(items);
  const [maximizedId, setMaximizedId] = useState(null);

  return (
    <div className="h-full w-full p-4 overflow-hidden">
      <Reorder.Group
        axis="y"
        values={windows}
        onReorder={setWindows}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {windows.map((window) => (
          <Reorder.Item key={window.id} value={window}>
            <DockWindow
              title={window.title}
              isMaximized={maximizedId === window.id}
              onMaximize={() => setMaximizedId(maximizedId === window.id ? null : window.id)}
              onClose={() => setWindows(windows.filter(w => w.id !== window.id))}
            >
              {window.content}
            </DockWindow>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
