const {test,expect}=require('@playwright/test');

const SESSION={version:'3.1.1',username:'juan',displayName:'Juan',role:'Administrador'};
const R1={eventId:'STD-V14-HFS-R1',type:'MATERIALIZED',at:'2026-08-10T05:00:00.000Z',actor:'Dirección',reason:'Revisión histórica r1',proposalId:'COST-V14-HFS-R1',materialId:'MP-HFS',materialName:'Harina Flor Suprema',unit:'g',fromRevision:0,toRevision:1,baselineCost:2.8,fromCost:2.8,toCost:3.4,approvalEventId:'APP-V14-HFS-R1',approvedAt:'2026-08-10T04:59:00.000Z',approvedBy:'Dirección',evidence:{purchaseId:'COM-V14-R1',unitCost:3.4,supplier:'Molinos Demo',date:'2026-08-10'}};
const R2={eventId:'STD-V14-HFS-R2',type:'MATERIALIZED',at:'2026-08-10T07:00:00.000Z',actor:'Dirección',reason:'Revisión posterior r2',proposalId:'COST-V14-HFS-R2',materialId:'MP-HFS',materialName:'Harina Flor Suprema',unit:'g',fromRevision:1,toRevision:2,baselineCost:2.8,fromCost:3.4,toCost:4.2,approvalEventId:'APP-V14-HFS-R2',approvedAt:'2026-08-10T06:59:00.000Z',approvedBy:'Dirección',evidence:{purchaseId:'COM-V14-R2',unitCost:4.2,supplier:'Molinos Demo',date:'2026-08-10'}};

function order({id='ORDER-V14-1',status='pending_payment',withCost=false,updatedAt='2026-08-10T04:00:00.000Z'}={}){
  return {id,status,createdAt:'2026-08-10T04:00:00.000Z',updatedAt,month:'2026-08',subtotal:20900,total:20900,customer:{name:'Cliente V1.4'},delivery:{city:'Medellín',requestedDate:'2026-08-10'},items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1,unitPrice:20900,...(withCost?{unitCost:7000}:{})}],statusTimeline:[]};
}

async function seed(page,{orders=[],events=[R1,R2],state='active',purchases=[],movements=[]}={}){
  await page.addInitScript(({session,orders,events,state,purchases,movements})=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({...session,issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    localStorage.setItem('ee_v14_orders',JSON.stringify(orders));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify(purchases));
    localStorage.setItem('ee_v16_inventory_movements',JSON.stringify(movements));
    localStorage.setItem('ee_v12_cost_materialization_events',JSON.stringify(events));
    localStorage.removeItem('ee_v14_cost_snapshot_events');
    if(state==='active')localStorage.setItem('ee_v14_cost_snapshot_state',JSON.stringify({version:'1.4.0',initializedAt:'2026-08-10T04:30:00.000Z',knownPurchaseIds:purchases.map(x=>String(x.id)),knownMovementIds:movements.map(x=>String(x.id)),knownOrderStatuses:Object.fromEntries(orders.map(x=>[String(x.id),String(x.status||'')]))}));
    else localStorage.removeItem('ee_v14_cost_snapshot_state');
  },{session:SESSION,orders,events,state,purchases,movements});
}

async function openOperation(page){
  await page.goto('/operacion.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await page.waitForFunction(()=>Boolean(window.EL_ERRANTE_HISTORICAL_COST_V14));
  await expect(page.locator('html')).toHaveAttribute('data-historical-cost-snapshots','1.4.0');
}

async function openFinance(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await page.waitForFunction(()=>Boolean(window.EL_ERRANTE_HISTORICAL_COST_V14&&window.EL_ERRANTE_FINANCE_HISTORICAL_COST_V14));
  await expect(page.locator('#finance-historical-cost-v14')).toBeVisible();
}

test.describe('Datos maestros V1.4 · snapshots históricos',()=>{
  test('un pedido aprobado a las 06:00 congela r1 aunque r2 ya exista al capturar',async({page})=>{
    const row=order();await seed(page,{orders:[row]});await openOperation(page);
    const result=await page.evaluate(()=>{
      const rows=JSON.parse(localStorage.getItem('ee_v14_orders'));
      rows[0].status='approved';rows[0].updatedAt='2026-08-10T06:00:00.000Z';rows[0].statusTimeline.push({status:'approved',createdAt:'2026-08-10T06:00:00.000Z',note:'Pago aprobado'});
      localStorage.setItem('ee_v14_orders',JSON.stringify(rows));
      window.dispatchEvent(new CustomEvent('ee:order:status-changed',{detail:{orderId:rows[0].id,status:'approved',source:'test-v14'}}));
      const api=window.EL_ERRANTE_HISTORICAL_COST_V14;const snap=api.historicalOrder(rows[0]);const current=window.EL_ERRANTE_MASTER_COST_BRIDGE_V13.standardMaterial('MP-HFS');return {snap,current,events:api.events()};
    });
    expect(result.events.filter(x=>x.type==='ORDER_COST_SNAPSHOT')).toHaveLength(1);
    expect(result.snap.effectiveAt).toBe('2026-08-10T06:00:00.000Z');
    const hfs=result.snap.lines[0].standardLines.find(x=>x.id==='MP-HFS');
    expect(hfs).toMatchObject({unitCost:3.4,standardRevision:1,costOrigin:'MATERIALIZED_STANDARD'});
    expect(result.current).toMatchObject({standardCost:4.2,standardRevision:2});
  });

  test('cambiar el estándar después no reescribe COGS ni margen histórico',async({page})=>{
    const row=order();await seed(page,{orders:[row],events:[R1]});await openOperation(page);
    const result=await page.evaluate(({r2})=>{
      const rows=JSON.parse(localStorage.getItem('ee_v14_orders'));rows[0].status='approved';rows[0].updatedAt='2026-08-10T06:00:00.000Z';rows[0].statusTimeline=[{status:'approved',createdAt:'2026-08-10T06:00:00.000Z'}];localStorage.setItem('ee_v14_orders',JSON.stringify(rows));
      const api=window.EL_ERRANTE_HISTORICAL_COST_V14;api.captureOrder(rows[0].id,{status:'approved',effectiveAt:'2026-08-10T06:00:00.000Z',source:'test'});const before=api.historicalMargin(rows[0]);
      const ledger=JSON.parse(localStorage.getItem('ee_v12_cost_materialization_events'));ledger.push(r2);localStorage.setItem('ee_v12_cost_materialization_events',JSON.stringify(ledger));window.dispatchEvent(new CustomEvent('ee:v13:standard-changed',{detail:{source:'test'}}));
      const after=api.historicalMargin(rows[0]);const current=window.EL_ERRANTE_MASTER_COST_BRIDGE_V13.standardMaterial('MP-HFS');return {before,after,current,eventText:localStorage.getItem('ee_v14_cost_snapshot_events')};
    },{r2:R2});
    expect(result.after.knownCogs).toBeCloseTo(result.before.knownCogs,6);
    expect(result.after.contribution).toBeCloseTo(result.before.contribution,6);
    expect(result.after.snapshot).toEqual(result.before.snapshot);
    expect(result.current.standardRevision).toBe(2);
  });

  test('primera activación no backfillea hechos existentes con el estándar de hoy',async({page})=>{
    const old=order({id:'LEGACY-NO-COST',status:'delivered',withCost:false,updatedAt:'2026-08-01T10:00:00.000Z'});await seed(page,{orders:[old],state:'fresh'});await openOperation(page);
    const result=await page.evaluate(()=>({events:window.EL_ERRANTE_HISTORICAL_COST_V14.events(),historical:window.EL_ERRANTE_HISTORICAL_COST_V14.historicalOrder('LEGACY-NO-COST'),orderText:localStorage.getItem('ee_v14_orders')}));
    expect(result.events).toHaveLength(0);
    expect(result.historical).toMatchObject({type:'LEGACY_ORDER_COST',complete:false,legacy:true});
    expect(result.historical.lines[0].unitCostSnapshot).toBeNull();
  });

  test('un pedido legado conserva el costo embebido que ya tenía, sin crear snapshot V1.4',async({page})=>{
    const old=order({id:'LEGACY-WITH-COST',status:'delivered',withCost:true});await seed(page,{orders:[old],state:'fresh'});await openOperation(page);
    const result=await page.evaluate(()=>({events:window.EL_ERRANTE_HISTORICAL_COST_V14.events(),margin:window.EL_ERRANTE_HISTORICAL_COST_V14.historicalMargin('LEGACY-WITH-COST')}));
    expect(result.events).toHaveLength(0);expect(result.margin.complete).toBe(true);expect(result.margin.knownCogs).toBe(7000);expect(result.margin.source).toBe('LEGACY_ORDER_COST');
  });

  test('una recepción nueva conserva costo observado y estándar as-of, no el estándar posterior',async({page})=>{
    await seed(page,{orders:[],events:[R1],state:'active',purchases:[]});await openOperation(page);
    const result=await page.evaluate(({r2})=>{
      const purchase={id:'COM-V14-NEW',materialId:'MP-HFS',supplier:'Molinos Uno',receivedDate:'2026-08-10',quantity:25000,totalCost:90000,unitCost:3.6,createdAt:'2026-08-10T06:15:00.000Z',dataStatus:'OBSERVADO'};
      localStorage.setItem('ee_v24_material_purchases',JSON.stringify([purchase]));window.dispatchEvent(new CustomEvent('ee:v24:reload'));
      const api=window.EL_ERRANTE_HISTORICAL_COST_V14;api.scanNewFacts('test-purchase');const before=api.historicalPurchase(purchase);
      const ledger=JSON.parse(localStorage.getItem('ee_v12_cost_materialization_events'));ledger.push(r2);localStorage.setItem('ee_v12_cost_materialization_events',JSON.stringify(ledger));const after=api.historicalPurchase(purchase);return {before,after,events:api.events()};
    },{r2:R2});
    expect(result.before).toMatchObject({type:'PURCHASE_STANDARD_SNAPSHOT',observedUnitCost:3.6,standardUnitCost:3.4,standardRevision:1,costOrigin:'MATERIALIZED_STANDARD'});
    expect(result.after).toEqual(result.before);expect(result.events.filter(x=>x.type==='PURCHASE_STANDARD_SNAPSHOT')).toHaveLength(1);
  });

  test('leer y reconstruir histórico no muta pedidos, compras, ledger V1.2 ni canon',async({page})=>{
    const old=order({id:'LEGACY-INTEGRITY',status:'delivered',withCost:true});const purchase={id:'COM-INTEGRITY',materialId:'MP-HFS',quantity:10,totalCost:34,unitCost:3.4,receivedDate:'2026-08-09'};await seed(page,{orders:[old],purchases:[purchase],state:'fresh',events:[R1]});await openOperation(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_HISTORICAL_COST_V14;const before={orders:localStorage.getItem('ee_v14_orders'),purchases:localStorage.getItem('ee_v24_material_purchases'),ledger:localStorage.getItem('ee_v12_cost_materialization_events'),materials:JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.materials),products:JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.products)};
      api.historicalMargin('LEGACY-INTEGRITY');api.historicalPurchase('COM-INTEGRITY');api.productCostAt('EE-MAR-01','2026-08-10T06:00:00.000Z');
      const after={orders:localStorage.getItem('ee_v14_orders'),purchases:localStorage.getItem('ee_v24_material_purchases'),ledger:localStorage.getItem('ee_v12_cost_materialization_events'),materials:JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.materials),products:JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.products)};return {before,after};
    });expect(result.after).toEqual(result.before);
  });

  test('Finanzas muestra incompleto y no sustituye un costo histórico faltante',async({page})=>{
    const old=order({id:'FIN-INCOMPLETE',status:'delivered',withCost:false});await seed(page,{orders:[old],state:'fresh'});await openFinance(page);
    await expect(page.locator('#finance-historical-cost-v14')).toContainText('Incompleto');
    await expect(page.locator('#finance-historical-cost-v14')).toContainText('0/1 con costo completo');
  });

  test('no genera desbordamiento horizontal en Finanzas móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación exclusiva del proyecto móvil');const old=order({id:'FIN-MOBILE',status:'delivered',withCost:true});await seed(page,{orders:[old],state:'fresh'});await openFinance(page);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
  });
});
