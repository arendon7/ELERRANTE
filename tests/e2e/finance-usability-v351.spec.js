const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    if(sessionStorage.getItem('ee_v351_test_seeded')==='1')return;
    const months=['2026-08','2026-09'];
    const planSales=months.flatMap(month=>[
      {month,sku:'PIZZA-G',quantity:month==='2026-08'?10:12,unitPrice:25000,sales:(month==='2026-08'?10:12)*25000,unitCost:12000,cogs:(month==='2026-08'?10:12)*12000,status:'CONFIRMADO'},
      {month,sku:'PIZZA-P',quantity:month==='2026-08'?8:9,unitPrice:17000,sales:(month==='2026-08'?8:9)*17000,unitCost:8500,cogs:(month==='2026-08'?8:9)*8500,status:'ESTIMADO'}
    ]);
    const cashFlow=months.map(month=>({month,openingCash:2000000,salesCash:month==='2026-08'?300000:350000,purchases:50000,operatingExpenses:60000,auxiliaryPayroll:10000,juanCash:0,taxReserve:10000,rent:0,capex:0,endingCash:2170000,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.5.1',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'PIZZA-G',name:'Pizza grande',category:'Pizza',price:25000,directCost:12000,status:'CONFIRMADO'},{sku:'PIZZA-P',name:'Pizza pequeña',category:'Pizza',price:17000,directCost:8500,status:'ESTIMADO'}],cashFlow,scenarios:[],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-REAL-1',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:50000,items:[{productId:'PIZZA-G',name:'Pizza grande',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'MOV-BASE',date:'2026-08-08',type:'operating_expense',amount:20000,evidence:'CONFIRMADO',description:'Gas'}]));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v323_cash_counts');
    localStorage.removeItem('ee_v351_finance_view');
    sessionStorage.setItem('ee_v351_finance_month','2026-08');
    sessionStorage.setItem('ee_v351_test_seeded','1');
  });
}

async function openDesk(page){
  await seed(page);
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-usability-version','3.5.1');
  await expect(page.locator('[data-finance-usability-v351]')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Trabajar con números sin perderse en el modelo.'})).toBeVisible();
}

test.describe('Mesa financiera V3.5.1',()=>{
  test('presenta una lectura mensual clara sin ocultar la profundidad existente',async({page})=>{
    await openDesk(page);
    await expect(page.locator('#v351-month')).toHaveValue('2026-08');
    await expect(page.getByText('Ventas plan',{exact:true})).toBeVisible();
    await expect(page.getByText('Ventas reales',{exact:true})).toBeVisible();
    await expect(page.locator('#finance-workbench-v31')).toBeVisible();
    await expect(page.locator('#v351-plan .v351-table tbody tr')).toHaveCount(2);
  });

  test('edita plan, precio y costo directamente en la tabla y recalcula el modelo',async({page})=>{
    await openDesk(page);
    await page.locator('[data-v351-plan-qty="PIZZA-G"]').fill('20');
    await page.locator('[data-v351-plan-qty="PIZZA-G"]').blur();
    await expect.poll(async()=>page.evaluate(()=>window.EL_ERRANTE_FINANCE_V31.working().planSales.find(r=>r.sku==='PIZZA-G'&&r.month==='2026-08').quantity)).toBe(20);

    await page.locator('[data-v351-price="PIZZA-G"]').fill('27000');
    await page.locator('[data-v351-price="PIZZA-G"]').blur();
    await page.locator('[data-v351-cost="PIZZA-G"]').fill('13000');
    await page.locator('[data-v351-cost="PIZZA-G"]').blur();

    const state=await page.evaluate(()=>{const data=window.EL_ERRANTE_FINANCE_V31.working(),p=data.productCosts.find(r=>r.sku==='PIZZA-G'),row=data.planSales.find(r=>r.sku==='PIZZA-G'&&r.month==='2026-08'),history=JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]');return {price:p.price,cost:p.directCost,sales:row.sales,cogs:row.cogs,history:history.map(x=>x.label)};});
    expect(state.price).toBe(27000);
    expect(state.cost).toBe(13000);
    expect(state.sales).toBe(540000);
    expect(state.cogs).toBe(260000);
    expect(state.history.some(x=>x.includes('mesa financiera'))).toBe(true);
  });

  test('registra caja observada preservando el histórico',async({page})=>{
    await openDesk(page);
    const form=page.locator('#v351-count-form');
    await form.locator('[name="date"]').fill('2026-08-08');
    await form.locator('[name="amount"]').fill('1980000');
    await form.locator('[name="note"]').fill('Conteo desde mesa clara');
    await form.getByRole('button',{name:'Registrar conteo'}).click();
    const counts=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V323.allCounts());
    expect(counts).toHaveLength(1);
    expect(counts[0].amount).toBe(1980000);
    expect(counts[0].note).toBe('Conteo desde mesa clara');
    await expect(page.locator('.v351-current-count')).toContainText('1.980.000');
  });

  test('agrega y corrige movimientos desde la tabla sin reescribir el original',async({page})=>{
    await openDesk(page);
    await page.locator('#v351-new-date').fill('2026-08-09');
    await page.locator('#v351-new-type').selectOption('inventory_purchase');
    await page.locator('#v351-new-amount').fill('45000');
    await page.locator('#v351-new-description').fill('Mozzarella');
    await page.locator('#v351-add-move').click();
    let rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v27_finance_movements')||'[]'));
    const created=rows.find(r=>r.description==='Mozzarella');
    expect(created).toBeTruthy();
    expect(created.amount).toBe(45000);

    const tr=page.locator(`[data-v351-move="${created.id}"]`);
    await tr.locator('[data-v351-move-amount]').fill('47000');
    await tr.locator('[data-v351-move-description]').fill('Mozzarella corregida');
    await tr.locator('[data-v351-move-reason]').fill('Factura final');
    await tr.getByRole('button',{name:'Guardar ajuste'}).click();

    rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v27_finance_movements')||'[]'));
    const original=rows.find(r=>r.id===created.id),reversal=rows.find(r=>r.reversalOf===created.id),correction=rows.find(r=>r.corrects===created.id);
    expect(original.amount).toBe(45000);
    expect(reversal).toBeTruthy();
    expect(correction.amount).toBe(47000);
    expect(correction.description).toBe('Mozzarella corregida');
    expect(correction.auditReason).toBe('Factura final');
  });

  test('mantiene la mesa contenida en móvil y permite abrir el modelo avanzado',async({page},testInfo)=>{
    await openDesk(page);
    await page.getByRole('button',{name:'Modelo avanzado'}).click();
    await expect(page.locator('body')).toHaveAttribute('data-finance-view','advanced');
    await expect(page.locator('#finance-workbench-v31')).toBeVisible();
    if(testInfo.project.name.includes('mobile')){
      const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,desk:document.querySelector('#finance-usability-v351').getBoundingClientRect().width,viewport:innerWidth}));
      expect(geometry.overflow).toBeLessThanOrEqual(2);
      expect(geometry.desk).toBeLessThanOrEqual(geometry.viewport+2);
    }
  });
});
