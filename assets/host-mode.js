(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  const PUBLIC_VERSION="1.1.0";
  const CACHE_PREFIX="el-errante-";
  const ACTIVE_CACHE="el-errante-v1-1-0";
  const INTERNAL_PAGES=new Set(["equipo","admin","control","operacion","studio","actas","presentacion"]);
  const BRAND_PACKS=[
    "assets/brand-final-editorial.js",
    "assets/brand-final-products-a.js",
    "assets/brand-final-products-b.js",
    "assets/brand-final-products-c.js"
  ];

  const DIRECT_VISUALS={
    "assets/images/hero-desktop.svg":"assets/images/brand-final/home-hero.svg",
    "assets/images/hero-mobile.svg":"assets/images/brand-final/home-hero.svg",
    "assets/images/v040/v040-hero-desktop.svg":"assets/images/brand-final/home-hero.svg",
    "assets/images/v040/v040-hero-mobile.svg":"assets/images/brand-final/home-hero.svg",
    "assets/images/harina-manos.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/harina-horno.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/manos-masa.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/masa-apertura-gold.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/masa-apertura.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/editorial-fuego.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/v040/v040-harina-manos.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/v040/v040-harina-horno.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/v040/v040-manos-masa.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/v040/v040-masa-apertura.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/v040/v040-bitacora-fuego.svg":"assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/alveolos.svg":"assets/images/brand-final/home-fermentacion.svg",
    "assets/images/fermentacion.svg":"assets/images/brand-final/home-fermentacion.svg",
    "assets/images/v040/v040-alveolos.svg":"assets/images/brand-final/home-fermentacion.svg",
    "assets/images/v040/v040-fermentacion.svg":"assets/images/brand-final/home-fermentacion.svg"
  };

  const BRAND_VISUALS={
    "assets/images/v6-harina-aire-tiempo.svg":"producto-harina",
    "assets/images/harina-packshot.svg":"producto-harina",
    "assets/images/v040/v040-harina-empaques.svg":"producto-harina",
    "assets/images/v6-crea-la-tuya.svg":"producto-crea-tuya",
    "assets/images/v6-margherita-taller.svg":"producto-margherita",
    "assets/images/v6-diavola-errante.svg":"producto-diavola",
    "assets/images/v6-bosque.svg":"producto-bosque",
    "assets/images/v6-cuatro-quesos.svg":"producto-cuatro-quesos",
    "assets/images/v6-la-errante.svg":"producto-la-errante",
    "assets/images/pizza-la-errante.svg":"producto-la-errante",
    "assets/images/v6-salsa-tomate.svg":"producto-salsa-tomate",
    "assets/images/v6-reduccion-balsamica.svg":"producto-reduccion-balsamica",
    "assets/images/v6-panela-maracuya.svg":"producto-panela-maracuya",
    "assets/images/v6-combo-primera-ruta.svg":"producto-combo-primera-ruta",
    "assets/images/pizza-neo.svg":"producto-margherita",
    "assets/images/v040/v040-pizza-neo.svg":"producto-margherita",
    "assets/images/pizza-errante.svg":"producto-la-errante",
    "assets/images/v040/v040-pizza-errante.svg":"producto-la-errante",
    "assets/images/pizzas-artesanales.svg":"home-en-casa",
    "assets/images/pizzas-coleccion.svg":"home-en-casa",
    "assets/images/v040/v040-pizzas-artesanales.svg":"home-en-casa",
    "assets/images/v040/v040-pizzas-coleccion.svg":"home-en-casa",
    "assets/images/despensa.svg":"home-despensa",
    "assets/images/v040/v040-despensa.svg":"home-despensa",
    "assets/images/aplicaciones-empaque.svg":"producto-combo-primera-ruta",
    "assets/images/v040/v040-aplicaciones-empaque.svg":"producto-combo-primera-ruta",
    "assets/images/pizzeria-movil.svg":"evento-hero",
    "assets/images/eventos-noche-gold.svg":"evento-noche",
    "assets/images/evento-operacion-gold.svg":"evento-hero",
    "assets/images/v040/v040-pizzeria-movil.svg":"evento-hero"
  };

  function normalizeSource(value){
    return String(value||"").split("?")[0].split("#")[0].replace(/^\.\//,"");
  }

  function loadScript(source){
    return new Promise((resolve,reject)=>{
      const loaded=document.querySelector(`script[data-ee-brand-pack="${source}"]`);
      if(loaded){
        if(loaded.dataset.loaded==="true") resolve();
        else{
          loaded.addEventListener("load",resolve,{once:true});
          loaded.addEventListener("error",reject,{once:true});
        }
        return;
      }
      const script=document.createElement("script");
      script.src=source;
      script.dataset.eeBrandPack=source;
      script.onload=()=>{script.dataset.loaded="true";resolve();};
      script.onerror=()=>reject(new Error(`No fue posible cargar ${source}`));
      document.head.appendChild(script);
    });
  }

  async function loadBrandAssets(){
    for(const source of BRAND_PACKS) await loadScript(source);
  }

  function resolveVisual(source){
    const normalized=normalizeSource(source);
    if(DIRECT_VISUALS[normalized]) return DIRECT_VISUALS[normalized];
    const key=BRAND_VISUALS[normalized];
    return key?window.EE_BRAND_ASSETS?.[key]||null:null;
  }

  function recoverVisualAssets(root=document){
    root.querySelectorAll?.("img[src]").forEach(image=>{
      const replacement=resolveVisual(image.getAttribute("src"));
      if(replacement&&replacement!==image.getAttribute("src")){
        image.setAttribute("src",replacement);
        image.dataset.visualSystem="brand-final";
        image.dataset.visualVersion=PUBLIC_VERSION;
      }
    });
    root.querySelectorAll?.("source[srcset]").forEach(source=>{
      const replacement=resolveVisual(source.getAttribute("srcset"));
      if(replacement) source.setAttribute("srcset",replacement);
    });
  }

  function observeDynamicVisuals(){
    const observer=new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{
        if(node.nodeType!==Node.ELEMENT_NODE) return;
        recoverVisualAssets(node.matches?.("img[src],source[srcset]")?node.parentElement||document:node);
      }));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  async function refreshPublicRuntime(){
    if(!hosted) return;
    try{
      if("caches" in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==ACTIVE_CACHE).map(key=>caches.delete(key)));
      }
      if("serviceWorker" in navigator){
        const registration=await navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"});
        await registration.update();
      }
      localStorage.setItem("ee_public_version",PUBLIC_VERSION);
    }catch(error){
      console.warn("No fue posible actualizar la caché pública de El Errante.",error);
    }
  }

  function addNavigationLink(container,selector,label,href,beforeSelector,className=""){
    if(!container||container.querySelector(selector)) return;
    const link=document.createElement("a");
    link.href=href;
    link.textContent=label;
    if(className) link.className=className;
    const before=beforeSelector?container.querySelector(beforeSelector):null;
    container.insertBefore(link,before||null);
  }

  async function enhancePublicUI(){
    const page=document.body?.dataset?.page||"";
    const isInternal=INTERNAL_PAGES.has(page);
    try{await loadBrandAssets();}
    catch(error){console.error("El sistema visual final no pudo inicializarse.",error);}
    recoverVisualAssets();
    observeDynamicVisuals();

    document.documentElement.dataset.eeVisualSystem="brand-final";
    document.documentElement.dataset.eeVersion=PUBLIC_VERSION;
    if(hosted){
      document.documentElement.dataset.eeMode=isInternal?"team-demo":"public";
      if(!isInternal){
        document.querySelectorAll(".local-runtime-badge,[data-internal-only],.internal-only").forEach(el=>el.remove());
        document.querySelectorAll(".demo-badge").forEach(el=>{
          const text=(el.textContent||"").toLowerCase();
          if(text.includes("gold master")||text.includes("demo")||text.includes("sin internet")||text.includes("biblioteca editorial completa")) el.remove();
        });
      }
    }

    const desktop=document.querySelector(".main-nav");
    addNavigationLink(desktop,'a[href="historia.html"]',"Historia","historia.html",'a[href="bitacora.html"]');
    addNavigationLink(desktop,'a[href="equipo.html"]',"Equipo","equipo.html",null);
    const mobile=document.querySelector(".mobile-drawer .drawer-list");
    addNavigationLink(mobile,'a[href="historia.html"]',"Historia","historia.html",'a[href="bitacora.html"]',"btn btn-outline");
    addNavigationLink(mobile,'a[href="equipo.html"]',"Equipo","equipo.html",null,"btn btn-outline");
    if(page==="historia") document.querySelectorAll('a[href="historia.html"]').forEach(link=>link.classList.add("active"));
    if(page==="equipo") document.querySelectorAll('a[href="equipo.html"]').forEach(link=>link.classList.add("active"));
  }

  refreshPublicRuntime();
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",enhancePublicUI,{once:true});
  else enhancePublicUI();
})();