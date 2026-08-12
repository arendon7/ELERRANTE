const {test,expect}=require('@playwright/test');

async function seedInternalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}

async function waitForV39(page){
  await page.waitForFunction(()=>document.documentElement.dataset.internalEfficiencyVersion==='3.9.0');
}

test.describe('UX de eficiencia V3.9',()=>{
  test.beforeEach(async({page})=>{await seedInternalSession(page);});

  test('V3.9 se monta sobre V3.8 sin cambiar el contrato autenticado V3.1.1',async({page})=>{
    await page.goto('/centro-interno.html');
    await waitForV39(page);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.locator('html')).toHaveAttribute('data-internal-ux-version','3.8.0');
    await expect(page.locator('html')).toHaveAttribute('data-internal-efficiency-version','3.9.0');
    await expect(page.locator('.v39-command-trigger').first()).toBeVisible();
    await expect(page.locator('.v39-resume')).toBeVisible();
  });

  test('el launcher es modal, enfoca búsqueda, encuentra por intención y restaura foco con Escape',async({page})=>{
    await page.goto('/centro-interno.html');
    await waitForV39(page);
    const trigger=page.locator('.v31-session-actions .v39-command-trigger');
    await trigger.click();
    const layer=page.locator('.v39-command-layer');
    const dialog=page.locator('.v39-command');
    const input=page.locator('#v39-command-input');
    await expect(layer).toBeVisible();
    await expect(dialog).toHaveAttribute('role','dialog');
    await expect(dialog).toHaveAttribute('aria-modal','true');
    await expect(page.locator('.v30-shell')).toHaveAttribute('inert','');
    await expect(input).toBeFocused();
    await input.fill('caja');
    await expect(page.locator('.v39-command-item strong')).toContainText(['Finanzas']);
    await page.keyboard.press('Escape');
    await expect(layer).toBeHidden();
    await expect(page.locator('.v30-shell')).not.toHaveAttribute('inert','');
    await expect(trigger).toBeFocused();
  });

  test('Ctrl+K abre el launcher y Enter navega al primer resultado filtrado',async({page})=>{
    await page.goto('/centro-interno.html');
    await waitForV39(page);
    await page.keyboard.press('Control+K');
    const input=page.locator('#v39-command-input');
    await expect(input).toBeFocused();
    await input.fill('inventario');
    await expect(page.locator('.v39-command-item').first()).toContainText('Operación');
    await input.press('Enter');
    await expect(page).toHaveURL(/operacion\.html$/);
  });

  test('Inicio interno ofrece continuar desde la última sección visitada sin almacenar datos de negocio',async({page})=>{
    await page.goto('/operacion.html#medicion',{waitUntil:'domcontentloaded'});
    await waitForV39(page);
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v39_navigation_history')||'[]')[0]?.href)).toBe('operacion.html#medicion');
    await page.goto('/centro-interno.html',{waitUntil:'domcontentloaded'});
    await waitForV39(page);
    const resume=page.locator('.v39-resume');
    await expect(resume).toContainText('Continúa donde quedaste');
    await expect(resume).toContainText('Operación · Inventario y medición');
    await expect(resume.locator('.v39-resume-primary')).toHaveAttribute('href','operacion.html#medicion');
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v39_navigation_history')||'[]')[0]);
    expect(Object.keys(stored).sort()).toEqual(['at','href','label']);
  });

  test('si falla V3.9 se conserva V3.8 y se retira únicamente el CSS de eficiencia',async({page})=>{
    await page.route('**/assets/internal-ux-v39.js*',route=>route.abort());
    await page.goto('/control.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.internalUxVersion==='3.8.0');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.locator('html')).toHaveAttribute('data-internal-ux-version','3.8.0');
    await expect(page.locator('html')).not.toHaveAttribute('data-internal-efficiency-version','3.9.0');
    await expect(page.locator('link[data-internal-ux-v39]')).toHaveCount(0);
    await expect(page.locator('.v38-skip')).toBeAttached();
  });

  test('el launcher V3.9 no introduce overflow horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await page.goto('/operacion.html',{waitUntil:'domcontentloaded'});
    await waitForV39(page);
    await page.locator('.v38-mobile-bar .v39-command-trigger').click();
    await expect(page.locator('.v39-command-layer')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await page.keyboard.press('Escape');
  });
});