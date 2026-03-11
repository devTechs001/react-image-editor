// frontend/src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Editor = lazy(() => import('./pages/Editor'));
const VideoEditor = lazy(() => import('./pages/VideoEditor'));
const AudioEditor = lazy(() => import('./pages/AudioEditor'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Templates = lazy(() => import('./pages/Templates'));
const Projects = lazy(() => import('./pages/Projects'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Help = lazy(() => import('./pages/Help'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="h-full"
  >
    {children}
  </motion.div>
);

function App({ onReady }) {
  useEffect(() => {
    // App is ready, hide splash screen
    const timer = setTimeout(() => {
      onReady?.();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="editor" element={<PageWrapper><Editor /></PageWrapper>} />
            <Route path="editor/:projectId" element={<PageWrapper><Editor /></PageWrapper>} />
            <Route path="video-editor" element={<PageWrapper><VideoEditor /></PageWrapper>} />
            <Route path="video-editor/:projectId" element={<PageWrapper><VideoEditor /></PageWrapper>} />
            <Route path="audio-editor" element={<PageWrapper><AudioEditor /></PageWrapper>} />
            <Route path="audio-editor/:projectId" element={<PageWrapper><AudioEditor /></PageWrapper>} />
            <Route path="gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
            <Route path="templates" element={<PageWrapper><Templates /></PageWrapper>} />
            <Route path="projects" element={<PageWrapper><Projects /></PageWrapper>} />
            <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
            <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
            <Route path="help" element={<PageWrapper><Help /></PageWrapper>} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;