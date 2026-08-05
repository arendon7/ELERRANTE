const CACHE = 'el-errante-v1-3-0';
const CORE = [
  './index.html','./historia.html','./nosotros.html','./tienda.html','./producto.html','./en-casa.html',
  './en-movimiento.html','./bitacora.html','./articulo.html','./recetas.html','./receta.html',
  './herramientas.html','./cobertura.html','./ayuda.html','./checkout.html','./cuenta.html','./legal.html',
  './equipo.html','./admin.html','./control.html','./operacion.html','./studio.html','./actas.html','./presentacion.html',
  './assets/styles.css','./assets/styles/brand-v1.css','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',
  './assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js','./assets/control.js','./assets/presentation.js',
  './assets/images/brand-final/home-hero.webp','./assets/images/brand-final/home-hero-mobile.webp','./assets/images/brand-final/home-masa-fuego.webp','./assets/images/brand-final/home-fermentacion.webp','./assets/images/brand-final/home-ingredientes.webp','./assets/images/brand-final/home-compartir.webp','./assets/images/brand-final/home-en-casa.webp','./assets/images/brand-final/home-despensa.webp',
  './assets/images/brand-final/evento-hero.webp','./assets/images/brand-final/evento-noche.webp','./assets/images/brand-final/evento-servicio.webp','./assets/images/brand-final/og-el-errante.webp',
  './assets/images/brand-final/producto-harina.webp','./assets/images/brand-final/producto-crea-tuya.webp','./assets/images/brand-final/producto-margherita.webp','./assets/images/brand-final/producto-diavola.webp','./assets/images/brand-final/producto-bosque.webp','./assets/images/brand-final/producto-cuatro-quesos.webp','./assets/images/brand-final/producto-la-errante.webp','./assets/images/brand-final/producto-salsa-tomate.webp','./assets/images/brand-final/producto-reduccion-balsamica.webp','./assets/images/brand-final/producto-panela-maracuya.webp','./assets/images/brand-final/producto-combo-primera-ruta.webp','./assets/images/brand-final/manifest-hq-v13.json',
  './assets/offer-studio-v09.js','./assets/offer-studio-v09.css','./assets/offer-governance-v09.js','./assets/offer-acts-preflight-v09.js','./assets/offer-acts-v09.js','./assets/offer-acts-v09.css','./assets/aire-tiempo-committee-v09.js','./assets/aire-tiempo-committee-v09.css',
  './documentacion/modelo-oferta-v09.json','./documentacion/sesiones/aire-y-tiempo-paquete-comite-v09.json','./documentacion/sesiones/AIRE_Y_TIEMPO_PAQUETE_COMITE_V09.md',
  './assets/source/v040-app-001.b64','./assets/source/v040-app-002.b64','./assets/source/v040-app-003.b64','./assets/source/v040-app-004.b64','./assets/source/v040-app-005.b64','./assets/source/v040-app-006.b64',
  './assets/source/v040-data-001.b64','./assets/source/v040-data-002.b64','./assets/source/v040-data-003.b64','./assets/source/v040-data-004.b64',
  './assets/source/v040-preprod-001a.b64','./assets/source/v040-preprod-001b.b64','./assets/source/v040-preprod-001c.b64','./assets/source/v040-preprod-001d.b64','./assets/source/v040-preprod-002.b64','./assets/source/v040-preprod-003.b64',
  './assets/logo-mark.svg','./assets/logo-lockup.svg','./offline.html','./deploy-version.txt'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
async function networkFirst(request){try{const response=await fetch(request,{cache:'no-store'});if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch(error){return (await caches.match(request))||(await caches.match('./offline.html'));}}
async function cacheFirst(request){const cached=await caches.match(request);if(cached)return cached;const response=await fetch(request);if(response&&response.ok&&new URL(request.url).origin===self.location.origin){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;const isDocument=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('/deploy-version.txt');event.respondWith(isDocument?networkFirst(request):cacheFirst(request));});
