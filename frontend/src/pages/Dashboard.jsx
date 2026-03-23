// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  Users,
  Clock,
  Calendar,
  ArrowRight,
  Zap,
  Star,
  Activity,
  PieChart,
  BarChart3,
  FolderOpen,
  Sparkles,
  Crown,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/helpers/cn';

// Mock data - replace with actual API calls
const mockStats = {
  totalProjects: 48,
  totalExports: 156,
  storageUsed: 2.4,
  storageLimit: 5,
  aiCreditsUsed: 75,
  aiCreditsTotal: 200,
  viewsThisMonth: 1250,
  downloadsThisMonth: 89,
  followersGrowth: 12.5
};

const mockRecentProjects = [
  { id: 1, name: 'Summer Campaign', type: 'image', updatedAt: new Date(Date.now() - 1000 * 60 * 30), thumbnail: null },
  { id: 2, name: 'Product Video', type: 'video', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), thumbnail: null },
  { id: 3, name: 'Podcast Intro', type: 'audio', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), thumbnail: null },
  { id: 4, name: 'Social Media Kit', type: 'image', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), thumbnail: null }
];

const mockActivityData = [
  { day: 'Mon', projects: 5, exports: 12 },
  { day: 'Tue', projects: 8, exports: 15 },
  { day: 'Wed', projects: 3, exports: 8 },
  { day: 'Thu', projects: 12, exports: 25 },
  { day: 'Fri', projects: 7, exports: 18 },
  { day: 'Sat', projects: 4, exports: 10 },
  { day: 'Sun', projects: 6, exports: 14 }
];

const mockTopTemplates = [
  { id: 1, name: 'Instagram Post', uses: 24, category: 'Social Media' },
  { id: 2, name: 'YouTube Thumbnail', uses: 18, category: 'Video' },
  { id: 3, name: 'Business Card', uses: 12, category: 'Print' },
  { id: 4, name: 'Presentation', uses: 8, category: 'Business' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: mockStats.totalProjects,
      change: '+12%',
      trend: 'up',
      icon: FolderOpen,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Exports',
      value: mockStats.totalExports,
      change: '+8%',
      trend: 'up',
      icon: Download,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Storage Used',
      value: `${mockStats.storageUsed} GB`,
      change: `${Math.round((mockStats.storageUsed / mockStats.storageLimit) * 100)}% of limit`,
      trend: 'neutral',
      icon: PieChart,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'AI Credits',
      value: `${mockStats.aiCreditsTotal - mockStats.aiCreditsUsed}/${mockStats.aiCreditsTotal}`,
      change: `${Math.round((mockStats.aiCreditsUsed / mockStats.aiCreditsTotal) * 100)}% used`,
      trend: 'down',
      icon: Zap,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Creator'}!
          </h1>
          <p className="text-surface-400">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/projects')}
            icon={FolderOpen}
          >
            View All
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/editor')}
            icon={Plus}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Activity;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    stat.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    stat.trend === 'up' ? 'text-emerald-400' :
                    stat.trend === 'down' ? 'text-rose-400' :
                    'text-surface-400'
                  )}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-surface-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Activity Overview</h2>
                <p className="text-sm text-surface-400">Projects and exports this week</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 rounded-lg bg-editor-card border border-editor-border text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-2">
            {mockActivityData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end justify-center h-48">
                  <div
                    className="w-3 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t"
                    style={{ height: `${(day.projects / 15) * 100}%` }}
                  />
                  <div
                    className="w-3 bg-gradient-to-t from-secondary-500 to-secondary-400 rounded-t"
                    style={{ height: `${(day.exports / 30) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-surface-500">{day.day}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-sm text-surface-400">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary-500" />
              <span className="text-sm text-surface-400">Exports</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/editor')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/templates')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/assets')}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Assets
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start"
                onClick={() => navigate('/pricing')}
              >
                <Crown className="w-4 h-4 mr-2 text-amber-400" />
                Upgrade Plan
              </Button>
            </div>
          </Card>

          {/* Usage Tips */}
          <Card className="p-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Pro Tips</h2>
            </div>
            <ul className="space-y-3 text-sm text-surface-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">•</span>
                Use keyboard shortcuts to speed up your workflow
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">•</span>
                Try AI background removal for quick edits
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">•</span>
                Save frequently used templates for faster creation
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Recent Projects & Top Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                <p className="text-sm text-surface-400">Continue where you left off</p>
              </div>
            </div>
            <Link
              to="/projects"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockRecentProjects.map((project, index) => {
              const TypeIcon = project.type === 'image' ? Image : project.type === 'video' ? Video : Music;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/editor/${project.id}`)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-editor-surface/50 hover:bg-editor-surface cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{project.name}</h3>
                    <p className="text-sm text-surface-500">
                      Edited {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-500" />
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Top Templates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Top Templates</h2>
                <p className="text-sm text-surface-400">Your most used templates</p>
              </div>
            </div>
            <Link
              to="/templates"
              className="text-sm text-secondary-400 hover:text-secondary-300 flex items-center gap-1"
            >
              Browse All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockTopTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/templates`)}
                className="flex items-center gap-4 p-3 rounded-xl bg-editor-surface/50 hover:bg-editor-surface cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-400">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{template.name}</h3>
                  <p className="text-sm text-surface-500">{template.category} • {template.uses} uses</p>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-500" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Performance Metrics</h2>
            <p className="text-sm text-surface-400">Your content performance this month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-editor-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-400">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-white">{mockStats.viewsThisMonth.toLocaleString()}</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15% from last month
            </p>
          </div>

          <div className="p-4 rounded-xl bg-editor-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-400">Downloads</span>
            </div>
            <p className="text-2xl font-bold text-white">{mockStats.downloadsThisMonth}</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8% from last month
            </p>
          </div>

          <div className="p-4 rounded-xl bg-editor-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-400">Avg. Edit Time</span>
            </div>
            <p className="text-2xl font-bold text-white">24m 32s</p>
            <p className="text-sm text-rose-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -3% from last month
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
