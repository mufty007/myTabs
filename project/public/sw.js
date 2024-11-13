// Service Worker for Push Notifications
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notification = event.notification;

  if (action === 'mark-taken') {
    clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        try {
          client.postMessage({
            type: 'MARK_TAKEN',
            prescriptionId: notification.data.prescriptionId,
            time: notification.data.time,
            date: notification.data.date
          });
        } catch (error) {
          console.error("Failed to post message to client:", error);
        }
      });
    }).catch((error) => {
      console.error("Failed to match clients:", error);
    });
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow('/').catch((error) => {
            console.error("Failed to open window:", error);
          });
        }
      }).catch((error) => {
        console.error("Failed to match clients:", error);
      })
    );
  }

  notification.close();
});
