// frontend/src/components/export/ExportPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Settings,
  Image,
  Video,
  File,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import Switch from '@/components/ui/Switch';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const formats = {
  image: [
    { id: 'png', name: 'PNG', desc: 'Lossless, supports transparency', ext: '.png' },
    { id: 'jpg', name: 'JPEG', desc: 'Smaller files, no transparency', ext: '.jpg' },
    { id: 'webp', name: 'WebP', desc: 'Modern format, best compression', ext: '.webp' },
    { id: 'svg', name: 'SVG', desc: 'Vector format, scalable', ext: '.svg' },
    { id: 'pdf', name: 'PDF', desc: 'Document format', ext: '.pdf' }
  ],
  video: [
    { id: 'mp4', name: 'MP4', desc: 'Most compatible', ext: '.mp4' },
    { id: 'webm', name: 'WebM', desc: 'Web optimized', ext: '.webm' },
    { id: 'gif', name: 'GIF', desc: 'Animated image', ext: '.gif' },
    { id: 'mov', name: 'MOV', desc: 'Apple format', ext: '.mov' }
  ]
};

const presets = [
  { id: 'web', name: 'Web', quality: 80, scale: 1 },
  { id: 'social', name: 'Social Media', quality: 90, scale: 1 },
  { id: 'print', name: 'Print', quality: 100, scale: 2 },
  { id: 'custom', name: 'Custom', quality: 100, scale: 1 }
];

const socialPresets = [
  { id: 'instagram-post', name: 'Instagram Post', size: '1080 × 1080' },
  { id: 'instagram-story', name: 'Instagram Story', size: '1080 × 1920' },
  { id: 'facebook-post', name: 'Facebook Post', size: '1200 × 630' },
  { id: 'twitter-post', name: 'Twitter Post', size: '1200 × 675' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', size: '1280 × 720' },
  { id: 'linkedin-post', name: 'LinkedIn Post', size: '1200 × 627' }
];

export default function ExportPanel({ isOpen, onClose, projectType = 'image' }) {
  const { canvas, project, exportSettings, setExportSettings } = useEditor();
  const [activePreset, setActivePreset] = useState('custom');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState(projectType === 'image' ? 'png' : 'mp4');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentFormats = formats[projectType] || formats.image;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // In real implementation, call export API
      toast.success('Export complete!');
      onClose();
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePresetChange = (presetId) => {
    setActivePreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setExportSettings({
        quality: preset.quality,
        scale: preset.scale
      });
    }
  };

  const estimatedSize = Math.round(
    (canvas.width * canvas.height * exportSettings.scale * exportSettings.scale * 
    (exportSettings.quality / 100) * (selectedFormat === 'png' ? 4 : 0.5)) / 1024
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export"
      size="lg"
    >
      {isExporting ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
            <Download className="w-8 h-8 text-primary-400 animate-bounce" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Exporting...</h3>
          <p className="text-surface-400 mb-6">Please wait while we prepare your file</p>
          <div className="max-w-xs mx-auto">
            <ProgressBar value={exportProgress} animated showLabel />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-surface-300 mb-3">Format</h3>
            <div className="grid grid-cols-5 gap-2">
              {currentFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    'p-3 rounded-xl border text-center transition-all',
                    selectedFormat === format.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-editor-border hover:border-surface-600'
                  )}
                >
                  <span className="text-sm font-semibold text-white">{format.name}</span>
                  <span className="block text-2xs text-surface-500 mt-1">{format.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Presets */}
          <div>
            <h3 className="text-sm font-medium text-surface-300 mb-3">Preset</h3>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all',
                    activePreset === preset.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-editor-border hover:border-surface-600'
                  )}
                >
                  <span className="text-sm font-medium text-white">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality & Scale */}
          <div className="grid grid-cols-2 gap-6">
            <Slider
              label="Quality"
              value={[exportSettings.quality]}
              onValueChange={([value]) => {
                setExportSettings({ quality: value });
                setActivePreset('custom');
              }}
              min={1}
              max={100}
              valueSuffix="%"
            />
            <Slider
              label="Scale"
              value={[exportSettings.scale * 100]}
              onValueChange={([value]) => {
                setExportSettings({ scale: value / 100 });
                setActivePreset('custom');
              }}
              min={25}
              max={400}
              valueSuffix="%"
            />
          </div>

          {/* Output Size */}
          <div className="p-4 rounded-xl bg-editor-card border border-editor-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-400">Output Size</span>
              <span className="text-sm font-mono text-white">
                {Math.round(canvas.width * exportSettings.scale)} × {Math.round(canvas.height * exportSettings.scale)}px
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400">Estimated File Size</span>
              <span className="text-sm font-mono text-white">
                ~{estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} MB` : `${estimatedSize} KB`}
              </span>
            </div>
          </div>

          {/* Social Media Presets */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced Options
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                showAdvanced && 'rotate-180'
              )} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    <Switch
                      label="Preserve metadata"
                      description="Include EXIF and other metadata"
                      checked={exportSettings.preserveMetadata}
                      onCheckedChange={(checked) => setExportSettings({ preserveMetadata: checked })}
                    />
                    <Switch
                      label="Include watermark"
                      description="Add watermark to exported file"
                      checked={exportSettings.watermark?.enabled}
                      onCheckedChange={(checked) => setExportSettings({ watermark: { ...exportSettings.watermark, enabled: checked } })}
                    />
                    <Switch
                      label="Optimize for web"
                      description="Apply additional compression"
                      checked={exportSettings.webOptimize}
                      onCheckedChange={(checked) => setExportSettings({ webOptimize: checked })}
                    />

                    {/* Social Media Quick Resize */}
                    <div>
                      <h4 className="text-xs font-medium text-surface-500 mb-2">Quick Resize for Social</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {socialPresets.map((preset) => (
                          <button
                            key={preset.id}
                            className="p-2 rounded-lg bg-surface-800 border border-surface-700 hover:border-primary-500/50 transition-all text-left"
                          >
                            <span className="text-xs font-medium text-white">{preset.name}</span>
                            <span className="block text-2xs text-surface-500">{preset.size}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-editor-border">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Info className="w-4 h-4" />
              <span>This will use 1 export credit</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleExport} icon={Download}>
                Export {selectedFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}