// frontend/src/components/ui/Confetti.jsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';
import Button from './Button';

// Particle class for confetti physics
class Particle {
  constructor(x, y, colors) {
    this.x = x;
    this.y = y;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.random() * 10 + 5;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * -10 - 5;
    this.gravity = 0.5;
    this.drag = 0.96;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.opacity = 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }

  update() {
    this.speedX *= this.drag;
    this.speedY *= this.drag;
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }

  isDead() {
    return this.opacity <= 0;
  }
}

export default function Confetti({
  active = false,
  particleCount = 150,
  colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
  origin = { x: 0.5, y: 0 },
  spread = 360,
  startVelocity = 45,
  gravity = 1,
  drift = 0,
  duration = 3000,
  onComplete,
  className
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const createParticles = useCallback((width, height) => {
    const particles = [];
    const startX = width * origin.x;
    const startY = height * origin.y;

    for (let i = 0; i < particleCount; i++) {
      const angle = ((spread / 2) * (Math.random() * 2 - 1) + (origin.x < 0.5 ? 0 : 180)) * (Math.PI / 180);
      const velocity = startVelocity * (0.5 + Math.random() * 0.5);
      
      const particle = new Particle(startX, startY, colors);
      particle.speedX = Math.cos(angle) * velocity + drift;
      particle.speedY = Math.sin(angle) * velocity - startVelocity;
      particle.gravity = gravity;
      
      particles.push(particle);
    }

    return particles;
  }, [particleCount, origin, spread, startVelocity, gravity, drift, colors]);

  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return !particle.isDead();
    });

    // Check if animation is complete
    if (particlesRef.current.length === 0 && startTimeRef.current) {
      if (timestamp - startTimeRef.current > duration) {
        animationRef.current = null;
        onComplete?.();
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, onComplete]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Create initial particles
    startTimeRef.current = performance.now();
    particlesRef.current = createParticles(canvas.width, canvas.height);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, createParticles, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-none z-50', className)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Confetti Button Component
export function ConfettiButton({
  children,
  onClick,
  particleCount = 100,
  colors,
  className,
  ...props
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = (e) => {
    setShowConfetti(true);
    onClick?.(e);

    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      <Button onClick={handleClick} className={className} {...props}>
        {children}
      </Button>
      <Confetti
        active={showConfetti}
        particleCount={particleCount}
        colors={colors}
        origin={{ x: 0.5, y: 0.8 }}
      />
    </>
  );
}

// Success Confetti Component
export function SuccessConfetti({ show, onComplete }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <Confetti
            active={show}
            particleCount={200}
            colors={['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b']}
            duration={4000}
            onComplete={onComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Celebration Confetti Component
export function CelebrationConfetti({ show, message }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <Confetti
            active={show}
            particleCount={300}
            colors={[
              '#6366f1', '#8b5cf6', '#a78bfa',
              '#06b6d4', '#22d3ee', '#67e8f9',
              '#ec4899', '#f472b6', '#f9a8d4'
            ]}
            duration={5000}
          />
          {message && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {message}
              </h2>
              <p className="text-lg text-white/80 drop-shadow">
                🎉 Congratulations! 🎉
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for triggering confetti
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback((options = {}) => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), options.duration || 3000);
  }, []);

  return {
    isActive,
    trigger,
    ConfettiComponent: () => (
      <Confetti active={isActive} {...options} />
    )
  };
}
