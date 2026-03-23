// frontend/src/components/admin/AIStatusDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Zap,
  Brain,
  Eye,
  MessageSquare,
  Wand2,
  TrendingUp,
  Clock,
  Server,
  Database,
  Wifi,
  Settings,
  BarChart3,
  Monitor,
  Thermometer,
  Gauge,
  Network,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const serviceIcons = {
  'computer-vision': Eye,
  'nlp': MessageSquare,
  'generative-ai': Wand2,
  'reinforcement-learning': TrendingUp
};

const statusColors = {
  healthy: 'text-green-400 bg-green-500/10 border-green-500/30',
  degraded: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  unhealthy: 'text-red-400 bg-red-500/10 border-red-500/30',
  unknown: 'text-gray-400 bg-gray-500/10 border-gray-500/30'
};

export default function AIStatusDashboard() {
  const [services, setServices] = useState({});
  const [systemMetrics, setSystemMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch service status
  const fetchServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/ai/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || {});
        setLastUpdate(new Date());
      } else {
        throw new Error('Failed to fetch service status');
      }
    } catch (error) {
      console.error('Error fetching service status:', error);
      toast.error('Failed to fetch service status');
    }
  }, []);

  // Fetch system metrics
  const fetchSystemMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/system/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSystemMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchServiceStatus(),
      fetchSystemMetrics()
    ]);
    setLoading(false);
  }, [fetchServiceStatus, fetchSystemMetrics]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  // Get service status
  const getServiceStatus = (service) => {
    if (!service) return 'unknown';
    if (service.status === 'ready') return 'healthy';
    if (service.status === 'loading') return 'degraded';
    if (service.status === 'error') return 'unhealthy';
    return 'unknown';
  };

  // Get overall system health
  const getSystemHealth = () => {
    const serviceStatuses = Object.values(services).map(getServiceStatus);
    const healthyCount = serviceStatuses.filter(s => s === 'healthy').length;
    const totalCount = serviceStatuses.length;

    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount > 0) return 'degraded';
    return 'unhealthy';
  };

  const systemHealth = getSystemHealth();

  return (
    <div className="min-h-screen bg-surface-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Services Dashboard</h1>
            <p className="text-surface-400">
              Monitor and manage AI/ML services in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                systemHealth === 'healthy' ? 'bg-green-400' :
                systemHealth === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              )} />
              <span className="text-sm text-surface-400 capitalize">
                {systemHealth}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Clock className="w-4 h-4" />
              <span>
                {lastUpdate ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'Never'}
              </span>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={refreshAll}
              disabled={loading}
              className={cn({ 'animate-spin': loading })}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              statusColors[systemHealth]
            )}>
              {systemHealth}
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Object.keys(services).length}
          </div>
          <div className="text-sm text-surface-400">Active Services</div>
        </div>

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-xs text-surface-500">CPU</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {systemMetrics.cpu_usage ? `${systemMetrics.cpu_usage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-surface-400">CPU Usage</div>
        </div>

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-xs text-surface-500">RAM</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {systemMetrics.memory_usage ? `${systemMetrics.memory_usage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-surface-400">Memory Usage</div>
        </div>

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-xs text-surface-500">GPU</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {systemMetrics.gpu_usage ? `${systemMetrics.gpu_usage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-surface-400">GPU Usage</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(services).map(([serviceId, service]) => {
          const Icon = serviceIcons[serviceId] || Brain;
          const status = getServiceStatus(service);
          
          return (
            <motion.div
              key={serviceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-surface-800 border rounded-xl p-6 transition-all",
                statusColors[status]
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {serviceId.replace('-', ' ')}
                    </h3>
                    <p className="text-xs text-surface-500">
                      {service.status || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {status === 'degraded' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                  {status === 'unhealthy' && <XCircle className="w-5 h-5 text-red-400" />}
                  {status === 'unknown' && <AlertTriangle className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              <div className="space-y-3">
                {service.models && (
                  <div>
                    <div className="text-xs text-surface-500 mb-2">Available Models</div>
                    <div className="flex flex-wrap gap-2">
                      {service.models.map((model) => (
                        <span
                          key={model}
                          className="px-2 py-1 bg-surface-700 rounded text-xs text-surface-300"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {service.metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(service.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs text-surface-500 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dashboard Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-surface-500 block mb-2">Auto Refresh</label>
            <Button
              variant={autoRefresh ? "primary" : "ghost"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="w-full"
            >
              {autoRefresh ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div>
            <label className="text-sm text-surface-500 block mb-2">Refresh Interval</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value={1000}>1 second</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-surface-500 block mb-2">Actions</label>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={refreshAll}
                disabled={loading}
                className="flex-1"
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                icon={Settings}
                className="flex-1"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
