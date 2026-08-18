(()=>{
  'use strict';

  const generatedDimensions={
    '01-home-hero-v4.webp':[1672,941],
    '02-margherita-v4.webp':[1122,1402],
    '03-la-errante-v4.webp':[1122,1402],
    '04-bosque-v4.webp':[1122,1402],
    '05-diavola-v4.webp':[1122,1402],
    '06-cuatro-quesos-v4.webp':[1122,1402],
    '07-despensa-v4.webp':[1122,1402],
    '08-proceso-v4.webp':[1122,1402]
  };

  const ensureAssetLayer=()=>{
    if(document.querySelector('link[href="assets/brand-v4-assets.css"]'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='assets/brand-v4-assets.css';document.head.appendChild(link);
  };
  ensureAssetLayer();

  const brand=document.querySelector('.v4-brand-fallback');
  if(brand){
    brand.removeAttribute('data-master-status');
    brand.classList.add('v4-home-brand');
    if(!brand.querySelector('.v4-home-brand-mark')){
      const mark=document.createElement('img');
      mark.className='v4-home-brand-mark';
      mark.src='assets/images/brand-v4/pizzaiolo-mark-v4.webp';
      mark.alt='';mark.width=44;mark.height=44;mark.decoding='async';
      brand.prepend(mark);
    }
  }

  const generated='assets/images/brand-v4/generated-01-20/';
  const promoteHomeImage=(selector,src,alt)=>{
    const image=document.querySelector(selector);
    if(!image)return;
    image.src=src;
    if(alt!==undefined)image.alt=alt;
    const file=src.split('/').pop();
    const dimensions=generatedDimensions[file];
    if(dimensions){image.width=dimensions[0];image.height=dimensions[1];}
    image.decoding='async';
    if(image.closest('.v4-hero-media')){
      image.loading='eager';
      image.setAttribute('fetchpriority','high');
    }
  };

  /* V4 generated bank 01–20: only user-approved individual outputs are promoted. */
  promoteHomeImage('.v4-hero-media img',generated+'01-home-hero-v4.webp','');
  promoteHomeImage('.v4-manifesto-media img',generated+'08-proceso-v4.webp','Trabajo de masa y fuego en El Errante');
  promoteHomeImage('.v4-menu-feature-media img',generated+'03-la-errante-v4.webp','La Errante');
  promoteHomeImage('.v4-menu-item[href*="margherita-del-taller"] img',generated+'02-margherita-v4.webp','');
  promoteHomeImage('.v4-menu-item[href*="bosque"] img',generated+'04-bosque-v4.webp','');
  promoteHomeImage('.v4-menu-item[href*="diavola-errante"] img',generated+'05-diavola-v4.webp','');
  promoteHomeImage('.v4-menu-item[href*="cuatro-quesos-montana"] img',generated+'06-cuatro-quesos-v4.webp','');
  promoteHomeImage('.v4-pantry-media img',generated+'07-despensa-v4.webp','Despensa El Errante');

  /* Existing V4 masters remain stronger than the generated alternatives for these slots. */
  promoteHomeImage('.v4-fire-media img','assets/images/brand-v4/segundo-fuego-v4.webp','Segundo Fuego de El Errante');
  promoteHomeImage('.v4-movement-main img','assets/images/brand-v4/eventos-v4.webp','El Errante En Movimiento');

  document.documentElement.dataset.eeV4GeneratedHome='01-08-promoted';

  const header=document.querySelector('.v4-header');
  const toggle=document.querySelector('.v4-menu-toggle');
  const nav=document.querySelector('.v4-nav');
  const headerAction=document.querySelector('.v4-header-action');

  if(headerAction)headerAction.style.position='relative';

  if(header&&toggle&&nav){
    const setMenuState=open=>{
      header.dataset.open=String(open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Cerrar navegación':'Abrir navegación');
      document.body.classList.toggle('v4-menu-open',open);
    };
    const close=()=>setMenuState(false);
    toggle.addEventListener('click',()=>setMenuState(header.dataset.open!=='true'));
    nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape'||header.dataset.open!=='true')return;
      close();
      toggle.focus();
    });
    window.addEventListener('resize',()=>{if(window.innerWidth>1040)close();},{passive:true});
  }

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items=[...document.querySelectorAll('.v4-reveal')];
  if(!reduced&&'IntersectionObserver' in window&&items.length){
    document.documentElement.classList.add('v4-motion');
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    items.forEach(item=>observer.observe(item));
  }else{
    items.forEach(item=>item.classList.add('is-visible'));
  }
})();