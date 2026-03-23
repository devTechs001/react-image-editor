// frontend/src/components/workspace/WorkspacePresets.jsx
import React, { useState } from 'react';
import { 
  Layout, 
  Plus, 
  Star, 
  Trash2, 
  Save, 
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Maximize2
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

const defaultPresets = [
  { id: 'standard', name: 'Standard Layout', icon: Monitor, type: 'system' },
  { id: 'mobile', name: 'Mobile Preview', icon: Smartphone, type: 'system' },
  { id: 'focus', name: 'Focused Mode', icon: Maximize2, type: 'system' },
  { id: 'compact', name: 'Minimal Workspace', icon: Tablet, type: 'system' },
];

export default function WorkspacePresets() {
  const [activePreset, setActivePreset] = useState('standard');
  const [customPresets, setCustomPresets] = useState([
    { id: 'custom-1', name: 'Social Media Setup', icon: Star, type: 'user' }
  ]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Workspaces</h3>
          <Button variant="ghost" size="icon-sm" className="text-surface-400">
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 space-y-2">
          <div className="flex items-center gap-2 text-primary-400">
            <Save size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Save Current</span>
          </div>
          <p className="text-[10px] text-surface-400 leading-relaxed">
            Store your current panel arrangement, toolbar positions, and active tools.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-dark">
        {/* System Presets */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">
            System Presets
          </h4>
          <div className="space-y-1">
            {defaultPresets.map((preset) => {
              const Icon = preset.icon;
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-xl transition-all",
                    isActive 
                      ? "bg-white/5 border border-white/10" 
                      : "hover:bg-white/5 border border-transparent text-surface-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      isActive ? "bg-primary-500 text-white" : "bg-surface-800 text-surface-500"
                    )}>
                      <Icon size={14} />
                    </div>
                    <span className={cn("text-xs font-medium", isActive ? "text-white" : "text-surface-400")}>
                      {preset.name}
                    </span>
                  </div>
                  {isActive && <Check size={14} className="text-primary-400" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* User Presets */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">
            My Presets
          </h4>
          <div className="space-y-1">
            {customPresets.map((preset) => (
              <div 
                key={preset.id}
                className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent text-surface-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-surface-800 text-amber-400">
                    <Star size={14} />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-surface-500 hover:text-red-400 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-editor-border">
        <Button variant="secondary" fullWidth size="sm" icon={Layout}>
          Manage Layouts
        </Button>
      </div>
    </div>
  );
}
