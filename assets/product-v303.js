(()=>{
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const statusMeta={
    confirmed:{label:'Confirmado',description:'Dato respaldado por la definición vigente.'},
    provisional:{label:'Por validar',description:'Referencia aproximada de desarrollo; debe cerrarse con medición o ficha técnica.'},
    label:{label:'Etiqueta / lote',description:'El dato operativo final depende de la etiqueta, lote o especificación vigente.'}
  };

  function currentProduct(){
    const id=new URLSearchParams(location.search).get('id');
    return window.EE_DATA?.products?.find(product=>product.id===id&&product.product_detail_release==='3.0.3')||null;
  }

  function compositionHTML(items){
    return (items||[]).map((item,index)=>`<article class="v303-composition-item"><span>0${index+1}</span><div><h3>${esc(item.name)}</h3><p>${esc(item.role)}</p></div></article>`).join('');
  }

  function passportHTML(items){
    return (items||[]).map(([name,data])=>{
      const meta=statusMeta[data?.status]||statusMeta.provisional;
      return `<div class="v303-spec" data-v303-status="${esc(data?.status||'provisional')}"><div class="v303-spec-head"><strong>${esc(name)}</strong><span class="v303-state v303-state-${esc(data?.status||'provisional')}">${esc(meta.label)}</span></div><p>${esc(data?.value||'Pendiente')}</p>${data?.note?`<small>${esc(data.note)}</small>`:''}</div>`;
    }).join('');
  }

  function signalsHTML(items){
    return (items||[]).map(([name,value])=>`<article class="v303-signal"><small>${esc(name)}</small><p>${esc(value)}</p></article>`).join('');
  }

  function overviewHTML(product){
    const provisionalCount=(product.passport||[]).filter(([,data])=>data?.status==='provisional').length;
    return `<div data-v303-layer data-v303-provisional-count="${provisionalCount}">
      <section class="section v303-overview" data-v303-block="essential"><div class="container">
        <div class="v303-section-head"><div><p class="eyebrow">En Casa · Ficha esencial</p><p class="v30-kicker">${esc(product.territory||'Producto')}</p><h2>Qué llega a tu horno.</h2></div><p class="lead">${esc(product.arrival)}</p></div>
        <div class="v303-main-grid">
          <div class="v303-composition"><p class="v303-label">Composición por función</p>${compositionHTML(product.composition)}</div>
          <aside class="v303-passport" aria-label="Ficha técnica resumida"><div class="v303-passport-title"><div><p class="v303-label">Pasaporte de producto</p><h3>Lo confirmado y lo que falta cerrar.</h3></div><span class="v303-release">V3.0.3</span></div><div class="v303-spec-grid">${passportHTML(product.passport)}</div><div class="v303-legend"><span><i class="confirmed"></i>Confirmado</span><span><i class="provisional"></i>Por validar</span><span><i class="label"></i>Etiqueta / lote</span></div><p class="v303-disclaimer">Los valores marcados <strong>Por validar</strong> son referencias de desarrollo para completar la experiencia de la ficha. No sustituyen etiqueta, especificación sanitaria, fórmula aprobada ni control de lote.</p></aside>
        </div>
      </div></section>
      <section class="section section-paper v303-service" data-v303-block="service"><div class="container">
        <div class="v303-section-head"><div><p class="eyebrow">Segundo Fuego · lectura práctica</p><h2>No mires solamente el reloj.</h2></div><p class="lead">La instrucción del empaque prevalece. Estas señales explican qué queremos recuperar cuando la pizza vuelve al fuego.</p></div>
        <div class="v303-service-grid"><article><span>01</span><small>Antes</small><h3>Preparar el fuego</h3><p>${esc(product.service?.before)}</p></article><article><span>02</span><small>Durante</small><h3>Leer la pizza</h3><p>${esc(product.service?.fire)}</p></article><article><span>03</span><small>Después</small><h3>Terminar y servir</h3><p>${esc(product.service?.finish)}</p></article></div>
        <div class="v303-ready"><div><p class="v303-label">Señales de punto</p><h3>Qué debería decirte la pizza antes de cortarla.</h3></div><div class="v303-signal-grid">${signalsHTML(product.ready_signals)}</div></div>
      </div></section>
    </div>`;
  }

  function enhance(){
    const root=document.querySelector('#dynamic-product');
    const product=currentProduct();
    if(!root||!product)return false;
    const legacyStory=root.querySelector('[data-v29-product-story]');
    if(!legacyStory)return false;
    if(root.querySelector('[data-v303-layer]')){
      root.dataset.v303Ready='true';
      return true;
    }
    legacyStory.insertAdjacentHTML('beforebegin',overviewHTML(product));
    root.dataset.v303Ready='true';
    document.body.classList.add('ee-v303-product');
    return true;
  }

  const root=document.querySelector('#dynamic-product');
  if(!root)return;
  enhance();
  const observer=new MutationObserver(()=>enhance());
  observer.observe(root,{childList:true,subtree:true});
  document.addEventListener('ee:v303-product-detail-ready',enhance);
  setTimeout(()=>{enhance();observer.disconnect();},10000);
})();