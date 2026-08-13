(()=>{
  'use strict';

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

  const promoteHomeImage=(selector,src,alt)=>{
    const image=document.querySelector(selector);
    if(!image)return;
    image.src=src;
    if(alt!==undefined)image.alt=alt;
    image.removeAttribute('width');
    image.removeAttribute('height');
    image.decoding='async';
  };
  promoteHomeImage('.v4-fire-media img','assets/images/brand-v4/segundo-fuego-v4.webp','Segundo Fuego de El Errante');
  promoteHomeImage('.v4-movement-main img','assets/images/brand-v4/eventos-v4.webp','El Errante En Movimiento');

  const header=document.querySelector('.v4-header');
  const toggle=document.querySelector('.v4-menu-toggle');
  const nav=document.querySelector('.v4-nav');
  const headerAction=document.querySelector('.v4-header-action');

  if(headerAction)headerAction.style.position='relative';

  if(header&&toggle&&nav){
    const close=()=>{
      header.dataset.open='false';
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('v4-menu-open');
    };
    toggle.addEventListener('click',()=>{
      const open=header.dataset.open==='true';
      header.dataset.open=String(!open);
      toggle.setAttribute('aria-expanded',String(!open));
      document.body.classList.toggle('v4-menu-open',!open);
    });
    nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
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