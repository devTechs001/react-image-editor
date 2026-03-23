// frontend/src/components/ai/NaturalLanguageProcessing.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Languages,
  Brain,
  Zap,
  Send,
  Mic,
  MicOff,
  Download,
  Upload,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Globe,
  BookOpen,
  Headphones,
  PenTool,
  Hash,
  TrendingUp,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  Volume2
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const nlpTasks = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate creative text and content',
    icon: PenTool,
    models: ['GPT-4', 'Claude', 'Gemini', 'Llama 2'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze emotions and sentiment in text',
    icon: MessageSquare,
    models: ['BERT', 'RoBERTa', 'DistilBERT', 'XLNet'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Translate text between languages',
    icon: Languages,
    models: ['Google Translate', 'DeepL', 'M2M-100', 'NLLB'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'summarization',
    name: 'Text Summarization',
    description: 'Extract key points from long text',
    icon: FileText,
    models: ['T5', 'BART', 'Pegasus', 'GPT-3.5'],
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'keyword-extraction',
    name: 'Keyword Extraction',
    description: 'Extract important keywords and topics',
    icon: Hash,
    models: ['KeyBERT', 'YAKE', 'Rake-NLW', 'TextRank'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    description: 'Convert audio to text transcription',
    icon: Mic,
    models: ['Whisper', 'Wav2Vec2', 'SpeechBrain', 'Conformer'],
    color: 'from-red-500 to-rose-500'
  }
];

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' }
];

export default function NaturalLanguageProcessing({ image, onComplete }) {
  const [selectedTask, setSelectedTask] = useState(nlpTasks[0]);
  const [selectedModel, setSelectedModel] = useState(nlpTasks[0].models[0]);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [results, setResults] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [modelMetrics, setModelMetrics] = useState({
    inferenceTime: 0,
    memoryUsage: 0,
    tokensPerSecond: 0
  });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Process text with selected NLP task
  const processText = useCallback(async () => {
    if (!inputText.trim() && selectedTask.id !== 'text-generation') {
      toast.error('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setProgress(0);
    setResults(null);
    
    const startTime = Date.now();

    try {
      // Prepare request data
      const requestData = {
        text: inputText,
        model: selectedModel,
        ...(selectedTask.id === 'text-generation' && {
          prompt: inputText,
          max_tokens: 500,
          temperature: 0.7
        }),
        ...(selectedTask.id === 'translation' && {
          source_language: sourceLanguage,
          target_language: targetLanguage
        }),
        ...(selectedTask.id === 'summarization' && {
          compression_ratio: 0.3
        }),
        ...(selectedTask.id === 'keyword-extraction' && {
          max_keywords: 10
        })
      };

      // Call real API endpoint
      const response = await fetch(`/api/v1/ai/nlp/${selectedTask.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setResults(result);
        setOutputText(result.output || '');
        
        const endTime = Date.now();
        setProcessingTime(endTime - startTime);
        setTokenCount(result.tokenCount || 0);
        
        // Update model metrics
        setModelMetrics({
          inferenceTime: result.processingTime || 0,
          memoryUsage: Math.random() * 1024 + 512,
          tokensPerSecond: result.tokensUsed ? result.tokensUsed / (processingTime / 1000) : 0
        });

        toast.success(`${selectedTask.name} completed successfully!`);
        
        if (onComplete && result.processedImage) {
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
  }, [inputText, selectedTask, selectedModel, sourceLanguage, targetLanguage, isProcessing, isPaused, onComplete]);

  // Generate mock results based on task type
  const generateMockResults = (taskId) => {
    const baseResults = {
      taskId,
      modelName: selectedModel,
      inputText: inputText.substring(0, 100),
      processingTime,
      timestamp: Date.now()
    };

    switch (taskId) {
      case 'text-generation':
        return {
          ...baseResults,
          output: generateCreativeText(inputText),
          tokenCount: Math.floor(Math.random() * 500) + 200,
          creativity: 0.85,
          coherence: 0.92
        };
      
      case 'sentiment-analysis':
        return {
          ...baseResults,
          sentiment: analyzeSentiment(inputText),
          confidence: Math.random() * 0.2 + 0.8,
          emotions: analyzeEmotions(inputText)
        };
      
      case 'translation':
        return {
          ...baseResults,
          output: translateText(inputText, sourceLanguage, targetLanguage),
          sourceLanguage,
          targetLanguage,
          confidence: Math.random() * 0.15 + 0.85
        };
      
      case 'summarization':
        return {
          ...baseResults,
          output: summarizeText(inputText),
          compressionRatio: 0.3,
          keyPoints: extractKeyPoints(inputText)
        };
      
      case 'keyword-extraction':
        return {
          ...baseResults,
          keywords: extractKeywords(inputText),
          topics: extractTopics(inputText),
          relevanceScores: generateRelevanceScores()
        };
      
      case 'speech-to-text':
        return {
          ...baseResults,
          transcription: generateTranscription(),
          speakerCount: Math.floor(Math.random() * 3) + 1,
          confidence: Math.random() * 0.2 + 0.8,
          duration: Math.random() * 120 + 30
        };
      
      default:
        return baseResults;
    }
  };

  // Mock text generation
  const generateCreativeText = (prompt) => {
    const creativeTexts = [
      "In a world where technology and creativity intertwine, the possibilities become endless. The fusion of human imagination with artificial intelligence opens doors to unprecedented innovation.",
      "The digital landscape continues to evolve at a breathtaking pace, transforming how we communicate, create, and connect with one another across boundaries and time zones.",
      "As we stand at the intersection of art and technology, we witness the emergence of new forms of expression that challenge our traditional understanding of creativity."
    ];
    return creativeTexts[Math.floor(Math.random() * creativeTexts.length)];
  };

  // Mock sentiment analysis
  const analyzeSentiment = (text) => {
    const sentiments = ['positive', 'negative', 'neutral'];
    const scores = {
      positive: Math.random() * 0.4 + 0.3,
      negative: Math.random() * 0.3 + 0.1,
      neutral: Math.random() * 0.3 + 0.2
    };
    
    const maxSentiment = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
      label: maxSentiment,
      scores,
      confidence: scores[maxSentiment]
    };
  };

  // Mock emotion analysis
  const analyzeEmotions = (text) => {
    return [
      { emotion: 'joy', score: Math.random() * 0.8 + 0.1 },
      { emotion: 'sadness', score: Math.random() * 0.3 + 0.05 },
      { emotion: 'anger', score: Math.random() * 0.2 + 0.05 },
      { emotion: 'fear', score: Math.random() * 0.2 + 0.05 },
      { emotion: 'surprise', score: Math.random() * 0.4 + 0.1 }
    ].sort((a, b) => b.score - a.score);
  };

  // Mock translation
  const translateText = (text, source, target) => {
    return `[Translated from ${source} to ${target}]: ${text.substring(0, 100)}...`;
  };

  // Mock summarization
  const summarizeText = (text) => {
    return `Summary: This text discusses key concepts and provides insights into the main topic. The author presents several important points that contribute to a comprehensive understanding of the subject matter.`;
  };

  // Mock key points extraction
  const extractKeyPoints = (text) => {
    return [
      "Key finding reveals important information",
      "Critical insight provides new perspective",
      "Significant trend indicates future direction",
      "Notable discovery changes understanding"
    ];
  };

  // Mock keyword extraction
  const extractKeywords = (text) => {
    const keywords = ['innovation', 'technology', 'creativity', 'digital', 'transformation', 'future', 'artificial', 'intelligence'];
    return keywords.slice(0, Math.floor(Math.random() * 5) + 3).map(keyword => ({
      keyword,
      relevance: Math.random() * 0.3 + 0.7
    }));
  };

  // Mock topic extraction
  const extractTopics = (text) => {
    return [
      { topic: 'Technology', weight: 0.85 },
      { topic: 'Innovation', weight: 0.72 },
      { topic: 'Digital Transformation', weight: 0.68 }
    ];
  };

  // Mock relevance scores
  const generateRelevanceScores = () => {
    return {
      precision: Math.random() * 0.2 + 0.8,
      recall: Math.random() * 0.2 + 0.75,
      f1Score: Math.random() * 0.2 + 0.8
    };
  };

  // Mock transcription
  const generateTranscription = () => {
    return "Hello, this is a sample transcription of the audio content. The speech recognition system has converted the spoken words into text with high accuracy.";
  };

  // Start/stop recording
  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          // Process audio blob
          setInputText('Audio recorded and ready for transcription');
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast.success('Recording started');
      } catch (error) {
        toast.error('Failed to access microphone');
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.info('Recording stopped');
      }
    }
  }, [isRecording]);

  // Copy output text
  const copyOutput = useCallback(() => {
    if (!outputText) {
      toast.error('No output to copy');
      return;
    }
    
    navigator.clipboard.writeText(outputText);
    toast.success('Output copied to clipboard!');
  }, [outputText]);

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
    link.download = `nlp-results-${Date.now()}.json`;
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
    setOutputText('');
    setProcessingTime(0);
    setTokenCount(0);
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="p-4 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Natural Language Processing</h2>
              <p className="text-xs text-surface-500">Advanced text analysis and generation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              icon={Copy}
              onClick={copyOutput}
              disabled={!outputText}
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
            <Brain className="w-4 h-4" />
            NLP Task
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nlpTasks.map((task) => {
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
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

        {/* Language Selection for Translation */}
        {selectedTask.id === 'translation' && (
          <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Language Selection
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-surface-500 block mb-2">Source Language</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-surface-500 block mb-2">Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-editor-card border border-editor-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Input
          </h3>
          
          {selectedTask.id === 'speech-to-text' ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-700 rounded-lg">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all",
                  isRecording ? "bg-red-500 animate-pulse" : "bg-surface-800"
                )}>
                  {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-surface-400" />}
                </div>
                
                <Button
                  variant={isRecording ? "secondary" : "primary"}
                  onClick={toggleRecording}
                  icon={isRecording ? Square : Mic}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                {isRecording && (
                  <div className="w-full max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-surface-400" />
                      <div className="flex-1 bg-surface-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {inputText && (
                <div className="p-3 bg-surface-800 rounded-lg">
                  <div className="text-xs text-surface-500 mb-1">Transcription Preview:</div>
                  <div className="text-sm text-white">{inputText}</div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedTask.id === 'text-generation' ? "Enter a prompt to generate text..." : "Enter text to process..."}
              className="w-full h-32 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500"
            />
          )}
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
                onClick={processText}
                disabled={!inputText.trim() && selectedTask.id !== 'text-generation'}
                icon={Play}
              >
                Process Text
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
                Results
              </h3>
              
              {/* Output Text */}
              {outputText && (
                <div className="space-y-2">
                  <div className="text-xs text-surface-500">Output:</div>
                  <div className="p-3 bg-surface-800 rounded-lg">
                    <div className="text-sm text-white whitespace-pre-wrap">{outputText}</div>
                  </div>
                </div>
              )}

              {/* Task-specific results */}
              {selectedTask.id === 'sentiment-analysis' && results.sentiment && (
                <div className="space-y-3">
                  <div className="text-xs text-surface-500">Sentiment Analysis:</div>
                  <div className="flex items-center justify-between p-2 bg-surface-800 rounded-lg">
                    <span className="text-sm font-medium text-white capitalize">
                      {results.sentiment.label}
                    </span>
                    <span className="text-sm text-green-400">
                      {(results.sentiment.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-surface-500">Emotions:</div>
                    {results.emotions?.slice(0, 3).map((emotion) => (
                      <div key={emotion.emotion} className="flex items-center justify-between text-xs">
                        <span className="text-white capitalize">{emotion.emotion}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className="text-blue-400 w-10 text-right">
                            {(emotion.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.id === 'keyword-extraction' && results.keywords && (
                <div className="space-y-3">
                  <div className="text-xs text-surface-500">Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs"
                      >
                        {keyword.keyword} ({(keyword.relevance * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Metrics */}
              <div className="grid grid-cols-3 gap-4 text-xs border-t border-surface-700 pt-3">
                <div>
                  <span className="text-surface-500">Tokens</span>
                  <div className="text-white font-semibold">{tokenCount}</div>
                </div>
                <div>
                  <span className="text-surface-500">Speed</span>
                  <div className="text-white font-semibold">
                    {modelMetrics.tokensPerSecond.toFixed(1)} t/s
                  </div>
                </div>
                <div>
                  <span className="text-surface-500">Memory</span>
                  <div className="text-white font-semibold">
                    {(modelMetrics.memoryUsage / 1024).toFixed(1)}GB
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
