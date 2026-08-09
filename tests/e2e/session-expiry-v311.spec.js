const {test,expect}=require('@playwright/test');

function sessionPayload(expiresOffsetMs){
  const now=Date.now();
  return {version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+expiresOffsetMs).toISOString()};
}

async function seedSession(page,expiresOffsetMs){
  const payload=sessionPayload(expiresOffsetMs);
  await page.addInitScript(value=>sessionStorage.setItem('ee_v31_session',JSON.stringify(value)),payload);
}

async function expectAccess(page,next){
  await expect.poll(()=>page.evaluate(()=>({pathname:location.pathname,search:location.search}))).toEqual({pathname:'/acceso.html',search:`?next=${encodeURIComponent(next)}`});
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('ee_v31_session'))).toBeNull();
}

test.describe('Expiración de sesión interna V3.1.1',()=>{
  test('una sesión ya vencida se rechaza al cargar y conserva el destino',async({page})=>{
    await seedSession(page,-1000);
    await page.goto('/finanzas.html');
    await expectAccess(page,'finanzas.html');
  });

  test('una pestaña abierta sale automáticamente cuando vence la sesión',async({page})=>{
    await seedSession(page,1500);
    await page.goto('/operacion.html#compras');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('#compras')).toBeVisible();
    await expectAccess(page,'operacion.html#compras');
  });

  test('al volver a una pestaña se revalida una sesión vencida aunque el temporizador haya sido diferido',async({page})=>{
    await seedSession(page,8*3600000);
    await page.goto('/control.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await page.evaluate(()=>{
      const key='ee_v31_session';
      const value=JSON.parse(sessionStorage.getItem(key));
      value.expiresAt=new Date(Date.now()-1000).toISOString();
      sessionStorage.setItem(key,JSON.stringify(value));
      window.dispatchEvent(new Event('focus'));
    });
    await expectAccess(page,'control.html');
  });

  test('revalidar una sesión vigente no interrumpe el módulo',async({page})=>{
    await seedSession(page,8*3600000);
    await page.goto('/centro-interno.html');
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await page.evaluate(()=>window.EL_ERRANTE_INTERNAL_V31.enforceSession());
    await expect(page).toHaveURL(/\/centro-interno\.html$/);
    await expect(page.getByRole('heading',{name:'Elige dónde quieres trabajar.'})).toBeVisible();
  });
});