// frontend/src/components/layout/ResponsiveGrid.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function ResponsiveGrid({
  children,
  minWidth = 250,
  gap = 24,
  className,
  animate = true
}) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {React.Children.map(children, (child, index) => (
        animate ? (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            {child}
          </motion.div>
        ) : (
          <div key={index}>{child}</div>
        )
      ))}
    </div>
  );
}
