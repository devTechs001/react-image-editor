// frontend/src/pages/Profile.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Camera,
  Lock,
  CreditCard,
  Bell,
  Palette,
  Globe,
  Upload,
  Save,
  Shield,
  Zap,
  History
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers/cn';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || ''
  });
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'dark',
    language: user?.preferences?.language || 'en',
    notifications: user?.preferences?.notifications || {
      email: true,
      push: true
    }
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, [formData, updateProfile]);

  const stats = [
    { label: 'Projects', value: user?.stats?.projects || 0, icon: Camera },
    { label: 'Exports', value: user?.stats?.exports || 0, icon: Upload },
    { label: 'AI Credits', value: user?.credits?.ai - user?.usage?.aiCreditsUsed || 50, icon: Zap },
    { label: 'Storage Used', value: `${((user?.usage?.storageUsed || 0) / 1024 / 1024).toFixed(0)}MB`, icon: History }
  ];

  return (
    <div className="min-h-screen bg-editor-bg p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-surface-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center border-2 border-editor-card">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
                <p className="text-sm text-surface-400">{user?.email}</p>
                <span className={cn(
                  'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium',
                  user?.plan === 'pro' ? 'bg-primary-500/20 text-primary-300' :
                  user?.plan === 'enterprise' ? 'bg-secondary-500/20 text-secondary-300' :
                  'bg-surface-500/20 text-surface-300'
                )}>
                  {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} Plan
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-editor-border">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <Icon className="w-4 h-4 text-surface-400 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                      <p className="text-xs text-surface-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary-400" />
                    <Card.Title>Personal Information</Card.Title>
                  </div>
                  {!isEditing ? (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSave} icon={Save}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    icon={User}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={true}
                    icon={Mail}
                  />
                  <Input
                    label="Website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing}
                    icon={Globe}
                  />
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Security */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-400" />
                  <Card.Title>Security</Card.Title>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-editor-surface/50">
                    <div>
                      <p className="text-sm font-medium text-white">Password</p>
                      <p className="text-xs text-surface-500">Last changed 30 days ago</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-editor-surface/50">
                    <div>
                      <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-surface-500">Add an extra layer of security</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Preferences */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary-400" />
                  <Card.Title>Preferences</Card.Title>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Theme</label>
                    <div className="flex gap-2">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setPreferences({ ...preferences, theme })}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            preferences.theme === theme
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                              : 'bg-editor-card text-surface-400 border border-editor-border hover:border-surface-500'
                          )}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-editor-card border border-editor-border text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Notifications */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary-400" />
                  <Card.Title>Notifications</Card.Title>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Receive browser notifications' },
                    { key: 'marketing', label: 'Marketing Emails', description: 'Product updates and offers' }
                  ].map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{option.label}</p>
                        <p className="text-xs text-surface-500">{option.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications?.[option.key] || false}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [option.key]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 rounded border-editor-border text-primary-500 focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          size="md"
        >
          <div className="space-y-4">
            <Input label="Current Password" type="password" icon={Lock} />
            <Input label="New Password" type="password" icon={Lock} />
            <Input label="Confirm New Password" type="password" icon={Lock} />
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Update Password
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
