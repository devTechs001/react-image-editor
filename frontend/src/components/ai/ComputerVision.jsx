// frontend/src/components/ai/ComputerVision.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Scan,
  Target,
  Zap,
  Camera,
  Layers,
  Grid3x3,
  Activity,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  RefreshCw,
  Maximize2,
  Move,
  Crop,
  Focus,
  Aperture,
  Monitor,
  Cpu,
  Database,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const visionTasks = [
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Identify and locate objects in images',
    icon: Target,
    models: ['YOLOv8', 'Faster R-CNN', 'SSD', 'EfficientDet'],
    accuracy: 94.5,
    speed: 'Real-time',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'semantic-segmentation',
    name: 'Semantic Segmentation',
    description: 'Pixel-level object classification',
    icon: Layers,
    models: ['DeepLab', 'U-Net', 'PSPNet', 'Mask R-CNN'],
    accuracy: 92.3,
    speed: 'Fast',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'face-analysis',
    name: 'Face Analysis',
    description: 'Face detection, recognition, and attribute analysis',
    icon: Eye,
    models: ['FaceNet', 'ArcFace', 'DeepFace', 'FaceBoxes'],
    accuracy: 97.8,
    speed: 'Real-time',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'pose-estimation',
    name: 'Pose Estimation',
    description: 'Human body pose and keypoint detection',
    icon: Activity,
    models: ['OpenPose', 'PoseNet', 'HRNet', 'MediaPipe'],
    accuracy: 89.7,
    speed: 'Real-time',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'ocr',
    name: 'OCR - Text Recognition',
    description: 'Extract text from images and documents',
    icon: FileText,
    models: ['Tesseract', 'EasyOCR', 'PaddleOCR', 'TrOCR'],
    accuracy: 96.2,
    speed: 'Fast',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'depth-estimation',
    name: 'Depth Estimation',
    description: 'Predict depth maps from 2D images',
    icon: Grid3x3,
    models: ['MiDaS', 'DPT', 'AdaBins', 'Depth Anything'],
    accuracy: 87.4,
    speed: 'Medium',
    color: 'from-red-500 to-rose-500'
  }
];

const preprocessingOptions = [
  { id: 'resize', name: 'Resize', description: 'Resize image to optimal size' },
  { id: 'normalize', name: 'Normalize', description: 'Normalize pixel values' },
  { id: 'enhance', name: 'Enhance', description: 'Enhance image quality' },
  { id: 'denoise', name: 'Denoise', description: 'Remove noise from image' }
];

export default function ComputerVision({ image, onComplete }) {
  const [selectedTask, setSelectedTask] = useState(visionTasks[0]);
  const [selectedModel, setSelectedModel] = useState(visionTasks[0].models[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [preprocessing, setPreprocessing] = useState([]);
  const [confidence, setConfidence] = useState(0.5);
  const [showOverlay, setShowOverlay] = useState(true);
  const [detectionResults, setDetectionResults] = useState([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [modelMetrics, setModelMetrics] = useState({
    inferenceTime: 0,
    memoryUsage: 0,
    gpuUtilization: 0
  });
  const canvasRef = useRef(null);

  // Process image with selected vision task
  const processImage = useCallback(async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setProgress(0);
    setResults(null);
    setDetectionResults([]);
    
    const startTime = Date.now();

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', image);
      formData.append('confidence', confidence);
      formData.append('model', selectedModel);

      // Call real API endpoint
      const response = await fetch(`/api/v1/ai/vision/${selectedTask.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setResults(result);
        setDetectionResults(result.detections || []);
        
        const endTime = Date.now();
        setProcessingTime(endTime - startTime);
        
        // Draw results on canvas
        if (canvasRef.current && result.detections) {
          drawDetections(result.detections);
        }

        toast.success(`${selectedTask.name} completed successfully!`);
        
        if (onComplete) {
          onComplete(result.processedImage);
        }
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Processing failed: ' + error.message);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, [image, selectedTask, selectedModel, confidence, isProcessing, isPaused, onComplete]);

  // Generate mock results based on task type
  const generateMockResults = (taskId) => {
    const baseResults = {
      taskId,
      modelName: selectedModel,
      confidence,
      processingTime: processingTime,
      timestamp: Date.now()
    };

    switch (taskId) {
      case 'object-detection':
        return {
          ...baseResults,
          detections: [
            { id: 1, class: 'person', confidence: 0.95, bbox: [100, 100, 200, 400] },
            { id: 2, class: 'car', confidence: 0.87, bbox: [300, 200, 150, 100] },
            { id: 3, class: 'dog', confidence: 0.92, bbox: [500, 300, 80, 120] }
          ],
          totalObjects: 3,
          classes: ['person', 'car', 'dog']
        };
      
      case 'semantic-segmentation':
        return {
          ...baseResults,
          segments: [
            { id: 1, class: 'background', color: '#808080', percentage: 45.2 },
            { id: 2, class: 'person', color: '#00ff00', percentage: 23.8 },
            { id: 3, class: 'car', color: '#0000ff', percentage: 15.3 },
            { id: 4, class: 'road', color: '#666666', percentage: 15.7 }
          ],
          totalSegments: 4
        };
      
      case 'face-analysis':
        return {
          ...baseResults,
          faces: [
            {
              id: 1,
              bbox: [150, 120, 180, 220],
              confidence: 0.98,
              attributes: {
                age: 28,
                gender: 'female',
                emotion: 'happy',
                glasses: false,
                mask: false
              }
            }
          ],
          totalFaces: 1
        };
      
      case 'pose-estimation':
        return {
          ...baseResults,
          poses: [
            {
              id: 1,
              bbox: [120, 100, 240, 400],
              confidence: 0.91,
              keypoints: generateKeypoints()
            }
          ],
          totalPoses: 1
        };
      
      case 'ocr':
        return {
          ...baseResults,
          textBlocks: [
            { id: 1, text: 'Hello World', confidence: 0.96, bbox: [50, 50, 200, 30] },
            { id: 2, text: 'Computer Vision', confidence: 0.94, bbox: [50, 90, 250, 30] },
            { id: 3, text: 'AI Technology', confidence: 0.92, bbox: [50, 130, 180, 30] }
          ],
          totalWords: 6,
          languages: ['en']
        };
      
      case 'depth-estimation':
        return {
          ...baseResults,
          depthMap: 'generated_depth_map.png',
          minDepth: 0.1,
          maxDepth: 10.0,
          averageDepth: 3.2
        };
      
      default:
        return baseResults;
    }
  };

  // Generate mock keypoints for pose estimation
  const generateKeypoints = () => {
    const keypointNames = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 
                          'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                          'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                          'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
    
    return keypointNames.map((name, index) => ({
      name,
      x: 180 + Math.random() * 120 - 60,
      y: 200 + index * 15 + Math.random() * 10 - 5,
      confidence: Math.random() * 0.3 + 0.7
    }));
  };

  // Draw detections on canvas
  const drawDetections = useCallback((detections) => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (showOverlay) {
        detections.forEach(detection => {
          const [x, y, width, height] = detection.bbox;
          
          // Draw bounding box
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // Draw label
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(x, y - 25, 100, 25);
          ctx.fillStyle = '#000000';
          ctx.font = '14px Arial';
          ctx.fillText(`${detection.class} ${(detection.confidence * 100).toFixed(1)}%`, x + 5, y - 8);
        });
      }
    };
    
    img.src = image;
  }, [image, showOverlay]);

  // Export results
  const exportResults = useCallback(() => {
    if (!results) {
      toast.error('No results to export');
      return;
    }

    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `vision-results-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    toast.success('Results exported successfully!');
  }, [results]);

  // Reset processing
  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    setProgress(0);
    setResults(null);
    setDetectionResults([]);
    setProcessingTime(0);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Computer Vision</h2>
              <p className="text-xs text-surface-500">Advanced AI vision analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={showOverlay ? Eye : EyeOff}
              onClick={() => setShowOverlay(!showOverlay)}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={exportResults}
              disabled={!results}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Task Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4" />
            Vision Task
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visionTasks.map((task) => {
              const Icon = task.icon;
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedTask.id === task.id
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${task.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{task.name}</div>
                      <div className="text-xs text-surface-500">{task.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">{task.accuracy}% acc</span>
                    <span className="text-blue-400">{task.speed}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Model Selection
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {selectedTask.models.map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "p-2 rounded-lg border text-xs transition-all",
                  selectedModel === model
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-500 block mb-2">
                Confidence Threshold: {(confidence * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Preprocessing</label>
              <div className="grid grid-cols-2 gap-2">
                {preprocessingOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={preprocessing.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessing(prev => [...prev, option.id]);
                        } else {
                          setPreprocessing(prev => prev.filter(id => id !== option.id));
                        }
                      }}
                      className="w-3 h-3 rounded"
                    />
                    <span>{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Processing Controls */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4" />
              Processing
            </h3>
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>{Math.round(progress)}%</span>
                <span>•</span>
                <span>{processingTime}ms</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isProcessing ? (
              <Button
                variant="primary"
                fullWidth
                onClick={processImage}
                disabled={!image}
                icon={Play}
              >
                Start Analysis
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    variant="secondary"
                    onClick={() => setIsPaused(true)}
                    icon={Pause}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setIsPaused(false)}
                    icon={Play}
                  >
                    Resume
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={resetProcessing}
                  icon={Square}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4"
            >
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Analysis Results
              </h3>
              
              {/* Results Display based on task type */}
              {selectedTask.id === 'object-detection' && results.detections && (
                <div className="space-y-2">
                  <div className="text-xs text-surface-500">
                    Detected {results.totalObjects} objects
                  </div>
                  {results.detections.map((detection) => (
                    <div
                      key={detection.id}
                      className="flex items-center justify-between p-2 bg-surface-800 rounded-lg text-xs"
                    >
                      <span className="text-white">{detection.class}</span>
                      <span className="text-green-400">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTask.id === 'semantic-segmentation' && results.segments && (
                <div className="space-y-2">
                  <div className="text-xs text-surface-500">
                    {results.totalSegments} segments identified
                  </div>
                  {results.segments.map((segment) => (
                    <div
                      key={segment.id}
                      className="flex items-center justify-between p-2 bg-surface-800 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-white">{segment.class}</span>
                      </div>
                      <span className="text-blue-400">
                        {segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Model Metrics */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-surface-500">Inference</span>
                  <div className="text-white font-semibold">
                    {modelMetrics.inferenceTime.toFixed(1)}ms
                  </div>
                </div>
                <div>
                  <span className="text-surface-500">Memory</span>
                  <div className="text-white font-semibold">
                    {(modelMetrics.memoryUsage / 1024).toFixed(1)}GB
                  </div>
                </div>
                <div>
                  <span className="text-surface-500">GPU</span>
                  <div className="text-white font-semibold">
                    {modelMetrics.gpuUtilization.toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas for visualization */}
        {image && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Visualization</h3>
            <canvas
              ref={canvasRef}
              className="w-full max-w-md mx-auto border border-surface-700 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
