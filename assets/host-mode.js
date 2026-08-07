(()=>{
  'use strict';

  const hosted=location.protocol==='https:'||location.hostname.endsWith('github.io');
  const INTERNAL_PAGES=new Set(['equipo','admin','activacion','control','operacion','studio','actas','presentacion']);

  function readText(path){
    const request=new XMLHttpRequest();
    request.open('GET',path,false);
    request.send(null);
    if(request.status!==200&&request.status!==0)throw new Error('No se pudo cargar '+path);
    return request.responseText;
  }
  if(!window.EL_ERRANTE_BRAND_V28)(0,eval)(readText('assets/brand-canon-v28.js'));
  const BRAND=window.EL_ERRANTE_BRAND_V28;

  function applySpecialPageAssets(){
    const page=document.body?.dataset?.page||'';
    if(page==='nosotros'){
      const hero=document.querySelector('.hero .hero-media img');
      if(hero){hero.src=BRAND.assets.homeCompartir;hero.alt='Personas compartiendo pizza El Errante';}
      const ingredient=document.querySelector('main .section .visual-card img');
      if(ingredient){ingredient.src=BRAND.assets.homeIngredientes;ingredient.alt='Ingredientes seleccionados para las pizzas El Errante';}
    }
  }

  function recover(scope=document){
    BRAND.applyToDom(scope);
    applySpecialPageAssets();
  }

  function observe(){
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType!==Node.ELEMENT_NODE)continue;
          recover(node.matches?.('img[src],source[srcset]')?node.parentElement||document:node);
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  async function refresh(){
    try{
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(key=>key.startsWith('el-errante-')&&key!==BRAND.cache).map(key=>caches.delete(key)));
      }
      if('serviceWorker' in navigator){
        const registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});
        await registration.update();
      }
      localStorage.setItem('ee_public_version',BRAND.version);
      localStorage.setItem('ee_brand_canon',BRAND.version);
    }catch(error){console.warn('No fue posible actualizar la caché canónica de El Errante.',error);}
  }

  function add(container,selector,label,href,beforeSelector,className=''){
    if(!container||container.querySelector(selector))return;
    const link=document.createElement('a');link.href=href;link.textContent=label;
    if(className)link.className=className;
    const before=beforeSelector?container.querySelector(beforeSelector):null;
    container.insertBefore(link,before||null);
  }

  function enhance(){
    const page=document.body?.dataset?.page||'';
    const isInternal=INTERNAL_PAGES.has(page);
    recover();observe();
    document.documentElement.dataset.eeVisualSystem='brand-canon-v28';
    document.documentElement.dataset.eeVisualQuality='brand-final-hq';
    document.documentElement.dataset.eeVersion=BRAND.version;
    document.documentElement.dataset.eeMode=isInternal?'team-demo':'public';

    if(hosted&&!isInternal){
      document.querySelectorAll('.local-runtime-badge,[data-internal-only],.internal-only').forEach(element=>element.remove());
      document.querySelectorAll('.demo-badge').forEach(element=>{
        const text=(element.textContent||'').toLowerCase();
        if(text.includes('gold master')||text.includes('demo')||text.includes('sin internet')||text.includes('biblioteca editorial completa'))element.remove();
      });
    }

    const desktop=document.querySelector('.main-nav');
    add(desktop,'a[href="historia.html"]','Historia','historia.html','a[href="bitacora.html"]');
    add(desktop,'a[href="equipo.html"]','Equipo','equipo.html',null);
    const mobile=document.querySelector('.mobile-drawer .drawer-list');
    add(mobile,'a[href="historia.html"]','Historia','historia.html','a[href="bitacora.html"]','btn btn-outline');
    add(mobile,'a[href="equipo.html"]','Equipo','equipo.html',null,'btn btn-outline');
    if(page==='historia')document.querySelectorAll('a[href="historia.html"]').forEach(link=>link.classList.add('active'));
    if(page==='equipo')document.querySelectorAll('a[href="equipo.html"]').forEach(link=>link.classList.add('active'));
  }

  refresh();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
})();
