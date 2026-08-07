const {test,expect}=require('@playwright/test');

async function seed(page,{moves=[]}={}){
  await page.addInitScript(({moves})=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-FIN-001',status:'approved',createdAt:'2026-08-06T10:00:00.000Z',total:50000,
      items:[{productId:'la-errante',name:'La Errante',quantity:2,unitCost:10000}]
    }]));
    localStorage.setItem('ee_v14_products',JSON.stringify({
      'la-errante':{price:25000,unitCost:10000,inventory:20,active:true}
    }));
    localStorage.setItem('ee_v14_fixed_costs',JSON.stringify([{id:'fijo',label:'Gasto fijo de prueba',amount:10000}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify(moves));
    localStorage.setItem('ee_v27_finance_settings',JSON.stringify({openingCash:2000000,minimumCash:1000000,salesCashRate:100,costStatuses:{'la-errante':'CONFIRMADO'}}));
  },{moves});
}

async function openFinance(page){
  await page.goto('/admin.html');
  const panel=page.locator('#finance-v27');
  await expect(panel.getByRole('heading',{name:'Control financiero sin convertir la web en contabilidad.'})).toBeVisible();
  await panel.locator('#ee-v27-month').fill('2026-08');
  return panel;
}

function metric(panel,label){
  return panel.locator('.ee-v27-metric').filter({hasText:label});
}

test.describe('Finanzas operativas V2.7',()=>{
  test('calcula ventas, costo, resultado y caja sin mezclar compras con COGS',async({page})=>{
    await seed(page,{moves:[
      {id:'M1',date:'2026-08-05',type:'operating_expense',amount:5000,evidence:'CONFIRMADO',description:'Mensajería'},
      {id:'M2',date:'2026-08-05',type:'inventory_purchase',amount:30000,evidence:'CONFIRMADO',description:'Harina'},
      {id:'M3',date:'2026-08-05',type:'capital_contribution',amount:100000,evidence:'CONFIRMADO',description:'Aporte'}
    ]});
    const panel=await openFinance(page);
    await expect(metric(panel,'Ventas aprobadas')).toContainText('$ 50.000');
    await expect(metric(panel,'Costo de ventas')).toContainText('$ 20.000');
    await expect(metric(panel,'Resultado operativo')).toContainText('$ 15.000');
    await expect(metric(panel,'Caja estimada')).toContainText('$ 2.105.000');
  });

  test('una compra de inventario reduce caja pero no el resultado operativo',async({page})=>{
    await seed(page,{moves:[{id:'M1',date:'2026-08-05',type:'inventory_purchase',amount:30000,evidence:'CONFIRMADO'}]});
    const panel=await openFinance(page);
    await expect(metric(panel,'Resultado operativo')).toContainText('$ 20.000');
    await expect(metric(panel,'Caja estimada')).toContainText('$ 2.010.000');
  });

  test('registra un movimiento con evidencia y recalcula el mes',async({page})=>{
    await seed(page);
    const panel=await openFinance(page);
    await panel.getByText('Gastos y caja').click();
    const form=panel.locator('#ee-v27-movement-form');
    await form.locator('input[name="date"]').fill('2026-08-07');
    await form.locator('select[name="type"]').selectOption('capex');
    await form.locator('input[name="amount"]').fill('200000');
    await form.locator('input[name="description"]').fill('Selladora al vacío');
    await expect(form.locator('input[name="amount"]')).toHaveAttribute('step','1');
    await form.getByRole('button',{name:'Registrar movimiento'}).click();
    await expect(panel.getByText('Movimiento registrado. Caja y resultados fueron recalculados.')).toBeVisible();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v27_finance_movements')||'[]'));
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('capex');
    expect(stored[0].amount).toBe(200000);
  });

  test('mantiene el detalle plegado y evita desbordamiento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);
    const panel=await openFinance(page);
    await expect(panel.locator('details')).toHaveCount(4);
    for(const detail of await panel.locator('details').all())await expect(detail).not.toHaveAttribute('open','');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(page.locator('html')).toHaveAttribute('data-finance-version','2.7.0');
  });

  test('los activos financieros no exponen secretos de servidor',async({request})=>{
    for(const path of ['/assets/finance-v27.js','/assets/finance-v27.css']){
      const response=await request.get(path);expect(response.ok()).toBeTruthy();
      const body=(await response.text()).toLowerCase();
      expect(body).not.toContain('service_role');
      expect(body).not.toContain('postgres://');
    }
  });
});
