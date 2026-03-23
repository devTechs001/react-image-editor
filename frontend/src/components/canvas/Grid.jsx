// frontend/src/components/canvas/Grid.jsx
import React, { memo } from 'react';
import { Line } from 'react-konva';

const Grid = memo(({ 
  width, 
  height, 
  gridSize = 20, 
  color = '#374151', 
  opacity = 0.5,
  strokeWidth = 0.5,
  subGridSize = 5,
  subGridColor = '#1f2937',
  subGridOpacity = 0.3
}) => {
  const lines = [];

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    );
  }

  // Sub-grid lines
  for (let x = 0; x <= width; x += subGridSize) {
    if (x % gridSize !== 0) {
      lines.push(
        <Line
          key={`sv-${x}`}
          points={[x, 0, x, height]}
          stroke={subGridColor}
          strokeWidth={0.25}
          opacity={subGridOpacity}
        />
      );
    }
  }

  for (let y = 0; y <= height; y += subGridSize) {
    if (y % gridSize !== 0) {
      lines.push(
        <Line
          key={`sh-${y}`}
          points={[0, y, width, y]}
          stroke={subGridColor}
          strokeWidth={0.25}
          opacity={subGridOpacity}
        />
      );
    }
  }

  return <>{lines}</>;
});

Grid.displayName = 'Grid';

export default Grid;
