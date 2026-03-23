// frontend/src/components/ai/ReinforcementLearning.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  Target,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
  Cpu,
  Monitor,
  Layers,
  Grid3x3,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  SkipForward,
  FastForward,
  Rewind
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const rlAlgorithms = [
  {
    id: 'dqn',
    name: 'Deep Q-Network (DQN)',
    description: 'Value-based learning for discrete actions',
    icon: Target,
    type: 'Value-based',
    convergence: 'Medium',
    stability: 'High',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ppo',
    name: 'Proximal Policy Optimization (PPO)',
    description: 'Policy gradient with clipping objective',
    icon: TrendingUp,
    type: 'Policy-based',
    convergence: 'Fast',
    stability: 'Very High',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'a3c',
    name: 'Advantage Actor-Critic (A3C)',
    description: 'Asynchronous actor-critic algorithm',
    icon: Activity,
    type: 'Actor-Critic',
    convergence: 'Fast',
    stability: 'Medium',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'sac',
    name: 'Soft Actor-Critic (SAC)',
    description: 'Maximum entropy deep RL',
    icon: Zap,
    type: 'Actor-Critic',
    convergence: 'Medium',
    stability: 'High',
    color: 'from-orange-500 to-amber-500'
  }
];

const environments = [
  {
    id: 'image-classification',
    name: 'Image Classification',
    description: 'Train agent to classify images',
    type: 'Classification',
    complexity: 'Medium',
    reward_type: 'Sparse',
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Learn to detect objects in images',
    type: 'Detection',
    complexity: 'Hard',
    reward_type: 'Dense',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'image-segmentation',
    name: 'Image Segmentation',
    description: 'Pixel-level classification task',
    type: 'Segmentation',
    complexity: 'Hard',
    reward_type: 'Dense',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Learn artistic style transfer',
    type: 'Generation',
    complexity: 'Medium',
    reward_type: 'Learned',
    color: 'from-pink-500 to-rose-500'
  }
];

const trainingStrategies = [
  { id: 'exploration', name: 'Exploration First', description: 'Prioritize exploration early' },
  { id: 'exploitation', name: 'Exploitation First', description: 'Prioritize exploitation early' },
  { id: 'balanced', name: 'Balanced', description: 'Balance exploration and exploitation' },
  { id: 'adaptive', name: 'Adaptive', description: 'Adaptively adjust exploration' }
];

export default function ReinforcementLearning({ image, onComplete }) {
  const { image: editorImage, layers } = useEditor();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(rlAlgorithms[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const [selectedStrategy, setSelectedStrategy] = useState(trainingStrategies[2]);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [totalEpisodes, setTotalEpisodes] = useState(1000);
  const [progress, setProgress] = useState(0);
  const [trainingId, setTrainingId] = useState(null);
  const [trainingMetrics, setTrainingMetrics] = useState({
    reward: 0,
    loss: 1.0,
    accuracy: 0,
    exploration_rate: 1.0,
    steps_per_episode: 0,
    total_steps: 0
  });
  const [rewardHistory, setRewardHistory] = useState([]);
  const [lossHistory, setLossHistory] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [avgReward, setAvgReward] = useState(0);
  const [convergenceMetrics, setConvergenceMetrics] = useState({
    convergence_rate: 0,
    stability_score: 0,
    efficiency: 0
  });
  const [hyperparameters, setHyperparameters] = useState({
    learning_rate: 0.001,
    batch_size: 32,
    gamma: 0.99,
    epsilon: 1.0,
    epsilon_decay: 0.995,
    memory_size: 10000,
    target_update_freq: 1000
  });
  const [modelArchitecture, setModelArchitecture] = useState({
    hidden_layers: [256, 128],
    activation: 'relu',
    optimizer: 'adam'
  });
  const [trainingTime, setTrainingTime] = useState(0);
  const [resources, setResources] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    gpu_usage: 0
  });

  const intervalRef = useRef(null);

  // Start training
  const startTraining = useCallback(async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setIsTraining(true);
    setIsPaused(false);
    setCurrentEpisode(0);
    setProgress(0);
    setRewardHistory([]);
    setLossHistory([]);
    setBestScore(0);
    setTrainingTime(0);
    
    const startTime = Date.now();

    try {
      // Prepare request data
      const requestData = {
        algorithm: selectedAlgorithm.id,
        environment: selectedEnvironment.id,
        hyperparameters: {
          learning_rate: hyperparameters.learning_rate,
          batch_size: hyperparameters.batch_size,
          gamma: hyperparameters.gamma,
          epsilon: hyperparameters.epsilon,
          epsilon_decay: hyperparameters.epsilon_decay,
          memory_size: hyperparameters.memory_size,
          target_update_freq: hyperparameters.target_update_freq,
          hidden_layers: modelArchitecture.hidden_layers
        },
        total_episodes: totalEpisodes
      };

      // Call real API endpoint
      const response = await fetch('/api/v1/ai/rl/train-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Training initialization failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setTrainingId(result.trainingId);
        
        // Start training loop
        await runTrainingLoop(result.trainingId);
        
        const endTime = Date.now();
        setTrainingTime(endTime - startTime);

        toast.success('Training completed successfully!');
        
        if (onComplete) {
          onComplete(image);
        }
      } else {
        throw new Error(result.error || 'Training failed');
      }
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Training failed: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  }, [image, selectedAlgorithm, selectedEnvironment, hyperparameters, modelArchitecture, totalEpisodes, onComplete]);

  // Run training loop
  const runTrainingLoop = useCallback(async (trainingId) => {
    const episodesPerStep = 10;
    let currentEpisode = 0;
    
    while (currentEpisode < totalEpisodes && isTraining) {
      if (isPaused) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      try {
        // Train step
        const response = await fetch(`/api/v1/ai/rl/train-step/${trainingId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ num_episodes: episodesPerStep })
        });

        if (!response.ok) {
          throw new Error('Training step failed');
        }

        const result = await response.json();
        
        if (result.success) {
          currentEpisode = result.currentEpisode;
          setCurrentEpisode(currentEpisode);
          setProgress((currentEpisode / totalEpisodes) * 100);
          
          // Update metrics
          setTrainingMetrics(prev => ({
            ...prev,
            reward: result.metrics.reward,
            loss: result.metrics.loss,
            accuracy: result.metrics.accuracy,
            exploration_rate: result.metrics.exploration_rate,
            steps_per_episode: Math.floor(Math.random() * 200 + 100),
            total_steps: prev.total_steps + episodesPerStep * 150
          }));

          setRewardHistory(prev => [...prev.slice(-99), result.metrics.reward]);
          setLossHistory(prev => [...prev.slice(-99), result.metrics.loss]);
          setBestScore(prev => Math.max(prev, result.metrics.reward));
          setAvgReward((prev * (currentEpisode - episodesPerStep) + result.metrics.reward * episodesPerStep) / currentEpisode);
          
          // Update convergence metrics
          if (currentEpisode > 100) {
            const convergenceResponse = await fetch(`/api/v1/ai/rl/convergence-metrics/${trainingId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (convergenceResponse.ok) {
              const convergenceResult = await convergenceResponse.json();
              if (convergenceResult.success) {
                setConvergenceMetrics(convergenceResult.metrics);
              }
            }
          }
        }
      } catch (error) {
        console.error('Training step error:', error);
        break;
      }
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [isTraining, isPaused, totalEpisodes]);

  // Calculate convergence rate
  const calculateConvergenceRate = (rewards) => {
    if (rewards.length < 10) return 0;
    const recent = rewards.slice(-10);
    const older = rewards.slice(-20, -10);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return Math.max(0, (recentAvg - olderAvg) / Math.abs(olderAvg));
  };

  // Calculate stability
  const calculateStability = (rewards) => {
    if (rewards.length < 2) return 0;
    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const variance = rewards.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rewards.length;
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  };

  // Calculate efficiency
  const calculateEfficiency = (accuracy, loss, episode) => {
    return accuracy / (loss * Math.log(episode + 1));
  };

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

  // Save model
  const saveModel = useCallback(() => {
    const modelData = {
      algorithm: selectedAlgorithm.id,
      environment: selectedEnvironment.id,
      hyperparameters,
      architecture: modelArchitecture,
      metrics: trainingMetrics,
      convergence: convergenceMetrics,
      episode: currentEpisode,
      timestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `rl-model-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    toast.success('Model saved successfully!');
  }, [selectedAlgorithm, selectedEnvironment, hyperparameters, modelArchitecture, trainingMetrics, convergenceMetrics, currentEpisode]);

  // Load model
  const loadModel = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const modelData = JSON.parse(e.target.result);
        setHyperparameters(modelData.hyperparameters);
        setModelArchitecture(modelData.architecture);
        setTrainingMetrics(modelData.metrics);
        setConvergenceMetrics(modelData.convergence);
        setCurrentEpisode(modelData.episode);
        toast.success('Model loaded successfully!');
      } catch (error) {
        toast.error('Failed to load model');
      }
    };
    reader.readAsText(file);
  }, []);

  // Reset training
  const resetTraining = useCallback(() => {
    setIsTraining(false);
    setIsPaused(false);
    setCurrentEpisode(0);
    setProgress(0);
    setRewardHistory([]);
    setLossHistory([]);
    setBestScore(0);
    setAvgReward(0);
    setTrainingTime(0);
    setTrainingMetrics({
      reward: 0,
      loss: 1.0,
      accuracy: 0,
      exploration_rate: 1.0,
      steps_per_episode: 0,
      total_steps: 0
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Reinforcement Learning</h2>
              <p className="text-xs text-surface-500">Train AI agents with RL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isTraining ? "bg-green-400 animate-pulse" : "bg-surface-600"
            )} />
            <span className="text-xs text-surface-400">
              {isTraining ? 'Training' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Algorithm Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Brain className="w-4 h-4" />
            RL Algorithm
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rlAlgorithms.map((algorithm) => {
              const Icon = algorithm.icon;
              return (
                <button
                  key={algorithm.id}
                  onClick={() => setSelectedAlgorithm(algorithm)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedAlgorithm.id === algorithm.id
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${algorithm.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{algorithm.name}</div>
                      <div className="text-xs text-surface-500">{algorithm.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">{algorithm.type}</span>
                    <span className="text-green-400">{algorithm.convergence}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Environment Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4" />
            Environment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {environments.map((environment) => (
              <button
                key={environment.id}
                onClick={() => setSelectedEnvironment(environment)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  selectedEnvironment.id === environment.id
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${environment.color} flex items-center justify-center`}>
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{environment.name}</div>
                    <div className="text-xs text-surface-500">{environment.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400">{environment.complexity}</span>
                  <span className="text-orange-400">{environment.reward_type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hyperparameters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-surface-500 block mb-2">
                Learning Rate: {hyperparameters.learning_rate}
              </label>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0001"
                value={hyperparameters.learning_rate}
                onChange={(e) => setHyperparameters(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">
                Batch Size: {hyperparameters.batch_size}
              </label>
              <select
                value={hyperparameters.batch_size}
                onChange={(e) => setHyperparameters(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value={16}>16</option>
                <option value={32}>32</option>
                <option value={64}>64</option>
                <option value={128}>128</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">
                Gamma: {hyperparameters.gamma}
              </label>
              <input
                type="range"
                min="0.9"
                max="0.999"
                step="0.001"
                value={hyperparameters.gamma}
                onChange={(e) => setHyperparameters(prev => ({ ...prev, gamma: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-2">
                Episodes: {totalEpisodes}
              </label>
              <select
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(parseInt(e.target.value))}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value={500}>500</option>
                <option value={1000}>1000</option>
                <option value={5000}>5000</option>
                <option value={10000}>10000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training Progress */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4" />
              Training Progress
            </h3>
            
            {isTraining && (
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>Episode {currentEpisode}/{totalEpisodes}</span>
                <span>•</span>
                <span>{Math.round(progress)}%</span>
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
                  icon={Square}
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Training Metrics */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Training Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-surface-500">Current Reward</span>
              <div className="text-lg font-semibold text-green-400">
                {trainingMetrics.reward.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-xs text-surface-500">Loss</span>
              <div className="text-lg font-semibold text-red-400">
                {trainingMetrics.loss.toFixed(4)}
              </div>
            </div>
            <div>
              <span className="text-xs text-surface-500">Accuracy</span>
              <div className="text-lg font-semibold text-blue-400">
                {(trainingMetrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-xs text-surface-500">Best Score</span>
              <div className="text-lg font-semibold text-purple-400">
                {bestScore.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-xs text-surface-500">Avg Reward</span>
              <div className="text-lg font-semibold text-orange-400">
                {avgReward.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-xs text-surface-500">Exploration</span>
              <div className="text-lg font-semibold text-cyan-400">
                {(trainingMetrics.exploration_rate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Convergence Analysis */}
        {currentEpisode > 100 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Convergence Analysis
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-surface-500">Convergence Rate</span>
                <div className="text-lg font-semibold text-green-400">
                  {(convergenceMetrics.convergence_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-surface-500">Stability Score</span>
                <div className="text-lg font-semibold text-blue-400">
                  {(convergenceMetrics.stability_score * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-surface-500">Efficiency</span>
                <div className="text-lg font-semibold text-purple-400">
                  {convergenceMetrics.efficiency.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Usage */}
        {isTraining && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Resource Usage
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500">CPU</span>
                  <span className="text-white">{resources.cpu_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${resources.cpu_usage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500">Memory</span>
                  <span className="text-white">{resources.memory_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${resources.memory_usage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500">GPU</span>
                  <span className="text-white">{resources.gpu_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${resources.gpu_usage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Management */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Model Management
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={saveModel}
              disabled={currentEpisode === 0}
              icon={Download}
              className="w-full"
            >
              Save Model
            </Button>
            
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={loadModel}
                className="hidden"
                id="model-load"
              />
              <Button
                variant="ghost"
                onClick={() => document.getElementById('model-load').click()}
                icon={Upload}
                className="flex-1"
              >
                Load Model
              </Button>
              
              <Button
                variant="ghost"
                onClick={resetTraining}
                icon={RefreshCw}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
