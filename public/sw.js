// Separate navigation shells. The main visit never prefetches the 3D experience.
const CACHE_NAME = "lumina-tarot-v4.1";
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./robots.txt",
];
const scope = new URL("./", self.location.href);
const mesaShell = new URL("mesa-3d/index.html", scope).href;
const mainShell = new URL("index.html", scope).href;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .catch(() => {}),
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  // Retain the previous cache for clients still running its hashed bundles.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("lumina-tarot-") && k !== CACHE_NAME)
          .slice(0, -1)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache development sources or Vite's module graph.
  if (/\/(?:src|@vite|@fs|node_modules)\//.test(url.pathname)) return;
  const isMesa = url.pathname.startsWith(new URL("mesa-3d/", scope).pathname);
  if (event.request.mode === "navigate") {
    const shell = isMesa ? mesaShell : mainShell;
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(shell, copy)),
            );
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(shell);
          if (cached) return cached;
          return new Response(
            `<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width"><title>Mesa offline · Lumina</title><body style="background:#111d29;color:#f1e9d9;font:18px system-ui;padding:32px"><h1>A mesa precisa de conexão</h1><p>Os recursos desta experiência ainda não estão disponíveis neste navegador. Reconecte para abrir a mesa. As sessões salvas permanecem no dispositivo.</p><p><a style="color:#d9bd83" href="${url.href}">Tentar novamente</a></p><a style="color:#d9bd83" href="${scope.href}">Voltar ao Lumina</a></body></html>`,
            {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            },
          );
        }),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.status === 200 && response.type === "basic") {
              const copy = response.clone();
              event.waitUntil(
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, copy)),
              );
            }
            return response;
          })
          .catch(
            () => new Response("Recurso indisponível offline", { status: 503 }),
          ),
    ),
  );
});
