const CACHE_NAME = "popup-pos-v1";

// Recursively cache a URL, and if it's a stylesheet, also cache whatever it
// references (this is how self-hosted font files get pulled in) so a single
// visit is enough to make the app fully available offline afterward.
async function cacheAndParse(cache, url, seen) {
  if (seen.has(url)) return;
  seen.add(url);
  let response;
  try {
    response = await fetch(url, { cache: "reload" });
  } catch (err) {
    return;
  }
  if (!response || !response.ok) return;
  const clone = response.clone();
  await cache.put(url, response);
  if (url.endsWith(".css")) {
    const text = await clone.text();
    const refs = Array.from(text.matchAll(/url\((?:"|')?(\/_next\/[^"')]+)(?:"|')?\)/g)).map((m) => m[1]);
    await Promise.all(refs.map((u) => cacheAndParse(cache, u, seen)));
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const seen = new Set();
      try {
        const res = await fetch("/", { cache: "reload" });
        if (res.ok) {
          await cache.put("/", res.clone());
          const html = await res.text();
          const assetUrls = Array.from(html.matchAll(/(?:href|src)="(\/_next\/[^"]+)"/g)).map((m) => m[1]);
          await Promise.all(assetUrls.map((u) => cacheAndParse(cache, u, seen)));
        }
      } catch (err) {
        // offline during install shouldn't normally happen; runtime caching below
        // will fill the cache in as soon as a request does succeed.
      }
      await cache.addAll(["/manifest.json", "/icon.svg"]).catch(() => {});
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first, falling back to cache, for everything after install — keeps
// the cache fresh across redeploys while still working with no connectivity.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === "navigate") {
          const fallback = await cache.match("/");
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
