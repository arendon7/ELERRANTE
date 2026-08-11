const {test,expect}=require('@playwright/test');

function dateParts(){
  const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  return {date,month:date.slice(0,7)};
}

async function seedControlledEntry(page){
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('ee_v371_rehearsal_seeded')==='1')return;
    const now=new Date();
    const date=now.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
    const month=date.slice(0,7);
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'pilot-v371',displayName:'Ensayo V3.7.1',role:'Administrador',issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+8*3600000).toISOString()}));
    sessionStorage.setItem('ee_v22_selected_date',date);
    sessionStorage.setItem('ee_v323_cash_month',month);
    sessionStorage.setItem('ee_v323_cash_year','0');

    [
      'ee_v37_pilot_events','ee_v311_operational_demo','ee_v329_finance_demo','ee_v22_fulfillment',
      'ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders',
      'ee_v330_operational_evidence','ee_v36_daily_close_events','ee_v323_cash_counts',
      'ee_v31_finance_working_model','ee_v31_finance_history','ee_v27_finance_movements'
    ].forEach(key=>localStorage.removeItem(key));

    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'PILOT-V371-ORDER',status:'approved',createdAt:now.toISOString(),total:90000,
      customer:{name:'Cliente ensayo controlado'},
      delivery:{city:'Medellín',requestedDate:date},
      items:[{productId:'la-errante',name:'La Errante',quantity:2,unitPrice:45000,unitCost:18000,unit_cost_snapshot:18000,lineTotal:90000}]
    }]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100}));

    const base=new Date(`${month}-01T12:00:00-05:00`);
    const months=Array.from({length:24},(_,index)=>{
      const d=new Date(base);d.setMonth(d.getMonth()+index);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    });
    const planSales=months.map((m,index)=>({month:m,sku:'la-errante',quantity:index?0:2,unitPrice:45000,sales:index?0:90000,unitCost:18000,cogs:index?0:36000,status:'ESTIMADO'}));
    const cashFlow=months.map((m,index)=>({month:m,openingCash:index?2000000:2000000,salesCash:index?0:90000,purchases:0,operatingExpenses:0,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:index?2000000:2090000,status:'ESTIMADO'}));
    localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({
      schemaVersion:'3.0',meta:{modelName:'Baseline privado ensayo V3.7.1',workbookProfile:'PILOT_REHEARSAL',reconciliation:'PASS'},
      planSales,productCosts:[{sku:'la-errante',name:'La Errante',category:'Pizza',price:45000,directCost:18000,status:'CONFIRMADO'}],
      cashFlow,scenarios:[],assumptions:[{name:'Caja mínima',value:1000000,unit:'COP',status:'CONFIRMADO',category:'Caja'}],decisions:[],pending:[]
    }));
    sessionStorage.setItem('ee_v371_rehearsal_seeded','1');
  });
}

async function startPilotFromUi(page,date){
  await page.goto('/piloto-operativo.html');
  const form=page.locator('#v37-start-form');
  await form.locator('input[name="start"]').fill(date);
  await form.locator('input[name="end"]').fill(date);
  for(const name of ['singleDevice','catalogValidated','inventoryCounted','financePrivate','cashObserved'])await form.locator(`input[name="${name}"]`).check();
  await form.locator('textarea[name="note"]').fill('Ensayo integral previo al uso de datos reales.');
  const download=page.waitForEvent('download');
  await form.getByRole('button',{name:'Iniciar piloto + respaldo'}).click();
  await download;
  await expect(page.locator('.v37-state strong')).toHaveText('Activo');
}

async function acceptClick(page,locator){
  page.once('dialog',dialog=>dialog.accept());
  await locator.click();
}

async function recordEvidenceUi(page,{kind,status='OBSERVADO',reference,supportRef='',duration='',note=''}){
  const panel=page.locator('#operational-evidence-v330');
  await panel.getByText('Registrar evidencia o novedad').click();
  const form=panel.locator('#v330-form');
  await form.locator('select[name="kind"]').selectOption(kind);
  await form.locator('select[name="status"]').selectOption(status);
  await form.locator('input[name="reference"]').fill(reference);
  if(supportRef)await form.locator('input[name="supportRef"]').fill(supportRef);
  if(duration)await form.locator('input[name="durationMinutes"]').fill(String(duration));
  if(note)await form.locator('textarea[name="note"]').fill(note);
  await form.getByRole('button',{name:'Guardar evidencia'}).click();
}

test.describe('V3.7.1 · ensayo operativo integral previo al piloto real',()=>{
  test('recorre por UI inventario, producción, compra, evidencia, cierre, caja y reconciliación',async({page},testInfo)=>{
    test.skip(testInfo.project.name.toLowerCase().includes('mobile'),'El ensayo integral corre en escritorio; cada módulo conserva su contrato móvil independiente.');
    const {date,month}=dateParts();
    await seedControlledEntry(page);
    await startPilotFromUi(page,date);

    await page.goto('/operacion.html#materiales');
    const materials=page.locator('#materials-v23');
    await expect(materials).toBeVisible();
    await materials.getByText('Actualizar conteo de materiales').click();
    await materials.locator('[data-v23-stock="MP-HFS"]').fill('100');
    await materials.getByRole('button',{name:'Guardar conteo'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')||'{}')['MP-HFS'])).toBe(100);

    const production=page.locator('#production-v22');
    let card=production.locator('[data-v22-order="PILOT-V371-ORDER"]');
    await expect(card.getByRole('button',{name:'Iniciar preparación'})).toBeEnabled();
    await acceptClick(page,card.getByRole('button',{name:'Iniciar preparación'}));
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]')[0]?.status)).toBe('preparing');
    card=production.locator('[data-v22-order="PILOT-V371-ORDER"]');
    for(const label of ['Producto listo','Empaque y etiqueta','Cantidad verificada','Entrega coordinada'])await card.getByLabel(label).check();
    await card.getByPlaceholder('Lote, empaque, novedad o coordinación').fill('Ensayo V3.7.1 · alistamiento verificado');
    await card.getByRole('button',{name:'Guardar alistamiento'}).click();
    card=production.locator('[data-v22-order="PILOT-V371-ORDER"]');
    await expect(card.getByRole('button',{name:'Despachar pedido'})).toBeEnabled();
    await acceptClick(page,card.getByRole('button',{name:'Despachar pedido'}));
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]')[0]?.status)).toBe('dispatched');

    const measurement=page.locator('#measurement-v24');
    await measurement.getByText('Registrar lote, rendimiento y merma').click();
    const measurementForm=measurement.locator('#ee-v24-measurement-form');
    await measurementForm.locator('input[name="batchCode"]').fill(`PILOT-${date}`);
    await measurementForm.locator('input[name="actualQty"]').fill('11000');
    await measurementForm.locator('input[name="wasteQty"]').fill('250');
    await measurementForm.getByRole('button',{name:'Guardar medición'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v24_production_measurements')||'[]').length)).toBe(1);

    const procurement=page.locator('#procurement-v25');
    const suggestion=procurement.locator('[data-v25-suggestion="MP-HFS"]');
    await expect(suggestion).toBeVisible();
    await suggestion.getByRole('button',{name:'Crear borrador'}).click();
    const orderForm=procurement.locator('#ee-v25-order-form');
    await orderForm.locator('input[name="supplier"]').fill('Proveedor ensayo V3.7.1');
    await orderForm.locator('input[name="unitCost"]').fill('3');
    await orderForm.locator('input[name="externalReference"]').fill('COT-V371');
    await orderForm.getByRole('button',{name:'Guardar borrador'}).click();
    let purchaseRow=procurement.locator('[data-v25-order-row]').first();
    await acceptClick(page,purchaseRow.getByRole('button',{name:'Aprobar'}));
    purchaseRow=procurement.locator('[data-v25-order-row]').first();
    await acceptClick(page,purchaseRow.getByRole('button',{name:'Marcar emitida'}));
    const requestedQty=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]')[0]?.requestedQty||0);
    expect(requestedQty).toBeGreaterThan(0);
    purchaseRow=procurement.locator('[data-v25-order-row]').first();
    await purchaseRow.getByRole('button',{name:'Registrar recepción'}).click();
    const receipt=procurement.locator('#ee-v25-receipt-form');
    await receipt.locator('input[name="quantity"]').fill(String(requestedQty));
    await receipt.locator('input[name="totalCost"]').fill(String(requestedQty*3));
    await receipt.locator('input[name="invoiceReference"]').fill('FAC-V371');
    await receipt.locator('input[name="updateStock"]').check();
    await receipt.getByRole('button',{name:'Confirmar recepción'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v24_material_purchases')||'[]').length)).toBe(1);
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]')[0]?.status)).toBe('received');

    await recordEvidenceUi(page,{kind:'inventory_count',reference:'Conteo físico MP-HFS',supportRef:'ACTA-V371',note:'Conteo observado durante ensayo integral.'});
    await recordEvidenceUi(page,{kind:'purchase_receipt',status:'CONFIRMADO',reference:'Recepción harina ensayo',supportRef:'FAC-V371',note:'Factura contrastada con la recepción registrada.'});
    await recordEvidenceUi(page,{kind:'time_incident',reference:'Jornada de producción ensayo',duration:'95',note:'Tiempo total de alistamiento y producción documentado.'});
    await expect.poll(()=>page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.dayState().blocking.length)).toBe(0);

    const closeForm=page.locator('#v36-close-form');
    await closeForm.locator('textarea[name="note"]').fill('Ensayo V3.7.1 cerrado sin excepciones y con evidencia completa.');
    await closeForm.getByRole('button',{name:'Cerrar jornada'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v36_daily_close_events')||'[]').at(-1)?.status)).toBe('CLOSED');

    await page.goto('/finanzas.html');
    await expect(page.locator('html')).toHaveAttribute('data-finance-cash-version','3.2.3');
    await page.locator('[data-v323-cash="1"]').click();
    await expect(page.locator('#v323-month')).toHaveValue(month);
    const cashForm=page.locator('#v323-count-form');
    await expect(cashForm).toBeVisible();
    await cashForm.locator('[name="amount"]').fill('2050000');
    await cashForm.locator('[name="note"]').fill('Caja física observada en ensayo V3.7.1');
    await cashForm.getByRole('button',{name:'Registrar observación',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v323_cash_counts')||'[]').length)).toBe(1);

    await page.goto('/piloto-operativo.html');
    await expect(page.locator('#v37-reconciliation .v37-metrics')).toBeVisible();
    await page.locator('#v37-checkpoint-note').fill('Operación, abastecimiento, cierre y caja registrados por UI.');
    const checkpointButton=page.locator('#v37-checkpoint');
    await checkpointButton.scrollIntoViewIfNeeded();
    await expect(checkpointButton).toBeVisible();
    const checkpointDownload=page.waitForEvent('download');
    await checkpointButton.click();
    await checkpointDownload;
    await expect(page.locator('#v37-reconciliation').getByText('EVIDENCE_COMPLETE',{exact:true})).toBeVisible();

    const report=await page.evaluate(()=>window.EL_ERRANTE_PILOT_V37.reconciliation());
    expect(report.summary).toMatchObject({orders:1,productionMeasurements:1,purchases:1,cashCounts:1,dailyCloses:1,blockers:0,reviews:0,exitGate:'EVIDENCE_COMPLETE'});
    expect(report.summary.activityDays).toBe(1);

    await page.locator('#v37-end-note').fill('Ensayo integral completado: cadena operativa reconciliada sin brechas automáticas.');
    const endDownload=page.waitForEvent('download');
    await page.locator('#v37-end').click();
    await endDownload;
    await expect(page.locator('.v37-state strong')).toHaveText('Cerrado');
    const result=await page.evaluate(()=>({events:window.EL_ERRANTE_PILOT_V37.events(),state:window.EL_ERRANTE_PILOT_V37.pilotState()}));
    expect(result.events.map(row=>row.kind)).toEqual(['START','CHECKPOINT','END']);
    expect(result.state.status).toBe('ENDED');
    expect(result.events.at(-1).reconciliation.exitGate).toBe('EVIDENCE_COMPLETE');
  });
});