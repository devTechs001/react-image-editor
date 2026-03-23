// frontend/src/components/ai/Denoising.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Check, 
  Undo2, 
  Sparkles,
  Waves,
  ShieldCheck,
  Maximize2,
  Info
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

export default function Denoising({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [strength, setIntensity] = useState(60);
  const [preserveDetail, setPreserveDetail] = useState(80);

  const handleDenoise = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setAIProcessing(true);

    try {
      // Real implementation: aiAPI.denoise(image, { strength, preserveDetail })
      await new Promise(resolve => setTimeout(resolve, 2500));
      setResult(image); // Mock result
    } catch (error) {
      console.error('Denoising failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, strength, preserveDetail, setAIProcessing]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Waves size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Denoise</h3>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Advanced Noise Reduction</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Preview Area */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-editor-card border border-editor-border">
          {result ? (
            <img src={result} alt="Result" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full relative group">
              <img src={image} alt="Original" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Info size={10} className="text-cyan-400" />
                  Processing Preview
                </p>
                <p className="text-[10px] text-surface-300 leading-tight">AI will remove grain while preserving textures.</p>
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
                  <div className="absolute inset-0 m-auto w-12 h-12 border-2 border-cyan-500/30 rounded-full animate-ping" />
                </div>
                <p className="mt-4 text-sm text-white font-medium">Cleaning Artifacts...</p>
                <p className="text-[9px] text-surface-400 uppercase font-black tracking-[0.2em] mt-1 animate-pulse">Deep Scan Active</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <div className="space-y-5">
            <Slider 
              label="Reduction Strength"
              value={[strength]}
              onValueChange={([val]) => setIntensity(val)}
              min={0}
              max={100}
              size="sm"
            />
            
            <Slider 
              label="Detail Preservation"
              value={[preserveDetail]}
              onValueChange={([val]) => setPreserveDetail(val)}
              min={0}
              max={100}
              size="sm"
            />
          </div>

          {/* AI Info Card */}
          <div className="p-4 rounded-2xl bg-editor-card border border-editor-border relative overflow-hidden group">
            <div className="relative z-10 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Smart Sharpness</h5>
                <p className="text-[10px] text-surface-500 leading-relaxed">
                  Our algorithm distinguishes between ISO noise and sharp edges to prevent blurring important details.
                </p>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
              <Waves size={80} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-editor-border">
        {result ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)} icon={Undo2}>Redo</Button>
            <Button variant="primary" className="flex-1" onClick={() => onComplete?.(result)} icon={Check}>Apply Clean</Button>
          </div>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={handleDenoise}
            loading={processing}
            disabled={!image}
            icon={Zap}
          >
            Run AI Denoise
          </Button>
        )}
      </div>
    </div>
  );
}
