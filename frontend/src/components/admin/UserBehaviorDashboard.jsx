// frontend/src/components/admin/UserBehaviorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Brain,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Keyboard,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Settings
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers/cn';

export default function UserBehaviorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
    loadUsers();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/behavior-analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users-with-behavior', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/v1/admin/user-behavior/${userId}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/v1/admin/export-behavior-data?type=${type}&timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `behavior-analytics-${type}-${timeframe}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
            <span className="text-white text-lg">Loading behavior analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Behavior Analytics</h1>
            <p className="text-surface-400">
              Monitor and analyze user interactions with AI features
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={loadAnalytics}
              className="text-sm"
            >
              Refresh
            </Button>
            
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => exportData('analytics')}
              className="text-sm"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-surface-700">
        {['overview', 'users', 'patterns', 'ai-performance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-surface-400 hover:text-white"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={analytics?.totalUsers || 0}
              icon={Users}
              change={analytics?.userGrowth || 0}
              changeType="increase"
            />
            <MetricCard
              title="AI Operations"
              value={analytics?.totalOperations || 0}
              icon={Brain}
              change={analytics?.operationGrowth || 0}
              changeType="increase"
            />
            <MetricCard
              title="Success Rate"
              value={`${Math.round((analytics?.successRate || 0) * 100)}%`}
              icon={Target}
              change={analytics?.successRateChange || 0}
              changeType="positive"
            />
            <MetricCard
              title="Avg Session Duration"
              value={`${Math.round((analytics?.avgSessionDuration || 0) / 60000)}m`}
              icon={Clock}
              change={analytics?.durationChange || 0}
              changeType="neutral"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="AI Feature Usage"
              icon={PieChart}
              data={analytics?.featureUsage || []}
              type="pie"
            />
            <ChartCard
              title="Daily Activity"
              icon={LineChart}
              data={analytics?.dailyActivity || []}
              type="line"
            />
          </div>

          {/* Top Users */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Most Active Users</h3>
            <div className="space-y-3">
              {(analytics?.topUsers || []).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-xs text-surface-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{user.operations}</div>
                    <div className="text-xs text-surface-400">operations</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-400"
              />
            </div>
            
            <Button
              variant="secondary"
              icon={Filter}
              className="text-sm"
            >
              Filters
            </Button>
          </div>

          {/* Users List */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      Operations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      Skill Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-white font-medium">{user.username}</div>
                            <div className="text-xs text-surface-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {user.totalOperations || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-white">{Math.round((user.successRate || 0) * 100)}%</div>
                          <div className="ml-2 w-16 bg-surface-700 rounded-full h-2">
                            <div
                              className="bg-green-400 h-2 rounded-full"
                              style={{ width: `${(user.successRate || 0) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-400">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          user.skillLevel === 'expert' ? "bg-purple-500/20 text-purple-400" :
                          user.skillLevel === 'advanced' ? "bg-blue-500/20 text-blue-400" :
                          user.skillLevel === 'intermediate' ? "bg-green-500/20 text-green-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {user.skillLevel || 'beginner'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => loadUserDetails(user.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {/* Behavior Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatternCard
              title="Common Workflows"
              icon={Zap}
              patterns={analytics?.commonWorkflows || []}
            />
            <PatternCard
              title="Error Patterns"
              icon={AlertTriangle}
              patterns={analytics?.errorPatterns || []}
              type="error"
            />
          </div>

          {/* Tool Usage Patterns */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tool Usage Patterns</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={expandedSections['toolUsage'] ? ChevronUp : ChevronDown}
                onClick={() => toggleSection('toolUsage')}
              />
            </div>
            
            <AnimatePresence>
              {expandedSections['toolUsage'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4"
                >
                  {(analytics?.toolUsagePatterns || []).map((pattern, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{pattern.tool}</h4>
                        <span className="text-sm text-surface-400">{pattern.frequency} uses</span>
                      </div>
                      <div className="text-sm text-surface-300">{pattern.description}</div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-surface-400">
                        <span>Avg duration: {pattern.avgDuration}ms</span>
                        <span>Success rate: {Math.round(pattern.successRate * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time-based Patterns */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Peak Hours</span>
                </div>
                <div className="space-y-1">
                  {(analytics?.peakHours || []).map((hour, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-surface-400">{hour.hour}:00</span>
                      <span className="text-white">{hour.activity} operations</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-surface-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">Daily Patterns</span>
                </div>
                <div className="space-y-1">
                  {(analytics?.dailyPatterns || []).map((day, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-surface-400">{day.day}</span>
                      <span className="text-white">{day.operations} operations</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-surface-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">Session Types</span>
                </div>
                <div className="space-y-1">
                  {(analytics?.sessionTypes || []).map((type, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-surface-400">{type.type}</span>
                      <span className="text-white">{type.count} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Performance Tab */}
      {activeTab === 'ai-performance' && (
        <div className="space-y-6">
          {/* AI Service Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceMetricCard
              title="Computer Vision"
              service="vision"
              metrics={analytics?.services?.vision || {}}
              icon={Eye}
            />
            <ServiceMetricCard
              title="NLP"
              service="nlp"
              metrics={analytics?.services?.nlp || {}}
              icon={Brain}
            />
            <ServiceMetricCard
              title="Generative AI"
              service="genai"
              metrics={analytics?.services?.genai || {}}
              icon={Zap}
            />
            <ServiceMetricCard
              title="Reinforcement Learning"
              service="rl"
              metrics={analytics?.services?.rl || {}}
              icon={Target}
            />
          </div>

          {/* Performance Trends */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
            <div className="space-y-4">
              {(analytics?.performanceTrends || []).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      trend.trend === 'improving' ? "bg-green-400" :
                      trend.trend === 'declining' ? "bg-red-400" : "bg-yellow-400"
                    )} />
                    <span className="text-white">{trend.metric}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-surface-400">{trend.current}</span>
                    <span className={cn(
                      "text-sm",
                      trend.change > 0 ? "text-green-400" : trend.change < 0 ? "text-red-400" : "text-surface-400"
                    )}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-800 border border-surface-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">User Behavior Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => setSelectedUser(null)}
                />
              </div>
              
              <UserDetailView user={selectedUser} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, icon: Icon, change, changeType }) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div className={cn(
          "flex items-center space-x-1 text-sm",
          changeType === 'increase' || changeType === 'positive' ? "text-green-400" :
          changeType === 'decrease' || changeType === 'negative' ? "text-red-400" : "text-surface-400"
        )}>
          {change > 0 && <TrendingUp className="w-4 h-4" />}
          {change < 0 && <TrendingUp className="w-4 h-4 rotate-180" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-surface-400">{title}</div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, data, type }) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="h-64 flex items-center justify-center text-surface-400">
        Chart visualization for {type} data
      </div>
    </div>
  );
}

function PatternCard({ title, icon: Icon, patterns, type = 'success' }) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className={cn(
          "w-5 h-5",
          type === 'error' ? "text-red-400" : "text-green-400"
        )} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{pattern.name}</div>
              <div className="text-xs text-surface-400">{pattern.description}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{pattern.frequency}</div>
              <div className="text-xs text-surface-400">occurrences</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceMetricCard({ title, service, metrics, icon: Icon }) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-surface-400">Requests</span>
          <span className="text-white">{metrics.requests || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-surface-400">Avg Duration</span>
          <span className="text-white">{metrics.avgDuration || 0}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-surface-400">Success Rate</span>
          <span className="text-white">{Math.round((metrics.successRate || 0) * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-surface-400">Errors</span>
          <span className={cn(
            "text-white",
            (metrics.errorRate || 0) > 0.1 ? "text-red-400" : "text-green-400"
          )}>
            {Math.round((metrics.errorRate || 0) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function UserDetailView({ user }) {
  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{user.username}</h3>
          <p className="text-surface-400">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              user.skillLevel === 'expert' ? "bg-purple-500/20 text-purple-400" :
              user.skillLevel === 'advanced' ? "bg-blue-500/20 text-blue-400" :
              user.skillLevel === 'intermediate' ? "bg-green-500/20 text-green-400" :
              "bg-yellow-500/20 text-yellow-400"
            )}>
              {user.skillLevel || 'beginner'}
            </span>
            <span className="text-xs text-surface-400">
              Last active: {new Date(user.lastActive).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{user.totalOperations}</div>
          <div className="text-sm text-surface-400">Total Operations</div>
        </div>
        <div className="bg-surface-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{Math.round((user.successRate || 0) * 100)}%</div>
          <div className="text-sm text-surface-400">Success Rate</div>
        </div>
        <div className="bg-surface-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{user.sessionCount}</div>
          <div className="text-sm text-surface-400">Sessions</div>
        </div>
        <div className="bg-surface-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{Math.round((user.avgSessionDuration || 0) / 60000)}m</div>
          <div className="text-sm text-surface-400">Avg Session</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {(user.recentActivity || []).map((activity, index) => (
            <div key={index} className="flex items-center justify-between bg-surface-900 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  activity.success ? "bg-green-400" : "bg-red-400"
                )} />
                <div>
                  <div className="text-white font-medium">{activity.operation}</div>
                  <div className="text-xs text-surface-400">{new Date(activity.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white">{activity.duration}ms</div>
                <div className="text-xs text-surface-400">duration</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
