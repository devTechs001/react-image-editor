// frontend/src/pages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Zap, 
  Shield, 
  Heart, 
  Globe,
  Sparkles,
  Code2,
  Cpu
} from 'lucide-react';
import Card from '@/components/ui/Card';

const stats = [
  { label: 'Active Users', value: '100K+', icon: Users },
  { label: 'Images Processed', value: '50M+', icon: Zap },
  { label: 'Countries', value: '150+', icon: Globe },
  { label: 'AI Models', value: '25+', icon: Cpu },
];

const values = [
  {
    title: 'Innovation First',
    description: 'We constantly push the boundaries of what is possible with AI and media editing.',
    icon: Sparkles,
    color: 'text-primary-400'
  },
  {
    title: 'User Centric',
    description: 'Our tools are designed to be powerful yet accessible to creators of all skill levels.',
    icon: Heart,
    color: 'text-rose-400'
  },
  {
    title: 'Privacy & Security',
    description: 'Your data and creations are protected with industry-leading security standards.',
    icon: Shield,
    color: 'text-emerald-400'
  },
  {
    title: 'Open Technology',
    description: 'We believe in building tools that integrate seamlessly with your existing workflow.',
    icon: Code2,
    color: 'text-blue-400'
  }
];

export default function About() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          The Future of Media Editing
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-white tracking-tight"
        >
          Empowering Creators with <span className="text-gradient">AI Magic</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-surface-400"
        >
          AI Media Studio is an all-in-one creative platform that combines professional-grade 
          editing tools with cutting-edge artificial intelligence.
        </motion.p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card className="p-6 text-center border-editor-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-surface-500">{stat.label}</div>
              </Card>
            </motion.div>
          );
        })}
      </section>

      {/* Mission Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          <p className="text-surface-400 text-lg leading-relaxed">
            We believe that high-quality media production should be accessible to everyone. 
            By leveraging the latest advancements in machine learning, we're building 
            tools that automate tedious tasks, allowing creators to focus on what matters 
            most: their story.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-editor-surface/50 border border-editor-border">
              <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Vision 2025</h3>
                <p className="text-sm text-surface-400">Become the industry standard for AI-assisted creative workflows.</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="relative aspect-video rounded-2xl overflow-hidden border border-editor-border shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mix-blend-overlay" />
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
            alt="AI Technology" 
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
      </section>

      {/* Values Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">Our Values</h2>
          <p className="text-surface-400">The principles that guide everything we build.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
              >
                <Card className="p-6 h-full border-editor-border/50 hover:border-primary-500/30 transition-colors">
                  <Icon className={cn("w-8 h-8 mb-4", value.color)} />
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
