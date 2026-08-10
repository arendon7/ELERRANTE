const {test,expect}=require('@playwright/test');

async function seed(page,{preexistingEvidence=[]}={}){
  await page.addInitScript(({preexistingEvidence})=>{
    if(sessionStorage.getItem('ee_v330_test_seeded')==='1')return;
    const now=Date.now();
    const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+8*3600000).toISOString()}));
    sessionStorage.setItem('ee_v22_selected_date',date);
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'V330-OP-1',status:'preparing',createdAt:new Date(now-3600000).toISOString(),delivery:{requestedDate:date,city:'Medellín'},customer:{name:'Prueba'},items:[{productId:'la-errante',name:'La Errante',quantity:2}]}]));
    localStorage.setItem('ee_v22_fulfillment',JSON.stringify({}));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100}));
    localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'V330-MED-1',kind:'recipe',referenceId:'REC-MASA-BASE-V23',referenceName:'Masa base con poolish',batchCode:`LOTE-${date}`,productionDate:date,expectedQty:1000,actualQty:940,wasteQty:60,unit:'g',note:'Prueba',createdAt:new Date(now).toISOString(),dataStatus:'MEDIDO'}]));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([{id:'V330-COM-1',materialId:'MP-HFS',supplier:'Proveedor prueba',receivedDate:date,invoiceReference:'',quantity:10,totalCost:10000,unitCost:1000,createdAt:new Date(now).toISOString()}]));
    localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([]));
    localStorage.setItem('ee_v330_operational_evidence',JSON.stringify(preexistingEvidence));
    localStorage.removeItem('ee_v311_operational_demo');
    localStorage.removeItem('ee_v30_mfo_snapshot');
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v329_finance_demo');
    sessionStorage.setItem('ee_v330_test_seeded','1');
  },{preexistingEvidence});
}

async function openEvidence(page){
  await page.goto('/operacion.html#evidencia');
  await expect(page.locator('html')).toHaveAttribute('data-operational-evidence-version','3.3.0');
  await expect(page.locator('#evidencia')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Hechos trazables antes de cerrar.'})).toBeVisible();
  await expect(page.locator('#operational-evidence-v330')).toBeVisible();
}

test.describe('Evidencia operativa V3.3.0',()=>{
  test('consolida hechos existentes sin inventar cobertura',async({page})=>{
    await seed(page);await openEvidence(page);
    const state=await page.evaluate(()=>Object.fromEntries(window.EL_ERRANTE_OPERATION_V330.readiness().map(row=>[row.id,row])));
    expect(state.production.state).toBe('ready');
    expect(state.yield.state).toBe('ready');
    expect(state.inventory.state).toBe('attention');
    expect(state.receipt.state).toBe('attention');
    expect(state.time.state).toBe('attention');
    await expect(page.locator('[data-v330-readiness="receipt"]')).toContainText('sin referencia de soporte');
  });

  test('exige soporte al confirmar recepción y cierra huecos sin tocar los hechos de origen',async({page})=>{
    await seed(page);await openEvidence(page);
    const result=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_OPERATION_V330;const date=api.selectedDate();
      const before={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),measurements:localStorage.getItem('ee_v24_production_measurements'),purchases:localStorage.getItem('ee_v24_material_purchases')};
      let blocked='';try{api.recordEvidence({date,kind:'purchase_receipt',status:'CONFIRMADO',reference:'V330-COM-1',supportRef:'',note:'Sin soporte'});}catch(error){blocked=error.message;}
      api.recordEvidence({date,kind:'purchase_receipt',status:'CONFIRMADO',reference:'V330-COM-1',supportRef:'REM-001',note:'Remisión verificada'});
      api.recordEvidence({date,kind:'inventory_count',status:'OBSERVADO',reference:'Conteo MP-HFS',supportRef:'ACTA-CONTEO-001',note:'Conteo físico del día'});
      api.recordEvidence({date,kind:'time_incident',status:'OBSERVADO',reference:'Jornada producción',durationMinutes:95,note:'Preparación y alistamiento'});
      const readiness=Object.fromEntries(api.readiness().map(row=>[row.id,row.state]));
      const after={orders:localStorage.getItem('ee_v14_orders'),stock:localStorage.getItem('ee_v23_material_stock'),measurements:localStorage.getItem('ee_v24_production_measurements'),purchases:localStorage.getItem('ee_v24_material_purchases')};
      return {blocked,readiness,before,after,count:api.allEvidence().length};
    });
    expect(result.blocked).toContain('exige una referencia de soporte');
    expect(result.readiness.receipt).toBe('ready');
    expect(result.readiness.inventory).toBe('ready');
    expect(result.readiness.time).toBe('ready');
    expect(result.before).toEqual(result.after);
    expect(result.count).toBe(3);
  });

  test('una corrección agrega historia y no sobreescribe el registro anterior',async({page})=>{
    await seed(page);await openEvidence(page);
    const state=await page.evaluate(()=>{
      const api=window.EL_ERRANTE_OPERATION_V330,date=api.selectedDate();
      const first=api.recordEvidence({date,kind:'inventory_count',status:'OBSERVADO',reference:'Conteo inicial',supportRef:'ACTA-1',note:'100 g'});
      const second=api.recordEvidence({date,kind:'inventory_count',status:'CONFIRMADO',reference:'Conteo corregido',supportRef:'ACTA-2',note:'105 g',supersedes:first.id});
      return {first,second,all:api.allEvidence(),active:api.activeEvidence(date)};
    });
    expect(state.all).toHaveLength(2);
    expect(state.active).toHaveLength(1);
    expect(state.active[0].reference).toBe('Conteo corregido');
    expect(state.second.supersedes).toBe(state.first.id);
    await page.reload();
    await expect(page.locator(`[data-v330-evidence="${state.first.id}"]`)).toContainText('Reemplazado por corrección');
    await expect(page.locator(`[data-v330-evidence="${state.second.id}"]`)).toContainText('Corrige');
  });

  test('un periodo futuro queda no aplicable y no se interpreta como cero real',async({page})=>{
    await seed(page);await openEvidence(page);
    const states=await page.evaluate(()=>{
      const d=new Date();d.setDate(d.getDate()+3);const future=d.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
      return window.EL_ERRANTE_OPERATION_V330.readiness(future);
    });
    expect(states.every(row=>row.state==='na')).toBe(true);
    expect(states.every(row=>row.detail.includes('futuro'))).toBe(true);
  });

  test('la demo operativa respalda y restaura también la bitácora V3.3.0',async({page})=>{
    const original=[{id:'REAL-EVI-1',date:'2026-08-01',kind:'other',reference:'Registro real previo',supportRef:'ACTA-REAL',status:'OBSERVADO',durationMinutes:null,supersedes:null,note:'Debe regresar intacto',createdAt:'2026-08-01T10:00:00-05:00',createdBy:'Juan',dataStatus:'OBSERVADO'}];
    await seed(page,{preexistingEvidence:original});
    await page.goto('/centro-interno.html');
    page.on('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Cargar demo operativa'}).click();
    await page.waitForURL(/\/control\.html$/);
    const demo=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v330_operational_evidence')));
    expect(demo).toHaveLength(1);expect(demo[0].demoV330).toBe(true);
    await page.getByRole('button',{name:'Salir y restaurar demo'}).click();
    await page.waitForURL(/\/centro-interno\.html$/);
    const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v330_operational_evidence')));
    expect(restored).toEqual(original);
  });

  test('no desborda horizontalmente en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openEvidence(page);
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,section:document.querySelector('#operational-evidence-v330').getBoundingClientRect().width,viewport:innerWidth}));
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.section).toBeLessThanOrEqual(geometry.viewport);
  });
});