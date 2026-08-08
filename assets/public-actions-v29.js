(()=>{
  'use strict';
  const VERSION='2.9.0';
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

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

  async function copyOrExpose(text,status){
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.innerHTML='<strong>Resumen copiado y borrador guardado.</strong><span>La web no lo ha enviado. Puedes conservar este texto para compartirlo por el canal de atención cuando esté configurado.</span>';
    }catch(_){
      status.innerHTML=`<strong>Borrador guardado en este navegador.</strong><span>La web no lo ha enviado. Copia el resumen manualmente:</span><textarea class="ee-v29-copy-output" readonly>${escapeHtml(text)}</textarea>`;
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
      await copyOrExpose(text,status);
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
