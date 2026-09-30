// Service worker do app AutoRegião.
// Propositalmente simples: NÃO guarda páginas nem anúncios (preço/anúncio desatualizado seria pior
// que carregar de novo). Só mostra uma página "sem internet" quando a navegação falha offline.
const CACHE = "autoregiao-v1";
const OFFLINE = "/offline";
const ESSENCIAIS = [OFFLINE, "/icones/icone-192.png"];

self.addEventListener("install", evento => {
  evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(c => c !== CACHE).map(c => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", evento => {
  if (evento.request.mode !== "navigate") return; // o resto segue direto para a internet
  evento.respondWith(fetch(evento.request).catch(() => caches.match(OFFLINE)));
});
