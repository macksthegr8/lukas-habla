// Offline cache: the whole app works with no internet once it's opened once.
const CACHE = "lukas-habla-v1";
const FILES = [
  "./", "index.html", "styles.css", "data.js", "app.js", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Try the network first so updates show up right away, but give up after
// 1.5 seconds and use the saved copy, so it still opens fast with bad or no wifi.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    });
    if (!hit) return net;
    const timeout = new Promise((res) => setTimeout(() => res(hit), 1500));
    return Promise.race([net.catch(() => hit), timeout]);
  })());
});
