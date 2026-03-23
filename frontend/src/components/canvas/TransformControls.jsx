// frontend/src/components/canvas/TransformControls.jsx
import React from 'react';
import { Move, RotateCw, Maximize2, Layers } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function TransformControls() {
  const { selectedLayerId, layers, updateLayer } = useEditor();
  const activeLayer = layers.find(l => l.id === selectedLayerId);

  if (!activeLayer) return null;

  return (
    <div className="flex items-center gap-4 bg-editor-surface/90 backdrop-blur-md border border-editor-border rounded-2xl px-4 py-2 shadow-elevated">
      <div className="flex items-center gap-2 border-r border-editor-border pr-4">
        <Move size={14} className="text-primary-400" />
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-surface-500 uppercase font-bold">X</span>
            <input 
              type="number" 
              className="w-14 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white"
              value={Math.round(activeLayer.x || 0)}
              onChange={(e) => updateLayer(activeLayer.id, { x: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-surface-500 uppercase font-bold">Y</span>
            <input 
              type="number" 
              className="w-14 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white"
              value={Math.round(activeLayer.y || 0)}
              onChange={(e) => updateLayer(activeLayer.id, { y: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-r border-editor-border pr-4">
        <RotateCw size={14} className="text-emerald-400" />
        <div className="flex items-center gap-1.5">
          <input 
            type="number" 
            className="w-14 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white"
            value={Math.round(activeLayer.rotation || 0)}
            onChange={(e) => updateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })}
          />
          <span className="text-[10px] text-surface-500">°</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Maximize2 size={14} className="text-amber-400" />
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-surface-500 uppercase font-bold">W</span>
            <input 
              type="number" 
              className="w-16 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white"
              value={Math.round(activeLayer.width || 0)}
              onChange={(e) => updateLayer(activeLayer.id, { width: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-surface-500 uppercase font-bold">H</span>
            <input 
              type="number" 
              className="w-16 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white"
              value={Math.round(activeLayer.height || 0)}
              onChange={(e) => updateLayer(activeLayer.id, { height: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
