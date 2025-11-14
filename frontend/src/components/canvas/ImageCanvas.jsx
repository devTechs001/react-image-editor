import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorContext } from '@contexts/EditorContext';
import CanvasControls from './CanvasControls';

const ImageCanvas = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { state, dispatch } = useEditorContext();
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    // Initialize Fabric.js canvas
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    const canvas = fabricCanvasRef.current;

    // Event listeners
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObject(null));
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:rotating', handleObjectRotating);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.dispose();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelection = (e) => {
    setSelectedObject(e.selected[0]);
    dispatch({
      type: 'SET_SELECTED_OBJECT',
      payload: e.selected[0],
    });
  };

  const handleObjectModified = (e) => {
    saveHistory();
  };

  const handleObjectMoving = (e) => {
    // Snap to grid
    if (state.snapToGrid) {
      const obj = e.target;
      obj.set({
        left: Math.round(obj.left / 10) * 10,
        top: Math.round(obj.top / 10) * 10,
      });
    }
  };

  const handleObjectScaling = (e) => {
    const obj = e.target;
    if (state.maintainAspectRatio) {
      obj.set({ lockUniScaling: true });
    }
  };

  const handleObjectRotating = (e) => {
    const obj = e.target;
    if (state.snapRotation) {
      obj.set({
        angle: Math.round(obj.angle / 15) * 15,
      });
    }
  };

  const handleKeyDown = (e) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        deleteSelected();
        break;
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          copySelected();
        }
        break;
      case 'v':
        if (e.ctrlKey || e.metaKey) {
          paste();
        }
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      case 'ArrowUp':
        activeObject.set({ top: activeObject.top - (e.shiftKey ? 10 : 1) });
        canvas.renderAll();
        break;
      case 'ArrowDown':
        activeObject.set({ top: activeObject.top + (e.shiftKey ? 10 : 1) });
        canvas.renderAll();
        break;
      case 'ArrowLeft':
        activeObject.set({ left: activeObject.left - (e.shiftKey ? 10 : 1) });
        canvas.renderAll();
        break;
      case 'ArrowRight':
        activeObject.set({ left: activeObject.left + (e.shiftKey ? 10 : 1) });
        canvas.renderAll();
        break;
    }
  };

  // Canvas Operations
  const addImage = (imageUrl) => {
    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        img.scale(0.5);
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        saveHistory();
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const addText = (text = 'Double click to edit') => {
    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#000000',
    });

    fabricCanvasRef.current.add(textObj);
    fabricCanvasRef.current.setActiveObject(textObj);
    fabricCanvasRef.current.renderAll();
    saveHistory();
  };

  const addShape = (type) => {
    let shape;

    switch (type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
        break;
      case 'line':
        shape = new fabric.Line([50, 100, 200, 100], {
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;
    }

    if (shape) {
      fabricCanvasRef.current.add(shape);
      fabricCanvasRef.current.setActiveObject(shape);
      fabricCanvasRef.current.renderAll();
      saveHistory();
    }
  };

  const applyFilter = (filterType, options = {}) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject || activeObject.type !== 'image') return;

    const filters = {
      grayscale: new fabric.Image.filters.Grayscale(),
      sepia: new fabric.Image.filters.Sepia(),
      brightness: new fabric.Image.filters.Brightness(options),
      contrast: new fabric.Image.filters.Contrast(options),
      saturation: new fabric.Image.filters.Saturation(options),
      blur: new fabric.Image.filters.Blur(options),
      sharpen: new fabric.Image.filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      }),
      emboss: new fabric.Image.filters.Convolute({
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
      }),
      invert: new fabric.Image.filters.Invert(),
      pixelate: new fabric.Image.filters.Pixelate(options),
      removeColor: new fabric.Image.filters.RemoveColor(options),
    };

    if (filters[filterType]) {
      activeObject.filters.push(filters[filterType]);
      activeObject.applyFilters();
      canvas.renderAll();
      saveHistory();
    }
  };

  const clearFilters = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === 'image') {
      activeObject.filters = [];
      activeObject.applyFilters();
      canvas.renderAll();
      saveHistory();
    }
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      saveHistory();
    }
  };

  const copySelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      activeObject.clone((cloned) => {
        dispatch({ type: 'SET_CLIPBOARD', payload: cloned });
      });
    }
  };

  const paste = () => {
    if (!state.clipboard) return;

    state.clipboard.clone((clonedObj) => {
      const canvas = fabricCanvasRef.current;
      canvas.discardActiveObject();

      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });

      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = canvas;
        clonedObj.forEachObject((obj) => {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }

      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
      saveHistory();
    });
  };

  const bringToFront = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      canvas.bringToFront(activeObject);
      canvas.renderAll();
      saveHistory();
    }
  };

  const sendToBack = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      canvas.sendToBack(activeObject);
      canvas.renderAll();
      saveHistory();
    }
  };

  const groupObjects = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 1) {
      const group = new fabric.Group(activeObjects);
      canvas.remove(...activeObjects);
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      saveHistory();
    }
  };

  const ungroupObjects = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === 'group') {
      const items = activeObject.getObjects();
      activeObject._restoreObjectsState();
      canvas.remove(activeObject);

      items.forEach((item) => {
        canvas.add(item);
      });

      canvas.renderAll();
      saveHistory();
    }
  };

  const exportCanvas = (format = 'png', quality = 1.0) => {
    const canvas = fabricCanvasRef.current;

    switch (format) {
      case 'png':
        return canvas.toDataURL({ format: 'png', quality });
      case 'jpeg':
        return canvas.toDataURL({ format: 'jpeg', quality });
      case 'svg':
        return canvas.toSVG();
      case 'json':
        return JSON.stringify(canvas.toJSON());
      default:
        return canvas.toDataURL();
    }
  };

  const importCanvas = (json) => {
    const canvas = fabricCanvasRef.current;

    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      saveHistory();
    });
  };

  const clearCanvas = () => {
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
    saveHistory();
  };

  const saveHistory = () => {
    const json = fabricCanvasRef.current.toJSON();
    dispatch({ type: 'SAVE_HISTORY', payload: json });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
    const previousState = state.history[state.historyStep - 1];
    if (previousState) {
      importCanvas(previousState);
    }
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
    const nextState = state.history[state.historyStep + 1];
    if (nextState) {
      importCanvas(nextState);
    }
  };

  const zoomIn = () => {
    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 1.1);
  };

  const zoomOut = () => {
    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 0.9);
  };

  const resetZoom = () => {
    fabricCanvasRef.current.setZoom(1);
  };

  return (
    <div className="relative w-full h-full">
      <CanvasControls
        onAddImage={addImage}
        onAddText={addText}
        onAddShape={addShape}
        onApplyFilter={applyFilter}
        onClearFilters={clearFilters}
        onDelete={deleteSelected}
        onCopy={copySelected}
        onPaste={paste}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onGroup={groupObjects}
        onUngroup={ungroupObjects}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onExport={exportCanvas}
        onClear={clearCanvas}
        selectedObject={selectedObject}
      />

      <div className="canvas-container border border-gray-300 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default ImageCanvas;