// frontend/src/components/tools/SelectionTool.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { MousePointer2, Move, Square, BoxSelect, Grab } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function SelectionTool() {
  const { activeTool, setActiveTool, selectedLayerId, layers } = useEditor();
  const [selectionMode, setSelectionMode] = useState('single'); // single, multi, group

  const isActive = activeTool === 'select';

  return (
    <div className={cn(
      "flex flex-col gap-2 p-2 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 px-2 py-1 border-b border-editor-border mb-1">
        <MousePointer2 size={14} className="text-primary-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Selection Tool</span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {[
          { id: 'single', icon: MousePointer2, label: 'Single' },
          { id: 'multi', icon: BoxSelect, label: 'Multi' },
          { id: 'group', icon: Square, label: 'Group' },
          { id: 'move', icon: Move, label: 'Direct' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectionMode(mode.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
              selectionMode === mode.id 
                ? "bg-primary-500 text-white shadow-glow" 
                : "text-surface-400 hover:bg-white/5"
            )}
          >
            <mode.icon size={16} />
            <span className="text-[8px] font-bold uppercase">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-editor-border space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-bold text-surface-500 uppercase">Auto-Select</span>
          <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-primary-500" defaultChecked />
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-bold text-surface-500 uppercase">Snap to Grid</span>
          <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-primary-500" />
        </div>
      </div>
    </div>
  );
}
