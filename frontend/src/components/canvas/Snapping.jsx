// frontend/src/components/canvas/Snapping.jsx
import React, { memo, useMemo } from 'react';
import { Line } from 'react-konva';

const Snapping = memo(({
  objects = [],
  selectedObject,
  snappingDistance = 5,
  showSnapLines = true,
  canvasWidth,
  canvasHeight
}) => {
  const snapLines = useMemo(() => {
    if (!selectedObject) return { horizontal: [], vertical: [] };

    const { x, y, width, height } = selectedObject;
    const selectedBounds = {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2
    };

    const horizontalLines = [];
    const verticalLines = [];

    objects.forEach((obj, index) => {
      if (obj === selectedObject) return;

      const objBounds = {
        left: obj.x,
        right: obj.x + obj.width,
        top: obj.y,
        bottom: obj.y + obj.height,
        centerX: obj.x + obj.width / 2,
        centerY: obj.y + obj.height / 2
      };

      // Check horizontal snapping
      const horizontalSnaps = [
        { pos: selectedBounds.top, target: objBounds.top, type: 'top-top' },
        { pos: selectedBounds.top, target: objBounds.bottom, type: 'top-bottom' },
        { pos: selectedBounds.bottom, target: objBounds.top, type: 'bottom-top' },
        { pos: selectedBounds.bottom, target: objBounds.bottom, type: 'bottom-bottom' },
        { pos: selectedBounds.centerY, target: objBounds.centerY, type: 'center-center' }
      ];

      horizontalSnaps.forEach(({ pos, target, type }) => {
        if (Math.abs(pos - target) <= snappingDistance) {
          horizontalLines.push({
            y: target,
            x1: 0,
            x2: canvasWidth,
            type
          });
        }
      });

      // Check vertical snapping
      const verticalSnaps = [
        { pos: selectedBounds.left, target: objBounds.left, type: 'left-left' },
        { pos: selectedBounds.left, target: objBounds.right, type: 'left-right' },
        { pos: selectedBounds.right, target: objBounds.left, type: 'right-left' },
        { pos: selectedBounds.right, target: objBounds.right, type: 'right-right' },
        { pos: selectedBounds.centerX, target: objBounds.centerX, type: 'center-center' }
      ];

      verticalSnaps.forEach(({ pos, target, type }) => {
        if (Math.abs(pos - target) <= snappingDistance) {
          verticalLines.push({
            x: target,
            y1: 0,
            y2: canvasHeight,
            type
          });
        }
      });
    });

    // Canvas center snapping
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    if (Math.abs(selectedBounds.centerX - canvasCenterX) <= snappingDistance) {
      verticalLines.push({
        x: canvasCenterX,
        y1: 0,
        y2: canvasHeight,
        type: 'canvas-center'
      });
    }

    if (Math.abs(selectedBounds.centerY - canvasCenterY) <= snappingDistance) {
      horizontalLines.push({
        y: canvasCenterY,
        x1: 0,
        x2: canvasWidth,
        type: 'canvas-center'
      });
    }

    return { horizontal: horizontalLines, vertical: verticalLines };
  }, [objects, selectedObject, snappingDistance, canvasWidth, canvasHeight]);

  if (!showSnapLines) return null;

  return (
    <>
      {/* Horizontal snap lines */}
      {snapLines.horizontal.map((line, index) => (
        <Line
          key={`h-snap-${index}`}
          points={[line.x1, line.y, line.x2, line.y]}
          stroke="#3b82f6"
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.8}
        />
      ))}

      {/* Vertical snap lines */}
      {snapLines.vertical.map((line, index) => (
        <Line
          key={`v-snap-${index}`}
          points={[line.x, line.y1, line.x, line.y2]}
          stroke="#3b82f6"
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.8}
        />
      ))}
    </>
  );
});

Snapping.displayName = 'Snapping';

export default Snapping;
