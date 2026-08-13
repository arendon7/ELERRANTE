(()=>{
  'use strict';

  const body=document.body;
  if(!body||body.dataset.v4Public!=='true')return;

  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const page=body.dataset.page||'';
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
    document.documentElement.dataset.eeV4PublicShell='ready';
  }

  /*
    The legacy app registers its public-shell renderer on DOMContentLoaded.
    This V4 script is loaded after the legacy app, so registering our own
    listener here guarantees V4 wins without modifying the operational runtime.
  */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      installShell();
      requestAnimationFrame(installShell);
    },{once:true});
  }else{
    installShell();
    requestAnimationFrame(installShell);
  }

  window.addEventListener('storage',event=>{if(event.key==='ee_v2_cart')syncCart();});
  document.addEventListener('click',event=>{if(event.target.closest('.buy-product,[data-add-cart]'))setTimeout(syncCart,0);});
})();