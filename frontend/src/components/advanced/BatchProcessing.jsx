// frontend/src/components/advanced/BatchProcessing.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Play,
  Pause,
  Square,
  SkipForward,
  Settings,
  Upload,
  Download,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  BarChart3,
  Activity,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const processingOperations = [
  {
    id: 'enhance',
    name: 'AI Enhancement',
    description: 'Enhance image quality using AI',
    icon: Zap,
    estimatedTime: 30,
    category: 'enhancement'
  },
  {
    id: 'upscale',
    name: 'Image Upscaling',
    description: 'Increase image resolution',
    icon: Maximize2,
    estimatedTime: 45,
    category: 'enhancement'
  },
  {
    id: 'compress',
    name: 'Compression',
    description: 'Optimize file size',
    icon: HardDrive,
    estimatedTime: 15,
    category: 'optimization'
  },
  {
    id: 'convert',
    name: 'Format Conversion',
    description: 'Convert to different formats',
    icon: FileText,
    estimatedTime: 20,
    category: 'conversion'
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    description: 'Apply watermarks to images',
    icon: ImageIcon,
    estimatedTime: 25,
    category: 'branding'
  },
  {
    id: 'resize',
    name: 'Batch Resize',
    description: 'Resize multiple images',
    icon: Move3d,
    estimatedTime: 10,
    category: 'transformation'
  }
];

const exportFormats = [
  { id: 'jpg', name: 'JPEG', extension: '.jpg', quality: true },
  { id: 'png', name: 'PNG', extension: '.png', quality: false },
  { id: 'webp', name: 'WebP', extension: '.webp', quality: true },
  { id: 'avif', name: 'AVIF', extension: '.avif', quality: true },
  { id: 'tiff', name: 'TIFF', extension: '.tiff', quality: false }
];

export default function BatchProcessing() {
  const { image } = useEditor();
  const [files, setFiles] = useState([]);
  const [operations, setOperations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentOperationIndex, setCurrentOperationIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(exportFormats[0]);
  const [quality, setQuality] = useState(85);
  const [outputFolder, setOutputFolder] = useState('batch-output');
  const [expandedSections, setExpandedSections] = useState({
    operations: true,
    settings: false,
    preview: false
  });
  const [stats, setStats] = useState({
    totalFiles: 0,
    processedFiles: 0,
    failedFiles: 0,
    totalOperations: 0,
    completedOperations: 0,
    estimatedTimeRemaining: 0,
    processingSpeed: 0
  });

  const fileInputRef = useRef(null);

  // Calculate estimated processing time
  const calculateEstimatedTime = useCallback(() => {
    if (files.length === 0 || operations.length === 0) return 0;
    
    const totalTime = operations.reduce((total, op) => {
      return total + (op.estimatedTime * files.length);
    }, 0);
    
    return totalTime;
  }, [files, operations]);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      operations: [...operations],
      results: []
    }));
    
    setFiles(prev => [...prev, ...selectedFiles]);
    setStats(prev => ({ ...prev, totalFiles: prev.totalFiles + selectedFiles.length }));
    toast.success(`Added ${selectedFiles.length} files to batch`);
  }, [operations]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }
    
    const processedFiles = droppedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      operations: [...operations],
      results: []
    }));
    
    setFiles(prev => [...prev, ...processedFiles]);
    setStats(prev => ({ ...prev, totalFiles: prev.totalFiles + processedFiles.length }));
    toast.success(`Added ${processedFiles.length} files to batch`);
  }, [operations]);

  // Add operation to queue
  const addOperation = useCallback((operation) => {
    if (operations.find(op => op.id === operation.id)) {
      toast.error('Operation already added');
      return;
    }
    
    setOperations(prev => [...prev, operation]);
    setStats(prev => ({ ...prev, totalOperations: prev.totalOperations + files.length }));
  }, [operations, files.length]);

  // Remove operation
  const removeOperation = useCallback((operationId) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
    setStats(prev => ({ ...prev, totalOperations: prev.totalOperations - files.length }));
  }, [files.length]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setStats(prev => ({ ...prev, totalFiles: prev.totalFiles - 1 }));
  }, []);

  // Start batch processing
  const startProcessing = useCallback(async () => {
    if (files.length === 0 || operations.length === 0) {
      toast.error('Please add files and operations');
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setCurrentFileIndex(0);
    setCurrentOperationIndex(0);
    setProgress(0);

    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        if (!isProcessing) break;
        
        const file = files[fileIndex];
        setCurrentFileIndex(fileIndex);
        
        // Update file status to processing
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        ));

        // Process each operation
        for (let opIndex = 0; opIndex < operations.length; opIndex++) {
          if (!isProcessing || isPaused) break;
          
          const operation = operations[opIndex];
          setCurrentOperationIndex(opIndex);

          // Simulate processing time
          const processingTime = operation.estimatedTime * 100;
          const steps = 20;
          const stepTime = processingTime / steps;

          for (let step = 0; step <= steps; step++) {
            if (!isProcessing || isPaused) break;
            
            await new Promise(resolve => setTimeout(resolve, stepTime));
            
            const fileProgress = ((opIndex * 100) + (step * 100 / steps)) / operations.length;
            const totalProgress = ((fileIndex * 100) + fileProgress) / files.length;
            
            setProgress(totalProgress);
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, progress: fileProgress }
                : f
            ));
          }

          // Add operation result
          if (isProcessing && !isPaused) {
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    results: [...(f.results || []), {
                      operation: operation.name,
                      timestamp: Date.now(),
                      success: true
                    }]
                  }
                : f
            ));
          }
        }

        // Mark file as completed
        if (isProcessing && !isPaused) {
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
          
          setProcessedFiles(prev => [...prev, file]);
          setStats(prev => ({ 
            ...prev, 
            processedFiles: prev.processedFiles + 1,
            completedOperations: prev.completedOperations + operations.length
          }));
        }
      }

      if (isProcessing) {
        toast.success('Batch processing completed!');
        setIsProcessing(false);
        setProgress(100);
      }
    } catch (error) {
      toast.error('Batch processing failed');
      setIsProcessing(false);
    }
  }, [files, operations, isProcessing, isPaused]);

  // Pause processing
  const pauseProcessing = useCallback(() => {
    setIsPaused(true);
    toast.info('Processing paused');
  }, []);

  // Resume processing
  const resumeProcessing = useCallback(() => {
    setIsPaused(false);
    toast.info('Processing resumed');
  }, []);

  // Stop processing
  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    setProgress(0);
    
    // Reset pending files
    setFiles(prev => prev.map(f => 
      f.status === 'processing' || f.status === 'pending'
        ? { ...f, status: 'pending', progress: 0 }
        : f
    ));
    
    toast.info('Processing stopped');
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setProcessedFiles([]);
    setStats(prev => ({ 
      ...prev, 
      totalFiles: 0, 
      processedFiles: 0, 
      failedFiles: 0,
      completedOperations: 0 
    }));
    toast.success('All files cleared');
  }, []);

  // Download processed files
  const downloadProcessedFiles = useCallback(() => {
    if (processedFiles.length === 0) {
      toast.error('No processed files to download');
      return;
    }

    processedFiles.forEach((file, index) => {
      // Create a mock download (in real implementation, this would download the processed file)
      const link = document.createElement('a');
      link.download = `processed_${file.name}`;
      link.href = '#'; // Would be the processed file URL
      link.click();
    });

    toast.success(`Downloaded ${processedFiles.length} files`);
  }, [processedFiles]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Batch Processing</h2>
              <p className="text-xs text-surface-500">Process multiple images efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={Settings}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={downloadProcessedFiles}
              disabled={processedFiles.length === 0}
            >
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* File Upload Area */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-6">
          <div
            className="border-2 border-dashed border-surface-700 rounded-lg p-8 text-center hover:border-primary-500/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              Support for JPG, PNG, WebP, AVIF formats
            </p>
            <Button variant="secondary" icon={FolderOpen}>
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Processing Queue */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Processing Queue
            </h3>
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <span>{files.length} files</span>
              <span>•</span>
              <span>{operations.length} operations</span>
            </div>
          </div>

          {/* Operations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, operations: !prev.operations }))}
                className="flex items-center gap-2 text-xs font-medium text-white"
              >
                {expandedSections.operations ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Operations ({operations.length})
              </button>
              
              <Button
                variant="ghost"
                size="icon-sm"
                icon={Plus}
                onClick={() => {/* Show operation selector */}}
              />
            </div>

            {expandedSections.operations && (
              <div className="space-y-2">
                {operations.length === 0 ? (
                  <div className="text-center py-4 text-surface-500 text-sm">
                    No operations added
                  </div>
                ) : (
                  operations.map((operation) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-2 bg-surface-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <operation.icon className="w-4 h-4 text-primary-400" />
                        <div>
                          <div className="text-sm font-medium text-white">{operation.name}</div>
                          <div className="text-xs text-surface-500">{operation.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500">{operation.estimatedTime}s</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={Trash2}
                          onClick={() => removeOperation(operation.id)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Operation Selector */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {processingOperations.map((operation) => (
                <button
                  key={operation.id}
                  onClick={() => addOperation(operation)}
                  disabled={operations.find(op => op.id === operation.id)}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all",
                    operations.find(op => op.id === operation.id)
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <operation.icon className="w-4 h-4" />
                    <div>
                      <div className="text-xs font-medium">{operation.name}</div>
                      <div className="text-[9px] text-surface-500">{operation.estimatedTime}s</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, files: !prev.files }))}
                className="flex items-center gap-2 text-xs font-medium text-white"
              >
                {expandedSections.files ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Files ({files.length})
              </button>
              
              {files.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={clearFiles}
                >
                  Clear All
                </Button>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center justify-between p-2 bg-surface-800 rounded-lg",
                      file.status === 'processing' && "border border-primary-500/30",
                      file.status === 'completed' && "border border-green-500/30",
                      file.status === 'failed' && "border border-red-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-surface-600" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{file.name}</div>
                        <div className="text-xs text-surface-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.status === 'processing' && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-primary-500 transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary-400">{Math.round(file.progress)}%</span>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      
                      {file.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        icon={Trash2}
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'processing'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Processing Controls */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Processing Controls
            </h3>
            
            {isProcessing && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-surface-500">
                  File {currentFileIndex + 1} of {files.length}
                </div>
                <div className="text-xs text-surface-500">
                  Op {currentOperationIndex + 1} of {operations.length}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-surface-500">
              <span>{Math.round(progress)}% Complete</span>
              <span>{stats.processedFiles} / {stats.totalFiles} files</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {!isProcessing ? (
              <Button
                variant="primary"
                fullWidth
                onClick={startProcessing}
                disabled={files.length === 0 || operations.length === 0}
                icon={Play}
              >
                Start Processing
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    variant="secondary"
                    onClick={pauseProcessing}
                    icon={Pause}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={resumeProcessing}
                    icon={Play}
                  >
                    Resume
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={stopProcessing}
                  icon={Square}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-surface-500 mb-1">Total Files</div>
              <div className="text-lg font-semibold text-white">{stats.totalFiles}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Processed</div>
              <div className="text-lg font-semibold text-green-400">{stats.processedFiles}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Failed</div>
              <div className="text-lg font-semibold text-red-400">{stats.failedFiles}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Est. Time</div>
              <div className="text-lg font-semibold text-blue-400">
                {formatTime(calculateEstimatedTime())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}