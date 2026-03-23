// frontend/src/components/tools/SharpenTool.jsx
import React, { useState } from 'react';
import { Target, Zap, Waves, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function SharpenTool() {
  const { activeTool } = useEditor();
  const [amount, setAmount] = useState(50);
  const [threshold, setThreshold] = useState(10);

  const isActive = activeTool === 'sharpen';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Waves size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Detail Refiner</span>
      </div>

      <div className="space-y-5">
        <Slider 
          label="Sharpness Amount"
          value={[amount]}
          onValueChange={([v]) => setAmount(v)}
          min={0}
          max={100}
          size="sm"
        />

        <Slider 
          label="Edge Threshold"
          value={[threshold]}
          onValueChange={([v]) => setThreshold(v)}
          min={0}
          max={50}
          size="sm"
        />

        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-3 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-cyan-400 relative z-10">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">AI Super Resolution</span>
          </div>
          <p className="text-[9px] text-surface-500 leading-relaxed relative z-10">
            Upscale and sharpen low-resolution images using neural hallucination to recreate missing details.
          </p>
          <button className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase rounded-lg transition-all relative z-10 flex items-center justify-center gap-1">
            Run AI Upscaler
            <ChevronRight size={12} />
          </button>
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-150 transition-transform">
            <Waves size={60} />
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 text-surface-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[9px] font-bold uppercase">Halo Protection Active</span>
        </div>
      </div>
    </div>
  );
}
