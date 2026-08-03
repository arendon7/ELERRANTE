const CACHE = 'el-errante-v0-6-2';
const CORE = [
  './index.html','./historia.html','./tienda.html','./producto.html','./en-casa.html',
  './en-movimiento.html','./bitacora.html','./articulo.html','./recetas.html','./receta.html',
  './herramientas.html','./cobertura.html','./ayuda.html','./checkout.html','./cuenta.html',
  './assets/styles.css','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',
  './assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js',
  './assets/logo-mark.svg','./assets/logo-lockup.svg','./offline.html','./deploy-version.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirst(request){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&response.ok){
      const cache=await caches.open(CACHE);
      await cache.put(request,response.clone());
    }
    return response;
  }catch(error){
    return (await caches.match(request)) || (await caches.match('./offline.html'));
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached) return cached;
  const response=await fetch(request);
  if(response&&response.ok&&new URL(request.url).origin===self.location.origin){
    const cache=await caches.open(CACHE);
    await cache.put(request,response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  const isDocument=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('/deploy-version.txt');
  event.respondWith(isDocument?networkFirst(request):cacheFirst(request));
});
