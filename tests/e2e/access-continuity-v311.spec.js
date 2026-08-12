const {test,expect}=require('@playwright/test');

async function createLocalAccess(page,username='juan',password='ClaveSegura123'){
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraseña',{exact:true}).fill(password);
  await page.getByLabel('Confirmar contraseña').fill(password);
  await page.getByRole('button',{name:'Crear acceso y entrar'}).click();
}

async function expectLocation(page,pathname,hash=''){
  const target=`${pathname}${hash}`;
  const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  await expect(page).toHaveURL(new RegExp(`${escaped}$`));
}

test.describe('Continuidad de acceso interno V3.1.1',()=>{
  test('un acceso directo a Finanzas conserva el destino después del primer registro',async({page})=>{
    await page.goto('/finanzas.html');
    await expect(page).toHaveURL(/\/acceso\.html\?next=finanzas\.html$/);
    await expect(page.getByText('Panel de control, Operación y Finanzas.',{exact:false})).toBeVisible();
    await createLocalAccess(page);
    await expectLocation(page,'/finanzas.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('Datos maestros exige sesión y conserva el destino solicitado',async({page})=>{
    await page.goto('/studio.html');
    await expect(page).toHaveURL(/\/acceso\.html\?next=studio\.html$/);
    await createLocalAccess(page);
    await expectLocation(page,'/studio.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.getByRole('heading',{name:'Gobernar productos y fuentes sin mezclar la operación.'})).toBeVisible();
  });

  test('Actas exige sesión y conserva el destino solicitado',async({page})=>{
    await page.goto('/actas.html');
    await expect(page).toHaveURL(/\/acceso\.html\?next=actas\.html$/);
    await createLocalAccess(page);
    await expectLocation(page,'/actas.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
    await expect(page.getByRole('heading',{name:'Validar con evidencia y dejar la decisión trazable.'})).toBeVisible();
  });

  test('el reingreso conserva el módulo solicitado con una cuenta ya creada',async({page})=>{
    await page.goto('/acceso.html?next=control.html');
    await createLocalAccess(page);
    await expectLocation(page,'/control.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await page.evaluate(()=>sessionStorage.removeItem('ee_v31_session'));
    await page.goto('/operacion.html');
    await expect(page).toHaveURL(/\/acceso\.html\?next=operacion\.html$/);
    await expect(page.getByLabel('Usuario')).toHaveValue('juan');
    await page.getByLabel('Contraseña',{exact:true}).fill('ClaveSegura123');
    await page.getByRole('button',{name:'Ingresar al sistema'}).click();
    await expectLocation(page,'/operacion.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('un deep link operativo conserva una sección interna permitida',async({page})=>{
    await page.goto('/operacion.html#compras');
    await expect(page).toHaveURL(/\/acceso\.html\?next=operacion\.html%23compras$/);
    await createLocalAccess(page);
    await expectLocation(page,'/operacion.html','#compras');
    await expect(page.locator('#compras')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('el deep link de evidencia V3.3.0 también sobrevive al acceso',async({page})=>{
    await page.goto('/operacion.html#evidencia');
    await expect(page).toHaveURL(/\/acceso\.html\?next=operacion\.html%23evidencia$/);
    await createLocalAccess(page);
    await expectLocation(page,'/operacion.html','#evidencia');
    await expect(page.locator('#evidencia')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-operational-evidence-version','3.3.0');
  });

  test('el deep link de cierre diario V3.6 sobrevive al acceso',async({page})=>{
    await page.goto('/operacion.html#cierre-diario');
    await expect(page).toHaveURL(/\/acceso\.html\?next=operacion\.html%23cierre-diario$/);
    await createLocalAccess(page);
    await expectLocation(page,'/operacion.html','#cierre-diario');
    await expect(page.locator('#cierre-diario')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-daily-close-version','3.6.0');
  });

  test('un hash no reconocido se descarta sin perder el módulo permitido',async({page})=>{
    await page.goto('/acceso.html?next=operacion.html%23seccion-inventada');
    await createLocalAccess(page,'admin','OtraClave123');
    await expectLocation(page,'/operacion.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('un destino no permitido nunca produce redirección externa',async({page})=>{
    await page.goto('/acceso.html?next=https%3A%2F%2Fevil.example');
    await createLocalAccess(page,'admin','OtraClave123');
    await expectLocation(page,'/centro-interno.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('la metadata V3.1.1 declara sólo destinos internos permitidos',async({page})=>{
    await page.goto('/acceso.html');
    const contract=await page.evaluate(()=>({version:window.EL_ERRANTE_ACCESS_V31.version,allowed:window.EL_ERRANTE_ACCESS_V31.allowedNext}));
    expect(contract.version).toBe('3.1.1');
    expect(contract.allowed['studio.html']).toEqual(['']);
    expect(contract.allowed['actas.html']).toEqual(['']);
    expect(contract.allowed['operacion.html']).toContain('#evidencia');
    expect(contract.allowed['operacion.html']).toContain('#cierre-diario');
    expect(Object.keys(contract.allowed).sort()).toEqual(['actas.html','centro-interno.html','control.html','finanzas.html','operacion.html','studio.html'].sort());
  });

  test('una sesión V3.1.0 vigente sigue siendo compatible con la shell V3.1.1',async({page})=>{
    await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
    await page.goto('/acceso.html?next=studio.html');
    await expectLocation(page,'/studio.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-internal-version','3.1.1');
  });
});
