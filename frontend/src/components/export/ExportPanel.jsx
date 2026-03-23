// frontend/src/components/export/ExportPanel.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Image as ImageIcon,
  FileImage,
  FileVideo,
  FileText,
  Settings,
  Sliders,
  Check,
  X,
  Loader2,
  Palette,
  Maximize,
  File,
  Layers,
  WaterDrop,
  Type
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import { useImageExport } from '@/hooks/export/useImageExport';
import {
  ImageFormat,
  ImageQuality,
  CompressionPreset
} from '@/services/export';
import { WatermarkPosition, WatermarkType } from '@/services/export/watermark';
import { PaperSize, Orientation } from '@/services/export/pdfExporter';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';

/**
 * Export Panel Component
 * Full-featured export interface with format, quality, and size options
 */
export function ExportPanel({ canvas, onClose, onExportComplete }) {
  const [activeTab, setActiveTab] = useState('image');
  const [showSettings, setShowSettings] = useState(false);

  const {
    isExporting,
    progress,
    error,
    exportAndDownload,
    exportCompressed
  } = useImageExport(canvas, {
    format: ImageFormat.PNG,
    quality: ImageQuality.HIGH
  });

  const handleQuickExport = useCallback(async () => {
    try {
      await exportAndDownload({ filename: 'export' });
      onExportComplete?.();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exportAndDownload, onExportComplete]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-surface-900 border-l border-surface-700 shadow-2xl z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="p-4"
        tabs={[
          { value: 'image', label: 'Image', icon: ImageIcon },
          { value: 'gif', label: 'GIF', icon: FileImage },
          { value: 'video', label: 'Video', icon: FileVideo },
          { value: 'pdf', label: 'PDF', icon: FileText }
        ]}
      />

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'image' && (
          <ImageExportOptions
            canvas={canvas}
            isExporting={isExporting}
            progress={progress}
            error={error}
            onExport={handleQuickExport}
          />
        )}
        {activeTab === 'gif' && (
          <GifExportOptions canvas={canvas} />
        )}
        {activeTab === 'video' && (
          <VideoExportOptions canvas={canvas} />
        )}
        {activeTab === 'pdf' && (
          <PdfExportOptions canvas={canvas} />
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <ExportSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Image Export Options
 */
function ImageExportOptions({ canvas, isExporting, progress, error, onExport }) {
  const [format, setFormat] = useState(ImageFormat.PNG);
  const [quality, setQuality] = useState(ImageQuality.HIGH);
  const [scale, setScale] = useState(1);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [addWatermark, setAddWatermark] = useState(false);

  const formatOptions = [
    { value: ImageFormat.PNG, label: 'PNG', description: 'Lossless, supports transparency' },
    { value: ImageFormat.JPEG, label: 'JPEG', description: 'Small size, no transparency' },
    { value: ImageFormat.WEBP, label: 'WebP', description: 'Modern format, best compression' },
    { value: ImageFormat.AVIF, label: 'AVIF', description: 'Next-gen compression' }
  ];

  const qualityOptions = [
    { value: ImageQuality.LOSSLESS, label: 'Lossless' },
    { value: ImageQuality.HIGH, label: 'High (92%)' },
    { value: ImageQuality.MEDIUM, label: 'Medium (75%)' },
    { value: ImageQuality.LOW, label: 'Low (50%)' }
  ];

  const scaleOptions = [
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 1, label: '100%' },
    { value: 2, label: '200%' }
  ];

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <FileImage className="w-4 h-4" />
          Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {formatOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                format === opt.value
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-surface-600 bg-surface-800 text-surface-400 hover:border-surface-500'
              )}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs opacity-60">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      {(format === ImageFormat.JPEG || format === ImageFormat.WEBP) && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Quality
          </label>
          <Select
            value={quality}
            onChange={setQuality}
            options={qualityOptions}
          />
        </div>
      )}

      {/* Scale */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Maximize className="w-4 h-4" />
          Scale: {scale * 100}%
        </label>
        <Slider
          value={scale}
          onChange={setScale}
          min={0.25}
          max={2}
          step={0.25}
          options={scaleOptions}
        />
      </div>

      {/* Options */}
      <div className="space-y-3 pt-4 border-t border-surface-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Include metadata
          </span>
          <Switch
            checked={includeMetadata}
            onChange={setIncludeMetadata}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300 flex items-center gap-2">
            <WaterDrop className="w-4 h-4" />
            Add watermark
          </span>
          <Switch
            checked={addWatermark}
            onChange={setAddWatermark}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Export Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onExport}
        loading={isExporting}
        icon={Download}
        className="mt-4"
      >
        {isExporting ? `Exporting... ${Math.round(progress)}%` : 'Export Image'}
      </Button>

      {/* Quick Export Options */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {}}
        >
          <Layers className="w-4 h-4" />
          Export Layers
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {}}
        >
          <Palette className="w-4 h-4" />
          Export Preset
        </Button>
      </div>
    </div>
  );
}

/**
 * GIF Export Options
 */
function GifExportOptions({ canvas }) {
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState('high');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">
          Frame Rate: {fps} FPS
        </label>
        <Slider
          value={fps}
          onChange={setFps}
          min={1}
          max={30}
          step={1}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">Quality</label>
        <Select
          value={quality}
          onChange={setQuality}
          options={[
            { value: 'low', label: 'Low (64 colors)' },
            { value: 'medium', label: 'Medium (128 colors)' },
            { value: 'high', label: 'High (256 colors)' }
          ]}
        />
      </div>

      <Button variant="primary" size="lg" fullWidth icon={FileImage}>
        Export GIF
      </Button>
    </div>
  );
}

/**
 * Video Export Options
 */
function VideoExportOptions({ canvas }) {
  const [format, setFormat] = useState('webm');
  const [quality, setQuality] = useState('1080p');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">Format</label>
        <Select
          value={format}
          onChange={setFormat}
          options={[
            { value: 'webm', label: 'WebM' },
            { value: 'mp4', label: 'MP4' },
            { value: 'gif', label: 'GIF' }
          ]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">Resolution</label>
        <Select
          value={quality}
          onChange={setQuality}
          options={[
            { value: '360p', label: '360p (640x360)' },
            { value: '720p', label: '720p (1280x720)' },
            { value: '1080p', label: '1080p (1920x1080)' },
            { value: '4k', label: '4K (3840x2160)' }
          ]}
        />
      </div>

      <Button variant="primary" size="lg" fullWidth icon={FileVideo}>
        Export Video
      </Button>
    </div>
  );
}

/**
 * PDF Export Options
 */
function PdfExportOptions({ canvas }) {
  const [paperSize, setPaperSize] = useState(PaperSize.A4);
  const [orientation, setOrientation] = useState(Orientation.PORTRAIT);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">Paper Size</label>
        <Select
          value={paperSize}
          onChange={setPaperSize}
          options={[
            { value: PaperSize.A4, label: 'A4 (210 x 297 mm)' },
            { value: PaperSize.A3, label: 'A3 (297 x 420 mm)' },
            { value: PaperSize.LETTER, label: 'Letter (8.5" x 11")' }
          ]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-surface-300">Orientation</label>
        <div className="flex gap-2">
          <Button
            variant={orientation === Orientation.PORTRAIT ? 'primary' : 'secondary'}
            onClick={() => setOrientation(Orientation.PORTRAIT)}
            className="flex-1"
          >
            Portrait
          </Button>
          <Button
            variant={orientation === Orientation.LANDSCAPE ? 'primary' : 'secondary'}
            onClick={() => setOrientation(Orientation.LANDSCAPE)}
            className="flex-1"
          >
            Landscape
          </Button>
        </div>
      </div>

      <Button variant="primary" size="lg" fullWidth icon={FileText}>
        Export PDF
      </Button>
    </div>
  );
}

/**
 * Export Settings Modal
 */
function ExportSettingsModal({ isOpen, onClose }) {
  const [defaultFormat, setDefaultFormat] = useState(ImageFormat.PNG);
  const [defaultQuality, setDefaultQuality] = useState(ImageQuality.HIGH);
  const [autoOptimize, setAutoOptimize] = useState(true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Settings"
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300">Default Format</label>
          <Select
            value={defaultFormat}
            onChange={setDefaultFormat}
            options={[
              { value: ImageFormat.PNG, label: 'PNG' },
              { value: ImageFormat.JPEG, label: 'JPEG' },
              { value: ImageFormat.WEBP, label: 'WebP' }
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-surface-300">Default Quality</label>
          <Select
            value={defaultQuality}
            onChange={setDefaultQuality}
            options={[
              { value: ImageQuality.LOSSLESS, label: 'Lossless' },
              { value: ImageQuality.HIGH, label: 'High' },
              { value: ImageQuality.MEDIUM, label: 'Medium' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300">Auto-optimize for web</span>
          <Switch
            checked={autoOptimize}
            onChange={setAutoOptimize}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            <Check className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ExportPanel;
