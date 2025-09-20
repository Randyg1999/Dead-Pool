// Service Worker for Dead Pool Push Notifications

const CACHE_NAME = 'dead-pool-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: '💀 Dead Pool Alert!',
    body: 'Someone has died! Check your standings.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'dead-pool-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Check Standings'
      }
    ]
  };

  // If push has data, parse it
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (e) {
      console.log('Push data was not JSON:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Background sync for checking deaths (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-deaths') {
    console.log('Background sync: checking for deaths');
    // Future: implement background death checking
  }
});
