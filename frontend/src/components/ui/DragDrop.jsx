// frontend/src/components/ui/DragDrop.jsx
import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Upload, File, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

export default function DragDrop({ 
  onFilesDropped, 
  accept = "*", 
  multiple = true,
  maxSize = 100 * 1024 * 1024, // 100MB
  className 
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file) => {
    if (file.size > maxSize) return `File too large: ${file.name}`;
    if (accept !== "*" && !file.type.match(accept.replace('*', '.*'))) {
      return `Invalid file type: ${file.name}`;
    }
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const err = validateFile(file);
      if (err) errors.push(err);
      else validFiles.push(file);
    });

    if (errors.length > 0) setError(errors[0]);
    if (validFiles.length > 0) onFilesDropped(multiple ? validFiles : validFiles[0]);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 sm:p-12 border-2 border-dashed rounded-2xl sm:rounded-3xl transition-all group cursor-pointer",
        isDragging 
          ? "border-primary-500 bg-primary-500/5" 
          : "border-editor-border hover:border-surface-500 hover:bg-white/5",
        error && "border-red-500/50 bg-red-500/5",
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110",
        isDragging ? "bg-primary-500 text-white" : "bg-surface-800 text-surface-500"
      )}>
        {isDragging ? <Upload size={24} sm:size-32 /> : <File size={24} sm:size-32 />}
      </div>
      
      <div className="text-center space-y-1 px-4">
        <p className="text-xs sm:text-sm font-semibold text-white">
          {isDragging ? "Drop to upload" : "Drag and drop files"}
        </p>
        <p className="text-xs text-surface-500">
          or <span className="text-primary-400 font-bold">click to browse</span> from your device
        </p>
      </div>

      {error && (
        <div className="absolute bottom-2 sm:bottom-4 left-4 right-4 flex items-center gap-2 text-red-400">
          <AlertCircle size={12} sm:size-14 />
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider truncate">{error}</span>
        </div>
      )}

      {/* Actual Hidden Input */}
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length > 0) onFilesDropped(multiple ? files : files[0]);
        }}
      />
    </div>
  );
}
