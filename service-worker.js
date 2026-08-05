const CACHE='el-errante-v1-1-1';
const CACHE_PREFIX='el-errante-';
const CORE=[
  './','./index.html','./tienda.html','./producto.html','./en-casa.html','./en-movimiento.html','./offline.html',
  './assets/styles.css','./assets/styles/brand-v1.css','./assets/data.js','./assets/products-v6.js',
  './assets/runtime.js','./assets/app.js','./assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js',
  './assets/logo-mark.svg','./assets/logo-lockup.svg','./manifest.webmanifest','./deploy-version.txt'
];

// Visuales editoriales disponibles bajo demanda. No bloquean la instalación.
const LAZY_VISUAL_ASSETS=[
  './assets/images/brand-final/home-hero.svg',
  './assets/images/brand-final/home-masa-fuego.svg',
  './assets/images/brand-final/home-fermentacion.svg',
  './assets/images/brand-final/home-ingredientes.svg'
];

// Fuentes canónicas disponibles bajo demanda. No se precargan durante install.
const LAZY_SOURCE_ASSETS=[
  './assets/source/v040-app-001.b64','./assets/source/v040-app-002.b64','./assets/source/v040-app-003.b64',
  './assets/source/v040-app-004.b64','./assets/source/v040-app-005.b64','./assets/source/v040-app-006.b64',
  './assets/source/v040-data-001.b64','./assets/source/v040-data-002.b64','./assets/source/v040-data-003.b64','./assets/source/v040-data-004.b64',
  './assets/source/v040-preprod-001a.b64','./assets/source/v040-preprod-001b.b64','./assets/source/v040-preprod-001c.b64',
  './assets/source/v040-preprod-001d.b64','./assets/source/v040-preprod-002.b64','./assets/source/v040-preprod-003.b64'
];

async function cacheCore(){
  const cache=await caches.open(CACHE);
  await Promise.allSettled(CORE.map(async path=>{
    const response=await fetch(path,{cache:'reload'});
    if(response.ok) await cache.put(path,response);
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(cacheCore());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key))))
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
    return (await caches.match(request))||(await caches.match('./offline.html'));
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

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  const isDocument=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('/deploy-version.txt');
  event.respondWith(isDocument?networkFirst(request):cacheFirst(request));
});