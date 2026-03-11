// frontend/src/pwa/notifications.js

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Send local notification
export function sendNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    ...options
  };

  return new Notification(title, defaultOptions);
}

// Send notification from service worker
export function sendNotificationFromSW(registration, data) {
  const { title, body, icon, badge, data: customData } = data;

  return registration.showNotification(title, {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: customData,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
}

// Check notification support
export function isNotificationSupported() {
  return 'Notification' in window;
}

// Check notification permission
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export default {
  requestNotificationPermission,
  sendNotification,
  sendNotificationFromSW,
  isNotificationSupported,
  getNotificationPermission
};
