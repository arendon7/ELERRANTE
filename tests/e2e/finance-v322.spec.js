const {test,expect}=require('@playwright/test');

async function seed(page,{status='PENDIENTE',directCost=0}={}){
  await page.addInitScript(({status,directCost})=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    if(sessionStorage.getItem('ee_v322_test_seeded')==='1')return;
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'margherita-del-taller',quantity:month==='2026-08'?10:0,unitPrice:20900,sales:month==='2026-08'?209000:0,unitCost:directCost,cogs:month==='2026-08'?10*directCost:0,status,source:'Prueba V3.2.2'}));
    const cashFlow=months.map(month=>({month,openingCash:0,salesCash:0,purchases:0,operatingExpenses:0,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'PENDIENTE'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.2',status:'PENDIENTE'},planSales,productCosts:[{sku:'margherita-del-taller',name:'Margherita del Taller',category:'Pizza',price:20900,directCost,status,confidence:'',source:'Prueba V3.2.2'},{sku:'salsa-tomate',name:'Salsa de tomate',category:'Salsa',price:19900,directCost:0,status:'PENDIENTE',confidence:'',source:'Prueba V3.2.2'}],cashFlow,scenarios:[],assumptions:[],decisions:[],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V322-001',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:20900,items:[{productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1,unit_cost_snapshot:6000}]}]));
    localStorage.removeItem('ee_v322_material_cost_overrides');
    localStorage.removeItem('ee_v31_finance_working_model');
    sessionStorage.setItem('ee_v322_test_seeded','1');
  },{status,directCost});
}

async function openUnit(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-unit-version','3.2.2');
  await page.locator('[data-v322-unit="1"]').click();
  await expect(page.getByRole('heading',{name:'Del costo total a la economía unitaria.'})).toBeVisible();
}

test.describe('Economía unitaria V3.2.2',()=>{
  test('recalcula la BOM desde materiales sin tocar el costo financiero',async({page})=>{
    await seed(page);await openUnit(page);
    const analysis=await page.evaluate(()=>{
      const a=window.EL_ERRANTE_FINANCE_V322.analyses()[0];
      return {total:a.calc.total,financeCost:a.financeCost,margin:a.bomMarginPct,matched:a.sourceProduct.sku,confirmedShare:a.confirmedShare,actualCogs:window.EL_ERRANTE_FINANCE_V31.actual('2026-08').cogs};
    });
    expect(analysis.matched).toBe('EE-MAR-01');
    expect(analysis.total).toBeCloseTo(6940,2);
    expect(analysis.financeCost).toBe(0);
    expect(analysis.margin).toBeCloseTo((20900-6940)/20900,5);
    expect(analysis.confirmedShare).toBeGreaterThan(0);
    expect(analysis.confirmedShare).toBeLessThan(1);
    expect(analysis.actualCogs).toBe(6000);
    await expect(page.getByText('Ingredientes, empaque, CIF variable y componentes.')).toBeVisible();
    await expect(page.getByText('Mozzarella',{exact:true})).toBeVisible();
    await expect(page.getByText('Sensibilidad rápida',{exact:true})).toBeVisible();
  });

  test('preserva cantidades fraccionarias de la BOM en la interfaz',async({page})=>{
    await seed(page);await openUnit(page);
    await page.locator('[data-v322-select="salsa-tomate"]').click();
    const pomodoro=page.locator('.v322-driver').filter({hasText:'Pomodoro porción grande'});
    await expect(pomodoro).toContainText('5,56 porción');
    const analysis=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V322.analyses().find(a=>a.row.sku==='salsa-tomate').calc.lines.find(l=>l.id==='MP-POM90').qty);
    expect(analysis).toBeCloseTo(5.56,5);
  });

  test('simula un insumo por separado y solo aplica la BOM mediante acción explícita',async({page})=>{
    await seed(page);await openUnit(page);
    const mozzarella=page.locator('[data-v322-material-cost="MP-MOZ"]');
    await expect(mozzarella).toHaveValue('28');
    await mozzarella.fill('30');
    await page.getByRole('button',{name:'Guardar simulación',exact:true}).click();
    const simulated=await page.evaluate(()=>{
      const a=window.EL_ERRANTE_FINANCE_V322.analyses().find(x=>x.row.sku==='margherita-del-taller');
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      return {bom:a.calc.total,directCost:data.productCosts[0].directCost,planCost:data.planSales.find(r=>r.month==='2026-08').unitCost,override:JSON.parse(localStorage.getItem('ee_v322_material_cost_overrides')||'{}')['MP-MOZ']};
    });
    expect(simulated.bom).toBeCloseTo(7140,2);
    expect(simulated.directCost).toBe(0);
    expect(simulated.planCost).toBe(0);
    expect(simulated.override.cost).toBe(30);
    expect(simulated.override.status).toBe('ESTIMADO');

    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Aplicar BOM como costo estimado',exact:true}).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('data-finance-unit-version','3.2.2');
    const applied=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const row=data.productCosts[0];const plan=data.planSales.find(r=>r.month==='2026-08');
      return {directCost:row.directCost,status:row.status,source:row.source,planCost:plan.unitCost,planCogs:plan.cogs,actualCogs:window.EL_ERRANTE_FINANCE_V31.actual('2026-08').cogs,history:JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]')};
    });
    expect(applied.directCost).toBe(7140);
    expect(applied.status).toBe('ESTIMADO');
    expect(applied.source).toContain('BOM');
    expect(applied.planCost).toBe(7140);
    expect(applied.planCogs).toBe(71400);
    expect(applied.actualCogs).toBe(6000);
    expect(applied.history.some(h=>h.label==='BOM aplicada al modelo financiero')).toBe(true);
  });

  test('no permite reemplazar automáticamente un costo financiero confirmado',async({page})=>{
    await seed(page,{status:'CONFIRMADO',directCost:7000});await openUnit(page);
    const apply=page.getByRole('button',{name:'Aplicar BOM como costo estimado',exact:true});
    await expect(apply).toBeDisabled();
    await expect(page.getByText('El costo financiero está confirmado y no se reemplaza automáticamente con una simulación.')).toBeVisible();
    const data=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V31.working().productCosts[0]);
    expect(data.directCost).toBe(7000);
    expect(data.status).toBe('CONFIRMADO');
  });

  test('un costo confirmado parcial conserva su evidencia pero admite una aplicación explícita',async({page})=>{
    await seed(page,{status:'CONFIRMADO PARCIAL',directCost:7000});await openUnit(page);
    const apply=page.getByRole('button',{name:'Aplicar BOM como costo estimado',exact:true});
    await expect(apply).toBeEnabled();
    const data=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V31.working().productCosts[0]);
    expect(data.directCost).toBe(7000);
    expect(data.status).toBe('CONFIRMADO PARCIAL');
  });

  test('la economía unitaria no desborda horizontalmente en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openUnit(page);
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,tableScroll:document.querySelector('.v322-product-table').scrollWidth-document.querySelector('.v322-product-table').clientWidth}));
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.tableScroll).toBeGreaterThanOrEqual(0);
  });
});
