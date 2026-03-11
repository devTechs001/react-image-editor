// frontend/src/contexts/EditorContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const EditorContext = createContext();

export function EditorProvider({ children }) {
  // Canvas state
  const [canvas, setCanvas] = useState(null);
  const [canvasConfig, setCanvasConfig] = useState({
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff'
  });

  // Image state
  const [currentImage, setCurrentImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Layers state
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [activeLayerId, setActiveLayerId] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI state
  const [aiProcessing, setAIProcessing] = useState(false);
  const [aiResults, setAIResults] = useState({});

  // Tool state
  const [activeTool, setActiveTool] = useState('select');
  const [toolOptions, setToolOptions] = useState({});

  // View state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  // Export state
  const [exportSettings, setExportSettings] = useState({
    format: 'png',
    quality: 100,
    scale: 1
  });

  // Project state
  const [project, setProject] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Actions
  const setCurrentImageData = useCallback((imageData) => {
    setCurrentImage(imageData);
    if (!originalImage) {
      setOriginalImage(imageData);
    }
    setIsDirty(true);
  }, [originalImage]);

  const resetCanvas = useCallback(() => {
    setCanvas(null);
    setCurrentImage(null);
    setOriginalImage(null);
    setLayers([]);
    setHistory([]);
    setHistoryIndex(-1);
    setAIResults({});
    setIsDirty(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const addToHistory = useCallback((action, data) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ action, data, timestamp: Date.now() });
    
    // Keep only last 100 history entries
    if (newHistory.length > 100) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsDirty(true);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Layer actions
  const addLayer = useCallback((layer) => {
    setLayers(prev => [...prev, { ...layer, id: layer.id || `layer-${Date.now()}` }]);
    setIsDirty(true);
  }, []);

  const updateLayer = useCallback((layerId, updates) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
    setIsDirty(true);
  }, []);

  const deleteLayer = useCallback((layerId) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
    setIsDirty(true);
  }, [selectedLayerId]);

  const reorderLayers = useCallback((fromIndex, toIndex) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      return newLayers;
    });
    setIsDirty(true);
  }, []);

  const value = {
    // State
    canvas,
    canvasConfig,
    currentImage,
    originalImage,
    layers,
    selectedLayerId,
    activeLayerId,
    history,
    historyIndex,
    aiProcessing,
    aiResults,
    activeTool,
    toolOptions,
    zoom,
    pan,
    showGrid,
    showGuides,
    exportSettings,
    project,
    isDirty,
    canUndo,
    canRedo,
    
    // Setters
    setCanvas,
    setCanvasConfig,
    setCurrentImageData,
    setOriginalImage,
    setLayers,
    setSelectedLayerId,
    setActiveLayerId,
    setHistory,
    setHistoryIndex,
    setAIProcessing,
    setAIResults,
    setActiveTool,
    setToolOptions,
    setZoom,
    setPan,
    setShowGrid,
    setShowGuides,
    setExportSettings,
    setProject,
    setIsDirty,
    
    // Actions
    resetCanvas,
    addToHistory,
    undo,
    redo,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayers
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

export default EditorContext;
