// frontend/src/components/workspace/CommandPalette.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  X,
  ChevronRight,
  File,
  Image,
  Video,
  Music,
  Type,
  Palette,
  Layers,
  Download,
  Save,
  Upload,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  Zap,
  Wand2,
  Scissors,
  RotateCcw,
  Maximize,
  Grid3X3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Scissors as Cut,
  Clipboard,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Focus,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import { useEditor } from '@/contexts/EditorContext';
import { useTheme } from '@/contexts/ThemeContext';

const commandCategories = {
  file: {
    label: 'File',
    icon: File,
    commands: [
      { id: 'new-project', label: 'New Project', icon: File, shortcut: '⌘N' },
      { id: 'open', label: 'Open...', icon: Upload, shortcut: '⌘O' },
      { id: 'save', label: 'Save', icon: Save, shortcut: '⌘S' },
      { id: 'save-as', label: 'Save As...', icon: Save, shortcut: '⌘⇧S' },
      { id: 'export', label: 'Export', icon: Download, shortcut: '⌘E' },
      { id: 'export-png', label: 'Export as PNG', icon: Image },
      { id: 'export-jpeg', label: 'Export as JPEG', icon: Image },
      { id: 'export-webp', label: 'Export as WebP', icon: Image },
      { id: 'export-gif', label: 'Export as GIF', icon: Image },
      { id: 'export-pdf', label: 'Export as PDF', icon: File }
    ]
  },
  edit: {
    label: 'Edit',
    icon: Zap,
    commands: [
      { id: 'undo', label: 'Undo', icon: RotateCcw, shortcut: '⌘Z' },
      { id: 'redo', label: 'Redo', icon: RotateCcw, shortcut: '⌘⇧Z' },
      { id: 'cut', label: 'Cut', icon: Cut, shortcut: '⌘X' },
      { id: 'copy', label: 'Copy', icon: Copy, shortcut: '⌘C' },
      { id: 'paste', label: 'Paste', icon: Clipboard, shortcut: '⌘V' },
      { id: 'duplicate', label: 'Duplicate', icon: Copy, shortcut: '⌘D' },
      { id: 'delete', label: 'Delete', icon: Trash2, shortcut: 'Del' },
      { id: 'select-all', label: 'Select All', icon: Grid3X3, shortcut: '⌘A' },
      { id: 'deselect', label: 'Deselect', icon: X, shortcut: '⌘⇧A' }
    ]
  },
  view: {
    label: 'View',
    icon: Eye,
    commands: [
      { id: 'zoom-in', label: 'Zoom In', icon: Maximize, shortcut: '⌘+' },
      { id: 'zoom-out', label: 'Zoom Out', icon: Maximize, shortcut: '⌘-' },
      { id: 'zoom-fit', label: 'Zoom to Fit', icon: Maximize, shortcut: '⌘0' },
      { id: 'zoom-100', label: 'Actual Size', icon: Maximize, shortcut: '⌘1' },
      { id: 'toggle-grid', label: 'Toggle Grid', icon: Grid3X3 },
      { id: 'toggle-rulers', label: 'Toggle Rulers', icon: Grid3X3 },
      { id: 'fullscreen', label: 'Fullscreen', icon: Maximize, shortcut: 'F11' }
    ]
  },
  image: {
    label: 'Image',
    icon: Image,
    commands: [
      { id: 'crop', label: 'Crop', icon: Crop },
      { id: 'resize', label: 'Resize', icon: Maximize },
      { id: 'rotate-left', label: 'Rotate Left', icon: RotateCcw },
      { id: 'rotate-right', label: 'Rotate Right', icon: RotateCcw },
      { id: 'flip-h', label: 'Flip Horizontal', icon: FlipHorizontal },
      { id: 'flip-v', label: 'Flip Vertical', icon: FlipVertical },
      { id: 'auto-enhance', label: 'Auto Enhance', icon: Sparkles }
    ]
  },
  ai: {
    label: 'AI Tools',
    icon: Wand2,
    commands: [
      { id: 'bg-remove', label: 'Remove Background', icon: Scissors },
      { id: 'bg-replace', label: 'Replace Background', icon: Image },
      { id: 'ai-enhance', label: 'AI Enhance', icon: Sparkles },
      { id: 'style-transfer', label: 'Style Transfer', icon: Palette },
      { id: 'object-remove', label: 'Remove Object', icon: Trash2 },
      { id: 'face-enhance', label: 'Face Enhance', icon: Sparkles },
      { id: 'super-resolution', label: 'Super Resolution', icon: Focus }
    ]
  },
  layers: {
    label: 'Layers',
    icon: Layers,
    commands: [
      { id: 'new-layer', label: 'New Layer', icon: Layers, shortcut: '⌘⇧N' },
      { id: 'duplicate-layer', label: 'Duplicate Layer', icon: Copy },
      { id: 'delete-layer', label: 'Delete Layer', icon: Trash2 },
      { id: 'merge-down', label: 'Merge Down', icon: Layers },
      { id: 'flatten', label: 'Flatten Image', icon: Layers },
      { id: 'toggle-layer-visibility', label: 'Toggle Visibility', icon: Eye },
      { id: 'lock-layer', label: 'Lock Layer', icon: Lock }
    ]
  },
  theme: {
    label: 'Theme',
    icon: Moon,
    commands: [
      { id: 'theme-light', label: 'Light Theme', icon: Sun },
      { id: 'theme-dark', label: 'Dark Theme', icon: Moon },
      { id: 'theme-system', label: 'System Theme', icon: Monitor }
    ]
  },
  help: {
    label: 'Help',
    icon: HelpCircle,
    commands: [
      { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Command },
      { id: 'documentation', label: 'Documentation', icon: HelpCircle },
      { id: 'about', label: 'About', icon: HelpCircle }
    ]
  }
};

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { undo, redo } = useEditor();

  // Flatten commands for searching
  const allCommands = Object.entries(commandCategories).flatMap(([category, { commands }]) =>
    commands.map(cmd => ({ ...cmd, category }))
  );

  // Filter commands based on search
  const filteredCommands = allCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Execute command
  const executeCommand = useCallback((command) => {
    const handlers = {
      // File commands
      'new-project': () => console.log('New project'),
      'save': () => console.log('Save'),
      'export': () => console.log('Export'),
      
      // Edit commands
      'undo': () => undo(),
      'redo': () => redo(),
      
      // View commands
      'zoom-in': () => console.log('Zoom in'),
      'zoom-out': () => console.log('Zoom out'),
      'toggle-grid': () => console.log('Toggle grid'),
      
      // Theme commands
      'theme-light': () => setTheme('light'),
      'theme-dark': () => setTheme('dark'),
      'theme-system': () => setTheme('system'),
      
      // AI commands
      'bg-remove': () => console.log('Remove background'),
      'ai-enhance': () => console.log('AI enhance'),
      
      // Help
      'shortcuts': () => console.log('Show shortcuts')
    };

    const handler = handlers[command.id];
    if (handler) {
      handler();
      onClose();
    }
  }, [undo, redo, setTheme, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="w-full max-w-2xl bg-surface-900 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-surface-700">
            <Search className="w-5 h-5 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-surface-400 outline-none text-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 hover:bg-surface-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-surface-400" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-surface-400">
                <Command className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(commandCategories).map(([category, { label, icon: CategoryIcon }]) => {
                  const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                  if (categoryCommands.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-surface-400 uppercase tracking-wider">
                        <CategoryIcon className="w-3 h-3" />
                        {label}
                      </div>
                      <div className="space-y-0.5">
                        {categoryCommands.map((command, index) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = command.icon;

                          return (
                            <button
                              key={command.id}
                              onClick={() => executeCommand(command)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                isSelected
                                  ? 'bg-primary-500/20 text-white'
                                  : 'text-surface-300 hover:bg-surface-800'
                              )}
                            >
                              <Icon className={cn(
                                'w-4 h-4',
                                isSelected ? 'text-primary-400' : 'text-surface-400'
                              )} />
                              <span className="flex-1 text-left">{command.label}</span>
                              {command.shortcut && (
                                <kbd className={cn(
                                  'px-2 py-0.5 text-xs rounded-md font-mono',
                                  isSelected ? 'bg-primary-500/30 text-primary-200' : 'bg-surface-700 text-surface-400'
                                )}>
                                  {command.shortcut}
                                </kbd>
                              )}
                              {command.shortcut === undefined && (
                                <ChevronRight className="w-4 h-4 text-surface-500" />
                              )}
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700 text-xs text-surface-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">esc</kbd>
                to close
              </span>
            </div>
            <span>AI Media Editor</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
