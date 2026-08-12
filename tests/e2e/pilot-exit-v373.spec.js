const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Piloto QA',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}
async function reset(page){await page.evaluate(()=>['ee_v373_pilot_exit_reviews','ee_v37_pilot_events','ee_v311_operational_demo','ee_v329_finance_demo','ee_v14_orders','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders','ee_v330_operational_evidence','ee_v36_daily_close_events','ee_v323_cash_counts'].forEach(key=>localStorage.removeItem(key)))}
function today(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'})}
const attestations={singleDevice:true,catalogValidated:true,inventoryCounted:true,financePrivate:true,cashObserved:true};
const dataPersistence={orders:'shared',receipts:'shared',inventory:'shared',production:'shared',procurement:'shared',evidence:'local',dailyClose:'shared',finance:'shared',cash:'shared'};
const roleNeeds={approvePayment:'role',inventoryCorrection:'role',authorizePurchase:'role',financeCorrection:'role',closeDay:'role',restoreBackup:'role'};
const surfaceUse={orders:'daily',production:'daily',materials:'daily',procurement:'occasional',dailyClose:'daily',finance:'daily',pilot:'daily'};

async function seedCompleteClosedPilot(page){
  await page.evaluate(async({date,att})=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'EXIT-1',status:'delivered',createdAt:`${date}T09:00:00-05:00`,delivery:{requestedDate:date},items:[{name:'Pizza',quantity:2,unitCost:9000,unit_cost_snapshot:9000}]}]));
    localStorage.setItem('ee_v36_daily_close_events',JSON.stringify([{id:'C-EXIT-1',date,status:'CLOSED',createdAt:`${date}T22:00:00-05:00`}]))
    localStorage.setItem('ee_v323_cash_counts',JSON.stringify([{id:'K-EXIT-1',date,amount:100000,createdAt:`${date}T22:10:00-05:00`}]))
    await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,note:'Inicio de piloto real',downloadBackup:false});
    await window.EL_ERRANTE_PILOT_V37.finishPilot({note:'Piloto cerrado con evidencia completa',downloadBackup:false});
  },{date:today(),att:attestations});
}

test.describe('V3.7.3 · salida y decisión del piloto',()=>{
  test('monta la capa de salida sin activar backend',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-pilot-exit-version','3.7.3');
    await expect(page.locator('[data-pilot-exit-v373]')).toBeVisible();
    await expect(page.getByText('Supabase permanece inactivo.')).toBeVisible();
    await expect(page.locator('script[src*="supabase"]')).toHaveCount(0);
  });

  test('un piloto cerrado sin revisión exige revisión de salida',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await seedCompleteClosedPilot(page);
    const gate=await page.evaluate(()=>window.EL_ERRANTE_PILOT_EXIT_V373.decision());
    expect(gate.reconciliationGate).toBe('EVIDENCE_COMPLETE');
    expect(gate.code).toBe('REVIEW_REQUIRED');
  });

  test('revisión completa genera candidato de diseño sin abrir Supabase',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await seedCompleteClosedPilot(page);
    const result=await page.evaluate(async input=>{
      const review=await window.EL_ERRANTE_PILOT_EXIT_V373.saveReview(input);
      const gate=await window.EL_ERRANTE_PILOT_EXIT_V373.decision();
      return {review,gate,rows:window.EL_ERRANTE_PILOT_EXIT_V373.reviews()};
    },{dataPersistence,roleNeeds,surfaceUse,note:'El uso real confirma persistencia compartida y permisos por rol.'});
    expect(result.rows).toHaveLength(1);
    expect(result.review.reconciliationGate).toBe('EVIDENCE_COMPLETE');
    expect(result.gate.code).toBe('BACKEND_DESIGN_CANDIDATE');
    expect(result.gate.counts.sharedData).toBeGreaterThan(0);
    expect(result.gate.counts.roleActions).toBeGreaterThan(0);
  });

  test('las revisiones son append-only y trazan supersedes',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await seedCompleteClosedPilot(page);
    const result=await page.evaluate(async input=>{
      const first=await window.EL_ERRANTE_PILOT_EXIT_V373.saveReview({...input,note:'Primera revisión operativa del piloto cerrado.'});
      const second=await window.EL_ERRANTE_PILOT_EXIT_V373.saveReview({...input,note:'Segunda revisión corrige la lectura sin borrar historia.'});
      return {first,second,rows:window.EL_ERRANTE_PILOT_EXIT_V373.reviews()};
    },{dataPersistence,roleNeeds,surfaceUse});
    expect(result.rows).toHaveLength(2);
    expect(result.second.supersedes).toBe(result.first.id);
  });

  test('brechas de reconciliación impiden declarar candidato',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    await page.evaluate(async({date,att,input})=>{
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'GAP-1',status:'delivered',createdAt:`${date}T09:00:00-05:00`,delivery:{requestedDate:date},items:[{name:'Pizza',quantity:1}]}]));
      await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,note:'Inicio con brecha intencional',downloadBackup:false});
      await window.EL_ERRANTE_PILOT_V37.finishPilot({note:'Cierre conservando brechas para revisión',downloadBackup:false});
      await window.EL_ERRANTE_PILOT_EXIT_V373.saveReview({...input,note:'Se documentan brechas antes de cualquier arquitectura compartida.'});
    },{date:today(),att:attestations,input:{dataPersistence,roleNeeds,surfaceUse}});
    const gate=await page.evaluate(()=>window.EL_ERRANTE_PILOT_EXIT_V373.decision());
    expect(gate.reconciliationGate).toBe('NEEDS_REVIEW');
    expect(gate.code).toBe('EVIDENCE_GAPS');
  });

  test('móvil no introduce overflow horizontal',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);await page.goto('/piloto-operativo.html');
    await expect(page.locator('[data-pilot-exit-v373]')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
