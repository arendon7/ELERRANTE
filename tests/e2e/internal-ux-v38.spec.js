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

  test('las tablas desplazables dinámicas se vuelven regiones enfocables sin alterar su tabla interna',async({page})=>{
    await page.goto('/centro-interno.html');
    await waitForUx(page);
    await page.evaluate(()=>{
      const wrap=document.createElement('div');wrap.id='v38-test-table';wrap.className='v31-table-wrap';wrap.innerHTML='<table><tbody><tr><td>Dato</td></tr></tbody></table>';document.querySelector('.v30-main').append(wrap);
    });
    const region=page.locator('#v38-test-table');
    await expect(region).toHaveAttribute('role','region');
    await expect(region).toHaveAttribute('tabindex','0');
    await expect(region).toHaveAttribute('aria-label','Tabla desplazable');
    await expect(region.locator('table')).toBeAttached();
  });

  test('los mensajes del piloto anuncian cambios a tecnologías asistivas',async({page})=>{
    await page.goto('/piloto-operativo.html',{waitUntil:'domcontentloaded'});
    await waitForUx(page);
    const message=page.locator('#v37-message');
    await expect(message).toHaveAttribute('role','status');
    await expect(message).toHaveAttribute('aria-live','polite');
    await expect(message).toHaveAttribute('aria-atomic','true');
  });

  test('en móvil la navegación es modal, inerte por fuera y reversible con Escape',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await page.goto('/operacion.html',{waitUntil:'domcontentloaded'});
    await waitForUx(page);
    const menu=page.locator('.v38-menu-button');
    const side=page.locator('.v30-side');
    const main=page.locator('.v30-main');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded','false');
    await menu.click();
    await expect(page.locator('body')).toHaveClass(/v38-nav-open/);
    await expect(side).toHaveAttribute('data-v38-open','true');
    await expect(side).toHaveAttribute('role','dialog');
    await expect(side).toHaveAttribute('aria-modal','true');
    await expect(menu).toHaveAttribute('aria-expanded','true');
    await expect(main).toHaveAttribute('inert','');
    await expect(page.locator('.v38-nav-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/v38-nav-open/);
    await expect(side).toHaveAttribute('data-v38-open','false');
    await expect(side).not.toHaveAttribute('aria-modal','true');
    await expect(menu).toHaveAttribute('aria-expanded','false');
    await expect(main).not.toHaveAttribute('inert','');
  });

  test('si falla el JS V3.8, la shell retira su CSS y conserva el responsive V3.1',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await page.route('**/assets/internal-ux-v38.js*',route=>route.abort());
    await page.goto('/control.html',{waitUntil:'domcontentloaded'});
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.locator('link[data-internal-ux-v38]')).toHaveCount(0);
    await expect(page.locator('.v38-mobile-bar')).toHaveCount(0);
    await expect(page.locator('.v30-side')).toBeVisible();
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
