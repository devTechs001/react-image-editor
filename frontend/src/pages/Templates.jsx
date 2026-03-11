// frontend/src/pages/Templates.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Image,
  FileText,
  Presentation,
  Heart,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

const categories = [
  { id: 'all', label: 'All Templates', icon: Grid },
  { id: 'social', label: 'Social Media', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'presentation', label: 'Presentations', icon: Presentation },
  { id: 'print', label: 'Print', icon: FileText },
  { id: 'marketing', label: 'Marketing', icon: Image }
];

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin }
];

// Mock templates data
const templates = [
  { id: 1, name: 'Instagram Post', category: 'social', platform: 'instagram', size: '1080 × 1080', uses: 12500, color: 'from-pink-500 to-purple-500' },
  { id: 2, name: 'Instagram Story', category: 'social', platform: 'instagram', size: '1080 × 1920', uses: 8900, color: 'from-orange-500 to-pink-500' },
  { id: 3, name: 'YouTube Thumbnail', category: 'youtube', platform: 'youtube', size: '1280 × 720', uses: 15200, color: 'from-red-500 to-rose-500' },
  { id: 4, name: 'Twitter Post', category: 'social', platform: 'twitter', size: '1200 × 675', uses: 6700, color: 'from-blue-400 to-blue-600' },
  { id: 5, name: 'Facebook Cover', category: 'social', platform: 'facebook', size: '820 × 312', uses: 4500, color: 'from-blue-500 to-indigo-500' },
  { id: 6, name: 'LinkedIn Banner', category: 'social', platform: 'linkedin', size: '1584 × 396', uses: 3200, color: 'from-blue-600 to-blue-800' },
  { id: 7, name: 'Presentation Slide', category: 'presentation', platform: null, size: '1920 × 1080', uses: 7800, color: 'from-violet-500 to-purple-600' },
  { id: 8, name: 'Business Card', category: 'print', platform: null, size: '1050 × 600', uses: 5600, color: 'from-slate-500 to-slate-700' },
  { id: 9, name: 'Poster A4', category: 'print', platform: null, size: '2480 × 3508', uses: 4100, color: 'from-emerald-500 to-teal-600' },
  { id: 10, name: 'Email Header', category: 'marketing', platform: null, size: '600 × 200', uses: 3800, color: 'from-amber-500 to-orange-500' },
  { id: 11, name: 'Banner Ad', category: 'marketing', platform: null, size: '728 × 90', uses: 2900, color: 'from-cyan-500 to-blue-500' },
  { id: 12, name: 'Infographic', category: 'marketing', platform: null, size: '800 × 2000', uses: 6200, color: 'from-fuchsia-500 to-pink-500' }
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePlatform, setActivePlatform] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);

  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    if (activePlatform) {
      result = result.filter(t => t.platform === activePlatform);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(query));
    }

    return result;
  }, [activeCategory, activePlatform, searchQuery]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const useTemplate = (template) => {
    const [width, height] = template.size.split(' × ').map(Number);
    navigate('/editor', { state: { template, width, height } });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Templates</h1>
        <p className="text-surface-400">
          Start with professionally designed templates for any project
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            size="lg"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            icon={Grid}
          />
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            icon={List}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all',
                activeCategory === cat.id
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-editor-card border border-editor-border text-surface-400 hover:text-white hover:border-surface-600'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Platform Filter */}
      {activeCategory === 'social' && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-surface-500">Platform:</span>
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => setActivePlatform(
                  activePlatform === platform.id ? null : platform.id
                )}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                  activePlatform === platform.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {platform.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Templates Grid */}
      <div className={cn(
        'grid gap-6',
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group relative rounded-2xl overflow-hidden cursor-pointer',
                'bg-editor-card border border-editor-border',
                'hover:border-primary-500/50 transition-all hover:-translate-y-1',
                viewMode === 'list' && 'flex items-center gap-4 p-4'
              )}
              onClick={() => useTemplate(template)}
            >
              {/* Preview */}
              <div className={cn(
                'relative bg-gradient-to-br',
                template.color,
                viewMode === 'grid' ? 'aspect-[4/3]' : 'w-32 h-24 rounded-xl flex-shrink-0'
              )}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm" />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button variant="glass" size="sm" icon={Eye}>
                    Preview
                  </Button>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(template.id, e)}
                  className={cn(
                    'absolute top-3 right-3 p-2 rounded-lg transition-all',
                    'opacity-0 group-hover:opacity-100',
                    favorites.includes(template.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-black/30 text-white hover:bg-black/50'
                  )}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={favorites.includes(template.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Info */}
              <div className={cn(viewMode === 'grid' ? 'p-4' : 'flex-1')}>
                <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-500">{template.size}</span>
                  <span className="text-xs text-surface-500">
                    {template.uses.toLocaleString()} uses
                  </span>
                </div>
              </div>

              {viewMode === 'list' && (
                <Button variant="secondary" size="sm" icon={Plus}>
                  Use Template
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
          <p className="text-surface-400 mb-4">Try adjusting your search or filters</p>
          <Button variant="secondary" onClick={() => {
            setSearchQuery('');
            setActiveCategory('all');
            setActivePlatform(null);
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}