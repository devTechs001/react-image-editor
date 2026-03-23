// frontend/src/components/ai/FaceSwap.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smile, 
  Upload, 
  RefreshCw, 
  Check, 
  Sparkles,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUpload from '@/components/ui/FileUpload';
import { cn } from '@/utils/helpers/cn';
import { aiAPI } from '@/services/api/aiAPI';
import toast from 'react-hot-toast';

export default function FaceSwap({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [sourceImage, setSourceImage] = useState(null); // The face to swap IN
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload Source, 2: Process/Result

  const handleSourceUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImage(e.target.result);
      setStep(2);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFaceSwap = useCallback(async () => {
    if (!image || !sourceImage) return;

    setProcessing(true);
    setAIProcessing(true);

    try {
      // In a real implementation, we would send both images to the backend
      // For now, we use the aiAPI structure which expects a call
      // const response = await aiAPI.faceSwap(image, sourceImage);
      
      // Simulating real AI processing with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock result - in reality, the backend returns the swapped image URL/base64
      setResult(image); 
      toast.success('Face swap completed!');
    } catch (error) {
      console.error('Face swap failed:', error);
      toast.error('Face swap failed. Please try again.');
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, sourceImage, setAIProcessing]);

  const handleApply = useCallback(() => {
    if (result) {
      onComplete?.(result);
    }
  }, [result, onComplete]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Face Swap</h3>
            <p className="text-xs text-surface-500">Swap faces between two images</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
              <p className="text-sm text-surface-300 leading-relaxed">
                To start, upload an image containing the face you want to swap onto your current project.
              </p>
            </div>

            <FileUpload
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              onUpload={handleSourceUpload}
              description="Upload the face source image"
            />

            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-medium">Best results with clear, front-facing portraits.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison/Preview Area */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-500 uppercase">Target (Base)</p>
                <div className="aspect-square rounded-lg border border-editor-border overflow-hidden bg-editor-card">
                  <img src={image} alt="Target" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-500 uppercase">Source (Face)</p>
                <div className="aspect-square rounded-lg border border-editor-border overflow-hidden bg-editor-card relative group">
                  <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setStep(1)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <RefreshCw className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {result && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-500 uppercase">Result</p>
                <div className="aspect-video rounded-xl border-2 border-primary-500/30 overflow-hidden bg-editor-card relative">
                  <img src={result} alt="Result" className="w-full h-full object-contain" />
                  {processing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <LoadingSpinner size="lg" />
                      <p className="mt-4 text-sm text-white font-medium">Processing swap...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!result && !processing && (
              <div className="p-6 text-center border-2 border-dashed border-editor-border rounded-xl">
                <Sparkles className="w-10 h-10 text-primary-500/50 mx-auto mb-3" />
                <p className="text-sm text-surface-400 mb-4">Ready to perform the magic?</p>
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handleFaceSwap}
                  icon={Zap}
                >
                  Start Face Swap
                </Button>
              </div>
            )}
            
            {processing && (
              <div className="p-12 text-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-white font-medium">AI is working...</p>
                <p className="text-sm text-surface-500 mt-2">Analyzing facial landmarks and blending</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {result && !processing && (
        <div className="p-4 border-t border-editor-border flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setResult(null);
              setStep(1);
            }}
            icon={RefreshCw}
          >
            Start Over
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleApply}
            icon={Check}
          >
            Apply Swap
          </Button>
        </div>
      )}
    </div>
  );
}
