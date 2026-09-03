const {test,expect}=require('@playwright/test');

async function seed(page,{missingCost=false,cashCount=true,pending=true}={}){
  await page.clock.setFixedTime(new Date('2026-08-15T12:00:00-05:00'));
  await page.addInitScript(({missingCost,cashCount,pending})=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'EE-MAR-01',quantity:10,unitPrice:10000,sales:100000,unitCost:4000,cogs:40000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i===0?1000000:0,salesCash:80000,purchases:20000,operatingExpenses:10000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:5000,capex:0,endingCash:i===0?1045000:1100000,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.8',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'EE-MAR-01',name:'Margherita',category:'Pizza',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow,scenarios:[{name:'Base',volumeFactor:1,priceFactor:1,directCostFactor:1,opexFactor:1,purchaseFactor:1,collectionFactor:1,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:800000,unit:'COP',status:'CONFIRMADO'}],decisions:[],pending:pending?[{name:'Validar empaque',priority:'MEDIA',status:'PENDIENTE',decisionRecommended:'Confirmar costo'}]:[]}));
    const item={productId:'EE-MAR-01',name:'Margherita',quantity:2};if(!missingCost)item.unit_cost_snapshot=4000;
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'ORD-328',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[item]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([]));
    localStorage.setItem('ee_v323_cash_counts',JSON.stringify(cashCount?[{id:'CASH-328',month:'2026-08',date:'2026-08-08',amount:900000,evidence:'CONFIRMADO',createdAt:'2026-08-08T15:00:00Z'}]:[]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({}));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify([]));
    localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([]));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v31_finance_history');
    sessionStorage.setItem('ee_v31_finance_tab','dashboard');
    sessionStorage.setItem('ee_v327_executive_month','2026-08');
  },{missingCost,cashCount,pending});
}

async function open(page){await page.goto('/finanzas.html');await expect(page.locator('html')).toHaveAttribute('data-finance-readiness-version','3.2.8');await expect(page.getByRole('heading',{name:/para 2026-08/})).toBeVisible();}

test.describe('Preparación del dato financiero V3.2.8',()=>{
  test('consolida controles sin mutar el modelo ni los hechos',async({page})=>{
    await seed(page);await open(page);
    const before=await page.evaluate(()=>({working:JSON.stringify(window.EL_ERRANTE_FINANCE_V31.working()),orders:localStorage.getItem('ee_v14_orders'),cash:localStorage.getItem('ee_v323_cash_counts')}));
    const r=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V328.readiness(window.EL_ERRANTE_FINANCE_V31.working(),'2026-08'));
    expect(r.checks).toHaveLength(6);expect(r.checks.find(x=>x.label==='Plan mensual listo')?.tone).toBe('good');expect(r.checks.find(x=>x.label==='COGS histórico trazable')?.tone).toBe('good');expect(r.checks.find(x=>x.label==='Caja observada respaldada')?.tone).toBe('good');expect(r.checks.find(x=>x.label==='Auditoría MFO con pendientes')?.tone).toBe('warn');
    const after=await page.evaluate(()=>({working:JSON.stringify(window.EL_ERRANTE_FINANCE_V31.working()),orders:localStorage.getItem('ee_v14_orders'),cash:localStorage.getItem('ee_v323_cash_counts')}));
    expect(after).toEqual(before);
  });

  test('mantiene visibles faltantes reales de COGS y caja',async({page})=>{
    await seed(page,{missingCost:true,cashCount:false,pending:false});await open(page);
    const r=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V328.readiness(window.EL_ERRANTE_FINANCE_V31.working(),'2026-08'));
    expect(r.state).toBe('bloqueado');expect(r.checks.find(x=>x.label==='COGS histórico incompleto')?.tone).toBe('bad');expect(r.checks.find(x=>x.label==='Falta conteo de caja')?.tone).toBe('warn');
    await page.locator('.v328-details').evaluate(el=>el.open=true);
    await expect(page.getByText('COGS histórico incompleto',{exact:true})).toBeVisible();
  });

  test('un mes futuro no convierte falta de hechos en error',async({page})=>{
    await seed(page,{cashCount:false,pending:false});await open(page);
    const r=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V328.readiness(window.EL_ERRANTE_FINANCE_V31.working(),'2026-09'));
    expect(r.future).toBe(true);expect(r.checks.find(x=>x.label==='COGS histórico aún no aplica')?.tone).toBe('neutral');expect(r.checks.find(x=>x.label==='Conteo de caja aún no aplica')?.tone).toBe('neutral');
  });

  test('abre las superficies certificadas desde cada control',async({page})=>{
    await seed(page);await open(page);await page.locator('.v328-details').evaluate(el=>el.open=true);
    await page.locator('[data-v328-go="model"]').click();await expect(page.locator('[data-section="model"]')).toHaveClass(/active/);
    await page.evaluate(()=>{sessionStorage.setItem('ee_v31_finance_tab','dashboard');location.reload();});
    await expect(page.locator('html')).toHaveAttribute('data-finance-readiness-version','3.2.8');await page.locator('.v328-details').evaluate(el=>el.open=true);
    await page.locator('[data-v328-go="plan"]').click();await expect(page.locator('[data-section="plan"]')).toHaveClass(/active/);
  });

  test('no genera overflow horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await open(page);await page.locator('.v328-details').evaluate(el=>el.open=true);
    const g=await page.evaluate(()=>{const r=document.querySelector('[data-v328-readiness]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(g.overflow).toBeLessThanOrEqual(2);expect(g.left).toBeGreaterThanOrEqual(-2);expect(g.right).toBeLessThanOrEqual(g.viewport+2);
  });
});
