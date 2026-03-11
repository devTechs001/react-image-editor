// frontend/src/components/filters/Presets.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Star, Edit2, Check } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

const defaultPresets = [
  { id: 'normal', name: 'Normal', adjustments: { brightness: 0, contrast: 0, saturation: 100 } },
  { id: 'vivid', name: 'Vivid', adjustments: { brightness: 5, contrast: 15, saturation: 130 } },
  { id: 'warm', name: 'Warm', adjustments: { brightness: 5, contrast: 5, saturation: 110, temperature: 15 } },
  { id: 'cool', name: 'Cool', adjustments: { brightness: 5, contrast: 5, saturation: 110, temperature: -15 } },
  { id: 'dramatic', name: 'Dramatic', adjustments: { brightness: -10, contrast: 30, saturation: 80 } },
  { id: 'faded', name: 'Faded', adjustments: { brightness: 10, contrast: -20, saturation: 70 } },
  { id: 'bw', name: 'B&W', adjustments: { brightness: 0, contrast: 20, saturation: 0 } },
  { id: 'vintage', name: 'Vintage', adjustments: { brightness: 5, contrast: -10, saturation: 80, temperature: 10 } }
];

export default function Presets({ onApply }) {
  const { adjustments, updateLayer } = useEditor();
  const [customPresets, setCustomPresets] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const allPresets = [...defaultPresets, ...customPresets];

  const handleApplyPreset = useCallback((preset) => {
    setActivePreset(preset.id);
    onApply?.(preset.adjustments);
    
    setTimeout(() => {
      setActivePreset(null);
    }, 500);
  }, [onApply]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      adjustments: { ...adjustments },
      isCustom: true
    };

    setCustomPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowSaveModal(false);
  }, [presetName, adjustments]);

  const handleDeletePreset = useCallback((id) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <div className="p-4">
      {/* Save Current Button */}
      <div className="mb-4">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          icon={Save}
          onClick={() => setShowSaveModal(true)}
        >
          Save Current as Preset
        </Button>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-4 gap-2">
        {allPresets.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleApplyPreset(preset)}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden group',
              'border-2 transition-all',
              activePreset === preset.id
                ? 'border-primary-500 ring-2 ring-primary-500/30'
                : 'border-editor-border hover:border-surface-500'
            )}
          >
            {/* Preview */}
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, 
                  hsl(${preset.adjustments.temperature || 0}, ${preset.adjustments.saturation || 100}%, ${preset.adjustments.brightness || 50}%),
                  hsl(${(preset.adjustments.temperature || 0) + 30}, ${preset.adjustments.saturation || 80}%, ${(preset.adjustments.brightness || 50) - 20}%)
                )`,
                filter: `contrast(${preset.adjustments.contrast || 100}%)`
              }}
            />
            
            {/* Name */}
            <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/60 backdrop-blur-sm">
              <p className="text-[10px] text-white truncate text-center">{preset.name}</p>
            </div>

            {/* Delete Button (custom presets only) */}
            {preset.isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePreset(preset.id);
                }}
                className="absolute top-1 right-1 p-1 rounded bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
          </motion.button>
        ))}
      </div>

      {/* Save Preset Modal */}
      {showSaveModal && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Save Preset"
          size="sm"
        >
          <div className="space-y-4">
            <Input
              label="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="My Preset"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                Save Preset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
