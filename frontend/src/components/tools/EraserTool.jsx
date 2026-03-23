// frontend/src/components/tools/EraserTool.jsx
import React, { useState } from 'react';
import { Eraser, Trash2, RotateCcw, Sparkles, MousePointer2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function EraserTool() {
  const { activeTool } = useEditor();
  const [size, setSize] = useState(40);
  const [hardness, setHardness] = useState(0);

  const isActive = activeTool === 'eraser';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <Eraser size={16} className="text-primary-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Precision Eraser</span>
      </div>

      <div className="space-y-5">
        <Slider 
          label="Eraser Size"
          value={[size]}
          onValueChange={([v]) => setSize(v)}
          min={1}
          max={200}
          size="sm"
        />

        <Slider 
          label="Edge Hardness"
          value={[hardness]}
          onValueChange={([v]) => setHardness(v)}
          min={0}
          max={100}
          size="sm"
        />

        <div className="space-y-3 pt-2 border-t border-editor-border">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">AI Smart Eraser</h4>
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 group cursor-pointer hover:border-primary-500/40 transition-all">
            <div className="flex items-center gap-2 text-primary-400 mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase">Magic Erase</span>
            </div>
            <p className="text-[9px] text-surface-400 leading-relaxed">Automatically remove objects and fill background using neural inpainting.</p>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all">
          <RotateCcw size={12} />
          Clear All Marks
        </button>
      </div>
    </div>
  );
}
