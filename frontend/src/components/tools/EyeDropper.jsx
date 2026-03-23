// frontend/src/components/tools/EyeDropper.jsx
import React, { useState } from 'react';
import { Pipette as Dropper, Palette, Target, Zap, MousePointer2, Layers } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function EyeDropper() {
  const { activeTool } = useEditor();
  const [sampleSize, setSampleSize] = useState('point'); // point, 3x3, 5x5, 11x11

  const isActive = activeTool === 'eyedropper';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400">
          <Dropper size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Color Sampler</span>
      </div>

      <div className="space-y-5">
        {/* Visual Feedback Circle Mock */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-surface-800 bg-editor-card flex items-center justify-center overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-primary-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
              <Target size={32} className="text-white/40 absolute" />
            </div>
            <div className="absolute -bottom-2 right-0 p-1.5 rounded-lg bg-surface-900 border border-surface-700 text-white shadow-lg">
              <Dropper size={12} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-white uppercase tracking-tighter">#6366F1</span>
            <span className="text-[8px] font-bold text-surface-500 uppercase">RGB(99, 102, 241)</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Sample Size</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'point', label: 'Point' },
              { id: '3x3', label: '3x3 Avg' },
              { id: '5x5', label: '5x5 Avg' },
              { id: '11x11', label: '11x11 Avg' }
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setSampleSize(size.id)}
                className={cn(
                  "py-2 rounded-lg border text-[9px] font-bold uppercase transition-all",
                  sampleSize === size.id 
                    ? "bg-primary-500 text-white border-primary-400 shadow-glow" 
                    : "bg-surface-800 border-surface-700 text-surface-500 hover:text-white"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-editor-card border border-editor-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-surface-400">
              <Layers size={14} />
              <span className="text-[10px] font-bold uppercase">Sample All Layers</span>
            </div>
            <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-primary-500" defaultChecked />
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-800 text-surface-400 hover:text-white text-[10px] font-bold uppercase transition-all">
            <Palette size={12} />
            Save to Palette
          </button>
        </div>
      </div>
    </div>
  );
}
