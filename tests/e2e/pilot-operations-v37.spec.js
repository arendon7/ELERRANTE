const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Piloto QA',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}
async function reset(page){
  await page.evaluate(()=>{
    ['ee_v37_pilot_events','ee_v311_operational_demo','ee_v329_finance_demo','ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders','ee_v330_operational_evidence','ee_v36_daily_close_events','ee_v10_master_governance','ee_v11_cost_proposal_events','ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v31_finance_history','ee_v27_finance_movements','ee_v323_cash_counts','ee_v31_local_account'].forEach(key=>localStorage.removeItem(key));
  });
}
function today(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});}
const allAttestations={singleDevice:true,catalogValidated:true,inventoryCounted:true,financePrivate:true,cashObserved:true};

test.describe('V3.7 · piloto operativo controlado',()=>{
  test('superficie protegida y separada de dashboards',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-pilot-version','3.7.1');
    await expect(page.getByText('Piloto operativo controlado · V3.7')).toBeVisible();
    await expect(page.getByText('Gate Supabase sigue cerrado.')).toBeVisible();
    await expect(page.locator('script[src*="finance-workbench"]')).toHaveCount(0);
    await expect(page.locator('script[src*="daily-close-v36"]')).toHaveCount(0);
  });

  test('una demo activa bloquea el inicio real',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const message=await page.evaluate(async({date,att})=>{
      localStorage.setItem('ee_v311_operational_demo',JSON.stringify({active:true}));
      try{await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,downloadBackup:false});return '';}catch(error){return error.message;}
    },{date:today(),att:allAttestations});
    expect(message).toMatch(/demo/i);
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v37_pilot_events')||'[]').length)).toBe(0);
  });

  test('inicio, checkpoint y cierre son append-only y no reescriben hechos',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const result=await page.evaluate(async({date,att})=>{
      const orders=[{id:'REAL-1',status:'delivered',createdAt:`${date}T10:00:00-05:00`,delivery:{requestedDate:date},items:[{name:'Pizza',quantity:2,unitCost:9000}]}];
      localStorage.setItem('ee_v14_orders',JSON.stringify(orders));
      localStorage.setItem('ee_v36_daily_close_events',JSON.stringify([{id:'C1',date,status:'CLOSED',createdAt:`${date}T23:00:00-05:00`}]))
      localStorage.setItem('ee_v323_cash_counts',JSON.stringify([{id:'K1',date,amount:100000}]));
      await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,note:'Inicio controlado',downloadBackup:false});
      await window.EL_ERRANTE_PILOT_V37.checkpoint({note:'Mitad de jornada',downloadBackup:false});
      await window.EL_ERRANTE_PILOT_V37.finishPilot({note:'Piloto cerrado con evidencia revisada',downloadBackup:false});
      return {events:window.EL_ERRANTE_PILOT_V37.events(),orders:JSON.parse(localStorage.getItem('ee_v14_orders'))};
    },{date:today(),att:allAttestations});
    expect(result.events.map(row=>row.kind)).toEqual(['START','CHECKPOINT','END']);
    expect(result.orders).toHaveLength(1);expect(result.orders[0].id).toBe('REAL-1');
  });

  test('backup cubre datasets críticos y excluye cuenta local',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const payload=await page.evaluate(async()=>{
      localStorage.setItem('ee_v31_local_account',JSON.stringify({username:'private',hash:'secret-hash'}));
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'M1'}]));
      localStorage.setItem('ee_v24_material_purchases',JSON.stringify([{id:'P1'}]));
      localStorage.setItem('ee_v330_operational_evidence',JSON.stringify([{id:'E1'}]));
      localStorage.setItem('ee_v323_cash_counts',JSON.stringify([{id:'K1'}]));
      return window.EL_ERRANTE_PILOT_V37.buildBackup({label:'test'});
    });
    expect(payload.format).toBe('el-errante-pilot-backup');
    expect(payload.version).toBe('3.7.1');
    expect(payload.checksum.algorithm).toBe('SHA-256');
    expect(payload.data.ee_v24_production_measurements).toHaveLength(1);
    expect(payload.data.ee_v24_material_purchases).toHaveLength(1);
    expect(payload.data.ee_v330_operational_evidence).toHaveLength(1);
    expect(payload.data.ee_v323_cash_counts).toHaveLength(1);
    expect(Object.keys(payload.data)).not.toContain('ee_v31_local_account');
  });

  test('valida backups íntegros V3.7.0 sin invalidarlos por el patch',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const result=await page.evaluate(async()=>{
      const stable=v=>{
        if(Array.isArray(v))return`[${v.map(stable)}]`;
        if(v&&typeof v==='object')return`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`)}}`;
        return JSON.stringify(v);
      };
      const data={ee_v14_orders:[{id:'OLD-370',status:'approved'}]};
      const pilotLedgerSnapshot=[];
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable({version:'3.7.0',data,pilotLedgerSnapshot})));
      const checksum=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
      const payload={format:'el-errante-pilot-backup',version:'3.7.0',data,pilotLedgerSnapshot,checksum:{algorithm:'SHA-256',value:checksum}};
      const validated=await window.EL_ERRANTE_PILOT_V37.validateBackup(payload);
      return {version:validated.version,accepted:[...window.EL_ERRANTE_PILOT_V37.BACKUP_VERSIONS]};
    });
    expect(result.version).toBe('3.7.0');
    expect(result.accepted).toEqual(['3.7.0','3.7.1']);
  });

  test('reconciliación detecta costo faltante y día sin cierre',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const report=await page.evaluate(async({date,att})=>{
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'R-2',status:'delivered',delivery:{requestedDate:date},createdAt:`${date}T09:00:00-05:00`,items:[{name:'Pizza',quantity:1}]}]));
      await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,downloadBackup:false});
      return window.EL_ERRANTE_PILOT_V37.reconciliation();
    },{date:today(),att:allAttestations});
    expect(report.summary.exitGate).toBe('NEEDS_REVIEW');
    expect(report.issues.map(row=>row.code)).toContain('MISSING_COST_SNAPSHOT');
    expect(report.issues.map(row=>row.code)).toContain('MISSING_DAILY_CLOSE');
  });

  test('reconciliación cuenta recepciones V2.5 fechadas con receivedDate',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    const report=await page.evaluate(async({date,att})=>{
      localStorage.setItem('ee_v24_material_purchases',JSON.stringify([{id:'PUR-1',materialId:'MP-HFS',receivedDate:date,quantity:20,totalCost:60000,invoiceReference:'FAC-1'}]));
      localStorage.setItem('ee_v36_daily_close_events',JSON.stringify([{id:'C-PUR-1',date,status:'CLOSED',createdAt:`${date}T23:00:00-05:00`}]))
      await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,attestations:att,downloadBackup:false});
      return window.EL_ERRANTE_PILOT_V37.reconciliation();
    },{date:today(),att:allAttestations});
    expect(report.summary.purchases).toBe(1);
    expect(report.summary.activityDays).toBe(1);
    expect(report.summary.missingCloseDays).toBe(0);
  });

  test('móvil mantiene la superficie dentro del viewport',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);await page.goto('/piloto-operativo.html');
    await expect(page.locator('[data-pilot-v37]')).toBeVisible();
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:innerWidth,right:document.querySelector('[data-pilot-v37]').getBoundingClientRect().right}));
    expect(geometry.overflow).toBeLessThanOrEqual(2);expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
  });
});
