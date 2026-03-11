// frontend/src/contexts/EditorContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { produce } from 'immer';

const EditorContext = createContext();

// Initial State
const initialState = {
  // Canvas State
  canvas: {
    width: 1920,
    height: 1080,
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    backgroundColor: '#000000'
  },
  
  // Layers
  layers: [],
  activeLayerId: null,
  selectedLayerIds: [],
  
  // Tools
  activeTool: 'select',
  toolSettings: {
    brush: { size: 20, hardness: 100, opacity: 100, color: '#ffffff' },
    eraser: { size: 20, hardness: 100, opacity: 100 },
    text: { fontFamily: 'Inter', fontSize: 24, fontWeight: 400, color: '#ffffff' },
    shape: { type: 'rectangle', fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 },
    crop: { aspectRatio: 'free', width: null, height: null },
    select: { mode: 'rectangle' }
  },
  
  // Image
  image: null,
  originalImage: null,
  imageHistory: [],
  historyIndex: -1,
  
  // Adjustments
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    clarity: 0,
    sharpness: 0,
    noise: 0,
    vignette: 0
  },
  
  // Filters
  activeFilter: null,
  filterIntensity: 100,
  customFilters: [],
  
  // AI
  aiProcessing: false,
  aiResults: null,
  
  // UI State
  ui: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    bottomPanelOpen: false,
    activeTab: 'layers',
    previewMode: false,
    compareMode: false,
    gridVisible: false,
    guidesVisible: true,
    snapEnabled: true
  },
  
  // Project
  project: {
    id: null,
    name: 'Untitled Project',
    modified: false,
    lastSaved: null
  },
  
  // Export
  exportSettings: {
    format: 'png',
    quality: 100,
    scale: 1,
    preserveMetadata: true
  }
};

// Action Types
const ActionTypes = {
  // Canvas
  SET_CANVAS: 'SET_CANVAS',
  SET_ZOOM: 'SET_ZOOM',
  SET_PAN: 'SET_PAN',
  RESET_VIEW: 'RESET_VIEW',
  
  // Layers
  ADD_LAYER: 'ADD_LAYER',
  REMOVE_LAYER: 'REMOVE_LAYER',
  UPDATE_LAYER: 'UPDATE_LAYER',
  SET_ACTIVE_LAYER: 'SET_ACTIVE_LAYER',
  REORDER_LAYERS: 'REORDER_LAYERS',
  DUPLICATE_LAYER: 'DUPLICATE_LAYER',
  MERGE_LAYERS: 'MERGE_LAYERS',
  TOGGLE_LAYER_VISIBILITY: 'TOGGLE_LAYER_VISIBILITY',
  TOGGLE_LAYER_LOCK: 'TOGGLE_LAYER_LOCK',
  
  // Tools
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  UPDATE_TOOL_SETTINGS: 'UPDATE_TOOL_SETTINGS',
  
  // Image
  SET_IMAGE: 'SET_IMAGE',
  SET_ORIGINAL_IMAGE: 'SET_ORIGINAL_IMAGE',
  UPDATE_IMAGE: 'UPDATE_IMAGE',
  
  // History
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  
  // Adjustments
  SET_ADJUSTMENT: 'SET_ADJUSTMENT',
  RESET_ADJUSTMENTS: 'RESET_ADJUSTMENTS',
  SET_ALL_ADJUSTMENTS: 'SET_ALL_ADJUSTMENTS',
  
  // Filters
  SET_FILTER: 'SET_FILTER',
  SET_FILTER_INTENSITY: 'SET_FILTER_INTENSITY',
  CLEAR_FILTER: 'CLEAR_FILTER',
  
  // AI
  SET_AI_PROCESSING: 'SET_AI_PROCESSING',
  SET_AI_RESULTS: 'SET_AI_RESULTS',
  
  // UI
  TOGGLE_LEFT_PANEL: 'TOGGLE_LEFT_PANEL',
  TOGGLE_RIGHT_PANEL: 'TOGGLE_RIGHT_PANEL',
  TOGGLE_BOTTOM_PANEL: 'TOGGLE_BOTTOM_PANEL',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_UI_STATE: 'SET_UI_STATE',
  
  // Project
  SET_PROJECT: 'SET_PROJECT',
  SET_PROJECT_MODIFIED: 'SET_PROJECT_MODIFIED',
  
  // Export
  SET_EXPORT_SETTINGS: 'SET_EXPORT_SETTINGS',
  
  // Reset
  RESET_EDITOR: 'RESET_EDITOR'
};

// Reducer
function editorReducer(state, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      // Canvas
      case ActionTypes.SET_CANVAS:
        draft.canvas = { ...draft.canvas, ...action.payload };
        break;
        
      case ActionTypes.SET_ZOOM:
        draft.canvas.zoom = Math.max(0.1, Math.min(10, action.payload));
        break;
        
      case ActionTypes.SET_PAN:
        draft.canvas.panX = action.payload.x;
        draft.canvas.panY = action.payload.y;
        break;
        
      case ActionTypes.RESET_VIEW:
        draft.canvas.zoom = 1;
        draft.canvas.panX = 0;
        draft.canvas.panY = 0;
        draft.canvas.rotation = 0;
        break;
        
      // Layers
      case ActionTypes.ADD_LAYER:
        draft.layers.push(action.payload);
        draft.activeLayerId = action.payload.id;
        draft.project.modified = true;
        break;
        
      case ActionTypes.REMOVE_LAYER:
        draft.layers = draft.layers.filter(l => l.id !== action.payload);
        if (draft.activeLayerId === action.payload) {
          draft.activeLayerId = draft.layers[draft.layers.length - 1]?.id || null;
        }
        draft.project.modified = true;
        break;
        
      case ActionTypes.UPDATE_LAYER:
        const layerIndex = draft.layers.findIndex(l => l.id === action.payload.id);
        if (layerIndex !== -1) {
          draft.layers[layerIndex] = { ...draft.layers[layerIndex], ...action.payload.updates };
        }
        draft.project.modified = true;
        break;
        
      case ActionTypes.SET_ACTIVE_LAYER:
        draft.activeLayerId = action.payload;
        break;
        
      case ActionTypes.REORDER_LAYERS:
        draft.layers = action.payload;
        draft.project.modified = true;
        break;
        
      case ActionTypes.DUPLICATE_LAYER:
        const layerToDuplicate = draft.layers.find(l => l.id === action.payload);
        if (layerToDuplicate) {
          const duplicated = {
            ...layerToDuplicate,
            id: `layer_${Date.now()}`,
            name: `${layerToDuplicate.name} Copy`
          };
          const idx = draft.layers.findIndex(l => l.id === action.payload);
          draft.layers.splice(idx + 1, 0, duplicated);
          draft.activeLayerId = duplicated.id;
        }
        draft.project.modified = true;
        break;
        
      case ActionTypes.TOGGLE_LAYER_VISIBILITY:
        const visLayerIdx = draft.layers.findIndex(l => l.id === action.payload);
        if (visLayerIdx !== -1) {
          draft.layers[visLayerIdx].visible = !draft.layers[visLayerIdx].visible;
        }
        break;
        
      case ActionTypes.TOGGLE_LAYER_LOCK:
        const lockLayerIdx = draft.layers.findIndex(l => l.id === action.payload);
        if (lockLayerIdx !== -1) {
          draft.layers[lockLayerIdx].locked = !draft.layers[lockLayerIdx].locked;
        }
        break;
        
      // Tools
      case ActionTypes.SET_ACTIVE_TOOL:
        draft.activeTool = action.payload;
        break;
        
      case ActionTypes.UPDATE_TOOL_SETTINGS:
        draft.toolSettings[action.payload.tool] = {
          ...draft.toolSettings[action.payload.tool],
          ...action.payload.settings
        };
        break;
        
      // Image
      case ActionTypes.SET_IMAGE:
        draft.image = action.payload;
        draft.project.modified = true;
        break;
        
      case ActionTypes.SET_ORIGINAL_IMAGE:
        draft.originalImage = action.payload;
        break;
        
      case ActionTypes.UPDATE_IMAGE:
        draft.image = action.payload;
        draft.project.modified = true;
        break;
        
      // History
      case ActionTypes.ADD_TO_HISTORY:
        draft.imageHistory = draft.imageHistory.slice(0, draft.historyIndex + 1);
        draft.imageHistory.push(action.payload);
        draft.historyIndex = draft.imageHistory.length - 1;
        if (draft.imageHistory.length > 50) {
          draft.imageHistory.shift();
          draft.historyIndex--;
        }
        break;
        
      case ActionTypes.UNDO:
        if (draft.historyIndex > 0) {
          draft.historyIndex--;
          draft.image = draft.imageHistory[draft.historyIndex];
        }
        break;
        
      case ActionTypes.REDO:
        if (draft.historyIndex < draft.imageHistory.length - 1) {
          draft.historyIndex++;
          draft.image = draft.imageHistory[draft.historyIndex];
        }
        break;
        
      case ActionTypes.CLEAR_HISTORY:
        draft.imageHistory = [];
        draft.historyIndex = -1;
        break;
        
      // Adjustments
      case ActionTypes.SET_ADJUSTMENT:
        draft.adjustments[action.payload.key] = action.payload.value;
        draft.project.modified = true;
        break;
        
      case ActionTypes.RESET_ADJUSTMENTS:
        draft.adjustments = { ...initialState.adjustments };
        draft.project.modified = true;
        break;
        
      case ActionTypes.SET_ALL_ADJUSTMENTS:
        draft.adjustments = { ...draft.adjustments, ...action.payload };
        draft.project.modified = true;
        break;
        
      // Filters
      case ActionTypes.SET_FILTER:
        draft.activeFilter = action.payload;
        draft.project.modified = true;
        break;
        
      case ActionTypes.SET_FILTER_INTENSITY:
        draft.filterIntensity = action.payload;
        break;
        
      case ActionTypes.CLEAR_FILTER:
        draft.activeFilter = null;
        draft.filterIntensity = 100;
        break;
        
      // AI
      case ActionTypes.SET_AI_PROCESSING:
        draft.aiProcessing = action.payload;
        break;
        
      case ActionTypes.SET_AI_RESULTS:
        draft.aiResults = action.payload;
        break;
        
      // UI
      case ActionTypes.TOGGLE_LEFT_PANEL:
        draft.ui.leftPanelOpen = !draft.ui.leftPanelOpen;
        break;
        
      case ActionTypes.TOGGLE_RIGHT_PANEL:
        draft.ui.rightPanelOpen = !draft.ui.rightPanelOpen;
        break;
        
      case ActionTypes.TOGGLE_BOTTOM_PANEL:
        draft.ui.bottomPanelOpen = !draft.ui.bottomPanelOpen;
        break;
        
      case ActionTypes.SET_ACTIVE_TAB:
        draft.ui.activeTab = action.payload;
        break;
        
      case ActionTypes.SET_UI_STATE:
        draft.ui = { ...draft.ui, ...action.payload };
        break;
        
      // Project
      case ActionTypes.SET_PROJECT:
        draft.project = { ...draft.project, ...action.payload };
        break;
        
      case ActionTypes.SET_PROJECT_MODIFIED:
        draft.project.modified = action.payload;
        break;
        
      // Export
      case ActionTypes.SET_EXPORT_SETTINGS:
        draft.exportSettings = { ...draft.exportSettings, ...action.payload };
        break;
        
      // Reset
      case ActionTypes.RESET_EDITOR:
        return initialState;
        
      default:
        break;
    }
  });
}

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Canvas Actions
  const setCanvas = useCallback((canvas) => {
    dispatch({ type: ActionTypes.SET_CANVAS, payload: canvas });
  }, []);

  const setZoom = useCallback((zoom) => {
    dispatch({ type: ActionTypes.SET_ZOOM, payload: zoom });
  }, []);

  const setPan = useCallback((x, y) => {
    dispatch({ type: ActionTypes.SET_PAN, payload: { x, y } });
  }, []);

  const resetView = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_VIEW });
  }, []);

  // Layer Actions
  const addLayer = useCallback((layer) => {
    const newLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${state.layers.length + 1}`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: state.canvas.width,
      height: state.canvas.height,
      rotation: 0,
      scale: 1,
      ...layer
    };
    dispatch({ type: ActionTypes.ADD_LAYER, payload: newLayer });
    return newLayer.id;
  }, [state.layers.length, state.canvas.width, state.canvas.height]);

  const removeLayer = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_LAYER, payload: id });
  }, []);

  const updateLayer = useCallback((id, updates) => {
    dispatch({ type: ActionTypes.UPDATE_LAYER, payload: { id, updates } });
  }, []);

  const setActiveLayer = useCallback((id) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_LAYER, payload: id });
  }, []);

  const reorderLayers = useCallback((layers) => {
    dispatch({ type: ActionTypes.REORDER_LAYERS, payload: layers });
  }, []);

  const duplicateLayer = useCallback((id) => {
    dispatch({ type: ActionTypes.DUPLICATE_LAYER, payload: id });
  }, []);

  const toggleLayerVisibility = useCallback((id) => {
    dispatch({ type: ActionTypes.TOGGLE_LAYER_VISIBILITY, payload: id });
  }, []);

  const toggleLayerLock = useCallback((id) => {
    dispatch({ type: ActionTypes.TOGGLE_LAYER_LOCK, payload: id });
  }, []);

  // Tool Actions
  const setActiveTool = useCallback((tool) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_TOOL, payload: tool });
  }, []);

  const updateToolSettings = useCallback((tool, settings) => {
    dispatch({ type: ActionTypes.UPDATE_TOOL_SETTINGS, payload: { tool, settings } });
  }, []);

  // Image Actions
  const setImage = useCallback((image) => {
    dispatch({ type: ActionTypes.SET_IMAGE, payload: image });
  }, []);

  const setOriginalImage = useCallback((image) => {
    dispatch({ type: ActionTypes.SET_ORIGINAL_IMAGE, payload: image });
  }, []);

  // History Actions
  const addToHistory = useCallback((state) => {
    dispatch({ type: ActionTypes.ADD_TO_HISTORY, payload: state });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: ActionTypes.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ActionTypes.REDO });
  }, []);

  // Adjustment Actions
  const setAdjustment = useCallback((key, value) => {
    dispatch({ type: ActionTypes.SET_ADJUSTMENT, payload: { key, value } });
  }, []);

  const resetAdjustments = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_ADJUSTMENTS });
  }, []);

  // Filter Actions
  const setFilter = useCallback((filter) => {
    dispatch({ type: ActionTypes.SET_FILTER, payload: filter });
  }, []);

  const setFilterIntensity = useCallback((intensity) => {
    dispatch({ type: ActionTypes.SET_FILTER_INTENSITY, payload: intensity });
  }, []);

  const clearFilter = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_FILTER });
  }, []);

  // AI Actions
  const setAIProcessing = useCallback((processing) => {
    dispatch({ type: ActionTypes.SET_AI_PROCESSING, payload: processing });
  }, []);

  const setAIResults = useCallback((results) => {
    dispatch({ type: ActionTypes.SET_AI_RESULTS, payload: results });
  }, []);

  // UI Actions
  const toggleLeftPanel = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_LEFT_PANEL });
  }, []);

  const toggleRightPanel = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_RIGHT_PANEL });
  }, []);

  const toggleBottomPanel = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_BOTTOM_PANEL });
  }, []);

  const setActiveTab = useCallback((tab) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });
  }, []);

  const setUIState = useCallback((ui) => {
    dispatch({ type: ActionTypes.SET_UI_STATE, payload: ui });
  }, []);

  // Project Actions
  const setProject = useCallback((project) => {
    dispatch({ type: ActionTypes.SET_PROJECT, payload: project });
  }, []);

  // Export Actions
  const setExportSettings = useCallback((settings) => {
    dispatch({ type: ActionTypes.SET_EXPORT_SETTINGS, payload: settings });
  }, []);

  // Reset
  const resetEditor = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_EDITOR });
  }, []);

  // Get active layer
  const activeLayer = useMemo(() => {
    return state.layers.find(l => l.id === state.activeLayerId) || null;
  }, [state.layers, state.activeLayerId]);

  // Check if can undo/redo
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.imageHistory.length - 1;

  const value = {
    // State
    ...state,
    activeLayer,
    canUndo,
    canRedo,
    
    // Canvas Actions
    setCanvas,
    setZoom,
    setPan,
    resetView,
    
    // Layer Actions
    addLayer,
    removeLayer,
    updateLayer,
    setActiveLayer,
    reorderLayers,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    
    // Tool Actions
    setActiveTool,
    updateToolSettings,
    
    // Image Actions
    setImage,
    setOriginalImage,
    
    // History Actions
    addToHistory,
    undo,
    redo,
    
    // Adjustment Actions
    setAdjustment,
    resetAdjustments,
    
    // Filter Actions
    setFilter,
    setFilterIntensity,
    clearFilter,
    
    // AI Actions
    setAIProcessing,
    setAIResults,
    
    // UI Actions
    toggleLeftPanel,
    toggleRightPanel,
    toggleBottomPanel,
    setActiveTab,
    setUIState,
    
    // Project Actions
    setProject,
    
    // Export Actions
    setExportSettings,
    
    // Reset
    resetEditor
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