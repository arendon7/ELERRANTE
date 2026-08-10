(()=>{
  'use strict';

  const VERSION='1.4.0';
  const EVENT_KEY='ee_v14_cost_snapshot_events';
  const STATE_KEY='ee_v14_cost_snapshot_state';
  const KEYS={
    orders:'ee_v14_orders',
    purchases:'ee_v24_material_purchases',
    movements:'ee_v16_inventory_movements'
  };
  const ECONOMIC_ORDER_STATUSES=new Set(['approved','preparing','dispatched','delivered']);
  const DATA=window.EL_ERRANTE_MATERIALS_V23||{materials:[],products:[]};
  const bridge=()=>window.EL_ERRANTE_MASTER_COST_BRIDGE_V13||null;
  const n=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:0;};
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const now=()=>new Date().toISOString();
  const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const sessionUser=()=>{try{const row=JSON.parse(sessionStorage.getItem('ee_v31_session'));return row?.displayName||row?.username||'Usuario local';}catch(_){return 'Usuario local';}};

  function events(){const rows=read(EVENT_KEY,[]);return Array.isArray(rows)?rows.filter(Boolean):[];}
  function append(event){const rows=events();rows.push(Object.freeze({...event}));write(EVENT_KEY,rows);return event;}
  function state(){const value=read(STATE_KEY,null);return value&&typeof value==='object'?value:null;}
  function saveState(value){write(STATE_KEY,value);return value;}
  function orders(){const rows=read(KEYS.orders,[]);return Array.isArray(rows)?rows:[];}
  function purchases(){const rows=read(KEYS.purchases,[]);return Array.isArray(rows)?rows:[];}
  function movements(){const rows=read(KEYS.movements,[]);return Array.isArray(rows)?rows:[];}

  function findProduct(item){
    const ids=[item?.productId,item?.product_id,item?.variantId,item?.variant_id,item?.id].filter(Boolean).map(String);
    const name=norm(item?.name||item?.product_name);
    return (DATA.products||[]).find(product=>
      String(product.sku||'')===String(item?.sku||'')
      ||(product.ids||[]).some(id=>ids.includes(String(id)))
      ||(product.names||[]).some(candidate=>norm(candidate)===name)
      ||norm(product.name)===name
    )||null;
  }

  function productSnapshot(item){
    const product=findProduct(item);
    const quantity=Math.max(0,n(item?.quantity??item?.qty??1));
    const unitPrice=n(item?.unitPrice??item?.unit_price??item?.price);
    if(!product||!bridge()?.productCost){
      return {productId:String(item?.productId||item?.product_id||item?.id||''),sku:product?.sku||null,name:String(item?.name||item?.product_name||product?.name||'Producto'),quantity,unitPrice,unitCostSnapshot:null,costOrigin:'UNKNOWN',standardRevision:null,complete:false,standardLines:[]};
    }
    const resolved=bridge().productCost(product);
    const standardLines=(resolved.lines||[]).map(line=>({kind:line.kind,id:line.id,name:line.name,unit:line.unit,qty:n(line.qty),unitCost:n(line.unitCost),cost:n(line.cost),costOrigin:line.costOrigin||'CANONICAL_BASELINE',standardRevision:line.standardRevision??null,standardSource:line.standardSource||null,status:line.status||null}));
    const revisions=standardLines.filter(line=>Number.isFinite(Number(line.standardRevision))).map(line=>Number(line.standardRevision));
    const maxRevision=revisions.length?Math.max(...revisions):0;
    const origin=resolved.hasSimulation?'UNKNOWN':resolved.hasMaterialized?'MATERIALIZED_STANDARD':'CANONICAL_BASELINE';
    const cost=n(resolved.total);
    return {productId:String(item?.productId||item?.product_id||item?.id||product.sku),sku:product.sku,name:String(item?.name||item?.product_name||product.name),quantity,unitPrice,unitCostSnapshot:cost>0?cost:null,costOrigin:cost>0?origin:'UNKNOWN',standardRevision:cost>0?maxRevision:null,complete:cost>0&&!resolved.hasSimulation,standardLines};
  }

  function orderSnapshotEvent(orderId){return events().find(event=>event.type==='ORDER_COST_SNAPSHOT'&&event.factId===String(orderId))||null;}
  function purchaseSnapshotEvent(purchaseId){return events().find(event=>event.type==='PURCHASE_STANDARD_SNAPSHOT'&&event.factId===String(purchaseId))||null;}
  function movementSnapshotEvent(movementId){return events().find(event=>event.type==='MOVEMENT_COST_SNAPSHOT'&&event.factId===String(movementId))||null;}

  function captureOrder(orderId,context={}){
    const id=String(orderId||'');if(!id)return null;
    const existing=orderSnapshotEvent(id);if(existing)return existing;
    const order=orders().find(row=>String(row.id)===id);if(!order)return null;
    const status=String(context.status||order.status||'');if(!ECONOMIC_ORDER_STATUSES.has(status))return null;
    const lines=(order.items||[]).map(productSnapshot);
    const complete=lines.length>0&&lines.every(line=>line.complete&&Number.isFinite(Number(line.unitCostSnapshot)));
    const knownCogs=lines.reduce((sum,line)=>sum+n(line.unitCostSnapshot)*n(line.quantity),0);
    const event={eventId:uid('HIST-ORD'),type:'ORDER_COST_SNAPSHOT',version:VERSION,factType:'ORDER',factId:id,statusAtCapture:status,capturedAt:now(),capturedBy:sessionUser(),trigger:context.source||'order-status',standardSignature:bridge()?.signature?.()||'',complete,knownCogs,lines};
    append(event);
    window.dispatchEvent(new CustomEvent('ee:v14:historical-cost-snapshot',{detail:{event:clone(event)}}));
    return event;
  }

  function capturePurchase(purchase,context={}){
    if(!purchase?.id)return null;const id=String(purchase.id);const existing=purchaseSnapshotEvent(id);if(existing)return existing;
    const materialId=String(purchase.materialId||purchase.material_id||'');
    const standard=materialId?bridge()?.standardMaterial?.(materialId):null;
    const observedUnitCost=n(purchase.unitCost??purchase.unit_cost)||(n(purchase.quantity)>0?n(purchase.totalCost??purchase.total_cost)/n(purchase.quantity):0);
    const event={eventId:uid('HIST-PUR'),type:'PURCHASE_STANDARD_SNAPSHOT',version:VERSION,factType:'PURCHASE_RECEIPT',factId:id,materialId,materialName:standard?.name||purchase.materialName||materialId,capturedAt:now(),capturedBy:sessionUser(),trigger:context.source||'purchase-receipt',receivedDate:String(purchase.receivedDate||purchase.received_date||''),supplier:String(purchase.supplier||purchase.supplier_name_snapshot||''),observedUnitCost:observedUnitCost>0?observedUnitCost:null,standardUnitCost:Number.isFinite(Number(standard?.standardCost))?n(standard.standardCost):null,baselineUnitCost:Number.isFinite(Number(standard?.baselineCost))?n(standard.baselineCost):null,standardRevision:standard?.standardRevision??null,standardSource:standard?.standardSource||null,costOrigin:standard?.costOrigin||'UNKNOWN',standardSignature:bridge()?.signature?.()||'',complete:Boolean(standard&&Number.isFinite(Number(standard.standardCost)))};
    append(event);window.dispatchEvent(new CustomEvent('ee:v14:historical-cost-snapshot',{detail:{event:clone(event)}}));return event;
  }

  function captureMovement(movement,context={}){
    if(!movement?.id)return null;const id=String(movement.id);const existing=movementSnapshotEvent(id);if(existing)return existing;
    const embedded=n(movement.unitCost??movement.unit_cost);
    const event={eventId:uid('HIST-MOV'),type:'MOVEMENT_COST_SNAPSHOT',version:VERSION,factType:'INVENTORY_MOVEMENT',factId:id,capturedAt:now(),capturedBy:sessionUser(),trigger:context.source||'inventory-movement',movementType:String(movement.type||movement.movement_type||''),productId:String(movement.productId||movement.product_id||''),quantity:n(movement.delta??movement.quantity_delta),unitCostSnapshot:embedded>0?embedded:null,costOrigin:embedded>0?'OBSERVED_AT_MOVEMENT':'UNKNOWN',complete:embedded>0};
    append(event);window.dispatchEvent(new CustomEvent('ee:v14:historical-cost-snapshot',{detail:{event:clone(event)}}));return event;
  }

  function legacyOrderSnapshot(order){
    const lines=(order?.items||[]).map(item=>{const cost=n(item.unitCost??item.unit_cost_snapshot);return {productId:String(item.productId||item.product_id||item.id||''),sku:null,name:String(item.name||item.product_name||'Producto'),quantity:n(item.quantity),unitPrice:n(item.unitPrice??item.unit_price),unitCostSnapshot:cost>0?cost:null,costOrigin:cost>0?'LEGACY_EMBEDDED':'UNKNOWN',standardRevision:null,complete:cost>0,standardLines:[]};});
    const complete=lines.length>0&&lines.every(line=>line.complete);const knownCogs=lines.reduce((sum,line)=>sum+n(line.unitCostSnapshot)*n(line.quantity),0);
    return {eventId:null,type:'LEGACY_ORDER_COST',version:'legacy',factType:'ORDER',factId:String(order?.id||''),statusAtCapture:String(order?.status||''),capturedAt:null,capturedBy:null,trigger:'embedded-order-line',standardSignature:null,complete,knownCogs,lines,legacy:true};
  }

  function historicalOrder(orderOrId){
    const order=typeof orderOrId==='object'&&orderOrId?orderOrId:orders().find(row=>String(row.id)===String(orderOrId));if(!order)return null;
    return orderSnapshotEvent(order.id)||legacyOrderSnapshot(order);
  }

  function historicalMargin(orderOrId){
    const order=typeof orderOrId==='object'&&orderOrId?orderOrId:orders().find(row=>String(row.id)===String(orderOrId));if(!order)return null;
    const snapshot=historicalOrder(order);const lineRevenue=(order.items||[]).reduce((sum,item)=>sum+n(item.quantity)*n(item.unitPrice??item.unit_price),0);const revenue=n(order.subtotal)>0?n(order.subtotal):lineRevenue;
    const knownCogs=n(snapshot?.knownCogs);const complete=Boolean(snapshot?.complete);return {orderId:String(order.id),status:String(order.status||''),revenue,knownCogs,contribution:complete?revenue-knownCogs:null,marginRate:complete&&revenue>0?(revenue-knownCogs)/revenue:null,complete,source:snapshot?.type||'UNKNOWN',snapshot};
  }

  function initializeState(){
    const existing=state();if(existing)return existing;
    return saveState({version:VERSION,initializedAt:now(),knownPurchaseIds:purchases().map(row=>String(row.id)).filter(Boolean),knownMovementIds:movements().map(row=>String(row.id)).filter(Boolean),knownOrderStatuses:Object.fromEntries(orders().filter(row=>row?.id).map(row=>[String(row.id),String(row.status||'')]))});
  }

  function scanNewFacts(source='scan'){
    const current=initializeState();const knownPurchases=new Set(current.knownPurchaseIds||[]);const knownMovements=new Set(current.knownMovementIds||[]);const statuses={...(current.knownOrderStatuses||{})};let captured=0;
    purchases().forEach(row=>{const id=String(row?.id||'');if(!id)return;if(!knownPurchases.has(id)){if(capturePurchase(row,{source}))captured+=1;knownPurchases.add(id);}});
    movements().forEach(row=>{const id=String(row?.id||'');if(!id)return;if(!knownMovements.has(id)){if(captureMovement(row,{source}))captured+=1;knownMovements.add(id);}});
    orders().forEach(row=>{const id=String(row?.id||'');if(!id)return;const previous=statuses[id];const currentStatus=String(row.status||'');if(previous!==undefined&&previous!==currentStatus&&ECONOMIC_ORDER_STATUSES.has(currentStatus)&&!orderSnapshotEvent(id)){if(captureOrder(id,{status:currentStatus,source}))captured+=1;}statuses[id]=currentStatus;});
    saveState({version:VERSION,initializedAt:current.initializedAt||now(),lastScanAt:now(),knownPurchaseIds:[...knownPurchases],knownMovementIds:[...knownMovements],knownOrderStatuses:statuses});
    return captured;
  }

  function summary(orderRows=orders()){
    const relevant=orderRows.filter(order=>ECONOMIC_ORDER_STATUSES.has(String(order.status||'')));const margins=relevant.map(historicalMargin).filter(Boolean);const complete=margins.filter(row=>row.complete);return {orders:relevant.length,complete:complete.length,incomplete:margins.length-complete.length,revenue:margins.reduce((sum,row)=>sum+n(row.revenue),0),knownCogs:complete.reduce((sum,row)=>sum+n(row.knownCogs),0),knownContribution:complete.reduce((sum,row)=>sum+n(row.contribution),0)};
  }

  window.addEventListener('ee:order:status-changed',event=>{const detail=event.detail||{};captureOrder(detail.orderId,{status:detail.status,source:detail.source||'order-status-event'});scanNewFacts('order-status-event');});
  window.addEventListener('ee:v24:reload',()=>setTimeout(()=>scanNewFacts('purchase-reload'),0));
  window.addEventListener('ee:v16:reload',()=>setTimeout(()=>scanNewFacts('movement-reload'),0));
  document.addEventListener('submit',event=>{if(event.target?.id==='ee-v16-movement-form')setTimeout(()=>scanNewFacts('movement-form'),80);});

  initializeState();
  document.documentElement.dataset.historicalCostSnapshots=VERSION;
  window.EL_ERRANTE_HISTORICAL_COST_V14=Object.freeze({version:VERSION,eventKey:EVENT_KEY,stateKey:STATE_KEY,events,findProduct,productSnapshot,captureOrder,capturePurchase,captureMovement,historicalOrder,historicalMargin,summary,scanNewFacts});
})();
