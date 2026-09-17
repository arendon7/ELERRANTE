(()=>{
  'use strict';
  const VERSION='3.0.0';
  let patching=false;
  const guard=()=>window.EL_ERRANTE_ADMIN_CONNECTIVITY||null;
  const db=()=>window.__EE_ADMIN_SUPABASE__||null;
  const connected=()=>Boolean(guard()&&db()&&guard().state===guard().states.CONNECTED);
  const known=value=>value!==null&&value!==undefined&&value!=='';
  const n=value=>Number(value)||0;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const qty=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(n(value));

  async function patch(){
    if(patching||!connected())return;
    const root=document.getElementById('operations-v16');
    if(!root||!root.querySelector('[data-v16-product-row]'))return;
    patching=true;
    try{
      const result=await db().from('product_operations').select('product_id,product_name,inventory,low_stock_threshold,active').order('product_name');
      if(result.error)throw result.error;
      const rows=(result.data||[]).filter(row=>row.active!==false);
      rows.forEach(row=>{
        if(known(row.inventory))return;
        const tr=root.querySelector(`[data-v16-product-row="${CSS.escape(String(row.product_id))}"]`);
        if(!tr)return;
        const cells=tr.children;
        if(cells[4]&&cells[4].textContent!=='No contado')cells[4].textContent='No contado';
        if(cells[6]&&!cells[6].querySelector('[data-v30-unknown-stock]'))cells[6].innerHTML='<span class="ee-v16-stock" data-v30-unknown-stock>Sin conteo</span>';
      });

      const low=rows.filter(row=>known(row.inventory)&&n(row.inventory)<=n(row.low_stock_threshold));
      const unknown=rows.filter(row=>!known(row.inventory));
      const alert=root.querySelector('.ee-v16-alert');
      if(alert){
        let className='ee-v16-alert ok';
        let title='Inventario sin alertas';
        let copy='Ningún producto con conteo conocido está por debajo de su umbral.';
        if(low.length){
          className='ee-v16-alert warning';
          title=`${low.length} producto(s) requieren atención`;
          copy=low.map(row=>`${row.product_name||row.product_id}: ${qty(row.inventory)}`).join(' · ');
          if(unknown.length)copy+=` · ${unknown.length} sin conteo físico`;
        }else if(unknown.length){
          className='ee-v16-alert warning';
          title=`${unknown.length} producto(s) sin conteo físico`;
          copy='Registra un inventario inicial antes de interpretar disponibilidad o necesidad de restock.';
        }
        if(alert.className!==className)alert.className=className;
        const html=`<strong>${esc(title)}</strong><span>${esc(copy)}</span>`;
        if(alert.innerHTML!==html)alert.innerHTML=html;
      }
      document.documentElement.dataset.operationsInventoryTruthVersion=VERSION;
    }catch(error){console.warn('No fue posible presentar inventario desconocido en Operaciones.',error);}
    finally{patching=false;}
  }

  function bind(){
    const root=document.getElementById('operations-v16');
    if(root)new MutationObserver(()=>void patch()).observe(root,{childList:true,subtree:true});
    ['ee:v16:reload','ee:admin-connectivity','ee:order:status-changed'].forEach(name=>window.addEventListener(name,()=>void patch()));
    setTimeout(()=>void patch(),0);
  }

  window.EL_ERRANTE_OPERATIONS_INVENTORY_TRUTH_V30=Object.freeze({version:VERSION,connected,patch});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
