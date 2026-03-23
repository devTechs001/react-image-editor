// frontend/src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useMediaQuery } from '@/hooks/utils/useMediaQuery';
import { cn } from '@/utils/helpers/cn';

export default function Layout() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const isEditorPage = location.pathname.includes('/editor');

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Full-width layout for editor pages
  if (isEditorPage) {
    return (
      <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-editor-bg">
      {/* Sidebar Navigation - Desktop */}
      <AnimatePresence mode="wait">
        {!isMobile && sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen z-30"
          >
            <Navbar onClose={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col h-screen transition-all duration-300 overflow-hidden',
          !isMobile && sidebarOpen ? 'ml-[280px]' : 'ml-0'
        )}
      >
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-dark flex flex-col">
          <div className="container-custom py-8 flex-1">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="border-t border-editor-border py-6 mt-auto">
            <div className="container-custom">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-surface-500">
                  © 2024 AI Media Studio. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <Link to="/about" className="text-sm text-surface-500 hover:text-white transition-colors">
                    About
                  </Link>
                  <Link to="/terms" className="text-sm text-surface-500 hover:text-white transition-colors">
                    Terms
                  </Link>
                  <Link to="/privacy" className="text-sm text-surface-500 hover:text-white transition-colors">
                    Privacy
                  </Link>
                  <Link to="/help" className="text-sm text-surface-500 hover:text-white transition-colors">
                    Help
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen z-50"
            >
              <Navbar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}