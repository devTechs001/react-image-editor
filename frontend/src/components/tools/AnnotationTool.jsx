// frontend/src/components/tools/AnnotationTool.jsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Highlighter,
  StickyNote,
  PenTool,
  X,
  Trash2,
  Move,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Check
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/ui/ColorPicker';
import Slider from '@/components/ui/Slider';

const annotationTypes = {
  TEXT: 'text',
  HIGHLIGHT: 'highlight',
  NOTE: 'note',
  FREEHAND: 'freehand'
};

export default function AnnotationTool({ canvasRef, onClose }) {
  const [selectedType, setSelectedType] = useState(annotationTypes.TEXT);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  const [settings, setSettings] = useState({
    fontSize: 16,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    highlightColor: 'rgba(255, 255, 0, 0.3)',
    noteColor: '#fbbf24',
    strokeColor: '#ef4444',
    strokeWidth: 2,
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });

  const textareaRef = useRef(null);

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef?.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  const handleCanvasClick = useCallback((e) => {
    const point = getCanvasPoint(e);
    
    if (selectedType === annotationTypes.TEXT) {
      const newAnnotation = {
        id: Date.now(),
        type: annotationTypes.TEXT,
        x: point.x,
        y: point.y,
        text: 'Double-click to edit',
        ...settings
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotation(newAnnotation);
      setEditingText(newAnnotation.text);
    } else if (selectedType === annotationTypes.NOTE) {
      const newAnnotation = {
        id: Date.now(),
        type: annotationTypes.NOTE,
        x: point.x,
        y: point.y,
        width: 150,
        height: 100,
        text: 'Add note...',
        ...settings
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [selectedType, settings, getCanvasPoint]);

  const handleMouseDown = useCallback((e) => {
    if (selectedType === annotationTypes.FREEHAND || selectedType === annotationTypes.HIGHLIGHT) {
      const point = getCanvasPoint(e);
      setIsDrawing(true);
      
      const newAnnotation = {
        id: Date.now(),
        type: selectedType,
        points: [point],
        ...settings
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [selectedType, settings, getCanvasPoint]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const point = getCanvasPoint(e);
    
    setAnnotations(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && (last.type === annotationTypes.FREEHAND || last.type === annotationTypes.HIGHLIGHT)) {
        last.points = [...last.points, point];
      }
      return updated;
    });
  }, [isDrawing, getCanvasPoint]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
    }
  };

  const updateAnnotation = (id, updates) => {
    setAnnotations(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  };

  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
  }, [annotations, canvasRef]);

  const drawAnnotation = (ctx, annotation) => {
    switch (annotation.type) {
      case annotationTypes.TEXT:
        ctx.font = `${annotation.italic ? 'italic ' : ''}${annotation.bold ? 'bold ' : ''}${annotation.fontSize}px ${annotation.fontFamily}`;
        ctx.fillStyle = annotation.textColor;
        ctx.textAlign = annotation.align;
        ctx.fillText(annotation.text, annotation.x, annotation.y);
        
        if (annotation.underline) {
          const metrics = ctx.measureText(annotation.text);
          const y = annotation.y + annotation.fontSize / 2 + 2;
          ctx.beginPath();
          ctx.moveTo(annotation.x, y);
          ctx.lineTo(annotation.x + metrics.width, y);
          ctx.strokeStyle = annotation.textColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;

      case annotationTypes.HIGHLIGHT:
        if (annotation.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        annotation.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = annotation.highlightColor;
        ctx.lineWidth = annotation.fontSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        break;

      case annotationTypes.NOTE:
        // Draw note background
        ctx.fillStyle = annotation.noteColor;
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        
        // Draw fold effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.moveTo(annotation.x + annotation.width - 20, annotation.y);
        ctx.lineTo(annotation.x + annotation.width, annotation.y);
        ctx.lineTo(annotation.x + annotation.width, annotation.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // Draw text
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(annotation.text, annotation.x + 10, annotation.y + 20);
        break;

      case annotationTypes.FREEHAND:
        if (annotation.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        annotation.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = annotation.strokeColor;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        break;
    }
  };

  // Redraw on annotation change
  React.useEffect(() => {
    drawAnnotations();
  }, [annotations, drawAnnotations]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Annotation Tools</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Type Selection */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: annotationTypes.TEXT, icon: Type, label: 'Text' },
          { id: annotationTypes.HIGHLIGHT, icon: Highlighter, label: 'Highlight' },
          { id: annotationTypes.NOTE, icon: StickyNote, label: 'Note' },
          { id: annotationTypes.FREEHAND, icon: PenTool, label: 'Draw' }
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedType(tool.id)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              selectedType === tool.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
            )}
          >
            <tool.icon className="w-4 h-4" />
            <span className="text-[10px]">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="bg-surface-800 rounded-xl p-4 space-y-4">
        {selectedType === annotationTypes.TEXT && (
          <>
            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-xs text-surface-400">
                Font Size: {settings.fontSize}px
              </label>
              <Slider
                value={settings.fontSize}
                onChange={(v) => setSettings(s => ({ ...s, fontSize: v }))}
                min={8}
                max={72}
                step={1}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-xs text-surface-400">Text Color</label>
              <ColorPicker
                value={settings.textColor}
                onChange={(color) => setSettings(s => ({ ...s, textColor: color }))}
              />
            </div>

            {/* Text Formatting */}
            <div className="flex gap-1">
              <Button
                variant={settings.bold ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, bold: !s.bold }))}
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                variant={settings.italic ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, italic: !s.italic }))}
              >
                <Italic className="w-3 h-3" />
              </Button>
              <Button
                variant={settings.underline ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, underline: !s.underline }))}
              >
                <Underline className="w-3 h-3" />
              </Button>
              <div className="w-px h-6 bg-surface-600 mx-1" />
              <Button
                variant={settings.align === 'left' ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, align: 'left' }))}
              >
                <AlignLeft className="w-3 h-3" />
              </Button>
              <Button
                variant={settings.align === 'center' ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, align: 'center' }))}
              >
                <AlignCenter className="w-3 h-3" />
              </Button>
              <Button
                variant={settings.align === 'right' ? 'primary' : 'secondary'}
                size="icon-sm"
                onClick={() => setSettings(s => ({ ...s, align: 'right' }))}
              >
                <AlignRight className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}

        {selectedType === annotationTypes.FREEHAND && (
          <>
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
            <div className="space-y-2">
              <label className="text-xs text-surface-400">Stroke Color</label>
              <ColorPicker
                value={settings.strokeColor}
                onChange={(color) => setSettings(s => ({ ...s, strokeColor: color }))}
              />
            </div>
          </>
        )}

        {selectedType === annotationTypes.NOTE && (
          <div className="space-y-2">
            <label className="text-xs text-surface-400">Note Color</label>
            <ColorPicker
              value={settings.noteColor}
              onChange={(color) => setSettings(s => ({ ...s, noteColor: color }))}
            />
          </div>
        )}
      </div>

      {/* Annotations List */}
      {annotations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-400">
            <span>{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {annotations.map((annotation, index) => (
              <div
                key={annotation.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer',
                  selectedAnnotation?.id === annotation.id
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'bg-surface-800 hover:bg-surface-700'
                )}
                onClick={() => setSelectedAnnotation(annotation)}
              >
                <div className="flex items-center gap-2">
                  {annotation.type === annotationTypes.TEXT && <Type className="w-3 h-3" />}
                  {annotation.type === annotationTypes.HIGHLIGHT && <Highlighter className="w-3 h-3" />}
                  {annotation.type === annotationTypes.NOTE && <StickyNote className="w-3 h-3" />}
                  {annotation.type === annotationTypes.FREEHAND && <PenTool className="w-3 h-3" />}
                  <span>{annotation.type}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAnnotation(annotation.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-surface-800/50 rounded-lg p-3 text-xs text-surface-400">
        {selectedType === annotationTypes.TEXT && (
          <p>Click on canvas to add text. Double-click annotation to edit.</p>
        )}
        {selectedType === annotationTypes.HIGHLIGHT && (
          <p>Click and drag to highlight areas.</p>
        )}
        {selectedType === annotationTypes.NOTE && (
          <p>Click on canvas to add a sticky note.</p>
        )}
        {selectedType === annotationTypes.FREEHAND && (
          <p>Click and drag to draw freehand annotations.</p>
        )}
      </div>
    </div>
  );
}
