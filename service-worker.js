const CACHE = "nyeonjeon-static-v9";
const APP_SHELL = ["/", "/index.html", "/styles.css", "/app.js", "/streak.js", "/week-calendar.js", "/story-selection.js", "/illustration-map.js", "/calendar-lock.js", "/data/events.js", "/data/november-research.js", "/data/widget-daily.js", "/manifest.webmanifest", "/star.svg", "/widget.html", "/widget.css", "/widget.js", "/images/story-placeholder-bw.jpg", "/images/app-icon-192.png", "/images/app-icon-512.png"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("nyeonjeon-static-") && key !== CACHE).map(key => caches.delete(key))).then(() => self.clients.claim()))));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match(event.request)));
});
