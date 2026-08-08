const {test,expect}=require('@playwright/test');

async function createLocalAccess(page,username='juan',password='ClaveSegura123'){
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraseña',{exact:true}).fill(password);
  await page.getByLabel('Confirmar contraseña').fill(password);
  await page.getByRole('button',{name:'Crear acceso y entrar'}).click();
}

test.describe('Continuidad de acceso interno V3.1.1',()=>{
  test('un acceso directo a Finanzas conserva el destino después del primer registro',async({page})=>{
    await page.goto('/finanzas.html');
    await expect(page).toHaveURL(/acceso\.html\?next=finanzas\.html$/);
    await expect(page.getByText('Panel de control, Operación y Finanzas.',{exact:false})).toBeVisible();
    await createLocalAccess(page);
    await expect(page).toHaveURL(/finanzas\.html$/);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('el reingreso conserva el módulo solicitado con una cuenta ya creada',async({page})=>{
    await page.goto('/acceso.html?next=control.html');
    await createLocalAccess(page);
    await expect(page).toHaveURL(/control\.html$/);
    await page.evaluate(()=>sessionStorage.removeItem('ee_v31_session'));
    await page.goto('/operacion.html');
    await expect(page).toHaveURL(/acceso\.html\?next=operacion\.html$/);
    await expect(page.getByLabel('Usuario')).toHaveValue('juan');
    await page.getByLabel('Contraseña',{exact:true}).fill('ClaveSegura123');
    await page.getByRole('button',{name:'Ingresar al sistema'}).click();
    await expect(page).toHaveURL(/operacion\.html$/);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('un destino no permitido nunca produce redirección externa',async({page})=>{
    await page.goto('/acceso.html?next=https%3A%2F%2Fevil.example');
    await createLocalAccess(page,'admin','OtraClave123');
    await expect(page).toHaveURL(/centro-interno\.html$/);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });

  test('una sesión vigente también respeta un next interno permitido',async({page})=>{
    await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
    await page.goto('/acceso.html?next=control.html');
    await expect(page).toHaveURL(/control\.html$/);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
  });
});