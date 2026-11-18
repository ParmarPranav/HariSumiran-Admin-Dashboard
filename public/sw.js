// HariSumiran Service Worker (PWA & Web Push Notification Handler)
const CACHE_NAME = "harisumiran-v1";
const OFFLINE_URL = "/super-admin";

const STATIC_ASSETS = [
  "/",
  "/super-admin",
  "/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

// 1. Service Worker Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Asset precache partial fail:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Service Worker Activation & Cache Cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Network First with Cache Fallback for Navigation/Pages
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignore non-GET or chrome-extension requests
  if (req.method !== "GET" || !req.url.startsWith("http")) {
    return;
  }

  // API calls always go to network directly without caching
  if (req.url.includes("/api/")) {
    return;
  }

  // Static assets (images, icons, fonts) - Stale While Revalidate
  if (
    req.destination === "image" ||
    req.destination === "font" ||
    req.url.includes("/icons/")
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML Navigation Requests - Network first, fallback to cached offline shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match(req).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
    );
  }
});

// 4. Push Notification Event Listener (Web Push / FCM)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "HariSumiran Alert",
      body: event.data ? event.data.text() : "New update from HariPrabodham, Nadiad.",
    };
  }

  const title = data.title || data.notification?.title || "HariSumiran Mandir Alert";
  const body =
    data.body ||
    data.notification?.body ||
    "You have a new institutional notification from HariPrabodham.";
  const url =
    data.deepLinkRoute ||
    data.data?.deepLinkRoute ||
    data.data?.url ||
    "/super-admin";

  const options = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url,
      timestamp: Date.now(),
    },
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/super-admin";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If an app tab is already open, focus it and navigate
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
