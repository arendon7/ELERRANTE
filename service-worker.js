importScripts('./assets/brand-canon-v28.js');

const BRAND=self.EL_ERRANTE_BRAND_V28;
const CACHE=BRAND.cache;
const GENERATED=[
  './assets/generated/data-v28.js',
  './assets/generated/app-v28.js',
  './assets/generated/preprod-v28.js',
  './assets/generated/manifest-v28.json'
];
const CORE=[
  './index.html','./historia.html','./nosotros.html','./tienda.html','./producto.html','./en-casa.html',
  './en-movimiento.html','./bitacora.html','./articulo.html','./recetas.html','./receta.html',
  './herramientas.html','./cobertura.html','./ayuda.html','./checkout.html','./cuenta.html','./legal.html',
  './equipo.html','./admin.html','./activacion.html','./control.html','./operacion.html','./studio.html','./actas.html','./presentacion.html',
  './assets/styles.css','./assets/styles/brand-v1.css','./assets/brand-canon-v28.js','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',
  './assets/preprod.js','./assets/content-v5.js','./assets/content-v17.js','./assets/commerce-ux-v18.js','./assets/trust-v19.js','./assets/activation-v20.js','./assets/activation-v23.js','./assets/activation-v24.js','./assets/activation-v25.js','./assets/daily-ops-v21.js','./assets/production-v22.js','./assets/materials-data-v23.js','./assets/materials-v23.js','./assets/measurement-v24.js','./assets/procurement-v25.js','./assets/procurement-v25-guard.js','./assets/finance-v27.js','./assets/host-mode.js','./assets/commerce-runtime-config.js','./assets/commerce-config-v14.js','./assets/checkout-v15.js','./assets/admin-v15.js','./assets/commerce-v14.js','./assets/commerce-v14.css','./assets/commerce-v15.css','./assets/commerce-v16.css','./assets/commerce-v18.css','./assets/trust-v19.css','./assets/activation-v20.css','./assets/daily-ops-v21.css','./assets/production-v22.css','./assets/materials-v23.css','./assets/measurement-v24.css','./assets/procurement-v25.css','./assets/finance-v27.css','./assets/operations-v16.js','./assets/control.js','./assets/presentation.js',
  ...Object.values(BRAND.assets).filter(path=>path.startsWith('assets/')).map(path=>'./'+path),
  './assets/offer-studio-v09.js','./assets/offer-studio-v09.css','./assets/offer-governance-v09.js','./assets/offer-acts-preflight-v09.js','./assets/offer-acts-v09.js','./assets/offer-acts-v09.css','./assets/aire-tiempo-committee-v09.js','./assets/aire-tiempo-committee-v09.css',
  './backend/supabase/schema-v19.sql','./backend/supabase/schema-v20.sql','./backend/supabase/schema-v21.sql','./backend/supabase/schema-v22.sql','./backend/supabase/schema-v23.sql','./backend/supabase/schema-v24.sql','./backend/supabase/schema-v25.sql',
  './documentacion/modelo-oferta-v09.json','./documentacion/sesiones/aire-y-tiempo-paquete-comite-v09.json','./documentacion/sesiones/AIRE_Y_TIEMPO_PAQUETE_COMITE_V09.md',
  './assets/source/v040-app-001.b64','./assets/source/v040-app-002.b64','./assets/source/v040-app-003.b64','./assets/source/v040-app-004.b64','./assets/source/v040-app-005.b64','./assets/source/v040-app-006.b64',
  './assets/source/v040-data-001.b64','./assets/source/v040-data-002.b64','./assets/source/v040-data-003.b64','./assets/source/v040-data-004.b64',
  './assets/source/v040-preprod-001a.b64','./assets/source/v040-preprod-001b.b64','./assets/source/v040-preprod-001c.b64','./assets/source/v040-preprod-001d.b64','./assets/source/v040-preprod-002.b64','./assets/source/v040-preprod-003.b64',
  './offline.html','./deploy-version.txt'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll([...new Set(CORE)]);
    await Promise.allSettled(GENERATED.map(async path=>{
      const response=await fetch(path,{cache:'no-store'});
      if(response.ok)await cache.put(path,response);
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key.startsWith('el-errante-')&&key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});

function canonicalRequest(request){
  const url=new URL(request.url);
  const relative=url.pathname.replace(/^.*\/ELERRANTE\//,'').replace(/^\//,'');
  const resolved=BRAND.resolve(relative);
  if(!resolved||resolved===relative)return request;
  const target=new URL(resolved,self.registration.scope);
  return new Request(target.toString(),request);
}

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
  const canonical=canonicalRequest(request);
  const cached=await caches.match(canonical)||await caches.match(request);
  if(cached)return cached;
  const response=await fetch(canonical);
  if(response&&response.ok&&new URL(canonical.url).origin===self.location.origin){
    const cache=await caches.open(CACHE);
    await cache.put(canonical,response.clone());
  }
  return response;
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const fresh=request.mode==='navigate'||request.destination==='document'||url.pathname.endsWith('/deploy-version.txt')||url.pathname.endsWith('/assets/commerce-runtime-config.js')||url.pathname.endsWith('/assets/brand-canon-v28.js')||url.pathname.endsWith('/assets/generated/manifest-v28.json');
  event.respondWith(fresh?networkFirst(request):cacheFirst(request));
});

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
});
