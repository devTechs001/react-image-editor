// frontend/src/components/ai/AIPrompts.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  History, 
  Star, 
  Copy, 
  Trash2, 
  RefreshCw,
  Zap,
  Lightbulb,
  Command
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const promptSuggestions = [
  "A futuristic cyberpunk cityscape with neon lights and flying cars",
  "A majestic mountain range at sunset with a crystal clear lake",
  "Professional headshot of a person in a modern office setting",
  "Oil painting style portrait of a cat wearing a crown",
  "Hyper-realistic architectural photography of a minimalist villa"
];

export default function AIPrompts({ onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([
    { id: 1, text: "Abstract colorful splash art", timestamp: Date.now() - 3600000 },
    { id: 2, text: "Vintage 1950s street photography", timestamp: Date.now() - 7200000 }
  ]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate?.(prompt);
    setHistory(prev => [{ id: Date.now(), text: prompt, timestamp: Date.now() }, ...prev]);
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Prompt Studio</h3>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Text-to-Image Generation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-dark space-y-6">
        {/* Prompt Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest flex items-center gap-1.5">
              <Command size={10} />
              Prompt Description
            </label>
            <span className="text-[10px] text-surface-600 font-medium">{prompt.length} / 500</span>
          </div>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create in detail..."
              className="w-full h-32 p-4 rounded-2xl bg-editor-card border border-editor-border text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                icon={Zap}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">
            <Lightbulb size={10} className="text-amber-400" />
            Suggestions
          </div>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setPrompt(suggestion)}
                className="px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700 hover:border-primary-500/50 hover:bg-primary-500/5 text-[11px] text-surface-400 hover:text-primary-300 transition-all text-left max-w-full truncate"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="space-y-3 pt-4 border-t border-editor-border">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-widest">
              <History size={10} />
              Recent Prompts
            </div>
            <button className="text-[10px] text-surface-600 hover:text-red-400 transition-colors">Clear All</button>
          </div>
          
          <div className="space-y-2">
            {history.map((item) => (
              <div 
                key={item.id}
                className="group p-3 rounded-xl bg-editor-card/50 border border-transparent hover:border-editor-border hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-surface-300 line-clamp-2 leading-relaxed flex-1 cursor-pointer" onClick={() => setPrompt(item.text)}>
                    {item.text}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-surface-500 hover:text-white transition-all">
                      <Copy size={12} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-500 hover:text-red-400 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[9px] text-surface-600 font-bold uppercase">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Used 3x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Settings Link */}
      <div className="p-4 border-t border-editor-border">
        <Button variant="secondary" fullWidth size="sm" icon={RefreshCw}>
          Advanced Generation Settings
        </Button>
      </div>
    </div>
  );
}
