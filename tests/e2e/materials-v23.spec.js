const {test,expect}=require('@playwright/test');

async function seed(page,{stock=null}={}){
  await page.addInitScript(({stock})=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([
      {
        id:'EE-V23-UNO',status:'approved',createdAt:'2026-08-05T18:00:00.000Z',
        customer:{name:'Cliente Uno'},delivery:{city:'Medellín',requestedDate:'2026-08-09'},
        items:[
          {productId:'la-errante',name:'La Errante',quantity:2},
          {productId:'margherita-del-taller',name:'Margherita del Taller',quantity:1}
        ]
      },
      {
        id:'EE-V23-COMBO',status:'preparing',createdAt:'2026-08-05T19:00:00.000Z',
        customer:{name:'Cliente Dos'},delivery:{city:'Envigado',requestedDate:'2026-08-09'},
        items:[{productId:'combo-primera-ruta',name:'Combo Primera Ruta',quantity:1}]
      }
    ]));
    if(stock===null)localStorage.removeItem('ee_v23_material_stock');
    else localStorage.setItem('ee_v23_material_stock',JSON.stringify(stock));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-09');
  },{stock});
}

async function openMaterials(page){
  await page.goto('/admin.html');
  await page.getByRole('button',{name:'Abrir simulación local'}).click();
  const panel=page.locator('#materials-v23');
  await expect(panel.getByRole('heading',{name:'Lo necesario para producir, sin saturar el panel.'})).toBeVisible();
  return panel;
}

test.describe('Materias primas e inventario inteligente V2.3.1',()=>{
  test('convierte pedidos en productos, materiales y costo provisional',async({page})=>{
    await seed(page);
    const panel=await openMaterials(page);
    await expect(panel.locator('[data-v23-product="EE-ERR-01"] td').nth(1)).toHaveText('2');
    await expect(panel.locator('[data-v23-product="EE-MAR-01"] td').nth(1)).toHaveText('1');
    await expect(panel.locator('[data-v23-product="EE-CPR-01"] td').nth(1)).toHaveText('1');
    await expect(panel.locator('[data-v23-material="MP-HFS"]')).toBeVisible();
    await expect(panel.getByText('Sin conteo').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-materials-version','2.3.1');
  });

  test('explota el combo en componentes sin crear inventario ficticio',async({page})=>{
    await seed(page);
    const panel=await openMaterials(page);
    await expect(panel.locator('[data-v23-material="EMP-COMBO"]')).toBeVisible();
    await expect(panel.locator('[data-v23-material="EMP-DYP1"]')).toBeVisible();
    await expect(panel.locator('[data-v23-material="EMP-VAC2"]')).toBeVisible();
    await expect(panel.locator('[data-v23-material="EMP-BOT250"]')).toBeVisible();
  });

  test('guardar un conteo visible preserva materiales no requeridos ese día',async({page})=>{
    await seed(page,{stock:{'MP-HFS':500,'MP-SALAME':42}});
    const panel=await openMaterials(page);
    await expect(panel.locator('[data-v23-stock="MP-SALAME"]')).toHaveCount(0);
    await panel.getByText('Actualizar conteo de materiales').click();
    await panel.locator('[data-v23-stock="MP-HFS"]').fill('650');
    await panel.getByRole('button',{name:'Guardar conteo'}).click();
    const stock=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')));
    expect(stock['MP-HFS']).toBe(650);
    expect(stock['MP-SALAME']).toBe(42);
  });

  test('dejar vacío elimina sólo el conteo visible y conserva los demás',async({page})=>{
    await seed(page,{stock:{'MP-HFS':500,'MP-SALAME':42}});
    const panel=await openMaterials(page);
    await panel.getByText('Actualizar conteo de materiales').click();
    await panel.locator('[data-v23-stock="MP-HFS"]').fill('');
    await panel.getByRole('button',{name:'Guardar conteo'}).click();
    const stock=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')));
    expect(Object.prototype.hasOwnProperty.call(stock,'MP-HFS')).toBe(false);
    expect(stock['MP-SALAME']).toBe(42);
    await expect(panel.locator('[data-v23-material="MP-HFS"]')).toContainText('Sin conteo');
  });

  test('distingue inventario desconocido de cero físico confirmado sin borrar otros conteos',async({page})=>{
    await seed(page,{stock:{'MP-SALAME':42}});
    const panel=await openMaterials(page);
    await panel.getByText('Actualizar conteo de materiales').click();
    await panel.locator('[data-v23-stock="MP-HFS"]').fill('0');
    await panel.getByRole('button',{name:'Guardar conteo'}).click();
    const row=panel.locator('[data-v23-material="MP-HFS"]');
    await expect(row).toContainText('0 g');
    await expect(row).toContainText('Faltan');
    const stock=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')));
    expect(stock['MP-HFS']).toBe(0);
    expect(stock['MP-SALAME']).toBe(42);
  });

  test('mantiene recetas y finanzas fuera de la vista principal',async({page})=>{
    await seed(page);
    await openMaterials(page);
    const recipe=page.locator('#materials-v23').locator('details').filter({hasText:'Consultar receta y costo provisional'});
    await expect(recipe).not.toHaveAttribute('open','');
    const finance=page.locator('.ee-v23-finance');
    await expect(finance).toBeVisible();
    await expect(finance).not.toHaveAttribute('open','');
    await expect(finance.getByText('Resumen financiero y análisis avanzado')).toBeVisible();
  });

  test('no genera desbordamiento horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación exclusiva del proyecto móvil');
    await seed(page);
    await openMaterials(page);
    await expect(page.locator('#materials-v23')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
