// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Image as ImageIcon,
  Video,
  Music,
  Layout,
  FolderOpen,
  Star,
  Settings,
  HelpCircle,
  Sparkles,
  Wand2,
  Layers,
  Palette,
  Zap,
  PaintBucket,
  Crown,
  X,
  GalleryVerticalEnd,
  Smile,
  BarChart3,
  Scan,
  Target
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

const mainNavItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
  { icon: ImageIcon, label: 'Image Editor', path: '/editor' },
  { icon: Video, label: 'Video Editor', path: '/video-editor' },
  { icon: Music, label: 'Audio Editor', path: '/audio-editor' },
  { icon: GalleryVerticalEnd, label: 'Gallery', path: '/gallery' },
  { icon: HelpCircle, label: 'About', path: '/about' }
];

const toolsNavItems = [
  { icon: Wand2, label: 'AI Studio', path: '/editor', badge: 'New' },
  { icon: Layers, label: 'Templates', path: '/templates' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Palette, label: 'Assets', path: '/assets' },
  { icon: Smile, label: 'Face Swap', path: '/editor?tool=face-swap' },
  { icon: ImageIcon, label: 'Replace BG', path: '/editor?tool=background-replace' },
  { icon: PaintBucket, label: 'Colorize', path: '/editor?tool=colorize' },
  { icon: Scan, label: 'Face Detect', path: '/editor?tool=face-detect' },
  { icon: Target, label: 'Object Detect', path: '/editor?tool=object-detect' }
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  { icon: Star, label: 'Go Pro', path: '/pricing', highlight: true }
];

export default function Navbar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || (item.path.includes('/editor') && location.pathname.includes('/editor'));
    const Icon = item.icon;

    if (item.highlight) {
      return (
        <Link
          to={item.path}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:border-amber-500/50"
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{item.label}</span>
          <Crown className="w-4 h-4 ml-auto text-amber-400" />
        </Link>
      );
    }

    return (
      <Link
        to={item.path}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group',
          isActive
            ? 'bg-primary-500/10 text-primary-400'
            : 'text-surface-400 hover:text-white hover:bg-white/5'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
          />
        )}
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} />
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="w-[280px] h-full bg-editor-surface border-r border-editor-border flex flex-col">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-editor-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">AI Media</h1>
            <p className="text-xs text-surface-500">Studio</p>
          </div>
        </Link>
        
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Create */}
      <div className="p-4">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            navigate('/editor');
            onClose?.();
          }}
        >
          <Zap className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-6">
          <h3 className="px-4 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
            Main
          </h3>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="px-4 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
            Tools
          </h3>
          <div className="space-y-1">
            {toolsNavItems.map((item) => (
              <NavItem key={item.path + item.label} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Go Pro</h4>
              <p className="text-xs text-surface-400">Unlock all features</p>
            </div>
          </div>
          <Button
            variant="glass"
            size="sm"
            fullWidth
            onClick={() => navigate('/pricing')}
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-editor-border">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </nav>
  );
}