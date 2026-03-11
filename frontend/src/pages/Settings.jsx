// frontend/src/pages/Settings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Keyboard,
  Globe,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Download,
  Trash2,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import { cn } from '@/utils/helpers/cn';
import toast from 'react-hot-toast';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
  { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
  { id: 'shortcuts', icon: Keyboard, label: 'Keyboard Shortcuts' },
  { id: 'language', icon: Globe, label: 'Language & Region' }
];

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    updates: true
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showActivity: true,
    allowAnalytics: true
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profile);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Profile Settings</h2>
              <p className="text-surface-400">Manage your account information</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <Button variant="secondary" size="sm">Change Avatar</Button>
                <p className="text-xs text-surface-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid gap-4 max-w-md">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled
                hint="Email cannot be changed"
              />
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                loading={isSaving}
              >
                Save Changes
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 mt-6 border-t border-editor-border">
              <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div>
                    <h4 className="font-medium text-white">Delete Account</h4>
                    <p className="text-sm text-surface-400">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="danger" size="sm" icon={Trash2}>Delete</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Appearance</h2>
              <p className="text-surface-400">Customize how the app looks</p>
            </div>

            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-medium text-surface-300 mb-3">Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(themes).map((themeKey) => (
                  <button
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all',
                      theme === themeKey
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-editor-border hover:border-surface-600'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {themeKey === 'dark' && <Moon className="w-4 h-4 text-surface-400" />}
                      {themeKey === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
                      {themeKey === 'midnight' && <Monitor className="w-4 h-4 text-blue-400" />}
                      {themeKey === 'sunset' && <Sun className="w-4 h-4 text-orange-400" />}
                    </div>
                    <span className="text-sm font-medium text-white capitalize">{themeKey}</span>
                    {theme === themeKey && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Other appearance settings */}
            <div className="space-y-4">
              <Switch
                label="Reduce motion"
                description="Minimize animations throughout the app"
                checked={false}
                onCheckedChange={() => {}}
              />
              <Switch
                label="High contrast"
                description="Increase contrast for better visibility"
                checked={false}
                onCheckedChange={() => {}}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
              <p className="text-surface-400">Manage how you receive notifications</p>
            </div>

            <div className="space-y-4">
              <Switch
                label="Email notifications"
                description="Receive notifications via email"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
              <Switch
                label="Push notifications"
                description="Receive push notifications in browser"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
              <Switch
                label="Marketing emails"
                description="Receive tips, updates, and offers"
                checked={notifications.marketing}
                onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
              />
              <Switch
                label="Product updates"
                description="Get notified about new features"
                checked={notifications.updates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
              />
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Billing & Plans</h2>
              <p className="text-surface-400">Manage your subscription and billing</p>
            </div>

            {/* Current Plan */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-surface-400">Current Plan</span>
                  <h3 className="text-2xl font-bold text-white">{user?.plan || 'Free'}</h3>
                </div>
                <Button variant="primary">Upgrade Plan</Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <span className="text-sm text-surface-400">AI Credits</span>
                  <p className="text-lg font-semibold text-white">
                    {user?.credits?.ai - user?.usage?.aiCreditsUsed} / {user?.credits?.ai}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-surface-400">Storage</span>
                  <p className="text-lg font-semibold text-white">2.1 GB / 5 GB</p>
                </div>
                <div>
                  <span className="text-sm text-surface-400">Exports</span>
                  <p className="text-lg font-semibold text-white">
                    {user?.usage?.exportsThisMonth} / {user?.credits?.exports}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-medium text-surface-300 mb-3">Payment Method</h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-editor-card border border-editor-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-surface-800 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-surface-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">•••• •••• •••• 4242</p>
                    <p className="text-xs text-surface-500">Expires 12/24</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Update</Button>
              </div>
            </div>

            {/* Invoices */}
            <div>
              <h3 className="text-sm font-medium text-surface-300 mb-3">Recent Invoices</h3>
              <div className="space-y-2">
                {[
                  { date: 'Mar 1, 2024', amount: '$19.00', status: 'Paid' },
                  { date: 'Feb 1, 2024', amount: '$19.00', status: 'Paid' },
                  { date: 'Jan 1, 2024', amount: '$19.00', status: 'Paid' }
                ].map((invoice, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-editor-card border border-editor-border"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-surface-300">{invoice.date}</span>
                      <span className="text-sm text-white font-medium">{invoice.amount}</span>
                      <span className="badge-success">{invoice.status}</span>
                    </div>
                    <Button variant="ghost" size="icon-sm" icon={Download} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Keyboard Shortcuts</h2>
              <p className="text-surface-400">Learn shortcuts to speed up your workflow</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  category: 'General',
                  shortcuts: [
                    { keys: ['⌘', 'S'], action: 'Save project' },
                    { keys: ['⌘', 'Z'], action: 'Undo' },
                    { keys: ['⌘', '⇧', 'Z'], action: 'Redo' },
                    { keys: ['⌘', 'E'], action: 'Export' }
                  ]
                },
                {
                  category: 'Tools',
                  shortcuts: [
                    { keys: ['V'], action: 'Select tool' },
                    { keys: ['H'], action: 'Hand/Pan tool' },
                    { keys: ['B'], action: 'Brush tool' },
                    { keys: ['E'], action: 'Eraser tool' },
                    { keys: ['T'], action: 'Text tool' },
                    { keys: ['C'], action: 'Crop tool' }
                  ]
                },
                {
                  category: 'View',
                  shortcuts: [
                    { keys: ['⌘', '+'], action: 'Zoom in' },
                    { keys: ['⌘', '-'], action: 'Zoom out' },
                    { keys: ['⌘', '0'], action: 'Fit to screen' },
                    { keys: ['⌘', '1'], action: '100% zoom' }
                  ]
                }
              ].map((group) => (
                <div key={group.category}>
                  <h3 className="text-sm font-medium text-surface-300 mb-3">{group.category}</h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-editor-card border border-editor-border"
                      >
                        <span className="text-sm text-surface-300">{shortcut.action}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="px-2 py-1 text-xs rounded bg-surface-800 border border-surface-700 text-surface-300"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      activeSection === section.id
                        ? 'bg-primary-500/10 text-primary-300'
                        : 'text-surface-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-editor-border">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-editor-card border border-editor-border"
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}