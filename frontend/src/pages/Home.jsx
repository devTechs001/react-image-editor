// frontend/src/pages/Home.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Image,
  Video,
  Music,
  Wand2,
  Zap,
  ArrowRight,
  Play,
  Star,
  Users,
  Crown,
  Layers,
  Palette,
  Type,
  Scissors,
  Maximize2,
  Download
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Editing',
    description: 'Remove backgrounds, enhance photos, and generate images with cutting-edge AI',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: Layers,
    title: 'Professional Layers',
    description: 'Work with unlimited layers, masks, and blend modes like a pro',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Palette,
    title: 'Advanced Filters',
    description: 'Apply beautiful filters and adjustments with real-time preview',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Video,
    title: 'Video Editing',
    description: 'Edit videos with timeline, transitions, and effects',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Music,
    title: 'Audio Tools',
    description: 'Edit audio tracks, add effects, and sync with video',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Export in any format with optimized compression',
    color: 'from-indigo-500 to-violet-500'
  }
];

const aiTools = [
  { icon: Scissors, name: 'Background Removal', description: 'One-click background removal' },
  { icon: Maximize2, name: 'AI Upscaling', description: 'Enhance resolution up to 4x' },
  { icon: Wand2, name: 'Auto Enhance', description: 'Automatic image enhancement' },
  { icon: Sparkles, name: 'Style Transfer', description: 'Apply artistic styles' },
  { icon: Type, name: 'Text to Image', description: 'Generate images from text' },
  { icon: Palette, name: 'Colorization', description: 'Add color to B&W photos' }
];

const stats = [
  { value: '10M+', label: 'Images Edited' },
  { value: '500K+', label: 'Happy Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

        <div className="relative container-custom">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">
                Powered by Advanced AI
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-white">Create Stunning</span>
              <br />
              <span className="text-gradient-animated">Media with AI</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-surface-400 mb-10 max-w-2xl mx-auto"
            >
              The most powerful AI-driven media editor. Edit photos, videos, and audio
              with professional tools and cutting-edge artificial intelligence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/editor')}
                className="w-full sm:w-auto"
              >
                <Zap className="w-5 h-5" />
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 pt-16 border-t border-editor-border"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-surface-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-editor-surface/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Everything You Need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-surface-400 max-w-2xl mx-auto"
            >
              Professional-grade tools combined with powerful AI to make editing effortless
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-editor-card border border-editor-border hover:border-primary-500/30 transition-all hover:-translate-y-1"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                    feature.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-surface-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-secondary-400" />
                <span className="text-sm font-medium text-secondary-300">AI Tools</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Supercharge Your Workflow with AI
              </h2>
              
              <p className="text-lg text-surface-400 mb-8">
                Our advanced AI models handle complex tasks in seconds, from background removal
                to image generation. Focus on creativity while AI handles the heavy lifting.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {aiTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{tool.name}</h4>
                        <p className="text-sm text-surface-500">{tool.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/20 p-8 flex items-center justify-center">
                <div className="relative w-full h-full rounded-2xl bg-editor-card overflow-hidden">
                  {/* Placeholder for demo animation/image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 animate-float">
                        <Wand2 className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-white font-semibold">AI Magic in Action</p>
                      <p className="text-sm text-surface-500">Real-time processing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl"
              >
                <span className="text-sm font-medium text-emerald-300">⚡ 10x Faster</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl"
              >
                <span className="text-sm font-medium text-amber-300">🎯 99% Accuracy</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-90" />
            <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join millions of creators who use AI Media Editor to bring their ideas to life.
                Start for free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-white/90 w-full sm:w-auto"
                  onClick={() => navigate('/editor')}
                >
                  <Zap className="w-5 h-5" />
                  Start Creating Now
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/10 w-full sm:w-auto"
                  onClick={() => navigate('/pricing')}
                >
                  <Crown className="w-5 h-5" />
                  View Pricing
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}