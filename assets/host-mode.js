(()=>{
  const hosted=location.protocol==="https:"||location.hostname.endsWith("github.io");
  const PUBLIC_VERSION="1.8.0";
  const CACHE_PREFIX="el-errante-";
  const ACTIVE_CACHE="el-errante-v1-8-0";
  const INTERNAL_PAGES=new Set(["equipo","admin","control","operacion","studio","actas","presentacion"]);

  const VISUALS={
    "assets/images/hero-desktop.svg":"assets/images/brand-final/home-hero.webp",
    "assets/images/hero-mobile.svg":"assets/images/brand-final/home-hero-mobile.webp",
    "assets/images/v040/v040-hero-desktop.svg":"assets/images/brand-final/home-hero.webp",
    "assets/images/v040/v040-hero-mobile.svg":"assets/images/brand-final/home-hero-mobile.webp",
    "assets/images/harina-manos.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/harina-horno.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/manos-masa.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/masa-apertura-gold.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/masa-apertura.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/editorial-fuego.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/v040/v040-harina-manos.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/v040/v040-harina-horno.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/v040/v040-manos-masa.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/v040/v040-masa-apertura.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/v040/v040-bitacora-fuego.svg":"assets/images/brand-final/home-masa-fuego.webp",
    "assets/images/alveolos.svg":"assets/images/brand-final/home-fermentacion.webp",
    "assets/images/fermentacion.svg":"assets/images/brand-final/home-fermentacion.webp",
    "assets/images/v040/v040-alveolos.svg":"assets/images/brand-final/home-fermentacion.webp",
    "assets/images/v040/v040-fermentacion.svg":"assets/images/brand-final/home-fermentacion.webp",
    "assets/images/v6-harina-aire-tiempo.svg":"assets/images/brand-final/producto-harina.webp",
    "assets/images/harina-packshot.svg":"assets/images/brand-final/producto-harina.webp",
    "assets/images/v040/v040-harina-empaques.svg":"assets/images/brand-final/producto-harina.webp",
    "assets/images/v6-crea-la-tuya.svg":"assets/images/brand-final/producto-crea-tuya.webp",
    "assets/images/v6-margherita-taller.svg":"assets/images/brand-final/producto-margherita.webp",
    "assets/images/v6-diavola-errante.svg":"assets/images/brand-final/producto-diavola.webp",
    "assets/images/v6-bosque.svg":"assets/images/brand-final/producto-bosque.webp",
    "assets/images/v6-cuatro-quesos.svg":"assets/images/brand-final/producto-cuatro-quesos.webp",
    "assets/images/v6-la-errante.svg":"assets/images/brand-final/producto-la-errante.webp",
    "assets/images/pizza-la-errante.svg":"assets/images/brand-final/producto-la-errante.webp",
    "assets/images/pizza-errante.svg":"assets/images/brand-final/producto-la-errante.webp",
    "assets/images/v040/v040-pizza-errante.svg":"assets/images/brand-final/producto-la-errante.webp",
    "assets/images/v6-salsa-tomate.svg":"assets/images/brand-final/producto-salsa-tomate.webp",
    "assets/images/v6-reduccion-balsamica.svg":"assets/images/brand-final/producto-reduccion-balsamica.webp",
    "assets/images/v6-panela-maracuya.svg":"assets/images/brand-final/producto-panela-maracuya.webp",
    "assets/images/v6-combo-primera-ruta.svg":"assets/images/brand-final/producto-combo-primera-ruta.webp",
    "assets/images/pizza-neo.svg":"assets/images/brand-final/producto-margherita.webp",
    "assets/images/v040/v040-pizza-neo.svg":"assets/images/brand-final/producto-margherita.webp",
    "assets/images/pizzas-artesanales.svg":"assets/images/brand-final/home-en-casa.webp",
    "assets/images/pizzas-coleccion.svg":"assets/images/brand-final/home-en-casa.webp",
    "assets/images/v040/v040-pizzas-artesanales.svg":"assets/images/brand-final/home-en-casa.webp",
    "assets/images/v040/v040-pizzas-coleccion.svg":"assets/images/brand-final/home-en-casa.webp",
    "assets/images/despensa.svg":"assets/images/brand-final/home-despensa.webp",
    "assets/images/v040/v040-despensa.svg":"assets/images/brand-final/home-despensa.webp",
    "assets/images/aplicaciones-empaque.svg":"assets/images/brand-final/producto-combo-primera-ruta.webp",
    "assets/images/v040/v040-aplicaciones-empaque.svg":"assets/images/brand-final/producto-combo-primera-ruta.webp",
    "assets/images/pizzeria-movil.svg":"assets/images/brand-final/evento-hero.webp",
    "assets/images/eventos-noche-gold.svg":"assets/images/brand-final/evento-noche.webp",
    "assets/images/evento-operacion-gold.svg":"assets/images/brand-final/evento-servicio.webp",
    "assets/images/v040/v040-pizzeria-movil.svg":"assets/images/brand-final/evento-hero.webp"
  };

  function normalize(value){return String(value||"").split("?")[0].split("#")[0].replace(/^\.\//,"");}
  function recover(root=document){
    root.querySelectorAll?.("img[src]").forEach(image=>{
      const replacement=VISUALS[normalize(image.getAttribute("src"))];
      if(replacement&&replacement!==image.getAttribute("src")){
        image.setAttribute("src",replacement);
        image.dataset.visualSystem="brand-final-hq";
        image.dataset.visualVersion=PUBLIC_VERSION;
      }
    });
    root.querySelectorAll?.("source[srcset]").forEach(source=>{
      const replacement=VISUALS[normalize(source.getAttribute("srcset"))];
      if(replacement) source.setAttribute("srcset",replacement);
    });
  }
  function observe(){new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE) recover(node.matches?.("img[src],source[srcset]")?node.parentElement||document:node);}))).observe(document.body,{childList:true,subtree:true});}
  async function refresh(){if(!hosted)return;try{if("caches" in window){const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==ACTIVE_CACHE).map(key=>caches.delete(key)));}if("serviceWorker" in navigator){const registration=await navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"});await registration.update();}localStorage.setItem("ee_public_version",PUBLIC_VERSION);}catch(error){console.warn("No fue posible actualizar la caché pública de El Errante.",error);}}
  function add(container,selector,label,href,beforeSelector,className=""){if(!container||container.querySelector(selector))return;const link=document.createElement("a");link.href=href;link.textContent=label;if(className)link.className=className;const before=beforeSelector?container.querySelector(beforeSelector):null;container.insertBefore(link,before||null);}
  function enhance(){const page=document.body?.dataset?.page||"";const isInternal=INTERNAL_PAGES.has(page);recover();observe();if(page==="nosotros"){const heroImage=document.querySelector(".hero .hero-media img");if(heroImage){heroImage.src="assets/images/brand-final/home-compartir.webp";heroImage.alt="Personas compartiendo pizza El Errante";heroImage.dataset.visualSystem="brand-final-hq";}const ingredientImage=document.querySelector("main .section .visual-card img");if(ingredientImage){ingredientImage.src="assets/images/brand-final/home-ingredientes.webp";ingredientImage.alt="Ingredientes seleccionados para las pizzas El Errante";ingredientImage.dataset.visualSystem="brand-final-hq";}}document.documentElement.dataset.eeVisualSystem="brand-final-direct";document.documentElement.dataset.eeVisualQuality="hq-v13";document.documentElement.dataset.eeVersion=PUBLIC_VERSION;if(hosted){document.documentElement.dataset.eeMode=isInternal?"team-demo":"public";if(!isInternal){document.querySelectorAll(".local-runtime-badge,[data-internal-only],.internal-only").forEach(el=>el.remove());document.querySelectorAll(".demo-badge").forEach(el=>{const text=(el.textContent||"").toLowerCase();if(text.includes("gold master")||text.includes("demo")||text.includes("sin internet")||text.includes("biblioteca editorial completa"))el.remove();});}}const desktop=document.querySelector(".main-nav");add(desktop,'a[href="historia.html"]',"Historia","historia.html",'a[href="bitacora.html"]');add(desktop,'a[href="equipo.html"]',"Equipo","equipo.html",null);const mobile=document.querySelector(".mobile-drawer .drawer-list");add(mobile,'a[href="historia.html"]',"Historia","historia.html",'a[href="bitacora.html"]',"btn btn-outline");add(mobile,'a[href="equipo.html"]',"Equipo","equipo.html",null,"btn btn-outline");if(page==="historia")document.querySelectorAll('a[href="historia.html"]').forEach(link=>link.classList.add("active"));if(page==="equipo")document.querySelectorAll('a[href="equipo.html"]').forEach(link=>link.classList.add("active"));}
  refresh();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhance,{once:true});else enhance();
})();
