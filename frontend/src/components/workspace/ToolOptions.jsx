// frontend/src/components/workspace/ToolOptions.jsx
import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { 
  Type, 
  Square, 
  MousePointer2, 
  Crop, 
  RotateCw, 
  Brush,
  Minus,
  Plus
} from 'lucide-react';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function ToolOptions({ tool }) {
  const { toolOptions, setToolOptions } = useEditor();

  const renderToolControls = () => {
    switch (tool) {
      case 'select':
        return (
          <div className="flex items-center gap-4 text-xs font-medium text-surface-400">
            <div className="flex items-center gap-2">
              <MousePointer2 size={14} />
              <span>Selection Mode</span>
            </div>
            <div className="h-4 w-px bg-editor-border" />
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 hover:text-white transition-colors">
                <input type="checkbox" className="rounded bg-surface-800 border-surface-700" />
                Auto-select
              </label>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface-800 border border-surface-700">
              <Type size={14} className="text-surface-400" />
              <select className="bg-transparent text-xs text-white border-none focus:ring-0">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Open Sans</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-400">Size</span>
              <input type="number" defaultValue={24} className="w-12 bg-surface-800 border-surface-700 rounded px-1.5 py-0.5 text-xs text-white" />
            </div>
            <div className="h-4 w-px bg-editor-border" />
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-white/5 font-bold text-xs text-white">B</button>
              <button className="p-1.5 rounded hover:bg-white/5 italic text-xs text-white">I</button>
              <button className="p-1.5 rounded hover:bg-white/5 underline text-xs text-white">U</button>
            </div>
          </div>
        );

      case 'brush':
        return (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 w-48">
              <span className="text-xs text-surface-400 whitespace-nowrap">Size</span>
              <Slider 
                min={1} 
                max={100} 
                value={[toolOptions.brushSize || 10]} 
                onValueChange={([val]) => setToolOptions({ ...toolOptions, brushSize: val })}
              />
              <span className="text-xs text-surface-400 w-8">{toolOptions.brushSize || 10}px</span>
            </div>
            <div className="flex items-center gap-3 w-48">
              <span className="text-xs text-surface-400 whitespace-nowrap">Opacity</span>
              <Slider 
                min={0} 
                max={100} 
                value={[toolOptions.brushOpacity || 100]} 
                onValueChange={([val]) => setToolOptions({ ...toolOptions, brushOpacity: val })}
              />
              <span className="text-xs text-surface-400 w-8">{toolOptions.brushOpacity || 100}%</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-surface-500 italic">
            Select a tool to see its options
          </div>
        );
    }
  };

  return (
    <div className="flex items-center h-full w-full">
      {renderToolControls()}
    </div>
  );
}
