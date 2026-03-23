// frontend/src/components/canvas/VideoCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function VideoCanvas() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { activeLayerId, layers } = useEditor();
  const activeLayer = layers.find(l => l.id === activeLayerId);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const handleTimeUpdate = () => {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    };

    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const togglePlay = () => {
    if (isPlaying) videoRef.current?.pause();
    else videoRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  if (activeLayer?.type !== 'video') return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group">
      <video
        ref={videoRef}
        src={activeLayer.url}
        className="max-w-full max-h-full shadow-2xl rounded-lg"
        onClick={togglePlay}
      />

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-primary-500" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button className="hover:text-primary-400 transition-colors"><SkipBack size={20} /></button>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
              </button>
              <button className="hover:text-primary-400 transition-colors"><SkipForward size={20} /></button>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md">
                <Volume2 size={16} />
                <span className="text-xs font-bold tabular-nums">00:12 / 01:45</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Maximize2 size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
