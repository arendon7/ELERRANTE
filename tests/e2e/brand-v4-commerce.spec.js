const { test, expect } = require('@playwright/test');

const publicV4=['/tienda.html','/en-casa.html','/producto.html?id=la-errante','/en-movimiento.html'];

test.describe('V4 comercio y hospitalidad',()=>{
  test('Tienda conserva catálogo real dentro del nuevo sistema editorial',async({page})=>{
    await page.goto('/tienda.html');
    await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
    await expect(page.locator('body')).toHaveAttribute('data-v4-public','true');
    await expect(page.getByRole('heading',{name:'Entra al proceso donde quieras.'})).toBeVisible();
    await expect(page.locator('.v4-public-header')).toBeVisible();
    await expect(page.locator('.v4-public-brand-mark')).toHaveAttribute('src','assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    await expect(page.locator('.v4-public-brand')).not.toHaveAttribute('data-master-status','awaiting-approved-binary');
    await expect(page.locator('#product-grid')).toBeVisible();
    await expect.poll(()=>page.locator('#product-grid > *').count()).toBe(11);
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
  });

  test('En Casa preserva Segundo Fuego, colección y autoridad de etiqueta',async({page})=>{
    await page.goto('/en-casa.html');
    await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
    await expect(page.getByRole('heading',{name:'Nosotros hacemos el tiempo. Tú completas el fuego.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Tu horno no necesita comportarse como el nuestro.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'No congelamos una pizza terminada. Diseñamos una pizza para terminarse dos veces.'})).toBeVisible();
    await expect(page.getByText('1 · Primer Fuego')).toBeVisible();
    await expect(page.getByText('2 · Transición')).toBeVisible();
    await expect(page.getByText('3 · Segundo Fuego')).toBeVisible();
    await expect(page.getByText('Segundo Fuego es el nombre que damos a la investigación detrás de En Casa.')).toBeVisible();
    await expect(page.getByRole('heading',{name:'La etiqueta tiene la última palabra.'})).toBeVisible();
    await expect.poll(()=>page.locator('#casa-products > *').count()).toBe(5);
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
  });

  test('ficha V4 conserva motor dinámico, verdad de producto y compra',async({page})=>{
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(()=>document.querySelector('#dynamic-product')?.dataset?.v303Ready==='true');
    await expect(page.locator('#dynamic-product')).toHaveAttribute('data-v303-ready','true');
    await expect(page.locator('.product-detail')).toBeVisible();
    await expect(page.locator('.product-buy')).toBeVisible();
    await expect(page.locator('.v305-gallery')).toBeVisible();
    await expect(page.locator('[data-v303-block="essential"]')).toContainText('Pasaporte de producto');
    await expect(page.locator('[data-v303-block="service"]')).toContainText('Segundo Fuego');
    await expect(page.locator('.buy-product').first()).toBeVisible();
    await expect(page.locator('link[href="assets/brand-v4-product.css"]')).toHaveCount(1);
    await expect(page.locator('link[href^="assets/brand-v4-product-refinement.css"]')).toHaveCount(1);
  });

  test('Producto normaliza bloques editoriales heredados al canon V4',async({page})=>{
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(()=>{
      const root=document.querySelector('#dynamic-product');
      return root?.dataset?.v303Ready==='true'&&root?.dataset?.v302Ready==='true'&&root?.dataset?.v304Ready==='true';
    });

    const quick=page.locator('.product-buy .v304-quick');
    await expect(quick).toBeVisible();
    const quickGeometry=await page.locator('.product-buy').evaluate(buy=>{
      const node=buy.querySelector('.v304-quick');
      const copy=node.querySelector('.v304-quick-copy');
      const facts=node.querySelector('.v304-quick-facts');
      const actions=node.querySelector('.v304-quick-actions');
      const buyRect=buy.getBoundingClientRect();
      const quickRect=node.getBoundingClientRect();
      const copyRect=copy.getBoundingClientRect();
      const factsRect=facts.getBoundingClientRect();
      const actionsRect=actions.getBoundingClientRect();
      const actionRects=[...actions.querySelectorAll('button,a')].map(item=>item.getBoundingClientRect());
      return {
        display:getComputedStyle(node).display,
        actionsInside:actionRects.every(rect=>rect.left>=buyRect.left-1&&rect.right<=buyRect.right+1),
        verticalFlow:copyRect.bottom<=factsRect.top+1&&factsRect.bottom<=actionsRect.top+1,
        copyCoverage:copyRect.width/quickRect.width,
        factsInside:factsRect.left>=quickRect.left-1&&factsRect.right<=quickRect.right+1,
        actionsInsideQuick:actionsRect.left>=quickRect.left-1&&actionsRect.right<=quickRect.right+1
      };
    });
    expect(quickGeometry.display).toBe('block');
    expect(quickGeometry.actionsInside).toBe(true);
    expect(quickGeometry.verticalFlow).toBe(true);
    expect(quickGeometry.copyCoverage).toBeGreaterThan(.9);
    expect(quickGeometry.factsInside).toBe(true);
    expect(quickGeometry.actionsInsideQuick).toBe(true);

    const craftCards=page.locator('[data-v302-block="craft-proof"] .v302-craft-card');
    await expect(craftCards).toHaveCount(3);
    const craftStyle=await craftCards.first().evaluate(node=>{
      const style=getComputedStyle(node);
      return {radius:style.borderRadius,background:style.backgroundColor};
    });
    expect(craftStyle.radius).toBe('0px');
    expect(craftStyle.background).toBe('rgba(0, 0, 0, 0)');

    const craftEyebrow=page.locator('[data-v302-block="craft-proof"] .eyebrow').first();
    await expect(craftEyebrow).toBeVisible();
    expect(await craftEyebrow.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(140, 113, 61)');
    const kicker=page.locator('[data-v302-block="craft-proof"] .v30-kicker').first();
    expect(await kicker.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(140, 113, 61)');

    const compareEyebrow=page.locator('.v304-compare .eyebrow').first();
    await expect(compareEyebrow).toBeVisible();
    expect(await compareEyebrow.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(140, 113, 61)');
    const compareHeading=page.locator('.v304-compare h2').first();
    expect(await compareHeading.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(23, 22, 17)');

    const workshopQuote=page.locator('[data-v30-block="workshop"] .quote');
    await expect(workshopQuote).toBeVisible();
    expect(await workshopQuote.evaluate(node=>getComputedStyle(node).borderLeftColor)).toBe('rgb(140, 113, 61)');
    const secondFireQuote=page.locator('[data-v30-block="second-fire"] .quote');
    await expect(secondFireQuote).toBeVisible();
    expect(await secondFireQuote.evaluate(node=>getComputedStyle(node).borderLeftColor)).toBe('rgb(183, 154, 91)');

    const option=page.locator('.product-buy .option').first();
    if(await option.count()){
      expect(await option.evaluate(node=>getComputedStyle(node).borderRadius)).toBe('0px');
    }

    const activeTab=page.locator('.product-tabs .tab-btn.active').first();
    if(await activeTab.count()){
      expect(await activeTab.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(23, 22, 17)');
    }
    const activePanelText=page.locator('.product-tabs .tab-panel.active').locator('h1,h2,h3,p').first();
    if(await activePanelText.count()){
      expect(await activePanelText.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(23, 22, 17)');
    }

    const legacyDecisionCards=page.locator('[data-v29-product-story] .feature-card');
    await expect(legacyDecisionCards).toHaveCount(4);
    const legacyDecisionStyle=await legacyDecisionCards.first().evaluate(node=>{
      const style=getComputedStyle(node);
      return {radius:style.borderRadius,background:style.backgroundColor};
    });
    expect(legacyDecisionStyle.radius).toBe('0px');
    expect(legacyDecisionStyle.background).toBe('rgba(0, 0, 0, 0)');
    expect(await legacyDecisionCards.first().locator('.intent-index').evaluate(node=>getComputedStyle(node).color)).toBe('rgb(183, 154, 91)');

    const darkPackage=page.locator('[data-v29-product-story] .section-dark .package-list');
    await expect(darkPackage).toBeVisible();
    const darkPackageColors=await darkPackage.evaluate(node=>({
      strong:getComputedStyle(node.querySelector('strong')).color,
      span:getComputedStyle(node.querySelector('span')).color
    }));
    expect(darkPackageColors.strong).toBe('rgb(183, 154, 91)');
    expect(darkPackageColors.span).not.toBe('rgb(25, 24, 23)');

    await expect(page.locator('[data-v30-block="workshop"]')).toBeVisible();
    await expect(page.locator('[data-v30-block="author"]')).toBeVisible();
  });

  test('En Movimiento conserva formulario operativo y elimina terracota como superficie',async({page})=>{
    await page.goto('/en-movimiento.html#cotizar');
    await expect(page.getByRole('heading',{name:'No llevamos una caja de pizzas. Llevamos la cocina.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Ordena los datos de la próxima ruta.'})).toBeVisible();
    const form=page.locator('#ee-v29-quote-form');
    await expect(form).toBeVisible();
    await expect(form.locator('.form-step')).toHaveCount(3);
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
    await expect(page.locator('link[href="assets/brand-v4-events.css"]')).toHaveCount(1);
  });

  for(const path of publicV4){
    test(`${path} mantiene shell V4 y no desborda en móvil`,async({page},testInfo)=>{
      test.skip(!testInfo.project.name.includes('mobile'),'Gate móvil');
      await page.goto(path);
      await expect(page.locator('.v4-public-header')).toBeVisible();
      await expect(page.locator('.v4-public-brand-mark')).toBeVisible();
      await expect(page.locator('#site-header img[src*="logo-mark"]')).toHaveCount(0);
      const toggle=page.locator('.v4-public-menu-toggle');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.locator('.v4-public-drawer')).toHaveClass(/open/);
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      expect(width.scroll).toBeLessThanOrEqual(width.client+1);
    });
  }
});