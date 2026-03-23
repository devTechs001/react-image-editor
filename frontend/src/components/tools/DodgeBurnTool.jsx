// frontend/src/components/tools/DodgeBurnTool.jsx
import React, { useState } from 'react';
import { Sun, Moon, Flame, Zap, MousePointer2, Settings2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function DodgeBurnTool() {
  const { activeTool } = useEditor();
  const [mode, setMode] = useState('dodge'); // dodge, burn
  const [exposure, setExposure] = useState(25);
  const [range, setRange] = useState('midtones'); // shadows, midtones, highlights

  const isActive = activeTool === 'dodge-burn';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400">
          <Flame size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Light Sculptor</span>
      </div>

      <div className="space-y-5">
        <div className="flex bg-surface-800 rounded-xl p-1">
          <button
            onClick={() => setMode('dodge')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
              mode === 'dodge' ? "bg-white text-black shadow-glow" : "text-surface-500 hover:text-surface-300"
            )}
          >
            <Sun size={14} />
            Dodge
          </button>
          <button
            onClick={() => setMode('burn')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
              mode === 'burn' ? "bg-black text-white shadow-glow border border-white/10" : "text-surface-500 hover:text-surface-300"
            )}
          >
            <Moon size={14} />
            Burn
          </button>
        </div>

        <Slider 
          label="Exposure Strength"
          value={[exposure]}
          onValueChange={([v]) => setExposure(v)}
          min={1}
          max={100}
          size="sm"
        />

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Target Range</span>
          <div className="grid grid-cols-3 gap-1">
            {['shadows', 'midtones', 'highlights'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "py-2 rounded-lg border text-[8px] font-bold uppercase transition-all",
                  range === r 
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-glow" 
                    : "bg-surface-800 border-surface-700 text-surface-500 hover:text-surface-300"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3 group relative overflow-hidden">
          <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-[10px] text-surface-500 leading-relaxed italic">
            Pro Tip: Use a large, soft-edged brush with low exposure for natural skin contouring.
          </p>
          <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:rotate-45 transition-transform">
            <Flame size={60} />
          </div>
        </div>
      </div>
    </div>
  );
}
