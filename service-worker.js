const CACHE = 'el-errante-v0-3-0';
const CORE = [
  './index.html','./tienda.html','./producto.html','./en-casa.html',
  './en-movimiento.html','./bitacora.html','./recetas.html',
  './herramientas.html','./cobertura.html','./ayuda.html',
  './assets/styles.css','./assets/data.js','./assets/app.js',
  './assets/preprod.js','./assets/logo-mark.svg','./assets/logo-lockup.svg',
  './offline.html'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response=>{
      const clone=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,clone));
      return response;
    }).catch(()=>caches.match('./offline.html')))
  );
});
