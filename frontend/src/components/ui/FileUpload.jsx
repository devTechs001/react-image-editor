// frontend/src/components/ui/FileUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, Video, Music, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import ProgressBar from './ProgressBar';

const fileTypeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  default: File
};

function getFileType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'default';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUpload({
  accept,
  multiple = false,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  onUpload,
  onError,
  showPreview = true,
  className
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        name: file.name,
        message: errors[0]?.message || 'File rejected'
      }));
      setErrors(newErrors);
      onError?.(newErrors);
    }

    // Add new files
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,// frontend/src/components/ui/FileUpload.jsx (continued)
      type: getFileType(file),
      status: 'pending'
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setErrors([]);

    // Upload files
    for (const fileData of newFiles) {
      try {
        setUploadProgress((prev) => ({ ...prev, [fileData.id]: 0 }));
        
        // Simulate upload progress (replace with actual upload)
        await simulateUpload(fileData.id, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileData.id]: progress }));
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id ? { ...f, status: 'complete' } : f
          )
        );

        onUpload?.(fileData.file);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id ? { ...f, status: 'error' } : f
          )
        );
      }
    }
  }, [onUpload, onError]);

  const simulateUpload = (id, onProgress) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        onProgress(progress);
      }, 200);
    });
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize
  });

  return (
    <div className={cn('w-full', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          'hover:border-primary-500/50 hover:bg-primary-500/5',
          isDragActive && 'border-primary-500 bg-primary-500/10 scale-[1.02]',
          isDragReject && 'border-red-500 bg-red-500/10',
          'border-surface-700 bg-surface-800/30'
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={false}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center"
        >
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
            isDragActive ? 'bg-primary-500/20' : 'bg-surface-700/50'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragActive ? 'text-primary-400' : 'text-surface-400'
            )} />
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          
          <p className="text-sm text-surface-400 mb-4">
            or click to browse from your device
          </p>
          
          <div className="flex items-center gap-4 text-xs text-surface-500">
            <span>Max size: {formatFileSize(maxSize)}</span>
            {maxFiles > 1 && <span>Max files: {maxFiles}</span>}
          </div>
        </motion.div>
      </div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error.name}: {error.message}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {showPreview && files.length > 0 && (
        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {files.map((fileData) => {
              const Icon = fileTypeIcons[fileData.type];
              const progress = uploadProgress[fileData.id] || 0;

              return (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border',
                    'bg-editor-card border-editor-border'
                  )}
                >
                  {/* Preview/Icon */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-800 flex items-center justify-center flex-shrink-0">
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-surface-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatFileSize(fileData.file.size)}
                    </p>
                    
                    {/* Progress */}
                    {fileData.status === 'pending' && (
                      <div className="mt-2">
                        <ProgressBar value={progress} size="xs" />
                      </div>
                    )}
                  </div>

                  {/* Status/Actions */}
                  <div className="flex items-center gap-2">
                    {fileData.status === 'complete' && (
                      <span className="text-emerald-400 text-sm font-medium">
                        ✓ Uploaded
                      </span>
                    )}
                    {fileData.status === 'error' && (
                      <span className="text-red-400 text-sm font-medium">
                        Failed
                      </span>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="p-2 rounded-lg text-surface-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}