// frontend/src/components/ui/Carousel.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from './Button';

export default function Carousel({
  children,
  items = [],
  renderItem,
  autoplay = false,
  autoplayInterval = 5000,
  showArrows = true,
  showDots = true,
  loop = true,
  className,
  onChange
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const itemCount = items.length || React.Children.count(children);

  const goToSlide = useCallback((index) => {
    let newIndex = index;
    
    if (newIndex < 0) {
      newIndex = loop ? itemCount - 1 : 0;
    } else if (newIndex >= itemCount) {
      newIndex = loop ? 0 : itemCount - 1;
    }

    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
    onChange?.(newIndex);
  }, [currentIndex, itemCount, loop, onChange]);

  const next = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const previous = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay
  useEffect(() => {
    if (autoplay && !isHovered) {
      timerRef.current = setInterval(next, autoplayInterval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, autoplayInterval, isHovered, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') previous();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, previous]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  const renderContent = () => {
    if (items.length > 0 && renderItem) {
      return renderItem(items[currentIndex], currentIndex);
    }

    const childrenArray = React.Children.toArray(children);
    return childrenArray[currentIndex];
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2',
              'bg-black/20 hover:bg-black/40 backdrop-blur-sm',
              !loop && currentIndex === 0 && 'opacity-30 cursor-not-allowed'
            )}
            onClick={previous}
            disabled={!loop && currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2',
              'bg-black/20 hover:bg-black/40 backdrop-blur-sm',
              !loop && currentIndex === itemCount - 1 && 'opacity-30 cursor-not-allowed'
            )}
            onClick={next}
            disabled={!loop && currentIndex === itemCount - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {Array.from({ length: itemCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'transition-all duration-300 rounded-full',
                index === currentIndex
                  ? 'w-8 h-2 bg-primary-500'
                  : 'w-2 h-2 bg-surface-500 hover:bg-surface-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (for autoplay) */}
      {autoplay && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-700">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoplayInterval / 1000, ease: 'linear' }}
            className="h-full bg-primary-500"
          />
        </div>
      )}
    </div>
  );
}

// Image Carousel Component
export function ImageCarousel({ images, className, ...props }) {
  return (
    <Carousel
      items={images}
      renderItem={(image) => (
        <img
          src={image.src || image}
          alt={image.alt || ''}
          className="w-full h-full object-cover"
        />
      )}
      className={className}
      {...props}
    />
  );
}

// Card Carousel Component
export function CardCarousel({ cards, renderItem, className, ...props }) {
  return (
    <Carousel
      items={cards}
      renderItem={renderItem}
      className={cn('p-4', className)}
      {...props}
    />
  );
}

// Thumbnail Carousel Component
export function ThumbnailCarousel({
  images,
  selectedIndex,
  onChange,
  thumbnailCount = 5
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const thumbnail = scrollRef.current.children[selectedIndex];
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={cn(
              'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
              index === selectedIndex
                ? 'border-primary-500 scale-105'
                : 'border-transparent opacity-50 hover:opacity-100'
            )}
          >
            <img
              src={image.src || image}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
