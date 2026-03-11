// frontend/src/hooks/core/useCanvas.js
import { useState, useCallback, useRef, useEffect } from 'react';

export function useCanvas(stageRef, canvasConfig) {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(10, newScale));

    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [stageRef, stageScale, stagePosition]);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    setIsPanning(true);
    lastPosition.current = {
      x: e.evt?.clientX || e.clientX,
      y: e.evt?.clientY || e.clientY,
    };
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    setIsPanning(false);
    const stage = stageRef.current;
    if (stage) {
      setStagePosition({
        x: stage.x(),
        y: stage.y(),
      });
    }
  }, [stageRef]);

  // Mouse handlers for panning
  const handleMouseDown = useCallback((e) => {
    if (e.evt.button === 1 || e.evt.spaceKey) {
      handleDragStart(e);
    }
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;

    const dx = (e.evt?.clientX || e.clientX) - lastPosition.current.x;
    const dy = (e.evt?.clientY || e.clientY) - lastPosition.current.y;

    setStagePosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPosition.current = {
      x: e.evt?.clientX || e.clientX,
      y: e.evt?.clientY || e.clientY,
    };
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom to specific level
  const zoomTo = useCallback((scale, centerX, centerY) => {
    const stage = stageRef.current;
    if (!stage) return;

    const clampedScale = Math.max(0.1, Math.min(10, scale));
    
    if (centerX !== undefined && centerY !== undefined) {
      const oldScale = stageScale;
      const mousePointTo = {
        x: (centerX - stagePosition.x) / oldScale,
        y: (centerY - stagePosition.y) / oldScale,
      };

      setStageScale(clampedScale);
      setStagePosition({
        x: centerX - mousePointTo.x * clampedScale,
        y: centerY - mousePointTo.y * clampedScale,
      });
    } else {
      setStageScale(clampedScale);
    }
  }, [stageRef, stageScale, stagePosition]);

  // Reset view
  const resetView = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  // Fit to screen
  const fitToScreen = useCallback((containerWidth, containerHeight, padding = 50) => {
    const scaleX = (containerWidth - padding * 2) / canvasConfig.width;
    const scaleY = (containerHeight - padding * 2) / canvasConfig.height;
    const scale = Math.min(scaleX, scaleY, 1);

    setStageScale(scale);
    setStagePosition({
      x: (containerWidth - canvasConfig.width * scale) / 2,
      y: (containerHeight - canvasConfig.height * scale) / 2,
    });
  }, [canvasConfig.width, canvasConfig.height]);

  return {
    stageScale,
    stagePosition,
    isPanning,
    handleWheel,
    handleDragStart,
    handleDragEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomTo,
    resetView,
    fitToScreen,
    setStageScale,
    setStagePosition,
  };
}

export default useCanvas;