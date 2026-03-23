// frontend/src/components/tools/RotateTool.jsx
import React, { useState } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Maximize2, Compass } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function RotateTool() {
  const { activeTool, activeLayerId, updateLayer } = useEditor();
  const [rotation, setRotation] = useState(0);

  const isActive = activeTool === 'rotate';

  const handleRotation = (deg) => {
    const newRot = (rotation + deg) % 360;
    setRotation(newRot);
    if (activeLayerId) updateLayer(activeLayerId, { rotation: newRot });
  };

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <RotateCw size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Orientation</span>
      </div>

      <div className="space-y-6">
        {/* Rotation Dial Mock */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-surface-800 flex items-center justify-center relative bg-editor-card overflow-hidden">
            <motion.div 
              style={{ rotate: rotation }}
              className="absolute inset-0 flex flex-col items-center py-2"
            >
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            </motion.div>
            <div className="z-10 flex flex-col items-center">
              <span className="text-xl font-black text-white">{rotation}°</span>
              <span className="text-[8px] font-bold text-surface-500 uppercase">Degree</span>
            </div>
            {/* Markers */}
            {[0, 90, 180, 270].map(m => (
              <div key={m} className="absolute w-full h-full p-1" style={{ transform: `rotate(${m}deg)` }}>
                <div className="w-0.5 h-2 bg-surface-700 mx-auto" />
              </div>
            ))}
          </div>
          
          <input 
            type="range" min="-180" max="180" value={rotation}
            onChange={(e) => handleRotation(parseInt(e.target.value) - rotation)}
            className="w-full h-1 bg-surface-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => handleRotation(-90)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
            <RotateCcw size={18} />
            <span className="text-[9px] font-bold uppercase">-90°</span>
          </button>
          <button onClick={() => handleRotation(90)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
            <RotateCw size={18} />
            <span className="text-[9px] font-bold uppercase">+90°</span>
          </button>
        </div>

        <div className="pt-2 border-t border-editor-border space-y-3">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Reflect</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white transition-all group">
              <FlipHorizontal size={14} className="group-hover:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase">Horizontal</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white transition-all group">
              <FlipVertical size={14} className="group-hover:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase">Vertical</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
