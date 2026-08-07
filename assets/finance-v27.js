(()=>{
  "use strict";

  const VERSION="2.7.0";
  const BASE=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const KEYS={orders:"ee_v14_orders",products:"ee_v14_products",fixed:"ee_v14_fixed_costs",moves:"ee_v27_finance_movements",settings:"ee_v27_finance_settings"};
  const APPROVED=new Set(["approved","preparing","dispatched","delivered"]);
  const STATUSES=["CONFIRMADO","ESTIMADO","INFERIDO","CONTRADICTORIO","PENDIENTE"];
  const TYPES={
    operating_expense:{label:"Gasto operativo adicional",direction:-1,operating:true},
    inventory_purchase:{label:"Compra de inventario",direction:-1,operating:false},
    capex:{label:"Inversión / CAPEX",direction:-1,operating:false},
    capital_contribution:{label:"Aporte de socios",direction:1,operating:false},
    owner_withdrawal:{label:"Pago o retiro de Juan",direction:-1,operating:false},
    other_income:{label:"Otro ingreso de caja",direction:1,operating:false}
  };
  const money=v=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(v)||0);
  const integer=v=>new Intl.NumberFormat("es-CO",{maximumFractionDigits:0}).format(Number(v)||0);
  const num=v=>Number(String(v??"").replace(/[^0-9.-]/g,""))||0;
  const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const today=()=>new Date().toLocaleDateString("en-CA",{timeZone:"America/Bogota"});
  const currentMonth=()=>today().slice(0,7);
  const uid=()=>`MOV-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function products(){
    const overrides=read(KEYS.products,{});
    const catalog=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    return catalog.map(product=>{
      const variant=Array.isArray(product.variants)?product.variants[0]||{}:{};
      const id=product.id||variant.id;
      const saved=overrides[id]||{};
      return {id,name:product.name||product.title||variant.name||id,price:num(saved.price??variant.price??product.price),unitCost:num(saved.unitCost??product.unitCost),inventory:num(saved.inventory??product.inventory),active:saved.active!==false};
    }).filter(item=>item.id&&item.active);
  }
  function fixedCosts(){
    const saved=read(KEYS.fixed,null);
    return Array.isArray(saved)?saved:(Array.isArray(BASE.finance?.monthlyFixedCosts)?BASE.finance.monthlyFixedCosts:[]);
  }
  function settings(){
    const saved=read(KEYS.settings,{});
    return {openingCash:num(saved.openingCash??2000000),minimumCash:num(saved.minimumCash??1000000),salesCashRate:Math.max(0,Math.min(100,num(saved.salesCashRate??100))),costStatuses:saved.costStatuses&&typeof saved.costStatuses==="object"?saved.costStatuses:{}};
  }
  function orderMonth(order){return String(order.month||order.createdAt||"").slice(0,7);}
  function moveMonth(move){return String(move.date||move.createdAt||"").slice(0,7);}
  function statusFor(product,config){return config.costStatuses[product.id]||(product.unitCost>0?"ESTIMADO":"PENDIENTE");}
  function compute(month){
    const list=products();
    const byId=new Map(list.map(item=>[item.id,item]));
    const orders=read(KEYS.orders,[]).filter(order=>orderMonth(order)===month);
    const approved=orders.filter(order=>APPROVED.has(order.status));
    const sales=approved.reduce((sum,order)=>sum+num(order.total),0);
    const cogs=approved.flatMap(order=>order.items||[]).reduce((sum,item)=>{
      const id=item.productId||item.product_id||item.id;
      const unit=num(item.unitCost??item.unit_cost_snapshot??item.unitCostSnapshot)||num(byId.get(id)?.unitCost);
      return sum+unit*num(item.quantity);
    },0);
    const fixed=fixedCosts().reduce((sum,item)=>sum+num(item.amount),0);
    const movements=read(KEYS.moves,[]).filter(move=>moveMonth(move)===month);
    const extra=movements.filter(move=>TYPES[move.type]?.operating).reduce((sum,move)=>sum+num(move.amount),0);
    const operatingExpenses=fixed+extra;
    const contribution=sales-cogs;
    const operatingResult=contribution-operatingExpenses;
    const config=settings();
    const movementCash=movements.reduce((sum,move)=>sum+(TYPES[move.type]?.direction||0)*num(move.amount),0);
    const salesCash=sales*(config.salesCashRate/100);
    const cash=config.openingCash+salesCash-fixed+movementCash;
    const purchases=movements.filter(move=>move.type==="inventory_purchase").reduce((sum,move)=>sum+num(move.amount),0);
    const capex=movements.filter(move=>move.type==="capex").reduce((sum,move)=>sum+num(move.amount),0);
    const contributionRate=sales>0?contribution/sales:0;
    const contributions=list.filter(item=>item.price>item.unitCost&&item.price>0).map(item=>item.price-item.unitCost);
    const averageContribution=contributions.length?contributions.reduce((a,b)=>a+b,0)/contributions.length:0;
    const breakEvenSales=contributionRate>0?operatingExpenses/contributionRate:0;
    const breakEvenUnits=averageContribution>0?operatingExpenses/averageContribution:0;
    return {month,list,orders,approved,movements,config,sales,cogs,fixed,extra,operatingExpenses,contribution,operatingResult,salesCash,cash,purchases,capex,contributionRate,averageContribution,breakEvenSales,breakEvenUnits,breakEvenGap:Math.max(0,breakEvenSales-sales)};
  }
  function badge(status){return `<span class="ee-v27-status" data-status="${esc(status)}">${esc(status)}</span>`;}
  function metric(label,value,detail,kind=""){return `<article class="ee-v27-metric ${kind}"><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`;}
  function alerts(state){
    const items=[];
    const missing=state.list.filter(item=>!item.unitCost);
    const negative=state.list.filter(item=>item.price>0&&item.unitCost>=item.price);
    const unconfirmed=state.list.filter(item=>statusFor(item,state.config)!=="CONFIRMADO");
    if(missing.length)items.push({level:"critical",text:`${missing.length} producto(s) no tienen costo unitario; los márgenes quedan incompletos.`});
    if(negative.length)items.push({level:"critical",text:`${negative.length} producto(s) tienen costo igual o superior al precio de venta.`});
    if(unconfirmed.length)items.push({level:"warning",text:`${unconfirmed.length} costo(s) siguen sin estado CONFIRMADO.`});
    if(state.cash<state.config.minimumCash)items.push({level:"critical",text:`La caja estimada está por debajo del mínimo de ${money(state.config.minimumCash)}.`});
    if(state.purchases>0&&state.cogs>0&&state.purchases>state.cogs*1.5)items.push({level:"warning",text:"Las compras de inventario superan ampliamente el costo consumido; revisa rotación y saldo físico."});
    if(state.sales===0)items.push({level:"info",text:"No hay ventas aprobadas en el mes seleccionado."});
    if(String(BASE.finance?.dataStatus||"").toUpperCase()!=="CONFIRMADO")items.push({level:"info",text:`Los gastos fijos base están marcados como ${BASE.finance?.dataStatus||"PENDIENTE"}.`});
    return items.length?items:[{level:"ok",text:"No se detectaron alertas automáticas con la información disponible."}];
  }
  function productRows(state){
    if(!state.list.length)return '<tr><td colspan="7" class="ee-v27-empty">No fue posible leer el catálogo.</td></tr>';
    return state.list.map(product=>{
      const margin=product.price-product.unitCost;
      const rate=product.price>0?margin/product.price:0;
      const status=statusFor(product,state.config);
      return `<tr><td><strong>${esc(product.name)}</strong><small>${esc(product.id)}</small></td><td>${money(product.price)}</td><td>${money(product.unitCost)}</td><td class="${margin>=0?"positive":"negative"}">${money(margin)}</td><td>${integer(rate*100)}%</td><td>${integer(product.inventory)}</td><td><select aria-label="Estado del costo de ${esc(product.name)}" data-v27-cost-status="${esc(product.id)}">${STATUSES.map(option=>`<option ${option===status?"selected":""}>${option}</option>`).join("")}</select></td></tr>`;
    }).join("");
  }
  function movementRows(state){
    if(!state.movements.length)return '<tr><td colspan="6" class="ee-v27-empty">Todavía no hay movimientos manuales para este mes.</td></tr>';
    return [...state.movements].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(move=>{
      const meta=TYPES[move.type]||{label:move.type,direction:-1};
      const signed=meta.direction*num(move.amount);
      return `<tr><td>${esc(move.date)}</td><td>${esc(meta.label)}</td><td>${esc(move.description||"Sin descripción")}</td><td>${badge(move.evidence||"PENDIENTE")}</td><td class="${signed>=0?"positive":"negative"}">${signed>=0?"+":"−"}${money(Math.abs(signed))}</td><td><button type="button" class="ee-v27-link danger" data-v27-delete="${esc(move.id)}">Eliminar</button></td></tr>`;
    }).join("");
  }
  function render(container,month){
    const state=compute(month);
    const alertItems=alerts(state);
    container.innerHTML=`<section class="ee-v27-shell" aria-labelledby="ee-v27-title">
      <header class="ee-v27-header"><div><p class="eyebrow">Finanzas operativas · V2.7</p><h2 id="ee-v27-title">Control financiero sin convertir la web en contabilidad.</h2><p>Resume ventas, costo de ventas, gastos, caja y punto de equilibrio. Compras e inversiones afectan caja, pero no se confunden con costo de ventas.</p></div><div class="ee-v27-toolbar"><label for="ee-v27-month">Mes analizado</label><input id="ee-v27-month" type="month" value="${esc(month)}"><button type="button" class="ee-v27-btn secondary" id="ee-v27-refresh">Actualizar</button></div></header>
      <div class="ee-v27-note"><strong>Modo local controlado.</strong> Supabase permanece inactivo. Las cifras se guardan en este navegador y deben distinguirse entre confirmadas, estimadas y pendientes.</div>
      <div class="ee-v27-metrics">${metric("Ventas aprobadas",money(state.sales),`${state.approved.length} pedido(s)`)}${metric("Costo de ventas",money(state.cogs),"Consumo asociado a lo vendido")}${metric("Margen de contribución",money(state.contribution),`${integer(state.contributionRate*100)}% de ventas`,state.contribution>=0?"positive":"negative")}${metric("Gastos operativos",money(state.operatingExpenses),`${money(state.fixed)} fijos + ${money(state.extra)} adicionales`)}${metric("Resultado operativo",money(state.operatingResult),"Antes de impuestos y remuneraciones no registradas",state.operatingResult>=0?"positive":"negative")}${metric("Caja estimada",money(state.cash),`Mínimo: ${money(state.config.minimumCash)}`,state.cash>=state.config.minimumCash?"positive":"negative")}</div>
      <details class="ee-v27-detail"><summary>Productos y márgenes <span>${state.list.length} producto(s)</span></summary><div class="ee-v27-detail-body"><p class="ee-v27-help">Los costos siguen siendo valores operativos editables. No se recalculan recetas, BOM ni costos estándar automáticamente.</p><div class="ee-v27-table-wrap"><table class="ee-v27-table"><thead><tr><th>Producto</th><th>Precio</th><th>Costo</th><th>Margen $</th><th>Margen %</th><th>Inventario</th><th>Calidad del costo</th></tr></thead><tbody>${productRows(state)}</tbody></table></div></div></details>
      <details class="ee-v27-detail"><summary>Gastos y caja <span>${state.movements.length} movimiento(s)</span></summary><div class="ee-v27-detail-body">
        <div class="ee-v27-settings"><label>Saldo inicial del mes<input id="ee-v27-opening-cash" type="number" min="0" step="10000" value="${state.config.openingCash}"></label><label>Caja mínima<input id="ee-v27-minimum-cash" type="number" min="0" step="10000" value="${state.config.minimumCash}"></label><label>Ventas asumidas como cobradas<div class="ee-v27-inline-input"><input id="ee-v27-sales-cash-rate" type="number" min="0" max="100" step="1" value="${state.config.salesCashRate}"><span>%</span></div></label><button type="button" class="ee-v27-btn secondary" id="ee-v27-save-settings">Guardar parámetros</button></div>
        <form id="ee-v27-movement-form" class="ee-v27-form"><label>Fecha<input name="date" type="date" value="${month===currentMonth()?today():`${month}-01`}" required></label><label>Tipo<select name="type" required>${Object.entries(TYPES).map(([value,meta])=>`<option value="${value}">${esc(meta.label)}</option>`).join("")}</select></label><label>Valor<input name="amount" type="number" min="1" step="1" required></label><label>Calidad del dato<select name="evidence">${STATUSES.map(option=>`<option ${option==="CONFIRMADO"?"selected":""}>${option}</option>`).join("")}</select></label><label class="wide">Descripción o referencia<input name="description" maxlength="160" placeholder="Ej. factura, compra de queso, aporte de caja"></label><button type="submit" class="ee-v27-btn">Registrar movimiento</button></form>
        <div id="ee-v27-message" class="ee-v27-message" aria-live="polite"></div><div class="ee-v27-table-wrap"><table class="ee-v27-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Calidad</th><th>Impacto en caja</th><th></th></tr></thead><tbody>${movementRows(state)}</tbody></table></div><div class="ee-v27-submetrics"><span>Compras de inventario <strong>${money(state.purchases)}</strong></span><span>CAPEX <strong>${money(state.capex)}</strong></span><span>Ventas consideradas cobradas <strong>${money(state.salesCash)}</strong></span></div>
      </div></details>
      <details class="ee-v27-detail"><summary>Punto de equilibrio <span>${state.breakEvenGap>0?"Meta pendiente":"Meta cubierta"}</span></summary><div class="ee-v27-detail-body"><div class="ee-v27-break-even"><div><small>Ventas de equilibrio</small><strong>${state.breakEvenSales?money(state.breakEvenSales):"No calculable"}</strong></div><div><small>Unidades de referencia</small><strong>${state.breakEvenUnits?integer(Math.ceil(state.breakEvenUnits)):"No calculable"}</strong></div><div><small>Ventas faltantes</small><strong>${money(state.breakEvenGap)}</strong></div><div><small>Contribución promedio</small><strong>${state.averageContribution?money(state.averageContribution):"No calculable"}</strong></div></div><p class="ee-v27-help">Las unidades usan el margen promedio simple del catálogo; no sustituyen una mezcla real de ventas.</p></div></details>
      <details class="ee-v27-detail"><summary>Alertas y calidad del dato <span>${alertItems.length} señal(es)</span></summary><div class="ee-v27-detail-body"><ul class="ee-v27-alerts">${alertItems.map(item=>`<li data-level="${item.level}">${esc(item.text)}</li>`).join("")}</ul><div class="ee-v27-actions"><button type="button" class="ee-v27-btn secondary" id="ee-v27-export">Exportar movimientos CSV</button></div></div></details>
    </section>`;
    document.documentElement.dataset.financeVersion=VERSION;
    bind(container,state);
  }
  function msg(container,text,type="ok"){const target=container.querySelector("#ee-v27-message");if(target){target.textContent=text;target.dataset.type=type;}}
  function bind(container,state){
    container.querySelector("#ee-v27-month")?.addEventListener("change",event=>render(container,event.target.value||currentMonth()));
    container.querySelector("#ee-v27-refresh")?.addEventListener("click",()=>render(container,state.month));
    container.querySelector("#ee-v27-save-settings")?.addEventListener("click",()=>{const next={...state.config,openingCash:num(container.querySelector("#ee-v27-opening-cash")?.value),minimumCash:num(container.querySelector("#ee-v27-minimum-cash")?.value),salesCashRate:Math.max(0,Math.min(100,num(container.querySelector("#ee-v27-sales-cash-rate")?.value)))};write(KEYS.settings,next);render(container,state.month);});
    container.querySelector("#ee-v27-movement-form")?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget);const date=String(data.get("date")||"");const type=String(data.get("type")||"");const amount=num(data.get("amount"));if(!date||!TYPES[type]||amount<=0){msg(container,"Completa fecha, tipo y un valor mayor que cero.","error");return;}const all=read(KEYS.moves,[]);all.push({id:uid(),date,type,amount,evidence:String(data.get("evidence")||"PENDIENTE"),description:String(data.get("description")||"").trim(),createdAt:new Date().toISOString()});write(KEYS.moves,all);render(container,state.month);msg(container,"Movimiento registrado. Caja y resultados fueron recalculados.");});
    container.querySelectorAll("[data-v27-delete]").forEach(button=>button.addEventListener("click",()=>{if(!confirm("¿Eliminar este movimiento financiero local?"))return;write(KEYS.moves,read(KEYS.moves,[]).filter(item=>item.id!==button.dataset.v27Delete));render(container,state.month);msg(container,"Movimiento eliminado.");}));
    container.querySelectorAll("[data-v27-cost-status]").forEach(select=>select.addEventListener("change",()=>{const next=settings();next.costStatuses={...next.costStatuses,[select.dataset.v27CostStatus]:select.value};write(KEYS.settings,next);render(container,state.month);}));
    container.querySelector("#ee-v27-export")?.addEventListener("click",()=>{const headers=["fecha","tipo","descripcion","calidad","valor","direccion"];const rows=state.movements.map(move=>{const meta=TYPES[move.type]||{label:move.type,direction:-1};return [move.date,meta.label,move.description||"",move.evidence||"PENDIENTE",num(move.amount),meta.direction>0?"entrada":"salida"];});const quote=value=>`"${String(value??"").replace(/"/g,'""')}"`;const csv=[headers,...rows].map(row=>row.map(quote).join(",")).join("\n");const blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`el-errante-finanzas-${state.month}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);});
  }
  function boot(){
    const container=document.querySelector("#finance-v27");
    if(!container)return;
    render(container,currentMonth());
    document.addEventListener("click",event=>{if(event.target.closest("#ee-save-products,#ee-save-costs"))setTimeout(()=>render(container,container.querySelector("#ee-v27-month")?.value||currentMonth()),250);});
    document.addEventListener("change",event=>{if(event.target.matches("[data-order-status]"))setTimeout(()=>render(container,container.querySelector("#ee-v27-month")?.value||currentMonth()),250);});
    window.addEventListener("storage",event=>{if(Object.values(KEYS).includes(event.key))render(container,container.querySelector("#ee-v27-month")?.value||currentMonth());});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();