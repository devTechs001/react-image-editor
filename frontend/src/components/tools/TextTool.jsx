// frontend/src/components/tools/TextTool.jsx
import React, { useState } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Palette, Sparkles, ChevronDown } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

export default function TextTool() {
  const { activeTool } = useEditor();
  const [fontSize, setFontSize] = useState(48);
  const [alignment, setAlignment] = useState('center');

  const isActive = activeTool === 'text';

  return (
    <div className={cn(
      "flex flex-col gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-editor-surface border border-editor-border shadow-elevated",
      !isActive && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-editor-border pb-1.5 sm:pb-2">
        <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Type size={14} />
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white">Typography Studio</span>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Font Family */}
        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-[9px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Typeface</span>
          <button className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-surface-800 border border-surface-700 hover:border-blue-500/50 transition-all group">
            <span className="text-[10px] sm:text-xs font-bold text-white">Montserrat Bold</span>
            <ChevronDown size={12} />
          </button>
        </div>

        <Slider 
          label="Font Size"
          value={[fontSize]}
          onValueChange={([v]) => setFontSize(v)}
          min={8}
          max={256}
          size="sm"
        />

        {/* Text Style Bar */}
        <div className="flex items-center justify-between p-0.5 sm:p-1 bg-surface-800 rounded-lg sm:rounded-xl border border-surface-700">
          <div className="flex gap-0.5">
            <button className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"><Bold size={14} /></button>
            <button className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"><Italic size={14} /></button>
            <button className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"><Underline size={14} /></button>
          </div>
          <div className="w-px h-6 bg-surface-700" />
          <div className="flex gap-0.5">
            {[
              { id: 'left', icon: AlignLeft },
              { id: 'center', icon: AlignCenter },
              { id: 'right', icon: AlignRight }
            ].map((align) => (
              <button
                key={align.id}
                onClick={() => setAlignment(align.id)}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-all",
                  alignment === align.id ? "text-blue-400 bg-blue-500/10" : "text-surface-400 hover:text-white hover:bg-white/5"
                )}
              >
                <align.icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 pt-1.5 sm:pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest">AI Copywriter</span>
            <Sparkles size={10} />
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2 group cursor-pointer hover:border-blue-500/40 transition-all">
            <p className="text-[8px] sm:text-[9px] text-surface-400 leading-relaxed">Let AI generate catchy headlines or artistic text descriptions for your project.</p>
            <button className="w-full py-1 sm:py-1.5 bg-blue-500 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-lg shadow-glow-sm">Magic Write</button>
          </div>
        </div>

        <div className="pt-1.5 sm:pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={12} />
            <span className="text-[9px] sm:text-[10px] font-bold text-surface-400 uppercase">Text Color</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform" />
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500 border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform" />
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
