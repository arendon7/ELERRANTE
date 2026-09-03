const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.clock.setFixedTime(new Date('2026-08-15T12:00:00-05:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'EE-MAR-01',quantity:10,unitPrice:10000,sales:100000,unitCost:4000,cogs:40000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i===0?1000000:0,salesCash:80000,purchases:20000,operatingExpenses:10000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:5000,capex:0,endingCash:i===0?1045000:1100000,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.7',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'EE-MAR-01',name:'Margherita',category:'Pizza',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow,scenarios:[{name:'Base',volumeFactor:1,priceFactor:1,directCostFactor:1,opexFactor:1,purchaseFactor:1,collectionFactor:1,status:'ESTIMADO'},{name:'Conservador',volumeFactor:.8,priceFactor:.98,directCostFactor:1.1,opexFactor:1,purchaseFactor:.9,collectionFactor:.9,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:1200000,unit:'COP',status:'CONFIRMADO'}],decisions:[{id:'D1',name:'Contratar apoyo',configuredMonth:1,recommendedMonth:1,differenceMonths:0,decisionState:'PENDIENTE',condition:'Carga sostenida',impact:'OPEX',suggestedAction:'Evaluar',status:'INFERIDO'}],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'ORD-327',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',delivery:{requestedDate:'2026-08-12'},total:60000,items:[{productId:'EE-MAR-01',name:'Margherita',quantity:2,unit_cost_snapshot:4000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'MOV-327',date:'2026-08-08',type:'operating_expense',amount:5000},{id:'MOV-327-P',date:'2026-08-08',type:'inventory_purchase',amount:9000}]));
    localStorage.setItem('ee_v323_cash_counts',JSON.stringify([{id:'CASH-327',month:'2026-08',date:'2026-08-08',amount:900000,evidence:'CONFIRMADO',createdAt:'2026-08-08T15:00:00Z'}]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({}));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([]));
    localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([]));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v31_finance_history');
    sessionStorage.setItem('ee_v31_finance_tab','dashboard');
    sessionStorage.setItem('ee_v327_executive_month','2026-08');
  });
}

async function open(page){await page.goto('/finanzas.html');await expect(page.locator('html')).toHaveAttribute('data-finance-executive-version','3.2.7');await expect(page.getByRole('heading',{name:'Lo importante primero.'})).toBeVisible();}

test.describe('Resumen ejecutivo V3.2.7',()=>{
  test('sintetiza fuentes certificadas sin crear cifras paralelas',async({page})=>{
    await seed(page);await open(page);
    const s=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return window.EL_ERRANTE_FINANCE_V327.summary(d,'2026-08');});
    expect(s.salesPlan).toBe(100000);expect(s.realSales).toBe(60000);expect(s.salesCoverage).toBe(.6);expect(s.realMargin).toBe(52000);
    expect(s.observedCash).toBe(900000);expect(s.minimum).toBe(1200000);expect(s.decisions.now).toBe(1);expect(s.scenarios.count).toBe(2);
    expect(s.alerts.some(a=>a.title==='Caja observada bajo mínimo')).toBe(true);
    await expect(page.locator('.v327-metric')).toHaveCount(8);
  });

  test('mes futuro no presenta real como cero',async({page})=>{
    await seed(page);await open(page);
    await page.locator('[data-v327-month]').selectOption('2026-09');
    const s=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V327.summary(window.EL_ERRANTE_FINANCE_V31.working(),'2026-09'));
    expect(s.future).toBe(true);expect(s.realSales).toBeNull();expect(s.realMargin).toBeNull();
    await expect(page.locator('.v327-metric').filter({hasText:'Ventas plan'})).toContainText('Real no disponible todavía');
  });

  test('navega a detalle sin mutar plan, hechos o decisiones',async({page})=>{
    await seed(page);await open(page);
    const before=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {working:JSON.stringify(d),orders:localStorage.getItem('ee_v14_orders'),moves:localStorage.getItem('ee_v27_finance_movements')};});
    await page.locator('[data-v327-go="procurement"]').first().click();
    await expect(page.locator('.v326-section')).toHaveClass(/active/);
    await page.getByRole('button',{name:'Dashboard',exact:true}).click();
    await page.locator('[data-v327-go="decisions"]').first().click();
    await expect(page.locator('[data-section="decisions"]')).toHaveClass(/active/);
    const after=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {working:JSON.stringify(d),orders:localStorage.getItem('ee_v14_orders'),moves:localStorage.getItem('ee_v27_finance_movements')};});
    expect(after.working).toBe(before.working);expect(after.orders).toBe(before.orders);expect(after.moves).toBe(before.moves);
  });

  test('no desborda el documento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await open(page);
    const g=await page.evaluate(()=>{const r=document.querySelector('[data-v327-executive]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(g.overflow).toBeLessThanOrEqual(2);expect(g.left).toBeGreaterThanOrEqual(-2);expect(g.right).toBeLessThanOrEqual(g.viewport+2);
  });
});
