const { test, expect } = require('@playwright/test');

function observe(page) {
  const pageErrors=[];
  const consoleErrors=[];
  const failedLocal=[];

  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('console',message=>{
    if(message.type()==='error') consoleErrors.push(message.text());
  });
  page.on('requestfailed',request=>{
    const url=request.url();
    const reason=request.failure()?.errorText||'unknown';
    if(url.startsWith('http://127.0.0.1:4173')&&!reason.includes('ERR_ABORTED')) failedLocal.push(`${url}: ${reason}`);
  });

  return async()=>{
    expect(pageErrors,'Excepciones JavaScript').toEqual([]);
    expect(consoleErrors,'Errores de consola').toEqual([]);
    expect(failedLocal,'Recursos locales fallidos').toEqual([]);
  };
}

async function seedInternalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'qa-oferta',displayName:'QA Oferta',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}

async function openOffer(page,path='/studio.html'){
  await seedInternalSession(page);
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
  await page.waitForFunction(()=>window.EE_OFFER_STUDIO_V09?.ready===true);
  await page.waitForTimeout(100);
}

async function activateVisibleButton(page,button,isMobile){
  const point=await button.evaluate(element=>{
    element.scrollIntoView({block:'center',inline:'center',behavior:'auto'});
    const rect=element.getBoundingClientRect();
    return {
      x:rect.left+rect.width/2,
      y:rect.top+rect.height/2,
      width:rect.width,
      height:rect.height,
      viewportWidth:window.innerWidth,
      viewportHeight:window.innerHeight
    };
  });
  await page.waitForTimeout(120);
  const refreshed=await button.evaluate(element=>{
    const rect=element.getBoundingClientRect();
    return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height};
  });
  expect(refreshed.width,'El botón debe tener ancho visible').toBeGreaterThan(0);
  expect(refreshed.height,'El botón debe tener alto visible').toBeGreaterThan(0);
  const hit=await page.evaluate(({x,y})=>{
    const element=document.elementFromPoint(x,y);
    const target=element?.closest('.offer-governance-form button[type="submit"]');
    return {matches:Boolean(target),tag:element?.tagName||'',text:(element?.textContent||'').trim().slice(0,80)};
  },refreshed);
  expect(hit.matches,`El centro del botón está interceptado por ${hit.tag}: ${hit.text}`).toBeTruthy();
  if(isMobile) await button.dispatchEvent('click');
  else await page.mouse.click(refreshed.x,refreshed.y);
  expect(point.viewportWidth).toBeGreaterThan(0);
  expect(point.viewportHeight).toBeGreaterThan(0);
}

test.describe('Studio de Oferta v0.9',()=>{
  test('renderiza las 11 referencias, sus puertas y el filtro de ola 1',async({page})=>{
    const clean=observe(page);
    await openOffer(page);

    const studio=page.locator('[data-offer-studio-v09]');
    await expect(studio).toBeVisible();
    await expect(studio.locator('[data-offer-rows] tr[data-offer-product]')).toHaveCount(11);
    await expect(studio.locator('[data-offer-detail]')).toContainText('Harina Aire y Tiempo');
    await expect(studio.locator('.offer-gate')).toHaveCount(17);

    await studio.locator('[data-offer-wave]').selectOption('ola_1_nucleo');
    await expect(studio.locator('[data-offer-rows] tr[data-offer-product]')).toHaveCount(6);
    await expect(studio.locator('[data-offer-count]')).toContainText('6 referencias');

    const runtime=await page.evaluate(()=>window.EE_OFFER_STUDIO_V09);
    expect(runtime).toMatchObject({ready:true,products:11,schema:'0.9-draft-1'});
    await clean();
  });

  test('guarda una decisión local sin modificar el catálogo público',async({page},testInfo)=>{
    const clean=observe(page);
    await openOffer(page);

    const form=page.locator('.offer-governance-form');
    await form.locator('[name="overall_status"]').selectOption('aprobado_con_condiciones');
    await form.locator('[name="owner"]').fill('Comité piloto');
    await form.locator('[name="next_review"]').fill('2026-09-01');
    await form.locator('[name="notes"]').fill('Validación local de demostración.');
    await page.locator('.offer-gate').first().locator('[data-gate-evidence]').fill('Acta de concepto pendiente de firma.');
    await activateVisibleButton(page,form.locator('button[type="submit"]'),testInfo.project.name.includes('mobile'));

    await expect.poll(()=>page.evaluate(()=>{
      const state=JSON.parse(localStorage.getItem('ee_v09_offer_governance')||'{}');
      return state.products?.['harina-aire-y-tiempo']?.owner||'';
    })).toBe('Comité piloto');
    await expect(form.locator('.offer-save-status')).toContainText('Decisión guardada');

    const publicState=await page.evaluate(()=>({
      products:window.EE_DATA.products.length,
      price:window.EE_DATA.products.find(product=>product.id==='harina-aire-y-tiempo').variants[0].price,
      offer:JSON.parse(localStorage.getItem('ee_v09_offer_governance')||'{}').products?.['harina-aire-y-tiempo']?.overall_status
    }));
    expect(publicState.products).toBe(11);
    expect(publicState.price).toBe(18900);
    expect(publicState.offer).toBe('aprobado_con_condiciones');
    await clean();
  });

  test('el Panel de Control V3.1.1 delega el gobierno de oferta al Studio bajo sesión interna',async({page})=>{
    const clean=observe(page);
    await seedInternalSession(page);
    await page.goto('/control.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
    await expect(page).toHaveURL(/control\.html/);
    await expect(page.locator('[data-offer-control-v09]')).toHaveCount(0);
    await expect(page.locator('script[src="assets/offer-studio-v09.js"]')).toHaveCount(0);
    await expect(page.getByRole('link',{name:'Datos maestros'})).toHaveAttribute('href','studio.html');
    expect(await page.evaluate(()=>typeof window.EE_OFFER_STUDIO_V09)).toBe('undefined');
    await clean();
  });
});

test('la tienda pública no carga el módulo interno de gobierno de oferta',async({page})=>{
  const clean=observe(page);
  await page.goto('/tienda.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
  expect(await page.evaluate(()=>typeof window.EE_OFFER_STUDIO_V09)).toBe('undefined');
  expect(await page.evaluate(()=>localStorage.getItem('ee_v09_offer_governance'))).toBeNull();
  await clean();
});
