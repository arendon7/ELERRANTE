const {test,expect}=require('@playwright/test');

async function seedOperational(page){
  await page.addInitScript(()=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-V30-001',status:'approved',createdAt:'2026-08-07T10:00:00.000Z',
      delivery:{requestedDate:'2026-08-07',city:'Medellín'},customer:{name:'Prueba V3'},
      items:[{productId:'la-errante',name:'La Errante',quantity:2}]
    }]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':100,'MP-HHO':100,'MP-POM90':0,'MP-MOZ':0,'MP-CHO':0,'MP-CEB':0,'MP-PAR':0,'MP-PYM':0,'MP-ACE':0,'EMP-VAC1':0,'EMP-ETQ':0,'CIF-GAS':0}));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-07');
  });
}

test.describe('Arquitectura interna V3.0',()=>{
  test('el centro interno separa operación y finanzas como destinos principales',async({page})=>{
    await page.goto('/centro-interno.html');
    await expect(page.getByRole('heading',{name:'Dos preguntas. Dos paneles.'})).toBeVisible();
    await expect(page.getByRole('link',{name:/Abrir panel de control/})).toHaveAttribute('href','control.html');
    await expect(page.getByRole('link',{name:/Abrir panel financiero/})).toHaveAttribute('href','finanzas.html');
  });

  test('el panel de control prioriza operación y no monta finanzas',async({page})=>{
    await seedOperational(page);
    await page.goto('/control.html');
    await expect(page.locator('html')).toHaveAttribute('data-control-version','3.0.0');
    await expect(page.locator('#control-v30')).toContainText('Unidades por producir');
    await expect(page.locator('#control-v30')).toContainText('2');
    await expect(page.locator('#finance-v27')).toHaveCount(0);
    await expect(page.getByText('Sin métricas financieras')).toBeVisible();
  });

  test('operación carga la cadena diaria pero no el motor financiero',async({page})=>{
    await seedOperational(page);
    await page.goto('/operacion.html');
    await expect(page.getByRole('heading',{name:'Del pedido al despacho, sin saltos invisibles.'})).toBeVisible();
    await expect(page.locator('#daily-ops-v21')).toContainText('Mesa de pedidos y continuidad local');
    await expect(page.locator('#production-v22')).toContainText('Agenda de alistamiento por fecha');
    await expect(page.locator('#materials-v23')).toContainText('Lo necesario para producir, sin saturar el panel.');
    await expect(page.locator('html')).toHaveAttribute('data-daily-ops-version','2.1.0');
    await expect(page.locator('html')).toHaveAttribute('data-production-version','2.2.0');
    await expect(page.locator('#finance-v27')).toHaveCount(0);
  });

  test('finanzas monta el motor financiero y no superficies de ejecución',async({page})=>{
    await page.goto('/finanzas.html');
    await expect(page.locator('#finance-v27')).toContainText('Control financiero sin convertir la web en contabilidad.');
    await expect(page.locator('#production-v22')).toHaveCount(0);
    await expect(page.locator('#materials-v23')).toHaveCount(0);
    await expect(page.getByText('Mapa de migración del MFO')).toBeVisible();
  });

  test('las nuevas superficies internas no desbordan en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    for(const path of ['/centro-interno.html','/control.html','/operacion.html','/finanzas.html']){
      await page.goto(path);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`overflow en ${path}`).toBeLessThanOrEqual(2);
    }
  });
});
