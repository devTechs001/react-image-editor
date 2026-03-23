// frontend/src/components/tools/HealingBrush.jsx
import React, { useState } from 'react';
import { Heart as Patch, Sparkles, Wand2, Info, CheckCircle2, Zap } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function HealingBrush() {
  const { activeTool } = useEditor();
  const [size, setSize] = useState(25);
  const [mode, setMode] = useState('spot'); // spot, patch, content-aware

  const isActive = activeTool === 'healing';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
          <Patch size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Healing Studio</span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'spot', label: 'Spot', icon: Zap },
            { id: 'patch', label: 'Patch', icon: Info },
            { id: 'aware', label: 'AI', icon: Sparkles }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-lg transition-all",
                mode === m.id 
                  ? "bg-amber-500 text-white shadow-glow" 
                  : "bg-surface-800 text-surface-500 hover:text-surface-300"
              )}
            >
              <m.icon size={14} />
              <span className="text-[8px] font-bold uppercase">{m.label}</span>
            </button>
          ))}
        </div>

        <Slider 
          label="Brush Size"
          value={[size]}
          onValueChange={([v]) => setSize(v)}
          min={5}
          max={150}
          size="sm"
        />

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Model: Bio-Heal v4</span>
          </div>
          <p className="text-[9px] text-surface-500 leading-relaxed italic">
            Specifically optimized for skin retouches, removing blemishes, scars, and unwanted small objects with pixel-perfect blending.
          </p>
        </div>

        <button className="w-full py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2">
          <Wand2 size={12} />
          Auto-Retouch All Faces
        </button>
      </div>
    </div>
  );
}
