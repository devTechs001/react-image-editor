// frontend/src/components/layout/SplitPane.jsx
import React, { useState } from 'react';
import ResizablePanel from './ResizablePanel';
import { cn } from '@/utils/helpers/cn';

export default function SplitPane({
  left,
  right,
  direction = 'horizontal',
  initialSplit = 0.5,
  minSize = 100,
  className
}) {
  const [split, setSplit] = useState(initialSplit);

  return (
    <div className={cn('flex w-full h-full overflow-hidden', direction === 'vertical' && 'flex-col', className)}>
      <ResizablePanel
        direction={direction}
        initialSize={window.innerWidth * split}
        minSize={minSize}
        maxSize={window.innerWidth - minSize}
        className="flex-shrink-0"
      >
        {left}
      </ResizablePanel>
      <div className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
