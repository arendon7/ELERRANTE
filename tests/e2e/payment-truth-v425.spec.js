const {test,expect}=require('@playwright/test');

test.describe('V4.2.5 · verdad de datos de transferencia',()=>{
  test('Administración heredada no afirma Bancolombia ni tipo de cuenta sin configuración real',async({page})=>{
    await page.goto('/admin.html',{waitUntil:'load'});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminPaymentTruthVersion||''))
      .toBe('4.2.5');

    await page.evaluate(()=>{
      const root=document.getElementById('admin-dynamic');
      root.innerHTML=`<section class="ee-v14-card"><h2>Datos bancarios visibles en checkout</h2><div class="ee-v14-field"><label for="ee-bank-account">Cuenta de ahorros Bancolombia</label><input id="ee-bank-account"></div></section>`;
    });

    await expect(page.locator('label[for="ee-bank-account"]')).toHaveText('Número de cuenta');
    await expect(page.locator('#admin-dynamic h2')).toHaveText('Datos de transferencia visibles en checkout');
    await expect(page.locator('#admin-dynamic')).not.toContainText('Bancolombia');
    await expect(page.locator('#admin-dynamic')).not.toContainText('Cuenta de ahorros');
  });
});