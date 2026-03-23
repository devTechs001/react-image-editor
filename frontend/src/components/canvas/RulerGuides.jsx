// frontend/src/components/canvas/RulerGuides.jsx
import React, { memo } from 'react';
import { Line, Text, Rect } from 'react-konva';

const RulerGuides = memo(({
  width,
  height,
  horizontalGuides = [],
  verticalGuides = [],
  showRulers = true,
  rulerSize = 20,
  onGuideMove,
  onGuideRemove
}) => {
  const tickSpacing = 50;
  const bigTickSpacing = 100;

  // Render horizontal ruler
  const renderHorizontalRuler = () => {
    if (!showRulers) return null;

    const ticks = [];
    for (let x = 0; x <= width; x += 10) {
      const isBigTick = x % bigTickSpacing === 0;
      const isMediumTick = x % tickSpacing === 0;
      const tickHeight = isBigTick ? 8 : isMediumTick ? 5 : 3;

      ticks.push(
        <Line
          key={`h-tick-${x}`}
          points={[x, rulerSize - tickHeight, x, rulerSize]}
          stroke="#6b7280"
          strokeWidth={isBigTick ? 1 : 0.5}
        />
      );

      if (isBigTick && x > 0) {
        ticks.push(
          <Text
            key={`h-label-${x}`}
            x={x + 2}
            y={2}
            text={Math.round(x)}
            fontSize={9}
            fill="#9ca3af"
          />
        );
      }
    }

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={width}
          height={rulerSize}
          fill="#1f2937"
        />
        {ticks}
      </Group>
    );
  };

  // Render vertical ruler
  const renderVerticalRuler = () => {
    if (!showRulers) return null;

    const ticks = [];
    for (let y = 0; y <= height; y += 10) {
      const isBigTick = y % bigTickSpacing === 0;
      const isMediumTick = y % tickSpacing === 0;
      const tickWidth = isBigTick ? 8 : isMediumTick ? 5 : 3;

      ticks.push(
        <Line
          key={`v-tick-${y}`}
          points={[rulerSize - tickWidth, y, rulerSize, y]}
          stroke="#6b7280"
          strokeWidth={isBigTick ? 1 : 0.5}
        />
      );

      if (isBigTick && y > 0) {
        ticks.push(
          <Text
            key={`v-label-${y}`}
            x={2}
            y={y + 2}
            text={Math.round(y)}
            fontSize={9}
            fill="#9ca3af"
            rotation={-90}
          />
        );
      }
    }

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={rulerSize}
          height={height}
          fill="#1f2937"
        />
        {ticks}
      </Group>
    );
  };

  // Render guides
  const renderGuides = () => {
    const guideElements = [];

    // Horizontal guides
    horizontalGuides.forEach((guide, index) => {
      guideElements.push(
        <Line
          key={`h-guide-${index}`}
          points={[rulerSize, guide.y, width, guide.y]}
          stroke="#ef4444"
          strokeWidth={1}
          dash={[5, 5]}
          draggable
          onDragMove={(e) => onGuideMove?.('horizontal', index, e.target.y())}
          onDblClick={() => onGuideRemove?.('horizontal', index)}
        />
      );
    });

    // Vertical guides
    verticalGuides.forEach((guide, index) => {
      guideElements.push(
        <Line
          key={`v-guide-${index}`}
          points={[guide.x, rulerSize, guide.x, height]}
          stroke="#ef4444"
          strokeWidth={1}
          dash={[5, 5]}
          draggable
          onDragMove={(e) => onGuideMove?.('vertical', index, e.target.x())}
          onDblClick={() => onGuideRemove?.('vertical', index)}
        />
      );
    });

    return guideElements;
  };

  return (
    <>
      {renderHorizontalRuler()}
      {renderVerticalRuler()}
      {renderGuides()}
    </>
  );
});

RulerGuides.displayName = 'RulerGuides';

// Simple Group wrapper since we're not importing from react-konva
const Group = ({ children }) => <>{children}</>;

export default RulerGuides;
