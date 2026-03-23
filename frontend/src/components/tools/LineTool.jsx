// frontend/src/components/tools/LineTool.jsx
import React, { useState } from 'react';
import { Minus, Move, Scissors, Settings2, Palette, Sparkles } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function LineTool() {
  const { activeTool } = useEditor();
  const [thickness, setThickness] = useState(4);
  const [lineStyle, setLineStyle] = useState('solid'); // solid, dashed, dotted

  const isActive = activeTool === 'line';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Minus size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Line Constructor</span>
      </div>

      <div className="space-y-5">
        <Slider 
          label="Thickness"
          value={[thickness]}
          onValueChange={([v]) => setThickness(v)}
          min={1}
          max={100}
          size="sm"
        />

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Pattern</span>
          <div className="flex bg-surface-800 rounded-xl p-1 gap-1">
            {['solid', 'dashed', 'dotted'].map((style) => (
              <button
                key={style}
                onClick={() => setLineStyle(style)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                  lineStyle === style ? "bg-blue-500 text-white shadow-glow" : "text-surface-500 hover:text-white"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-editor-border">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Arrowheads</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800 border border-surface-700">
              <span className="text-[9px] font-bold text-surface-400 uppercase">Start</span>
              <div className="w-4 h-4 border-2 border-dashed border-surface-600 rounded" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800 border border-surface-700">
              <span className="text-[9px] font-bold text-surface-400 uppercase">End</span>
              <Move size={14} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 group cursor-pointer relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-400 mb-1 relative z-10">
            <Sparkles size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase">Smart Snap</span>
          </div>
          <p className="text-[9px] text-surface-500 leading-relaxed relative z-10">
            AI will automatically snap lines to important image features and grid intersections.
          </p>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
            <Settings2 size={60} />
          </div>
        </div>
      </div>
    </div>
  );
}
