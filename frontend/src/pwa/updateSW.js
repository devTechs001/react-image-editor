// frontend/src/pwa/updateSW.js
import { useEffect, useState } from 'react';
import { registerServiceWorker } from './registerSW';

export function useServiceWorkerUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateWorker, setUpdateWorker] = useState(null);

  useEffect(() => {
    const updateSW = registerServiceWorker(() => {
      setIsUpdateAvailable(true);
    });

    setUpdateWorker(() => updateSW);

    return () => {
      if (updateSW) {
        updateSW();
      }
    };
  }, []);

  const update = async () => {
    if (updateWorker) {
      await updateWorker();
      setIsUpdateAvailable(false);
    }
  };

  return { isUpdateAvailable, update };
}

export default useServiceWorkerUpdate;
