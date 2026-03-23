// frontend/src/components/tools/GradientTool.jsx
import React, { useState } from 'react';
import { Palette, Move, RotateCw, Sparkles, Wand2, Info, ChevronRight } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function GradientTool() {
  const { activeTool } = useEditor();
  const [gradientType, setGradientType] = useState('linear'); // linear, radial, diamond
  const [angle, setAngle] = useState(90);

  const isActive = activeTool === 'gradient';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <Palette size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Gradient Studio</span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-800 rounded-xl border border-surface-700">
          {['linear', 'radial', 'diamond'].map((type) => (
            <button
              key={type}
              onClick={() => setGradientType(type)}
              className={cn(
                "py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                gradientType === type ? "bg-indigo-500 text-white shadow-glow" : "text-surface-500 hover:text-surface-300"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <Slider 
          label="Flow Angle"
          value={[angle]}
          onValueChange={([v]) => setAngle(v)}
          min={0}
          max={360}
          size="sm"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Active Gradient</span>
            <button className="text-[9px] text-primary-400 font-bold uppercase hover:underline">Edit Library</button>
          </div>
          <div className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border border-white/10 shadow-inner relative group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Open Editor</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 relative overflow-hidden group cursor-pointer">
          <div className="flex items-center gap-2 text-indigo-400 relative z-10">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">AI Color Match</span>
          </div>
          <p className="text-[9px] text-surface-500 leading-relaxed relative z-10">
            Generate a custom gradient that perfectly matches the color palette of your background image.
          </p>
          <button className="w-full py-2 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg shadow-glow relative z-10 flex items-center justify-center gap-1 group-hover:scale-[1.02] transition-transform">
            Magic Blend
            <ChevronRight size={12} />
          </button>
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
            <Wand2 size={60} />
          </div>
        </div>
      </div>
    </div>
  );
}
