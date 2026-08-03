(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");

  function enhancePublicUI(){
    if(hosted){
      document.documentElement.dataset.eeMode="public";
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

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhancePublicUI);
  else enhancePublicUI();
})();
