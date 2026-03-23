// frontend/src/components/tools/ArrowTool.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings2, X } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import ColorPicker from '@/components/ui/ColorPicker';

export default function ArrowTool({ canvasRef, onClose }) {
  const [settings, setSettings] = useState({
    strokeWidth: 3,
    strokeColor: '#3b82f6',
    arrowSize: 15,
    fillArrow: true
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [arrows, setArrows] = useState([]);

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef?.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  const handleMouseDown = useCallback((e) => {
    const point = getCanvasPoint(e);
    setStartPoint(point);
    setIsDrawing(true);
  }, [getCanvasPoint]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = getCanvasPoint(e);
    
    // Redraw canvas with all arrows plus preview
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing arrows
    arrows.forEach(arrow => drawArrow(ctx, arrow));
    
    // Draw preview arrow
    drawArrow(ctx, {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: currentPoint.x,
      endY: currentPoint.y,
      ...settings
    });
  }, [isDrawing, startPoint, arrows, settings, getCanvasPoint, canvasRef]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing || !startPoint) return;
    
    const endPoint = getCanvasPoint(e);
    
    // Add arrow to list
    setArrows(prev => [...prev, {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
      ...settings
    }]);
    
    setIsDrawing(false);
    setStartPoint(null);
  }, [isDrawing, startPoint, settings, getCanvasPoint]);

  const drawArrow = (ctx, arrow) => {
    const { startX, startY, endX, endY, strokeWidth, strokeColor, arrowSize, fillArrow } = arrow;
    
    const angle = Math.atan2(endY - startY, endX - startX);
    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    if (fillArrow) {
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.fill();
    } else {
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  };

  const clearArrows = () => {
    setArrows([]);
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-4">
      {/* Settings Panel */}
      <div className="bg-surface-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Arrow Settings
          </h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">
            Stroke Width: {settings.strokeWidth}px
          </label>
          <Slider
            value={settings.strokeWidth}
            onChange={(v) => setSettings(s => ({ ...s, strokeWidth: v }))}
            min={1}
            max={20}
            step={1}
          />
        </div>

        {/* Arrow Size */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">
            Arrow Size: {settings.arrowSize}px
          </label>
          <Slider
            value={settings.arrowSize}
            onChange={(v) => setSettings(s => ({ ...s, arrowSize: v }))}
            min={5}
            max={30}
            step={1}
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">Color</label>
          <ColorPicker
            value={settings.strokeColor}
            onChange={(color) => setSettings(s => ({ ...s, strokeColor: color }))}
          />
        </div>

        {/* Fill Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-surface-400">Fill Arrowhead</label>
          <input
            type="checkbox"
            checked={settings.fillArrow}
            onChange={(e) => setSettings(s => ({ ...s, fillArrow: e.target.checked }))}
            className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={isDrawing ? 'primary' : 'secondary'}
          size="sm"
          fullWidth
          onClick={() => setIsDrawing(!isDrawing)}
        >
          {isDrawing ? 'Drawing...' : 'Draw Arrow'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={clearArrows}
          disabled={arrows.length === 0}
        >
          Clear
        </Button>
      </div>

      {/* Info */}
      <div className="bg-surface-800/50 rounded-lg p-3 text-xs text-surface-400">
        <p>Click and drag on the canvas to draw arrows. Release to place.</p>
      </div>

      {/* Arrow Count */}
      {arrows.length > 0 && (
        <div className="text-xs text-surface-400 text-center">
          {arrows.length} arrow{arrows.length !== 1 ? 's' : ''} drawn
        </div>
      )}
    </div>
  );
}
