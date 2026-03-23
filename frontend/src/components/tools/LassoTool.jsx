// frontend/src/components/tools/LassoTool.jsx
import React, { useState } from 'react';
import { MousePointer2, LassoSelect as Lasso, Move, Magnet, Scissors } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function LassoTool() {
  const { activeTool } = useEditor();
  const [lassoType, setLassoType] = useState('free'); // free, polygonal, magnetic

  const isActive = activeTool === 'lasso';

  return (
    <div className={cn(
      "flex flex-col gap-3 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <Lasso size={16} className="text-primary-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Lasso Tool</span>
      </div>

      <div className="flex flex-col gap-1">
        {[
          { id: 'free', icon: Lasso, label: 'Freehand Lasso' },
          { id: 'poly', icon: Move, label: 'Polygonal Lasso' },
          { id: 'magnetic', icon: Magnet, label: 'Magnetic Lasso' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setLassoType(type.id)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
              lassoType === type.id 
                ? "bg-primary-500/10 border border-primary-500/20 text-primary-400" 
                : "text-surface-400 hover:bg-white/5"
            )}
          >
            <type.icon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-2 pt-2 border-t border-editor-border">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-bold text-surface-500 uppercase">Feather</span>
          <span className="text-[9px] font-bold text-white">0px</span>
        </div>
        <input type="range" className="w-full h-1 bg-surface-800 rounded-full appearance-none cursor-pointer accent-primary-500" />
        
        <button className="w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-lg border border-editor-border text-[10px] font-bold uppercase text-surface-400 hover:text-white hover:bg-white/5 transition-all">
          <Scissors size={12} />
          Refine Edge
        </button>
      </div>
    </div>
  );
}
