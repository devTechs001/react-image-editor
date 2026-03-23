// frontend/src/components/tools/PencilTool.jsx
import React, { useState } from 'react';
import { Pencil, PenTool, Brush, Eraser, Palette } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function PencilTool() {
  const { activeTool, toolOptions, setToolOptions } = useEditor();
  const [size, setSize] = useState(2);
  const [hardness, setHardness] = useState(100);

  const isActive = activeTool === 'pencil';

  return (
    <div className={cn(
      "flex flex-col gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-editor-border pb-1.5 sm:pb-2">
        <Pencil size={14} sm:size-16 className="text-primary-400" />
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white">Precision Pencil</span>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <Slider 
          label="Stroke Size"
          value={[size]}
          onValueChange={([v]) => setSize(v)}
          min={1}
          max={20}
          size="sm"
        />

        <Slider 
          label="Opacity"
          value={[toolOptions.pencilOpacity || 100]}
          onValueChange={([v]) => setToolOptions({ ...toolOptions, pencilOpacity: v })}
          min={0}
          max={100}
          size="sm"
        />

        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-[9px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Mode</span>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-1.5 sm:py-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[9px] sm:text-[10px] font-bold uppercase">Basic</button>
            <button className="py-1.5 sm:py-2 rounded-lg bg-surface-800 text-surface-500 text-[9px] sm:text-[10px] font-bold uppercase hover:text-surface-300">Smooth</button>
          </div>
        </div>

        <div className="pt-1.5 sm:pt-2 border-t border-editor-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={12} sm:size-14 className="text-surface-500" />
            <span className="text-[9px] sm:text-[10px] font-bold text-surface-400 uppercase">Ink Color</span>
          </div>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-white/20 shadow-glow cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}
