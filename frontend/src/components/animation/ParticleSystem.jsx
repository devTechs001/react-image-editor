// frontend/src/components/animation/ParticleSystem.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Settings2, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import Select from '@/components/ui/Select';

const particleShapes = ['circle', 'square', 'triangle', 'star'];
const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'lighten', 'darken'];

export default function ParticleSystem({ canvasRef, onClose }) {
  const canvas = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [particles, setParticles] = useState([]);
  const [config, setConfig] = useState({
    count: 100,
    size: 5,
    sizeVariation: 50,
    speed: 1,
    speedVariation: 50,
    direction: 0,
    spread: 360,
    shape: 'circle',
    color: '#6366f1',
    colorVariation: 30,
    opacity: 0.8,
    life: 100,
    gravity: 0,
    blendMode: 'normal',
    emitRate: 10,
    emitShape: 'point'
  });

  // Particle class
  class Particle {
    constructor(x, y, config) {
      this.x = x;
      this.y = y;
      this.config = config;
      
      const angle = (config.direction + (Math.random() - 0.5) * config.spread) * (Math.PI / 180);
      const speed = config.speed * (1 + (Math.random() - 0.5) * config.speedVariation / 100);
      
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = config.size * (1 + (Math.random() - 0.5) * config.sizeVariation / 100);
      this.life = config.life;
      this.maxLife = config.life;
      this.opacity = config.opacity;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      
      // Color variation
      const baseColor = hexToRgb(config.color);
      const variation = config.colorVariation / 100;
      this.color = {
        r: Math.min(255, Math.max(0, baseColor.r * (1 + (Math.random() - 0.5) * variation))),
        g: Math.min(255, Math.max(0, baseColor.g * (1 + (Math.random() - 0.5) * variation))),
        b: Math.min(255, Math.max(0, baseColor.b * (1 + (Math.random() - 0.5) * variation)))
      };
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += config.gravity * 0.01;
      this.rotation += this.rotationSpeed;
      this.life--;
      this.opacity = (this.life / this.maxLife) * this.config.opacity;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.globalCompositeOperation = this.config.blendMode;
      ctx.fillStyle = `rgb(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)})`;

      switch (this.config.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'star':
          drawStar(ctx, 0, 0, 5, this.size / 2, this.size / 4);
          break;
      }

      ctx.restore();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  // Animation loop
  useEffect(() => {
    if (!canvas.current || !isPlaying) return;

    const ctx = canvas.current.getContext('2d');
    let animationId;
    let lastEmit = 0;

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

      // Emit new particles
      if (timestamp - lastEmit > 1000 / config.emitRate) {
        for (let i = 0; i < Math.ceil(config.emitRate / 10); i++) {
          const particle = new Particle(
            canvas.current.width / 2,
            canvas.current.height / 2,
            config
          );
          setParticles(prev => [...prev, particle]);
        }
        lastEmit = timestamp;
      }

      // Update and draw particles
      setParticles(prev => {
        const updated = prev.filter(p => !p.isDead());
        updated.forEach(p => {
          p.update();
          p.draw(ctx);
        });
        return updated;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, config]);

  const clearParticles = () => {
    setParticles([]);
    if (canvas.current) {
      const ctx = canvas.current.getContext('2d');
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  const resetConfig = () => {
    setConfig({
      count: 100,
      size: 5,
      sizeVariation: 50,
      speed: 1,
      speedVariation: 50,
      direction: 0,
      spread: 360,
      shape: 'circle',
      color: '#6366f1',
      colorVariation: 30,
      opacity: 0.8,
      life: 100,
      gravity: 0,
      blendMode: 'normal',
      emitRate: 10,
      emitShape: 'point'
    });
    clearParticles();
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Particle System</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearParticles}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={resetConfig}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 min-h-[200px] bg-editor-bg relative">
        <canvas
          ref={canvas}
          width={400}
          height={300}
          className="w-full h-full"
        />
        <div className="absolute bottom-2 left-2 text-xs text-surface-500">
          {particles.length} particles
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-dark">
        {/* Particle Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-surface-400">Particle Count</label>
            <span className="text-xs text-surface-500 font-mono">{config.count}</span>
          </div>
          <Slider
            value={config.count}
            onChange={(v) => setConfig(s => ({ ...s, count: v }))}
            min={10}
            max={500}
            step={10}
          />
        </div>

        {/* Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-surface-400">Size</label>
            <span className="text-xs text-surface-500 font-mono">{config.size}px</span>
          </div>
          <Slider
            value={config.size}
            onChange={(v) => setConfig(s => ({ ...s, size: v }))}
            min={1}
            max={50}
            step={1}
          />
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-surface-400">Speed</label>
            <span className="text-xs text-surface-500 font-mono">{config.speed}</span>
          </div>
          <Slider
            value={config.speed}
            onChange={(v) => setConfig(s => ({ ...s, speed: v }))}
            min={0}
            max={10}
            step={0.1}
          />
        </div>

        {/* Spread */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-surface-400">Spread</label>
            <span className="text-xs text-surface-500 font-mono">{config.spread}°</span>
          </div>
          <Slider
            value={config.spread}
            onChange={(v) => setConfig(s => ({ ...s, spread: v }))}
            min={0}
            max={360}
            step={15}
          />
        </div>

        {/* Shape */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">Shape</label>
          <div className="grid grid-cols-4 gap-2">
            {particleShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => setConfig(s => ({ ...s, shape }))}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium capitalize transition-colors',
                  config.shape === shape
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                )}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.color}
              onChange={(e) => setConfig(s => ({ ...s, color: e.target.value }))}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.color}
              onChange={(e) => setConfig(s => ({ ...s, color: e.target.value }))}
              className="flex-1 input text-xs font-mono"
            />
          </div>
        </div>

        {/* Blend Mode */}
        <div className="space-y-2">
          <label className="text-xs text-surface-400">Blend Mode</label>
          <Select
            value={config.blendMode}
            onChange={(v) => setConfig(s => ({ ...s, blendMode: v }))}
            options={blendModes.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
          />
        </div>

        {/* Gravity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-surface-400">Gravity</label>
            <span className="text-xs text-surface-500 font-mono">{config.gravity}</span>
          </div>
          <Slider
            value={config.gravity}
            onChange={(v) => setConfig(s => ({ ...s, gravity: v }))}
            min={-10}
            max={10}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
