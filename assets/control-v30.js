(()=>{
  'use strict';
  const DATA=window.EL_ERRANTE_MATERIALS_V23||{products:[],materials:[]};
  const KEYS={orders:'ee_v14_orders',stock:'ee_v23_material_stock',fulfillment:'ee_v22_fulfillment',purchases:'ee_v25_purchase_orders'};
  const ACTIVE=new Set(['approved','preparing','dispatched']);
  const PRODUCE=new Set(['approved','preparing']);
  const OPEN_PURCHASES=new Set(['draft','approved','ordered','partial']);
  const CHECKS=['productReady','packagingReady','quantityChecked','deliveryCoordinated'];
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const num=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const selectedDate=()=>sessionStorage.getItem('ee_v22_selected_date')||today();
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const itemQty=item=>num(item.quantity);
  const itemName=item=>item.name||item.product_name||'Producto';
  function orderDate(order){return String(order.delivery?.requestedDate||order.requested_date||'');}
  function findProduct(item){
    const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
    const name=norm(itemName(item));
    return DATA.products.find(product=>(product.ids||[]).some(id=>ids.includes(String(id)))||(product.names||[]).some(candidate=>norm(candidate)===name)||norm(product.name)===name)||null;
  }
  function explode(product,amount,bag=new Map(),seen=new Set()){
    if(!product||seen.has(product.sku))return bag;
    const next=new Set(seen);next.add(product.sku);
    (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+num(line.qty)*amount));
    (product.components||[]).forEach(component=>explode(DATA.products.find(item=>item.sku===component.sku),amount*num(component.qty),bag,next));
    return bag;
  }
  function compute(){
    const date=selectedDate();
    const orders=read(KEYS.orders,[]);
    const stock=read(KEYS.stock,{});
    const fulfillment=read(KEYS.fulfillment,{});
    const purchaseOrders=read(KEYS.purchases,[]);
    const day=orders.filter(order=>ACTIVE.has(String(order.status))&&orderDate(order)===date);
    const toProduce=day.filter(order=>PRODUCE.has(String(order.status)));
    const units=toProduce.flatMap(order=>order.items||[]).reduce((sum,item)=>sum+itemQty(item),0);
    const requirements=new Map();
    let unmatched=0;
    toProduce.forEach(order=>(order.items||[]).forEach(item=>{const product=findProduct(item);if(product)explode(product,itemQty(item),requirements);else unmatched+=itemQty(item);}));
    const materialRows=[...requirements.entries()].map(([id,required])=>{
      const material=DATA.materials.find(item=>item.id===id)||{id,name:id,unit:'unidad'};
      const known=stock[id]!==undefined&&stock[id]!==null&&stock[id]!=='';
      const available=known?num(stock[id]):null;
      return {material,required,available,gap:known?Math.max(0,required-available):null};
    });
    const shortages=materialRows.filter(row=>row.gap!==null&&row.gap>0);
    const unknown=materialRows.filter(row=>row.available===null);
    const undated=orders.filter(order=>ACTIVE.has(String(order.status))&&!orderDate(order));
    const incomplete=day.filter(order=>String(order.status)==='preparing').filter(order=>{const f=fulfillment[order.id]||{};return !CHECKS.every(key=>Boolean(f[key]));});
    const openPurchases=purchaseOrders.filter(order=>OPEN_PURCHASES.has(String(order.status)));
    return {date,orders,day,toProduce,units,materialRows,shortages,unknown,undated,incomplete,openPurchases,unmatched};
  }
  function metric(label,value,detail){return `<article class="v30-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`;}
  function alerts(state){
    const list=[];
    if(state.shortages.length)list.push({level:'critical',title:`${state.shortages.length} faltante(s) confirmados`,detail:'Hay materiales con conteo físico insuficiente para la producción comprometida.'});
    if(state.unknown.length)list.push({level:'warning',title:`${state.unknown.length} conteo(s) pendientes`,detail:'Sin conteo no se debe convertir una necesidad teórica en una compra automática.'});
    if(state.incomplete.length)list.push({level:'warning',title:`${state.incomplete.length} pedido(s) en preparación incompletos`,detail:'Falta cerrar uno o más controles de alistamiento antes del despacho.'});
    if(state.undated.length)list.push({level:'warning',title:`${state.undated.length} pedido(s) activo(s) sin fecha`,detail:'No pueden entrar correctamente a la agenda de producción hasta asignar fecha comprometida.'});
    if(state.unmatched)list.push({level:'critical',title:`${state.unmatched} unidad(es) sin BOM reconocida`,detail:'Revisar SKU o variante antes de usar requerimientos para producción o compras.'});
    if(!list.length)list.push({level:'ok',title:'Sin alertas críticas para la fecha',detail:'La lectura local no detecta bloqueos operativos con los datos disponibles.'});
    return list;
  }
  function alertHtml(item){return `<div class="v30-alert" data-level="${item.level}"><div><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div></div>`;}
  function render(){
    const root=document.querySelector('#control-v30');if(!root)return;
    const state=compute();
    root.innerHTML=`<section aria-labelledby="control-v30-title"><div class="v30-metrics">${metric('Pedidos comprometidos',state.day.length,`Fecha ${state.date}`)}${metric('Unidades por producir',state.units,'Pedidos aprobados o en preparación')}${metric('Faltantes confirmados',state.shortages.length,'Solo contra conteos físicos conocidos')}${metric('Compras abiertas',state.openPurchases.length,'Borradores, aprobadas, emitidas o parciales')}</div><div class="v30-grid"><section class="v30-panel"><div class="v30-panel-head"><div><h2 id="control-v30-title">Prioridades de hoy</h2><p>Excepciones que requieren una decisión operativa.</p></div><a class="v30-link" href="operacion.html">Abrir operación →</a></div><div class="v30-alerts">${alerts(state).map(alertHtml).join('')}</div></section><section class="v30-panel"><div class="v30-panel-head"><div><h2>Lectura de materiales</h2><p>De pedido comprometido a necesidad de insumos.</p></div></div><div class="v30-alerts">${alertHtml({level:state.materialRows.length?'ok':'warning',title:`${state.materialRows.length} materiales requeridos`,detail:'Explosión BOM para la fecha seleccionada.'})}${alertHtml({level:state.unknown.length?'warning':'ok',title:`${state.unknown.length} sin conteo físico`,detail:'Se conservan como desconocidos; no se convierten en cero.'})}</div></section></div><section class="v30-panel" style="margin-top:16px"><div class="v30-panel-head"><div><h2>Cadena operativa</h2><p>Una sola dirección: compromiso → producción → materiales → compra → despacho.</p></div></div><div class="v30-flow"><a href="operacion.html#agenda"><small>01</small><strong>Agenda</strong><span>Pedidos y fecha →</span></a><a href="operacion.html#produccion"><small>02</small><strong>Producción</strong><span>Consolidado y alistamiento →</span></a><a href="operacion.html#materiales"><small>03</small><strong>Materiales</strong><span>BOM, stock y faltantes →</span></a><a href="operacion.html#medicion"><small>04</small><strong>Medición</strong><span>Compra, lote y merma →</span></a><a href="operacion.html#compras"><small>05</small><strong>Compras</strong><span>Solicitud, proveedor y recepción →</span></a></div></section></section>`;
    document.documentElement.dataset.controlVersion='3.0.0';
  }
  window.addEventListener('ee:v21:reload',render);window.addEventListener('ee:v22:reload',render);window.addEventListener('ee:v24:stock-updated',render);window.addEventListener('storage',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
