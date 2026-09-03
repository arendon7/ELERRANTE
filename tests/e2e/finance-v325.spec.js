const {test,expect}=require('@playwright/test');

async function seed(page,{empty=false,missingCash=false}={}){
  await page.clock.setFixedTime(new Date('2026-08-15T12:00:00-05:00'));
  await page.addInitScript(({empty,missingCash})=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    const months=Array.from({length:24},(_,i)=>{const d=new Date(Date.UTC(2026,7+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
    const planSales=months.map(month=>({month,sku:'SKU-DEC',quantity:10,unitPrice:10000,sales:100000,unitCost:4000,cogs:40000,status:'ESTIMADO'}));
    const cashFlow=months.map((month,i)=>({month,openingCash:i===0?1000000:0,salesCash:100000,purchases:200000,operatingExpenses:50000,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'ESTIMADO'}));
    const decisions=empty?[]:[
      {id:'D-AHORA',name:'Contratar apoyo',configuredMonth:2,recommendedMonth:1,differenceMonths:99,decisionState:'PENDIENTE',condition:'Demanda y caja suficiente',impact:'Aumenta costo fijo',suggestedAction:'Evaluar contratación',status:'INFERIDO'},
      {id:'D-PROX',name:'Comprar segundo horno',configuredMonth:3,recommendedMonth:3,differenceMonths:0,decisionState:'PENDIENTE',condition:'Volumen sostenido',impact:'CAPEX y capacidad',suggestedAction:'Cotizar y decidir',status:'INFERIDO'},
      {id:'D-CERRADA',name:'Definir precio lanzamiento',configuredMonth:1,recommendedMonth:1,differenceMonths:0,decisionState:'APROBADA',condition:'Margen validado',impact:'Precio comercial',suggestedAction:'Mantener precio',status:'INFERIDO'},
      {id:'D-SIN-FECHA',name:'Abrir nuevo canal',configuredMonth:0,recommendedMonth:0,differenceMonths:0,decisionState:'PENDIENTE',condition:'Validar demanda',impact:'Canal comercial',suggestedAction:'Revisar después',status:'INFERIDO'}
    ];
    const snapshot={schemaVersion:'3.0',meta:{modelName:'MFO prueba V3.2.5',workbookProfile:'MFO_V3_3_DECISIONES_ESCENARIOS',reconciliation:'PASS'},planSales,productCosts:[{sku:'SKU-DEC',name:'Producto decisión',category:'Prueba',price:10000,directCost:4000,status:'CONFIRMADO'}],cashFlow:missingCash?cashFlow.filter(r=>r.month!=='2026-08'):cashFlow,scenarios:[{id:'BASE',name:'Base',volumeFactor:1,priceFactor:1,directCostFactor:1,opexFactor:1,purchaseFactor:1,collectionFactor:1,status:'ESTIMADO'},{id:'CONS',name:'Conservador',volumeFactor:.8,priceFactor:.98,directCostFactor:1.1,opexFactor:1,purchaseFactor:.9,collectionFactor:.9,status:'ESTIMADO'}],assumptions:[{name:'Caja mínima',value:1200000,unit:'COP',status:'CONFIRMADO'}],decisions,pending:[]};
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify(snapshot));
    localStorage.removeItem('ee_v31_finance_working_model');
    localStorage.removeItem('ee_v31_finance_history');
    localStorage.removeItem('ee_v325_decision_followups');
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'ORD-325',status:'approved',createdAt:'2026-08-08T10:00:00-05:00',total:60000,items:[{productId:'SKU-DEC',quantity:2,unit_cost_snapshot:12000}]}]));
    localStorage.setItem('ee_v27_finance_movements',JSON.stringify([{id:'MOV-325',date:'2026-08-08',type:'operating_expense',amount:5000,description:'Prueba'}]));
    sessionStorage.setItem('ee_v31_finance_tab','decisions');
    sessionStorage.setItem('ee_v325_decision_selected','0');
  },{empty,missingCash});
}

async function openDecisions(page){
  await page.goto('/finanzas.html');
  await expect(page.locator('html')).toHaveAttribute('data-finance-decision-version','3.2.5');
  await expect(page.locator('[data-section="decisions"]')).toHaveClass(/active/);
}

test.describe('Cockpit de decisiones V3.2.5',()=>{
  test('clasifica la agenda y usa diferencia viva, no el valor importado congelado',async({page})=>{
    await seed(page);await openDecisions(page);
    const state=await page.evaluate(()=>{
      const data=window.EL_ERRANTE_FINANCE_V31.working(),api=window.EL_ERRANTE_FINANCE_V325;
      return {summary:api.summary(data),now:api.timing(data.decisions[0],data),upcoming:api.timing(data.decisions[1],data),closed:api.timing(data.decisions[2],data),difference:api.difference(data.decisions[0]),evidence:api.evidence(data,data.decisions[0])};
    });
    expect(state.summary.open).toBe(3);
    expect(state.summary.closed).toBe(1);
    expect(state.summary.now).toBe(1);
    expect(state.summary.upcoming).toBe(1);
    expect(state.summary.mismatch).toBe(1);
    expect(state.now.code).toBe('now');
    expect(state.upcoming.code).toBe('upcoming');
    expect(state.closed.code).toBe('closed');
    expect(state.difference).toBe(1);
    expect(state.evidence.month).toBe('2026-08');
    expect(state.evidence.coverage).toBe(1);
    expect(state.evidence.signals.some(x=>x.title==='Caja plan bajo mínimo')).toBe(true);
    await expect(page.getByRole('heading',{name:'Decidir con contexto, sin automatizar la decisión.'})).toBeVisible();
    await expect(page.locator('.v325-marker')).toHaveCount(3);
    await expect(page.locator('[data-v325-difference]')).toHaveText('+1 meses');
  });

  test('editar decisión conserva plan, escenarios, pedidos y movimientos',async({page})=>{
    await seed(page);await openDecisions(page);
    const before=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {plan:JSON.stringify(d.planSales),cash:JSON.stringify(d.cashFlow),scenarios:JSON.stringify(d.scenarios),orders:localStorage.getItem('ee_v14_orders'),moves:localStorage.getItem('ee_v27_finance_movements')};});
    const configured=page.locator('[data-decision="0|configuredMonth"]');
    await configured.fill('3');await configured.dispatchEvent('change');
    const status=page.locator('[data-decision="0|decisionState"]');
    await status.selectOption('EVALUAR');
    const after=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {decision:d.decisions[0],difference:window.EL_ERRANTE_FINANCE_V325.difference(d.decisions[0]),plan:JSON.stringify(d.planSales),cash:JSON.stringify(d.cashFlow),scenarios:JSON.stringify(d.scenarios),orders:localStorage.getItem('ee_v14_orders'),moves:localStorage.getItem('ee_v27_finance_movements'),history:JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]')};});
    expect(after.decision.configuredMonth).toBe(3);
    expect(after.decision.decisionState).toBe('EVALUAR');
    expect(after.difference).toBe(2);
    expect(after.plan).toBe(before.plan);expect(after.cash).toBe(before.cash);expect(after.scenarios).toBe(before.scenarios);expect(after.orders).toBe(before.orders);expect(after.moves).toBe(before.moves);
    expect(after.history.some(h=>h.label==='Decisión financiera actualizada')).toBe(true);
    await expect(page.locator('[data-v325-difference]')).toHaveText('+2 meses');
  });

  test('seguimiento local no modifica la decisión del MFO ni otras capas',async({page})=>{
    await seed(page);await openDecisions(page);
    const before=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {decisions:JSON.stringify(d.decisions),plan:JSON.stringify(d.planSales),cash:JSON.stringify(d.cashFlow)};});
    await page.locator('[data-v325-follow="0|reviewDate"]').fill('2026-08-20');
    await page.locator('[data-v325-follow="0|note"]').fill('Validar ventas y caja antes de aprobar.');
    await page.locator('[data-v325-save-follow="0"]').click();
    const after=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return {follow:JSON.parse(localStorage.getItem('ee_v325_decision_followups')||'{}'),decisions:JSON.stringify(d.decisions),plan:JSON.stringify(d.planSales),cash:JSON.stringify(d.cashFlow),history:JSON.parse(localStorage.getItem('ee_v31_finance_history')||'[]')};});
    expect(after.follow['D-AHORA'].reviewDate).toBe('2026-08-20');
    expect(after.follow['D-AHORA'].note).toContain('Validar ventas');
    expect(after.decisions).toBe(before.decisions);expect(after.plan).toBe(before.plan);expect(after.cash).toBe(before.cash);
    expect(after.history.some(h=>h.label==='Seguimiento de decisión actualizado')).toBe(true);
  });

  test('no inventa decisiones cuando el modelo no las contiene',async({page})=>{
    await seed(page,{empty:true});await openDecisions(page);
    await expect(page.getByRole('heading',{name:'No hay decisiones importadas en este modelo.'})).toBeVisible();
    await expect(page.locator('[data-v325-field]')).toHaveCount(0);
    const count=await page.evaluate(()=>window.EL_ERRANTE_FINANCE_V31.working().decisions.length);
    expect(count).toBe(0);
  });

  test('una fila de caja inexistente se declara como dato faltante, no como cero',async({page})=>{
    await seed(page,{missingCash:true});await openDecisions(page);
    const ev=await page.evaluate(()=>{const d=window.EL_ERRANTE_FINANCE_V31.working();return window.EL_ERRANTE_FINANCE_V325.evidence(d,d.decisions[0]);});
    expect(ev.cash).toBeNull();
    expect(ev.coverage).toBeCloseTo(5/6,5);
    expect(ev.signals.some(x=>x.title==='Caja plan no disponible')).toBe(true);
    const cashMetric=page.locator('.v325-financial-metrics .v325-metric').filter({hasText:'Caja final plan'});
    await expect(cashMetric).toContainText('Sin dato');
  });

  test('la línea 24M hace scroll interno sin ensanchar el documento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);await openDecisions(page);
    const g=await page.evaluate(()=>{const el=document.querySelector('.v325-timeline-wrap'),r=el.getBoundingClientRect(),card=document.querySelector('.v325-card').getBoundingClientRect();return {doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:innerWidth,left:r.left,right:r.right,scroll:el.scrollWidth-el.clientWidth,cardLeft:card.left,cardRight:card.right};});
    expect(g.doc).toBeLessThanOrEqual(2);
    expect(g.left).toBeGreaterThanOrEqual(-2);expect(g.right).toBeLessThanOrEqual(g.viewport+2);expect(g.scroll).toBeGreaterThan(0);
    expect(g.cardLeft).toBeGreaterThanOrEqual(-2);expect(g.cardRight).toBeLessThanOrEqual(g.viewport+2);
  });
});
