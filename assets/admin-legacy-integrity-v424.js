(()=>{
  'use strict';

  const VERSION='4.2.4';
  const ROOT_ID='admin-dynamic';
  const STATUS_SELECTOR=`#${ROOT_ID} [data-order-status]`;

  const guard=()=>window.EL_ERRANTE_ADMIN_CONNECTIVITY||null;
  const client=()=>window.__EE_ADMIN_SUPABASE__||null;
  const connected=()=>{
    const gate=guard();
    return Boolean(gate&&client()&&gate.state===gate.states.CONNECTED);
  };

  function setMessage(text,type='ok'){
    let box=document.getElementById('ee-legacy-integrity-message');
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    if(!box){
      box=document.createElement('div');
      box.id='ee-legacy-integrity-message';
      box.className='data-note';
      box.style.marginBottom='14px';
      root.prepend(box);
    }
    box.textContent=text;
    box.dataset.type=type;
  }

  function patchLegacyCopy(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;

    root.querySelectorAll('.ee-v14-card').forEach(card=>{
      const title=card.querySelector('h2')?.textContent?.trim()||'';
      if(title==='Precios, costos e inventario'){
        const help=card.querySelector('.ee-v14-help');
        if(help&&/demostraci[oó]n|demostrativos/i.test(help.textContent||'')){
          help.textContent='Verifica precio, costo e inventario antes de operar. Un inventario sin conteo no debe interpretarse como cero.';
        }
      }
      if(title==='Gastos fijos'||title==='Estructura mensual'){
        const note=[...card.querySelectorAll('.ee-v14-note')].find(node=>/6\.000\.000|base inicial/i.test(node.textContent||''));
        if(note){
          const total=note.querySelector('strong')?.textContent?.trim()||'';
          note.replaceChildren(document.createTextNode('Total configurado: '));
          const strong=document.createElement('strong');
          strong.textContent=total;
          note.append(strong,document.createTextNode('. Verifica la estructura vigente antes de usarla como costo real.'));
        }
      }
    });
  }

  function markStatuses(){
    document.querySelectorAll(STATUS_SELECTOR).forEach(select=>{
      if(!select.dataset.integrityStatus)select.dataset.integrityStatus=select.value;
    });
  }

  async function transition(select,next){
    const previous=select.dataset.integrityStatus||select.value;
    const orderId=String(select.dataset.orderStatus||'').trim();
    if(!orderId)return;
    select.disabled=true;
    try{
      await guard().assertConnected();
      const result=await client().rpc('transition_order_v22',{
        p_order_id:orderId,
        p_new_status:next,
        p_note:null
      });
      if(result?.error)throw result.error;
      select.dataset.integrityStatus=next;
      setMessage(`Estado de ${orderId} actualizado mediante transición segura.`);
      window.dispatchEvent(new CustomEvent('ee:v21:reload'));
    }catch(error){
      select.value=previous;
      select.dataset.integrityStatus=previous;
      setMessage(error?.message||'No fue posible cambiar el estado del pedido.','error');
    }finally{
      select.disabled=false;
    }
  }

  function interceptLegacyStatus(event){
    const target=event.target instanceof Element?event.target.closest(STATUS_SELECTOR):null;
    if(!target||!connected())return;
    const next=target.value;
    event.preventDefault();
    event.stopImmediatePropagation();
    void transition(target,next);
  }

  function reconcile(){
    patchLegacyCopy();
    markStatuses();
  }

  function init(){
    if(document.body?.dataset.page!=='admin')return;
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    document.addEventListener('change',interceptLegacyStatus,true);
    new MutationObserver(reconcile).observe(root,{childList:true,subtree:true,characterData:true});
    window.addEventListener('ee:admin-connectivity',reconcile);
    reconcile();
    document.documentElement.dataset.adminLegacyIntegrityVersion=VERSION;
  }

  window.EL_ERRANTE_ADMIN_LEGACY_INTEGRITY=Object.freeze({version:VERSION,connected,reconcile});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
