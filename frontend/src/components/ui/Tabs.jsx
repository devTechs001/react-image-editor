// frontend/src/components/ui/Tabs.jsx
import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn('w-full', className)}
    {...props}
  />
));
Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-surface-800/50 rounded-xl p-1',
    pills: 'gap-2',
    underline: 'border-b border-editor-border',
    segment: 'bg-editor-surface rounded-xl p-1'
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex items-center justify-start',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: cn(
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      'text-surface-400 hover:text-surface-200',
      'data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
    ),
    pills: cn(
      'px-4 py-2 text-sm font-medium rounded-full transition-all',
      'text-surface-400 hover:text-white hover:bg-white/5',
      'data-[state=active]:bg-primary-500 data-[state=active]:text-white',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
    ),
    underline: cn(
      'px-4 py-3 text-sm font-medium border-b-2 border-transparent transition-all',
      'text-surface-400 hover:text-surface-200',
      'data-[state=active]:border-primary-500 data-[state=active]:text-primary-300',
      'focus-visible:outline-none'
    ),
    segment: cn(
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      'text-surface-400 hover:text-surface-200',
      'data-[state=active]:bg-editor-card data-[state=active]:text-white data-[state=active]:shadow-lg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
    )
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none',
      'data-[state=inactive]:hidden',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export default Tabs;