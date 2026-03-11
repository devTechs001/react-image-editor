// frontend/src/components/tools/CropTool.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCw } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

const aspectRatios = [
  { label: 'Free', value: 'free' },
  { label: 'Original', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 },
  { label: '16:9', value: 16/9 },
  { label: '9:16', value: 9/16 },
  { label: '4:5', value: 4/5 },
  { label: '2:3', value: 2/3 }
];

export default function CropTool({
  imageWidth,
  imageHeight,
  onApply,
  onCancel
}) {
  const { toolSettings, updateToolSettings } = useEditor();
  const cropSettings = toolSettings.crop;

  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: imageWidth,
    height: imageHeight
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleAspectRatioChange = useCallback((ratio) => {
    updateToolSettings('crop', { aspectRatio: ratio });
    
    if (ratio === 'free' || ratio === 'original') {
      return;
    }

    // Adjust crop area to match aspect ratio
    const currentRatio = cropArea.width / cropArea.height;
    let newWidth = cropArea.width;
    let newHeight = cropArea.height;

    if (currentRatio > ratio) {
      newWidth = cropArea.height * ratio;
    } else {
      newHeight = cropArea.width / ratio;
    }

    setCropArea({
      ...cropArea,
      width: newWidth,
      height: newHeight
    });
  }, [cropArea, updateToolSettings]);

  const handleMouseDown = useCallback((e, handle) => {
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    setCropArea((prev) => {
      let newArea = { ...prev };

      switch (dragHandle) {
        case 'move':
          newArea.x = Math.max(0, Math.min(imageWidth - prev.width, prev.x + dx));
          newArea.y = Math.max(0, Math.min(imageHeight - prev.height, prev.y + dy));
          break;
        case 'nw':
          newArea.x = Math.max(0, prev.x + dx);
          newArea.y = Math.max(0, prev.y + dy);
          newArea.width = Math.max(50, prev.width - dx);
          newArea.height = Math.max(50, prev.height - dy);
          break;
        case 'ne':
          newArea.y = Math.max(0, prev.y + dy);
          newArea.width = Math.max(50, prev.width + dx);
          newArea.height = Math.max(50, prev.height - dy);
          break;
        case 'sw':
          newArea.x = Math.max(0, prev.x + dx);
          newArea.width = Math.max(50, prev.width - dx);
          newArea.height = Math.max(50, prev.height + dy);
          break;
        case 'se':
          newArea.width = Math.max(50, prev.width + dx);
          newArea.height = Math.max(50, prev.height + dy);
          break;
        case 'n':
          newArea.y = Math.max(0, prev.y + dy);
          newArea.height = Math.max(50, prev.height - dy);
          break;
        case 's':
          newArea.height = Math.max(50, prev.height + dy);
          break;
        case 'w':
          newArea.x = Math.max(0, prev.x + dx);
          newArea.width = Math.max(50, prev.width - dx);
          break;
        case 'e':
          newArea.width = Math.max(50, prev.width + dx);
          break;
      }

      // Constrain to image bounds
      newArea.width = Math.min(newArea.width, imageWidth - newArea.x);
      newArea.height = Math.min(newArea.height, imageHeight - newArea.y);

      return newArea;
    });

    setStartPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragHandle, startPos, imageWidth, imageHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  const handleApply = useCallback(() => {
    onApply?.(cropArea);
  }, [cropArea, onApply]);

  return (
    <div className="absolute inset-0 z-10">
      {/* Overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dark overlay */}
        <defs>
          <mask id="cropMask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={cropArea.x}
              y={cropArea.y}
              width={cropArea.width}
              height={cropArea.height}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#cropMask)"
        />

        {/* Crop area border */}
        <rect
          x={cropArea.x}
          y={cropArea.y}
          width={cropArea.width}
          height={cropArea.height}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
        />

        {/* Grid lines (rule of thirds) */}
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="1">
          <line
            x1={cropArea.x + cropArea.width / 3}
            y1={cropArea.y}
            x2={cropArea.x + cropArea.width / 3}
            y2={cropArea.y + cropArea.height}
          />
          <line
            x1={cropArea.x + (cropArea.width * 2) / 3}
            y1={cropArea.y}
            x2={cropArea.x + (cropArea.width * 2) / 3}
            y2={cropArea.y + cropArea.height}
          />
          <line
            x1={cropArea.x}
            y1={cropArea.y + cropArea.height / 3}
            x2={cropArea.x + cropArea.width}
            y2={cropArea.y + cropArea.height / 3}
          />
          <line
            x1={cropArea.x}
            y1={cropArea.y + (cropArea.height * 2) / 3}
            x2={cropArea.x + cropArea.width}
            y2={cropArea.y + (cropArea.height * 2) / 3}
          />
        </g>

        {/* Move handle (center) */}
        <rect
          x={cropArea.x}
          y={cropArea.y}
          width={cropArea.width}
          height={cropArea.height}
          fill="transparent"
          cursor="move"
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        />

        {/* Resize handles */}
        {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => {
          let x, y;
          let cursor;

          switch (handle) {
            case 'nw':
              x = cropArea.x - 5;
              y = cropArea.y - 5;
              cursor = 'nw-resize';
              break;
            case 'ne':
              x = cropArea.x + cropArea.width - 5;
              y = cropArea.y - 5;
              cursor = 'ne-resize';
              break;
            case 'sw':
              x = cropArea.x - 5;
              y = cropArea.y + cropArea.height - 5;
              cursor = 'sw-resize';
              break;
            case 'se':
              x = cropArea.x + cropArea.width - 5;
              y = cropArea.y + cropArea.height - 5;
              cursor = 'se-resize';
              break;
            case 'n':
              x = cropArea.x + cropArea.width / 2 - 5;
              y = cropArea.y - 5;
              cursor = 'n-resize';
              break;
            case 's':
              x = cropArea.x + cropArea.width / 2 - 5;
              y = cropArea.y + cropArea.height - 5;
              cursor = 's-resize';
              break;
            case 'e':
              x = cropArea.x + cropArea.width - 5;
              y = cropArea.y + cropArea.height / 2 - 5;
              cursor = 'e-resize';
              break;
            case 'w':
              x = cropArea.x - 5;
              y = cropArea.y + cropArea.height / 2 - 5;
              cursor = 'w-resize';
              break;
          }

          return (
            <rect
              key={handle}
              x={x}
              y={y}
              width={10}
              height={10}
              fill="#6366f1"
              stroke="white"
              strokeWidth={2}
              rx={2}
              cursor={cursor}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            />
          );
        })}
      </svg>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* Aspect Ratio Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-editor-card/90 backdrop-blur-xl border border-editor-border">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => handleAspectRatioChange(ratio.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                cropSettings.aspectRatio === ratio.value
                  ? 'bg-primary-500 text-white'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              )}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            icon={X}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Crop Info */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-editor-card/90 backdrop-blur-xl border border-editor-border text-xs text-surface-300">
        {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
      </div>
    </div>
  );
}