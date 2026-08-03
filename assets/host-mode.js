(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  const PUBLIC_VERSION="0.6.1";
  const CACHE_PREFIX="el-errante-";
  const ACTIVE_CACHE="el-errante-v0-6-7";
  const INTERNAL_PAGES=new Set(["equipo","admin","control","operacion","studio","presentacion"]);
  const VISUAL_MAP=new Map([
    ["assets/images/hero-desktop.svg","assets/images/v040/v040-hero-desktop.svg"],
    ["assets/images/hero-mobile.svg","assets/images/v040/v040-hero-mobile.svg"],
    ["assets/images/v6-harina-aire-tiempo.svg","assets/images/v040/v040-harina-empaques.svg"],
    ["assets/images/harina-packshot.svg","assets/images/v040/v040-harina-empaques.svg"],
    ["assets/images/harina-manos.svg","assets/images/v040/v040-harina-manos.svg"],
    ["assets/images/harina-horno.svg","assets/images/v040/v040-harina-horno.svg"],
    ["assets/images/manos-masa.svg","assets/images/v040/v040-manos-masa.svg"],
    ["assets/images/masa-apertura-gold.svg","assets/images/v040/v040-masa-apertura.svg"],
    ["assets/images/masa-apertura.svg","assets/images/v040/v040-masa-apertura.svg"],
    ["assets/images/alveolos.svg","assets/images/v040/v040-alveolos.svg"],
    ["assets/images/fermentacion.svg","assets/images/v040/v040-fermentacion.svg"],
    ["assets/images/pizza-neo.svg","assets/images/v040/v040-pizza-neo.svg"],
    ["assets/images/editorial-fuego.svg","assets/images/v040/v040-bitacora-fuego.svg"],
    ["assets/images/pizzas-artesanales.svg","assets/images/v040/v040-pizzas-artesanales.svg"],
    ["assets/images/pizzas-coleccion.svg","assets/images/v040/v040-pizzas-coleccion.svg"],
    ["assets/images/despensa.svg","assets/images/v040/v040-despensa.svg"],
    ["assets/images/aplicaciones-empaque.svg","assets/images/v040/v040-aplicaciones-empaque.svg"],
    ["assets/images/v6-la-errante.svg","assets/images/v040/v040-pizza-errante.svg"],
    ["assets/images/pizza-la-errante.svg","assets/images/v040/v040-pizza-errante.svg"],
    ["assets/images/pizza-errante.svg","assets/images/v040/v040-pizza-errante.svg"],
    ["assets/images/pizzeria-movil.svg","assets/images/v040/v040-pizzeria-movil.svg"],
    ["assets/images/eventos-noche-gold.svg","assets/images/v040/v040-pizzeria-movil.svg"],
    ["assets/images/evento-operacion-gold.svg","assets/images/v040/v040-pizzeria-movil.svg"]
  ]);

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

  function recoverVisualAssets(root=document){
    root.querySelectorAll("img[src]").forEach(image=>{
      const source=image.getAttribute("src");
      const replacement=VISUAL_MAP.get(source);
      if(replacement){
        image.setAttribute("src",replacement);
        image.dataset.visualBaseline="v0.4";
      }
    });
    root.querySelectorAll("source[srcset]").forEach(source=>{
      const current=source.getAttribute("srcset");
      const replacement=VISUAL_MAP.get(current);
      if(replacement) source.setAttribute("srcset",replacement);
    });
  }

  function observeDynamicVisuals(){
    const observer=new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{
        if(node.nodeType!==Node.ELEMENT_NODE) return;
        if(node.matches?.("img[src],source[srcset]")) recoverVisualAssets(node.parentElement||document);
        else recoverVisualAssets(node);
      }));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function enhancePublicUI(){
    const page=document.body?.dataset?.page||"";
    const isInternal=INTERNAL_PAGES.has(page);
    recoverVisualAssets();
    observeDynamicVisuals();

    if(hosted){
      document.documentElement.dataset.eeMode=isInternal?"team-demo":"public";
      document.documentElement.dataset.eeVersion=PUBLIC_VERSION;
      if(!isInternal){
        document.querySelectorAll(".local-runtime-badge,[data-internal-only],.internal-only").forEach(el=>el.remove());
        document.querySelectorAll(".demo-badge").forEach(el=>{
          const text=(el.textContent||"").toLowerCase();
          if(text.includes("gold master")||text.includes("demo")||text.includes("sin internet")||text.includes("biblioteca editorial completa"))el.remove();
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
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",enhancePublicUI);
  else enhancePublicUI();
})();
