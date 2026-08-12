const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Piloto QA',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}
async function reset(page){
  await page.evaluate(()=>['ee_v374_pilot_daily_observations','ee_v373_pilot_exit_reviews','ee_v37_pilot_events','ee_v311_operational_demo','ee_v329_finance_demo','ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders','ee_v330_operational_evidence','ee_v36_daily_close_events','ee_v323_cash_counts'].forEach(key=>localStorage.removeItem(key)));
}
function today(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});}
const attestations={singleDevice:true,catalogValidated:true,inventoryCounted:true,financePrivate:true,cashObserved:true};
async function begin(page){
  await page.evaluate(async({date,att})=>window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,note:'Inicio de jornada controlada',downloadBackup:false}),{date:today(),att:attestations});
}

test.describe('V3.7.4 · jornada diaria del piloto',()=>{
  test('monta la guía sin cargar motores operativos o financieros',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-pilot-daily-version','3.7.4');
    await expect(page.locator('[data-pilot-daily-v374]')).toBeVisible();
    await expect(page.getByText('No duplica hechos.')).toBeVisible();
    await expect(page.locator('script[src*="daily-close-v36"]')).toHaveCount(0);
    await expect(page.locator('script[src*="finance-cash-trends"]')).toHaveCount(0);
    await expect(page.locator('script[src*="supabase"]')).toHaveCount(0);
  });

  test('sin piloto activo la fecha queda fuera de operación',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const state=await page.evaluate(date=>window.EL_ERRANTE_PILOT_DAILY_V374.dayState(date),today());
    expect(state.code).toBe('PILOT_INACTIVE');
    expect(state.issues).toHaveLength(0);
  });

  test('piloto activo sin hechos queda como jornada sin actividad',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await begin(page);
    const state=await page.evaluate(date=>window.EL_ERRANTE_PILOT_DAILY_V374.dayState(date),today());
    expect(state.code).toBe('NO_ACTIVITY');
    expect(state.hasActivity).toBe(false);
  });

  test('pedido real detecta pago abierto y cierre faltante sin duplicar el pedido',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await begin(page);
    const result=await page.evaluate(date=>{
      const order={id:'DAY-1',status:'pending_payment',createdAt:`${date}T10:00:00-05:00`,delivery:{requestedDate:date},items:[{name:'Pizza',quantity:1,unitCost:9000,unit_cost_snapshot:9000}]};
      localStorage.setItem('ee_v14_orders',JSON.stringify([order]));
      const state=window.EL_ERRANTE_PILOT_DAILY_V374.dayState(date);
      return {state,orders:JSON.parse(localStorage.getItem('ee_v14_orders'))};
    },today());
    expect(result.state.code).toBe('IN_PROGRESS');
    expect(result.state.issues.map(x=>x.code)).toContain('PAYMENT_OPEN');
    expect(result.state.issues.map(x=>x.code)).toContain('DAILY_CLOSE_MISSING');
    expect(result.orders).toHaveLength(1);
  });

  test('observaciones son append-only y una corrección usa supersedes',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await begin(page);
    const result=await page.evaluate(date=>{
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'M-DAY',date,createdAt:`${date}T12:00:00-05:00`}]))
      const first=window.EL_ERRANTE_PILOT_DAILY_V374.saveObservation({date,note:'La primera jornada mostró fricción de flujo.',friction:['workflow']});
      const second=window.EL_ERRANTE_PILOT_DAILY_V374.saveObservation({date,note:'La segunda observación corrige el diagnóstico sin borrar historia.',friction:['data','usability']});
      return {first,second,rows:window.EL_ERRANTE_PILOT_DAILY_V374.observations(),latest:window.EL_ERRANTE_PILOT_DAILY_V374.latestObservation(date)};
    },today());
    expect(result.rows).toHaveLength(2);
    expect(result.second.supersedes).toBe(result.first.id);
    expect(result.latest.id).toBe(result.second.id);
    expect(result.second.friction).toEqual(['data','usability']);
  });

  test('cierre + caja sin checkpoint deja la jornada lista para checkpoint',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await begin(page);
    const state=await page.evaluate(date=>{
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'DAY-2',status:'delivered',createdAt:`${date}T09:00:00-05:00`,delivery:{requestedDate:date},items:[{name:'Pizza',quantity:1,unitCost:9000,unit_cost_snapshot:9000}]}]));
      localStorage.setItem('ee_v36_daily_close_events',JSON.stringify([{id:'C-DAY',date,status:'CLOSED',createdAt:`${date}T18:00:00-05:00`}]))
      localStorage.setItem('ee_v323_cash_counts',JSON.stringify([{id:'K-DAY',month:date.slice(0,7),date,amount:80000,createdAt:`${date}T18:10:00-05:00`}]))
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'M-DAY-2',date,createdAt:`${date}T14:00:00-05:00`}]))
      window.EL_ERRANTE_PILOT_DAILY_V374.saveObservation({date,note:'Jornada cerrada y conciliada antes del checkpoint.',friction:[]});
      return window.EL_ERRANTE_PILOT_DAILY_V374.dayState(date);
    },today());
    expect(state.code).toBe('READY_FOR_CHECKPOINT');
    expect(state.issues.map(x=>x.code)).toContain('CHECKPOINT_MISSING');
    expect(state.issues.map(x=>x.code)).not.toContain('CASH_COUNT_MISSING');
  });

  test('checkpoint del motor convierte una jornada cerrada en completa',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await begin(page);
    const state=await page.evaluate(async date=>{
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'M-DAY-3',date,createdAt:`${date}T14:00:00-05:00`}]))
      localStorage.setItem('ee_v36_daily_close_events',JSON.stringify([{id:'C-DAY-3',date,status:'CLOSED',createdAt:`${date}T18:00:00-05:00`}]))
      window.EL_ERRANTE_PILOT_DAILY_V374.saveObservation({date,note:'La jornada quedó lista para respaldo de continuidad.',friction:[]});
      await window.EL_ERRANTE_PILOT_V37.checkpoint({note:`${date} · checkpoint test`,downloadBackup:false});
      return window.EL_ERRANTE_PILOT_DAILY_V374.dayState(date);
    },today());
    expect(state.code).toBe('DAY_COMPLETE');
    expect(state.checkpoints.length).toBe(1);
  });

  test('móvil no introduce overflow horizontal',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);await page.goto('/piloto-operativo.html');
    await expect(page.locator('[data-pilot-daily-v374]')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
