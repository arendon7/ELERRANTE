// Compatibilidad de auditoría V3.0: Arquitectura interna V3.0 · Plan vs. real · Mesa de pedidos y continuidad local · MFO v3.3 de prueba · Formalización de Juan · Escenarios del año 1
const {test,expect}=require('@playwright/test');

async function seedSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}
async function seedOperational(page){
  await page.addInitScript(()=>{
    const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V31-001',status:'approved',createdAt:`${date}T10:00:00-05:00`,total:60000,delivery:{requestedDate:date,city:'Medellín'},customer:{name:'Prueba V3.1'},items:[{productId:'la-errante',name:'La Errante',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100,'MP-HHO':100,'MP-POM90':0,'MP-MOZ':0,'MP-CHO':0,'MP-CEB':0,'MP-PAR':0,'MP-PYM':0,'MP-ACE':0,'EMP-VAC1':0,'EMP-ETQ':0,'CIF-GAS':0}));
    sessionStorage.setItem('ee_v22_selected_date',date);
  });
}
async function seedMfo(page){
  await page.addInitScript(()=>{
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map((month,i)=>({month,sku:'SKU-TEST',quantity:10+i,unitPrice:10000,sales:(10+i)*10000,unitCost:4000,cogs:(10+i)*4000,status:'ESTIMADO',confidence:'Media',source:'01_PLAN_VENTAS'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i?0:2000000,salesCash:(10+i)*10000,purchases:25000,operatingExpenses:20000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO',confidence:'Media',source:'03_RESULTADOS_CAJA'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO v3.3 de prueba',status:'ESTIMADO',confidence:'Media',source:'fixture Playwright',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'SKU-TEST',name:'Pizza prueba',category:'Pizza',price:10000,directCost:4000,validFrom:'',status:'ESTIMADO',confidence:'Media',source:'05_PRODUCTOS_SUPUESTOS'}],cashFlow,scenarios:[{name:'Base',volumeFactor:1,directCostFactor:1,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja',note:'Prueba'}],decisions:[{name:'Formalización de Juan',configuredMonth:16,recommendedMonth:8,decisionState:'PENDIENTE',condition:'3 meses cubriendo costo formal + liquidez',suggestedAction:'Evaluar con hechos reales.',status:'INFERIDO'}],pending:[{priority:'Alta',finding:'Validar costos especiales',impact:'Margen',recommendedDecision:'Medir recetas',status:'PENDIENTE'}]}));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'M1',date:'2026-08-07',type:'inventory_purchase',amount:15000,evidence:'CONFIRMADO'}]));
  });
}

test.describe('Sistema interno V3.1',()=>{
  test('la web pública ofrece acceso discreto a usuarios desde el footer',async({page})=>{
    await page.goto('/index.html');
    const link=page.getByRole('link',{name:'Acceso usuarios'});
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href','acceso.html');
    const visual=await link.evaluate(node=>{const style=getComputedStyle(node);return {fontSize:parseFloat(style.fontSize),textTransform:style.textTransform,color:style.color};});
    expect(visual.fontSize).toBeLessThanOrEqual(12);
    expect(visual.textTransform).toBe('uppercase');
  });

  test('una ruta interna sin sesión redirige al acceso',async({page})=>{
    await page.goto('/finanzas.html');
    await expect(page).toHaveURL(/acceso\.html/);
    await expect(page.getByRole('heading',{name:/Configura el primer acceso local|Bienvenido de nuevo/})).toBeVisible();
  });

  test('el primer acceso crea credenciales locales y abre el selector de módulos',async({page})=>{
    await page.goto('/acceso.html');
    await page.getByLabel('Usuario').fill('juan');
    await page.getByLabel('Contraseña',{exact:true}).fill('PruebaSegura31!');
    await page.getByLabel('Confirmar contraseña').fill('PruebaSegura31!');
    await page.getByRole('button',{name:'Crear acceso y entrar'}).click();
    await expect(page).toHaveURL(/centro-interno\.html/);
    await expect(page.getByRole('heading',{name:'Elige el contexto antes de empezar a trabajar.'})).toBeVisible();
    await expect(page.getByRole('link',{name:/Entrar a Operación/})).toHaveAttribute('href','operacion.html');
    await expect(page.getByRole('link',{name:/Entrar a Finanzas/})).toHaveAttribute('href','finanzas.html');
  });

  test('Operación reúne resumen, pedidos y cadena de ejecución sin finanzas',async({page})=>{
    await seedSession(page);await seedOperational(page);await page.goto('/operacion.html');
    await expect(page.getByRole('heading',{name:'Del pedido al despacho, con cada decisión visible.'})).toBeVisible();
    await expect(page.locator('#control-v30')).toContainText('Unidades por producir');
    await expect(page.locator('#daily-ops-v21')).toContainText('Mesa de pedidos y continuidad local');
    await expect(page.locator('#production-v22')).toContainText('Agenda de alistamiento por fecha');
    await expect(page.locator('#materials-v23')).toBeVisible();
    await expect(page.locator('#procurement-v25')).toBeVisible();
    await expect(page.locator('#finance-workbench-v31')).toHaveCount(0);
  });

  test('Finanzas permite importar MFO o iniciar un modelo local desde cero',async({page})=>{
    await seedSession(page);await page.goto('/finanzas.html');
    await expect(page.getByRole('heading',{name:'Planificar, modificar, comparar y decidir.'})).toBeVisible();
    await expect(page.locator('#finance-workbench-v31')).toContainText('Carga el baseline privado del MFO.');
    await expect(page.getByRole('button',{name:'Crear modelo desde cero'})).toBeVisible();
    await page.getByRole('button',{name:'Crear modelo desde cero'}).click();
    await expect(page.getByText('Dashboard financiero')).toBeVisible();
    const local=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v30_mfo_snapshot')));
    expect(local.meta.workbookProfile).toBe('LOCAL_STARTER_V31');
    expect(local.planSales.length).toBeGreaterThanOrEqual(24);
    expect(local.productCosts.length).toBeGreaterThan(0);
    expect(local.productCosts.every(row=>row.directCost===0&&row.status==='PENDIENTE')).toBeTruthy();
    await expect(page.locator('#finance-v27')).toHaveCount(0);
    await expect(page.locator('#production-v22')).toHaveCount(0);
  });

  test('el workbench carga 24M, grafica y permite editar sin modificar el baseline',async({page})=>{
    await seedSession(page);await seedOperational(page);await seedMfo(page);await page.goto('/finanzas.html');
    await expect(page.locator('html')).toHaveAttribute('data-finance-version','3.1.0');
    await expect(page.getByText('Dashboard financiero')).toBeVisible();
    await expect(page.locator('.v31-chart')).toHaveCount(3);
    await page.getByRole('button',{name:'Plan de ventas'}).click();
    const qty=page.locator('[data-plan-qty="SKU-TEST|2026-08"]');
    await expect(qty).toHaveValue('10');await qty.fill('25');await qty.blur();
    const stored=await page.evaluate(()=>({baseline:JSON.parse(localStorage.getItem('ee_v30_mfo_snapshot')),working:JSON.parse(localStorage.getItem('ee_v31_finance_working_model')),history:JSON.parse(localStorage.getItem('ee_v31_finance_history'))}));
    expect(stored.baseline.planSales[0].quantity).toBe(10);
    expect(stored.working.planSales[0].quantity).toBe(25);
    expect(stored.working.planSales[0].sales).toBe(250000);
    expect(stored.history[0].label).toBe('Plan de ventas modificado');
  });

  test('precio y costo recalculan margen y el escenario es editable',async({page})=>{
    await seedSession(page);await seedMfo(page);await page.goto('/finanzas.html');
    await page.getByRole('button',{name:'Productos y costos'}).click();
    const price=page.locator('[data-product-price="SKU-TEST"]');await price.fill('12000');await price.blur();
    const cost=page.locator('[data-product-cost="SKU-TEST"]');await cost.fill('5000');await cost.blur();
    await expect(page.locator('[data-section="products"]')).toContainText(/7[.\s]?000/);
    await page.getByRole('button',{name:'Escenarios'}).click();
    const volume=page.locator('[data-scenario="0|volumeFactor"]');await volume.fill('1.25');await volume.blur();
    const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v31_finance_working_model')));
    expect(data.productCosts[0].price).toBe(12000);expect(data.productCosts[0].directCost).toBe(5000);expect(data.scenarios[0].volumeFactor).toBe(1.25);
  });

  test('las superficies V3.1 no desbordan en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seedSession(page);await seedMfo(page);
    for(const path of ['/centro-interno.html','/operacion.html','/finanzas.html']){await page.goto(path);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`overflow en ${path}`).toBeLessThanOrEqual(2);}
  });
});