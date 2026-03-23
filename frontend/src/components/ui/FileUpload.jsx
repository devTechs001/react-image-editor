// frontend/src/components/ui/FileUpload.jsx
import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Image as ImageIcon, X, Check, AlertCircle, Loader2, ZoomIn } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from './Button';

export default function FileUpload({
  accept,
  multiple = false,
  maxSize,
  minSize,
  onFileSelect,
  onFileRemove,
  files = [],
  className,
  dragText = 'Drag & drop files here',
  browseText = 'Browse',
  description,
  disabled = false,
  showPreview = true,
  compact = false,
  imagePreview = false,
  loading = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }
    if (minSize && file.size < minSize) {
      return `File size must be at least ${formatFileSize(minSize)}`;
    }
    if (accept) {
      const acceptedTypes = Object.keys(accept).flatMap(key => {
        if (key === 'image/*') return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        return accept[key];
      });
      
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted: ${Object.keys(accept).join(', ')}`;
      }
    }
    return null;
  };

  const generatePreview = useCallback((file) => {
    if (!file.type.startsWith('image/')) return null;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (fileList) => {
    const newFiles = Array.from(fileList);
    const errors = [];
    setIsUploading(true);

    const validFiles = [];
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
        if (imagePreview) {
          const preview = await generatePreview(file);
          if (preview) {
            setPreviews(prev => [...prev, { name: file.name, url: preview, size: file.size }]);
          }
        }
      }
    }

    setIsUploading(false);
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    }

    if (validFiles.length > 0) {
      onFileSelect?.(validFiles);
    }
  }, [maxSize, minSize, accept, imagePreview, generatePreview, onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) return ImageIcon;
    return File;
  };

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <button
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary-500/10 text-primary-300 border border-primary-500/30',
            'hover:bg-primary-500/20 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">{browseText}</span>
        </button>
        {files.length > 0 && showPreview && (
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-editor-card border border-editor-border"
                >
                  <FileIcon className="w-4 h-4 text-surface-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-surface-500">{formatFileSize(file.size)}</p>
                  </div>
                  {onFileRemove && (
                    <button
                      onClick={() => onFileRemove?.(index)}
                      className="p-1 rounded hover:bg-white/5"
                    >
                      <X className="w-4 h-4 text-surface-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8',
          'transition-all duration-200 cursor-pointer',
          'hover:border-primary-500/50 hover:bg-primary-500/5',
          isDragging && 'border-primary-500 bg-primary-500/10',
          disabled && 'opacity-50 cursor-not-allowed',
          'border-editor-border bg-editor-card/50'
        )}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1, y: -5 } : {}}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
              isDragging
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-surface-700 text-surface-400'
            )}
          >
            <Upload className="w-6 h-6" />
          </motion.div>
          <p className="text-sm font-medium text-white mb-1">{dragText}</p>
          <p className="text-xs text-surface-500 mb-4">
            or <span className="text-primary-400 underline">{browseText}</span>
          </p>
          {description && (
            <p className="text-xs text-surface-600">{description}</p>
          )}
          {maxSize && (
            <p className="text-xs text-surface-600 mt-2">
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </motion.div>

      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          {imagePreview && previews.length > 0 ? (
            // Image Grid Preview
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-editor-card border border-editor-border"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white truncate">{preview.name}</p>
                      <p className="text-[10px] text-surface-400">{formatFileSize(preview.size)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(preview.url, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <ZoomIn className="w-3 h-3 text-white" />
                      </button>
                      {onFileRemove && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileRemove?.(index);
                            setPreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/80 backdrop-blur-sm hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List Preview
            <div className="space-y-2">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-editor-card border border-editor-border"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      file.type?.startsWith('image/')
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'bg-surface-700 text-surface-400'
                    )}>
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-surface-500">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {onFileRemove && (
                        <button
                          onClick={() => {
                            onFileRemove?.(index);
                            setPreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <X className="w-4 h-4 text-surface-400" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
