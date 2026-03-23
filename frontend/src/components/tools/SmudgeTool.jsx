// frontend/src/components/tools/SmudgeTool.jsx
import React, { useState } from 'react';
import { Hand, Waves, Fingerprint, MousePointer2, RefreshCw } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function SmudgeTool() {
  const { activeTool } = useEditor();
  const [strength, setStrength] = useState(50);
  const [size, setSize] = useState(30);

  const isActive = activeTool === 'smudge';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
          <Hand size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Smudge & Warp</span>
      </div>

      <div className="space-y-5">
        <Slider 
          label="Smudge Strength"
          value={[strength]}
          onValueChange={([v]) => setStrength(v)}
          min={1}
          max={100}
          size="sm"
        />

        <Slider 
          label="Finger Size"
          value={[size]}
          onValueChange={([v]) => setSize(v)}
          min={5}
          max={200}
          size="sm"
        />

        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Dynamics</span>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:bg-white/5 transition-all">
              <Waves size={18} />
              <span className="text-[9px] font-bold uppercase">Flowing</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 transition-all">
              <Fingerprint size={18} />
              <span className="text-[9px] font-bold uppercase">Textured</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-editor-card border border-editor-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-surface-400">
            <RefreshCw size={14} />
            <span className="text-[10px] font-bold uppercase">Sample All Layers</span>
          </div>
          <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-orange-500" defaultChecked />
        </div>
      </div>
    </div>
  );
}
