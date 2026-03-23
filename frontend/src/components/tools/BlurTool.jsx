// frontend/src/components/tools/BlurTool.jsx
import React, { useState } from 'react';
import { Droplets as Blur, Sparkles, Layers, Wand2, Maximize2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function BlurTool() {
  const { activeTool } = useEditor();
  const [blurAmount, setBlurAmount] = useState(10);
  const [blurType, setBlurType] = useState('gaussian'); // gaussian, radial, motion, smart

  const isActive = activeTool === 'blur';

  return (
    <div className={cn(
      "flex flex-col gap-4 p-3 rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-2 border-b border-editor-border pb-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <Blur size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Focus & Blur</span>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Engine</span>
          <select 
            value={blurType}
            onChange={(e) => setBlurType(e.target.value)}
            className="w-full bg-surface-800 border-surface-700 rounded-lg text-xs text-white p-2 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="gaussian">Gaussian (Natural)</option>
            <option value="box">Box (Fast)</option>
            <option value="motion">Motion Blur</option>
            <option value="radial">Radial Zoom</option>
            <option value="smart">AI Smart Blur</option>
          </select>
        </div>

        <Slider 
          label="Blur Radius"
          value={[blurAmount]}
          onValueChange={([v]) => setBlurAmount(v)}
          min={0}
          max={100}
          size="sm"
        />

        <div className="space-y-3 pt-2 border-t border-editor-border">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Portrait Focus</h4>
          <button className="w-full p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow group relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Auto Portrait Bokeh</span>
            </div>
            {/* Background glow */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <p className="text-[9px] text-surface-500 text-center italic px-2">Uses AI to detect subjects and apply realistic depth-of-field.</p>
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-surface-400 hover:text-white cursor-pointer transition-colors group">
          <div className="flex items-center gap-2">
            <Layers size={14} className="group-hover:text-indigo-400" />
            <span className="text-[10px] font-bold uppercase">Apply to Mask</span>
          </div>
          <Maximize2 size={12} className="opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
