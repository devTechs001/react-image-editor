// frontend/src/components/ai/StyleTransfer.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Zap, 
  Check, 
  Undo2, 
  Sparkles,
  Search,
  Plus,
  Flame,
  Info,
  Maximize2
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

const artStyles = [
  { id: 'vango', name: 'Van Gogh', artist: 'Post-Impressionism', url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=200' },
  { id: 'sketch', name: 'Pencil Sketch', artist: 'Traditional', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=200' },
  { id: 'cyber', name: 'Cyberpunk', artist: 'Digital Sci-Fi', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200' },
  { id: 'pop', name: 'Pop Art', artist: 'Andy Warhol Style', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=200' },
  { id: 'renaissance', name: 'Renaissance', artist: 'Classic Oil', url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=200' },
  { id: 'anime', name: 'Makoto Shinkai', artist: 'Modern Anime', url: 'https://images.unsplash.com/photo-1578632738981-4320f6618d17?auto=format&fit=crop&q=80&w=200' }
];

export default function StyleTransfer({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState(null);
  const [result, setResult] = useState(null);
  const [intensity, setIntensity] = useState(70);

  const handleTransfer = useCallback(async () => {
    if (!image || !selectedStyleId) return;
    setProcessing(true);
    setAIProcessing(true);

    try {
      // Real implementation: aiAPI.transferStyle(image, selectedStyleId, { intensity: intensity/100 })
      await new Promise(resolve => setTimeout(resolve, 4000));
      setResult(image); // Mock result
    } catch (error) {
      console.error('Style transfer failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, selectedStyleId, intensity, setAIProcessing]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Artistic Style Transfer</h3>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Neural Style Morphing</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Preview Container */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-editor-card border border-editor-border shadow-inner">
          {result ? (
            <img src={result} alt="Result" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full relative group">
              <img src={image} alt="Original" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Original Base</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center z-30"
              >
                <div className="relative">
                  <LoadingSpinner size="xl" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-fuchsia-400 animate-pulse" />
                </div>
                <p className="mt-6 text-sm text-white font-bold tracking-widest uppercase">Applying Neural Style...</p>
                <p className="text-[10px] text-surface-400 uppercase font-black tracking-tighter mt-2">Merging texture & content tensors</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flame size={10} className="text-orange-400" />
                Select Style
              </span>
              <button className="text-[10px] text-primary-400 font-bold uppercase hover:underline">Browse All</button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {artStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={cn(
                    "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedStyleId === style.id ? "border-primary-500 ring-4 ring-primary-500/20" : "border-transparent hover:border-white/20"
                  )}
                >
                  <img src={style.url} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={16} className="text-white" />
                  </div>
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm text-[8px] font-black text-white uppercase truncate text-center transition-all",
                    selectedStyleId === style.id ? "bg-primary-500" : ""
                  )}>
                    {style.name}
                  </div>
                </button>
              ))}
              <button className="aspect-square rounded-xl border-2 border-dashed border-editor-border hover:border-primary-500/50 hover:bg-white/5 flex flex-col items-center justify-center gap-1 transition-all group">
                <Plus size={16} className="text-surface-600 group-hover:text-primary-400 transition-colors" />
                <span className="text-[8px] font-black text-surface-600 group-hover:text-surface-400 uppercase tracking-widest">Custom</span>
              </button>
            </div>
          </div>

          <Slider 
            label="Style Intensity"
            value={[intensity]}
            onValueChange={([val]) => setIntensity(val)}
            min={0}
            max={100}
            size="sm"
          />

          <div className="p-4 rounded-2xl bg-editor-card border border-editor-border flex items-start gap-3 relative overflow-hidden group">
            <Info size={14} className="text-fuchsia-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-surface-500 leading-relaxed relative z-10">
              Intensity controls how much of the original photo's lighting and colors are preserved. Lower values keep more content, higher values embrace more artistic texture.
            </p>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fuchsia-500/5 blur-2xl rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-editor-border bg-black/20">
        {result ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)} icon={Undo2}>Redo</Button>
            <Button variant="primary" className="flex-1" onClick={() => onComplete?.(result)} icon={Check}>Apply Style</Button>
          </div>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={handleTransfer}
            loading={processing}
            disabled={!image || !selectedStyleId}
            icon={Zap}
          >
            Apply Art Style
          </Button>
        )}
      </div>
    </div>
  );
}
