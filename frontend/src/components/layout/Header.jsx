// frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Command,
  Sparkles,
  ChevronDown,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

export default function Header({ onMenuClick, sidebarOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Export Complete', message: 'Your video has been exported successfully', time: '2m ago', unread: true },
    { id: 2, title: 'AI Processing Done', message: 'Background removal completed', time: '1h ago', unread: true },
    { id: 3, title: 'New Template', message: 'Check out our new social media templates', time: '3h ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-20 bg-editor-surface/80 backdrop-blur-xl border-b border-editor-border">
      <div className="h-16 px-4 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo - Mobile */}
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block relative w-80">
            <Input
              type="search"
              placeholder="Search projects, templates..."
              size="sm"
              icon={Search}
              className="bg-editor-card/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-surface-600">
              <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-800 border border-surface-700">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-800 border border-surface-700">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search - Mobile */}
          <button
            onClick={() => setShowSearch(true)}
            className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Create Button */}
          <Button
            variant="primary"
            size="sm"
            className="hidden sm:flex"
            onClick={() => navigate('/editor')}
          >
            <Sparkles className="w-4 h-4" />
            Create
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-editor-card border border-editor-border shadow-elevated z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-editor-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <span className="badge-primary">{unreadCount} new</span>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-editor-border hover:bg-white/5 cursor-pointer transition-colors',
                          notification.unread && 'bg-primary-500/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            notification.unread ? 'bg-primary-500' : 'bg-surface-600'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm">{notification.title}</p>
                            <p className="text-sm text-surface-400 truncate">{notification.message}</p>
                            <p className="text-xs text-surface-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-editor-border">
                    <Button variant="ghost" size="sm" fullWidth>
                      View all notifications
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-surface-500">{user?.plan || 'Free'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-surface-400 hidden md:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-editor-card border border-editor-border shadow-elevated z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-editor-border">
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-sm text-surface-400">{user?.email}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="menu-item"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="menu-item"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        to="/pricing"
                        onClick={() => setShowUserMenu(false)}
                        className="menu-item"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        Upgrade to Pro
                      </Link>
                    </div>

                    <div className="p-2 border-t border-editor-border">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="menu-item w-full text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}