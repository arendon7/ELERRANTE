const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    sessionStorage.setItem('ee_v31_finance_month','2026-08');
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map((month,i)=>({month,sku:'SKU-TEST',quantity:10+i,unitPrice:10000,sales:(10+i)*10000,unitCost:4000,cogs:(10+i)*4000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i?0:2000000,salesCash:(10+i)*10000,purchases:25000,operatingExpenses:20000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.1',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'SKU-TEST',name:'Pizza prueba',category:'Pizza',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow,scenarios:[{name:'Base',volumeFactor:1,directCostFactor:1,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V321-001',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[{productId:'SKU-TEST',name:'Pizza prueba',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([
      {id:'PUR-1',date:'2026-08-08',type:'inventory_purchase',amount:15000,evidence:'CONFIRMADO',description:'Compra inicial',createdAt:'2026-08-08T14:00:00.000Z'},
      {id:'OPEX-1',date:'2026-08-08',type:'operating_expense',amount:5000,evidence:'CONFIRMADO',description:'Servicio inicial',createdAt:'2026-08-08T15:00:00.000Z'}
    ]));
  });
}

async function openCash(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-ledger-version','3.2.1');
  await page.getByRole('button',{name:'Gastos y caja',exact:true}).click();
  await expect(page.getByText('Libro de movimientos · V3.2.1')).toBeVisible();
  await expect(page.getByText('Sin borrado',{exact:true})).toBeVisible();
}

test.describe('Movimientos financieros trazables V3.2.1',()=>{
  test('corrige un gasto mediante reversión + nuevo movimiento sin borrar el original',async({page})=>{
    await seed(page);await openCash(page);
    const original=page.locator('[data-v321-move="OPEX-1"]');
    await expect(original).toContainText('Vigente');
    await original.getByRole('button',{name:'Corregir / reversar',exact:true}).click();
    const dialog=page.locator('#v321-correction-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Servicio inicial');
    await dialog.locator('[name="reason"]').fill('Factura ajustada');
    await dialog.locator('[name="amount"]').fill('3500');
    await dialog.locator('[name="description"]').fill('Servicio corregido');
    await dialog.getByRole('button',{name:'Guardar ajuste trazable',exact:true}).click();
    await expect(dialog).not.toBeVisible();

    const state=await page.evaluate(()=>{
      const moves=JSON.parse(localStorage.getItem('ee_v27_finance_movements')||'[]');
      const original=moves.find(m=>m.id==='OPEX-1');
      const reversal=moves.find(m=>m.reversalOf==='OPEX-1');
      const correction=moves.find(m=>m.corrects==='OPEX-1');
      const actual=window.EL_ERRANTE_FINANCE_V31.actual('2026-08');
      const close=window.EL_ERRANTE_FINANCE_V32.closeData(window.EL_ERRANTE_FINANCE_V31.working(),'2026-08');
      return {count:moves.length,original,reversal,correction,actualOpex:actual.opex,closeOpex:close.a.opex};
    });
    expect(state.count).toBe(4);
    expect(state.original.amount).toBe(5000);
    expect(state.original.description).toBe('Servicio inicial');
    expect(state.reversal.amount).toBe(-5000);
    expect(state.reversal.correctionBatchId).toBe(state.correction.correctionBatchId);
    expect(state.correction.amount).toBe(3500);
    expect(state.correction.description).toBe('Servicio corregido');
    expect(state.actualOpex).toBe(3500);
    expect(state.closeOpex).toBe(3500);
    await expect(page.locator('[data-v321-move="OPEX-1"]')).toContainText('Reversado');
    await expect(page.locator('[data-v321-move="OPEX-1"]')).not.toContainText('Corregir / reversar');
    await expect(page.locator('.v321-move').filter({hasText:'Servicio corregido'})).toContainText('Corrección');
    await expect(page.locator('.v321-move').filter({hasText:'Factura ajustada'})).toContainText('Reversión');
  });

  test('permite reversar una compra sin reemplazo y el real netea a cero',async({page})=>{
    await seed(page);await openCash(page);
    await page.locator('[data-v321-move="PUR-1"]').getByRole('button',{name:'Corregir / reversar',exact:true}).click();
    const dialog=page.locator('#v321-correction-dialog');
    await dialog.locator('[name="mode"]').selectOption('reverse');
    await dialog.locator('[name="reason"]').fill('Compra anulada');
    await dialog.getByRole('button',{name:'Guardar ajuste trazable',exact:true}).click();
    const state=await page.evaluate(()=>{
      const moves=JSON.parse(localStorage.getItem('ee_v27_finance_movements')||'[]');
      return {moves,actual:window.EL_ERRANTE_FINANCE_V31.actual('2026-08')};
    });
    expect(state.moves.find(m=>m.id==='PUR-1').amount).toBe(15000);
    expect(state.moves.filter(m=>m.reversalOf==='PUR-1')).toHaveLength(1);
    expect(state.moves.filter(m=>m.corrects==='PUR-1')).toHaveLength(0);
    expect(state.actual.purchases).toBe(0);
    await expect(page.locator('[data-v321-move="PUR-1"]')).toContainText('Reversado');
    await expect(page.locator('.v321-ledger-rule')).toContainText('no se elimina');
  });

  test('libro y diálogo no generan desborde horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openCash(page);
    await page.locator('[data-v321-move="OPEX-1"]').getByRole('button',{name:'Corregir / reversar',exact:true}).click();
    await expect(page.locator('#v321-correction-dialog')).toBeVisible();
    const geometry=await page.evaluate(()=>({pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,dialogWidth:document.getElementById('v321-correction-dialog').getBoundingClientRect().width,viewport:window.innerWidth}));
    expect(geometry.pageOverflow).toBeLessThanOrEqual(2);
    expect(geometry.dialogWidth).toBeLessThanOrEqual(geometry.viewport-10);
  });
});
