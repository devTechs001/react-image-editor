// frontend/src/components/tools/FillTool.jsx
import React, { useState } from 'react';
import { PaintBucket, Sparkles, Wand2, MousePointer2, Settings2, Palette } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function FillTool() {
  const { activeTool } = useEditor();
  const [tolerance, setTolerance] = useState(32);
  const [fillMode, setFillMode] = useState('solid'); // solid, content-aware

  const isActive = activeTool === 'fill';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
          <PaintBucket size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Smart Fill</span>
      </div>

      <div className="space-y-5">
        <div className="flex bg-surface-800 rounded-xl p-1 gap-1">
          {[
            { id: 'solid', label: 'Color', icon: Palette },
            { id: 'aware', label: 'AI Fill', icon: Sparkles }
          ].map((modeItem) => (
            <button
              key={modeItem.id}
              onClick={() => setFillMode(modeItem.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all",
                fillMode === modeItem.id ? "bg-pink-500 text-white shadow-glow" : "text-surface-500 hover:text-white"
              )}
            >
              <modeItem.icon size={12} />
              {modeItem.label}
            </button>
          ))}
        </div>

        {fillMode === 'solid' ? (
          <div className="space-y-5">
            <Slider 
              label="Sensitivity (Tolerance)"
              value={[tolerance]}
              onValueChange={([v]) => setTolerance(v)}
              min={1}
              max={255}
              size="sm"
            />
            
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Settings</span>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-800 border border-surface-700 cursor-pointer group">
                  <span className="text-[10px] font-bold text-surface-400 uppercase group-hover:text-white">Sample All Layers</span>
                  <input type="checkbox" className="rounded bg-surface-900 border-surface-600 text-pink-500" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-800 border border-surface-700 cursor-pointer group">
                  <span className="text-[10px] font-bold text-surface-400 uppercase group-hover:text-white">Anti-Alias</span>
                  <input type="checkbox" className="rounded bg-surface-900 border-surface-600 text-pink-500" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-3 group cursor-pointer relative overflow-hidden">
            <div className="flex items-center gap-2 text-pink-400 mb-1 relative z-10">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase">Content-Aware Engine</span>
            </div>
            <p className="text-[10px] text-surface-500 leading-relaxed relative z-10 italic">
              AI intelligently analyzes surrounding pixels to seamlessly fill the selected area with matching textures and patterns.
            </p>
            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform">
              <PaintBucket size={80} />
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-editor-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-surface-400">
            <Palette size={14} />
            <span className="text-[10px] font-bold uppercase">Active Color</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-pink-500 border-2 border-white/20 shadow-glow-sm cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}
