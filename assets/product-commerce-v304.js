(()=>{
  'use strict';

  const VERSION='3.0.4';
  const IDS=['margherita-del-taller','la-errante','bosque','diavola-errante','cuatro-quesos-montana'];
  const META={
    'margherita-del-taller':{
      desire:'Quiero una pizza limpia y esencial.',
      intensity:'Baja–media',
      route:'Tomate · lácteo · frescura',
      cue:'Claridad',
      alternatives:['bosque','la-errante']
    },
    'la-errante':{
      desire:'Quiero conocer la firma de El Errante.',
      intensity:'Media–alta',
      route:'Tostado · umami · acidez',
      cue:'Territorio',
      alternatives:['diavola-errante','margherita-del-taller']
    },
    'bosque':{
      desire:'Quiero profundidad vegetal y umami.',
      intensity:'Media–alta',
      route:'Hongos · tostado · frescura',
      cue:'Profundidad vegetal',
      alternatives:['cuatro-quesos-montana','margherita-del-taller']
    },
    'diavola-errante':{
      desire:'Quiero picante con sabor y progresión.',
      intensity:'Media–alta',
      route:'Tomate · especias · calor',
      cue:'Intensidad',
      alternatives:['la-errante','margherita-del-taller']
    },
    'cuatro-quesos-montana':{
      desire:'Quiero una pizza cremosa y envolvente.',
      intensity:'Alta',
      route:'Fundencia · maduración · contraste',
      cue:'Arquitectura láctea',
      alternatives:['bosque','margherita-del-taller']
    }
  };

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const qs=(selector,root=document)=>root.querySelector(selector);
  const products=()=>window.EE_DATA?.products||[];
  const byId=id=>products().find(product=>product.id===id)||null;
  const path=()=>location.pathname.split('/').pop()||'index.html';

  function productCard(id,selected=false){
    const product=byId(id);
    const meta=META[id];
    if(!product||!meta)return '';
    return `<a class="v304-choice-card${selected?' is-current':''}" href="producto.html?id=${encodeURIComponent(id)}" data-v304-choice="${esc(id)}"${selected?' aria-current="page"':''}>
      <div class="v304-choice-media"><img src="${esc(product.image||'assets/images/brand-final/home-en-casa.webp')}" alt="${esc(product.name||meta.cue)}" loading="lazy"></div>
      <div class="v304-choice-copy"><small>${esc(meta.cue)}</small><h3>${esc(meta.desire)}</h3><p>${esc(product.name||id)}</p><div class="v304-choice-tags"><span>${esc(meta.intensity)}</span><span>${esc(meta.route)}</span></div></div>
      <span class="v304-choice-arrow" aria-hidden="true">↗</span>
    </a>`;
  }

  function selectionSection(){
    return `<section class="section section-paper v304-selector" id="v304-elegir" data-v304-layer="store-selector"><div class="container">
      <div class="v304-selector-head"><div><p class="eyebrow">Elegir por antojo</p><h2>No empieces por el nombre. Empieza por lo que quieres comer.</h2></div><p class="lead">Cinco pizzas, cinco direcciones. La intensidad es una guía editorial para comparar sensaciones; ingredientes, alérgenos y condiciones reales siguen viviendo en cada ficha y etiqueta.</p></div>
      <div class="v304-choice-grid">${IDS.map(id=>productCard(id)).join('')}</div>
      <div class="v304-selector-foot"><span>¿Primera vez?</span><strong>La Errante muestra con mayor claridad el lenguaje actual de la marca; la Margherita deja ver el trabajo con menos capas.</strong></div>
    </div></section>`;
  }

  function enhanceStore(){
    if(path()!=='tienda.html')return false;
    const catalog=qs('#catalogo');
    if(!catalog)return false;
    if(!qs('[data-v304-layer="store-selector"]'))catalog.insertAdjacentHTML('beforebegin',selectionSection());
    document.documentElement.dataset.eeCommerceEditorialVersion=VERSION;
    document.body.classList.add('ee-v304-store');
    return true;
  }

  function findPurchaseButton(root){
    return [...root.querySelectorAll('button')].find(button=>{
      if(button.matches('[data-v304-add]')||button.closest('[data-v304-layer]'))return false;
      const text=(button.textContent||'').trim().toLowerCase();
      return /agregar|añadir/.test(text);
    })||null;
  }

  function triggerPurchase(root,feedbackButton){
    const original=findPurchaseButton(root);
    if(!original){
      const firstAction=qs('.button-row,.product-actions',root);
      firstAction?.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    original.click();
    if(feedbackButton){
      const previous=feedbackButton.textContent;
      feedbackButton.textContent='Agregado';
      feedbackButton.dataset.v304Added='true';
      setTimeout(()=>{feedbackButton.textContent=previous;delete feedbackButton.dataset.v304Added;},1400);
    }
  }

  function quickDecision(product,meta,canBuy){
    return `<aside class="v304-quick" data-v304-layer="quick-decision" aria-label="Elección rápida de ${esc(product.name)}">
      <div class="v304-quick-copy"><small>Elígela si</small><strong>${esc(meta.desire)}</strong><p>${esc(product.best_for||product.short_description||'')}</p></div>
      <div class="v304-quick-facts"><span><small>Territorio</small>${esc(meta.cue)}</span><span><small>Intensidad</small>${esc(meta.intensity)}</span><span><small>Ruta de sabor</small>${esc(meta.route)}</span></div>
      <div class="v304-quick-actions">${canBuy?'<button type="button" class="btn btn-dark" data-v304-add>Agregar a mi selección</button>':''}<a class="btn btn-outline" href="#v304-comparar">Comparar alternativas</a><a class="v304-detail-link" href="#v304-ficha">Ver ficha esencial ↓</a></div>
    </aside>`;
  }

  function compareCard(id){
    const product=byId(id);
    const meta=META[id];
    if(!product||!meta)return '';
    return `<a class="v304-compare-card" href="producto.html?id=${encodeURIComponent(id)}" data-v304-compare-card="${esc(id)}">
      <div class="v304-compare-media"><img src="${esc(product.image||'assets/images/brand-final/home-en-casa.webp')}" alt="${esc(product.name||meta.cue)}" loading="lazy"></div>
      <div><small>${esc(meta.cue)}</small><h3>${esc(product.name||id)}</h3><p>${esc(meta.desire)}</p><div class="v304-compare-facts"><span>${esc(meta.intensity)}</span><span>${esc(meta.route)}</span></div><strong>Ver esta pizza →</strong></div>
    </a>`;
  }

  function comparisonSection(product,meta){
    const cards=meta.alternatives.map(compareCard).join('');
    return `<section class="section v304-compare" id="v304-comparar" data-v304-layer="comparison"><div class="container">
      <div class="v304-compare-head"><div><p class="eyebrow">Antes de decidir</p><h2>Si esta dirección te atrae, compara dos movimientos cercanos.</h2></div><div><p>Estás viendo <strong>${esc(product.name)}</strong>. Estas alternativas cambian la intensidad o el eje del bocado sin salir de la colección En Casa.</p><a class="text-link" href="tienda.html#v304-elegir">Comparar las cinco pizzas</a></div></div>
      <div class="v304-compare-grid">${cards}</div>
    </div></section>`;
  }

  function ensureMobileBuy(root,product,meta){
    if(qs('[data-v304-mobile-buy]'))return;
    const original=findPurchaseButton(root);
    if(!original)return;
    const bar=document.createElement('div');
    bar.className='v304-mobile-buy';
    bar.dataset.v304MobileBuy='true';
    bar.innerHTML=`<div><small>${esc(meta.cue)} · En Casa</small><strong>${esc(product.name||'Pizza El Errante')}</strong></div><button type="button" class="btn btn-primary" data-v304-add-mobile>Agregar</button>`;
    document.body.appendChild(bar);
    bar.querySelector('[data-v304-add-mobile]')?.addEventListener('click',event=>triggerPurchase(root,event.currentTarget));
  }

  function enhanceProduct(){
    if(path()!=='producto.html')return false;
    const root=qs('#dynamic-product');
    if(!root)return false;
    const id=new URLSearchParams(location.search).get('id')||'';
    const product=byId(id);
    const meta=META[id];
    if(!product||!meta||product.product_detail_release!=='3.0.3')return false;
    const h1=qs('h1',root);
    const promise=qs('[data-v30-promise]',root);
    const essential=qs('[data-v303-block="essential"]',root);
    const service=qs('[data-v303-block="service"]',root);
    if(!h1||!essential||!service)return false;

    if(root.dataset.v304Ready==='true'){
      ensureMobileBuy(root,product,meta);
      return true;
    }

    essential.id='v304-ficha';
    const anchor=promise||h1;
    const canBuy=Boolean(findPurchaseButton(root));
    anchor.insertAdjacentHTML('afterend',quickDecision(product,meta,canBuy));
    service.insertAdjacentHTML('afterend',comparisonSection(product,meta));

    qs('[data-v304-add]',root)?.addEventListener('click',event=>triggerPurchase(root,event.currentTarget));
    root.dataset.v304Ready='true';
    document.documentElement.dataset.eeCommerceEditorialVersion=VERSION;
    document.body.classList.add('ee-v304-product');
    ensureMobileBuy(root,product,meta);
    document.dispatchEvent(new CustomEvent('ee:v304-commerce-ready',{detail:{id,version:VERSION}}));
    return true;
  }

  function init(){
    if(path()==='tienda.html'){
      enhanceStore();
      const main=qs('main');
      if(main)new MutationObserver(enhanceStore).observe(main,{childList:true,subtree:true});
      return;
    }
    if(path()==='producto.html'){
      enhanceProduct();
      const root=qs('#dynamic-product');
      if(root){
        const observer=new MutationObserver(()=>enhanceProduct());
        observer.observe(root,{childList:true,subtree:true});
        setTimeout(()=>{enhanceProduct();observer.disconnect();},10000);
      }
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();