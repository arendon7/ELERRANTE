(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  const PUBLIC_VERSION="0.6.1";
  const CACHE_PREFIX="el-errante-";
  const ACTIVE_CACHE="el-errante-v0-6-2";
  const INTERNAL_PAGES=new Set(["equipo","admin","control","operacion","studio","presentacion"]);

  async function refreshPublicRuntime(){
    if(!hosted) return;

    try{
      if("caches" in window){
        const keys=await caches.keys();
        await Promise.all(keys
          .filter(key=>key.startsWith(CACHE_PREFIX)&&key!==ACTIVE_CACHE)
          .map(key=>caches.delete(key)));
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

  function enhancePublicUI(){
    const page=document.body?.dataset?.page||"";
    const isInternal=INTERNAL_PAGES.has(page);

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
