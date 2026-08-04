const CACHE = 'el-errante-v0-6-9';
const LEGACY_CACHES = ['el-errante-v0-6-8'];
const CORE = [
  './index.html','./historia.html','./tienda.html','./producto.html','./en-casa.html',
  './en-movimiento.html','./bitacora.html','./articulo.html','./recetas.html','./receta.html',
  './herramientas.html','./cobertura.html','./ayuda.html','./checkout.html','./cuenta.html',
  './equipo.html','./admin.html','./control.html','./operacion.html','./studio.html','./actas.html','./presentacion.html',
  './assets/styles.css','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',
  './assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js','./assets/control.js','./assets/presentation.js',
  './assets/offer-studio-v09.js','./assets/offer-studio-v09.css','./assets/offer-governance-v09.js',
  './assets/offer-acts-preflight-v09.js','./assets/offer-acts-v09.js','./assets/offer-acts-v09.css',
  './assets/aire-tiempo-committee-v09.js','./assets/aire-tiempo-committee-v09.css',
  './documentacion/modelo-oferta-v09.json',
  './documentacion/sesiones/aire-y-tiempo-paquete-comite-v09.json',
  './documentacion/sesiones/AIRE_Y_TIEMPO_PAQUETE_COMITE_V09.md',
  './assets/source/v040-app-001.b64','./assets/source/v040-app-002.b64','./assets/source/v040-app-003.b64','./assets/source/v040-app-004.b64','./assets/source/v040-app-005.b64','./assets/source/v040-app-006.b64',
  './assets/source/v040-data-001.b64','./assets/source/v040-data-002.b64','./assets/source/v040-data-003.b64','./assets/source/v040-data-004.b64',
  './assets/source/v040-preprod-001a.b64','./assets/source/v040-preprod-001b.b64','./assets/source/v040-preprod-001c.b64','./assets/source/v040-preprod-001d.b64','./assets/source/v040-preprod-002.b64','./assets/source/v040-preprod-003.b64',
  './assets/images/v040/v040-hero-desktop.svg','./assets/images/v040/v040-hero-mobile.svg','./assets/images/v040/v040-harina-empaques.svg','./assets/images/v040/v040-harina-manos.svg','./assets/images/v040/v040-harina-horno.svg','./assets/images/v040/v040-manos-masa.svg','./assets/images/v040/v040-masa-apertura.svg','./assets/images/v040/v040-alveolos.svg','./assets/images/v040/v040-fermentacion.svg','./assets/images/v040/v040-pizza-neo.svg','./assets/images/v040/v040-pizza-errante.svg','./assets/images/v040/v040-despensa.svg','./assets/images/v040/v040-aplicaciones-empaque.svg','./assets/images/v040/v040-pizzeria-movil.svg','./assets/images/v040/v040-bitacora-fuego.svg','./assets/images/v040/v040-pizzas-artesanales.svg','./assets/images/v040/v040-pizzas-coleccion.svg',
  './assets/logo-mark.svg','./assets/logo-lockup.svg','./offline.html','./deploy-version.txt'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
async function networkFirst(request){try{const response=await fetch(request,{cache:'no-store'});if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch(error){return (await caches.match(request))||(await caches.match('./offline.html'));}}
async function cacheFirst(request){const cached=await caches.match(request);if(cached)return cached;const response=await fetch(request);if(response&&response.ok&&new URL(request.url).origin===self.location.origin){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;const isDocument=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('/deploy-version.txt');event.respondWith(isDocument?networkFirst(request):cacheFirst(request));});
