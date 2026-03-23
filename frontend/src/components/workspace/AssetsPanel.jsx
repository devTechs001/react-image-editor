// frontend/src/components/workspace/AssetsPanel.jsx
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Upload, 
  Filter, 
  Grid, 
  List,
  Image as ImageIcon,
  MoreVertical,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AssetsPanel() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Project Assets</h3>
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
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Search assets..." 
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <Button variant="secondary" size="xs" icon={Filter} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark">
        {/* Upload Dropzone Placeholder */}
        <div className="mb-6 p-6 border-2 border-dashed border-editor-border rounded-2xl hover:border-primary-500/50 hover:bg-white/5 transition-all cursor-pointer text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-2 text-surface-500 group-hover:text-primary-400 transition-colors">
            <Upload size={20} />
          </div>
          <p className="text-[11px] font-medium text-surface-400 group-hover:text-surface-200 transition-colors">
            Drop images here or <span className="text-primary-400">Browse</span>
          </p>
        </div>

        {/* Assets Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div 
                key={i}
                className="aspect-square rounded-lg bg-editor-card border border-editor-border hover:border-primary-500/50 cursor-pointer overflow-hidden relative group transition-all"
              >
                <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                  <ImageIcon size={16} className="text-surface-600 group-hover:text-primary-400 transition-colors" />
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button className="p-1 rounded bg-white/10 text-white hover:bg-primary-500"><Plus size={12} /></button>
                  <button className="p-1 rounded bg-white/10 text-white hover:bg-surface-700"><MoreVertical size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer border border-transparent hover:border-editor-border transition-all"
              >
                <div className="w-10 h-10 rounded bg-surface-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-white truncate">Stock_Photo_{i}.jpg</p>
                  <p className="text-[9px] text-surface-500 uppercase tracking-tighter">1920x1080 • 1.2MB</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-surface-500 hover:text-white"><Download size={14} /></button>
                  <button className="p-1 text-surface-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-editor-border">
        <Button variant="primary" fullWidth size="sm" icon={Plus}>
          Add to Workspace
        </Button>
      </div>
    </div>
  );
}
