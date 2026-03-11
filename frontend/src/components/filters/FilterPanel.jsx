// frontend/src/components/filters/FilterPanel.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Sliders, Grid, List, Heart, Clock } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Slider from '@/components/ui/Slider';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

const filterCategories = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'artistic', label: 'Artistic', icon: Sparkles },
  { id: 'vintage', label: 'Vintage', icon: null },
  { id: 'color', label: 'Color', icon: null },
  { id: 'black-white', label: 'B&W', icon: null }
];

const filters = [
  // Artistic
  { id: 'none', name: 'Original', category: 'all', preview: null },
  { id: 'vivid', name: 'Vivid', category: 'artistic', preview: 'saturate(1.3) contrast(1.1)' },
  { id: 'dramatic', name: 'Dramatic', category: 'artistic', preview: 'contrast(1.3) saturate(0.9)' },
  { id: 'silhouette', name: 'Silhouette', category: 'artistic', preview: 'contrast(2) brightness(0.8)' },
  { id: 'mono', name: 'Mono', category: 'black-white', preview: 'grayscale(1)' },
  { id: 'noir', name: 'Noir', category: 'black-white', preview: 'grayscale(1) contrast(1.4)' },
  { id: 'silverscreen', name: 'Silver Screen', category: 'black-white', preview: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  
  // Vintage
  { id: 'vintage', name: 'Vintage', category: 'vintage', preview: 'sepia(0.3) saturate(0.8)' },
  { id: 'retro', name: 'Retro', category: 'vintage', preview: 'sepia(0.2) contrast(1.1) brightness(0.95)' },
  { id: 'polaroid', name: 'Polaroid', category: 'vintage', preview: 'contrast(1.1) saturate(0.9) sepia(0.1)' },
  { id: 'faded', name: 'Faded', category: 'vintage', preview: 'contrast(0.9) saturate(0.8) brightness(1.1)' },
  
  // Color
  { id: 'warm', name: 'Warm', category: 'color', preview: 'sepia(0.2) saturate(1.2)' },
  { id: 'cool', name: 'Cool', category: 'color', preview: 'saturate(0.9) hue-rotate(-10deg)' },
  { id: 'sunset', name: 'Sunset', category: 'color', preview: 'saturate(1.3) hue-rotate(-15deg)' },
  { id: 'ocean', name: 'Ocean', category: 'color', preview: 'saturate(1.2) hue-rotate(20deg)' },
  { id: 'forest', name: 'Forest', category: 'color', preview: 'saturate(1.1) hue-rotate(40deg)' },
  
  // Artistic Filters
  { id: 'pop', name: 'Pop', category: 'artistic', preview: 'saturate(2) contrast(1.2)' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'artistic', preview: 'saturate(1.5) hue-rotate(-30deg) contrast(1.2)' },
  { id: 'neon', name: 'Neon', category: 'artistic', preview: 'saturate(1.8) brightness(1.1) contrast(1.3)' }
];

export default function FilterPanel({ onFilterChange }) {
  const { activeFilter, filterIntensity, setFilter, setFilterIntensity } = useEditor();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [recentFilters, setRecentFilters] = useState([]);

  const filteredFilters = useMemo(() => {
    let result = filters;

    // Filter by category
    if (activeCategory === 'favorites') {
      result = result.filter(f => favorites.includes(f.id));
    } else if (activeCategory === 'recent') {
      result = recentFilters.map(id => filters.find(f => f.id === id)).filter(Boolean);
    } else if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(query));
    }

    return result;
  }, [activeCategory, searchQuery, favorites, recentFilters]);

  const handleFilterSelect = useCallback((filter) => {
    setFilter(filter.id === 'none' ? null : filter);
    
    // Add to recent
    if (filter.id !== 'none') {
      setRecentFilters(prev => {
        const newRecent = [filter.id, ...prev.filter(id => id !== filter.id)].slice(0, 10);
        return newRecent;
      });
    }

    onFilterChange?.(filter);
  }, [setFilter, onFilterChange]);

  const toggleFavorite = useCallback((filterId, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <h3 className="text-sm font-semibold text-white mb-4">Filters</h3>
        
        {/* Search */}
        <Input
          type="search"
          placeholder="Search filters..."
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="mb-4"
        />

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {filterCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeCategory === category.id
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              )}
            >
              {category.icon && <category.icon className="w-3.5 h-3.5" />}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border">
        <span className="text-xs text-surface-500">
          {filteredFilters.length} filters
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'grid' ? 'text-primary-400' : 'text-surface-500 hover:text-white'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'list' ? 'text-primary-400' : 'text-surface-500 hover:text-white'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Grid/List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark">
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-2 gap-3'
            : 'space-y-2'
        )}>
          <AnimatePresence mode="popLayout">
            {filteredFilters.map((filter, index) => (
              <motion.button
                key={filter.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleFilterSelect(filter)}
                className={cn(
                  'relative group rounded-xl overflow-hidden transition-all',
                  viewMode === 'grid' ? 'aspect-square' : 'h-14 flex items-center gap-3 px-3',
                  activeFilter?.id === filter.id
                    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-editor-bg'
                    : 'hover:ring-1 hover:ring-white/20',
                  'bg-editor-card'
                )}
              >
                {/* Filter Preview */}
                <div
                  className={cn(
                    'bg-gradient-to-br from-primary-500/30 to-secondary-500/30',
                    viewMode === 'grid' ? 'absolute inset-0' : 'w-10 h-10 rounded-lg flex-shrink-0'
                  )}
                  style={{ filter: filter.preview || 'none' }}
                />

                {/* Filter Name */}
                <div className={cn(
                  viewMode === 'grid'
                    ? 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent'
                    : 'flex-1 text-left'
                )}>
                  <span className="text-xs font-medium text-white">{filter.name}</span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(filter.id, e)}
                  className={cn(
                    'absolute top-2 right-2 p-1.5 rounded-lg transition-all',
                    'opacity-0 group-hover:opacity-100',
                    favorites.includes(filter.id)
                      ? 'text-red-400 bg-red-500/20'
                      : 'text-surface-400 bg-black/30 hover:text-white'
                  )}
                >
                  <Heart
                    className="w-3.5 h-3.5"
                    fill={favorites.includes(filter.id) ? 'currentColor' : 'none'}
                  />
                </button>

                {/* Active Indicator */}
                {activeFilter?.id === filter.id && (
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-primary-500" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Intensity Slider */}
      {activeFilter && activeFilter.id !== 'none' && (
        <div className="p-4 border-t border-editor-border">
          <Slider
            label="Intensity"
            value={[filterIntensity]}
            onValueChange={([value]) => setFilterIntensity(value)}
            min={0}
            max={100}
            valueSuffix="%"
          />
        </div>
      )}
    </div>
  );
}