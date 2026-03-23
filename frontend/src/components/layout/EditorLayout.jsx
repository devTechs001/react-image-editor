// frontend/src/components/layout/EditorLayout.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toolbar from '../workspace/Toolbar';
import RightPanel from '../workspace/RightPanel';
import Sidebar from '../workspace/Sidebar';
import StatusBar from '../workspace/StatusBar';
import ToolOptions from '../workspace/ToolOptions';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';

export default function EditorLayout({ children }) {
  const { ui, activeTool } = useEditor();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden text-surface-100">
      {/* Top Section: Tool Options & Global Controls */}
      <div className="h-12 flex-shrink-0 border-b border-editor-border bg-editor-surface flex items-center px-4">
        <ToolOptions tool={activeTool} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sidebar & Main Toolbar */}
        <div className="flex flex-shrink-0 border-r border-editor-border bg-editor-surface">
          <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Toolbar />
        </div>

        {/* Center: Main Viewport / Canvas */}
        <main className="flex-1 relative flex flex-col overflow-hidden bg-editor-canvas shadow-inner">
          <div className="flex-1 relative overflow-hidden">
            {children}
          </div>
          
          {/* Bottom: Status Bar */}
          <StatusBar />
        </main>

        {/* Right: Properties & Layers Panel */}
        <AnimatePresence mode="wait">
          {ui.rightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 border-l border-editor-border bg-editor-surface"
            >
              <RightPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
