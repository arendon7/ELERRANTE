const {test,expect}=require('@playwright/test');

async function seedInternalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}

test.describe('Hardening de gobierno interno V3.1.1',()=>{
  test.beforeEach(async({page})=>{await seedInternalSession(page);});

  test('el Centro conserva tres módulos principales y hace visibles las herramientas auxiliares',async({page})=>{
    await page.goto('/centro-interno.html');
    await expect(page.locator('.v31-module-card')).toHaveCount(3);
    await expect(page.getByRole('link',{name:/Datos y catálogo/})).toHaveAttribute('href','studio.html');
    await expect(page.getByRole('link',{name:/Actas de validación/})).toHaveAttribute('href','actas.html');
    await expect(page.locator('a[href="equipo.html"]')).toHaveCount(0);
  });

  test('Studio usa la shell interna con una sesión vigente',async({page})=>{
    await page.goto('/studio.html');
    await expect(page).toHaveURL(/studio\.html/);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.getByRole('heading',{name:'Gobernar productos y fuentes sin mezclar la operación.'})).toBeVisible();
    await expect(page.locator('#studio-app')).toBeVisible();
    await expect(page.getByRole('link',{name:'Todos los módulos'})).toHaveAttribute('href','centro-interno.html');
    await expect(page.getByRole('link',{name:'Actas',exact:true}).first()).toHaveAttribute('href','actas.html');
    await expect(page.locator('a[href="equipo.html"]')).toHaveCount(0);
  });

  test('Actas usa la shell interna y conserva el motor histórico de validación',async({page})=>{
    await page.goto('/actas.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EE_VALIDATION_ACTS_V09?.ready===true);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.getByRole('heading',{name:'Validar con evidencia y dejar la decisión trazable.'})).toBeVisible();
    await expect(page.locator('[data-act-form]')).toContainText('Harina Aire y Tiempo');
    await expect(page.locator('[data-act-gate]')).toHaveCount(17);
    await expect(page.getByRole('link',{name:'Datos maestros',exact:true}).first()).toHaveAttribute('href','studio.html');
    await expect(page.getByRole('link',{name:'Todos los módulos'})).toHaveAttribute('href','centro-interno.html');
    await expect(page.locator('a[href="equipo.html"]')).toHaveCount(0);
  });

  test('las superficies auxiliares no crean un cuarto contexto principal',async({page})=>{
    await page.goto('/studio.html');
    await expect(page.getByText('Contexto auxiliar',{exact:true})).toBeVisible();
    await page.goto('/actas.html');
    await expect(page.getByText('Contexto auxiliar',{exact:true})).toBeVisible();
  });

  test('el shell auxiliar no desborda el documento en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    for(const path of ['/studio.html','/actas.html']){
      await page.goto(path,{waitUntil:'domcontentloaded'});
      const shell=page.locator('.v30-shell');await expect(shell).toBeVisible();
      const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:innerWidth,shellRight:document.querySelector('.v30-shell').getBoundingClientRect().right}));
      expect(geometry.overflow,`overflow en ${path}`).toBeLessThanOrEqual(2);
      expect(geometry.shellRight,`shell fuera de viewport en ${path}`).toBeLessThanOrEqual(geometry.viewport+2);
    }
  });
});