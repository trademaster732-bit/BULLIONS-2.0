// This file is intentionally left blank.
// Service workers can be used for push notifications and offline capabilities.
// For AdSense approval, it's better to start with a minimal service worker.

self.addEventListener('install', (event) => {
  console.log('BULLIONS BOT Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('BULLIONS BOT Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // We are not caching anything for now, just letting the browser handle requests.
  // This is the safest approach to avoid issues with AdSense crawlers.
  event.respondWith(fetch(event.request));
});
