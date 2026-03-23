// frontend/src/components/ai/ObjectDetection.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Search, 
  Check, 
  Sparkles,
  MousePointer2,
  Box,
  Layout,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/helpers/cn';

export default function ObjectDetection({ image, onComplete }) {
  const { setAIProcessing } = useEditor();
  const [processing, setProcessing] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  const handleDetect = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setAIProcessing(true);

    try {
      // Real implementation: aiAPI.detectObjects(image)
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Mock results
      const mockObjects = [
        { id: 1, label: 'Subject', confidence: 0.98, box: [10, 10, 40, 80] },
        { id: 2, label: 'Background', confidence: 0.95, box: [0, 0, 100, 100] },
        { id: 3, label: 'Accessory', confidence: 0.88, box: [45, 20, 15, 15] }
      ];
      setObjects(mockObjects);
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setProcessing(false);
      setAIProcessing(false);
    }
  }, [image, setAIProcessing]);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      <div className="p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Object Intelligence</h3>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Semantic Scene Analysis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Interactive Preview Area */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-editor-card border border-editor-border group">
          <img src={image} alt="Original" className="w-full h-full object-contain" />
          
          {/* Object Overlays */}
          {objects.map((obj) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedObjectId === obj.id ? 1 : 0.3 }}
              onClick={() => setSelectedObjectId(obj.id)}
              className={cn(
                "absolute border-2 transition-all cursor-pointer group/item",
                selectedObjectId === obj.id ? "border-primary-500 bg-primary-500/10 z-20" : "border-white/30 hover:border-white/60 z-10"
              )}
              style={{
                left: `${obj.box[0]}%`,
                top: `${obj.box[1]}%`,
                width: `${obj.box[2]}%`,
                height: `${obj.box[3]}%`
              }}
            >
              <div className={cn(
                "absolute -top-6 left-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap transition-colors",
                selectedObjectId === obj.id ? "bg-primary-500 text-white" : "bg-black/60 text-white/80"
              )}>
                {obj.label} • {Math.round(obj.confidence * 100)}%
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="text-indigo-400 w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white font-medium">Scanning Geometry...</p>
                <p className="text-[10px] text-surface-400 uppercase font-black tracking-widest mt-1">AI vision active</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detected List */}
        {objects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={10} />
                Detected Elements
              </span>
              <span className="text-[10px] text-surface-600 font-bold">{objects.length} Objects</span>
            </div>
            
            <div className="space-y-2">
              {objects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjectId(obj.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selectedObjectId === obj.id 
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400" 
                      : "bg-editor-card/50 border-transparent hover:border-editor-border text-surface-400"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedObjectId === obj.id ? "bg-primary-500 text-white" : "bg-surface-800 text-surface-500"
                  )}>
                    <Box size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide">{obj.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-current opacity-30" style={{ width: `${obj.confidence * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-black">{Math.round(obj.confidence * 100)}%</span>
                    </div>
                  </div>
                  <MousePointer2 size={12} className={cn("transition-transform", selectedObjectId === obj.id ? "scale-110" : "scale-0")} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State / Help */}
        {!processing && objects.length === 0 && (
          <div className="p-6 text-center border-2 border-dashed border-editor-border rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center mx-auto text-surface-600">
              <Search size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Ready to scan</p>
              <p className="text-[10px] text-surface-500 leading-relaxed">
                Analyze your image to automatically identify objects, people, and backgrounds for quick masking and editing.
              </p>
            </div>
            <Button variant="primary" fullWidth size="sm" onClick={handleDetect} icon={Zap}>
              Start Detection
            </Button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-editor-border bg-black/20">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!selectedObjectId}
            icon={Layout}
          >
            Create Mask
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={!selectedObjectId}
            icon={Check}
          >
            Isolate Object
          </Button>
        </div>
      </div>
    </div>
  );
}
