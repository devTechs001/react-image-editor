// frontend/src/components/ai/PromptLibrary.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Copy,
  Star,
  Trash2,
  Plus,
  Edit,
  Sparkles,
  Wand2,
  Palette,
  Image,
  Type,
  X
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const defaultPrompts = [
  {
    id: '1',
    category: 'enhancement',
    title: 'Professional Portrait',
    prompt: 'Professional headshot, studio lighting, sharp focus, high detail, 8k resolution',
    icon: Image,
    starred: true
  },
  {
    id: '2',
    category: 'enhancement',
    title: 'Vintage Film Look',
    prompt: 'Vintage film aesthetic, grain, warm tones, light leaks, retro photography',
    icon: Image,
    starred: false
  },
  {
    id: '3',
    category: 'style',
    title: 'Oil Painting',
    prompt: 'Oil painting style, visible brushstrokes, rich colors, artistic texture',
    icon: Palette,
    starred: true
  },
  {
    id: '4',
    category: 'style',
    title: 'Watercolor Art',
    prompt: 'Watercolor painting, soft edges, flowing colors, artistic bleed effect',
    icon: Palette,
    starred: false
  },
  {
    id: '5',
    category: 'creative',
    title: 'Cyberpunk',
    prompt: 'Cyberpunk aesthetic, neon lights, futuristic, high tech, dark atmosphere',
    icon: Sparkles,
    starred: true
  },
  {
    id: '6',
    category: 'creative',
    title: 'Fantasy Landscape',
    prompt: 'Fantasy landscape, magical atmosphere, ethereal lighting, dreamlike quality',
    icon: Wand2,
    starred: false
  },
  {
    id: '7',
    category: 'text',
    title: 'Bold Typography',
    prompt: 'Bold modern typography, clean sans-serif, professional text overlay',
    icon: Type,
    starred: false
  },
  {
    id: '8',
    category: 'enhancement',
    title: 'HDR Enhancement',
    prompt: 'HDR photography, high dynamic range, detailed shadows and highlights',
    icon: Image,
    starred: true
  }
];

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'enhancement', label: 'Enhance', icon: Image },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'creative', label: 'Creative', icon: Wand2 },
  { id: 'text', label: 'Text', icon: Type }
];

export default function PromptLibrary({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prompts, setPrompts] = useState(defaultPrompts);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesStarred = !starredOnly || prompt.starred;
    return matchesSearch && matchesCategory && matchesStarred;
  });

  const copyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    toast.success('Prompt copied to clipboard');
  };

  const toggleStar = (id) => {
    setPrompts(prompts.map(p => 
      p.id === id ? { ...p, starred: !p.starred } : p
    ));
  };

  const deletePrompt = (id) => {
    setPrompts(prompts.filter(p => p.id !== id));
    toast.success('Prompt deleted');
  };

  const selectPrompt = (prompt) => {
    onSelect?.(prompt.prompt);
    onClose?.();
    toast.success('Prompt applied');
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header - Mobile: Stacked, Desktop: Row */}
      <div className="p-4 border-b border-editor-border space-y-3 md:space-y-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Prompt Library</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search - Full width on mobile */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Category Pills - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                  'transition-colors whitespace-nowrap',
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              'transition-colors whitespace-nowrap',
              starredOnly
                ? 'bg-amber-500 text-white'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
            )}
          >
            <Star className="w-3.5 h-3.5" />
            Starred
          </button>
        </div>
      </div>

      {/* Prompt Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPrompts.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-xl border',
                  'bg-surface-800/50 border-surface-700',
                  'hover:border-primary-500/30 hover:bg-surface-800',
                  'transition-all cursor-pointer group'
                )}
                onClick={() => selectPrompt(prompt)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-2 rounded-lg',
                      'bg-primary-500/10 text-primary-400'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {prompt.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(prompt.id);
                    }}
                    className={cn(
                      'p-1 rounded transition-colors',
                      prompt.starred
                        ? 'text-amber-400'
                        : 'text-surface-500 hover:text-amber-400'
                    )}
                  >
                    <Star className={cn(
                      'w-4 h-4',
                      prompt.starred && 'fill-current'
                    )} />
                  </button>
                </div>

                <p className="text-xs text-surface-400 line-clamp-2 mb-3">
                  {prompt.prompt}
                </p>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPrompt(prompt);
                    }}
                    className="flex-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePrompt(prompt.id);
                    }}
                    className="flex-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400">No prompts found</p>
          </div>
        )}
      </div>

      {/* Add Prompt FAB - Mobile: Bottom right, Desktop: Same */}
      <Button
        variant="primary"
        size="icon-lg"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 shadow-glow-lg z-40"
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Prompt Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Prompt"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Title
            </label>
            <Input placeholder="Enter prompt title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Category
            </label>
            <select className="w-full input">
              <option value="enhancement">Enhancement</option>
              <option value="style">Style</option>
              <option value="creative">Creative</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Prompt
            </label>
            <textarea
              className="w-full input min-h-[120px] resize-none"
              placeholder="Enter your prompt..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Save Prompt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
