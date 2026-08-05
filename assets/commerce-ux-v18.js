(()=>{
  'use strict';

  const VERSION='1.8.0';
  const page=document.body?.dataset?.page||'';
  const qs=(selector,root=document)=>root.querySelector(selector);
  const qsa=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function readCart(){
    try{
      const value=JSON.parse(localStorage.getItem('ee_v2_cart'));
      return Array.isArray(value)?value:[];
    }catch(_){return [];}
  }

  function insertAfter(target,html,key){
    if(!target||document.querySelector(`[data-v18="${key}"]`))return null;
    target.insertAdjacentHTML('afterend',html);
    return document.querySelector(`[data-v18="${key}"]`);
  }

  function announce(message){
    let live=qs('#ee-v18-live');
    if(!live){
      live=document.createElement('div');
      live.id='ee-v18-live';
      live.className='sr-only';
      live.setAttribute('aria-live','polite');
      document.body.appendChild(live);
    }
    live.textContent='';
    requestAnimationFrame(()=>{live.textContent=message;});
  }

  function copyText(value,button){
    const done=()=>{
      const original=button.textContent;
      button.textContent='Copiado';
      button.dataset.copied='true';
      announce('Dato copiado al portapapeles.');
      setTimeout(()=>{button.textContent=original;delete button.dataset.copied;},1800);
    };
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(value).then(done).catch(()=>fallbackCopy(value,done));
    }else fallbackCopy(value,done);
  }

  function fallbackCopy(value,done){
    const input=document.createElement('textarea');
    input.value=value;
    input.setAttribute('readonly','');
    input.style.position='fixed';
    input.style.opacity='0';
    document.body.appendChild(input);
    input.select();
    try{document.execCommand('copy');done();}catch(_){announce('Selecciona el dato y cópialo manualmente.');}
    input.remove();
  }

  function checkoutProgress(){
    return `<nav class="ee-v18-progress" aria-label="Progreso de compra" data-v18="checkout-progress">
      <button type="button" class="is-active" data-v18-step-target="1"><span>1</span><strong>Tus datos</strong><small>Para confirmar contigo</small></button>
      <button type="button" data-v18-step-target="2"><span>2</span><strong>Entrega</strong><small>Coordinada antes de preparar</small></button>
      <button type="button" data-v18-step-target="3"><span>3</span><strong>Pago</strong><small>Transferencia verificada</small></button>
    </nav>`;
  }

  function checkoutConfidence(){
    return `<section class="ee-v18-confidence" data-v18="checkout-confidence" aria-label="Condiciones de compra">
      <div><strong>Sin producción anticipada</strong><span>Preparamos después de verificar el pago y coordinar la entrega.</span></div>
      <div><strong>Total transparente</strong><span>Productos y logística quedan visibles antes de enviar la solicitud.</span></div>
      <div><strong>Contacto directo</strong><span>Confirmamos contigo disponibilidad, horario y cualquier ajuste.</span></div>
    </section>`;
  }

  function updateProgress(step){
    qsa('[data-v18-step-target]').forEach(button=>{
      const value=Number(button.dataset.v18StepTarget);
      button.classList.toggle('is-active',value===step);
      button.classList.toggle('is-complete',value<step);
      button.setAttribute('aria-current',value===step?'step':'false');
    });
  }

  function wrapCheckoutSections(form){
    if(form.dataset.v18Sections==='true')return;
    const headings=qsa(':scope > h3',form);
    if(headings.length<3)return;
    headings.forEach((heading,index)=>{
      const section=document.createElement('section');
      section.className='ee-v18-checkout-section';
      section.dataset.checkoutStep=String(index+1);
      section.setAttribute('aria-labelledby',`ee-v18-step-${index+1}`);
      heading.id=`ee-v18-step-${index+1}`;
      heading.before(section);
      let node=heading;
      while(node&&(!node.matches('h3')||node===heading)){
        const next=node.nextSibling;
        section.appendChild(node);
        node=next;
        if(node?.nodeType===1&&node.matches('h3'))break;
      }
      const note=document.createElement('p');
      note.className='ee-v18-step-note';
      note.textContent=[
        'Usaremos estos datos únicamente para confirmar y acompañar este pedido.',
        'La fecha es una preferencia. La alternativa disponible se confirma contigo antes de preparar.',
        'El pedido queda aprobado únicamente cuando el comprobante ha sido revisado.'
      ][index];
      heading.insertAdjacentElement('afterend',note);
    });
    form.dataset.v18Sections='true';
  }

  function enhanceBankDetails(form){
    qsa('.ee-v14-bank-item',form).forEach(item=>{
      if(item.dataset.v18Copy==='true')return;
      const label=qs('small',item)?.textContent.trim().toLowerCase()||'';
      const valueNode=qs('strong',item);
      const value=valueNode?.textContent.trim()||'';
      if(!value||/pendiente/i.test(value)||(!label.includes('número')&&!label.includes('llave')))return;
      const button=document.createElement('button');
      button.type='button';
      button.className='ee-v18-copy';
      button.textContent='Copiar';
      button.setAttribute('aria-label',`Copiar ${label}`);
      button.addEventListener('click',()=>copyText(value,button));
      item.appendChild(button);
      item.dataset.v18Copy='true';
    });
  }

  function enhanceReceipt(form){
    const input=qs('#ee-receipt',form);
    if(!input||input.dataset.v18Ready==='true')return;
    const status=document.createElement('div');
    status.className='ee-v18-file-status';
    status.setAttribute('aria-live','polite');
    status.innerHTML='<strong>Ningún archivo seleccionado</strong><span>Elige una imagen o PDF legible del comprobante.</span>';
    input.insertAdjacentElement('afterend',status);
    input.addEventListener('change',()=>{
      const file=input.files?.[0];
      if(!file){
        status.innerHTML='<strong>Ningún archivo seleccionado</strong><span>Elige una imagen o PDF legible del comprobante.</span>';
        return;
      }
      const size=file.size<1048576?`${Math.max(1,Math.round(file.size/1024))} KB`:`${(file.size/1048576).toFixed(1)} MB`;
      status.innerHTML=`<strong>${escapeHtml(file.name)}</strong><span>${size} · listo para adjuntar</span>`;
    });
    input.dataset.v18Ready='true';
  }

  function enhanceCheckoutForm(form){
    if(!form||form.dataset.v18Ready==='true')return;
    wrapCheckoutSections(form);
    form.classList.add('ee-v18-form');
    const phone=qs('#ee-phone',form);
    if(phone){phone.inputMode='tel';phone.placeholder='Ej. 300 000 0000';}
    const date=qs('#ee-date',form);
    if(date&&!date.min){
      const today=new Date();
      today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
      date.min=today.toISOString().slice(0,10);
    }
    const submit=qs('button[type="submit"]',form);
    if(submit){submit.textContent='Confirmar solicitud y enviar comprobante';submit.classList.add('ee-v18-submit');}
    const consent=qs('input[name="consent"]',form)?.closest('label');
    if(consent&&!qs('.ee-v18-consent-note',consent.parentElement)){
      consent.insertAdjacentHTML('afterend','<small class="ee-v18-consent-note">No iniciamos la preparación hasta confirmar pago y condiciones de entrega.</small>');
    }
    enhanceBankDetails(form);
    enhanceReceipt(form);
    form.addEventListener('focusin',event=>{
      const section=event.target.closest('[data-checkout-step]');
      if(section)updateProgress(Number(section.dataset.checkoutStep));
    });
    qsa('[data-v18-step-target]').forEach(button=>button.addEventListener('click',()=>{
      const target=qs(`[data-checkout-step="${button.dataset.v18StepTarget}"]`,form);
      target?.scrollIntoView({behavior:'smooth',block:'start'});
      target?.querySelector('input,textarea,select,button')?.focus({preventScroll:true});
      updateProgress(Number(button.dataset.v18StepTarget));
    }));
    form.dataset.v18Ready='true';
  }

  function enhanceCheckoutSummary(){
    const summary=qs('.checkout-summary');
    if(!summary||summary.dataset.v18Ready==='true')return;
    summary.insertAdjacentHTML('afterbegin','<div class="ee-v18-summary-kicker"><span>Pedido reservado para coordinación</span><strong>Revisa cantidades y total antes de transferir.</strong></div>');
    summary.insertAdjacentHTML('beforeend',`<div class="ee-v18-next"><strong>Qué ocurre después</strong><ol><li>Recibimos tu solicitud y el comprobante.</li><li>Verificamos pago, disponibilidad y logística.</li><li>Confirmamos contigo antes de preparar y despachar.</li></ol></div>`);
    summary.dataset.v18Ready='true';
  }

  function setupMobileTotal(){
    if(qs('[data-v18="mobile-total"]'))return;
    const bar=document.createElement('div');
    bar.className='ee-v18-mobile-total';
    bar.dataset.v18='mobile-total';
    bar.innerHTML='<div><small>Total del pedido</small><strong id="ee-v18-mobile-total-value">—</strong></div><button type="button">Continuar</button>';
    document.body.appendChild(bar);
    bar.querySelector('button').addEventListener('click',()=>{
      const form=qs('#checkout-form-v14')||qs('#checkout-form');
      form?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    const total=qs('#checkout-total');
    const sync=()=>{qs('#ee-v18-mobile-total-value').textContent=total?.textContent.trim()||'—';};
    sync();
    if(total)new MutationObserver(sync).observe(total,{childList:true,subtree:true,characterData:true});
  }

  function showEmptyCheckout(){
    if(readCart().length)return false;
    const layout=qs('.checkout-layout');
    if(!layout)return false;
    layout.hidden=true;
    layout.insertAdjacentHTML('beforebegin',`<section class="ee-v18-empty" data-v18="empty-cart">
      <p class="eyebrow">Tu selección está vacía</p>
      <h2>Primero elige qué quieres llevar al fuego.</h2>
      <p>No necesitas completar datos ni transferir todavía. Regresa a la tienda, conoce las fichas y agrega los productos que quieras coordinar.</p>
      <div class="button-row"><a class="btn btn-primary" href="tienda.html">Explorar la tienda</a><a class="btn btn-outline" href="en-casa.html">Conocer las pizzas</a></div>
    </section>`);
    return true;
  }

  function watchCheckoutSuccess(){
    const root=qs('main');
    if(!root)return;
    const enhance=()=>{
      const success=qs('.ee-v14-order-success',root);
      if(!success||success.dataset.v18Ready==='true')return;
      success.insertAdjacentHTML('beforeend',`<div class="ee-v18-success-steps"><strong>Ahora sigue esto:</strong><ol><li>Guarda la referencia del pedido.</li><li>Espera la confirmación del pago y la disponibilidad.</li><li>Recibe el horario acordado de preparación o entrega.</li></ol></div>`);
      const title=qs('h2',success);if(title)title.textContent='Tu solicitud quedó registrada.';
      const bar=qs('[data-v18="mobile-total"]');if(bar)bar.hidden=true;
      success.dataset.v18Ready='true';
    };
    enhance();
    const observer=new MutationObserver(enhance);
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  }

  function initCheckout(){
    document.documentElement.dataset.commerceUxVersion=VERSION;
    document.body.classList.add('ee-v18-checkout');
    const heading=qs('main h1');
    if(heading){
      heading.textContent='Confirma tu pedido con claridad.';
      const lead=heading.nextElementSibling;
      if(lead?.classList.contains('lead'))lead.textContent='Revisa tu selección, déjanos los datos de entrega y adjunta el comprobante. Antes de preparar, confirmaremos contigo el pago, la disponibilidad y la logística.';
    }
    const note=qs('.data-note');
    if(note)note.innerHTML='<strong>La solicitud no obliga a aceptar una ruta o fecha automática.</strong> Coordinamos contigo la alternativa disponible y cualquier ajuste antes de iniciar la preparación.';
    const layout=qs('.checkout-layout');
    if(layout){
      layout.insertAdjacentHTML('beforebegin',checkoutProgress()+checkoutConfidence());
    }
    if(showEmptyCheckout())return;
    enhanceCheckoutSummary();
    setupMobileTotal();
    const attach=()=>enhanceCheckoutForm(qs('#checkout-form-v14'));
    attach();
    const main=qs('main');
    if(main)new MutationObserver(attach).observe(main,{childList:true,subtree:true});
    watchCheckoutSuccess();
  }

  const productBadges={
    'harina-aire-y-tiempo':'Desde la masa',
    'crea-la-tuya':'Personaliza en casa',
    'margherita-del-taller':'Termina en casa',
    'diavola-errante':'Intensidad afinada',
    'bosque':'Vegetal con profundidad',
    'cuatro-quesos-montana':'Cremosidad equilibrada',
    'la-errante':'Pizza insignia',
    'salsa-tomate':'Despensa esencial',
    'reduccion-balsamica':'Acabado de precisión',
    'panela-maracuya':'Firma colombiana',
    'combo-primera-ruta':'Experiencia completa'
  };

  function enhanceProductCards(){
    qsa('a[href*="producto.html?id="]').forEach(link=>{
      let id='';
      try{id=new URL(link.href,location.href).searchParams.get('id')||'';}catch(_){}
      if(!id||!productBadges[id])return;
      const card=link.closest('.product-card')||link.closest('article')||link.parentElement;
      if(!card||card.dataset.v18Card==='true')return;
      const heading=qs('h2,h3',card);
      if(heading)heading.insertAdjacentHTML('beforebegin',`<span class="ee-v18-product-badge">${escapeHtml(productBadges[id])}</span>`);
      card.dataset.v18Card='true';
    });
  }

  function initStore(){
    document.documentElement.dataset.commerceUxVersion=VERSION;
    const hero=qs('.hero');
    insertAfter(hero,`<section class="ee-v18-store-trust" data-v18="store-trust"><div class="container"><div><strong>Elige con información</strong><span>Cada ficha explica presentación, participación y terminado.</span></div><div><strong>Entrega coordinada</strong><span>Confirmamos disponibilidad y logística antes de preparar.</span></div><div><strong>Cadena de frío cuidada</strong><span>Las condiciones del empaque prevalecen para conservación y uso.</span></div><div><strong>Pago verificable</strong><span>Transferencia y comprobante con referencia de pedido.</span></div></div></section>`,'store-trust');
    const catalog=qs('#catalogo .container');
    if(catalog&&!qs('[data-v18="store-path"]')){
      catalog.insertAdjacentHTML('afterbegin',`<section class="ee-v18-store-path" data-v18="store-path"><p class="eyebrow">Una compra en tres decisiones</p><div><span><b>1</b><strong>Elige tu participación</strong><small>Preparar, personalizar, terminar o completar.</small></span><span><b>2</b><strong>Revisa la ficha</strong><small>Presentación, conservación y método antes de agregar.</small></span><span><b>3</b><strong>Coordina el pedido</strong><small>Pago, disponibilidad y entrega se confirman contigo.</small></span></div></section>`);
    }
    enhanceProductCards();
    const grid=qs('#product-grid');
    if(grid)new MutationObserver(enhanceProductCards).observe(grid,{childList:true,subtree:true});
  }

  function productAssurance(product){
    const id=product?.id||new URLSearchParams(location.search).get('id')||'';
    const frozen=new Set(['crea-la-tuya','margherita-del-taller','diavola-errante','bosque','cuatro-quesos-montana','la-errante']);
    const pantry=new Set(['salsa-tomate','reduccion-balsamica','panela-maracuya']);
    if(id==='harina-aire-y-tiempo')return ['Un blend desarrollado para construir tu propia masa.','Mantén el empaque cerrado, seco y protegido según su etiqueta.','Mide, registra y ajusta fermentación, hidratación y temperatura.'];
    if(frozen.has(id))return ['Una preparación El Errante diseñada para recibir el último fuego en casa.','Conserva la cadena de frío y sigue siempre las instrucciones del empaque.','Precalienta bien, termina la cocción y sirve inmediatamente.'];
    if(pantry.has(id))return ['Un producto de despensa pensado para construir o terminar con precisión.','Respeta las condiciones de conservación y consumo indicadas en la etiqueta.','Empieza con poca cantidad: el equilibrio se ajusta antes de repetir.'];
    if(id==='combo-primera-ruta')return ['Una selección para recorrer distintas formas de vivir El Errante.','Revisa por separado la conservación indicada para cada componente.','Organiza la experiencia antes de comenzar y reserva los acabados para el final.'];
    return ['Un producto desarrollado dentro del método El Errante.','La información del empaque prevalece para conservación, alérgenos y vida útil.','Sigue el método recomendado y ajusta únicamente después de observar el resultado.'];
  }

  function enhanceProductPage(){
    const root=qs('#dynamic-product');
    if(!root||root.dataset.v18Assurance==='true')return;
    const heading=qs('h1',root);
    if(!heading)return;
    const id=new URLSearchParams(location.search).get('id');
    const product=(window.EE_DATA?.products||[]).find(item=>item.id===id)||{};
    const [receive,keep,enjoy]=productAssurance(product);
    root.insertAdjacentHTML('beforeend',`<section class="ee-v18-product-assurance" data-v18="product-assurance"><div class="container"><div class="section-head"><div><p class="eyebrow">Compra con criterio</p><h2>Antes de llevarlo, entiende el recorrido completo.</h2></div><p>La calidad también depende de cómo recibes, conservas y terminas el producto.</p></div><div class="grid grid-3"><article><span>01</span><h3>Qué recibes</h3><p>${escapeHtml(receive)}</p></article><article><span>02</span><h3>Cómo conservar</h3><p>${escapeHtml(keep)}</p></article><article><span>03</span><h3>Cómo disfrutar</h3><p>${escapeHtml(enjoy)}</p></article></div><div class="ee-v18-assurance-note"><strong>Información responsable</strong><span>La etiqueta y el empaque real prevalecen para ingredientes, alérgenos, lote, conservación y vida útil.</span></div></div></section>`);
    root.dataset.v18Assurance='true';
  }

  function initProduct(){
    document.documentElement.dataset.commerceUxVersion=VERSION;
    enhanceProductPage();
    const root=qs('#dynamic-product');
    if(root)new MutationObserver(enhanceProductPage).observe(root,{childList:true,subtree:true});
  }

  function init(){
    if(page==='checkout')initCheckout();
    if(page==='tienda')initStore();
    if(location.pathname.endsWith('/producto.html')||location.pathname.endsWith('producto.html'))initProduct();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
