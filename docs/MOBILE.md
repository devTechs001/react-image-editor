# 📱 Mobile Development Guide

## Overview
This guide covers mobile-specific implementations for iOS and Android using React Native/Capacitor.

## Approach Options

### Option 1: Progressive Web App (PWA)
**Best for:** Quick deployment, cross-platform consistency

```javascript
// vite.config.js - Already configured
plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'AI Media Editor',
      short_name: 'MediaEditor',
      display: 'standalone',
      orientation: 'any'
    }
  })
]
```

Mobile Optimizations:

```javascript
// frontend/src/hooks/mobile/useMobileDetection.js
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
    setIsTablet(/iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent));
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
    setIsAndroid(/Android/.test(userAgent));
  }, []);

  return { isMobile, isTablet, isIOS, isAndroid };
};
```

```javascript
// frontend/src/hooks/mobile/useTouchGestures.js
import { useRef, useCallback } from 'react';

export const useTouchGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onRotate,
    threshold = 50
  } = options;

  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2) {
      // Pinch/rotate gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      touchStart.current = {
        distance: Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        ),
        angle: Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        ) * 180 / Math.PI
      };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart.current) return;

    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      const scale = distance / touchStart.current.distance;
      onPinch({ scale });

      if (onRotate) {
        const angle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        ) * 180 / Math.PI;
        
        const rotation = angle - touchStart.current.angle;
        onRotate({ rotation });
      }
    }
  }, [onPinch, onRotate]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart.current || e.touches.length > 0) return;

    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Swipe detection
    if (Math.abs(deltaX) > threshold && deltaTime < 300) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight({ deltaX, deltaTime });
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft({ deltaX: Math.abs(deltaX), deltaTime });
      }
    }

    if (Math.abs(deltaY) > threshold && deltaTime < 300) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown({ deltaY, deltaTime });
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp({ deltaY: Math.abs(deltaY), deltaTime });
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
```

### Option 2: Capacitor (Recommended)
Installation:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

capacitor.config.ts:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mediaeditor.app',
  appName: 'AI Media Editor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      saveToGallery: true
    },
    Filesystem: {
      defaultDirectory: 'Documents'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;
```

Native Features:

```javascript
// frontend/src/services/mobile/nativeFeatures.js
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class NativeFeatures {
  // Camera
  static async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'uri',
      source: 'camera'
    });

    return image.webPath;
  }

  static async pickImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      source: 'photos'
    });

    return image.webPath;
  }

  // File System
  static async saveFile(data, filename) {
    await Filesystem.writeFile({
      path: filename,
      data: data,
      directory: 'Documents',
      recursive: true
    });
  }

  static async readFile(filename) {
    const file = await Filesystem.readFile({
      path: filename,
      directory: 'Documents'
    });

    return file.data;
  }

  // Share
  static async shareImage(url, title) {
    await Share.share({
      title: title,
      url: url,
      dialogTitle: 'Share your creation'
    });
  }

  // Haptics
  static async vibrate(style = ImpactStyle.Medium) {
    await Haptics.impact({ style });
  }
}
```

## Mobile UI Components

```javascript
// frontend/src/components/mobile/MobileToolbar.jsx
import React from 'react';
import { motion } from 'framer-motion';

const MobileToolbar = ({ tools, activeTool, onToolSelect }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onToolSelect(tool.id);
              Haptics.impact({ style: ImpactStyle.Light });
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${
              activeTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400'
            }`}
          >
            <tool.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{tool.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MobileToolbar;
```

## Performance Optimizations

```javascript
// Lazy loading images
import { useState, useEffect } from 'react';

export const LazyImage = ({ src, alt, placeholder }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoading ? 'opacity-50' : 'opacity-100'
      }`}
    />
  );
};
```

## Build & Deploy

```bash
# Build web version
npm run build

# Copy to native projects
npx cap copy

# Open in native IDE
npx cap open ios
npx cap open android

# Build for production
cd ios && xcodebuild # or Android Studio
```