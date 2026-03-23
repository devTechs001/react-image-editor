// frontend/src/components/tools/ShapeTool.jsx
import React, { useState } from 'react';
import { Square, Circle, Triangle, Star, Hexagon, MousePointer2, Palette, ShieldCheck, Maximize2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function ShapeTool() {
  const { activeTool } = useEditor();
  const [selectedShape, setSelectedShape] = useState('square');
  const [cornerRadius, setCornerRadius] = useState(8);
  const [strokeWidth, setStrokeWidth] = useState(2);

  const isActive = activeTool === 'shape';

  const shapes = [
    { id: 'square', icon: Square, label: 'Square' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'star', icon: Star, label: 'Star' },
    { id: 'hex', icon: Hexagon, label: 'Hex' },
    { id: 'custom', icon: Maximize2, label: 'Custom' }
  ];

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
          <Square size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Vector Elements</span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => setSelectedShape(shape.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                selectedShape === shape.id 
                  ? "bg-purple-500 text-white border-purple-400 shadow-glow" 
                  : "bg-surface-800 border-surface-700 text-surface-500 hover:text-white"
              )}
            >
              <shape.icon size={18} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">{shape.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5 pt-2">
          <Slider 
            label="Corner Radius"
            value={[cornerRadius]}
            onValueChange={([v]) => setCornerRadius(v)}
            min={0}
            max={100}
            size="sm"
          />

          <Slider 
            label="Stroke Width"
            value={[strokeWidth]}
            onValueChange={([v]) => setStrokeWidth(v)}
            min={0}
            max={50}
            size="sm"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-editor-border">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Style Options</span>
            <ShieldCheck size={12} className="text-emerald-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-surface-400 uppercase">
                <Palette size={10} />
                Fill
              </div>
              <div className="w-full h-4 rounded bg-primary-500 border border-white/10" />
            </div>
            <div className="p-2.5 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-surface-400 uppercase">
                <div className="w-2.5 h-2.5 border-2 border-current rounded-sm" />
                Stroke
              </div>
              <div className="w-full h-4 rounded bg-white border border-white/10" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-editor-card border border-editor-border group cursor-pointer hover:border-purple-500/30 transition-all">
          <div className="flex items-center gap-2 text-surface-400">
            <span className="text-[10px] font-bold uppercase">Constraint Proportions</span>
          </div>
          <input type="checkbox" className="rounded bg-surface-800 border-surface-700 text-purple-500" defaultChecked />
        </div>
      </div>
    </div>
  );
}
