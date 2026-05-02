// Vaultify Service Worker - Offline Favorites Cache
const CACHE_NAME = "vaultify-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

function isDevAsset(url, request) {
  if (url.pathname.startsWith("/src/")) return true;
  if (url.pathname.startsWith("/@vite/")) return true;
  if (url.pathname.startsWith("/@id/")) return true;
  if (url.pathname.includes("/node_modules/.vite/")) return true;
  if (request.headers.get("accept")?.includes("text/x-vite-module")) return true;
  if (url.searchParams.has("t")) return true;
  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (isDevAsset(url, request)) return;

  if (url.hostname === "api.github.com") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_FAVORITES") {
    const favoritesData = event.data.payload;
    caches.open(CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(favoritesData), {
        headers: { "Content-Type": "application/json" },
      });
      cache.put("/offline/favorites", response);
    });
  }
});
