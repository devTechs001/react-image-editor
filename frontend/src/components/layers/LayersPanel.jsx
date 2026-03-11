// frontend/src/components/layers/LayersPanel.jsx
import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  Image,
  Type,
  Square,
  Folder,
  MoreHorizontal,
  Merge,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import { cn } from '@/utils/helpers/cn';

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
  'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

const layerTypeIcons = {
  image: Image,
  text: Type,
  shape: Square,
  group: Folder
};

export default function LayersPanel() {
  const {
    layers,
    activeLayerId,
    setActiveLayer,
    addLayer,
    removeLayer,
    updateLayer,
    reorderLayers,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock
  } = useEditor();

  const [expandedLayers, setExpandedLayers] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderLayers(items);
  }, [layers, reorderLayers]);

  const handleAddLayer = useCallback(() => {
    addLayer({
      type: 'image',
      name: 'New Layer'
    });
  }, [addLayer]);

  const handleContextMenu = useCallback((e, layerId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      layerId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div className="h-full flex flex-col" onClick={closeContextMenu}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border">
        <h3 className="text-sm font-semibold text-white">Layers</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleAddLayer}
            icon={Plus}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => activeLayerId && removeLayer(activeLayerId)}
            disabled={!activeLayerId || layers.length <= 1}
            icon={Trash2}
          />
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="layers">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-2 space-y-1"
              >
                {[...layers].reverse().map((layer, index) => {
                  const Icon = layerTypeIcons[layer.type] || Image;
                  const isActive = layer.id === activeLayerId;
                  const isExpanded = expandedLayers.has(layer.id);

                  return (
                    <Draggable
                      key={layer.id}
                      draggableId={layer.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <motion.div
                            layout
                            className={cn(
                              'rounded-xl overflow-hidden transition-all',
                              snapshot.isDragging && 'shadow-elevated',
                              isActive
                                ? 'bg-primary-500/10 border border-primary-500/30'
                                : 'bg-editor-card border border-transparent hover:border-editor-border'
                            )}
                          >
                            {/* Layer Header */}
                            <div
                              className="flex items-center gap-2 p-2 cursor-pointer"
                              onClick={() => setActiveLayer(layer.id)}
                              onContextMenu={(e) => handleContextMenu(e, layer.id)}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="p-1 text-surface-500 hover:text-surface-300 cursor-grab"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="9" cy="6" r="1.5" />
                                  <circle cx="15" cy="6" r="1.5" />
                                  <circle cx="9" cy="12" r="1.5" />
                                  <circle cx="15" cy="12" r="1.5" />
                                  <circle cx="9" cy="18" r="1.5" />
                                  <circle cx="15" cy="18" r="1.5" />
                                </svg>
                              </div>

                              {/* Visibility Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerVisibility(layer.id);
                                }}
                                className={cn(
                                  'p-1 rounded transition-colors',
                                  layer.visible
                                    ? 'text-surface-400 hover:text-white'
                                    : 'text-surface-600'
                                )}
                              >
                                {layer.visible ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>

                              {/* Thumbnail */}
                              <div className={cn(
                                'w-8 h-8 rounded-lg overflow-hidden flex-shrink-0',
                                'bg-surface-800 flex items-center justify-center'
                              )}>
                                {layer.thumbnail ? (
                                  <img
                                    src={layer.thumbnail}
                                    alt={layer.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Icon className="w-4 h-4 text-surface-500" />
                                )}
                              </div>

                              {/* Layer Name */}
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-sm font-medium truncate',
                                  layer.visible ? 'text-white' : 'text-surface-500'
                                )}>
                                  {layer.name}
                                </p>
                              </div>

                              {/* Lock Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerLock(layer.id);
                                }}
                                className={cn(
                                  'p-1 rounded transition-colors',
                                  layer.locked
                                    ? 'text-amber-400'
                                    : 'text-surface-600 hover:text-surface-400'
                                )}
                              >
                                {layer.locked ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </button>

                              {/* Expand Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedLayers(prev => {
                                    const next = new Set(prev);
                                    if (next.has(layer.id)) {
                                      next.delete(layer.id);
                                    } else {
                                      next.add(layer.id);
                                    }
                                    return next;
                                  });
                                }}
                                className="p-1 text-surface-500 hover:text-white transition-colors"
                              >
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.div>
                              </button>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 space-y-3">
                                    {/* Opacity */}
                                    <Slider
                                      label="Opacity"
                                      value={[layer.opacity]}
                                      onValueChange={([value]) => updateLayer(layer.id, { opacity: value })}
                                      min={0}
                                      max={100}
                                      size="sm"
                                      valueSuffix="%"
                                    />

                                    {/* Blend Mode */}
                                    <div>
                                      <label className="text-xs text-surface-500 mb-1 block">
                                        Blend Mode
                                      </label>
                                      <select
                                        value={layer.blendMode}
                                        onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm text-white capitalize"
                                      >
                                        {blendModes.map((mode) => (
                                          <option key={mode} value={mode} className="capitalize">
                                            {mode.replace('-', ' ')}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Empty State */}
        {layers.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mb-3">
              <Folder className="w-6 h-6 text-surface-500" />
            </div>
            <p className="text-sm text-surface-400 mb-3">No layers yet</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddLayer}
              icon={Plus}
            >
              Add Layer
            </Button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={closeContextMenu}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 w-48 py-1 rounded-xl bg-editor-card border border-editor-border shadow-elevated"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                onClick={() => {
                  duplicateLayer(contextMenu.layerId);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  // Move up logic
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <ArrowUp className="w-4 h-4" />
                Move Up
              </button>
              <button
                onClick={() => {
                  // Move down logic
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <ArrowDown className="w-4 h-4" />
                Move Down
              </button>
              <div className="h-px bg-editor-border my-1" />
              <button
                onClick={() => {
                  removeLayer(contextMenu.layerId);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}