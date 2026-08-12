(()=>{
  'use strict';

  const header=document.querySelector('.v4-header');
  const toggle=document.querySelector('.v4-menu-toggle');
  const nav=document.querySelector('.v4-nav');

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
