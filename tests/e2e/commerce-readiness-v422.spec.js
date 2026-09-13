const { test, expect } = require('@playwright/test');

test.describe('V4.2.2 · barrera de activación comercial',()=>{
  test('backend conectado sin datos de pago mantiene el checkout protegido',async({page})=>{
    await page.goto('/checkout.html');
    await page.waitForFunction(()=>Boolean(window.EE_PUBLIC_COMMERCE_GUARD_V29));

    await page.evaluate(()=>{
      window.EL_ERRANTE_COMMERCE_CONFIG={
        backend:{url:'https://example.supabase.co',publishableKey:'sb_publishable_test'},
        payment:{accountNumber:'',key:''},
        ordering:{}
      };
      document.body.dataset.page='checkout';
      document.dispatchEvent(new CustomEvent('ee:checkout-runtime'));
    });

    const state=await page.evaluate(()=>({
      backend:window.EE_PUBLIC_COMMERCE_GUARD_V29.backendConnected(),
      payment:window.EE_PUBLIC_COMMERCE_GUARD_V29.paymentReady(),
      checkout:window.EE_PUBLIC_COMMERCE_GUARD_V29.connected(),
      marker:document.documentElement.dataset.eePublicCommerce
    }));

    expect(state.backend).toBe(true);
    expect(state.payment).toBe(false);
    expect(state.checkout).toBe(false);
    expect(state.marker).toBe('payment-pending');
    await expect(page.locator('.ee-v29-commerce-offline')).toBeVisible();
    await expect(page.locator('#ee-address')).toHaveCount(0);
    await expect(page.locator('#ee-receipt')).toHaveCount(0);
  });

  test('la barrera reconoce el checkout como listo cuando existe backend y medio de pago',async({page})=>{
    await page.goto('/checkout.html');
    await page.waitForFunction(()=>Boolean(window.EE_PUBLIC_COMMERCE_GUARD_V29));

    const state=await page.evaluate(()=>{
      window.EL_ERRANTE_COMMERCE_CONFIG={
        backend:{url:'https://example.supabase.co',publishableKey:'sb_publishable_test'},
        payment:{accountNumber:'123456789',key:''},
        ordering:{}
      };
      return {
        backend:window.EE_PUBLIC_COMMERCE_GUARD_V29.backendConnected(),
        payment:window.EE_PUBLIC_COMMERCE_GUARD_V29.paymentReady(),
        checkout:window.EE_PUBLIC_COMMERCE_GUARD_V29.connected()
      };
    });

    expect(state.backend).toBe(true);
    expect(state.payment).toBe(true);
    expect(state.checkout).toBe(true);
  });
});
