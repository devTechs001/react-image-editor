// frontend/src/components/tools/MeasureTool.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ruler, X, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

export default function MeasureTool({ canvasRef, onClose }) {
  const [measurements, setMeasurements] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);

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
    setIsMeasuring(true);
  }, [getCanvasPoint]);

  const handleMouseMove = useCallback((e) => {
    if (!isMeasuring) return;
    setCurrentPoint(getCanvasPoint(e));
  }, [isMeasuring, getCanvasPoint]);

  const handleMouseUp = useCallback((e) => {
    if (!isMeasuring || !startPoint) return;
    
    const endPoint = getCanvasPoint(e);
    
    // Calculate measurements
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const horizontalDist = Math.abs(dx);
    const verticalDist = Math.abs(dy);

    setMeasurements(prev => [...prev, {
      id: Date.now(),
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
      distance,
      angle,
      horizontalDist,
      verticalDist
    }]);

    setIsMeasuring(false);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [isMeasuring, startPoint, getCanvasPoint]);

  // Draw measurements on canvas
  React.useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved measurements
    measurements.forEach(measurement => {
      drawMeasurement(ctx, measurement, false);
    });

    // Draw current measurement preview
    if (isMeasuring && startPoint && currentPoint) {
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      drawMeasurement(ctx, {
        startX: startPoint.x,
        startY: startPoint.y,
        endX: currentPoint.x,
        endY: currentPoint.y,
        distance,
        angle,
        horizontalDist: Math.abs(dx),
        verticalDist: Math.abs(dy)
      }, true);
    }
  }, [measurements, isMeasuring, startPoint, currentPoint, canvasRef]);

  const drawMeasurement = (ctx, m, isPreview) => {
    const { startX, startY, endX, endY } = m;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = isPreview ? '#3b82f6' : '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw endpoints
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fillStyle = isPreview ? '#3b82f6' : '#10b981';
    ctx.fill();

    // Draw measurement label
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(midX - 40, midY - 30, 80, 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(m.distance)}px`, midX, midY - 15);
    ctx.fillText(`∠${Math.round(m.angle)}°`, midX, midY);
  };

  const removeMeasurement = (id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const clearAll = () => {
    setMeasurements([]);
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const copyMeasurement = (m) => {
    const text = `Distance: ${Math.round(m.distance)}px\nAngle: ${Math.round(m.angle)}°\nHorizontal: ${Math.round(m.horizontalDist)}px\nVertical: ${Math.round(m.verticalDist)}px`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Measure Tool
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-surface-800/50 rounded-lg p-3 text-xs text-surface-400">
        <p>Click and drag on the canvas to measure distance and angle between two points.</p>
      </div>

      {/* Current Measurement */}
      {isMeasuring && startPoint && currentPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-3"
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-surface-400">Distance:</span>
              <span className="ml-2 text-white font-mono">
                {Math.round(Math.sqrt(
                  Math.pow(currentPoint.x - startPoint.x, 2) +
                  Math.pow(currentPoint.y - startPoint.y, 2)
                ))}px
              </span>
            </div>
            <div>
              <span className="text-surface-400">Angle:</span>
              <span className="ml-2 text-white font-mono">
                {Math.round(Math.atan2(
                  currentPoint.y - startPoint.y,
                  currentPoint.x - startPoint.x
                ) * (180 / Math.PI))}°
              </span>
            </div>
            <div>
              <span className="text-surface-400">Horizontal:</span>
              <span className="ml-2 text-white font-mono">
                {Math.round(Math.abs(currentPoint.x - startPoint.x))}px
              </span>
            </div>
            <div>
              <span className="text-surface-400">Vertical:</span>
              <span className="ml-2 text-white font-mono">
                {Math.round(Math.abs(currentPoint.y - startPoint.y))}px
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-surface-400">
            <span>{measurements.length} measurement{measurements.length !== 1 ? 's' : ''}</span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="w-3 h-3" />
              Clear All
            </Button>
          </div>

          {measurements.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-800 rounded-lg p-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-400">Measurement #{index + 1}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyMeasurement(m)}
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeMeasurement(m.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Distance:</span>
                  <span className="text-white font-mono">{Math.round(m.distance)}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Angle:</span>
                  <span className="text-white font-mono">{Math.round(m.angle)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">ΔX:</span>
                  <span className="text-white font-mono">{Math.round(m.horizontalDist)}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">ΔY:</span>
                  <span className="text-white font-mono">{Math.round(m.verticalDist)}px</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {measurements.length > 0 && (
        <div className="bg-surface-800 rounded-lg p-3">
          <div className="text-xs text-surface-400 mb-2">Summary</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-surface-500">Total Distance:</span>
              <div className="text-white font-mono">
                {Math.round(measurements.reduce((sum, m) => sum + m.distance, 0))}px
              </div>
            </div>
            <div>
              <span className="text-surface-500">Average Distance:</span>
              <div className="text-white font-mono">
                {Math.round(measurements.reduce((sum, m) => sum + m.distance, 0) / measurements.length)}px
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
