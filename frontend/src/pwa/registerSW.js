// frontend/src/pwa/registerSW.js
import { registerSW } from 'virtual:pwa-register';

const updateInterval = 60 * 60 * 1000; // 1 hour

export function registerServiceWorker(onUpdate) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (onUpdate) {
        onUpdate();
      }
    },
    onOfflineReady() {
      console.log('PWA: App ready to work offline');
    },
    onRegistered(registration) {
      console.log('PWA: Service Worker registered', registration);
      
      // Check for updates periodically
      if (registration && updateInterval > 0) {
        setInterval(() => {
          registration.update();
        }, updateInterval);
      }
    },
    onRegisterError(error) {
      console.error('PWA: Service Worker registration failed', error);
    }
  });

  return updateSW;
}

export default registerServiceWorker;
