const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map((month,i)=>({month,sku:'SKU-TEST',quantity:10+i,unitPrice:10000,sales:(10+i)*10000,unitCost:4000,cogs:(10+i)*4000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i?0:2000000,salesCash:(10+i)*10000,purchases:25000,operatingExpenses:20000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'SKU-TEST',name:'Pizza prueba',category:'Pizza',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow,scenarios:[{name:'Base',volumeFactor:1,directCostFactor:1,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V32-001',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[{productId:'SKU-TEST',name:'Pizza prueba',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([
      {id:'M1',date:'2026-08-08',type:'inventory_purchase',amount:15000,evidence:'CONFIRMADO'},
      {id:'M2',date:'2026-08-08',type:'operating_expense',amount:5000,evidence:'CONFIRMADO'}
    ]));
  });
}

test.describe('Profundidad financiera V3.2',()=>{
  test('construye cierre mensual sin mezclar plan y real',async({page})=>{
    await seed(page);await page.goto('/finanzas.html');
    await expect(page.locator('html')).toHaveAttribute('data-finance-depth-version','3.2.0');
    await expect(page.getByText('Pulso · 2026-08')).toBeVisible();
    await page.getByRole('button',{name:'Ver cierre mensual'}).click();
    await expect(page.getByRole('heading',{name:'Un mes, una lectura para decidir.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Punto de equilibrio'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Calidad de costos'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Liquidez y alertas'})).toBeVisible();
    const close=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const out=window.EL_ERRANTE_FINANCE_V32.closeData(data,'2026-08');
      return {planSales:out.plan.sales,planCogs:out.plan.cogs,realSales:out.a.sales,realCogs:out.a.cogs,realPurchases:out.a.purchases,realOpex:out.a.opex,ratio:out.be.ratio,breakEven:out.be.revenue,confirmed:out.quality.confirmed};
    });
    expect(close.planSales).toBe(100000);
    expect(close.planCogs).toBe(40000);
    expect(close.realSales).toBe(60000);
    expect(close.realCogs).toBe(24000);
    expect(close.realPurchases).toBe(15000);
    expect(close.realOpex).toBe(5000);
    expect(close.ratio).toBeCloseTo(.6,5);
    expect(close.breakEven).toBeCloseTo(33333.333,0);
    expect(close.confirmed).toBe(1);
  });

  test('expone calidad de costo y semáforo de liquidez en los editores existentes',async({page})=>{
    await seed(page);await page.goto('/finanzas.html');
    await page.getByRole('button',{name:'Productos y costos'}).click();
    await expect(page.locator('[data-v32-quality]')).toContainText('1/1 costos confirmados');
    await page.getByRole('button',{name:'Gastos y caja'}).click();
    await expect(page.locator('[data-v32-cash]')).toContainText('Caja final planificada');
    await expect(page.locator('[data-v32-cash]')).toContainText('Política mínima');
  });

  test('el cierre V3.2 no desborda horizontalmente en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await page.goto('/finanzas.html');
    await page.getByRole('button',{name:'Cierre mensual'}).click();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
