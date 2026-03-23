// frontend/src/components/advanced/APIIntegration.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Globe,
  Key,
  Zap,
  Play,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Terminal,
  Database,
  Cloud,
  Shield,
  FileJson,
  TestTube,
  Rocket,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Link,
  Unlink,
  CheckCircle
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const apiEndpoints = [
  {
    id: 'enhance',
    name: 'Image Enhancement',
    method: 'POST',
    path: '/api/v1/enhance',
    description: 'Enhance image quality using AI algorithms',
    parameters: [
      { name: 'image', type: 'file', required: true, description: 'Image to enhance' },
      { name: 'quality', type: 'number', required: false, description: 'Enhancement quality (1-100)', default: 80 },
      { name: 'model', type: 'string', required: false, description: 'AI model to use', default: 'auto' }
    ],
    response: {
      enhanced_image: 'string',
      processing_time: 'number',
      model_used: 'string'
    }
  },
  {
    id: 'upscale',
    name: 'Image Upscaling',
    method: 'POST',
    path: '/api/v1/upscale',
    description: 'Upscale image resolution using super-resolution',
    parameters: [
      { name: 'image', type: 'file', required: true, description: 'Image to upscale' },
      { name: 'scale', type: 'number', required: false, description: 'Upscale factor (2-4)', default: 2 },
      { name: 'model', type: 'string', required: false, description: 'Upscaling model', default: 'esrgan' }
    ],
    response: {
      upscaled_image: 'string',
      original_size: 'object',
      new_size: 'object',
      processing_time: 'number'
    }
  },
  {
    id: 'detect',
    name: 'Object Detection',
    method: 'POST',
    path: '/api/v1/detect',
    description: 'Detect objects and faces in images',
    parameters: [
      { name: 'image', type: 'file', required: true, description: 'Image to analyze' },
      { name: 'threshold', type: 'number', required: false, description: 'Detection confidence threshold', default: 0.5 },
      { name: 'types', type: 'array', required: false, description: 'Object types to detect', default: ['all'] }
    ],
    response: {
      detections: 'array',
      confidence_scores: 'array',
      bounding_boxes: 'array'
    }
  },
  {
    id: 'generate',
    name: 'Image Generation',
    method: 'POST',
    path: '/api/v1/generate',
    description: 'Generate images from text prompts',
    parameters: [
      { name: 'prompt', type: 'string', required: true, description: 'Text description of image to generate' },
      { name: 'width', type: 'number', required: false, description: 'Image width', default: 512 },
      { name: 'height', type: 'number', required: false, description: 'Image height', default: 512 },
      { name: 'steps', type: 'number', required: false, description: 'Generation steps', default: 20 }
    ],
    response: {
      generated_image: 'string',
      prompt_used: 'string',
      generation_time: 'number',
      seed: 'number'
    }
  }
];

const codeExamples = {
  javascript: `// Example: Enhance an image
const formData = new FormData();
formData.append('image', imageFile);
formData.append('quality', 85);

const response = await fetch('/api/v1/enhance', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: formData
});

const result = await response.json();
console.log('Enhanced image:', result.enhanced_image);`,
  python: `# Example: Enhance an image
import requests

files = {'image': open('image.jpg', 'rb')}
data = {'quality': 85}
headers = {'Authorization': 'Bearer YOUR_API_KEY'}

response = requests.post(
    '/api/v1/enhance',
    files=files,
    data=data,
    headers=headers
)

result = response.json()
print('Enhanced image:', result['enhanced_image'])`,
  curl: `# Example: Enhance an image
curl -X POST \\
  /api/v1/enhance \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -F 'image=@image.jpg' \\
  -F 'quality=85'`
};

export default function APIIntegration() {
  const { image } = useEditor();
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [apiKey, setApiKey] = useState('sk-demo-key-123456789');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [apiStats, setApiStats] = useState({
    requests: 1247,
    success_rate: 98.5,
    avg_response_time: 245,
    quota_used: 67,
    quota_limit: 1000
  });

  const handleTestEndpoint = useCallback(async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults = {
        status: 200,
        data: {
          enhanced_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          processing_time: Math.floor(Math.random() * 1000) + 500,
          model_used: 'enhance-v2'
        },
        headers: {
          'x-request-id': 'req_' + Math.random().toString(36).substr(2, 9),
          'x-processing-time': '245ms'
        }
      };

      setTestResults(mockResults);
      toast.success('API test completed successfully!');
    } catch (error) {
      toast.error('API test failed');
      setTestResults({
        status: 500,
        error: 'Internal server error',
        message: 'The API endpoint is currently unavailable'
      });
    } finally {
      setIsTesting(false);
    }
  }, [image, selectedEndpoint]);

  const handleCopyCode = useCallback(() => {
    const code = codeExamples[selectedLanguage];
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Code copied to clipboard!');
    
    setTimeout(() => setCopiedCode(false), 2000);
  }, [selectedLanguage]);

  const handleGenerateApiKey = useCallback(() => {
    const newKey = 'sk-' + Math.random().toString(36).substr(2, 32);
    setApiKey(newKey);
    toast.success('New API key generated!');
  }, []);

  const handleRevokeApiKey = useCallback(() => {
    setApiKey('');
    toast.success('API key revoked!');
  }, []);

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">API Integration</h2>
              <p className="text-xs text-surface-500">Connect with external services</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={RefreshCw}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={FileJson}
            >
              Export Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* API Key Management */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key Management
            </h3>
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-400"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyCode}
                icon={copiedCode ? Check : Copy}
                className={copiedCode ? "text-green-400" : "text-surface-500"}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateApiKey}
                icon={Zap}
              >
                Generate Key
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevokeApiKey}
                icon={Unlink}
              >
                Revoke
              </Button>
            </div>
          </div>
        </div>

        {/* API Statistics */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            API Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-surface-500 mb-1">Total Requests</div>
              <div className="text-lg font-semibold text-white">{apiStats.requests.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Success Rate</div>
              <div className="text-lg font-semibold text-green-400">{apiStats.success_rate}%</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Avg Response</div>
              <div className="text-lg font-semibold text-blue-400">{apiStats.avg_response_time}ms</div>
            </div>
            <div>
              <div className="text-xs text-surface-500 mb-1">Quota Used</div>
              <div className="text-lg font-semibold text-purple-400">{apiStats.quota_used}%</div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Available Endpoints
          </h3>

          <div className="space-y-2">
            {apiEndpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  selectedEndpoint.id === endpoint.id
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded font-medium",
                      endpoint.method === 'POST' ? "bg-green-500/20 text-green-400" :
                      endpoint.method === 'GET' ? "bg-blue-500/20 text-blue-400" :
                      "bg-gray-500/20 text-gray-400"
                    )}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium">{endpoint.name}</span>
                  </div>
                  <span className="text-xs text-surface-500">{endpoint.path}</span>
                </div>
                <p className="text-xs text-surface-500">{endpoint.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint Details */}
        {selectedEndpoint && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{selectedEndpoint.name}</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTestEndpoint}
                disabled={isTesting || !image}
                loading={isTesting}
                icon={isTesting ? Loader2 : TestTube}
              >
                {isTesting ? 'Testing...' : 'Test Endpoint'}
              </Button>
            </div>

            {/* Parameters */}
            <div>
              <h4 className="text-xs font-medium text-white mb-3">Parameters</h4>
              <div className="space-y-2">
                {selectedEndpoint.parameters.map((param) => (
                  <div key={param.name} className="flex items-center justify-between p-2 bg-surface-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{param.name}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        param.required ? "bg-red-500/20 text-red-400" : "bg-surface-700 text-surface-400"
                      )}>
                        {param.type}
                      </span>
                    </div>
                    <span className="text-xs text-surface-500">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Schema */}
            <div>
              <h4 className="text-xs font-medium text-white mb-3">Response Schema</h4>
              <pre className="bg-surface-800 p-3 rounded-lg text-xs text-surface-300 overflow-x-auto">
                {formatJson(selectedEndpoint.response)}
              </pre>
            </div>

            {/* Test Results */}
            <AnimatePresence>
              {testResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-medium text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Test Results
                  </h4>
                  
                  <div className="bg-surface-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white">Status</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        testResults.status === 200 ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                      )}>
                        {testResults.status}
                      </span>
                    </div>
                    
                    <pre className="text-xs text-surface-300 overflow-x-auto">
                      {formatJson(testResults.data || testResults)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Code Examples */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Code Examples
            </h3>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="curl">cURL</option>
              </select>
              
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyCode}
                icon={copiedCode ? Check : Copy}
                className={copiedCode ? "text-green-400" : "text-surface-500"}
              />
            </div>
          </div>

          <div className="bg-surface-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-surface-300 font-mono">
              {codeExamples[selectedLanguage]}
            </pre>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Webhook Configuration
            </h3>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-surface-400">
                <input
                  type="checkbox"
                  checked={webhookEnabled}
                  onChange={(e) => setWebhookEnabled(e.target.checked)}
                  className="w-3 h-3 rounded"
                />
                <span>Enable</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-app.com/webhook"
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
              disabled={!webhookEnabled}
            />
            
            <div className="text-xs text-surface-500">
              Webhooks will receive real-time notifications when API requests are processed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}