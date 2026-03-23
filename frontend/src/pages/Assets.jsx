// frontend/src/pages/Assets.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Music,
  File,
  Search,
  Upload,
  Grid,
  List,
  Folder,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Filter,
  SortAsc,
  Plus
} from 'lucide-react';
import { storageAPI } from '@/services/api/storageAPI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FileUpload from '@/components/ui/FileUpload';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers/cn';

const assetTypes = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'other', label: 'Other', icon: File }
];

const sortOptions = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'size', label: 'Size (Largest)' }
];

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    loadAssets();
    loadFolders();
  }, [currentFolder, selectedType]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = { folder: currentFolder };
      if (selectedType !== 'all') params.type = selectedType;
      
      const data = await storageAPI.getAll(params);
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await storageAPI.getFolders();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleFileSelect = useCallback(async (files) => {
    try {
      for (const file of files) {
        await storageAPI.upload(file, { folder: currentFolder });
      }
      await loadAssets();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [currentFolder]);

  const handleDelete = useCallback(async (id) => {
    try {
      await storageAPI.delete(id);
      await loadAssets();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, []);

  const handleSelect = (id) => {
    setSelectedAssets(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map(a => a._id));
    }
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sortedAssets = [...assets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      default:
        return 0;
    }
  });

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Assets</h1>
            <p className="text-sm text-surface-400">
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'} in {currentFolder === 'root' ? 'root' : currentFolder}
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Asset
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-editor-card border border-editor-border text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-editor-card border border-editor-border">
            {assetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    selectedType === type.id
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-surface-400 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-editor-card border border-editor-border text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-editor-card border border-editor-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'grid' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'list' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-surface-400">Loading assets...</p>
            </div>
          </div>
        ) : sortedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No assets found</h3>
            <p className="text-sm text-surface-400 mb-4">
              {searchQuery ? 'Try a different search term' : 'Upload your first asset to get started'}
            </p>
            {!searchQuery && (
              <Button variant="primary" icon={Upload} onClick={() => setShowUploadModal(true)}>
                Upload Asset
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {sortedAssets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                const isSelected = selectedAssets.includes(asset._id);
                
                return (
                  <motion.div
                    key={asset._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      'group relative aspect-square rounded-xl overflow-hidden cursor-pointer',
                      'bg-editor-card border-2 transition-all',
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-500/30'
                        : 'border-editor-border hover:border-surface-500'
                    )}
                    onClick={() => handleSelect(asset._id)}
                  >
                    {/* Thumbnail */}
                    {asset.type === 'image' && asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-surface-400" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download logic
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset._id);
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded bg-primary-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-white truncate">{asset.name}</p>
                      <p className="text-xs text-surface-400">{formatFileSize(asset.size)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedAssets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                const isSelected = selectedAssets.includes(asset._id);
                
                return (
                  <motion.div
                    key={asset._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors',
                      'bg-editor-card border',
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-editor-border hover:border-surface-500'
                    )}
                    onClick={() => handleSelect(asset._id)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-surface-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                      <p className="text-xs text-surface-500">
                        {asset.type} • {formatFileSize(asset.size)} • {new Date(asset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-white/5">
                        <Download className="w-4 h-4 text-surface-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset._id)}
                        className="p-2 rounded-lg hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Assets"
          size="lg"
        >
          <FileUpload
            multiple
            accept="image/*,video/*,audio/*"
            maxSize={50 * 1024 * 1024}
            onFileSelect={handleFileSelect}
            dragText="Drag and drop files here"
            description="Supports images, videos, and audio files up to 50MB"
          />
        </Modal>
      )}
    </div>
  );
}
