// frontend/src/components/canvas/ZoomPan.jsx
import React from 'react';
import { Search, ZoomIn, ZoomOut, Maximize, MousePointer2, Hand } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function ZoomPan() {
  const { zoom, setZoom, pan, setPan, activeTool, setActiveTool } = useEditor();

  const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8];

  const handleZoom = (delta) => {
    setZoom(prev => {
      const currentIndex = zoomLevels.indexOf(prev);
      if (delta > 0 && currentIndex < zoomLevels.length - 1) return zoomLevels[currentIndex + 1];
      if (delta < 0 && currentIndex > 0) return zoomLevels[currentIndex - 1];
      return prev;
    });
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-editor-surface/90 backdrop-blur-md border border-editor-border rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-elevated">
      <div className="flex border-r border-editor-border pr-0.5 sm:pr-1 gap-0.5">
        <button
          onClick={() => setActiveTool('select')}
          className={cn(
            "p-1 sm:p-1.5 rounded-lg transition-all",
            activeTool === 'select' ? "bg-primary-500 text-white" : "text-surface-400 hover:text-white"
          )}
          title="Select (V)"
        >
          <MousePointer2 size={14} sm:size-16 />
        </button>
        <button
          onClick={() => setActiveTool('pan')}
          className={cn(
            "p-1 sm:p-1.5 rounded-lg transition-all",
            activeTool === 'pan' ? "bg-primary-500 text-white" : "text-surface-400 hover:text-white"
          )}
          title="Pan (H)"
        >
          <Hand size={14} sm:size-16 />
        </button>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 px-0.5 sm:px-1">
        <button
          onClick={() => handleZoom(-1)}
          className="p-1 sm:p-1.5 rounded-lg text-surface-400 hover:text-white transition-all"
        >
          <ZoomOut size={14} sm:size-16 />
        </button>
        
        <div className="min-w-[50px] sm:min-w-[60px] text-center">
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="bg-transparent text-[10px] sm:text-[11px] font-bold text-white border-none focus:ring-0 p-0 text-center cursor-pointer"
          >
            {zoomLevels.map(level => (
              <option key={level} value={level} className="bg-editor-surface text-white">
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleZoom(1)}
          className="p-1 sm:p-1.5 rounded-lg text-surface-400 hover:text-white transition-all"
        >
          <ZoomIn size={14} sm:size-16 />
        </button>
      </div>

      <div className="border-l border-editor-border pl-0.5 sm:pl-1">
        <button
          onClick={resetViewport}
          className="p-1 sm:p-1.5 rounded-lg text-surface-400 hover:text-white transition-all"
          title="Reset View"
        >
          <Maximize size={14} sm:size-16 />
        </button>
      </div>
    </div>
  );
}
