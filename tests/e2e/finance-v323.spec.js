const {test,expect}=require('@playwright/test');

async function seed(page){
  await page.clock.setFixedTime(new Date('2026-08-15T12:00:00-05:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    if(sessionStorage.getItem('ee_v323_test_seeded')==='1')return;
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'SKU-CASH',quantity:month==='2026-08'?10:month==='2026-09'?12:0,unitPrice:10000,sales:month==='2026-08'?100000:month==='2026-09'?120000:0,unitCost:4000,cogs:month==='2026-08'?40000:month==='2026-09'?48000:0,status:'ESTIMADO'}));
    const cashFlow=months.map(month=>month==='2026-08'?{month,openingCash:2000000,salesCash:80000,purchases:25000,operatingExpenses:20000,auxiliaryPayroll:5000,juanCash:0,taxReserve:0,rent:10000,capex:0,endingCash:2020000,status:'ESTIMADO'}:month==='2026-09'?{month,openingCash:2020000,salesCash:100000,purchases:30000,operatingExpenses:20000,auxiliaryPayroll:5000,juanCash:0,taxReserve:0,rent:10000,capex:0,endingCash:2055000,status:'ESTIMADO'}:{month,openingCash:0,salesCash:0,purchases:0,operatingExpenses:0,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO'});
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.3',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'SKU-CASH',name:'Producto caja',category:'Prueba',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow,scenarios:[],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]}));
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EE-V323-001',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[{productId:'SKU-CASH',name:'Producto caja',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([
      {id:'CAP-1',date:'2026-08-08',type:'capital_contribution',amount:100000,evidence:'CONFIRMADO',description:'Aporte'},
      {id:'INC-1',date:'2026-08-08',type:'other_income',amount:20000,evidence:'CONFIRMADO',description:'Otro ingreso'},
      {id:'PUR-1',date:'2026-08-08',type:'inventory_purchase',amount:15000,evidence:'CONFIRMADO',description:'Compra'},
      {id:'OPEX-1',date:'2026-08-08',type:'operating_expense',amount:5000,evidence:'CONFIRMADO',description:'Gasto'},
      {id:'CAPEX-1',date:'2026-08-08',type:'capex',amount:10000,evidence:'CONFIRMADO',description:'Equipo'},
      {id:'OWN-1',date:'2026-08-08',type:'owner_withdrawal',amount:2000,evidence:'CONFIRMADO',description:'Retiro'}
    ]));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v323_cash_counts');
    sessionStorage.setItem('ee_v323_cash_month','2026-08');
    sessionStorage.setItem('ee_v323_cash_year','0');
    sessionStorage.setItem('ee_v323_test_seeded','1');
  });
}

async function openCashTrends(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-cash-version','3.2.3');
  await page.locator('[data-v323-cash="1"]').click();
  await expect(page.getByRole('heading',{name:'Ver la trayectoria, no solo el cierre.'})).toBeVisible();
}

test.describe('Caja y tendencias V3.2.3',()=>{
  test('separa caja plan, movimientos registrados y ventas no presumidas como cobro',async({page})=>{
    await seed(page);await openCashTrends(page);
    const state=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();
      const bridge=window.EL_ERRANTE_FINANCE_V323.planBridge(data,'2026-08');
      const flow=window.EL_ERRANTE_FINANCE_V323.recordedFlow('2026-08');
      const rows=window.EL_ERRANTE_FINANCE_V323.trendData(data,0);
      return {ending:bridge.at(-1).end,flow,trend:rows[0],future:rows[1]};
    });
    expect(state.ending).toBe(2020000);
    expect(state.flow.contribution).toBe(100000);
    expect(state.flow.otherIncome).toBe(20000);
    expect(state.flow.purchases).toBe(15000);
    expect(state.flow.opex).toBe(5000);
    expect(state.flow.capex).toBe(10000);
    expect(state.flow.withdrawals).toBe(2000);
    expect(state.flow.net).toBe(88000);
    expect(state.flow.salesRegistered).toBe(60000);
    expect(state.trend.planSales).toBe(100000);
    expect(state.trend.realSales).toBe(60000);
    expect(state.trend.planMargin).toBe(60000);
    expect(state.trend.realMargin).toBe(36000);
    expect(state.trend.planOpex).toBe(35000);
    expect(state.trend.realOpex).toBe(5000);
    expect(state.trend.planCash).toBe(2020000);
    expect(state.trend.observedCash).toBeNull();
    expect(state.future.month).toBe('2026-09');
    expect(state.future.isFuture).toBe(true);
    expect(state.future.realSales).toBeNull();
    expect(state.future.realMargin).toBeNull();
    expect(state.future.realOpex).toBeNull();
    await expect(page.getByText('Se muestran aparte porque una venta registrada no prueba por sí sola que el efectivo haya sido cobrado.')).toBeVisible();
    await expect(page.getByText('Cobertura ventas YTD',{exact:true})).toBeVisible();
    await expect(page.locator('.v323-chart')).toHaveCount(4);
  });

  test('registra conteos sin sobreescribir el histórico y calcula la brecha contra el plan',async({page},testInfo)=>{
    await seed(page);await openCashTrends(page);
    const form=page.locator('#v323-count-form');
    await form.locator('[name="amount"]').fill('1950000');
    await form.locator('[name="note"]').fill('Cierre físico inicial');
    const submit=form.getByRole('button',{name:'Registrar observación',exact:true});
    if(testInfo.project.name.includes('mobile')){
      await submit.scrollIntoViewIfNeeded();
      const hit=await submit.evaluate(el=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const r=el.getBoundingClientRect();const x=Math.min(innerWidth-2,Math.max(2,r.left+r.width/2));const y=Math.min(innerHeight-2,Math.max(2,r.top+r.height/2));const target=document.elementFromPoint(x,y);resolve({targeted:target===el||el.contains(target),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,top:r.top,bottom:r.bottom,viewport:innerHeight});}))));
      expect(hit.overflow).toBeLessThanOrEqual(2);
      expect(hit.targeted).toBe(true);
      expect(hit.bottom).toBeGreaterThan(0);
      expect(hit.top).toBeLessThan(hit.viewport);
    }
    await submit.click();
    const delta=page.locator('.v323-count-delta');
    await expect(delta).toContainText('70.000');
    await expect(delta.locator('strong')).toHaveClass(/negative/);
    let counts=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V323.allCounts());
    expect(counts).toHaveLength(1);
    expect(counts[0].amount).toBe(1950000);
    expect(counts[0].supersedes).toBeNull();

    const second=await page.evaluate(date=>window.EL_ERRANTE_FINANCE_V323.recordCashCount({month:'2026-08',date,amount:1960000,evidence:'CONFIRMADO',note:'Segundo cierre'}),counts[0].date);
    expect(second.supersedes).toBe(counts[0].id);
    counts=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V323.allCounts());
    expect(counts).toHaveLength(2);
    const latest=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V323.latestCount('2026-08'));
    expect(latest.amount).toBe(1960000);
    expect(latest.note).toBe('Segundo cierre');
    expect(counts.some(r=>r.note==='Cierre físico inicial')).toBe(true);
  });

  test('los conteos observados alimentan la tendencia sin alterar la caja plan',async({page})=>{
    await seed(page);await openCashTrends(page);
    await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V323.recordCashCount({month:'2026-08',date:'2026-08-08',amount:1950000,evidence:'CONFIRMADO',note:'Conteo'}));
    const state=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working();const trend=window.EL_ERRANTE_FINANCE_V323.trendData(data,0)[0];const cash=data.cashFlow.find(r=>r.month==='2026-08');return {observed:trend.observedCash,plan:trend.planCash,workingEnding:cash.endingCash};
    });
    expect(state.observed).toBe(1950000);
    expect(state.plan).toBe(2020000);
    expect(state.workingEnding).toBe(2020000);
  });

  test('bloquea conteos futuros y fechas que no pertenecen al mes',async({page})=>{
    await seed(page);await openCashTrends(page);
    const result=await page.evaluate(()=>{
      const attempt=payload=>{try{window.EL_ERRANTE_FINANCE_V323.recordCashCount(payload);return '';}catch(e){return e.message;}};
      return {
        future:attempt({month:'2026-09',date:'2026-09-01',amount:100,evidence:'CONFIRMADO'}),
        wrongMonth:attempt({month:'2026-08',date:'2026-07-31',amount:100,evidence:'CONFIRMADO'}),
        invalidAmount:attempt({month:'2026-08',date:'2026-08-08',amount:'abc',evidence:'CONFIRMADO'})
      };
    });
    expect(result.future).toContain('mes futuro');
    expect(result.wrongMonth).toContain('debe pertenecer al mes');
    expect(result.invalidAmount).toContain('valor válido');
    await page.locator('#v323-month').selectOption('2026-09');
    await expect(page.locator('#v323-count-form [name="amount"]')).toBeDisabled();
    await expect(page.getByText('Mes futuro: los conteos observados se habilitan cuando llegue el periodo.')).toBeVisible();
  });

  test('caja y tendencias no desborda horizontalmente en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openCashTrends(page);
    const geometry=await page.evaluate(()=>{
      const table=document.querySelector('.v323-table');const wrap=table.closest('.v31-table-wrap');const rect=wrap.getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,charts:[...document.querySelectorAll('.v323-chart')].map(x=>x.getBoundingClientRect().width),viewport:window.innerWidth,wrapLeft:rect.left,wrapRight:rect.right,wrapOverflow:wrap.scrollWidth-wrap.clientWidth};
    });
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.charts.every(w=>w<=geometry.viewport)).toBe(true);
    expect(geometry.wrapLeft).toBeGreaterThanOrEqual(-2);
    expect(geometry.wrapRight).toBeLessThanOrEqual(geometry.viewport+2);
    expect(geometry.wrapOverflow).toBeGreaterThan(0);
  });
});
