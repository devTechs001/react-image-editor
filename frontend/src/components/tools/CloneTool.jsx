// frontend/src/components/tools/CloneTool.jsx
import React, { useState } from 'react';
import { Copy, Target, MousePointer2, Sparkles, Wand2, Info } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function CloneTool() {
  const { activeTool } = useEditor();
  const [size, setSize] = useState(30);
  const [hardness, setHardness] = useState(50);
  const [sourceSet, setSourceSet] = useState(false);

  const isActive = activeTool === 'clone';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Copy size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Clone Stamp</span>
      </div>

      <div className="space-y-5">
        <div className={cn(
          "p-3 rounded-xl border transition-all flex items-center gap-3",
          sourceSet ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-blue-500/5 border-blue-500/20 text-blue-400"
        )}>
          <Target size={18} className={cn(sourceSet && "animate-pulse")} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-tight">
              {sourceSet ? "Source Active" : "Set Source"}
            </p>
            <p className="text-[9px] text-surface-500 leading-tight">
              {sourceSet ? "Alt+Click to relocate" : "Hold Alt and Click to select origin point"}
            </p>
          </div>
        </div>

        <Slider 
          label="Brush Size"
          value={[size]}
          onValueChange={([v]) => setSize(v)}
          min={1}
          max={100}
          size="sm"
        />

        <Slider 
          label="Opacity"
          value={[100]}
          min={0}
          max={100}
          size="sm"
        />

        <div className="space-y-3 pt-2 border-t border-editor-border">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">AI Clone Helper</h4>
          <div className="p-3 rounded-xl bg-surface-800 border border-surface-700 flex items-start gap-3 group cursor-help">
            <Wand2 size={14} className="text-primary-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-surface-500 leading-relaxed">
              <span className="text-white font-bold">Auto-Blend:</span> AI will automatically match lighting and texture when cloning between different areas.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSourceSet(!sourceSet)}
          className="w-full py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white text-[10px] font-bold uppercase transition-all"
        >
          Reset Origin
        </button>
      </div>
    </div>
  );
}
