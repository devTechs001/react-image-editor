// frontend/src/components/workspace/LeftPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid, 
  Plus, 
  Image as ImageIcon, 
  Type, 
  Square, 
  Layout, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const categories = [
  { id: 'templates', icon: Layout, label: 'Templates' },
  { id: 'images', icon: ImageIcon, label: 'Photos' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'shapes', icon: Square, label: 'Elements' },
  { id: 'ai', icon: Sparkles, label: 'AI Magic' },
];

export default function LeftPanel() {
  const [activeCategory, setActiveCategory] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full w-80 flex flex-col bg-editor-surface border-r border-editor-border">
      {/* Search Header */}
      <div className="p-4 border-b border-editor-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Assets Library</h3>
          <Button variant="ghost" size="icon-sm" className="text-surface-400">
            <X size={16} />
          </Button>
        </div>
        <Input 
          placeholder="Search everything..." 
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Category Icons */}
      <div className="flex border-b border-editor-border px-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 transition-all relative",
                isActive ? "text-primary-400" : "text-surface-500 hover:text-surface-200"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{cat.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="leftPanelTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
            Recently Used
          </h4>
          <button className="text-[10px] text-primary-400 hover:underline">View All</button>
        </div>

        {/* Mock Grid Items */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="aspect-square rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 cursor-pointer group transition-all"
            >
              <div className="w-full h-full bg-surface-800 rounded-lg flex items-center justify-center">
                <ImageIcon size={24} className="text-surface-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-editor-border">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white mb-1">AI Recommendation</h5>
                <p className="text-[10px] text-surface-400 leading-relaxed">
                  Based on your style, try these vintage overlays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
