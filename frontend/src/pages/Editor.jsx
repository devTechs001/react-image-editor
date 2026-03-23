// frontend/src/pages/Editor.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Upload
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import ImageCanvas from '@/components/canvas/ImageCanvas';
import CanvasControls from '@/components/canvas/CanvasControls';
import Toolbar from '@/components/workspace/Toolbar';
import RightPanel from '@/components/workspace/RightPanel';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export default function Editor() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
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
    addLayer
  } = useEditor();

  const [showUploadModal, setShowUploadModal] = useState(!image);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle tool selection from URL params
  useEffect(() => {
    const tool = searchParams.get('tool');
    if (tool) {
      setUI(prev => ({ 
        ...prev, 
        activeTab: 'ai',
        activeAITool: tool 
      }));
    }
  }, [searchParams, setUI]);

  // Load project if projectId exists
  useEffect(() => {
    if (projectId) {
      // Load project from API
      // loadProject(projectId)
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

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      } else if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (isMod && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

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
          
          <Button
            variant="ghost"
            size="icon-sm"
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
        <FileUpload
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']
          }}
          maxSize={50 * 1024 * 1024}
          onUpload={handleFileUpload}
        />
        
        <div className="mt-6 pt-6 border-t border-editor-border">
          <h4 className="text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4">Or start from template</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { name: 'Instagram Post', size: '1080 × 1080' },
              { name: 'Story', size: '1080 × 1920' },
              { name: 'Twitter Post', size: '1200 × 675' },
              { name: 'YouTube Thumbnail', size: '1280 × 720' }
            ].map((template) => (
              <button
                key={template.name}
                className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all text-left"
                onClick={() => {
                  const [width, height] = template.size.split(' × ').map(Number);
                  setCanvas({ width, height, backgroundColor: '#ffffff' });
                  setShowUploadModal(false);
                }}
              >
                <div className="aspect-square rounded-lg bg-surface-800 mb-2 sm:mb-3" />
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
    </div>
  );
}