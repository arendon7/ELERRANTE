(()=>{
  'use strict';

  const hosted=location.protocol==='https:'||location.hostname.endsWith('github.io');
  const INTERNAL_PAGES=new Set(['centro-interno','admin','activacion','control','operacion','finanzas','studio','actas','presentacion']);
  const INTERNAL_TARGETS=new Set(['centro-interno.html','admin.html','activacion.html','control.html','operacion.html','finanzas.html','studio.html','actas.html','presentacion.html']);
  const LOW_PRIORITY_NAV=new Set(['recetas.html','herramientas.html','cobertura.html','ayuda.html','legal.html']);

  function readText(path){
    const request=new XMLHttpRequest();request.open('GET',path,false);request.send(null);
    if(request.status!==200&&request.status!==0)throw new Error('No se pudo cargar '+path);
    return request.responseText;
  }
  if(!window.EL_ERRANTE_BRAND_V28)(0,eval)(readText('assets/brand-canon-v28.js'));
  const BRAND=window.EL_ERRANTE_BRAND_V28;

  function applySpecialPageAssets(){
    const page=document.body?.dataset?.page||'';
    if(page==='nosotros'){
      const hero=document.querySelector('.hero .hero-media img');if(hero){hero.src=BRAND.assets.homeIngredientes;hero.alt='Ingredientes seleccionados para las pizzas El Errante';}
    }
    if(page==='equipo'){
      const hero=document.querySelector('.hero .hero-media img');if(hero){hero.src=BRAND.assets.homeCompartir;hero.alt='Personas compartiendo alrededor de El Errante';}
    }
  }

  function recover(scope=document){BRAND.applyToDom(scope);applySpecialPageAssets();}
  function observe(){
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType!==Node.ELEMENT_NODE)continue;
          recover(node.matches?.('img[src],source[srcset]')?node.parentElement||document:node);
          const touchesFooter=node.id==='site-footer'||node.closest?.('#site-footer')||node.querySelector?.('#site-footer');
          if(touchesFooter)ensureUserAccess();
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  async function refresh(){
    try{
      if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('el-errante-')&&key!==BRAND.cache).map(key=>caches.delete(key)));}
      if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});await registration.update();}
      localStorage.setItem('ee_public_version','2.9.0-editorial');localStorage.setItem('ee_brand_canon',BRAND.version);localStorage.setItem('ee_public_cache',BRAND.cache);
    }catch(error){console.warn('No fue posible actualizar la caché canónica de El Errante.',error);}
  }

  function hrefOf(link){return (link.getAttribute('href')||'').split('?')[0].split('#')[0].replace(/^\.\//,'');}
  function add(container,selector,label,href,beforeSelector,className=''){if(!container||container.querySelector(selector))return;const link=document.createElement('a');link.href=href;link.textContent=label;if(className)link.className=className;const before=beforeSelector?container.querySelector(beforeSelector):null;container.insertBefore(link,before||null);}

  function curatePublicNav(container,mobile=false){
    if(!container)return;
    container.querySelectorAll('a').forEach(link=>{const href=hrefOf(link);if(INTERNAL_TARGETS.has(href)||LOW_PRIORITY_NAV.has(href)||href==='historia.html'||href==='equipo.html'||href==='producto.html'||href==='cuenta.html')link.remove();});
    const cls=mobile?'btn btn-outline':'';
    add(container,'a[href="tienda.html"]','Tienda','tienda.html',null,cls);add(container,'a[href="en-casa.html"]','En casa','en-casa.html',null,cls);add(container,'a[href="nosotros.html"]','Nuestra cocina','nosotros.html','a[href="bitacora.html"]',cls);add(container,'a[href="bitacora.html"]','Bitácora','bitacora.html','a[href="en-movimiento.html"]',cls);add(container,'a[href="en-movimiento.html"]','Eventos','en-movimiento.html',null,cls);
    const labels={'tienda.html':'Tienda','en-casa.html':'En casa','nosotros.html':'Nuestra cocina','bitacora.html':'Bitácora','en-movimiento.html':'Eventos'};container.querySelectorAll('a').forEach(link=>{const href=hrefOf(link);if(labels[href])link.textContent=labels[href];});
  }

  function ensureUserAccess(){
    const footer=document.querySelector('#site-footer');if(!footer||footer.querySelector('a[href="acceso.html"]'))return;
    const target=[...footer.querySelectorAll('nav,.footer-links,.footer-bottom,.container,div')].find(node=>node.querySelector?.('a'))||footer;
    const link=document.createElement('a');link.href='acceso.html';link.textContent='Acceso usuarios';link.className='ee-user-access-link';target.appendChild(link);
  }

  function curatePublicChrome(){
    document.querySelectorAll('#site-header a[href="cuenta.html"], .mobile-drawer a[href="cuenta.html"], #site-footer a[href="cuenta.html"]').forEach(link=>link.remove());
    document.querySelectorAll('#site-header a[href="en-movimiento.html#cotizar"]').forEach(link=>{link.textContent='Preparar evento';});
    document.querySelectorAll('#site-footer a[href="en-movimiento.html#eventos"]').forEach(link=>{link.href='en-movimiento.html#formatos';link.textContent='Formatos';});
    document.querySelectorAll('#site-footer a[href="en-movimiento.html#talleres"]').forEach(link=>{link.href='en-movimiento.html#formatos';});document.querySelectorAll('#site-footer a[href="en-movimiento.html#mesa"]').forEach(link=>link.remove());
    document.querySelectorAll('#site-footer p').forEach(paragraph=>{const text=(paragraph.textContent||'').trim();if(text.includes('[Razón social')||text.includes('Datos comerciales, sanitarios y operativos demostrativos'))paragraph.remove();else if(text==='Una masa propia, productos para cocinar en casa y una pizzería capaz de ponerse en movimiento.')paragraph.textContent='Aprendida viajando. Hecha desde Colombia. Masa, fuego y territorio en una cocina que sigue buscando.';});
    ensureUserAccess();
  }

  function removeInternalPublicLinks(){document.querySelectorAll('#site-footer a, main a[data-internal-only]').forEach(link=>{if(INTERNAL_TARGETS.has(hrefOf(link)))link.remove();});}
  function markActive(page){const target={inicio:'index.html',tienda:'tienda.html',casa:'en-casa.html',nosotros:'nosotros.html',bitacora:'bitacora.html',movimiento:'en-movimiento.html'}[page];if(target)document.querySelectorAll(`a[href="${target}"]`).forEach(link=>link.classList.add('active'));if(page==='historia'||page==='equipo')document.querySelectorAll('a[href="nosotros.html"]').forEach(link=>link.classList.add('active'));}

  function enhance(){
    const page=document.body?.dataset?.page||'';const isInternal=INTERNAL_PAGES.has(page);recover();observe();
    document.documentElement.dataset.eeVisualSystem='brand-canon-v28';document.documentElement.dataset.eeVisualQuality='brand-final-hq';document.documentElement.dataset.eeVersion=BRAND.version;document.documentElement.dataset.eeMode=isInternal?'team-demo':'public';document.documentElement.dataset.eePublicCache='brand-canon-v28';
    if(hosted&&!isInternal){document.querySelectorAll('.local-runtime-badge,[data-internal-only],.internal-only').forEach(element=>element.remove());document.querySelectorAll('.demo-badge').forEach(element=>{const text=(element.textContent||'').toLowerCase();if(text.includes('gold master')||text.includes('demo')||text.includes('sin internet')||text.includes('biblioteca editorial completa'))element.remove();});}
    if(isInternal){document.querySelectorAll('a[href="equipo.html"]:not([data-public-target])').forEach(link=>{link.href='centro-interno.html';if((link.textContent||'').trim().toLowerCase()==='equipo')link.textContent='Centro interno';});}
    else{curatePublicNav(document.querySelector('.main-nav'));curatePublicNav(document.querySelector('.mobile-drawer .drawer-list'),true);curatePublicChrome();removeInternalPublicLinks();markActive(page);}
  }

  refresh();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();