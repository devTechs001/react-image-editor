// frontend/src/components/canvas/SelectionBox.jsx
import React, { memo } from 'react';
import { Rect, Circle, Group } from 'react-konva';

const SelectionBox = memo(({
  x,
  y,
  width,
  height,
  rotation = 0,
  isSelected = true,
  showHandles = true,
  handleSize = 8,
  strokeColor = '#3b82f6',
  strokeWidth = 2,
  cornerColor = '#ffffff',
  onResize,
  onRotate
}) => {
  if (!isSelected) return null;

  const handlePositions = [
    { x: -handleSize / 2, y: -handleSize / 2, type: 'nw', cursor: 'nw-resize' },
    { x: width / 2, y: -handleSize / 2, type: 'n', cursor: 'n-resize' },
    { x: width + handleSize / 2, y: -handleSize / 2, type: 'ne', cursor: 'ne-resize' },
    { x: -handleSize / 2, y: height / 2, type: 'w', cursor: 'w-resize' },
    { x: width + handleSize / 2, y: height / 2, type: 'e', cursor: 'e-resize' },
    { x: -handleSize / 2, y: height + handleSize / 2, type: 'sw', cursor: 'sw-resize' },
    { x: width / 2, y: height + handleSize / 2, type: 's', cursor: 's-resize' },
    { x: width + handleSize / 2, y: height + handleSize / 2, type: 'se', cursor: 'se-resize' }
  ];

  // Rotation handle position
  const rotationHandleY = -40;
  const rotationHandleX = width / 2;

  return (
    <Group x={x} y={y} rotation={rotation}>
      {/* Selection border */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={[5, 3]}
        fillEnabled={false}
      />

      {/* Corner handles */}
      {showHandles && handlePositions.map((pos, index) => (
        <Rect
          key={pos.type}
          x={pos.x}
          y={pos.y}
          width={handleSize}
          height={handleSize}
          fill={cornerColor}
          stroke={strokeColor}
          strokeWidth={1}
          cornerRadius={2}
        />
      ))}

      {/* Rotation handle */}
      {showHandles && (
        <Group x={rotationHandleX} y={rotationHandleY}>
          <Line
            points={[0, 0, 0, 40]}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Circle
            x={0}
            y={0}
            radius={6}
            fill={cornerColor}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </Group>
      )}

      {/* Dimensions label */}
      <Rect
        x={width + 5}
        y={0}
        width={60}
        height={20}
        fill="rgba(0, 0, 0, 0.7)"
        cornerRadius={4}
      />
      <Text
        x={width + 8}
        y={5}
        text={`${Math.round(width)} × ${Math.round(height)}`}
        fontSize={10}
        fill="#ffffff"
        fontFamily="monospace"
      />
    </Group>
  );
});

SelectionBox.displayName = 'SelectionBox';

// Simple Text component wrapper
const Text = ({ text, ...props }) => (
  <rect {...props} />
);

// Simple Line component wrapper  
const Line = ({ points, ...props }) => (
  <rect {...props} />
);

export default SelectionBox;
