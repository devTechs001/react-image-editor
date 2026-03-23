// frontend/src/components/workspace/LibraryPanel.jsx
import React, { useState } from 'react';
import { 
  Folder, 
  Star, 
  Clock, 
  Trash2, 
  Search, 
  Plus, 
  MoreVertical,
  Download,
  Share2,
  FolderPlus
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const libraryCollections = [
  { id: 'recents', icon: Clock, label: 'Recents', count: 12 },
  { id: 'favorites', icon: Star, label: 'Favorites', count: 5 },
  { id: 'assets', icon: Folder, label: 'Project Assets', count: 24 },
  { id: 'trash', icon: Trash2, label: 'Trash', count: 0 },
];

export default function LibraryPanel() {
  const [activeCollection, setActiveCategory] = useState('assets');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-editor-surface border-l border-editor-border">
      {/* Header */}
      <div className="p-4 border-b border-editor-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Library</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm">
              <FolderPlus size={16} className="text-surface-400" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Plus size={16} className="text-surface-400" />
            </Button>
          </div>
        </div>
        <Input 
          placeholder="Search library..." 
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collection Nav (Mini) */}
        <div className="w-14 border-r border-editor-border flex flex-col py-4 items-center gap-4">
          {libraryCollections.map((col) => {
            const Icon = col.icon;
            const isActive = activeCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setActiveCategory(col.id)}
                className={cn(
                  "p-2.5 rounded-lg transition-all relative group",
                  isActive 
                    ? "bg-primary-500/10 text-primary-400" 
                    : "text-surface-500 hover:text-surface-200"
                )}
                title={col.label}
              >
                <Icon size={18} />
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              {libraryCollections.find(c => c.id === activeCollection)?.label}
            </h4>
            <span className="text-[10px] text-surface-500 font-medium">
              {libraryCollections.find(c => c.id === activeCollection)?.count} Items
            </span>
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="group flex items-center gap-3 p-2 rounded-xl bg-editor-card/50 border border-transparent hover:border-editor-border hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-800 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">Asset_Item_{i}.png</p>
                  <p className="text-[10px] text-surface-500">PNG • 2.4 MB</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-surface-500 hover:text-white"><Download size={14} /></button>
                  <button className="p-1 text-surface-500 hover:text-white"><Share2 size={14} /></button>
                  <button className="p-1 text-surface-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
