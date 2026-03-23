// frontend/src/components/advanced/ScriptEditor.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  Pause,
  Square,
  Save,
  FolderOpen,
  Download,
  Upload,
  Settings,
  Terminal,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Database,
  Cpu,
  Activity,
  RefreshCw,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Braces,
  FileCode,
  Layers,
  Palette
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const scriptTemplates = [
  {
    id: 'batch-resize',
    name: 'Batch Resize Images',
    description: 'Resize multiple images to specified dimensions',
    category: 'automation',
    icon: FileText,
    code: `// Batch Resize Script
async function batchResize(images, width, height) {
  const results = [];
  
  for (const image of images) {
    const resized = await resizeImage(image, width, height);
    results.push({
      original: image,
      resized: resized,
      timestamp: Date.now()
    });
  }
  
  return results;
}

// Usage
const images = getSelectedImages();
const resizedImages = await batchResize(images, 800, 600);
console.log('Resized', resizedImages.length, 'images');`
  },
  {
    id: 'color-palette',
    name: 'Extract Color Palette',
    description: 'Extract dominant colors from an image',
    category: 'analysis',
    icon: Palette,
    code: `// Color Palette Extraction
function extractColorPalette(image, numColors = 5) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Draw image to canvas
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // K-means clustering for color extraction
  const colors = kMeansClustering(pixels, numColors);
  
  return colors.map(color => ({
    hex: rgbToHex(color.r, color.g, color.b),
    rgb: color,
    percentage: calculatePercentage(color, pixels)
  }));
}

// Usage
const palette = extractColorPalette(currentImage, 6);
console.log('Color Palette:', palette);`
  },
  {
    id: 'layer-effects',
    name: 'Apply Layer Effects',
    description: 'Apply effects to multiple layers',
    category: 'effects',
    icon: Layers,
    code: `// Layer Effects Script
async function applyLayerEffects(layers, effects) {
  const processedLayers = [];
  
  for (const layer of layers) {
    let processedLayer = { ...layer };
    
    for (const effect of effects) {
      switch (effect.type) {
        case 'blur':
          processedLayer = await applyBlur(processedLayer, effect.intensity);
          break;
        case 'sharpen':
          processedLayer = await applySharpen(processedLayer, effect.amount);
          break;
        case 'brightness':
          processedLayer = await adjustBrightness(processedLayer, effect.value);
          break;
      }
    }
    
    processedLayers.push(processedLayer);
  }
  
  return processedLayers;
}

// Usage
const layers = getActiveLayers();
const effects = [
  { type: 'blur', intensity: 2 },
  { type: 'brightness', value: 1.2 }
];

const processedLayers = await applyLayerEffects(layers, effects);
updateLayers(processedLayers);`
  },
  {
    id: 'export-pipeline',
    name: 'Export Pipeline',
    description: 'Automated export with multiple formats',
    category: 'export',
    icon: Download,
    code: `// Export Pipeline Script
async function exportPipeline(image, formats, options = {}) {
  const exports = [];
  
  for (const format of formats) {
    const exportOptions = {
      quality: options.quality || 90,
      progressive: options.progressive || false,
      ...format.options
    };
    
    try {
      const exported = await exportImage(image, format.type, exportOptions);
      exports.push({
        format: format.type,
        data: exported,
        size: exported.byteLength,
        filename: generateFilename(format.type)
      });
    } catch (error) {
      console.error('Export failed for format:', format.type, error);
    }
  }
  
  return exports;
}

// Usage
const formats = [
  { type: 'jpg', options: { quality: 85 } },
  { type: 'png', options: { compression: 6 } },
  { type: 'webp', options: { quality: 80 } }
];

const exports = await exportPipeline(currentImage, formats);
console.log('Exported', exports.length, 'files');`
  }
];

const scriptCategories = [
  { id: 'all', name: 'All Scripts', icon: FileCode },
  { id: 'automation', name: 'Automation', icon: Zap },
  { id: 'analysis', name: 'Analysis', icon: Activity },
  { id: 'effects', name: 'Effects', icon: Palette },
  { id: 'export', name: 'Export', icon: Download }
];

export default function ScriptEditor() {
  const { image, layers, addToHistory, setImage } = useEditor();
  const [scripts, setScripts] = useState(scriptTemplates);
  const [selectedScript, setSelectedScript] = useState(null);
  const [scriptCode, setScriptCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConsole, setShowConsole] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [savedScripts, setSavedScripts] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [variables, setVariables] = useState({});
  const textareaRef = useRef(null);

  // Add console message
  const addConsoleMessage = useCallback((type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev, { type, message, timestamp }]);
  }, []);

  // Run script
  const runScript = useCallback(async () => {
    if (!scriptCode.trim()) {
      toast.error('Please enter script code');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setConsoleOutput([]);
    setExecutionTime(0);
    
    const startTime = Date.now();
    
    try {
      addConsoleMessage('info', 'Starting script execution...');
      
      // Create async function from script code
      const asyncFunction = new AsyncFunction('image', 'layers', 'addToHistory', 'setImage', 'console', `
        ${scriptCode}
      `);
      
      // Execute the script
      const result = await asyncFunction(image, layers, addToHistory, setImage, {
        log: (msg) => addConsoleMessage('log', msg),
        error: (msg) => addConsoleMessage('error', msg),
        warn: (msg) => addConsoleMessage('warn', msg),
        info: (msg) => addConsoleMessage('info', msg)
      });
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      addConsoleMessage('success', 'Script executed successfully!');
      if (result !== undefined) {
        addConsoleMessage('log', `Result: ${JSON.stringify(result)}`);
      }
      
      toast.success('Script executed successfully!');
    } catch (error) {
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      addConsoleMessage('error', `Script error: ${error.message}`);
      toast.error('Script execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [scriptCode, image, layers, addToHistory, setImage, addConsoleMessage]);

  // Pause script execution
  const pauseScript = useCallback(() => {
    setIsPaused(true);
    addConsoleMessage('warn', 'Script paused');
  }, [addConsoleMessage]);

  // Resume script execution
  const resumeScript = useCallback(() => {
    setIsPaused(false);
    addConsoleMessage('info', 'Script resumed');
  }, [addConsoleMessage]);

  // Stop script execution
  const stopScript = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    addConsoleMessage('warn', 'Script stopped');
  }, [addConsoleMessage]);

  // Save script
  const saveScript = useCallback(() => {
    if (!scriptCode.trim()) {
      toast.error('No script to save');
      return;
    }

    const script = {
      id: Date.now().toString(),
      name: selectedScript?.name || `Custom Script ${savedScripts.length + 1}`,
      code: scriptCode,
      category: 'custom',
      timestamp: Date.now()
    };

    setSavedScripts(prev => [...prev, script]);
    toast.success('Script saved successfully!');
  }, [scriptCode, selectedScript, savedScripts.length]);

  // Load script
  const loadScript = useCallback((script) => {
    setSelectedScript(script);
    setScriptCode(script.code);
    addConsoleMessage('info', `Loaded script: ${script.name}`);
  }, [addConsoleMessage]);

  // Delete script
  const deleteScript = useCallback((scriptId) => {
    setSavedScripts(prev => prev.filter(s => s.id !== scriptId));
    toast.success('Script deleted');
  }, []);

  // Export script
  const exportScript = useCallback(() => {
    if (!scriptCode.trim()) {
      toast.error('No script to export');
      return;
    }

    const blob = new Blob([scriptCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `script-${Date.now()}.js`;
    link.href = url;
    link.click();
    
    toast.success('Script exported successfully!');
  }, [scriptCode]);

  // Import script
  const importScript = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target.result;
      setScriptCode(code);
      setSelectedScript(null);
      toast.success('Script imported successfully!');
    };
    reader.readAsText(file);
  }, []);

  // Format code (basic)
  const formatCode = useCallback(() => {
    try {
      // Basic JavaScript formatting
      const formatted = scriptCode
        .replace(/;/g, ';\n')
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      setScriptCode(formatted);
      toast.success('Code formatted!');
    } catch (error) {
      toast.error('Failed to format code');
    }
  }, [scriptCode]);

  // Get line numbers
  const getLineNumbers = useCallback(() => {
    const lines = scriptCode.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  }, [scriptCode]);

  // Filter scripts by category
  const filteredScripts = scripts.filter(script => 
    selectedCategory === 'all' || script.category === selectedCategory
  );

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Script Editor</h2>
              <p className="text-xs text-surface-500">Automate tasks with JavaScript</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={showConsole ? EyeOff : Eye}
              onClick={() => setShowConsole(!showConsole)}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Save}
              onClick={saveScript}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-editor-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
              >
                {scriptCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setSelectedScript(null);
                  setScriptCode('// New script\n');
                }}
              >
                New
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>
              
              <label className="flex items-center gap-1 text-xs text-surface-400">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="w-3 h-3 rounded"
                />
                Wrap
              </label>
            </div>
          </div>

          {/* Script Templates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {filteredScripts.map((script) => (
              <button
                key={script.id}
                onClick={() => loadScript(script)}
                className={cn(
                  "p-2 rounded-lg border text-left transition-all",
                  selectedScript?.id === script.id
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                <div className="text-xs font-medium truncate">{script.name}</div>
                <div className="text-[9px] text-surface-500 truncate">{script.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex">
          <div className="flex-1 relative bg-surface-900">
            {lineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-surface-800 text-surface-500 text-xs p-2 text-right select-none">
                {getLineNumbers()}
              </div>
            )}
            
            <textarea
              ref={textareaRef}
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              placeholder="// Write your JavaScript code here..."
              className={cn(
                "w-full h-full bg-transparent text-white p-3 font-mono resize-none focus:outline-none",
                lineNumbers ? "pl-16" : "pl-3"
              )}
              style={{ fontSize: `${fontSize}px`, whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Execution Controls */}
        <div className="p-3 border-t border-editor-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button
                  variant="primary"
                  onClick={runScript}
                  disabled={!scriptCode.trim()}
                  icon={Play}
                >
                  Run
                </Button>
              ) : (
                <>
                  {!isPaused ? (
                    <Button
                      variant="secondary"
                      onClick={pauseScript}
                      icon={Pause}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={resumeScript}
                      icon={Play}
                    >
                      Resume
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={stopScript}
                    icon={Square}
                  >
                    Stop
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={formatCode}
              >
                Format
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(scriptCode);
                  toast.success('Code copied to clipboard!');
                }}
              >
                Copy
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-surface-500">
              {executionTime > 0 && (
                <span>Execution: {executionTime}ms</span>
              )}
              <span>Lines: {scriptCode.split('\n').length}</span>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <AnimatePresence>
          {showConsole && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 200, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-editor-border bg-surface-900"
            >
              <div className="p-2 border-b border-surface-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white">
                  <Terminal className="w-3 h-3" />
                  Console Output
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  icon={Trash2}
                  onClick={() => setConsoleOutput([])}
                />
              </div>
              
              <div className="p-2 overflow-y-auto max-h-40 font-mono text-xs">
                {consoleOutput.length === 0 ? (
                  <div className="text-surface-500">No output yet...</div>
                ) : (
                  consoleOutput.map((output, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2",
                        output.type === 'error' && "text-red-400",
                        output.type === 'warn' && "text-yellow-400",
                        output.type === 'success' && "text-green-400",
                        output.type === 'info' && "text-blue-400",
                        output.type === 'log' && "text-surface-300"
                      )}
                    >
                      <span className="text-surface-500">[{output.timestamp}]</span>
                      <span className="flex-1">{output.message}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".js,.jsx,.ts,.tsx"
        onChange={importScript}
        className="hidden"
        id="script-import"
      />
    </div>
  );
}