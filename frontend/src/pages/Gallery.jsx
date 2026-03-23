// frontend/src/pages/Gallery.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Video,
  Music,
  Folder
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/helpers/cn';

const mockGalleryItems = [
  { id: 1, name: 'Mountain Sunset', type: 'image', date: '2024-03-20', size: '2.4 MB', thumbnail: null },
  { id: 2, name: 'Product Promo', type: 'video', date: '2024-03-18', size: '15.8 MB', thumbnail: null },
  { id: 3, name: 'Background Audio', type: 'audio', date: '2024-03-15', size: '4.2 MB', thumbnail: null },
  { id: 4, name: 'Portrait Edit', type: 'image', date: '2024-03-12', size: '1.8 MB', thumbnail: null },
  { id: 5, name: 'Urban Vlog', type: 'video', date: '2024-03-10', size: '45.2 MB', thumbnail: null },
  { id: 6, name: 'Interview Record', type: 'audio', date: '2024-03-05', size: '8.5 MB', thumbnail: null },
];

export default function Gallery() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredItems = mockGalleryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gallery</h1>
          <p className="text-surface-400">Manage and view all your exported media.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Folder}>
            New Folder
          </Button>
          <Button variant="primary" icon={Download}>
            Export All
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              placeholder="Search gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-editor-surface border border-editor-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-editor-surface border border-editor-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
            <div className="flex items-center p-1 bg-editor-surface border border-editor-border rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-primary-500 text-white" : "text-surface-400 hover:text-white"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-primary-500 text-white" : "text-surface-400 hover:text-white"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const Icon = item.type === 'image' ? ImageIcon : item.type === 'video' ? Video : Music;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden">
                  <div className="aspect-video bg-surface-800 flex items-center justify-center relative">
                    <Icon className="w-12 h-12 text-surface-600" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="glass" size="sm" icon={ExternalLink} />
                      <Button variant="glass" size="sm" icon={Download} />
                      <Button variant="glass" size="sm" icon={Share2} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-white truncate">{item.name}</h3>
                        <p className="text-xs text-surface-500">{item.date} • {item.size}</p>
                      </div>
                      <button className="p-1 text-surface-500 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-editor-border bg-editor-surface/50">
                  <th className="px-6 py-4 text-sm font-semibold text-surface-400">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-surface-400">Type</th>
                  <th className="px-6 py-4 text-sm font-semibold text-surface-400">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-surface-400">Size</th>
                  <th className="px-6 py-4 text-sm font-semibold text-surface-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editor-border">
                {filteredItems.map((item) => {
                  const Icon = item.type === 'image' ? ImageIcon : item.type === 'video' ? Video : Music;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-surface-500" />
                          </div>
                          <span className="font-medium text-white">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-400 capitalize">{item.type}</td>
                      <td className="px-6 py-4 text-sm text-surface-400">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-surface-400">{item.size}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-surface-400 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-surface-400 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-rose-400 hover:text-rose-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-editor-surface flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-surface-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
          <p className="text-surface-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
