// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notification = event.notification;
  
  if (action === 'mark-taken') {
    // Post message to mark medication as taken
    clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'MARK_TAKEN',
          prescriptionId: notification.data.prescriptionId,
          time: notification.data.time,
          date: notification.data.date
        });
      });
    });
  } else {
    // Open/focus app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
  
  notification.close();
});