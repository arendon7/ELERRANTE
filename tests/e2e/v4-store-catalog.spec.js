const { test, expect } = require('@playwright/test');

async function waitForCatalog(page){
  await page.goto('/tienda.html');
  await page.waitForFunction(()=>window.EE_DATA?.products?.length===11&&document.querySelectorAll('#product-grid>.product-card').length===11);
  await expect(page.locator('#product-grid>.product-card')).toHaveCount(11);
  await expect(page.locator('link[href^="assets/brand-v4-store-catalog.css"]')).toHaveCount(1);
}

test.describe('V4 Tienda · catálogo editorial compacto',()=>{
  test('desktop abandona el card wall sin perder información comercial',async({page},testInfo)=>{
    test.skip(testInfo.project.name.includes('mobile'),'Gate desktop');
    await waitForCatalog(page);

    const metrics=await page.locator('#catalogo').evaluate(section=>{
      const grid=section.querySelector('#product-grid');
      const card=grid.querySelector('.product-card');
      const filter=section.querySelector('.filter-btn');
      const copy=card.querySelector('.product-copy');
      const actions=[...card.querySelectorAll('.product-actions .btn')];
      const gridStyle=getComputedStyle(grid);
      const cardStyle=getComputedStyle(card);
      return {
        gridColumns:gridStyle.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
        cardDisplay:cardStyle.display,
        cardRadius:cardStyle.borderRadius,
        cardBackground:cardStyle.backgroundColor,
        filterRadius:getComputedStyle(filter).borderRadius,
        copyDisplay:getComputedStyle(copy).display,
        actionCount:actions.length,
        actionHeights:actions.map(node=>node.getBoundingClientRect().height)
      };
    });

    expect(metrics.gridColumns).toBe(2);
    expect(metrics.cardDisplay).toBe('grid');
    expect(metrics.cardRadius).toBe('0px');
    expect(metrics.cardBackground).toBe('rgba(0, 0, 0, 0)');
    expect(metrics.filterRadius).toBe('0px');
    expect(metrics.copyDisplay).not.toBe('none');
    expect(metrics.actionCount).toBeGreaterThanOrEqual(2);
    expect(metrics.actionHeights.every(height=>height>=40)).toBe(true);
  });

  test('móvil reduce la longitud del catálogo y conserva decisión + compra',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Gate móvil');
    await waitForCatalog(page);

    const metrics=await page.locator('#catalogo').evaluate(section=>{
      const grid=section.querySelector('#product-grid');
      const cards=[...grid.querySelectorAll(':scope>.product-card')];
      const first=cards[0];
      const media=first.querySelector('.product-media');
      const copy=first.querySelector('.product-copy');
      const actions=[...first.querySelectorAll('.product-actions .btn')];
      const firstRect=first.getBoundingClientRect();
      const mediaRect=media.getBoundingClientRect();
      return {
        gridColumns:getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
        cardColumns:getComputedStyle(first).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
        copyDisplay:getComputedStyle(copy).display,
        cardHeight:firstRect.height,
        cardWidth:firstRect.width,
        mediaShare:mediaRect.width/firstRect.width,
        gridHeight:grid.getBoundingClientRect().height,
        actionCount:actions.length,
        actionHeights:actions.map(node=>node.getBoundingClientRect().height),
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth
      };
    });

    expect(metrics.gridColumns).toBe(1);
    expect(metrics.cardColumns).toBe(2);
    expect(metrics.copyDisplay).toBe('none');
    expect(metrics.cardHeight).toBeLessThan(metrics.cardWidth*1.05);
    expect(metrics.mediaShare).toBeGreaterThan(.32);
    expect(metrics.mediaShare).toBeLessThan(.48);
    expect(metrics.gridHeight).toBeLessThan(4200);
    expect(metrics.actionCount).toBeGreaterThanOrEqual(2);
    expect(metrics.actionHeights.every(height=>height>=36)).toBe(true);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth+1);
  });
});
