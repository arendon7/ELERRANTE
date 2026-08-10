const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}

async function resetV36(page){
  await page.evaluate(()=>{
    ['ee_v36_daily_close_events','ee_v330_operational_evidence','ee_v14_orders','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders','ee_v35_capacity_history'].forEach(key=>localStorage.removeItem(key));
    sessionStorage.removeItem('ee_v22_selected_date');
  });
}

function localDate(offset=0){
  const date=new Date();date.setDate(date.getDate()+offset);return date.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
}

test.describe('V3.6 · cierre diario y continuidad',()=>{
  test('Control muestra estado de cierre sin convertirlo en formulario operativo',async({page})=>{
    await internalSession(page);await page.goto('/control.html');await resetV36(page);await page.reload();
    const surface=page.locator('[data-daily-close-v36][data-surface="control"]');
    await expect(surface).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-daily-close-version','3.6.0');
    await expect(surface.getByText('¿Qué falta para terminar bien el día?')).toBeVisible();
    await expect(surface.getByRole('link',{name:/Abrir cierre diario en Operación/})).toBeVisible();
    await expect(surface.locator('form')).toHaveCount(0);
    await expect(surface.getByText(/margen|resultado real|caja observada/i)).toHaveCount(0);
  });

  test('bloqueos exigen justificación y la corrección conserva el cierre anterior',async({page})=>{
    await internalSession(page);await page.goto('/operacion.html');await resetV36(page);
    const seeded=await page.evaluate(()=>{
      const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
      const data=window.EL_ERRANTE_MATERIALS_V23;const product=(data.products||[]).find(item=>(item.bom||[]).length);if(!product)return false;
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'V36-ORDER',status:'approved',delivery:{requestedDate:date},items:[{quantity:2,name:product.name,productId:(product.ids||[])[0]||product.sku}]}]));
      window.dispatchEvent(new Event('ee:v22:reload'));return true;
    });
    expect(seeded).toBe(true);
    await expect(page.locator('[data-daily-close-v36][data-surface="operation"]')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.dayState().blocking.length)).toBeGreaterThan(0);

    const shortMessage=await page.evaluate(()=>{try{window.EL_ERRANTE_DAILY_CLOSE_V36.closeDay({note:'corto'});return '';}catch(error){return error.message;}});
    expect(shortMessage).toMatch(/justificación/i);
    const first=await page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.closeDay({note:'Se cierra con excepción documentada para prueba V3.6'}));
    expect(first.status).toBe('CLOSED_EXCEPTION');

    await page.evaluate(()=>{
      const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'M-V36',productionDate:date,wasteQty:0}]));
      const api=window.EL_ERRANTE_OPERATION_V330;
      api.recordEvidence({date,kind:'inventory_count',reference:'Conteo V3.6',status:'OBSERVADO',supportRef:'',durationMinutes:'',note:'Conteo realizado'});
      api.recordEvidence({date,kind:'time_incident',reference:'Jornada V3.6',status:'OBSERVADO',supportRef:'',durationMinutes:'30',note:'Tiempo documentado'});
      window.dispatchEvent(new Event('ee:v24:reload'));
    });
    await expect.poll(()=>page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.dayState().blocking.length)).toBe(0);
    const second=await page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.closeDay({note:'Cierre actualizado con evidencia completa'}));
    expect(second.status).toBe('CLOSED');
    const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v36_daily_close_events')||'[]'));
    expect(rows).toHaveLength(2);expect(rows[1].supersedes).toBe(rows[0].id);expect(rows[0].status).toBe('CLOSED_EXCEPTION');
  });

  test('arrastra únicamente pendientes del cierre anterior que siguen abiertos',async({page})=>{
    await internalSession(page);await page.goto('/operacion.html');await resetV36(page);
    const result=await page.evaluate(()=>{
      const fmt=value=>value.toLocaleDateString('en-CA',{timeZone:'America/Bogota'}),today=new Date(),prev=new Date();prev.setDate(today.getDate()-1);const older=new Date();older.setDate(today.getDate()-3);
      const current=fmt(today),previous=fmt(prev),expected=fmt(older);
      localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([{id:'PO-V36',materialId:'TEST',status:'ordered',requestedQty:4,receivedQty:0,unitCost:1000,expectedDate:expected}]));
      sessionStorage.setItem('ee_v22_selected_date',previous);window.EL_ERRANTE_DAILY_CLOSE_V36.closeDay({date:previous,note:'Cierre previo con continuidad'});
      sessionStorage.setItem('ee_v22_selected_date',current);
      return {carry:window.EL_ERRANTE_DAILY_CLOSE_V36.carryoverFromPrevious(current).map(row=>row.id),current,previous};
    });
    expect(result.carry).toContain('continuity:overdue-purchases');
    await page.evaluate(()=>{localStorage.setItem('ee_v25_purchase_orders','[]');window.dispatchEvent(new Event('ee:v25:reload'));});
    await expect.poll(()=>page.evaluate(()=>window.EL_ERRANTE_DAILY_CLOSE_V36.carryoverFromPrevious().length)).toBe(0);
  });

  test('móvil mantiene el cierre diario dentro del viewport',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);await page.goto('/operacion.html');
    const surface=page.locator('[data-daily-close-v36][data-surface="operation"]');await expect(surface).toBeVisible();
    const geometry=await page.evaluate(()=>{const r=document.querySelector('[data-daily-close-v36]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(geometry.overflow).toBeLessThanOrEqual(2);expect(geometry.left).toBeGreaterThanOrEqual(-2);expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
  });
});
