const {test,expect}=require('@playwright/test');

async function openStudio(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.1',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([
      {id:'COM-1',materialId:'MP-HFS',supplier:'Molinos Demo',invoiceReference:'FAC-001',receivedDate:'2026-08-09',quantity:25000,totalCost:85000,unitCost:3.4,dataStatus:'OBSERVADO',createdAt:'2026-08-09T12:00:00Z'},
      {id:'COM-2',materialId:'MP-HHO',supplier:'Molinos Demo',invoiceReference:'FAC-002',receivedDate:'2026-08-08',quantity:25000,totalCost:74000,unitCost:2.96,dataStatus:'OBSERVADO',createdAt:'2026-08-08T12:00:00Z'}
    ]));
  });
  await page.goto('/studio.html');
  await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  await expect(page.locator('[data-master-data-version="1.0.0"]')).toBeVisible();
}

test.describe('Datos maestros V1.0',()=>{
  test('separa estándar provisional, compra observada y gobierno',async({page})=>{
    await openStudio(page);
    const state=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_DATA_V10;
      const row=api.materialRows().find(item=>item.material.id==='MP-HFS');
      return {version:api.version,cost:row.material.cost,status:row.material.status,observed:row.observed.unitCost,supplier:row.observed.supplier};
    });
    expect(state).toEqual({version:'1.0.0',cost:2.8,status:'CONFIRMADO',observed:3.4,supplier:'Molinos Demo'});
  });

  test('gobernar un material no altera compras, BOM ni costo maestro',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_DATA_V10;
      const before=api.integritySnapshot();
      const productBefore=JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.products);
      api.saveMaterialGovernance('MP-HFS',{owner:'Chef líder',source:'Factura FAC-001',reviewedAt:'2026-08-09',quality:'REVISADO',sensitivity:'ALTA',note:'Validar próximo lote'});
      const row=api.materialRows().find(item=>item.material.id==='MP-HFS');
      return {unchanged:api.integrityUnchanged(before),productsUnchanged:productBefore===JSON.stringify(window.EL_ERRANTE_MATERIALS_V23.products),cost:row.material.cost,observed:row.observed.unitCost,governance:row.governance,purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases')).length};
    });
    expect(result.unchanged).toBe(true);
    expect(result.productsUnchanged).toBe(true);
    expect(result.cost).toBe(2.8);
    expect(result.observed).toBe(3.4);
    expect(result.purchases).toBe(2);
    expect(result.governance).toMatchObject({owner:'Chef líder',source:'Factura FAC-001',quality:'REVISADO',sensitivity:'ALTA'});
  });

  test('gobernar un proveedor no crea ni modifica hechos de compra',async({page})=>{
    await openStudio(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_MASTER_DATA_V10;
      const before=api.integritySnapshot();
      api.saveSupplierGovernance('Molinos Demo',{owner:'Compras',source:'Visita proveedor',reviewedAt:'2026-08-09',quality:'VALIDADO',sensitivity:'CRITICA',note:'Proveedor principal de harina'});
      const supplier=api.supplierRows().find(item=>item.name==='Molinos Demo');
      return {unchanged:api.integrityUnchanged(before),count:supplier.count,materials:supplier.materials,governance:supplier.governance,purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases'))};
    });
    expect(result.unchanged).toBe(true);
    expect(result.count).toBe(2);
    expect(result.materials.sort()).toEqual(['MP-HFS','MP-HHO']);
    expect(result.governance).toMatchObject({owner:'Compras',quality:'VALIDADO',sensitivity:'CRITICA'});
    expect(result.purchases).toHaveLength(2);
  });

  test('la UI persiste el overlay local de un material',async({page})=>{
    await openStudio(page);
    await page.locator('[data-md-edit-material="MP-HFS"]').click();
    const form=page.locator('#md-v10-material-form');
    await form.getByLabel('Responsable').fill('Juan');
    await form.getByLabel('Fuente específica').fill('Costeo interno');
    await form.getByLabel('Fecha de revisión').fill('2026-08-09');
    await form.getByLabel('Calidad de gobierno').selectOption('REVISADO');
    await form.getByLabel('Sensibilidad operativa').selectOption('ALTA');
    await form.getByRole('button',{name:'Guardar gobierno del material'}).click();
    await expect(page.locator('[data-md-material-row="MP-HFS"]')).toContainText('Resp. Juan');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v10_master_governance')).materials['MP-HFS']);
    expect(saved).toMatchObject({owner:'Juan',source:'Costeo interno',reviewedAt:'2026-08-09',quality:'REVISADO',sensitivity:'ALTA'});
  });

  test('no genera desbordamiento horizontal del documento en móvil',async({page,isMobile})=>{
    test.skip(!isMobile,'Sólo proyecto móvil');
    await openStudio(page);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
