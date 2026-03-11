// frontend/src/components/templates/TemplateCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Download, Plus, MoreHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

export default function TemplateCard({ template, onUse, onPreview }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleUse = () => {
    onUse?.(template);
    navigate('/editor', { state: { template } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden bg-editor-card border border-editor-border hover:border-primary-500/50 transition-all cursor-pointer"
    >
      {/* Preview Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-surface-800 to-surface-900 relative overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn(
            'w-full h-full bg-gradient-to-br flex items-center justify-center',
            template.color || 'from-primary-500/30 to-secondary-500/30'
          )}>
            <div className="w-24 h-16 rounded-lg bg-white/10 backdrop-blur-sm" />
          </div>
        )}

        {/* Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3"
        >
          <Button
            variant="glass"
            size="sm"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={(e) => {
              e.stopPropagation();
              handleUse();
            }}
          >
            Use
          </Button>
        </motion.div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-lg transition-all',
            'opacity-0 group-hover:opacity-100',
            isFavorite
              ? 'bg-red-500/20 text-red-400'
              : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'
          )}
        >
          <Heart
            className="w-4 h-4"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-2xs font-bold text-white">
            PRO
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4" onClick={handleUse}>
        <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors truncate">
          {template.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-surface-500">{template.size || '1080 × 1080'}</span>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {template.uses?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}