// frontend/src/components/advanced/PluginManager.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle,
  Download,
  Upload,
  Settings,
  Trash2,
  Star,
  Shield,
  Zap,
  Code,
  Package,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  ExternalLink,
  GitBranch,
  Users,
  Calendar
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

// Mock plugin data
const availablePlugins = [
  {
    id: 'advanced-filters',
    name: 'Advanced Filters Pack',
    description: 'Professional-grade filters including cinematic, vintage, and artistic effects',
    version: '2.1.0',
    author: 'Media Studio Team',
    category: 'filters',
    rating: 4.8,
    downloads: 15234,
    size: '2.4 MB',
    price: 0,
    installed: false,
    featured: true,
    tags: ['filters', 'effects', 'professional'],
    lastUpdated: '2024-03-15',
    dependencies: [],
    permissions: ['canvas', 'filters'],
    icon: '🎨'
  },
  {
    id: 'ai-enhance-pro',
    name: 'AI Enhance Pro',
    description: 'Next-generation AI enhancement with real-time processing and custom models',
    version: '3.0.1',
    author: 'AI Labs',
    category: 'ai',
    rating: 4.9,
    downloads: 28456,
    size: '8.7 MB',
    price: 19.99,
    installed: true,
    enabled: true,
    featured: true,
    tags: ['ai', 'enhancement', 'professional'],
    lastUpdated: '2024-03-18',
    dependencies: ['tensorflow'],
    permissions: ['ai', 'network', 'storage'],
    icon: '🤖'
  },
  {
    id: 'batch-processor',
    name: 'Batch Processor',
    description: 'Process multiple images simultaneously with custom workflows',
    version: '1.5.2',
    author: 'DevTools Inc',
    category: 'productivity',
    rating: 4.6,
    downloads: 8921,
    size: '1.2 MB',
    price: 9.99,
    installed: false,
    tags: ['batch', 'productivity', 'automation'],
    lastUpdated: '2024-03-10',
    dependencies: [],
    permissions: ['file-system', 'processing'],
    icon: '⚡'
  },
  {
    id: '3d-exporter',
    name: '3D Model Exporter',
    description: 'Export your edits as 3D models with depth mapping and surface reconstruction',
    version: '1.0.0',
    author: '3D Studios',
    category: '3d',
    rating: 4.4,
    downloads: 3214,
    size: '5.3 MB',
    price: 14.99,
    installed: false,
    tags: ['3d', 'export', 'advanced'],
    lastUpdated: '2024-03-20',
    dependencies: ['three-js'],
    permissions: ['3d', 'export'],
    icon: '🎯'
  },
  {
    id: 'color-grading',
    name: 'Color Grading Studio',
    description: 'Professional color grading tools with HDR support and LUTs',
    version: '2.3.0',
    author: 'Color Pros',
    category: 'color',
    rating: 4.7,
    downloads: 12456,
    size: '3.1 MB',
    price: 0,
    installed: true,
    enabled: true,
    tags: ['color', 'grading', 'professional'],
    lastUpdated: '2024-03-12',
    dependencies: [],
    permissions: ['color', 'grading'],
    icon: '🌈'
  }
];

const categories = [
  { id: 'all', name: 'All Plugins', icon: Grid },
  { id: 'installed', name: 'Installed', icon: Package },
  { id: 'ai', name: 'AI & ML', icon: Zap },
  { id: 'filters', name: 'Filters', icon: Code },
  { id: 'productivity', name: 'Productivity', icon: Settings },
  { id: '3d', name: '3D Tools', icon: Puzzle },
  { id: 'color', name: 'Color', icon: Star }
];

export default function PluginManager() {
  const [plugins, setPlugins] = useState(availablePlugins);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [installingPlugin, setInstallingPlugin] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredPlugins = plugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || 
                          selectedCategory === 'installed' ? plugin.installed :
                          plugin.category === selectedCategory;
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInstallPlugin = useCallback(async (plugin) => {
    setInstallingPlugin(plugin.id);
    
    try {
      // Simulate plugin installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id 
          ? { ...p, installed: true, enabled: true }
          : p
      ));
      
      toast.success(`${plugin.name} installed successfully!`);
    } catch (error) {
      toast.error(`Failed to install ${plugin.name}`);
    } finally {
      setInstallingPlugin(null);
    }
  }, []);

  const handleUninstallPlugin = useCallback(async (plugin) => {
    setInstallingPlugin(plugin.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id 
          ? { ...p, installed: false, enabled: false }
          : p
      ));
      
      toast.success(`${plugin.name} uninstalled successfully!`);
    } catch (error) {
      toast.error(`Failed to uninstall ${plugin.name}`);
    } finally {
      setInstallingPlugin(null);
    }
  }, []);

  const handleTogglePlugin = useCallback(async (plugin) => {
    setInstallingPlugin(plugin.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id 
          ? { ...p, enabled: !p.enabled }
          : p
      ));
      
      toast.success(`${plugin.name} ${plugin.enabled ? 'disabled' : 'enabled'}!`);
    } catch (error) {
      toast.error(`Failed to toggle ${plugin.name}`);
    } finally {
      setInstallingPlugin(null);
    }
  }, []);

  const PluginCard = ({ plugin }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "bg-editor-surface border border-editor-border rounded-xl p-4 hover:border-primary-500/50 transition-all cursor-pointer",
        plugin.featured && "ring-2 ring-primary-500/20"
      )}
      onClick={() => {
        setSelectedPlugin(plugin);
        setShowDetails(true);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-2xl">
            {plugin.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{plugin.name}</h3>
            <p className="text-xs text-surface-500">by {plugin.author}</p>
          </div>
        </div>
        
        {plugin.featured && (
          <div className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-surface-400 mb-3 line-clamp-2">
        {plugin.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>{plugin.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          <span>{plugin.downloads.toLocaleString()}</span>
        </div>
        <div>{plugin.size}</div>
        <div>v{plugin.version}</div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {plugin.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="px-2 py-1 rounded-full bg-surface-800 text-xs text-surface-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {plugin.installed ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlugin(plugin);
              }}
              disabled={installingPlugin === plugin.id}
              loading={installingPlugin === plugin.id}
            >
              {plugin.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleUninstallPlugin(plugin);
              }}
              disabled={installingPlugin === plugin.id}
              icon={Trash2}
            />
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleInstallPlugin(plugin);
            }}
            disabled={installingPlugin === plugin.id}
            loading={installingPlugin === plugin.id}
            icon={installingPlugin === plugin.id ? Loader2 : Download}
          >
            {plugin.price === 0 ? 'Install' : `$${plugin.price}`}
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Plugin Manager</h2>
              <p className="text-xs text-surface-500">Extend functionality with plugins</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              icon={viewMode === 'grid' ? List : Grid}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
            >
              Install Local
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Filter}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-editor-border">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  selectedCategory === category.id
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "bg-surface-800 text-surface-400 border border-surface-700 hover:text-white"
                )}
              >
                <Icon className="w-3 h-3" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPlugins.map(plugin => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredPlugins.map(plugin => (
                <motion.div
                  key={plugin.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "bg-editor-surface border border-editor-border rounded-lg p-3 hover:border-primary-500/50 transition-all cursor-pointer",
                    plugin.featured && "ring-2 ring-primary-500/20"
                  )}
                  onClick={() => {
                    setSelectedPlugin(plugin);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-sm">
                        {plugin.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{plugin.name}</h3>
                        <p className="text-xs text-surface-500">{plugin.author} • v{plugin.version}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-surface-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{plugin.rating}</span>
                      </div>
                      
                      {plugin.installed ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlugin(plugin);
                            }}
                            disabled={installingPlugin === plugin.id}
                            icon={plugin.enabled ? CheckCircle : AlertCircle}
                            className={plugin.enabled ? "text-green-400" : "text-yellow-400"}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUninstallPlugin(plugin);
                            }}
                            disabled={installingPlugin === plugin.id}
                            icon={Trash2}
                          />
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstallPlugin(plugin);
                          }}
                          disabled={installingPlugin === plugin.id}
                          loading={installingPlugin === plugin.id}
                        >
                          {plugin.price === 0 ? 'Install' : `$${plugin.price}`}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredPlugins.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Package className="w-12 h-12 text-surface-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No plugins found</h3>
            <p className="text-sm text-surface-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      <AnimatePresence>
        {showDetails && selectedPlugin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-editor-surface border border-editor-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Details Header */}
              <div className="p-6 border-b border-editor-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-3xl">
                      {selectedPlugin.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">{selectedPlugin.name}</h2>
                      <p className="text-sm text-surface-500">by {selectedPlugin.author}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{selectedPlugin.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{selectedPlugin.downloads.toLocaleString()}</span>
                        </div>
                        <div>v{selectedPlugin.version}</div>
                        <div>{selectedPlugin.size}</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedPlugin.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowDetails(false)}
                    icon={AlertCircle}
                  />
                </div>

                <p className="text-sm text-surface-300 mb-4">
                  {selectedPlugin.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPlugin.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-surface-800 text-xs text-surface-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6 space-y-6">
                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Permissions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlugin.permissions.map(permission => (
                      <div
                        key={permission}
                        className="px-3 py-2 bg-surface-800 rounded-lg text-xs text-surface-400"
                      >
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                {selectedPlugin.dependencies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Dependencies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlugin.dependencies.map(dep => (
                        <span
                          key={dep}
                          className="px-3 py-2 bg-surface-800 rounded-lg text-xs text-surface-400"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center gap-3 pt-4 border-t border-editor-border">
                  {selectedPlugin.installed ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          handleTogglePlugin(selectedPlugin);
                          setShowDetails(false);
                        }}
                        disabled={installingPlugin === selectedPlugin.id}
                        loading={installingPlugin === selectedPlugin.id}
                      >
                        {selectedPlugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleUninstallPlugin(selectedPlugin);
                          setShowDetails(false);
                        }}
                        disabled={installingPlugin === selectedPlugin.id}
                        icon={Trash2}
                      >
                        Uninstall
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleInstallPlugin(selectedPlugin);
                        setShowDetails(false);
                      }}
                      disabled={installingPlugin === selectedPlugin.id}
                      loading={installingPlugin === selectedPlugin.id}
                      icon={installingPlugin === selectedPlugin.id ? Loader2 : Download}
                    >
                      {selectedPlugin.price === 0 ? 'Install Plugin' : `$${selectedPlugin.price}`}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    icon={ExternalLink}
                  >
                    Documentation
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}