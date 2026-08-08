const {test,expect}=require('@playwright/test');

async function seedOperational(page){
  await page.addInitScript(()=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-V30-001',status:'approved',createdAt:'2026-08-07T10:00:00.000Z',total:60000,
      delivery:{requestedDate:'2026-08-07',city:'Medellín'},customer:{name:'Prueba V3'},
      items:[{productId:'la-errante',name:'La Errante',quantity:2,unit_cost_snapshot:12000}]
    }]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100,'MP-HHO':100,'MP-POM90':0,'MP-MOZ':0,'MP-CHO':0,'MP-CEB':0,'MP-PAR':0,'MP-PYM':0,'MP-ACE':0,'EMP-VAC1':0,'EMP-ETQ':0,'CIF-GAS':0}));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-07');
  });
}

async function seedMfo(page){
  await page.addInitScript(()=>{
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({
      schemaVersion:'3.0',
      meta:{modelName:'MFO v3.3 de prueba',modelDate:'',status:'ESTIMADO',confidence:'Media',source:'fixture Playwright',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},
      planSales:[{month:'2026-08',sku:'SKU-TEST',quantity:10,unitPrice:10000,unitCost:4000,status:'ESTIMADO',confidence:'Media',source:'01_PLAN_VENTAS'}],
      productCosts:[{sku:'SKU-TEST',price:10000,directCost:4000,validFrom:'2026-08-01',status:'ESTIMADO',confidence:'Media',source:'05_PRODUCTOS_SUPUESTOS'}],
      cashFlow:[{month:'2026-08',purchases:25000,capex:0,endingCash:50000,status:'ESTIMADO',confidence:'Media',source:'03_RESULTADOS_CAJA'}],
      scenarios:[{name:'Base',volumeFactor:1,directCostFactor:1,year1Sales:150000000,directMarginPct:.63,simplifiedOperatingResult:28000000,overloadMonths:4,peakCapacity:1.09,status:'ESTIMADO',confidence:'Media',source:'08_DECISIONES_ESCENARIOS'}],
      assumptions:[{name:'Caja mínima',value:1000000,status:'CONFIRMADO',confidence:'Alta',source:'05_PRODUCTOS_SUPUESTOS'}],
      decisions:[{name:'Formalización de Juan',configuredMonth:16,recommendedMonth:8,decisionState:'CONSERVADOR',condition:'3 meses cubriendo costo formal + liquidez',suggestedAction:'Puede adelantarse si la operación real confirma.',status:'INFERIDO',confidence:'Media',source:'08_DECISIONES_ESCENARIOS'}],
      pending:[{priority:'Alta',finding:'Validar costos especiales',modelStatus:'PENDIENTE',impact:'Margen',recommendedDecision:'Medir recetas',owner:'Juan',status:'PENDIENTE',confidence:'Media',source:'06_AUDITORIA'}]
    }));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'M1',date:'2026-08-07',type:'inventory_purchase',amount:15000,evidence:'CONFIRMADO'}]));
    sessionStorage.setItem('ee_v30_mfo_month','2026-08');
  });
}

test.describe('Arquitectura interna V3.0',()=>{
  test('el centro interno separa operación y finanzas como destinos principales',async({page})=>{
    await page.goto('/centro-interno.html');
    await expect(page.getByRole('heading',{name:'Dos preguntas. Dos paneles.'})).toBeVisible();
    await expect(page.getByRole('link',{name:/Abrir panel de control/})).toHaveAttribute('href','control.html');
    await expect(page.getByRole('link',{name:/Abrir panel financiero/})).toHaveAttribute('href','finanzas.html');
  });

  test('el panel de control prioriza operación y no monta finanzas',async({page})=>{
    await seedOperational(page);
    await page.goto('/control.html');
    await expect(page.locator('html')).toHaveAttribute('data-control-version','3.0.0');
    await expect(page.locator('#control-v30')).toContainText('Unidades por producir');
    await expect(page.locator('#control-v30')).toContainText('2');
    await expect(page.locator('#finance-v27')).toHaveCount(0);
    await expect(page.getByText('Sin métricas financieras')).toBeVisible();
  });

  test('operación carga la cadena diaria pero no el motor financiero',async({page})=>{
    await seedOperational(page);
    await page.goto('/operacion.html');
    await expect(page.getByRole('heading',{name:'Del pedido al despacho, sin saltos invisibles.'})).toBeVisible();
    await expect(page.locator('#daily-ops-v21')).toContainText('Mesa de pedidos y continuidad local');
    await expect(page.locator('#production-v22')).toContainText('Agenda de alistamiento por fecha');
    await expect(page.locator('#materials-v23')).toContainText('Lo necesario para producir, sin saturar el panel.');
    await expect(page.locator('html')).toHaveAttribute('data-daily-ops-version','2.1.0');
    await expect(page.locator('html')).toHaveAttribute('data-production-version','2.2.0');
    await expect(page.locator('#finance-v27')).toHaveCount(0);
  });

  test('finanzas monta el motor financiero y no superficies de ejecución',async({page})=>{
    await page.goto('/finanzas.html');
    await expect(page.locator('#finance-v27')).toContainText('Control financiero sin convertir la web en contabilidad.');
    await expect(page.locator('#mfo-v30')).toContainText('No hay un modelo financiero cargado en este navegador.');
    await expect(page.locator('html')).toHaveAttribute('data-mfo-state','empty');
    await expect(page.locator('#production-v22')).toHaveCount(0);
    await expect(page.locator('#materials-v23')).toHaveCount(0);
    await expect(page.getByText('Mapa del modelo financiero')).toBeVisible();
  });

  test('finanzas carga MFO v3.3, compara plan-real y muestra decisiones sin ejecutar cambios',async({page})=>{
    await seedOperational(page);
    await seedMfo(page);
    await page.goto('/finanzas.html');
    await expect(page.locator('html')).toHaveAttribute('data-mfo-version','3.0.1');
    await expect(page.locator('html')).toHaveAttribute('data-mfo-state','loaded');
    await expect(page.locator('#mfo-v30')).toContainText('Fuente MFO local');
    await expect(page.locator('#mfo-v30')).toContainText('Plan vs. real');
    await expect(page.locator('#mfo-v30')).toContainText('MFO v3.3 de prueba');
    await expect(page.locator('#mfo-v30')).toContainText(/100\.000/);
    await expect(page.locator('#mfo-v30')).toContainText(/60\.000/);
    await expect(page.locator('#mfo-v30')).toContainText('Solo snapshots del pedido');
    await expect(page.locator('#mfo-v30')).toContainText('Decisiones del modelo');
    await expect(page.locator('#mfo-v30')).toContainText('Formalización de Juan');
    await expect(page.locator('#mfo-v30')).toContainText('Escenarios del año 1');
    await expect(page.locator('#mfo-v30')).toContainText('Base');
    await expect(page.locator('#mfo-v30')).toContainText('Pendientes de calidad y decisión');
    await expect(page.locator('#production-v22')).toHaveCount(0);
    await expect(page.locator('#materials-v23')).toHaveCount(0);
  });

  test('las nuevas superficies internas no desbordan en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    for(const path of ['/centro-interno.html','/control.html','/operacion.html','/finanzas.html']){
      await page.goto(path);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`overflow en ${path}`).toBeLessThanOrEqual(2);
    }
  });
});
