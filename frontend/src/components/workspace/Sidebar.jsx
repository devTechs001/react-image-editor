// frontend/src/components/workspace/Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Settings, 
  HelpCircle, 
  History, 
  Sparkles,
  Database,
  Grid
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';

export default function Sidebar({ isOpen, onToggle, activeTab, onTabChange }) {
  const sidebarItems = [
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'assets', icon: Database, label: 'Assets' },
    { id: 'presets', icon: Grid, label: 'Presets' },
    { id: 'ai', icon: Sparkles, label: 'AI Tools' },
    { id: 'history', icon: History, label: 'History' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 64 : 0 }}
      className={cn(
        "flex flex-col h-full bg-editor-surface border-r border-editor-border relative",
        !isOpen && "overflow-hidden"
      )}
    >
      {/* Top Toggle Button */}
      <div className="h-12 flex items-center justify-center border-b border-editor-border">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-all"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 py-4 flex flex-col items-center gap-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                "p-3 rounded-xl transition-all relative group",
                isActive 
                  ? "bg-primary-500/10 text-primary-400" 
                  : "text-surface-400 hover:text-white hover:bg-white/5"
              )}
              title={item.label}
            >
              <Icon size={24} />
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                />
              )}
              {/* Tooltip for collapsed state would go here */}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="py-4 border-t border-editor-border flex flex-col items-center gap-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="p-3 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
              title={item.label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
