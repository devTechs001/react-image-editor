// frontend/src/components/ai/BackgroundRemoval.jsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Download, 
  RefreshCw, 
  Image, 
  Layers, 
  Check, 
  Wand2,
  Sparkles 
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';
import { removeBackground } from '@/services/ai/backgroundRemoval';

const backgroundOptions = [
  { id: 'transparent', label: 'Transparent', preview: 'bg-[url("/assets/checker.svg")]' },
  { id: 'white', label: 'White', preview: 'bg-white' },
  { id: 'black', label: 'Black', preview: 'bg-black' },
  { id: 'blur', label: 'Blur', preview: 'bg-surface-600' },
  { id: 'custom', label: 'Custom', preview: 'bg-gradient-to-br from-primary-500 to-secondary-500' }
];

export default function BackgroundRemoval({ image, onComplete }) {
  const { setAIProcessing, setAIResults } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedBg, setSelectedBg] = useState('transparent');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const comparisonRef = useRef(null);

  const handleRemoveBackground = useCallback(async () => {
    if (!image) return;

    setProcessing(true);
    setAIProcessing(true);

    try {
      const removedBgImage = await removeBackground(image);
      setResult(removedBgImage);
      setAIResults({ backgroundRemoval: removedBgImage });
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, setAIProcessing, setAIResults]);

  const handleApply = useCallback(() => {
    if (result) {
      onComplete?.(result, selectedBg);
    }
  }, [result, selectedBg, onComplete]);

  const handleComparisonMove = useCallback((e) => {
    if (!comparisonRef.current) return;
    const rect = comparisonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setComparisonPosition(percentage);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Remove Background</h3>
            <p className="text-xs text-surface-500">AI-powered background removal</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview Area */}
        <div
          ref={comparisonRef}
          className={cn(
            'relative aspect-video rounded-xl overflow-hidden mb-4',
            'bg-[url("/assets/checker.svg")] bg-repeat bg-[length:20px_20px]'
          )}
          onMouseMove={showComparison ? handleComparisonMove : undefined}
        >
          {/* Original Image */}
          {image && (
            <img
              src={image}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
              style={showComparison ? { clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` } : {}}
            />
          )}

          {/* Result Image */}
          {result && (
            <img
              src={result}
              alt="Result"
              className="absolute inset-0 w-full h-full object-contain"
              style={showComparison ? { clipPath: `inset(0 0 0 ${comparisonPosition}%)` } : {}}
            />
          )}

          {/* Comparison Slider */}
          {showComparison && result && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${comparisonPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <div className="flex items-center gap-0.5">
                  <div className="w-0.5 h-3 bg-surface-400" />
                  <div className="w-0.5 h-3 bg-surface-400" />
                </div>
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <LoadingSpinner size="lg" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary-400 animate-pulse" />
                </div>
                <p className="mt-4 text-sm text-white font-medium">Removing background...</p>
                <p className="text-xs text-surface-400">This may take a few seconds</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Labels */}
          {showComparison && result && (
            <>
              <span className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
                Before
              </span>
              <span className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
                After
              </span>
            </>
          )}
        </div>

        {/* Compare Toggle */}
        {result && (
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                showComparison
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'bg-editor-card text-surface-400 hover:text-white'
              )}
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Compare</span>
            </button>
          </div>
        )}

        {/* Background Options */}
        {result && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-surface-500 mb-3">Background</h4>
            <div className="grid grid-cols-5 gap-2">
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg.id)}
                  className={cn(
                    'aspect-square rounded-lg overflow-hidden transition-all',
                    'border-2',
                    selectedBg === bg.id
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-editor-border hover:border-surface-500'
                  )}
                >
                  <div className={cn('w-full h-full', bg.preview)} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quality Info */}
        <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
          <div className="flex items-start gap-3">
            <Wand2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">AI-Powered Removal</p>
              <p className="text-xs text-surface-400 mt-1">
                Our AI model automatically detects subjects and creates precise cutouts with smooth edges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-editor-border">
        {!result ? (
          <Button
            variant="primary"
            fullWidth
            onClick={handleRemoveBackground}
            loading={processing}
            disabled={!image}
            icon={Scissors}
          >
            Remove Background
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleRemoveBackground}
              icon={RefreshCw}
            >
              Redo
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleApply}
              icon={Check}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}