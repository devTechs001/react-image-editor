// frontend/src/components/workspace/PresetsPanel.jsx
import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Grid, 
  List,
  Heart,
  Clock,
  Zap,
  Flame,
  Star,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'new', label: 'Trending', icon: Zap },
  { id: 'favorites', label: 'Saved', icon: Heart },
];

export default function PresetsPanel() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Effect Presets</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded", viewMode === 'grid' ? "text-primary-400" : "text-surface-500")}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded", viewMode === 'list' ? "text-primary-400" : "text-surface-500")}
            >
              <List size={14} />
            </button>
          </div>
        </div>
        
        <Input 
          placeholder="Search presets..." 
          size="xs"
          icon={Search}
        />

        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                  isActive 
                    ? "bg-primary-500 text-white shadow-glow" 
                    : "bg-surface-800 text-surface-400 hover:text-surface-200"
                )}
              >
                <Icon size={12} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Preset Group */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
              Cinematic Series
            </h4>
            <button className="text-[10px] text-primary-400 hover:underline">See More</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Midnight', 'Sunset Glow', 'Neon City', 'Cold Forest'].map((preset) => (
              <div 
                key={preset}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-editor-border hover:border-primary-500/50 cursor-pointer transition-all"
              >
                {/* Preview Image Placeholder */}
                <div className="w-full h-full bg-surface-800 bg-gradient-to-tr from-surface-900 to-transparent" />
                
                {/* Info Overlay */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button className="p-1 rounded bg-black/40 text-surface-400 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all">
                      <Heart size={12} />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white shadow-sm">{preset}</p>
                    <div className="flex items-center gap-1 text-[9px] text-surface-400">
                      <Star size={8} className="fill-amber-400 text-amber-400" />
                      <span>4.9 (1.2k)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggested Presets */}
        <div className="p-4 rounded-2xl bg-editor-card border border-primary-500/30 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-2">
            <Sparkles size={16} className="text-primary-400 animate-pulse" />
          </div>
          <div className="relative z-10 space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">AI Master Presets</h5>
            <p className="text-[10px] text-surface-400 leading-relaxed max-w-[80%]">
              Let AI analyze your image and suggest the perfect artistic style.
            </p>
            <Button variant="primary" size="xs" fullWidth>Generate Styles</Button>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/10 blur-2xl rounded-full" />
        </div>
      </div>
    </div>
  );
}
