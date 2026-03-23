// frontend/src/components/ai/BackgroundReplacement.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Check, 
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

const presetBackgrounds = [
  { id: 'office', name: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400' },
  { id: 'beach', name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400' },
  { id: 'forest', name: 'Mist Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400' },
  { id: 'city', name: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=400' },
  { id: 'studio', name: 'Pro Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400' }
];

export default function BackgroundReplacement({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [result, setResult] = useState(null);

  const handleReplace = useCallback(async () => {
    if (!image || !selectedBg) return;

    setProcessing(true);
    setAIProcessing(true);

    try {
      // Simulation of AI background replacement
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // In reality, we'd send the image and the bg to the server
      setResult(image); // Mock result
    } catch (error) {
      console.error('Background replacement failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, selectedBg, setAIProcessing]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Replace Background</h3>
            <p className="text-xs text-surface-500">Change background using AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-editor-card border border-editor-border mb-6">
          {result ? (
            <img src={result} alt="Result" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full relative">
              <img src={image} alt="Original" className="w-full h-full object-contain" />
              {selectedBg && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="text-white text-sm font-medium">New BG: {selectedBg.name}</p>
                </div>
              )}
            </div>
          )}
          
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-white font-medium">Replacing background...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BG Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wider">Presets</h4>
            <Button variant="ghost" size="xs" icon={Search}>Browse All</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-editor-border hover:border-primary-500/50 hover:bg-white/5 transition-all">
              <Plus className="w-6 h-6 text-surface-500 mb-2" />
              <span className="text-xs font-medium text-surface-400">Custom</span>
            </button>
            
            {presetBackgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg)}
                className={cn(
                  'relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group',
                  selectedBg?.id === bg.id 
                    ? 'border-primary-500 ring-2 ring-primary-500/30' 
                    : 'border-editor-border hover:border-surface-500'
                )}
              >
                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] font-medium text-white">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-editor-border">
        {result ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)} icon={RefreshCw}>Redo</Button>
            <Button variant="primary" className="flex-1" onClick={() => onComplete?.(result)} icon={Check}>Apply</Button>
          </div>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={handleReplace}
            loading={processing}
            disabled={!selectedBg || !image}
            icon={Sparkles}
          >
            Replace Background
          </Button>
        )}
      </div>
    </div>
  );
}
