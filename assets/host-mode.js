(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  const PUBLIC_VERSION="0.6.1";
  const CACHE_PREFIX="el-errante-";
  const ACTIVE_CACHE="el-errante-v0-6-2";

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

  function enhancePublicUI(){
    if(hosted){
      document.documentElement.dataset.eeMode="public";
      document.documentElement.dataset.eeVersion=PUBLIC_VERSION;
      document.querySelectorAll(".local-runtime-badge,[data-internal-only],.internal-only").forEach(el=>el.remove());
      document.querySelectorAll(".demo-badge").forEach(el=>{
        const text=(el.textContent||"").toLowerCase();
        if(text.includes("gold master")||text.includes("demo")||text.includes("sin internet")||text.includes("biblioteca editorial completa"))el.remove();
      });
    }

    const isHistory=document.body?.dataset?.page==="historia";
    const desktop=document.querySelector(".main-nav");
    if(desktop&&!desktop.querySelector('a[href="historia.html"]')){
      const link=document.createElement("a");
      link.href="historia.html";
      link.textContent="Historia";
      if(isHistory)link.classList.add("active");
      const before=desktop.querySelector('a[href="bitacora.html"]');
      desktop.insertBefore(link,before||null);
    }

    const mobile=document.querySelector(".mobile-drawer .drawer-list");
    if(mobile&&!mobile.querySelector('a[href="historia.html"]')){
      const link=document.createElement("a");
      link.href="historia.html";
      link.textContent="Historia";
      link.className="btn btn-outline";
      const before=mobile.querySelector('a[href="bitacora.html"]');
      mobile.insertBefore(link,before||null);
    }
  }

  refreshPublicRuntime();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhancePublicUI);
  else enhancePublicUI();
})();
