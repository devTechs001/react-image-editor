// frontend/src/components/ui/Tooltip.jsx
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/helpers/cn';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({ children, ...props }) => (
  <TooltipPrimitive.Root delayDuration={200} {...props}>
    {children}
  </TooltipPrimitive.Root>
);

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({
  className,
  sideOffset = 5,
  side = 'top',
  ...props
}, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      side={side}
      className={cn(
        'z-50 overflow-hidden rounded-lg px-3 py-2',
        'bg-editor-card border border-editor-border shadow-elevated',
        'text-sm text-surface-200',
        'animate-fade-in',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

// Convenience wrapper
const TooltipWrapper = ({ children, content, side = 'top', ...props }) => (
  <Tooltip {...props}>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent side={side}>
      {content}
    </TooltipContent>
  </Tooltip>
);

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipWrapper
};

export default Tooltip;