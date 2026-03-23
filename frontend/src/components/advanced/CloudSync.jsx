// frontend/src/components/advanced/CloudSync.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  HardDrive,
  FolderOpen,
  FileText,
  Settings,
  Shield,
  Zap,
  Activity,
  Users,
  Globe,
  Lock,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  MoreVertical
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const cloudProviders = [
  {
    id: 'aws',
    name: 'Amazon S3',
    description: 'Scalable cloud storage from Amazon',
    icon: Globe,
    color: 'from-orange-500 to-amber-500',
    freeStorage: '5 GB',
    paidStorage: 'Unlimited',
    features: ['Versioning', 'Encryption', 'CDN']
  },
  {
    id: 'google',
    name: 'Google Cloud Storage',
    description: 'Enterprise-grade cloud storage',
    icon: Cloud,
    color: 'from-blue-500 to-cyan-500',
    freeStorage: '15 GB',
    paidStorage: 'Unlimited',
    features: ['ML Integration', 'Analytics', 'Auto-scaling']
  },
  {
    id: 'azure',
    name: 'Azure Blob Storage',
    description: 'Microsoft cloud storage solution',
    icon: Shield,
    color: 'from-purple-500 to-pink-500',
    freeStorage: '10 GB',
    paidStorage: 'Unlimited',
    features: ['Hybrid Cloud', 'Security', 'Compliance']
  },
  {
    id: 'dropbox',
    name: 'Dropbox Business',
    description: 'Team collaboration and file sharing',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    freeStorage: '2 GB',
    paidStorage: 'Unlimited',
    features: ['Sync', 'Sharing', 'Version History']
  }
];

const syncStatuses = {
  synced: { icon: CheckCircle, color: 'text-green-400', label: 'Synced' },
  syncing: { icon: RefreshCw, color: 'text-blue-400', label: 'Syncing' },
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  error: { icon: AlertCircle, color: 'text-red-400', label: 'Error' },
  offline: { icon: CloudOff, color: 'text-surface-500', label: 'Offline' }
};

export default function CloudSync() {
  const { image, layers, addToHistory } = useEditor();
  const [selectedProvider, setSelectedProvider] = useState(cloudProviders[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [autoSync, setAutoSync] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    secretKey: '',
    bucket: '',
    region: 'us-east-1'
  });
  const [syncedFiles, setSyncedFiles] = useState([
    {
      id: '1',
      name: 'project-alpha.psd',
      size: '24.5 MB',
      modified: '2 hours ago',
      status: 'synced',
      provider: 'aws'
    },
    {
      id: '2',
      name: 'banner-design.jpg',
      size: '8.2 MB',
      modified: '1 day ago',
      status: 'synced',
      provider: 'google'
    },
    {
      id: '3',
      name: 'logo-final.png',
      size: '2.1 MB',
      modified: '3 days ago',
      status: 'pending',
      provider: 'aws'
    }
  ]);
  const [storageStats, setStorageStats] = useState({
    used: 245.7,
    total: 1000,
    files: 127,
    lastSync: new Date().toISOString()
  });

  // Connect to cloud provider
  const connectProvider = useCallback(async () => {
    setIsSyncing(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast.success(`Connected to ${selectedProvider.name}!`);
    } catch (error) {
      toast.error('Failed to connect to cloud provider');
    } finally {
      setIsSyncing(false);
    }
  }, [selectedProvider]);

  // Disconnect from cloud provider
  const disconnectProvider = useCallback(() => {
    setIsConnected(false);
    setCredentials({ apiKey: '', secretKey: '', bucket: '', region: 'us-east-1' });
    toast.success('Disconnected from cloud provider');
  }, []);

  // Sync current project
  const syncProject = useCallback(async () => {
    if (!image) {
      toast.error('No project to sync');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate sync process
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSyncProgress((i / steps) * 100);
      }

      // Add to synced files
      const newFile = {
        id: Date.now().toString(),
        name: `project-${Date.now()}.jpg`,
        size: `${(image.length * 0.000001).toFixed(2)} MB`,
        modified: 'Just now',
        status: 'synced',
        provider: selectedProvider.id
      };
      
      setSyncedFiles(prev => [newFile, ...prev]);
      setStorageStats(prev => ({
        ...prev,
        used: prev.used + parseFloat(newFile.size),
        files: prev.files + 1,
        lastSync: new Date().toISOString()
      }));

      toast.success('Project synced successfully!');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [image, selectedProvider]);

  // Download file from cloud
  const downloadFile = useCallback(async (file) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Downloaded ${file.name}`);
      
      // In real implementation, this would load the file into the editor
      if (file.name.includes('.jpg') || file.name.includes('.png')) {
        // Mock loading image
        addToHistory(image);
      }
    } catch (error) {
      toast.error('Download failed');
    }
  }, [image, addToHistory]);

  // Delete file from cloud
  const deleteFile = useCallback(async (fileId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSyncedFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted from cloud');
    } catch (error) {
      toast.error('Delete failed');
    }
  }, []);

  // Format file size
  const formatFileSize = (size) => {
    const [value, unit] = size.split(' ');
    return `${parseFloat(value).toFixed(1)} ${unit}`;
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    const statusInfo = syncStatuses[status] || syncStatuses.offline;
    const Icon = statusInfo.icon;
    return { Icon, color: statusInfo.color, label: statusInfo.label };
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cloud Sync</h2>
              <p className="text-xs text-surface-500">Secure cloud storage & sync</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-400" : "bg-surface-600"
            )} />
            <span className="text-xs text-surface-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Provider Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Cloud Provider
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cloudProviders.map((provider) => {
              const Icon = provider.icon;
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedProvider.id === provider.id
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{provider.name}</div>
                      <div className="text-xs text-surface-500">{provider.freeStorage} free</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-surface-400">{provider.description}</div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full bg-surface-700 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Connection Status
            </h3>
            
            {isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectProvider}
                icon={CloudOff}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={connectProvider}
                disabled={isSyncing}
                loading={isSyncing}
              >
                Connect
              </Button>
            )}
          </div>

          {isConnected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Connected to {selectedProvider.name}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-surface-500">Last Sync:</span>
                  <span className="text-white ml-2">
                    {new Date(storageStats.lastSync).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500">Status:</span>
                  <span className="text-green-400 ml-2">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Storage Statistics */}
        {isConnected && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage Usage
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500">Used Space</span>
                  <span className="text-white">
                    {formatFileSize(`${storageStats.used} MB`)} / {storageStats.total} MB
                  </span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-surface-500 mb-1">Files</div>
                  <div className="text-lg font-semibold text-white">{storageStats.files}</div>
                </div>
                <div>
                  <div className="text-surface-500 mb-1">Used</div>
                  <div className="text-lg font-semibold text-blue-400">
                    {formatFileSize(`${storageStats.used} MB`)}
                  </div>
                </div>
                <div>
                  <div className="text-surface-500 mb-1">Available</div>
                  <div className="text-lg font-semibold text-green-400">
                    {formatFileSize(`${storageStats.total - storageStats.used} MB`)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Controls */}
        {isConnected && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync Controls
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-surface-400">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  <span>Auto-sync on changes</span>
                </label>
                
                <label className="flex items-center gap-2 text-xs text-surface-400">
                  <input
                    type="checkbox"
                    checked={encryptionEnabled}
                    onChange={(e) => setEncryptionEnabled(e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  <span>End-to-end encryption</span>
                </label>
              </div>
              
              <Button
                variant="primary"
                fullWidth
                onClick={syncProject}
                disabled={isSyncing || !image}
                loading={isSyncing}
                icon={isSyncing ? RefreshCw : Upload}
              >
                {isSyncing ? 'Syncing...' : 'Sync Current Project'}
              </Button>
              
              {isSyncing && (
                <div className="space-y-2">
                  <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-surface-500">
                    {Math.round(syncProgress)}% complete
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Synced Files */}
        {isConnected && syncedFiles.length > 0 && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Cloud Files
            </h3>
            
            <div className="space-y-2">
              {syncedFiles.map((file) => {
                const statusInfo = getStatusInfo(file.status);
                const StatusIcon = statusInfo.Icon;
                const provider = cloudProviders.find(p => p.id === file.provider);
                const ProviderIcon = provider?.icon || Cloud;
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-surface-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-surface-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{file.name}</div>
                        <div className="flex items-center gap-2 text-xs text-surface-500">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.modified}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <ProviderIcon className="w-3 h-3" />
                            <span>{provider?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={Download}
                          onClick={() => downloadFile(file)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={Trash2}
                          onClick={() => deleteFile(file.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </h3>
          
          <div className="space-y-3">
            <div>
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-xs text-surface-400">API Credentials</span>
                <Key className="w-4 h-4 text-surface-500" />
              </button>
              
              {showCredentials && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="API Key"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500"
                  />
                  <input
                    type="password"
                    placeholder="Secret Key"
                    value={credentials.secretKey}
                    onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500"
                  />
                  <input
                    type="text"
                    placeholder="Bucket Name"
                    value={credentials.bucket}
                    onChange={(e) => setCredentials(prev => ({ ...prev, bucket: e.target.value }))}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Lock className="w-3 h-3" />
              <span>All connections are encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}