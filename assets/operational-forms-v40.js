(()=>{
'use strict';
const VERSION='4.0.0';
const FORM_CONFIG={
 '#ee-v24-purchase-form':{label:'Compra observada',kind:'purchase'},
 '#ee-v24-measurement-form':{label:'Medición de lote',kind:'measurement'},
 '#ee-v25-order-form':{label:'Borrador de compra',kind:'order'},
 '#ee-v25-receipt-form':{label:'Recepción de orden',kind:'receipt'}
};
const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
const num=(value,digits=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(Number(value)||0);
const fieldValue=(form,name)=>form.elements?.[name]?.value??'';
const numeric=(form,name)=>Number(fieldValue(form,name))||0;
function fieldName(field){
 const label=field.closest('label');
 return label?.querySelector(':scope > span:first-child')?.textContent?.replace(/\s*·\s*requerido\s*$/i,'').trim()||field.name||'campo';
}
function requiredFields(form){
 return [...form.elements].filter(field=>field instanceof HTMLElement&&field.required&&field.type!=='hidden'&&!field.disabled);
}
function pendingFields(form){return requiredFields(form).filter(field=>!field.validity.valid);}
function previewText(form,kind){
 if(kind==='purchase'){
  const quantity=numeric(form,'quantity'),total=numeric(form,'totalCost');
  return quantity>0&&total>=0?{title:`Costo observado por unidad: ${money(total/quantity)}`,detail:'Vista previa. El motor V2.4 conserva la decisión sobre inventario y el registro final.'}:{title:'Completa cantidad y costo total para ver el costo unitario.',detail:'No se guarda ni modifica inventario desde esta vista previa.'};
 }
 if(kind==='measurement'){
  const expected=numeric(form,'expectedQty'),actual=numeric(form,'actualQty'),waste=numeric(form,'wasteQty');
  if(expected>0&&fieldValue(form,'actualQty')!==''){
   const attainment=(actual/expected)*100;const base=actual+waste;const wasteRate=base>0?(waste/base)*100:0;
   return {title:`Rendimiento ${num(attainment)} % · merma ${num(wasteRate)} %`,detail:'Vista previa derivada. No cambia receta, BOM ni costo estándar.'};
  }
  return {title:'Completa la cantidad utilizable para anticipar rendimiento y merma.',detail:'La medición seguirá siendo evidencia observada hasta guardar.'};
 }
 if(kind==='order'){
  const quantity=numeric(form,'requestedQty'),unitCost=numeric(form,'unitCost');
  return quantity>0&&unitCost>0?{title:`Compromiso estimado del borrador: ${money(quantity*unitCost)}`,detail:'Guardar sigue creando sólo un borrador; aprobar y emitir son acciones separadas.'}:{title:'El compromiso queda pendiente hasta definir cantidad y costo unitario.',detail:'No se aprueba ni emite ninguna orden desde esta vista previa.'};
 }
 if(kind==='receipt'){
  const quantity=numeric(form,'quantity'),total=numeric(form,'totalCost');
  return quantity>0&&total>=0?{title:`Costo unitario observado: ${money(total/quantity)}`,detail:'La actualización de inventario seguirá su regla existente de conteo físico.'}:{title:'Completa cantidad y costo total para revisar el costo unitario observado.',detail:'La recepción sólo se registra al confirmar el formulario.'};
 }
 return {title:'Formulario operativo',detail:''};
}
function ensureGuide(form,config){
 let guide=form.querySelector(':scope > [data-v40-guide]');
 if(!guide){
  guide=document.createElement('div');guide.className='v40-form-guide';guide.dataset.v40Guide='';guide.setAttribute('role','status');guide.setAttribute('aria-live','polite');
  const copy=document.createElement('div');const strong=document.createElement('strong');strong.dataset.v40Status='';const span=document.createElement('span');span.textContent=config.label+' · asistencia V4.0';copy.append(strong,span);
  const next=document.createElement('button');next.type='button';next.className='v40-next';next.dataset.v40Next='';next.textContent='Ir al siguiente pendiente';next.addEventListener('click',()=>{const field=pendingFields(form)[0];if(!field)return;const details=field.closest('details');if(details)details.open=true;field.focus();});
  guide.append(copy,next);form.prepend(guide);
 }
 return guide;
}
function ensurePreview(form,config){
 let preview=form.querySelector(':scope > [data-v40-preview]');
 if(!preview){
  preview=document.createElement('div');preview.className='v40-form-preview';preview.dataset.v40Preview='';preview.dataset.v40Kind=config.kind;
  const small=document.createElement('small');small.textContent='Vista previa antes de guardar';const strong=document.createElement('strong');strong.dataset.v40PreviewTitle='';const span=document.createElement('span');span.dataset.v40PreviewDetail='';preview.append(small,strong,span);
  const submit=form.querySelector('button[type="submit"],input[type="submit"]');const anchor=submit?.closest('.ee-v25-form-actions')||submit;
  if(anchor)form.insertBefore(preview,anchor);else form.append(preview);
 }
 return preview;
}
function annotateFields(form){
 [...form.elements].forEach(field=>{
  if(!(field instanceof HTMLElement)||field.type==='hidden')return;
  if(field.required){const label=field.closest('label');if(label)label.dataset.v40Required='';}
  if(field.tagName==='INPUT'&&field.type==='number'&&!field.hasAttribute('inputmode'))field.setAttribute('inputmode','decimal');
 });
}
function updateForm(form,config,state){
 const guide=ensureGuide(form,config);const pending=pendingFields(form);const status=guide.querySelector('[data-v40-status]');const next=guide.querySelector('[data-v40-next]');
 if(state==='invalid'){
  guide.dataset.state='invalid';status.textContent=`Revisa ${pending.length||1} campo${pending.length===1?'':'s'} antes de guardar.`;
 }else if(pending.length){
  guide.dataset.state='pending';status.textContent=`${pending.length} campo${pending.length===1?' esencial pendiente':'s esenciales pendientes'}: ${pending.slice(0,2).map(fieldName).join(', ')}${pending.length>2?'…':''}`;
 }else{
  guide.dataset.state='ready';status.textContent='Listo para guardar. Revisa la vista previa y confirma.';
 }
 next.hidden=!pending.length;
 const preview=ensurePreview(form,config);const text=previewText(form,config.kind);preview.querySelector('[data-v40-preview-title]').textContent=text.title;preview.querySelector('[data-v40-preview-detail]').textContent=text.detail;
}
function guardSubmit(form,config,event){
 if(form.dataset.v40Submitting==='true'){event.preventDefault();event.stopImmediatePropagation();return;}
 form.dataset.v40Submitting='true';updateForm(form,config);
 const submit=form.querySelector('button[type="submit"],input[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
 setTimeout(()=>{if(!form.isConnected)return;form.dataset.v40Submitting='false';if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}updateForm(form,config);},12000);
}
function enhanceForm(form,config){
 if(form.dataset.v40Enhanced==='true')return;
 form.dataset.v40Enhanced='true';annotateFields(form);ensureGuide(form,config);ensurePreview(form,config);updateForm(form,config);
 form.addEventListener('input',event=>{const field=event.target;if(field instanceof HTMLElement&&field.validity?.valid){field.removeAttribute('aria-invalid');}updateForm(form,config);});
 form.addEventListener('change',()=>updateForm(form,config));
 form.addEventListener('invalid',event=>{const field=event.target;if(field instanceof HTMLElement)field.setAttribute('aria-invalid','true');const details=field.closest?.('details');if(details)details.open=true;updateForm(form,config,'invalid');},{capture:true});
 form.addEventListener('submit',event=>guardSubmit(form,config,event),{capture:true});
 form.addEventListener('reset',()=>setTimeout(()=>updateForm(form,config),0));
}
function enhanceAll(){
 Object.entries(FORM_CONFIG).forEach(([selector,config])=>{const form=document.querySelector(selector);if(form)enhanceForm(form,config);});
 document.documentElement.dataset.operationalFormsVersion=VERSION;
}
let queued=false;function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;enhanceAll();});}
function observe(){
 ['#measurement-v24','#procurement-v25'].forEach(selector=>{const root=document.querySelector(selector);if(!root)return;new MutationObserver(schedule).observe(root,{childList:true,subtree:true});});
}
window.EL_ERRANTE_OPERATIONAL_FORMS_V40={version:VERSION,enhanceAll,pendingFields};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{enhanceAll();observe();setTimeout(enhanceAll,120);},{once:true});else{enhanceAll();observe();setTimeout(enhanceAll,120);}
})();
