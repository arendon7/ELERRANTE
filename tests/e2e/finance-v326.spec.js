const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map((month,i)=>({month,sku:'margherita-del-taller',quantity:i===0?10:i===1?5:0,unitPrice:20900,sales:(i===0?10:i===1?5:0)*20900,unitCost:6940,cogs:(i===0?10:i===1?5:0)*6940,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i===0?1000000:0,salesCash:0,purchases:i===0?50000:i===1?60000:0,operatingExpenses:0,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.6',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'margherita-del-taller',name:'Margherita del Taller',category:'Pizza',price:20900,directCost:6940,status:'ESTIMADO'}],cashFlow,scenarios:[],assumptions:[{name:'Caja mínima',value:500000,unit:'COP',status:'CONFIRMADO'}],decisions:[],pending:[]}));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v31_finance_history');
    localStorage.setItem('ee_v14_orders',JSON.stringify([
      {id:'ORD-AUG',status:'approved',delivery:{requestedDate:'2026-08-10'},total:41800,items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:2,unit_cost_snapshot:6940}]},
      {id:'ORD-SEP',status:'approved',delivery:{requestedDate:'2026-09-10'},total:20900,items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1,unit_cost_snapshot:6940}]},
      {id:'ORD-SIN-FECHA',status:'preparing',total:20900,items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1,unit_cost_snapshot:6940}]}
    ]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100,'MP-MOZ':50}));
    localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([
      {id:'PO-HFS',status:'ordered',materialId:'MP-HFS',requestedQty:300,receivedQty:100,unitCost:3,expectedDate:'2026-08-09'},
      {id:'PO-MOZ',status:'ordered',materialId:'MP-MOZ',requestedQty:100,receivedQty:0,unitCost:30,expectedDate:'2026-08-09'},
      {id:'PO-HFS-DRAFT',status:'draft',materialId:'MP-HFS',requestedQty:100,receivedQty:0,unitCost:2.9,expectedDate:'2026-08-11'}
    ]));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([
      {id:'COM-HFS',materialId:'MP-HFS',supplier:'Proveedor A',receivedDate:'2026-08-07',quantity:500,totalCost:1500,unitCost:3,dataStatus:'OBSERVADO'},
      {id:'COM-MOZ',materialId:'MP-MOZ',supplier:'Proveedor B',receivedDate:'2026-08-08',quantity:1000,totalCost:30000,unitCost:30,dataStatus:'OBSERVADO'}
    ]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'MOV-COMPRA',date:'2026-08-08',type:'inventory_purchase',amount:20000,evidence:'CONFIRMADO'}]));
    sessionStorage.setItem('ee_v326_procurement_tab','1');
    sessionStorage.setItem('ee_v326_procurement_month','2026-08');
  });
}

async function openBridge(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-procurement-version','3.2.6');
  await expect(page.getByRole('heading',{name:'Ver abastecimiento como flujo financiero, sin operar compras desde Finanzas.'})).toBeVisible();
}

test.describe('Compras e inventario V3.2.6',()=>{
  test('separa BOM plan, necesidad operativa, compromiso, recepción y pago',async({page})=>{
    await seed(page);await openBridge(page);
    const state=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working(),s=window.EL_ERRANTE_FINANCE_V326.monthSummary(data,'2026-08');
      const hfs=s.rows.find(r=>r.id==='MP-HFS'),moz=s.rows.find(r=>r.id==='MP-MOZ');
      return {planBomCost:s.planBomCost,operationalBomCost:s.operationalBomCost,issuedCost:s.supply.issuedCost,proposedCost:s.supply.proposedCost,observed:s.observed.total,planCash:s.planPurchaseCash,actualCash:s.actualPurchaseCash,inventory:s.knownInventoryValue,gap:s.gapExposure,unknown:s.unknownStock,unscheduled:s.ops.unscheduled.length,hfs,moz};
    });
    expect(state.planBomCost).toBeCloseTo(69400,2);
    expect(state.operationalBomCost).toBeCloseTo(13880,2);
    expect(state.issuedCost).toBeCloseTo(3600,2);
    expect(state.proposedCost).toBeCloseTo(290,2);
    expect(state.observed).toBe(31500);
    expect(state.planCash).toBe(50000);
    expect(state.actualCash).toBe(20000);
    expect(state.inventory).toBeCloseTo(1680,2);
    expect(state.gap).toBeCloseTo(1540,2);
    expect(state.unknown).toBe(8);
    expect(state.unscheduled).toBe(1);
    expect(state.hfs.planQty).toBe(1750);expect(state.hfs.operationalQty).toBe(350);expect(state.hfs.issuedQty).toBe(200);expect(state.hfs.proposedQty).toBe(100);expect(state.hfs.gapQty).toBe(50);expect(state.hfs.observedCost).toBe(3);
    expect(state.moz.planQty).toBe(1000);expect(state.moz.operationalQty).toBe(200);expect(state.moz.gapQty).toBe(50);expect(state.moz.observedCost).toBe(30);
    await expect(page.getByText('Necesidad, compromiso, recepción y pago son etapas distintas.')).toBeVisible();
  });

  test('cambiar mes solo cambia la lectura y no muta fuentes operativas o financieras',async({page})=>{
    await seed(page);await openBridge(page);
    const before=await page.evaluate(()=>({snapshot:localStorage.getItem('ee_v30_mfo_snapshot'),working:localStorage.getItem('ee_v31_finance_working_model'),orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases'),purchaseOrders:localStorage.getItem('ee_v25_purchase_orders'),moves:localStorage.getItem('ee_v27_finance_movements')}));
    await page.locator('[data-v326-month]').fill('2026-09');
    await page.locator('[data-v326-month]').dispatchEvent('change');
    const after=await page.evaluate(()=>({snapshot:localStorage.getItem('ee_v30_mfo_snapshot'),working:localStorage.getItem('ee_v31_finance_working_model'),orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases'),purchaseOrders:localStorage.getItem('ee_v25_purchase_orders'),moves:localStorage.getItem('ee_v27_finance_movements'),month:sessionStorage.getItem('ee_v326_procurement_month'),summary:window.EL_ERRANTE_FINANCE_V326.monthSummary(window.EL_ERRANTE_FINANCE_V31.working(),'2026-09')}));
    expect(after.month).toBe('2026-09');
    for(const key of ['snapshot','working','orders','stock','purchases','purchaseOrders','moves'])expect(after[key]).toBe(before[key]);
    expect(after.summary.isFuture).toBe(true);
    expect(after.summary.actualPurchaseCash).toBeNull();
    expect(after.summary.planPurchaseCash).toBe(60000);
    expect(after.summary.planBomCost).toBeCloseTo(34700,2);
    await expect(page.getByText('Mes futuro',{exact:true}).first()).toBeVisible();
  });

  test('no expone acciones operativas de compra dentro de Finanzas',async({page})=>{
    await seed(page);await openBridge(page);
    const section=page.locator('[data-section="v326-procurement"]');
    await expect(section.locator('[data-v25-create],[data-v25-transition],[data-v25-receive],form')).toHaveCount(0);
    await expect(section).toContainText('Solo lectura');
    await expect(section).toContainText('responsabilidad del módulo Operación');
  });

  test('mantiene factura observada separada del pago real',async({page})=>{
    await seed(page);await openBridge(page);
    const s=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V326.monthSummary(window.EL_ERRANTE_FINANCE_V31.working(),'2026-08'));
    expect(s.observed.total).toBe(31500);
    expect(s.actualPurchaseCash).toBe(20000);
    expect(s.observed.total).not.toBe(s.actualPurchaseCash);
    const bridge=page.locator('.v326-flow');
    await expect(bridge).toContainText(/31[.\s]?500/);
    await expect(bridge).toContainText(/20[.\s]?000/);
  });

  test('la tabla ancha tiene scroll interno y no ensancha el documento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openBridge(page);
    const g=await page.evaluate(()=>{const el=document.querySelector('.v326-table-wrap'),r=el.getBoundingClientRect();return {doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:innerWidth,left:r.left,right:r.right,scroll:el.scrollWidth-el.clientWidth};});
    expect(g.doc).toBeLessThanOrEqual(2);
    expect(g.left).toBeGreaterThanOrEqual(-2);expect(g.right).toBeLessThanOrEqual(g.viewport+2);expect(g.scroll).toBeGreaterThan(0);
  });
});