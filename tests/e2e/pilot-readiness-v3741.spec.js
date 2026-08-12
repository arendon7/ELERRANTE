const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Piloto QA',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}
async function reset(page){
  await page.evaluate(()=>['ee_v37_pilot_events','ee_v311_operational_demo','ee_v329_finance_demo'].forEach(key=>localStorage.removeItem(key)));
}
function today(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});}

test.describe('V3.7.4.1 · readiness UX del piloto',()=>{
  test('sin piloto deja inicio habilitado y bloquea checkpoint/cierre',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-pilot-readiness-version','3.7.4.1');
    await expect(page.locator('#v37-start-form button')).toBeEnabled();
    await expect(page.locator('#v37-checkpoint')).toBeDisabled();
    await expect(page.locator('#v37-end')).toBeDisabled();
    await expect(page.getByText('Completa los cinco controles antes de iniciar el primer periodo real.')).toBeVisible();
  });

  test('al iniciar desde la UI el preflight queda bloqueado y continuidad se habilita',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    const form=page.locator('#v37-start-form');
    await form.locator('input[name="start"]').fill(today());
    await form.locator('input[name="end"]').fill(today());
    for(const name of ['singleDevice','catalogValidated','inventoryCounted','financePrivate','cashObserved']) await form.locator(`input[name="${name}"]`).check();
    await form.locator('textarea[name="note"]').fill('Inicio real controlado para prueba de readiness.');
    const download=page.waitForEvent('download');
    await form.locator('button').click();
    await download;
    await expect(page.locator('#v37-start-form button')).toBeDisabled();
    await expect(page.locator('#v37-start-form input[name="start"]')).toBeDisabled();
    await expect(page.locator('#v37-checkpoint')).toBeEnabled();
    await expect(page.locator('#v37-end')).toBeEnabled();
    await expect(page.getByText(/Piloto activo .* El preflight queda bloqueado/)).toBeVisible();
  });

  test('al cerrar vuelve a permitir un nuevo periodo y bloquea continuidad',async({page})=>{
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);
    await page.evaluate(async date=>{
      const att={singleDevice:true,catalogValidated:true,inventoryCounted:true,financePrivate:true,cashObserved:true};
      await window.EL_ERRANTE_PILOT_V37.beginPilot({start:date,end:date,note:'Inicio para cierre controlado',attestations:att,downloadBackup:false});
      await window.EL_ERRANTE_PILOT_V37.finishPilot({note:'Piloto cerrado correctamente para validar readiness.',downloadBackup:false});
      window.EL_ERRANTE_PILOT_READINESS_V3741.apply();
    },today());
    await expect(page.locator('#v37-start-form button')).toBeEnabled();
    await expect(page.locator('#v37-checkpoint')).toBeDisabled();
    await expect(page.locator('#v37-end')).toBeDisabled();
    await expect(page.getByText('El piloto anterior está cerrado. Puedes iniciar un nuevo periodo cuando corresponda.')).toBeVisible();
  });

  test('móvil conserva ancho de viewport',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);await page.goto('/piloto-operativo.html');await reset(page);await page.reload();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});