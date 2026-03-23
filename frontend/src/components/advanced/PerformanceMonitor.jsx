// frontend/src/components/advanced/PerformanceMonitor.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Monitor,
  Database,
  Globe,
  Shield,
  Target,
  Gauge,
  Timer,
  Play,
  Pause,
  Package
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const performanceMetrics = [
  { id: 'cpu', name: 'CPU Usage', icon: Cpu, unit: '%', max: 100, color: 'from-blue-500 to-cyan-500' },
  { id: 'memory', name: 'Memory', icon: Package, unit: 'MB', max: 16384, color: 'from-purple-500 to-pink-500' },
  { id: 'gpu', name: 'GPU', icon: Monitor, unit: '%', max: 100, color: 'from-green-500 to-emerald-500' },
  { id: 'storage', name: 'Storage I/O', icon: HardDrive, unit: 'MB/s', max: 1000, color: 'from-orange-500 to-amber-500' },
  { id: 'network', name: 'Network', icon: Wifi, unit: 'Mbps', max: 1000, color: 'from-indigo-500 to-blue-500' },
  { id: 'render', name: 'Render Time', icon: Timer, unit: 'ms', max: 16, color: 'from-red-500 to-rose-500' }
];

export default function PerformanceMonitor() {
  const { image, layers } = useEditor();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(1000);
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [historyLength, setHistoryLength] = useState(60);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [performanceHistory, setPerformanceHistory] = useState({});
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 45,
    memory: 8192,
    gpu: 78,
    storage: 234,
    network: 125,
    render: 12
  });
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'CPU usage above 80%', timestamp: Date.now() - 300000 },
    { id: 2, type: 'info', message: 'Memory optimization completed', timestamp: Date.now() - 600000 }
  ]);
  const [optimizations, setOptimizations] = useState([
    { id: 'cache', name: 'Clear Cache', description: 'Clear temporary files and cache', impact: 'medium' },
    { id: 'compress', name: 'Compress Layers', description: 'Reduce memory usage by compressing layers', impact: 'high' },
    { id: 'quality', name: 'Reduce Quality', description: 'Lower preview quality for better performance', impact: 'high' },
    { id: 'hardware', name: 'Hardware Acceleration', description: 'Enable GPU acceleration', impact: 'high' }
  ]);
  const intervalRef = useRef(null);

  // Initialize performance history
  useEffect(() => {
    const initialHistory = {};
    performanceMetrics.forEach(metric => {
      initialHistory[metric.id] = Array(historyLength).fill(0);
    });
    setPerformanceHistory(initialHistory);
  }, [historyLength]);

  // Simulate performance monitoring
  useEffect(() => {
    if (isMonitoring && realTimeUpdates) {
      intervalRef.current = setInterval(() => {
        const newMetrics = {
          cpu: Math.min(100, Math.max(0, currentMetrics.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.min(16384, Math.max(0, currentMetrics.memory + (Math.random() - 0.5) * 500)),
          gpu: Math.min(100, Math.max(0, currentMetrics.gpu + (Math.random() - 0.5) * 8)),
          storage: Math.min(1000, Math.max(0, currentMetrics.storage + (Math.random() - 0.5) * 50)),
          network: Math.min(1000, Math.max(0, currentMetrics.network + (Math.random() - 0.5) * 20)),
          render: Math.min(16, Math.max(0, currentMetrics.render + (Math.random() - 0.5) * 2))
        };
        
        setCurrentMetrics(newMetrics);
        
        // Update history
        setPerformanceHistory(prev => {
          const updated = { ...prev };
          Object.keys(newMetrics).forEach(key => {
            if (updated[key]) {
              updated[key] = [...updated[key].slice(1), newMetrics[key]];
            }
          });
          return updated;
        });
        
        // Check for alerts
        if (alertsEnabled) {
          checkAlerts(newMetrics);
        }
      }, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, realTimeUpdates, updateInterval, currentMetrics, alertsEnabled]);

  // Check for performance alerts
  const checkAlerts = useCallback((metrics) => {
    const newAlerts = [];
    
    if (metrics.cpu > 80) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        message: `CPU usage at ${metrics.cpu.toFixed(1)}%`,
        timestamp: Date.now()
      });
    }
    
    if (metrics.memory > 12000) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        message: `Memory usage at ${(metrics.memory / 1024).toFixed(1)}GB`,
        timestamp: Date.now()
      });
    }
    
    if (metrics.render > 14) {
      newAlerts.push({
        id: Date.now(),
        type: 'error',
        message: `Render time ${metrics.render.toFixed(1)}ms - performance degraded`,
        timestamp: Date.now()
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  }, []);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      toast.success('Performance monitoring started');
    } else {
      toast.info('Performance monitoring stopped');
    }
  }, [isMonitoring]);

  // Apply optimization
  const applyOptimization = useCallback(async (optimizationId) => {
    const optimization = optimizations.find(opt => opt.id === optimizationId);
    if (!optimization) return;
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update metrics based on optimization
      setCurrentMetrics(prev => {
        const updated = { ...prev };
        
        switch (optimizationId) {
          case 'cache':
            updated.memory = Math.max(0, prev.memory - 1024);
            break;
          case 'compress':
            updated.memory = Math.max(0, prev.memory - 2048);
            break;
          case 'quality':
            updated.render = Math.max(0, prev.render - 2);
            updated.gpu = Math.max(0, prev.gpu - 10);
            break;
          case 'hardware':
            updated.render = Math.max(0, prev.render - 4);
            updated.gpu = Math.max(0, prev.gpu - 20);
            break;
        }
        
        return updated;
      });
      
      toast.success(`${optimization.name} completed successfully!`);
    } catch (error) {
      toast.error('Optimization failed');
    }
  }, [optimizations]);

  // Export performance data
  const exportData = useCallback(() => {
    const data = {
      timestamp: Date.now(),
      currentMetrics,
      performanceHistory,
      alerts,
      systemInfo: {
        imageLoaded: !!image,
        layerCount: layers?.length || 0,
        monitoringDuration: isMonitoring ? 'Active' : 'Inactive'
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `performance-data-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    toast.success('Performance data exported!');
  }, [currentMetrics, performanceHistory, alerts, image, layers, isMonitoring]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    toast.success('Alerts cleared');
  }, []);

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    const weights = { cpu: 0.2, memory: 0.2, gpu: 0.2, storage: 0.15, network: 0.15, render: 0.1 };
    let score = 100;
    
    Object.keys(weights).forEach(key => {
      const metric = performanceMetrics.find(m => m.id === key);
      const value = currentMetrics[key];
      const percentage = (value / metric.max) * 100;
      score -= (percentage * weights[key]);
    });
    
    return Math.max(0, Math.min(100, score));
  }, [currentMetrics]);

  // Render mini chart
  const renderMiniChart = useCallback((data, color) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={color}
        />
      </svg>
    );
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Performance Monitor</h2>
              <p className="text-xs text-surface-500">Real-time system performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMonitoring ? "bg-green-400 animate-pulse" : "bg-surface-600"
            )} />
            <span className="text-xs text-surface-400">
              {isMonitoring ? 'Monitoring' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Performance Score */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Performance Score
            </h3>
            
            <Button
              variant={isMonitoring ? "secondary" : "primary"}
              size="sm"
              onClick={toggleMonitoring}
              icon={isMonitoring ? Pause : Play}
            >
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-surface-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - getPerformanceScore() / 100)}`}
                  className={cn(
                    "transition-all duration-500",
                    getPerformanceScore() > 80 ? "text-green-400" :
                    getPerformanceScore() > 60 ? "text-yellow-400" : "text-red-400"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {Math.round(getPerformanceScore())}
                </span>
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500">Status</span>
                <span className={cn(
                  "font-medium",
                  getPerformanceScore() > 80 ? "text-green-400" :
                  getPerformanceScore() > 60 ? "text-yellow-400" : "text-red-400"
                )}>
                  {getPerformanceScore() > 80 ? 'Excellent' :
                   getPerformanceScore() > 60 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500">CPU</span>
                <span className="text-white">{currentMetrics.cpu.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500">Memory</span>
                <span className="text-white">{(currentMetrics.memory / 1024).toFixed(1)}GB</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500">Render</span>
                <span className="text-white">{currentMetrics.render.toFixed(1)}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            const value = currentMetrics[metric.id];
            const percentage = (value / metric.max) * 100;
            const history = performanceHistory[metric.id] || [];
            
            return (
              <div
                key={metric.id}
                className={cn(
                  "bg-editor-card border border-editor-border rounded-xl p-4 cursor-pointer transition-all",
                  selectedMetric === metric.id
                    ? "ring-2 ring-primary-500"
                    : "hover:border-surface-600"
                )}
                onClick={() => setSelectedMetric(metric.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-surface-400" />
                    <span className="text-xs font-medium text-white">{metric.name}</span>
                  </div>
                  <span className="text-xs text-surface-500">
                    {value.toFixed(1)}{metric.unit}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", `bg-gradient-to-r ${metric.color}`)}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  
                  <div className="h-8">
                    {history.length > 0 && renderMiniChart(history, 'text-primary-400')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Metric Detail */}
        {selectedMetric && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              {performanceMetrics.find(m => m.id === selectedMetric)?.name} Details
            </h3>
            
            <div className="h-32 mb-4">
              {performanceHistory[selectedMetric] && renderMiniChart(performanceHistory[selectedMetric], 'text-primary-400')}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-surface-500">Current</span>
                <div className="text-lg font-semibold text-white">
                  {currentMetrics[selectedMetric].toFixed(1)}
                </div>
              </div>
              <div>
                <span className="text-surface-500">Average</span>
                <div className="text-lg font-semibold text-blue-400">
                  {(performanceHistory[selectedMetric]?.reduce((a, b) => a + b, 0) / (performanceHistory[selectedMetric]?.length || 1)).toFixed(1)}
                </div>
              </div>
              <div>
                <span className="text-surface-500">Peak</span>
                <div className="text-lg font-semibold text-red-400">
                  {Math.max(...(performanceHistory[selectedMetric] || [0])).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Optimizations */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Optimizations
          </h3>
          
          <div className="space-y-2">
            {optimizations.map((optimization) => (
              <div
                key={optimization.id}
                className="flex items-center justify-between p-3 bg-surface-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{optimization.name}</div>
                  <div className="text-xs text-surface-500">{optimization.description}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    optimization.impact === 'high' ? "bg-red-500/20 text-red-400" :
                    optimization.impact === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-green-500/20 text-green-400"
                  )}>
                    {optimization.impact} impact
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyOptimization(optimization.id)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Performance Alerts
              </h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAlerts}
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-xs",
                    alert.type === 'error' ? "bg-red-500/10 text-red-400" :
                    alert.type === 'warning' ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-blue-500/10 text-blue-400"
                  )}
                >
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-1">{alert.message}</span>
                  <span className="text-surface-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Monitor Settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-surface-400">
                <input
                  type="checkbox"
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  className="w-3 h-3 rounded"
                />
                <span>Real-time Updates</span>
              </label>
              
              <select
                value={updateInterval}
                onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value={500}>500ms</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-surface-400">
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                  className="w-3 h-3 rounded"
                />
                <span>Performance Alerts</span>
              </label>
              
              <select
                value={historyLength}
                onChange={(e) => setHistoryLength(parseInt(e.target.value))}
                className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value={30}>30 points</option>
                <option value={60}>60 points</option>
                <option value={120}>120 points</option>
              </select>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={exportData}
              icon={Download}
              className="w-full"
            >
              Export Performance Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
