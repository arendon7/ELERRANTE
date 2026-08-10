const {test,expect}=require('@playwright/test');

const SESSION={version:'3.1.1',username:'juan',displayName:'Juan',role:'Administrador'};
const STANDARD_EVENT={
  eventId:'STD-V13-HFS-R1',type:'MATERIALIZED',at:'2026-08-10T05:10:00.000Z',actor:'Dirección',reason:'Revisión aprobada para prueba integrada V1.3',
  proposalId:'COST-V13-HFS',materialId:'MP-HFS',materialName:'Harina Flor Suprema',unit:'g',
  fromRevision:0,toRevision:1,baselineCost:2.8,fromCost:2.8,toCost:3.4,
  approvalEventId:'APP-V13-HFS',approvedAt:'2026-08-10T05:09:00.000Z',approvedBy:'Dirección',
  proposalCreatedAt:'2026-08-10T05:08:00.000Z',proposalCreatedBy:'Costos',proposalRationale:'Compra observada sustenta la revisión',
  evidence:{purchaseId:'COM-V13-HFS',unitCost:3.4,supplier:'Molinos Demo',date:'2026-08-09'}
};

async function seed(page,{withStandard=true}={}){
  await page.addInitScript(({session,event,withStandard})=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({...session,issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-09');
    localStorage.setItem('ee_v14_orders',JSON.stringify([
      {id:'ORDER-V13-MAR',status:'approved',createdAt:'2026-08-09T12:00:00.000Z',customer:{name:'Cliente V1.3'},delivery:{city:'Medellín',requestedDate:'2026-08-09'},items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1}],costSnapshot:{unitCost:7000,source:'snapshot histórico prueba'}}
    ]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':5000}));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([{id:'COM-V13-HFS',materialId:'MP-HFS',supplier:'Molinos Demo',receivedDate:'2026-08-09',quantity:25000,totalCost:85000,unitCost:3.4,dataStatus:'OBSERVADO'}]));
    localStorage.removeItem('ee_v322_material_cost_overrides');
    if(withStandard)localStorage.setItem('ee_v12_cost_materialization_events',JSON.stringify([event]));
    else localStorage.removeItem('ee_v12_cost_materialization_events');
  },{session:SESSION,event:STANDARD_EVENT,withStandard});
}

async function openOperation(page){
  await page.goto('/operacion.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await expect(page.locator('html')).toHaveAttribute('data-master-cost-bridge','1.3.0');
  await expect(page.locator('#materials-v23')).toBeVisible();
}

async function openFinance(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await page.waitForFunction(()=>Boolean(window.EL_ERRANTE_FINANCE_V322&&window.EL_ERRANTE_MASTER_COST_BRIDGE_V13));
  await expect(page.locator('html')).toHaveAttribute('data-master-cost-bridge','1.3.0');
}

test.describe('Datos maestros V1.3 · puente prospectivo',()=>{
  test('Operación usa el estándar materializado sin reescribir pedido, stock, compra ni baseline',async({page})=>{
    await seed(page);
    await openOperation(page);
    const result=await page.evaluate(()=>{
      const rawProduct=window.EL_ERRANTE_MATERIALS_V23.products.find(item=>item.sku==='EE-MAR-01');
      const rawMaterial=window.EL_ERRANTE_MATERIALS_V23.materials.find(item=>item.id==='MP-HFS');
      const bridge=window.EL_ERRANTE_MASTER_COST_BRIDGE_V13;
      const operation=window.EL_ERRANTE_MATERIALS_V231;
      const before={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases'),ledger:localStorage.getItem('ee_v12_cost_materialization_events')};
      const baseline=bridge.productCost(rawProduct,{overrides:{'MP-HFS':{cost:2.8}}}).total;
      const effective=operation.standardProductCost(rawProduct);
      const plan=operation.plan();
      const standard=bridge.standardMaterial('MP-HFS');
      const after={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases'),ledger:localStorage.getItem('ee_v12_cost_materialization_events')};
      return {baseline,effective,estimatedCost:plan.estimatedCost,standard,rawProductCost:rawProduct.cost,rawMaterialCost:rawMaterial.cost,before,after};
    });
    expect(result.standard).toMatchObject({standardCost:3.4,standardRevision:1,costOrigin:'MATERIALIZED_STANDARD'});
    expect(result.effective-result.baseline).toBeCloseTo(105,6);
    expect(result.estimatedCost).toBeCloseTo(result.effective,6);
    expect(result.rawProductCost).toBe(7090);
    expect(result.rawMaterialCost).toBe(2.8);
    expect(result.after).toEqual(result.before);
    await expect(page.locator('[data-v23-product="EE-MAR-01"]')).toContainText('Estándar materializado');
    await expect(page.locator('[data-v23-material="MP-HFS"]')).toContainText('estándar r1');
  });

  test('Finanzas respeta baseline → estándar materializado → simulación y al restablecer vuelve al estándar',async({page})=>{
    await seed(page);
    await openFinance(page);
    const state=await page.evaluate(()=>{
      const finance=window.EL_ERRANTE_FINANCE_V322;
      const source=window.EL_ERRANTE_MATERIALS_V23.materials.find(item=>item.id==='MP-HFS');
      const standard=finance.standardMaterial(source);
      const effective=finance.effectiveMaterial(source,{});
      const simulated=finance.effectiveMaterial(source,{'MP-HFS':{cost:4.0,status:'ESTIMADO',source:'Prueba'}});
      return {standard,effective,simulated,rawCost:source.cost};
    });
    expect(state.rawCost).toBe(2.8);
    expect(state.standard).toMatchObject({standardCost:3.4,standardRevision:1,costOrigin:'MATERIALIZED_STANDARD'});
    expect(state.effective).toMatchObject({cost:3.4,standardCost:3.4,override:false});
    expect(state.simulated).toMatchObject({cost:4,standardCost:3.4,override:true,costOrigin:'SIMULATION'});

    await page.evaluate(()=>localStorage.setItem('ee_v322_material_cost_overrides',JSON.stringify({'MP-HFS':{cost:4,status:'ESTIMADO'}})));
    const simulatedFromStore=await page.evaluate(()=>{
      const source=window.EL_ERRANTE_MATERIALS_V23.materials.find(item=>item.id==='MP-HFS');
      return window.EL_ERRANTE_FINANCE_V322.effectiveMaterial(source);
    });
    expect(simulatedFromStore.cost).toBe(4);
    expect(simulatedFromStore.standardCost).toBe(3.4);
    await page.evaluate(()=>localStorage.removeItem('ee_v322_material_cost_overrides'));
    const restored=await page.evaluate(()=>{
      const source=window.EL_ERRANTE_MATERIALS_V23.materials.find(item=>item.id==='MP-HFS');
      return window.EL_ERRANTE_FINANCE_V322.effectiveMaterial(source);
    });
    expect(restored).toMatchObject({cost:3.4,standardCost:3.4,override:false});
  });

  test('el puente V1.3 es de solo lectura y calcular no altera hechos ni fuentes',async({page})=>{
    await seed(page);
    await openFinance(page);
    const result=await page.evaluate(()=>{
      const bridge=window.EL_ERRANTE_MASTER_COST_BRIDGE_V13;
      const finance=window.EL_ERRANTE_FINANCE_V322;
      const product=window.EL_ERRANTE_MATERIALS_V23.products.find(item=>item.sku==='EE-MAR-01');
      const before=bridge.snapshot();
      const factsBefore={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases')};
      const standard=bridge.standardMaterial('MP-HFS');
      const productCost=bridge.productCost(product);
      const financeCost=finance.calculate(product,{});
      const factsAfter={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),purchases:localStorage.getItem('ee_v24_material_purchases')};
      return {unchanged:bridge.integrityUnchanged(before),factsBefore,factsAfter,standard,productCost,financeCost};
    });
    expect(result.unchanged).toBe(true);
    expect(result.factsAfter).toEqual(result.factsBefore);
    expect(result.standard.standardRevision).toBe(1);
    expect(result.productCost.hasMaterialized).toBe(true);
    expect(result.financeCost.hasMaterialized).toBe(true);
  });

  test('sin revisiones materializadas conserva exactamente el baseline',async({page})=>{
    await seed(page,{withStandard:false});
    await openOperation(page);
    const result=await page.evaluate(()=>{
      const bridge=window.EL_ERRANTE_MASTER_COST_BRIDGE_V13;
      const material=bridge.standardMaterial('MP-HFS');
      const raw=window.EL_ERRANTE_MATERIALS_V23.materials.find(item=>item.id==='MP-HFS');
      return {material,rawCost:raw.cost};
    });
    expect(result.rawCost).toBe(2.8);
    expect(result.material).toMatchObject({cost:2.8,standardCost:2.8,standardRevision:0,costOrigin:'CANONICAL_BASELINE'});
  });

  test('no genera desbordamiento horizontal en Operación móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación exclusiva del proyecto móvil');
    await seed(page);
    await openOperation(page);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});