// frontend/src/components/ai/Colorization.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaintBucket, 
  RefreshCw, 
  Check, 
  Sparkles,
  Layers,
  Palette,
  Undo2,
  Settings2
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

export default function Colorization({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [vibrance, setVibrance] = useState(50);
  const [artisticMode, setArtisticMode] = useState(false);

  const handleColorize = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setAIProcessing(true);

    try {
      // Real implementation would call aiAPI.colorize(image, { vibrance, artisticMode })
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult(image); // Mock result
    } catch (error) {
      console.error('Colorization failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, vibrance, artisticMode, setAIProcessing]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-3 sm:p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <PaintBucket size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">AI Colorization</h3>
            <p className="text-[9px] sm:text-[10px] text-surface-500 font-medium uppercase tracking-wider">B&W Photo Restoration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-dark space-y-4 sm:space-y-6">
        {/* Preview Container */}
        <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-editor-card border border-editor-border shadow-inner">
          {result ? (
            <img src={result} alt="Result" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full relative group">
              <img src={image} alt="Original" className="w-full h-full object-contain grayscale" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                  Previewing Grayscale
                </span>
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <LoadingSpinner size="lg" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white font-medium">Restoring Colors...</p>
                <p className="text-[9px] sm:text-[10px] text-surface-400 uppercase font-bold tracking-tighter mt-1">Analyzing depth & lighting</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest flex items-center gap-1.5">
                <Palette size={8} />
                Color Settings
              </span>
              <button 
                onClick={() => setArtisticMode(!artisticMode)}
                className={cn(
                  "px-1.5 sm:px-2 py-1 rounded text-[8px] sm:text-[9px] font-bold uppercase transition-all border",
                  artisticMode ? "bg-primary-500 text-white border-primary-400 shadow-glow" : "bg-surface-800 text-surface-500 border-surface-700"
                )}
              >
                Artistic Mode
              </button>
            </div>
            
            <Slider 
              label="Color Vibrance"
              value={[vibrance]}
              onValueChange={([val]) => setVibrance(val)}
              min={0}
              max={100}
              size="sm"
            />
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary-500/5 border border-primary-500/10 space-y-2">
            <div className="flex items-center gap-2 text-primary-400">
              <Settings2 size={10} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">AI Model: Neural Palette v2</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-surface-500 leading-relaxed">
              Trained on 50M+ professional photographs to accurately predict realistic skin tones and environmental colors.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 border-t border-editor-border bg-black/20">
        {result ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)} icon={Undo2}><span className="text-xs sm:text-sm">Reset</span></Button>
            <Button variant="primary" className="flex-1" onClick={() => onComplete?.(result)} icon={Check}><span className="text-xs sm:text-sm">Apply Color</span></Button>
          </div>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={handleColorize}
            loading={processing}
            disabled={!image}
            icon={PaintBucket}
          >
            <span className="text-xs sm:text-sm">Colorize Photo</span>
          </Button>
        )}
      </div>
    </div>
  );
}
