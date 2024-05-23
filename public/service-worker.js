/* eslint-disable no-restricted-globals */

self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated.');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  console.log('Push event received:', event);

  let data = { title: 'Default title', body: 'Default message' };
  
  if (event.data) {
    try {
      data = event.data.json();
      console.log('Push event data:', data);
    } catch (e) {
      console.error('Error parsing push event data:', e);
    }
  }

  const title = data.title;
  const options = {
    body: data.body,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');

  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientsArr => {
      const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url === 'https://your-website.com' ? (windowClient.focus(), true) : false);

      if (!hadWindowToFocus) self.clients.openWindow('https://your-website.com');
    })
  );
});