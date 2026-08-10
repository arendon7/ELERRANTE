(()=>{
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titleCase=v=>String(v||'').replace(/(^|[- ])\w/g,m=>m.toUpperCase());
  const widthFor=value=>({bajo:28,'bajo-medio':38,media:52,medio:52,'media-alta':70,'medio-alto':70,alto:88,alta:88}[String(value).toLowerCase()]||55);
  function currentProduct(){
    const id=new URLSearchParams(location.search).get('id');
    return window.EE_DATA?.products?.find(p=>p.id===id&&p.editorial_version==='3.0')||null;
  }
  function renderSensory(profile){
    return Object.entries(profile||{}).map(([label,value])=>`<div class="v30-sensory-row"><strong>${esc(label)}</strong><div class="v30-sensory-bar"><span style="width:${widthFor(value)}%"></span></div><span>${esc(titleCase(value))}</span></div>`).join('');
  }
  function sectionHTML(p){
    const sensory=renderSensory(p.sensory_profile);
    const secondFire=p.second_fire_enabled?`<section class="section section-dark" data-v30-block="second-fire"><div class="container split"><div><p class="eyebrow">En Casa · Segundo Fuego</p><h2>La pizza no termina necesariamente en nuestro horno.</h2><p class="lead" style="color:rgba(242,236,225,.76)">En Casa es la línea. Segundo Fuego es la investigación detrás: primera cocción, estructura, humedad y acabado se piensan sabiendo desde el comienzo que habrá una última transformación en una cocina doméstica.</p><p style="color:rgba(242,236,225,.76)">Las instrucciones específicas de preparación, conservación y lote siguen siendo la fuente operativa y prevalecen sobre cualquier explicación editorial.</p><p class="quote" style="color:var(--cream)">Nosotros hacemos el tiempo. Tú completas el fuego.</p><a class="text-link" style="color:var(--wheat)" href="metodo.html#segundo-fuego">Entender Segundo Fuego</a></div><div><p class="v30-kicker" style="color:var(--wheat)">Principio</p><h3 style="color:var(--cream)">La identidad permanece. La ingeniería puede cambiar.</h3><p style="color:rgba(242,236,225,.76)">Una pizza destinada a viajar, esperar y volver al fuego no debe desarrollarse como si fuera idéntica a una pizza servida segundos después de salir del horno.</p></div></div></section>`:'';
    const canonNote=p.canon_note?`<p class="v30-small"><strong>Canon abierto:</strong> ${esc(p.canon_note)}</p>`:'';
    return `
      <section class="section section-paper" data-v30-block="identity"><div class="container v30-product-sections"><div><p class="v30-kicker">${esc(p.territory)}</p><h2>Cómo se siente</h2><p class="lead">${esc(p.sensory_promise)}</p><div class="v30-sensory">${sensory}</div></div><div><p class="v30-kicker">Elegir con claridad</p><h2>Si estás buscando…</h2><p class="lead">${esc(p.best_for)}</p><p>El territorio gastronómico ayuda a comparar la carta; no sustituye ingredientes, alérgenos, presentación ni preparación de la versión vigente.</p>${canonNote}<a class="text-link" href="tienda.html?category=en-casa">Comparar otras pizzas</a></div></div></section>
      <section class="section" data-v30-block="workshop"><div class="container v30-decision"><p class="eyebrow">Decisión del taller</p><h2>${esc(p.workshop_question)}</h2><p class="lead">${esc(p.workshop_decision)}</p><p class="quote">${esc(p.short_description)}</p><div class="button-row"><a class="btn btn-dark" href="bitacora.html">Seguir la investigación</a><a class="btn btn-outline" href="metodo.html">Conocer el Método</a></div></div></section>
      ${secondFire}
      <section class="section" data-v30-block="author"><div class="container split"><div><p class="eyebrow">Desde la dirección gastronómica</p><h2>Juan David Ocampo</h2><p class="lead">“${esc(p.author_note)}”</p><p><strong>Chef · Director gastronómico de El Errante</strong></p><a class="text-link" href="juan-david-ocampo.html">Conocer su trabajo</a></div><div><p class="v30-kicker">${esc(p.research_program)}</p><h3>${esc(p.research_state)}</h3><p>La página de producto muestra el canon comercial vigente. La Bitácora conserva pruebas e hipótesis sin convertirlas automáticamente en promesas de venta.</p><a class="text-link" href="bitacora.html">Abrir Bitácora</a></div></div></section>`;
  }
  function enhance(){
    const root=document.querySelector('#dynamic-product');
    const p=currentProduct();
    if(!root||!p)return false;
    const h1=root.querySelector('h1');
    const legacyStory=root.querySelector('[data-v29-product-story]');
    if(!h1||!legacyStory)return false;
    if(root.dataset.v30Ready==='true'&&root.querySelector('[data-v30-block="identity"]')&&root.querySelector('[data-v30-territory]'))return true;
    root.querySelectorAll('[data-v30-block],[data-v30-territory],[data-v30-promise]').forEach(node=>node.remove());
    h1.insertAdjacentHTML('beforebegin',`<p class="v30-kicker" data-v30-territory>${esc(p.territory)}</p>`);
    h1.insertAdjacentHTML('afterend',`<p class="lead" data-v30-promise>${esc(p.sensory_promise)}</p>`);
    root.insertAdjacentHTML('beforeend',sectionHTML(p));
    root.dataset.v30Ready='true';
    document.body.classList.add('ee-v30-product');
    document.title=`${p.name||h1.textContent||'Producto'} · El Errante`;
    return true;
  }
  const root=document.querySelector('#dynamic-product');
  if(root){
    enhance();
    const observer=new MutationObserver(()=>enhance());
    observer.observe(root,{childList:true,subtree:true});
    setTimeout(()=>{enhance();observer.disconnect();},10000);
  }
})();
