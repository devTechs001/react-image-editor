// frontend/src/components/tools/BrushTool.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor } from '@/contexts/EditorContext';

export default function BrushTool({ canvasRef, onDraw }) {
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  
  const { toolSettings, updateToolSettings } = useEditor();
  const brushSettings = toolSettings.brush;

  const startDrawing = useCallback((e) => {
    isDrawing.current = true;
    const point = getPoint(e);
    lastPoint.current = point;
    
    // Start new stroke
    onDraw?.({
      type: 'start',
      point,
      settings: brushSettings
    });
  }, [brushSettings, onDraw]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    
    const point = getPoint(e);
    
    // Draw line from last point
    onDraw?.({
      type: 'move',
      from: lastPoint.current,
      to: point,
      settings: brushSettings
    });
    
    lastPoint.current = point;
  }, [brushSettings, onDraw]);

  const stopDrawing = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      
      onDraw?.({
        type: 'end',
        settings: brushSettings
      });
    }
  }, [brushSettings, onDraw]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [canvasRef, startDrawing, draw, stopDrawing]);

  return null; // This is a behavior component, no UI
}

// Brush stroke renderer utility
export function renderBrushStroke(ctx, from, to, settings) {
  const { size, hardness, opacity, color } = settings;
  
  ctx.save();
  
  ctx.globalAlpha = opacity / 100;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Adjust blur based on hardness
  if (hardness < 100) {
    ctx.filter = `blur(${(100 - hardness) / 10}px)`;
  }
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  ctx.restore();
}