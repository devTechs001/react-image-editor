// frontend/src/components/tools/MagicWand.jsx
import React, { useState } from 'react';
import { Wand2, Sparkles, Target, Zap, Settings2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function MagicWand() {
  const { activeTool, setActiveTool } = useEditor();
  const [tolerance, setTolerance] = useState(32);
  const [contiguous, setContiguous] = useState(true);

  const isActive = activeTool === 'magic-wand';

  return (
    <div className={cn(
      "flex flex-col gap-3 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400">
          <Wand2 size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Magic Selection</span>
      </div>

      <div className="space-y-4">
        <Slider 
          label="Tolerance"
          value={[tolerance]}
          onValueChange={([v]) => setTolerance(v)}
          min={1}
          max={255}
          size="sm"
        />

        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-bold text-surface-500 uppercase group-hover:text-surface-300">Contiguous</span>
            <input 
              type="checkbox" 
              checked={contiguous}
              onChange={() => setContiguous(!contiguous)}
              className="rounded bg-surface-800 border-surface-700 text-primary-500" 
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-bold text-surface-500 uppercase group-hover:text-surface-300">Anti-alias</span>
            <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-primary-500" defaultChecked />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-800 border border-surface-700 text-[10px] font-bold uppercase text-surface-400 hover:text-white transition-all">
            <Target size={12} />
            Refine
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-500 text-[10px] font-bold uppercase text-white shadow-glow hover:bg-primary-400 transition-all">
            <Zap size={12} />
            Select AI
          </button>
        </div>
      </div>
    </div>
  );
}
