// frontend/src/components/ai/FaceDetection.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Search, 
  Check, 
  Sparkles,
  Scan,
  UserCheck,
  Smile,
  ShieldCheck,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

export default function FaceDetection({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [faces, setFaces] = useState([]);
  const [selectedFaceId, setSelectedFaceId] = useState(null);

  const handleDetect = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setAIProcessing(true);

    try {
      // Real implementation: aiAPI.detectFaces(image)
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Mock results
      const mockFaces = [
        { id: 1, label: 'Primary Face', confidence: 0.99, box: [35, 15, 25, 30], landmarks: 68 },
        { id: 2, label: 'Secondary Face', confidence: 0.92, box: [65, 25, 15, 20], landmarks: 68 }
      ];
      setFaces(mockFaces);
    } catch (error) {
      console.error('Face detection failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, setAIProcessing]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-3 sm:p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <Scan size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Biometric Analysis</h3>
            <p className="text-[9px] sm:text-[10px] text-surface-500 font-medium uppercase tracking-wider">AI Face Landmark Detection</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-dark space-y-4 sm:space-y-6">
        {/* Visualizer Area */}
        <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-editor-card border border-editor-border group">
          <img src={image} alt="Original" className="w-full h-full object-cover" />
          
          {/* Face Bounding Boxes */}
          {faces.map((face) => (
            <motion.div
              key={face.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedFaceId(face.id)}
              className={cn(
                "absolute border-2 transition-all cursor-pointer",
                selectedFaceId === face.id ? "border-rose-500 bg-rose-500/10 z-20" : "border-white/40 hover:border-white/80 z-10"
              )}
              style={{
                left: `${face.box[0]}%`,
                top: `${face.box[1]}%`,
                width: `${face.box[2]}%`,
                height: `${face.box[3]}%`
              }}
            >
              {/* Landmark points mock */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-1 opacity-40">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 bg-white rounded-full place-self-center" />
                ))}
              </div>
              
              <div className={cn(
                "absolute -top-5 sm:-top-6 left-0 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase whitespace-nowrap",
                selectedFaceId === face.id ? "bg-rose-500 text-white shadow-glow" : "bg-black/60 text-white/80"
              )}>
                {face.label}
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User size={24} className="text-rose-400 animate-pulse" />
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white font-bold tracking-widest uppercase">Mapping Features...</p>
                <p className="text-[8px] sm:text-[9px] text-surface-400 uppercase font-black tracking-[0.2em] mt-1">68-Point Landmark Mesh</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Info */}
        {faces.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-surface-500 uppercase tracking-widest">Identified Profiles</span>
              <span className="text-[9px] sm:text-[10px] text-rose-400 font-black uppercase tracking-widest bg-rose-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">{faces.length} Detected</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {faces.map((face) => (
                <button
                  key={face.id}
                  onClick={() => setSelectedFaceId(face.id)}
                  className={cn(
                    "flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all text-left",
                    selectedFaceId === face.id 
                      ? "bg-rose-500/10 border-rose-500/30" 
                      : "bg-editor-card/50 border-transparent hover:border-editor-border"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors",
                    selectedFaceId === face.id ? "bg-rose-500 text-white" : "bg-surface-800 text-surface-500"
                  )}>
                    <UserCheck size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[10px] sm:text-xs font-black uppercase tracking-wide", selectedFaceId === face.id ? "text-rose-400" : "text-white")}>
                      {face.label}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-surface-500 mt-0.5">Landmarks: {face.landmarks} points • Acc: {Math.round(face.confidence * 100)}%</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Smile size={12} className={selectedFaceId === face.id ? "text-rose-400" : "text-surface-600"} />
                    <MoreHorizontal size={12} className="text-surface-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !processing && (
          <div className="p-4 sm:p-6 text-center border-2 border-dashed border-editor-border rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 bg-editor-card/30">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-800 flex items-center justify-center mx-auto text-surface-600 border border-surface-700">
              <Scan size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em]">Biometric Scan Ready</p>
              <p className="text-[9px] sm:text-[10px] text-surface-500 leading-relaxed max-w-[80%] mx-auto">
                Identify facial features for professional retouching, morphing, and face swapping.
              </p>
            </div>
            <Button variant="primary" fullWidth size="sm" onClick={handleDetect} icon={Zap}>
              Initialize Scan
            </Button>
          </div>
        )}

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-editor-card border border-editor-border space-y-2 group hover:border-rose-500/30 transition-all cursor-help">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldCheck size={12} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Privacy Protection</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-surface-500 leading-relaxed group-hover:text-surface-400 transition-colors">
            All facial data is processed locally using browser-based neural networks. No biometric metadata is stored on our servers.
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-4 border-t border-editor-border bg-black/20">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!selectedFaceId}
            icon={Smile}
          >
            <span className="text-xs sm:text-sm">Retouch</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={!selectedFaceId}
            icon={Check}
          >
            <span className="text-xs sm:text-sm">Select Face</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
