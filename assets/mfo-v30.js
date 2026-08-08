(()=>{
  'use strict';

  const VERSION='3.0.0';
  const ROOT_ID='mfo-v30';
  const STORAGE_KEY='ee_v30_mfo_snapshot';
  const MONTH_KEY='ee_v30_mfo_month';
  const ORDER_KEY='ee_v14_orders';
  const MOVEMENT_KEY='ee_v27_finance_movements';
  const APPROVED=new Set(['approved','preparing','dispatched','delivered']);
  const VALID_STATES=new Set(['CONFIRMADO','ESTIMADO','INFERIDO','CONTRADICTORIO','PENDIENTE']);

  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const num=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:null;};
  const money=value=>value===null||value===undefined?'—':new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
  const integer=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(Number(value)||0);
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const currentMonth=()=>today().slice(0,7);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};

  function blankSnapshot(){
    return {
      schemaVersion:'3.0',
      meta:{modelName:'',modelDate:'',exportedAt:'',status:'PENDIENTE',confidence:'',source:'Archivo local no persistido en GitHub'},
      planSales:[],productCosts:[],cashFlow:[],scenarios:[],assumptions:[]
    };
  }

  function normalize(snapshot){
    const source=snapshot&&typeof snapshot==='object'?snapshot:{};
    return {
      schemaVersion:String(source.schemaVersion||''),
      meta:source.meta&&typeof source.meta==='object'?source.meta:{},
      planSales:Array.isArray(source.planSales)?source.planSales:[],
      productCosts:Array.isArray(source.productCosts)?source.productCosts:[],
      cashFlow:Array.isArray(source.cashFlow)?source.cashFlow:[],
      scenarios:Array.isArray(source.scenarios)?source.scenarios:[],
      assumptions:Array.isArray(source.assumptions)?source.assumptions:[]
    };
  }

  function validate(snapshot){
    const data=normalize(snapshot);
    const errors=[];
    if(!/^3(?:\.|$)/.test(data.schemaVersion))errors.push('schemaVersion debe comenzar por 3.');
    if(!data.meta||typeof data.meta!=='object')errors.push('Falta meta.');
    for(const [key,label] of [['planSales','plan de ventas'],['productCosts','productos/costos'],['cashFlow','flujo 24M'],['scenarios','escenarios'],['assumptions','supuestos']]){
      if(!Array.isArray(data[key]))errors.push(`${label} debe ser una lista.`);
    }
    const invalidMonths=[...data.planSales,...data.cashFlow].filter(row=>row.month&&!/^\d{4}-\d{2}$/.test(String(row.month)));
    if(invalidMonths.length)errors.push('Hay periodos que no usan formato YYYY-MM.');
    const invalidStates=[data.meta,...data.planSales,...data.productCosts,...data.cashFlow,...data.scenarios,...data.assumptions]
      .map(row=>String(row?.status||'').toUpperCase()).filter(Boolean).filter(status=>!VALID_STATES.has(status));
    if(invalidStates.length)errors.push(`Estado no reconocido: ${invalidStates[0]}.`);
    return {data,errors};
  }

  function rowQuality(snapshot){
    const rows=[...snapshot.planSales,...snapshot.productCosts,...snapshot.cashFlow,...snapshot.scenarios,...snapshot.assumptions];
    const statusMissing=rows.filter(row=>!row.status).length;
    const sourceMissing=rows.filter(row=>!row.source).length;
    const confidenceMissing=rows.filter(row=>!row.confidence).length;
    return {rows:rows.length,statusMissing,sourceMissing,confidenceMissing};
  }

  function productCost(snapshot,sku,month){
    const rows=snapshot.productCosts.filter(row=>String(row.sku||'')===String(sku||''));
    const eligible=rows.filter(row=>!row.validFrom||String(row.validFrom).slice(0,7)<=month).sort((a,b)=>String(b.validFrom||'').localeCompare(String(a.validFrom||'')));
    return eligible[0]||rows[0]||null;
  }

  function planState(snapshot,month){
    const rows=snapshot.planSales.filter(row=>String(row.month||'')===month);
    let sales=0,cogs=0,missingSales=0,missingCost=0,units=0;
    rows.forEach(row=>{
      const qty=num(row.quantity)??0;
      units+=qty;
      const cost=productCost(snapshot,row.sku,month);
      const explicitSales=num(row.sales);
      const price=num(row.unitPrice)??num(cost?.price);
      if(explicitSales!==null)sales+=explicitSales;
      else if(price!==null)sales+=qty*price;
      else missingSales+=1;
      const explicitCogs=num(row.cogs);
      const unitCost=num(row.unitCost)??num(cost?.directCost);
      if(explicitCogs!==null)cogs+=explicitCogs;
      else if(unitCost!==null)cogs+=qty*unitCost;
      else missingCost+=1;
    });
    const cash=snapshot.cashFlow.find(row=>String(row.month||'')===month)||null;
    return {rows,units,sales,cogs,contribution:sales-cogs,missingSales,missingCost,cash};
  }

  function orderMonth(order){return String(order.month||order.createdAt||order.date||'').slice(0,7);}
  function movementMonth(move){return String(move.date||move.createdAt||'').slice(0,7);}
  function actualState(month){
    const orders=read(ORDER_KEY,[]).filter(order=>APPROVED.has(String(order.status))&&orderMonth(order)===month);
    const sales=orders.reduce((sum,order)=>sum+(num(order.total)??0),0);
    let cogs=0,missingCostUnits=0;
    orders.flatMap(order=>order.items||[]).forEach(item=>{
      const qty=num(item.quantity)??0;
      const snapshot=num(item.unit_cost_snapshot)??num(item.unitCostSnapshot)??num(item.unitCost);
      if(snapshot===null)missingCostUnits+=qty;
      else cogs+=snapshot*qty;
    });
    const movements=read(MOVEMENT_KEY,[]).filter(move=>movementMonth(move)===month);
    const movementTotal=type=>movements.filter(move=>move.type===type).reduce((sum,move)=>sum+(num(move.amount)??0),0);
    return {
      orders,sales,cogs,contribution:sales-cogs,missingCostUnits,
      purchases:movementTotal('inventory_purchase'),capex:movementTotal('capex'),
      operatingExpense:movementTotal('operating_expense')
    };
  }

  const delta=(actual,plan)=>plan===null||actual===null?null:actual-plan;
  const deltaText=value=>value===null?'Sin comparación':`${value>=0?'+':''}${money(value)}`;
  function comparisonRow(label,plan,actual,detail=''){
    const diff=delta(actual,plan);
    return `<tr><td><strong>${esc(label)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</td><td>${money(plan)}</td><td>${money(actual)}</td><td class="${diff===null?'':diff>=0?'positive':'negative'}">${esc(deltaText(diff))}</td></tr>`;
  }

  function sourcePanel(snapshot,quality){
    const meta=snapshot.meta||{};
    const status=String(meta.status||'PENDIENTE').toUpperCase();
    return `<section class="v30-panel v30-mfo-source"><div class="v30-panel-head"><div><h2>Fuente MFO local</h2><p>El archivo se lee en este navegador. GitHub recibe el código, no tus cifras financieras.</p></div><span class="v30-data-status" data-status="${esc(status)}">${esc(status)}</span></div><div class="v30-source-grid"><div><small>Modelo</small><strong>${esc(meta.modelName||'Snapshot local')}</strong><span>${esc(meta.modelDate||'Fecha no declarada')}</span></div><div><small>Filas trazables</small><strong>${integer(quality.rows)}</strong><span>${integer(quality.statusMissing)} sin estado · ${integer(quality.sourceMissing)} sin fuente · ${integer(quality.confidenceMissing)} sin confianza</span></div></div><div class="v30-import-row"><label class="btn btn-dark">Cargar snapshot JSON<input id="v30-mfo-file" type="file" accept="application/json,.json" hidden></label><button type="button" class="btn btn-outline" id="v30-mfo-clear">Quitar datos locales</button><span id="v30-mfo-message" role="status" aria-live="polite"></span></div></section>`;
  }

  function emptyPanel(){
    return `<section class="v30-panel v30-mfo-empty"><div><p class="eyebrow">MFO local · sin datos</p><h2>No hay un modelo financiero cargado en este navegador.</h2><p>La estructura V3.0 ya está preparada, pero no incorpora cifras reales al repositorio público. Convierte el MFO a un snapshot JSON con el esquema documentado y cárgalo aquí. Los datos quedan únicamente en este navegador.</p></div><div class="v30-import-row"><label class="btn btn-dark">Cargar snapshot JSON<input id="v30-mfo-file" type="file" accept="application/json,.json" hidden></label><span id="v30-mfo-message" role="status" aria-live="polite"></span></div></section>`;
  }

  function analysisPanel(snapshot,month){
    const plan=planState(snapshot,month);
    const actual=actualState(month);
    const planPurchases=num(plan.cash?.purchases);
    const planCapex=num(plan.cash?.capex);
    const endingCash=num(plan.cash?.endingCash);
    const knownActualCogs=actual.missingCostUnits===0?actual.cogs:null;
    const knownActualContribution=actual.missingCostUnits===0?actual.contribution:null;
    return `<section class="v30-panel" style="margin-top:16px"><div class="v30-panel-head"><div><h2>Plan vs. real</h2><p>El plan viene del snapshot. El real solo lee hechos locales; no escribe sobre el plan.</p></div><label class="v30-month-label">Mes<input id="v30-mfo-month" type="month" value="${esc(month)}"></label></div><div class="v30-metrics">${metric('Ventas plan',money(plan.sales),`${plan.rows.length} línea(s) del plan`)}${metric('Ventas reales',money(actual.sales),`${actual.orders.length} pedido(s) aprobado(s)`)}${metric('COGS real conocido',knownActualCogs===null?'Incompleto':money(knownActualCogs),actual.missingCostUnits?`${integer(actual.missingCostUnits)} unidad(es) sin snapshot de costo`:'Solo snapshots del pedido')}${metric('Caja final plan',endingCash===null?'—':money(endingCash),'No se presenta como caja real conciliada')}</div><div class="v30-table-wrap"><table class="v30-table"><thead><tr><th>Magnitud</th><th>Plan</th><th>Real registrado</th><th>Delta</th></tr></thead><tbody>${comparisonRow('Ventas',plan.sales,actual.sales,plan.missingSales?'Plan incompleto: faltan precios o ventas':'' )}${comparisonRow('Costo de ventas',plan.missingCost?null:plan.cogs,knownActualCogs,actual.missingCostUnits?'Real incompleto por costos sin snapshot':'')}${comparisonRow('Margen de contribución',plan.missingCost?null:plan.contribution,knownActualContribution,'Antes de gastos operativos')}${comparisonRow('Compras de inventario',planPurchases,actual.purchases,'Compra y COGS son magnitudes distintas')}${comparisonRow('CAPEX',planCapex,actual.capex,'Movimientos registrados localmente')}</tbody></table></div><div class="v30-note" data-tone="${actual.missingCostUnits||plan.missingCost?'warn':''}"><strong>Lectura de calidad</strong>${actual.missingCostUnits?'El COGS real queda incompleto porque existen unidades vendidas sin snapshot de costo. ':''}${plan.missingCost?'El plan tiene líneas sin costo directo trazable. ':''}La caja real no se infiere: debe venir de conciliación o de una futura capa de hechos de caja.</div></section>`;
  }

  function metric(label,value,detail){return `<article class="v30-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`;}

  function structurePanel(snapshot){
    return `<section class="v30-panel" style="margin-top:16px"><div class="v30-panel-head"><div><h2>Contenido del snapshot</h2><p>La importación conserva el MFO como escenario y nunca modifica pedidos, inventario o producción.</p></div></div><div class="v30-mfo-map"><article><small>01</small><strong>${integer(snapshot.planSales.length)} líneas de plan</strong><span>SKU × mes</span></article><article><small>02</small><strong>${integer(snapshot.productCosts.length)} costos</strong><span>Precio, costo, vigencia y evidencia</span></article><article><small>03</small><strong>${integer(snapshot.cashFlow.length)} meses de flujo</strong><span>Compras, caja y CAPEX</span></article><article><small>04</small><strong>${integer(snapshot.scenarios.length)} escenarios</strong><span>${integer(snapshot.assumptions.length)} supuesto(s) explícitos</span></article></div></section>`;
  }

  function render(){
    const root=document.getElementById(ROOT_ID);if(!root)return;
    const stored=read(STORAGE_KEY,null);
    if(!stored){
      root.innerHTML=emptyPanel();
      bind(root);
      document.documentElement.dataset.mfoVersion=VERSION;
      document.documentElement.dataset.mfoState='empty';
      return;
    }
    const checked=validate(stored);
    if(checked.errors.length){
      root.innerHTML=`${emptyPanel()}<div class="v30-note" data-tone="warn"><strong>Snapshot rechazado</strong>${esc(checked.errors.join(' '))}</div>`;
      bind(root);
      document.documentElement.dataset.mfoVersion=VERSION;
      document.documentElement.dataset.mfoState='invalid';
      return;
    }
    const snapshot=checked.data;
    const month=sessionStorage.getItem(MONTH_KEY)||currentMonth();
    root.innerHTML=sourcePanel(snapshot,rowQuality(snapshot))+analysisPanel(snapshot,month)+structurePanel(snapshot);
    bind(root);
    document.documentElement.dataset.mfoVersion=VERSION;
    document.documentElement.dataset.mfoState='loaded';
  }

  function bind(root){
    root.querySelector('#v30-mfo-file')?.addEventListener('change',async event=>{
      const file=event.target.files?.[0];if(!file)return;
      const message=root.querySelector('#v30-mfo-message');
      try{
        const parsed=JSON.parse(await file.text());
        const checked=validate(parsed);
        if(checked.errors.length)throw new Error(checked.errors.join(' '));
        localStorage.setItem(STORAGE_KEY,JSON.stringify(checked.data));
        render();
      }catch(error){if(message)message.textContent=`No se pudo cargar: ${error.message}`;}
    });
    root.querySelector('#v30-mfo-clear')?.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);render();});
    root.querySelector('#v30-mfo-month')?.addEventListener('change',event=>{sessionStorage.setItem(MONTH_KEY,event.target.value||currentMonth());render();});
  }

  window.EL_ERRANTE_MFO_V30={version:VERSION,storageKey:STORAGE_KEY,blankSnapshot,validate};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();