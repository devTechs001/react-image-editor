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

  // Adjustment state
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    clarity: 0,
    sharpness: 0,
    noise: 0,
    vignette: 0
  });

  const setAdjustment = useCallback((key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments({
      brightness: 0,
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      sharpness: 0,
      noise: 0,
      vignette: 0
    });
  }, []);

  // Filter state
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterIntensity, setFilterIntensity] = useState(100);

  const setFilter = useCallback((filter) => {
    setActiveFilter(filter);
    setIsDirty(true);
  }, []);

  // AI state
  const [aiProcessing, setAIProcessing] = useState(false);
  const [aiResults, setAIResults] = useState({});

  // Tool state
  const [activeTool, setActiveTool] = useState('select');
  const [toolOptions, setToolOptions] = useState({});

  // UI state
  const [ui, setUI] = useState({
    rightPanelOpen: true,
    leftPanelOpen: true,
    activeTab: 'layers',
    activeAITool: null
  });

  const setActiveTab = useCallback((tab) => {
    setUI(prev => ({ ...prev, activeTab: tab }));
  }, []);

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

  const reorderLayers = useCallback((newLayers) => {
    setLayers(newLayers);
    setIsDirty(true);
  }, []);

  const duplicateLayer = useCallback((layerId) => {
    setLayers(prev => {
      const layer = prev.find(l => l.id === layerId);
      if (!layer) return prev;
      const newLayer = { ...layer, id: `layer-${Date.now()}`, name: `${layer.name} copy` };
      return [...prev, newLayer];
    });
    setIsDirty(true);
  }, []);

  const toggleLayerVisibility = useCallback((layerId) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  }, []);

  const toggleLayerLock = useCallback((layerId) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ));
  }, []);

  const setImage = useCallback((imageUrl) => {
    setCurrentImageData(imageUrl);
  }, [setCurrentImageData]);

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
    ui,
    activeTab: ui.activeTab,
    adjustments,
    activeFilter,
    filterIntensity,
    image: currentImage,
    
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
    setUI,
    setActiveTab,
    setAdjustment,
    resetAdjustments,
    setFilter,
    setFilterIntensity,
    setImage,
    
    // Actions
    resetCanvas,
    addToHistory,
    undo,
    redo,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayers,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock
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
