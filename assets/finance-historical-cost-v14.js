(()=>{
  'use strict';
  const VERSION='1.4.0';
  const ROOT_ID='finance-workbench-v31';
  const PANEL_ID='finance-historical-cost-v14';
  const ACTIVE=new Set(['approved','preparing','dispatched','delivered']);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const n=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:0;};
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n(value));
  const percent=value=>new Intl.NumberFormat('es-CO',{style:'percent',maximumFractionDigits:0}).format(n(value));
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const api=()=>window.EL_ERRANTE_HISTORICAL_COST_V14||null;
  const orders=()=>{const rows=read('ee_v14_orders',[]);return Array.isArray(rows)?rows:[];};
  const date=value=>{try{return new Date(value).toLocaleDateString('es-CO',{timeZone:'America/Bogota'});}catch(_){return '—';}};
  function sourceLabel(snapshot){
    if(!snapshot)return 'Sin costo histórico';
    if(snapshot.type==='LEGACY_ORDER_COST')return snapshot.complete?'Costo legado registrado':'Legado incompleto';
    const origins=[...new Set((snapshot.lines||[]).map(line=>line.costOrigin).filter(Boolean))];
    if(origins.includes('MATERIALIZED_STANDARD'))return 'Estándar materializado';
    if(origins.length===1&&origins[0]==='CANONICAL_BASELINE')return 'Baseline capturado';
    return snapshot.complete?'Snapshot V1.4':'Snapshot incompleto';
  }
  function render(){
    const root=document.getElementById(ROOT_ID);const cost=api();if(!root||!cost)return;
    const existing=document.getElementById(PANEL_ID);if(existing)existing.remove();
    const relevant=orders().filter(order=>ACTIVE.has(String(order.status||''))).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
    const rows=relevant.map(order=>({order,margin:cost.historicalMargin(order)}));
    const complete=rows.filter(row=>row.margin?.complete);
    const revenue=rows.reduce((sum,row)=>sum+n(row.margin?.revenue),0);
    const knownCogs=complete.reduce((sum,row)=>sum+n(row.margin?.knownCogs),0);
    const knownRevenue=complete.reduce((sum,row)=>sum+n(row.margin?.revenue),0);
    const contribution=knownRevenue-knownCogs;
    const coverage=rows.length?complete.length/rows.length:0;
    const panel=document.createElement('section');panel.id=PANEL_ID;panel.className='v14-history-panel';panel.dataset.version=VERSION;
    panel.innerHTML=`<div class="v14-history-head"><div><p class="eyebrow">Costo histórico · V1.4</p><h3>Margen reconstruible sin reescribir el pasado.</h3><p>Los pedidos nuevos congelan el estándar cuando entran al flujo económico. Los pedidos anteriores sólo usan el costo que ya tenían registrado; nunca se completan con el estándar vigente de hoy.</p></div><span class="v14-history-chip">${complete.length}/${rows.length} con costo completo</span></div><div class="v14-history-metrics"><article><small>Ventas con estado económico</small><strong>${money(revenue)}</strong><span>${rows.length} pedido(s)</span></article><article><small>COGS histórico conocido</small><strong>${money(knownCogs)}</strong><span>Sólo pedidos completos</span></article><article><small>Contribución conocida</small><strong>${money(contribution)}</strong><span>${knownRevenue>0?percent(contribution/knownRevenue):'—'} sobre ventas cubiertas</span></article><article><small>Cobertura de costo</small><strong>${rows.length?percent(coverage):'—'}</strong><span>${rows.length-complete.length} incompleto(s)</span></article></div>${rows.length?`<div class="v14-history-table-wrap"><table class="v14-history-table"><thead><tr><th>Pedido</th><th>Venta</th><th>COGS histórico</th><th>Contribución</th><th>Origen</th></tr></thead><tbody>${rows.slice(0,12).map(({order,margin})=>`<tr><td><strong>${esc(order.id)}</strong><small>${esc(date(order.createdAt))} · ${esc(order.status)}</small></td><td>${money(margin?.revenue)}</td><td>${margin?.complete?money(margin.knownCogs):'<span class="v14-history-missing">Incompleto</span>'}</td><td>${margin?.complete?money(margin.contribution):'—'}</td><td><strong>${esc(sourceLabel(margin?.snapshot))}</strong>${margin?.snapshot?.capturedAt?`<small>${esc(date(margin.snapshot.capturedAt))}</small>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<div class="v14-history-empty">Aún no hay pedidos en estados económicos para reconstruir margen histórico.</div>'}`;
    root.append(panel);document.documentElement.dataset.historicalCostView=VERSION;
  }
  const schedule=()=>setTimeout(render,40);
  window.addEventListener('ee:v14:historical-cost-snapshot',schedule);
  window.addEventListener('ee:order:status-changed',schedule);
  window.addEventListener('ee:v13:standard-changed',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.EL_ERRANTE_FINANCE_HISTORICAL_COST_V14=Object.freeze({version:VERSION,render,sourceLabel});
})();
