const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    if(sessionStorage.getItem('ee_v324_test_seeded')==='1')return;
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'SKU-SCN',quantity:10,unitPrice:10000,sales:100000,unitCost:4000,cogs:40000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i===0?1000000:0,salesCash:80000,purchases:20000,operatingExpenses:10000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:5000,capex:0,endingCash:0,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({
      schemaVersion:'3.0',
      meta:{modelName:'MFO prueba V3.2.4',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},
      planSales,
      productCosts:[{sku:'SKU-SCN',name:'Producto escenario',category:'Prueba',price:10000,directCost:4000,status:'CONFIRMADO'}],
      cashFlow,
      scenarios:[
        {id:'SCN-BASE',name:'Base',volumeFactor:1,priceFactor:1,directCostFactor:1,opexFactor:1,purchaseFactor:1,collectionFactor:1,status:'ESTIMADO'},
        {id:'SCN-CONS',name:'Conservador',volumeFactor:.8,priceFactor:.98,directCostFactor:1.1,opexFactor:.95,purchaseFactor:.9,collectionFactor:.9,status:'ESTIMADO'},
        {id:'SCN-EXP',name:'Expansivo',volumeFactor:1.2,priceFactor:1,directCostFactor:1.05,opexFactor:1.1,purchaseFactor:1.2,collectionFactor:1,status:'ESTIMADO'}
      ],
      assumptions:[{name:'Caja mínima',value:1200000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]
    }));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V324-001',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[{productId:'SKU-SCN',name:'Producto escenario',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v31_finance_history');
    sessionStorage.setItem('ee_v324_scenario_year','0');
    sessionStorage.setItem('ee_v324_scenario_selected','0');
    sessionStorage.setItem('ee_v324_test_seeded','1');
  });
}

async function openScenarios(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-scenario-version','3.2.4');
  await page.getByRole('button',{name:'Escenarios',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Probar hipótesis sin convertirlas en plan.'})).toBeVisible();
}

test.describe('Escenarios comparables V3.2.4',()=>{
  test('calcula Base, Conservador y Expansivo contra una referencia común',async({page})=>{
    await seed(page);await openScenarios(page);
    const state=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const out=window.EL_ERRANTE_FINANCE_V324.projections(data,0);
      return {base:out.base,conservador:out.scenarios[1],expansivo:out.scenarios[2]};
    });
    expect(state.base.name).toBe('Plan de trabajo');
    expect(state.base.totals.sales).toBe(1200000);
    expect(state.base.totals.cogs).toBe(480000);
    expect(state.base.totals.opex).toBe(180000);
    expect(state.base.totals.result).toBe(540000);
    expect(state.base.endCash).toBe(1540000);

    expect(state.conservador.totals.sales).toBeCloseTo(940800,2);
    expect(state.conservador.totals.result).toBeCloseTo(347400,2);
    expect(state.conservador.endCash).toBeCloseTo(1290376,2);
    expect(state.conservador.rows[0].salesCash).toBeCloseTo(56448,2);

    expect(state.expansivo.totals.sales).toBe(1440000);
    expect(state.expansivo.totals.result).toBeCloseTo(637200,2);
    expect(state.expansivo.endCash).toBeCloseTo(1666000,2);
    expect(state.expansivo.rows[0].cogs).toBeCloseTo(50400,2);

    await expect(page.getByText('Plan de trabajo',{exact:true}).first()).toBeVisible();
    await expect(page.locator('.v324-scenario-card')).toHaveCount(4);
    await expect(page.locator('.v324-chart')).toHaveCount(1);
  });

  test('editar un escenario no modifica plan, caja base ni hechos reales',async({page})=>{
    await seed(page);await openScenarios(page);
    await page.locator('[data-v324-select="2"]').click();
    const before=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      return {plan:JSON.stringify(data.planSales),cash:JSON.stringify(data.cashFlow),actual:JSON.stringify(window.EL_ERRANTE_FINANCE_V31.actual('2026-08'))};
    });
    const volume=page.locator('[data-v324-factor="2|volumeFactor"]');
    await expect(volume).toHaveValue('1.2');
    await volume.fill('1.3');
    await volume.dispatchEvent('change');
    const after=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const p=window.EL_ERRANTE_FINANCE_V324.projections(data,0).scenarios[2];
      return {factor:data.scenarios[2].volumeFactor,plan:JSON.stringify(data.planSales),cash:JSON.stringify(data.cashFlow),actual:JSON.stringify(window.EL_ERRANTE_FINANCE_V31.actual('2026-08')),scenarioSales:p.totals.sales};
    });
    expect(after.factor).toBe(1.3);
    expect(after.plan).toBe(before.plan);
    expect(after.cash).toBe(before.cash);
    expect(after.actual).toBe(before.actual);
    expect(after.scenarioSales).toBe(1560000);
    const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]'));
    expect(history.some(h=>h.label==='Escenario financiero modificado')).toBe(true);
  });

  test('crea un escenario neutro sin contaminar el plan de trabajo',async({page})=>{
    await seed(page);await openScenarios(page);
    const before=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();return {count:data.scenarios.length,plan:JSON.stringify(data.planSales),cash:JSON.stringify(data.cashFlow)};
    });
    await page.getByRole('button',{name:'Nuevo escenario',exact:true}).click();
    const after=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();const row=data.scenarios.at(-1);return {count:data.scenarios.length,row,plan:JSON.stringify(data.planSales),cash:JSON.stringify(data.cashFlow),history:JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]')};
    });
    expect(after.count).toBe(before.count+1);
    expect(after.row.volumeFactor).toBe(1);
    expect(after.row.priceFactor).toBe(1);
    expect(after.row.directCostFactor).toBe(1);
    expect(after.row.opexFactor).toBe(1);
    expect(after.row.purchaseFactor).toBe(1);
    expect(after.row.collectionFactor).toBe(1);
    expect(after.plan).toBe(before.plan);
    expect(after.cash).toBe(before.cash);
    expect(after.history.some(h=>h.label==='Escenario creado')).toBe(true);
  });

  test('maneja un modelo sin escenarios y permite crear el primero',async({page})=>{
    await seed(page);await openScenarios(page);
    const before=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const plan=JSON.stringify(data.planSales),cash=JSON.stringify(data.cashFlow);
      data.scenarios=[];
      localStorage.setItem('ee_v31_finance_working_model',JSON.stringify(data));
      sessionStorage.removeItem('ee_v324_scenario_selected');
      return {plan,cash};
    });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-finance-scenario-version','3.2.4');
    await page.getByRole('button',{name:'Escenarios',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Aún no hay escenarios editables.'})).toBeVisible();
    await expect(page.locator('[data-v324-factor]')).toHaveCount(0);
    await expect(page.locator('.v324-scenario-card')).toHaveCount(1);
    await page.getByRole('button',{name:'Crear primer escenario',exact:true}).click();
    const after=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();return {count:data.scenarios.length,row:data.scenarios[0],plan:JSON.stringify(data.planSales),cash:JSON.stringify(data.cashFlow)};
    });
    expect(after.count).toBe(1);
    expect(after.row.volumeFactor).toBe(1);
    expect(after.row.priceFactor).toBe(1);
    expect(after.plan).toBe(before.plan);
    expect(after.cash).toBe(before.cash);
  });

  test('las tablas comparativas tienen scroll interno y no ensanchan el documento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openScenarios(page);
    const geometry=await page.evaluate(()=>{
      const boxes=sel=>{const el=document.querySelector(sel),r=el.getBoundingClientRect();return {left:r.left,right:r.right,overflow:el.scrollWidth-el.clientWidth};};
      const gridLine=document.querySelector('line.v324-grid');
      return {docOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:innerWidth,comparison:boxes('.v324-comparison-wrap'),monthly:boxes('.v324-monthly-wrap'),chartWidth:document.querySelector('.v324-chart').getBoundingClientRect().width,gridDisplay:getComputedStyle(gridLine).display};
    });
    expect(geometry.docOverflow).toBeLessThanOrEqual(2);
    for(const box of [geometry.comparison,geometry.monthly]){
      expect(box.left).toBeGreaterThanOrEqual(-2);
      expect(box.right).toBeLessThanOrEqual(geometry.viewport+2);
      expect(box.overflow).toBeGreaterThan(0);
    }
    expect(geometry.chartWidth).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.gridDisplay).not.toBe('grid');
  });
});
