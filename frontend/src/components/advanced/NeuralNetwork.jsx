// frontend/src/components/advanced/NeuralNetwork.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Layers,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  FileText,
  Database
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const networkArchitectures = [
  {
    id: 'cnn',
    name: 'Convolutional Neural Network',
    description: 'Deep CNN for image classification and feature extraction',
    layers: 8,
    parameters: '2.3M',
    accuracy: 94.2,
    icon: Layers,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'gan',
    name: 'Generative Adversarial Network',
    description: 'Generate realistic images and artistic creations',
    layers: 12,
    parameters: '8.7M',
    accuracy: 89.7,
    icon: Zap,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'transformer',
    name: 'Vision Transformer',
    description: 'Attention-based image processing and analysis',
    layers: 6,
    parameters: '5.1M',
    accuracy: 96.8,
    icon: Target,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'unet',
    name: 'U-Net Segmentation',
    description: 'Semantic segmentation and image segmentation',
    layers: 10,
    parameters: '3.4M',
    accuracy: 91.3,
    icon: Activity,
    color: 'from-orange-500 to-amber-500'
  }
];

const trainingDatasets = [
  { id: 'imagenet', name: 'ImageNet', size: '1.2M', classes: 1000, type: 'classification' },
  { id: 'coco', name: 'COCO', size: '330K', classes: 80, type: 'detection' },
  { id: 'custom', name: 'Custom Dataset', size: 'Variable', classes: 'Custom', type: 'custom' }
];

export default function NeuralNetwork() {
  const { image } = useEditor();
  const [selectedNetwork, setSelectedNetwork] = useState(networkArchitectures[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(2.3);
  const [accuracy, setAccuracy] = useState(12.5);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [selectedDataset, setSelectedDataset] = useState(trainingDatasets[0]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [networkVisualization, setNetworkVisualization] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [savedModels, setSavedModels] = useState([]);
  const canvasRef = useRef(null);

  // Simulate training process
  const startTraining = useCallback(async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setIsTraining(true);
    setIsPaused(false);
    setTrainingProgress(0);
    setEpoch(0);
    setLoss(2.3);
    setAccuracy(12.5);
    setTrainingHistory([]);

    try {
      const totalEpochs = 50;
      
      for (let currentEpoch = 1; currentEpoch <= totalEpochs; currentEpoch++) {
        if (!isTraining) break;
        
        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!isTraining) break;
        }
        
        // Simulate epoch training
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newLoss = Math.max(0.1, loss * (0.95 + Math.random() * 0.05));
        const newAccuracy = Math.min(99.5, accuracy + (Math.random() * 2 + 1));
        
        setEpoch(currentEpoch);
        setLoss(newLoss);
        setAccuracy(newAccuracy);
        setTrainingProgress((currentEpoch / totalEpochs) * 100);
        
        setTrainingHistory(prev => [...prev, {
          epoch: currentEpoch,
          loss: newLoss,
          accuracy: newAccuracy,
          timestamp: Date.now()
        }]);
        
        // Update network visualization
        if (networkVisualization) {
          drawNetworkVisualization(currentEpoch / totalEpochs);
        }
      }
      
      if (isTraining) {
        toast.success('Training completed successfully!');
        setIsTraining(false);
        
        // Save model
        const model = {
          id: Date.now().toString(),
          name: `${selectedNetwork.name}_${Date.now()}`,
          network: selectedNetwork.id,
          accuracy: accuracy,
          loss: loss,
          epochs: epoch,
          dataset: selectedDataset.id,
          timestamp: Date.now()
        };
        setSavedModels(prev => [...prev, model]);
      }
    } catch (error) {
      toast.error('Training failed');
      setIsTraining(false);
    }
  }, [image, selectedNetwork, selectedDataset, loss, accuracy, isTraining, isPaused, networkVisualization]);

  // Pause training
  const pauseTraining = useCallback(() => {
    setIsPaused(true);
    toast.info('Training paused');
  }, []);

  // Resume training
  const resumeTraining = useCallback(() => {
    setIsPaused(false);
    toast.info('Training resumed');
  }, []);

  // Stop training
  const stopTraining = useCallback(() => {
    setIsTraining(false);
    setIsPaused(false);
    toast.info('Training stopped');
  }, []);

  // Draw network visualization
  const drawNetworkVisualization = useCallback((progress) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw neural network layers
    const layers = selectedNetwork.layers;
    const layerWidth = canvas.width / (layers + 1);
    const neuronsPerLayer = [3, 8, 16, 32, 16, 8, 4, 2]; // Example architecture
    
    for (let layer = 0; layer < layers; layer++) {
      const x = layerWidth * (layer + 1);
      const neurons = neuronsPerLayer[layer] || 8;
      
      for (let neuron = 0; neuron < neurons; neuron++) {
        const y = (canvas.height / (neurons + 1)) * (neuron + 1);
        
        // Draw connections
        if (layer > 0) {
          const prevNeurons = neuronsPerLayer[layer - 1] || 8;
          for (let prevNeuron = 0; prevNeuron < prevNeurons; prevNeuron++) {
            const prevX = layerWidth * layer;
            const prevY = (canvas.height / (prevNeurons + 1)) * (prevNeuron + 1);
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 + progress * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        // Draw neuron
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99, 102, 241, ${0.5 + progress * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [selectedNetwork]);

  // Export model
  const exportModel = useCallback(() => {
    const modelData = {
      network: selectedNetwork,
      training: {
        epochs: epoch,
        loss: loss,
        accuracy: accuracy,
        history: trainingHistory
      },
      hyperparameters: {
        learningRate,
        batchSize,
        dataset: selectedDataset
      }
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `neural-model-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    toast.success('Model exported successfully!');
  }, [selectedNetwork, epoch, loss, accuracy, trainingHistory, learningRate, batchSize, selectedDataset]);

  // Load model
  const loadModel = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const modelData = JSON.parse(e.target.result);
        toast.success('Model loaded successfully!');
        // Apply loaded model settings
        setLoss(modelData.training.loss);
        setAccuracy(modelData.training.accuracy);
        setEpoch(modelData.training.epochs);
        setTrainingHistory(modelData.training.history);
      } catch (error) {
        toast.error('Failed to load model');
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Neural Networks</h2>
              <p className="text-xs text-surface-500">Deep Learning Model Training</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={networkVisualization ? EyeOff : Eye}
              onClick={() => setNetworkVisualization(!networkVisualization)}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={exportModel}
              disabled={epoch === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Network Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Network Architecture
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {networkArchitectures.map((network) => {
              const Icon = network.icon;
              return (
                <button
                  key={network.id}
                  onClick={() => setSelectedNetwork(network)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedNetwork.id === network.id
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${network.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{network.name}</div>
                      <div className="text-xs text-surface-500">{network.layers} layers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-surface-500">{network.parameters} params</span>
                    <span className="text-green-400">{network.accuracy}% acc</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Training Configuration */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Training Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-surface-500 block mb-2">Dataset</label>
              <select
                value={selectedDataset.id}
                onChange={(e) => setSelectedDataset(trainingDatasets.find(d => d.id === e.target.value))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {trainingDatasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Learning Rate</label>
              <input
                type="number"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                step="0.0001"
                min="0.0001"
                max="0.1"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Batch Size</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value={16}>16</option>
                <option value={32}>32</option>
                <option value={64}>64</option>
                <option value={128}>128</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">Model Import</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={loadModel}
                  className="hidden"
                  id="model-import"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Upload}
                  onClick={() => document.getElementById('model-import').click()}
                  className="flex-1"
                >
                  Import Model
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        {networkVisualization && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Network Visualization
            </h3>
            
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full bg-surface-900 rounded-lg"
            />
          </div>
        )}

        {/* Training Progress */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Training Progress
            </h3>
            
            {isTraining && (
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>Epoch {epoch}/50</span>
                <span>•</span>
                <span>{Math.round(trainingProgress)}%</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-surface-500 mb-1">Loss</div>
              <div className="text-lg font-semibold text-red-400">{loss.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Accuracy</div>
              <div className="text-lg font-semibold text-green-400">{accuracy.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Learning Rate</div>
              <div className="text-lg font-semibold text-blue-400">{learningRate}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Batch Size</div>
              <div className="text-lg font-semibold text-purple-400">{batchSize}</div>
            </div>
          </div>

          {/* Training Controls */}
          <div className="flex items-center gap-2">
            {!isTraining ? (
              <Button
                variant="primary"
                fullWidth
                onClick={startTraining}
                disabled={!image}
                icon={Play}
              >
                Start Training
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    variant="secondary"
                    onClick={pauseTraining}
                    icon={Pause}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={resumeTraining}
                    icon={Play}
                  >
                    Resume
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={stopTraining}
                  icon={RotateCcw}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Training History */}
        {trainingHistory.length > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Training History
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trainingHistory.slice(-10).reverse().map((record, index) => (
                <div
                  key={record.timestamp}
                  className="flex items-center justify-between p-2 bg-surface-800 rounded-lg text-xs"
                >
                  <span className="text-surface-400">Epoch {record.epoch}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-red-400">Loss: {record.loss.toFixed(4)}</span>
                    <span className="text-green-400">Acc: {record.accuracy.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Models */}
        {savedModels.length > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Saved Models
            </h3>
            
            <div className="space-y-2">
              {savedModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-2 bg-surface-800 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{model.name}</div>
                    <div className="text-xs text-surface-500">
                      {model.network} • {model.accuracy.toFixed(2)}% accuracy
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      icon={Download}
                      onClick={() => {/* Download model */}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
