// frontend/src/components/ui/CommandPalette.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  X,
  File,
  Image,
  Video,
  Music,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  FolderOpen,
  Sparkles,
  Download,
  Upload,
  Plus,
  ChevronRight,
  Layers,
  Palette,
  Wand2,
  Crown
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers/cn';

const commands = [
  {
    category: 'Navigation',
    items: [
      { id: 'home', label: 'Go to Home', icon: File, shortcut: ['G', 'H'], action: '/dashboard' },
      { id: 'editor', label: 'Open Image Editor', icon: Image, shortcut: ['G', 'E'], action: '/editor' },
      { id: 'video', label: 'Open Video Editor', icon: Video, shortcut: ['G', 'V'], action: '/video-editor' },
      { id: 'audio', label: 'Open Audio Editor', icon: Music, shortcut: ['G', 'A'], action: '/audio-editor' },
      { id: 'gallery', label: 'View Gallery', icon: FolderOpen, shortcut: ['G', 'G'], action: '/gallery' },
      { id: 'templates', label: 'Browse Templates', icon: Sparkles, shortcut: ['G', 'T'], action: '/templates' },
      { id: 'projects', label: 'View Projects', icon: FolderOpen, shortcut: ['G', 'P'], action: '/projects' },
      { id: 'settings', label: 'Open Settings', icon: Settings, shortcut: [','], action: '/settings' },
      { id: 'help', label: 'Help Center', icon: HelpCircle, action: '/help' }
    ]
  },
  {
    category: 'Actions',
    items: [
      { id: 'new-project', label: 'Create New Project', icon: Plus, shortcut: ['N'], action: '/editor' },
      { id: 'upload', label: 'Upload Asset', icon: Upload, action: '/assets' },
      { id: 'export', label: 'Export Project', icon: Download, action: '/projects' },
      { id: 'pricing', label: 'Upgrade to Pro', icon: Crown, action: '/pricing' }
    ]
  },
  {
    category: 'Tools',
    items: [
      { id: 'bg-remove', label: 'Remove Background', icon: Wand2, action: '/editor?tool=bg-remove' },
      { id: 'enhance', label: 'AI Enhance', icon: Wand2, action: '/editor?tool=enhance' },
      { id: 'layers', label: 'Manage Layers', icon: Layers, action: '/editor?panel=layers' },
      { id: 'filters', label: 'Apply Filters', icon: Palette, action: '/editor?panel=filters' }
    ]
  },
  {
    category: 'Theme',
    items: [
      { id: 'theme-dark', label: 'Dark Theme', icon: Moon, action: 'theme:dark' },
      { id: 'theme-light', label: 'Light Theme', icon: Sun, action: 'theme:light' },
      { id: 'theme-system', label: 'System Theme', icon: Monitor, action: 'theme:system' }
    ]
  }
];

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const flattenCommands = commands.flatMap(cat => cat.items);

  const filteredCommands = search
    ? flattenCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
      )
    : flattenCommands;

  const handleCommand = useCallback((cmd) => {
    if (cmd.action.startsWith('theme:')) {
      const themeName = cmd.action.split(':')[1];
      setTheme(themeName);
    } else if (cmd.action.startsWith('/')) {
      navigate(cmd.action);
    }
    onClose();
    setSearch('');
  }, [navigate, onClose, setTheme]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault();
      handleCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, handleCommand, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Command Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl z-50"
      >
        <div className="bg-editor-card border border-editor-border rounded-2xl shadow-elevated overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-editor-border">
            <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-surface-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Commands List */}
          <div
            ref={listRef}
            className="max-h-96 overflow-y-auto p-2"
          >
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                <p className="text-surface-400">No commands found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commands.map((category) => {
                  const categoryCommands = category.items.filter(cmd =>
                    !search || cmd.label.toLowerCase().includes(search.toLowerCase())
                  );

                  if (categoryCommands.length === 0) return null;

                  return (
                    <div key={category.category}>
                      <h3 className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                        {category.category}
                      </h3>
                      <div className="space-y-1">
                        {categoryCommands.map((cmd, index) => {
                          const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = cmd.icon;

                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleCommand(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                isSelected
                                  ? 'bg-primary-500/20 text-white'
                                  : 'text-surface-300 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                isSelected ? 'bg-primary-500/30' : 'bg-surface-800'
                              )}>
                                <Icon className={cn(
                                  'w-4 h-4',
                                  isSelected ? 'text-primary-300' : 'text-surface-400'
                                )} />
                              </div>
                              <span className="flex-1 text-left font-medium">{cmd.label}</span>
                              <div className="flex items-center gap-1">
                                {cmd.shortcut?.map((key, i) => (
                                  <kbd
                                    key={i}
                                    className="px-1.5 py-0.5 text-xs rounded bg-surface-800 border border-surface-700 text-surface-400"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                                <ChevronRight className="w-4 h-4 text-surface-500" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-editor-border bg-editor-surface/50">
            <div className="flex items-center gap-4 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">esc</kbd>
                to close
              </span>
            </div>
            <div className="text-xs text-surface-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">⌘K</kbd> anytime
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
