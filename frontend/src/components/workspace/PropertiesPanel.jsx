// frontend/src/components/workspace/PropertiesPanel.jsx
import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { 
  Maximize2, 
  Layers, 
  Shield, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  ChevronDown,
  Trash2,
  Lock,
  Eye
} from 'lucide-react';
import Slider from '@/components/ui/Slider';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

export default function PropertiesPanel() {
  const { layers, activeLayerId, updateLayer, removeLayer } = useEditor();
  const activeLayer = layers.find(l => l.id === activeLayerId);

  if (!activeLayer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
          <Layers size={32} className="text-surface-600" />
        </div>
        <p className="text-sm text-surface-400">Select a layer to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Properties</h3>
          <div className="flex gap-1">
            <button className="p-1.5 rounded hover:bg-white/5 text-surface-400 hover:text-white">
              <Lock size={14} />
            </button>
            <button className="p-1.5 rounded hover:bg-white/5 text-surface-400 hover:text-white">
              <Eye size={14} />
            </button>
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-surface-800 border border-surface-700">
          <input 
            type="text" 
            value={activeLayer.name}
            onChange={(e) => updateLayer(activeLayer.id, { name: e.target.value })}
            className="w-full bg-transparent text-xs text-white border-none focus:ring-0 font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-8">
        {/* Transform Group */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-surface-500">
            <span>Transform</span>
            <RotateCw size={12} className="cursor-pointer hover:text-primary-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-surface-500 uppercase">Width</label>
              <input type="number" className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-xs text-white" defaultValue={1080} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-surface-500 uppercase">Height</label>
              <input type="number" className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-xs text-white" defaultValue={1080} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" icon={FlipHorizontal}>Flip H</Button>
            <Button variant="secondary" size="sm" className="flex-1" icon={FlipVertical}>Flip V</Button>
          </div>
        </section>

        {/* Appearance Group */}
        <section className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-surface-500">
            Appearance
          </div>
          
          <div className="space-y-4">
            <Slider 
              label="Opacity"
              value={[activeLayer.opacity || 100]}
              onValueChange={([val]) => updateLayer(activeLayer.id, { opacity: val })}
              min={0}
              max={100}
              size="sm"
            />
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-surface-500 uppercase">Blend Mode</label>
              <select className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-xs text-white appearance-none">
                <option>Normal</option>
                <option>Multiply</option>
                <option>Screen</option>
                <option>Overlay</option>
              </select>
            </div>
          </div>
        </section>

        {/* Layer Styles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-surface-500">
            <span>Layer Styles</span>
            <Plus size={12} className="cursor-pointer hover:text-primary-400" />
          </div>
          
          <div className="space-y-2">
            {['Drop Shadow', 'Stroke', 'Outer Glow'].map((style) => (
              <div key={style} className="flex items-center justify-between p-2 rounded bg-surface-800/50 border border-surface-700/50 group hover:border-surface-600 transition-colors">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded bg-surface-800 border-surface-700" />
                  <span className="text-[11px] text-surface-300 font-medium">{style}</span>
                </div>
                <Settings size={12} className="text-surface-500 opacity-0 group-hover:opacity-100 cursor-pointer" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-editor-border">
        <Button 
          variant="danger" 
          fullWidth 
          size="sm" 
          icon={Trash2}
          onClick={() => removeLayer(activeLayer.id)}
        >
          Delete Layer
        </Button>
      </div>
    </div>
  );
}
