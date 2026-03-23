// frontend/src/components/workspace/StatusBar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Eye,
  Grid3X3,
  Lock,
  Unlock,
  Info,
  Download,
  Save,
  Cloud,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  HardDrive,
  Image as ImageIcon,
  Layers,
  Type,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import { useEditor } from '@/contexts/EditorContext';
import ProgressBar from '@/components/ui/ProgressBar';

export default function StatusBar() {
  const { image, zoom, showGrid, toggleGrid, layers } = useEditor();
  const [showInfo, setShowInfo] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Get image info
  const getImageInfo = () => {
    if (!image) return null;
    return {
      dimensions: `${image.width || 0} × ${image.height || 0}`,
      size: image.fileSize ? formatSize(image.fileSize) : 'N/A',
      format: image.format || 'PNG',
      layers: layers?.length || 1
    };
  };

  const imageInfo = getImageInfo();

  return (
    <div className="h-8 bg-surface-900 border-t border-surface-700 flex items-center justify-between px-3 text-xs">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Zoom Level */}
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-surface-700 rounded transition-colors">
            <ZoomOut className="w-3 h-3 text-surface-400" />
          </button>
          <span className="text-surface-300 font-mono min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button className="p-1 hover:bg-surface-700 rounded transition-colors">
            <ZoomIn className="w-3 h-3 text-surface-400" />
          </button>
        </div>

        {/* Dimensions */}
        {imageInfo && (
          <div className="flex items-center gap-1 text-surface-400">
            <Maximize className="w-3 h-3" />
            <span>{imageInfo.dimensions}</span>
          </div>
        )}

        {/* Layers Count */}
        <div className="flex items-center gap-1 text-surface-400">
          <Layers className="w-3 h-3" />
          <span>{imageInfo?.layers || 1} layers</span>
        </div>
      </div>

      {/* Center Section - Status Messages */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {/* Upload Progress */}
        {uploadProgress !== null && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 text-primary-400 animate-spin" />
            <ProgressBar value={uploadProgress} className="w-32 h-1" />
            <span className="text-surface-400">{uploadProgress}%</span>
          </div>
        )}

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-surface-400"
        >
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Grid Toggle */}
        <button
          onClick={toggleGrid}
          className={cn(
            'p-1 rounded transition-colors',
            showGrid ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-surface-700 text-surface-400'
          )}
          title="Toggle Grid"
        >
          <Grid3X3 className="w-3 h-3" />
        </button>

        {/* File Size */}
        {imageInfo && (
          <div className="flex items-center gap-1 text-surface-400">
            <HardDrive className="w-3 h-3" />
            <span>{imageInfo.size}</span>
          </div>
        )}

        {/* Image Info Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 hover:bg-surface-700 rounded transition-colors"
          >
            <Info className="w-3 h-3 text-surface-400" />
          </button>

          {/* Info Popover */}
          {showInfo && imageInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full right-0 mb-2 p-3 bg-surface-800 rounded-xl shadow-lg border border-surface-700 min-w-[200px]"
            >
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-400">Dimensions:</span>
                  <span className="text-white">{imageInfo.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">File Size:</span>
                  <span className="text-white">{imageInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Format:</span>
                  <span className="text-white">{imageInfo.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Layers:</span>
                  <span className="text-white">{imageInfo.layers}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-1 text-surface-400">
          <Cloud className="w-3 h-3" />
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
