(()=>{
  'use strict';
  const VERSION='2.9.1';
  const SETTINGS_KEY='ee_v14_settings';
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};

  function valueOf(form,name){
    const field=form.elements.namedItem(name);
    if(!field)return '';
    if(field instanceof RadioNodeList)return field.value||'';
    if(field.type==='checkbox')return field.checked?'Sí':'No';
    return String(field.value||'').trim();
  }

  function summary(form,title,fields){
    const lines=[title,''];
    for(const [name,label] of fields){
      const value=valueOf(form,name);
      if(value)lines.push(`${label}: ${value}`);
    }
    lines.push('','Borrador preparado desde el sitio de El Errante. No ha sido enviado automáticamente.');
    return lines.join('\n');
  }

  function localOrdering(){
    const saved=read(SETTINGS_KEY,{});
    const base=window.EL_ERRANTE_COMMERCE_CONFIG?.ordering||{};
    return {...base,...(saved.ordering||{})};
  }

  function backendConfig(){
    return window.EL_ERRANTE_COMMERCE_CONFIG?.backend||window.EL_ERRANTE_RUNTIME_CONFIG?.backend||{};
  }

  let supportPromise;
  async function configuredOrdering(){
    if(supportPromise)return supportPromise;
    supportPromise=(async()=>{
      const local=localOrdering();
      const backend=backendConfig();
      if(!backend.url||!backend.publishableKey)return local;
      try{
        const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const client=module.createClient(backend.url,backend.publishableKey,{
          auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
        });
        const response=await client.from('public_settings').select('value').eq('key','ordering').maybeSingle();
        if(response.error||!response.data?.value)return local;
        return {...local,...response.data.value};
      }catch(_){
        return local;
      }
    })();
    return supportPromise;
  }

  async function handoffMarkup(text){
    const config=await configuredOrdering();
    const actions=[];
    const whatsapp=String(config.supportWhatsapp||'').replace(/\D/g,'');
    const email=String(config.supportEmail||'').trim();
    if(whatsapp){
      const href=`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
      actions.push(`<a class="btn btn-primary btn-small" data-public-action-channel="whatsapp" href="${escapeHtml(href)}" target="_blank" rel="noopener">Abrir WhatsApp con el resumen</a>`);
    }
    if(email){
      const subject=(text.split('\n')[0]||'El Errante').trim();
      const href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      actions.push(`<a class="btn btn-outline btn-small" data-public-action-channel="email" href="${escapeHtml(href)}">Preparar correo con el resumen</a>`);
    }
    if(!actions.length)return '';
    return `<div class="button-row ee-v29-handoff-actions">${actions.join('')}</div><span class="ee-v29-handoff-note">Abrir un canal no envía nada por sí solo: revisa el mensaje y confirma el envío en WhatsApp o en tu correo.</span>`;
  }

  async function copyOrExpose(text,status){
    const handoff=await handoffMarkup(text);
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.innerHTML=`<strong>Resumen copiado y borrador guardado.</strong>${handoff||'<span>La web no lo ha enviado. Conserva este texto para compartirlo cuando exista un canal de atención configurado.</span>'}`;
    }catch(_){
      status.innerHTML=`<strong>Borrador guardado en este navegador.</strong><span>La web no lo ha enviado. Copia el resumen manualmente:</span><textarea class="ee-v29-copy-output" readonly>${escapeHtml(text)}</textarea>${handoff}`;
      const area=status.querySelector('textarea');area?.focus();area?.select();
    }
  }

  function setup({formId,buttonId,statusId,key,title,fields}){
    const form=document.getElementById(formId);
    const button=document.getElementById(buttonId);
    const status=document.getElementById(statusId);
    if(!form||!button||!status)return;
    button.addEventListener('click',async()=>{
      if(!form.reportValidity())return;
      const text=summary(form,title,fields);
      const draft={version:VERSION,updatedAt:new Date().toISOString(),text};
      localStorage.setItem(key,JSON.stringify(draft));
      button.disabled=true;
      try{
        await copyOrExpose(text,status);
      }finally{
        button.disabled=false;
      }
    });
  }

  function init(){
    document.documentElement.dataset.publicActionsVersion=VERSION;
    setup({
      formId:'ee-v29-help-form',buttonId:'ee-v29-help-copy',statusId:'ee-v29-help-status',key:'ee_v29_help_draft',title:'SOLICITUD DE AYUDA · EL ERRANTE',
      fields:[['name','Nombre'],['email','Correo'],['phone','Teléfono'],['reason','Motivo'],['order','Pedido'],['productLot','Producto o lote'],['message','Qué ocurrió']]
    });
    setup({
      formId:'ee-v29-quote-form',buttonId:'ee-v29-quote-copy',statusId:'ee-v29-quote-status',key:'ee_v29_quote_draft',title:'BORRADOR DE COTIZACIÓN · EL ERRANTE EN MOVIMIENTO',
      fields:[['eventType','Tipo de evento'],['guests','Invitados'],['date','Fecha'],['place','Ciudad y lugar'],['format','Formato'],['budget','Presupuesto estimado'],['experience','Experiencia y condiciones'],['name','Nombre'],['email','Correo'],['phone','Teléfono'],['company','Empresa']]
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();