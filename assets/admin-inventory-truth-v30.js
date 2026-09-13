(()=>{
  'use strict';
  const VERSION='3.0.0';
  const guard=()=>window.EL_ERRANTE_ADMIN_CONNECTIVITY||null;
  const db=()=>window.__EE_ADMIN_SUPABASE__||null;
  const connected=()=>Boolean(guard()&&db()&&guard().state===guard().states.CONNECTED);
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const catalog=()=>new Map((Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[]).map(product=>{
    const variant=Array.isArray(product.variants)?product.variants[0]||{}:{};
    const id=String(product.id||variant.id||'');
    return [id,{id,name:product.name||product.title||variant.name||id}];
  }).filter(([id])=>id));
  let patching=false;

  function message(text,type='ok'){
    const node=document.getElementById('ee-admin-message');
    if(node){node.textContent=text;node.dataset.type=type;}
  }

  async function patchUnknownInputs(){
    if(patching||!connected())return;
    const inputs=[...document.querySelectorAll('[data-product-inventory]')];
    if(!inputs.length)return;
    patching=true;
    try{
      const result=await db().from('product_operations').select('product_id,inventory,active');
      if(result.error)throw result.error;
      const remote=new Map((result.data||[]).map(row=>[String(row.product_id),row]));
      inputs.forEach(input=>{
        const id=String(input.dataset.productInventory||'');
        const row=remote.get(id);
        if(!row)return;
        input.dataset.productActive=row.active===false?'false':'true';
        const value=row.inventory;
        if(value===null||value===undefined||value===''){
          input.value='';
          input.placeholder='No contado';
          input.dataset.inventoryKnown='false';
        }else{
          input.value=String(value);
          input.dataset.inventoryKnown='true';
        }
      });
      const card=document.querySelector('#ee-save-products')?.closest('.ee-v14-card');
      const help=card?.querySelector('.ee-v14-help');
      if(help)help.textContent='Confirma precio, costo e inventario real. Un inventario vacío significa “no contado”; no se convierte en cero.';
    }catch(error){console.warn('No fue posible reconciliar inventario desconocido.',error);}
    finally{patching=false;}
  }

  async function saveRemote(event,button){
    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled=true;
    try{
      await guard().assertConnected();
      const products=catalog();
      const rows=[...document.querySelectorAll('.ee-v14-product-row')].map(row=>{
        const inventoryInput=row.querySelector('[data-product-inventory]');
        const id=String(inventoryInput?.dataset.productInventory||'');
        const product=products.get(id)||{id,name:row.querySelector('strong')?.textContent?.trim()||id};
        const price=row.querySelector(`[data-product-price="${CSS.escape(id)}"]`);
        const cost=row.querySelector(`[data-product-cost="${CSS.escape(id)}"]`);
        const rawInventory=String(inventoryInput?.value??'').trim();
        return {
          product_id:id,
          product_name:product.name,
          sale_price:number(price?.value),
          unit_cost:number(cost?.value),
          inventory:rawInventory===''?null:number(rawInventory),
          active:inventoryInput?.dataset.productActive!=='false',
          updated_at:new Date().toISOString()
        };
      }).filter(row=>row.product_id);
      const result=await db().from('product_operations').upsert(rows,{onConflict:'product_id'});
      if(result.error)throw result.error;
      message('Catálogo operativo guardado. Los inventarios sin conteo permanecen desconocidos.');
      window.dispatchEvent(new CustomEvent('ee:v16:reload'));
      document.querySelector('#ee-refresh-admin')?.click();
    }catch(error){console.error(error);message(error?.message||'No fue posible guardar el catálogo operativo.','error');}
    finally{button.disabled=false;}
  }

  function bind(){
    document.addEventListener('click',event=>{
      const button=event.target instanceof Element?event.target.closest('#ee-save-products'):null;
      if(!button||!connected())return;
      void saveRemote(event,button);
    },true);
    const root=document.getElementById('admin-dynamic');
    if(root)new MutationObserver(()=>void patchUnknownInputs()).observe(root,{childList:true,subtree:true});
    window.addEventListener('ee:admin-connectivity',()=>void patchUnknownInputs());
    setTimeout(()=>void patchUnknownInputs(),0);
  }

  window.EL_ERRANTE_ADMIN_INVENTORY_TRUTH_V30=Object.freeze({version:VERSION,connected,patchUnknownInputs});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
