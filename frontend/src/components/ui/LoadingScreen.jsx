// frontend/src/components/ui/LoadingScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image, Video, Music, Palette, Wand2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const loadingIcons = [
  { Icon: Image, color: 'text-blue-500', delay: 0 },
  { Icon: Video, color: 'text-purple-500', delay: 0.1 },
  { Icon: Music, color: 'text-pink-500', delay: 0.2 },
  { Icon: Palette, color: 'text-amber-500', delay: 0.3 },
  { Icon: Wand2, color: 'text-emerald-500', delay: 0.4 }
];

export default function LoadingScreen({ 
  message = 'Loading...', 
  showIcons = true,
  variant = 'default'
}) {
  const variants = {
    default: 'bg-surface-900',
    minimal: 'bg-transparent',
    overlay: 'bg-black/80 backdrop-blur-sm'
  };

  return (
    <div className={cn(
      'fixed inset-0 flex flex-col items-center justify-center',
      variants[variant]
    )}>
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 border-2 border-transparent border-t-primary-500 border-r-secondary-500 rounded-full"
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-primary-400" />
          </motion.div>
        </div>

        {/* Orbiting icons */}
        {showIcons && (
          <div className="absolute inset-0 w-32 h-32 -left-4 -top-4">
            {loadingIcons.map(({ Icon, color, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay, duration: 0.3 }}
                className={cn(
                  'absolute w-8 h-8 flex items-center justify-center',
                  color
                )}
                style={{
                  left: `${50 + 40 * Math.cos((index / loadingIcons.length) * 2 * Math.PI)}%`,
                  top: `${50 + 40 * Math.sin((index / loadingIcons.length) * 2 * Math.PI)}%`
                }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-xl font-semibold text-white mb-2">
          {message}
        </h2>
        
        {/* Loading dots */}
        <div className="flex items-center gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-8 w-48 h-1 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-sm text-surface-400 text-center max-w-xs"
      >
        <TipCarousel />
      </motion.div>
    </div>
  );
}

function TipCarousel() {
  const tips = [
    'Press Ctrl+K for quick commands',
    'Use Ctrl+Z to undo, Ctrl+Y to redo',
    'Try AI Enhance for instant improvements',
    'Double-click layers to rename them',
    'Use Space+Drag to pan the canvas'
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      💡 {tips[currentIndex]}
    </motion.div>
  );
}
