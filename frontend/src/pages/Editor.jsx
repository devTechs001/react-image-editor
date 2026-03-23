// frontend/src/pages/Editor.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Download,
  Share2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  MoreHorizontal,
  Settings,
  HelpCircle,
  ChevronLeft,
  Upload,
  Layers,
  Sparkles,
  Box,
  Puzzle,
  Brain,
  Scan,
  MessageSquare,
  Wand2,
  Zap,
  Cloud,
  Terminal,
  Activity,
  Code2,
  History
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import ImageCanvas from '@/components/canvas/ImageCanvas';
import CanvasControls from '@/components/canvas/CanvasControls';
import Toolbar from '@/components/workspace/Toolbar';
import RightPanel from '@/components/workspace/RightPanel';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ToolManager from '@/components/tools/ToolManager';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

// Tab mapping for URL parameters
const TAB_MAPPING = {
  '3d': '3d',
  'plugins': 'plugins',
  'neural': 'neural',
  'vision': 'vision',
  'nlp': 'nlp',
  'genai': 'genai',
  'rl': 'rl',
  'cloud': 'cloud',
  'script': 'script',
  'performance': 'performance',
  'api': 'api',
  'batch': 'batch',
  'layers': 'layers',
  'properties': 'properties',
  'assets': 'assets',
  'presets': 'presets',
  'ai': 'ai',
  'history': 'history'
};

// AI Tool mapping for URL parameters
const AI_TOOL_MAPPING = {
  'face-swap': 'face-swap',
  'background-replace': 'background-replace',
  'background-remove': 'background-remove',
  'colorize': 'colorize',
  'face-detect': 'face-detect',
  'face-enhance': 'face-enhance',
  'object-detect': 'object-detect',
  'computer-vision': 'computer-vision',
  'nlp': 'nlp',
  'generative-ai': 'generative-ai',
  'reinforcement-learning': 'reinforcement-learning',
  'enhance': 'enhance',
  'upscale': 'upscale',
  'denoise': 'denoise',
  'style-transfer': 'style-transfer',
  'generate': 'generate',
  'inpaint': 'inpaint',
  'text-to-image': 'text-to-image',
  'smart-crop': 'smart-crop',
  'portrait-mode': 'portrait-mode'
};

export default function Editor() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const {
    project,
    image,
    setImage,
    setOriginalImage,
    setCanvas,
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    setProject,
    ui,
    setUI,
    layers,
    addLayer,
    activeTab,
    setActiveTab,
    activeTool,
    setActiveTool
  } = useEditor();

  const [showUploadModal, setShowUploadModal] = useState(!image);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Handle tab and tool selection from URL params on mount and param change
  useEffect(() => {
    const tab = searchParams.get('tab');
    const tool = searchParams.get('tool');

    if (tab && TAB_MAPPING[tab]) {
      setActiveTab(TAB_MAPPING[tab]);
    }

    if (tool && AI_TOOL_MAPPING[tool]) {
      setUI(prev => ({
        ...prev,
        activeTab: 'ai',
        activeAITool: AI_TOOL_MAPPING[tool]
      }));
    } else if (!tool && ui.activeAITool) {
      // Clear AI tool if no tool param but tab is set
      if (tab && tab !== 'ai') {
        setUI(prev => ({
          ...prev,
          activeAITool: null
        }));
      }
    }
  }, [searchParams, setActiveTab, setUI, ui.activeAITool]);

  // Load project if projectId exists
  useEffect(() => {
    if (projectId) {
      // Load project from API
      // loadProject(projectId)
      toast.success('Project loaded!');
    } else {
      // If no projectId and no image, initialize with default layer
      if (layers.length === 0) {
        addLayer({
          id: 'background',
          name: 'Background',
          type: 'image',
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: 'normal'
        });
      }
    }
  }, [projectId, layers.length, addLayer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Global shortcuts (always work)
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (isMod && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
        return;
      }

      // Panel shortcuts (only when not in text input)
      if (isMod && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            setActiveTab('layers');
            setSearchParams({ tab: 'layers' });
            toast.success('Layers panel opened');
            break;
          case 'a':
            e.preventDefault();
            setActiveTab('ai');
            setSearchParams({ tab: 'ai' });
            toast.success('AI tools panel opened');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('3d');
            setSearchParams({ tab: '3d' });
            toast.success('3D Canvas opened');
            break;
          case 'p':
            e.preventDefault();
            setActiveTab('plugins');
            setSearchParams({ tab: 'plugins' });
            toast.success('Plugin Manager opened');
            break;
          case 'n':
            e.preventDefault();
            setActiveTab('neural');
            setSearchParams({ tab: 'neural' });
            toast.success('Neural Networks opened');
            break;
          case 'v':
            e.preventDefault();
            setActiveTab('vision');
            setSearchParams({ tab: 'vision' });
            toast.success('Computer Vision opened');
            break;
          case 'm':
            e.preventDefault();
            setActiveTab('nlp');
            setSearchParams({ tab: 'nlp' });
            toast.success('NLP panel opened');
            break;
          case 'g':
            e.preventDefault();
            setActiveTab('genai');
            setSearchParams({ tab: 'genai' });
            toast.success('Generative AI opened');
            break;
          case 'r':
            e.preventDefault();
            setActiveTab('rl');
            setSearchParams({ tab: 'rl' });
            toast.success('Reinforcement Learning opened');
            break;
          case 'c':
            e.preventDefault();
            setActiveTab('cloud');
            setSearchParams({ tab: 'cloud' });
            toast.success('Cloud Sync opened');
            break;
          case 's':
            e.preventDefault();
            setActiveTab('script');
            setSearchParams({ tab: 'script' });
            toast.success('Script Editor opened');
            break;
          case 'f':
            e.preventDefault();
            setActiveTab('performance');
            setSearchParams({ tab: 'performance' });
            toast.success('Performance Monitor opened');
            break;
          case 'i':
            e.preventDefault();
            setActiveTab('api');
            setSearchParams({ tab: 'api' });
            toast.success('API Integration opened');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('batch');
            setSearchParams({ tab: 'batch' });
            toast.success('Batch Processing opened');
            break;
          case 'h':
            e.preventDefault();
            setActiveTab('history');
            setSearchParams({ tab: 'history' });
            toast.success('History panel opened');
            break;
          case '?':
            e.preventDefault();
            setShowShortcutsModal(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, setActiveTab, setSearchParams]);

  const handleFileUpload = useCallback(async (file) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        setImage(imageUrl);
        setOriginalImage(imageUrl);
        setCanvas({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        addToHistory(imageUrl);
        setShowUploadModal(false);
        toast.success('Image loaded successfully!');
      };

      img.onerror = () => {
        toast.error('Failed to load image');
      };

      img.src = imageUrl;
    } catch (error) {
      toast.error('Error loading file');
    }
  }, [setImage, setOriginalImage, setCanvas, addToHistory]);

  // Quick access function for advanced panels
  const openPanel = useCallback((tabId, label) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    toast.success(`${label} opened`);
  }, [setActiveTab, setSearchParams]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save project to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      toast.success('Project saved!');
      setProject({ modified: false, lastSaved: new Date() });
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  }, [setProject]);

  const handleExport = useCallback(async (settings) => {
    try {
      // Export logic here
      toast.success('Export started!');
      setShowExportModal(false);
    } catch (error) {
      toast.error('Export failed');
    }
  }, []);

  // Panel quick access menu items
  const panelMenuItems = [
    { id: 'layers', icon: Layers, label: 'Layers', shortcut: '⇧L' },
    { id: 'ai', icon: Sparkles, label: 'AI Tools', shortcut: '⇧A' },
    { id: '3d', icon: Box, label: '3D Canvas', shortcut: '⇧3', badge: '3D' },
    { id: 'plugins', icon: Puzzle, label: 'Plugins', shortcut: '⇧P' },
    { id: 'neural', icon: Brain, label: 'Neural Networks', shortcut: '⇧N', badge: 'AI' },
    { id: 'vision', icon: Scan, label: 'Computer Vision', shortcut: '⇧V', badge: 'New' },
    { id: 'nlp', icon: MessageSquare, label: 'NLP', shortcut: '⇧M', badge: 'New' },
    { id: 'genai', icon: Wand2, label: 'Generative AI', shortcut: '⇧G', badge: 'New' },
    { id: 'rl', icon: Zap, label: 'Reinforcement', shortcut: '⇧R', badge: 'New' },
    { id: 'cloud', icon: Cloud, label: 'Cloud Sync', shortcut: '⇧C' },
    { id: 'script', icon: Terminal, label: 'Script Editor', shortcut: '⇧S', badge: 'Code' },
    { id: 'performance', icon: Activity, label: 'Performance', shortcut: '⇧F' },
    { id: 'api', icon: Code2, label: 'API Integration', shortcut: '⇧I' },
    { id: 'batch', icon: Layers, label: 'Batch Processing', shortcut: '⇧B', badge: 'New' },
    { id: 'history', icon: History, label: 'History', shortcut: '⇧H' }
  ];

  const [showPanelMenu, setShowPanelMenu] = useState(false);

  // Close panel menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPanelMenu && !e.target.closest('[data-panel-menu]')) {
        setShowPanelMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanelMenu]);

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 bg-editor-surface border-b border-editor-border flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="h-4 sm:h-6 w-px bg-editor-border hidden sm:block" />
          
          <div>
            <input
              type="text"
              value={project?.name || 'Untitled Project'}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-0 max-w-[120px] sm:max-w-[200px]"
            />
            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-surface-500">
              {project?.modified && <span className="text-amber-400">• Unsaved changes</span>}
              {project?.lastSaved && (
                <span>Last saved {new Date(project.lastSaved).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Center Section - History Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undo}
            disabled={!canUndo}
            icon={Undo2}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={!canRedo}
            icon={Redo2}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            icon={Save}
          >
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Share2}
          >
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowExportModal(true)}
            icon={Download}
          >
            <span className="hidden sm:inline">Export</span>
          </Button>

          <div className="h-4 sm:h-6 w-px bg-editor-border mx-1 sm:mx-2 hidden sm:block" />

          {/* Panels Dropdown */}
          <div className="relative hidden md:block" data-panel-menu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanelMenu(!showPanelMenu)}
              className="gap-2"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden lg:inline">Panels</span>
            </Button>

            <AnimatePresence>
              {showPanelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-editor-surface border border-editor-border rounded-xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-dark"
                  data-panel-menu
                >
                  <div className="p-3 border-b border-editor-border">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Quick Access Panels
                    </h3>
                  </div>

                  <div className="p-2 space-y-1">
                    {panelMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            openPanel(item.id, item.label);
                            setShowPanelMenu(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                            isActive
                              ? "bg-primary-500/10 text-primary-400"
                              : "text-surface-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 text-sm text-left">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-primary-500/20 text-primary-300">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-surface-600 group-hover:text-surface-500">
                            {item.shortcut}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-editor-border">
                    <button
                      onClick={() => {
                        setShowShortcutsModal(true);
                        setShowPanelMenu(false);
                      }}
                      className="w-full flex items-center gap-2 text-xs text-surface-400 hover:text-white transition-colors"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>View all keyboard shortcuts</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowShortcutsModal(true)}
            icon={HelpCircle}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Settings}
          />
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden flex-col sm:flex-row">
        {/* Left Toolbar - Mobile: Horizontal, Desktop: Vertical */}
        <Toolbar orientation={window.innerWidth >= 640 ? "vertical" : "horizontal"} />

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          {image ? (
            <>
              <ImageCanvas ref={canvasRef} />
              
              {/* Tool Manager - Handles active tool rendering */}
              <ToolManager activeTool={activeTool} canvasRef={canvasRef} />

              {/* Canvas Controls Overlay - Mobile: Bottom, Desktop: Bottom Center */}
              <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-1/2 sm:-translate-x-1/2 z-10">
                <CanvasControls />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-editor-card border border-editor-border flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-surface-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  Start with an Image
                </h3>
                <p className="text-sm sm:text-base text-surface-400 mb-4 sm:mb-6 max-w-xs sm:max-w-md">
                  Upload an image to start editing, or choose from our templates
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowUploadModal(true)}
                  icon={Upload}
                >
                  Upload Image
                </Button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => image && setShowUploadModal(false)}
        title="Upload Image"
        size="lg"
        closeOnOverlay={!!image}
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Choose an image to edit
            </h3>
            <p className="text-sm text-surface-400">
              Upload a high-quality image to start creating
            </p>
          </div>

          <FileUpload
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']
            }}
            maxSize={50 * 1024 * 1024}
            minSize={1024}
            multiple={false}
            onFileSelect={(files) => {
              if (files && files.length > 0) {
                handleFileUpload(files[0]);
              }
            }}
            imagePreview={true}
            dragText="Drag & drop your image here"
            browseText="Browse Files"
            description="Supports PNG, JPG, JPEG, GIF, WebP, SVG, BMP"
          />

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-editor-border" />
            <span className="text-xs text-surface-500">OR</span>
            <div className="flex-1 h-px bg-editor-border" />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4">Start from template</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { name: 'Instagram Post', size: '1080 × 1080', color: 'from-pink-500 to-rose-500' },
              { name: 'Story', size: '1080 × 1920', color: 'from-purple-500 to-indigo-500' },
              { name: 'Twitter Post', size: '1200 × 675', color: 'from-blue-500 to-cyan-500' },
              { name: 'YouTube Thumbnail', size: '1280 × 720', color: 'from-red-500 to-orange-500' }
            ].map((template) => (
              <button
                key={template.name}
                className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all text-left"
                onClick={() => {
                  const [width, height] = template.size.split(' × ').map(Number);
                  setCanvas({ width, height, backgroundColor: '#ffffff' });
                  setShowUploadModal(false);
                  toast.success(`${template.name} template loaded!`);
                }}
              >
                <div className={cn(
                  "aspect-square rounded-lg mb-2 sm:mb-3 bg-gradient-to-br",
                  template.color,
                  "group-hover:scale-105 transition-transform"
                )} />
                <p className="text-xs sm:text-sm font-medium text-white">{template.name}</p>
                <p className="text-[10px] sm:text-xs text-surface-500">{template.size}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Image"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleExport({})}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {['PNG', 'JPG', 'WEBP', 'SVG'].map((format) => (
                <button
                  key={format}
                  className="px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-editor-border text-center hover:border-primary-500/50 transition-all"
                >
                  <span className="text-xs sm:text-sm font-medium text-white">{format}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="label">Quality</label>
            <input
              type="range"
              min="1"
              max="100"
              defaultValue="100"
              className="w-full range-slider"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-surface-500 mt-1">
              <span className="hidden sm:inline">Smaller file</span>
              <span>100%</span>
              <span className="hidden sm:inline">Best quality</span>
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="label">Scale</label>
            <div className="grid grid-cols-4 gap-2">
              {['0.5x', '1x', '2x', '4x'].map((scale) => (
                <button
                  key={scale}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-editor-border text-xs sm:text-sm hover:border-primary-500/50 transition-all"
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        title="Keyboard Shortcuts"
        size="lg"
      >
        <div className="space-y-6">
          {/* Global Shortcuts */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Global Shortcuts
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-surface-800 rounded-lg">
                <span className="text-sm text-white">Undo</span>
                <kbd className="px-2 py-1.5 bg-surface-700 rounded text-xs text-surface-300 font-mono">
                  ⌘/Ctrl + Z
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-800 rounded-lg">
                <span className="text-sm text-white">Redo</span>
                <kbd className="px-2 py-1.5 bg-surface-700 rounded text-xs text-surface-300 font-mono">
                  ⌘/Ctrl + ⇧ + Z
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-800 rounded-lg">
                <span className="text-sm text-white">Save Project</span>
                <kbd className="px-2 py-1.5 bg-surface-700 rounded text-xs text-surface-300 font-mono">
                  ⌘/Ctrl + S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-800 rounded-lg">
                <span className="text-sm text-white">Export Image</span>
                <kbd className="px-2 py-1.5 bg-surface-700 rounded text-xs text-surface-300 font-mono">
                  ⌘/Ctrl + E
                </kbd>
              </div>
            </div>
          </div>

          {/* Panel Shortcuts */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Panel Shortcuts (⌘/Ctrl + ⇧ + Key)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'L', label: 'Layers Panel' },
                { key: 'A', label: 'AI Tools' },
                { key: '3', label: '3D Canvas' },
                { key: 'P', label: 'Plugin Manager' },
                { key: 'N', label: 'Neural Networks' },
                { key: 'V', label: 'Computer Vision' },
                { key: 'M', label: 'NLP' },
                { key: 'G', label: 'Generative AI' },
                { key: 'R', label: 'Reinforcement Learning' },
                { key: 'C', label: 'Cloud Sync' },
                { key: 'S', label: 'Script Editor' },
                { key: 'F', label: 'Performance Monitor' },
                { key: 'I', label: 'API Integration' },
                { key: 'B', label: 'Batch Processing' },
                { key: 'H', label: 'History' }
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-2.5 bg-surface-800 rounded-lg"
                >
                  <span className="text-sm text-white">{shortcut.label}</span>
                  <kbd className="px-2 py-1.5 bg-surface-700 rounded text-xs text-surface-300 font-mono">
                    ⌘/Ctrl + ⇧ + {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">Pro Tip</h5>
                <p className="text-xs text-surface-400 leading-relaxed">
                  You can also access all panels from the dropdown menu in the top bar, or by clicking the tabs in the right panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}