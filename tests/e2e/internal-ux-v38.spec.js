const {test,expect}=require('@playwright/test');

async function seedInternalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}

async function waitForUx(page){
  await page.waitForFunction(()=>document.documentElement.dataset.internalUxVersion==='3.8.0');
}

test.describe('UX transversal V3.8',()=>{
  test.beforeEach(async({page})=>{await seedInternalSession(page);});

  test('la shell conserva autenticación y añade navegación semántica sin cambiar el contrato V3.1.1',async({page})=>{
    await page.goto('/centro-interno.html');
    await waitForUx(page);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.locator('html')).toHaveAttribute('data-internal-ux-version','3.8.0');
    await expect(page.locator('.v38-skip')).toHaveAttribute('href','#contenido-principal');
    await expect(page.locator('.v30-nav')).toHaveAttribute('aria-label','Navegación principal');
    await expect(page.locator('.v30-nav a.active')).toHaveAttribute('aria-current','page');
    await expect(page.locator('.v38-nav-section')).toHaveText(['Trabajo','Gobierno y prueba','Exterior']);
  });

  test('las tablas desplazables se vuelven regiones enfocables sin alterar su tabla interna',async({page})=>{
    await page.goto('/finanzas.html',{waitUntil:'domcontentloaded'});
    await waitForUx(page);
    const region=page.locator('.v31-table-wrap,.v30-table-wrap').first();
    await expect(region).toBeVisible({timeout:15000});
    await expect(region).toHaveAttribute('role','region');
    await expect(region).toHaveAttribute('tabindex','0');
    await expect(region.locator('table').first()).toBeAttached();
  });

  test('los mensajes del piloto anuncian cambios a tecnologías asistivas',async({page})=>{
    await page.goto('/piloto-operativo.html',{waitUntil:'domcontentloaded'});
    await waitForUx(page);
    const message=page.locator('#v37-message');
    await expect(message).toHaveAttribute('role','status');
    await expect(message).toHaveAttribute('aria-live','polite');
    await expect(message).toHaveAttribute('aria-atomic','true');
  });

  test('en móvil la navegación es un drawer accesible y reversible con Escape',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await page.goto('/operacion.html',{waitUntil:'domcontentloaded'});
    await waitForUx(page);
    const menu=page.locator('.v38-menu-button');
    const side=page.locator('.v30-side');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded','false');
    await menu.click();
    await expect(page.locator('body')).toHaveClass(/v38-nav-open/);
    await expect(side).toHaveAttribute('data-v38-open','true');
    await expect(menu).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('.v38-nav-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/v38-nav-open/);
    await expect(side).toHaveAttribute('data-v38-open','false');
    await expect(menu).toHaveAttribute('aria-expanded','false');
  });

  test('la shell V3.8 no introduce overflow horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    for(const path of ['/centro-interno.html','/control.html','/operacion.html','/piloto-operativo.html']){
      await page.goto(path,{waitUntil:'domcontentloaded'});
      await waitForUx(page);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`overflow en ${path}`).toBeLessThanOrEqual(2);
    }
  });
});
