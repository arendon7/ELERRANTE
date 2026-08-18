(()=>{
  'use strict';

  const body=document.body;
  if(!body||body.dataset.v4Public!=='true')return;

  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const page=body.dataset.page||'';
  const generated='assets/images/brand-v4/generated-01-20/';
  const nav=[
    ['tienda.html','Tienda'],
    ['en-casa.html','En Casa'],
    ['metodo.html','Método'],
    ['bitacora.html','Bitácora'],
    ['juan-david-ocampo.html','Juan David'],
    ['en-movimiento.html','En Movimiento']
  ];

  const ensureAssetLayer=()=>{
    if(document.querySelector('link[href="assets/brand-v4-assets.css"]'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='assets/brand-v4-assets.css';document.head.appendChild(link);
  };
  ensureAssetLayer();

  const setImage=(image,src,alt)=>{
    if(!image)return false;
    image.src=src;
    if(alt!==undefined)image.alt=alt;
    image.removeAttribute('width');
    image.removeAttribute('height');
    image.decoding='async';
    return true;
  };

  const insertVisualAfter=(anchor,src,alt,className)=>{
    const target=typeof anchor==='string'?document.querySelector(anchor):anchor;
    if(!target||document.querySelector('.'+className))return false;
    const figure=document.createElement('figure');
    figure.className=`v4-promoted-visual ${className}`;
    figure.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
    target.insertAdjacentElement('afterend',figure);
    return true;
  };

  /* Only assets that passed visual QA are eligible for public promotion. */
  const productAssetMap={
    'margherita-del-taller':'02-margherita-v4.webp',
    'la-errante':'03-la-errante-v4.webp',
    'bosque':'04-bosque-v4.webp',
    'diavola-errante':'05-diavola-v4.webp',
    'cuatro-quesos-montana':'06-cuatro-quesos-v4.webp',
    'combo-primera-ruta':'15-combo-primera-ruta-v4.webp',
    'primera-ruta':'15-combo-primera-ruta-v4.webp'
  };

  function promoteProductDetail(){
    if(path!=='producto.html')return false;
    const id=new URLSearchParams(location.search).get('id')||'';
    const file=productAssetMap[id];
    if(!file)return false;
    const image=document.querySelector('#dynamic-product .v305-frame-primary img, #dynamic-product .product-gallery img');
    if(!image)return false;
    setImage(image,generated+file,image.alt||'Producto El Errante');
    const frame=image.closest('[data-v305-frame]');
    if(frame)frame.dataset.v305Asset=generated+file;
    document.documentElement.dataset.eeV4GeneratedProduct=id;
    return true;
  }

  function promoteCatalogCards(){
    if(path!=='tienda.html')return;
    for(const [id,file] of Object.entries(productAssetMap)){
      const selectors=[
        `#product-grid [data-product-id="${id}"] img`,
        `#product-grid [data-id="${id}"] img`,
        `#product-grid a[href*="id=${id}"] img`
      ];
      const image=document.querySelector(selectors.join(','));
      if(image)setImage(image,generated+file,image.alt||'Producto El Errante');
    }
  }

  function promoteRecipeLibrary(){
    if(path!=='recetas.html')return;
    setImage(document.querySelector('.hero-media img'),generated+'08-proceso-v4.webp','Trabajo de masa y fermentación en El Errante');
    const visualCards=[...document.querySelectorAll('.visual-card img')];
    if(visualCards[0])setImage(visualCards[0],generated+'09-ingredientes-v4.webp','Ingredientes y materia de trabajo de El Errante');
    if(visualCards[1])setImage(visualCards[1],generated+'07-despensa-v4.webp','Despensa de El Errante');
    document.documentElement.dataset.eeV4GeneratedRecipes='true';
  }

  function promoteTools(){
    if(path!=='herramientas.html')return;
    setImage(document.querySelector('.hero-media img'),generated+'08-proceso-v4.webp','Proceso de masa de El Errante');
    setImage(document.querySelector('.section-dark .visual-card img'),generated+'09-ingredientes-v4.webp','Ingredientes para una prueba de masa y pizza');
    document.documentElement.dataset.eeV4GeneratedTools='true';
  }

  function promoteEnCasaSupport(){
    if(path!=='en-casa.html')return;
    const media=[...document.querySelectorAll('.v4p-media img')];
    if(media[0])setImage(media[0],generated+'08-proceso-v4.webp','Trabajo de masa antes del primer fuego');
    const lastSection=document.querySelector('main > .v4p-section:last-of-type');
    if(lastSection)insertVisualAfter(lastSection,generated+'10-ritual-v4.webp','Pizza El Errante compartida alrededor de la mesa','v4-ritual-endcap');
    document.documentElement.dataset.eeV4GeneratedHomeRitual='true';
  }

  function promoteCheckoutTrust(){
    if(path!=='checkout.html')return;
    const note=document.querySelector('main .data-note');
    if(note)insertVisualAfter(note,generated+'18-confianza-v4-alt.webp','Pieza editorial de confianza y cuidado de El Errante','v4-checkout-trust');
    document.documentElement.dataset.eeV4GeneratedCheckoutTrust='true';
  }

  function promotePageAssets(){
    if(path==='tienda.html'){
      setImage(document.querySelector('.v4p-hero-media img'),generated+'11-tienda-hero-v4.webp','');
      const media=[...document.querySelectorAll('.v4p-media img')];
      if(media[0])setImage(media[0],generated+'02-margherita-v4.webp','Pizza Margherita de El Errante');
      if(media[1])setImage(media[1],generated+'07-despensa-v4.webp','Despensa El Errante');
      promoteCatalogCards();
      document.documentElement.dataset.eeV4GeneratedStore='true';
    }
    if(path==='metodo.html'){
      setImage(document.querySelector('.v4ed-hero-media img'),generated+'12-metodo-hero-v4.webp','');
      document.documentElement.dataset.eeV4GeneratedMethod='true';
    }
    if(path==='bitacora.html'){
      setImage(document.querySelector('.v4ed-hero-media img'),generated+'13-bitacora-hero-v4.webp','');
      document.documentElement.dataset.eeV4GeneratedJournal='true';
    }
    /* 16-ayuda-v4.webp failed visual QA because it contains baked-in UI/copy; keep the clean existing help hero. */
    if(path==='cobertura.html'){
      setImage(document.querySelector('.hero-media img'),generated+'17-cobertura-v4.webp','Cobertura y rutas de entrega El Errante');
      document.documentElement.dataset.eeV4GeneratedCoverage='true';
    }
    /* 19-seguimiento-v4.webp failed brand QA because it contains an incorrect descriptor; it must never be injected into Cuenta. */
    promoteRecipeLibrary();
    promoteTools();
    promoteEnCasaSupport();
    promoteCheckoutTrust();
    promoteProductDetail();
  }

  const isCurrent=href=>{
    if(href==='tienda.html')return path==='tienda.html'||path==='producto.html';
    return path===href;
  };
  const navMarkup=()=>nav.map(([href,label])=>`<a href="${href}"${isCurrent(href)?' aria-current="page"':''}>${label}</a>`).join('');

  const cartQuantity=()=>{
    try{
      const lines=JSON.parse(localStorage.getItem('ee_v2_cart')||'[]');
      return Array.isArray(lines)?lines.reduce((sum,line)=>sum+Math.max(0,Number(line?.qty)||0),0):0;
    }catch(_){return 0;}
  };

  const syncCart=()=>document.querySelectorAll('.cart-count').forEach(node=>{node.textContent=String(cartQuantity());});

  function installShell(){
    const headerHost=document.querySelector('#site-header');
    const footerHost=document.querySelector('#site-footer');

    if(headerHost){
      headerHost.innerHTML=`
        <header class="v4-public-header${page==='producto'?' is-solid':''}" data-open="false">
          <div class="v4-public-header-inner">
            <a class="v4-public-brand" href="index.html" aria-label="El Errante, inicio">
              <img class="v4-public-brand-mark" src="assets/images/brand-v4/pizzaiolo-mark-v4.webp" alt="" width="44" height="44">
              <span class="v4-public-brand-copy"><strong>EL ERRANTE</strong><small>Pizza contemporánea · Est. 2019</small></span>
            </a>
            <nav class="main-nav v4-public-nav" aria-label="Navegación principal">${navMarkup()}</nav>
            <a class="v4-public-cart" href="checkout.html">Carrito <span class="cart-count" aria-label="Productos en el carrito">0</span></a>
            <button class="menu-toggle v4-public-menu-toggle" type="button" aria-expanded="false" aria-controls="v4-public-drawer">Menú</button>
          </div>
          <nav class="mobile-drawer v4-public-drawer" id="v4-public-drawer" aria-label="Navegación móvil">${navMarkup()}</nav>
        </header>`;
    }

    if(footerHost){
      footerHost.innerHTML=`
        <footer class="v4-public-footer">
          <div class="v4-public-footer-inner">
            <div class="v4-public-footer-brand"><img class="v4-public-footer-brand-mark" src="assets/images/brand-v4/pizzaiolo-mark-v4.webp" alt="" width="52" height="52"><span class="v4-public-footer-brand-copy"><strong>EL ERRANTE</strong><small>Pizza contemporánea · Est. 2019</small></span></div>
            <nav class="v4-public-footer-nav" aria-label="Navegación secundaria">
              <a href="tienda.html">Tienda</a><a href="en-casa.html">En Casa</a><a href="metodo.html">Método</a><a href="bitacora.html">Bitácora</a><a href="en-movimiento.html">Eventos</a><a href="ayuda.html">Ayuda</a><a class="v4-public-footer-access" href="acceso.html">Acceso usuarios</a>
            </nav>
          </div>
        </footer>`;
    }

    const header=headerHost?.querySelector('.v4-public-header');
    const toggle=headerHost?.querySelector('.v4-public-menu-toggle');
    const drawer=headerHost?.querySelector('.v4-public-drawer');
    const closeMenu=()=>{
      if(!header||!toggle||!drawer)return;
      header.dataset.open='false';
      toggle.setAttribute('aria-expanded','false');
      drawer.classList.remove('open');
    };

    if(header&&toggle&&drawer){
      toggle.addEventListener('click',()=>{
        const open=toggle.getAttribute('aria-expanded')==='true';
        header.dataset.open=String(!open);
        toggle.setAttribute('aria-expanded',String(!open));
        drawer.classList.toggle('open',!open);
      });
      drawer.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
      document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();},{once:false});
      window.addEventListener('resize',()=>{if(window.innerWidth>1080)closeMenu();},{passive:true});
    }

    syncCart();
    promotePageAssets();
    document.documentElement.dataset.eeV4PublicShell='ready';
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      installShell();
      promotePageAssets();
      requestAnimationFrame(()=>{installShell();promotePageAssets();});
    },{once:true});
  }else{
    installShell();
    promotePageAssets();
    requestAnimationFrame(()=>{installShell();promotePageAssets();});
  }

  const dynamicRoot=document.querySelector('#dynamic-product');
  if(dynamicRoot){
    const observer=new MutationObserver(()=>{if(promoteProductDetail())observer.disconnect();});
    observer.observe(dynamicRoot,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
  const grid=document.querySelector('#product-grid');
  if(grid){
    const observer=new MutationObserver(()=>promoteCatalogCards());
    observer.observe(grid,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }

  window.addEventListener('storage',event=>{if(event.key==='ee_v2_cart')syncCart();});
  document.addEventListener('click',event=>{if(event.target.closest('.buy-product,[data-add-cart]'))setTimeout(syncCart,0);});
})();