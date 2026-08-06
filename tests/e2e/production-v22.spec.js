const {test,expect}=require('@playwright/test');
const fs=require('fs');

async function seed(page){
  await page.addInitScript(()=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([
      {
        id:'EE-V22-APROBADO',createdAt:'2026-08-05T18:00:00.000Z',status:'approved',total:90000,
        customer:{name:'Cliente Uno',email:'uno@example.com',phone:'3001111111'},
        delivery:{city:'Medellín',neighborhood:'Laureles',address:'Calle privada 10',requestedDate:'2026-08-08'},
        items:[{productId:'la-errante',name:'La Errante',quantity:2,unitPrice:45000,unitCost:18000,lineTotal:90000}],
        receiptDataUrl:'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y=',statusTimeline:[]
      },
      {
        id:'EE-V22-PREPARANDO',createdAt:'2026-08-05T19:00:00.000Z',status:'preparing',total:70000,
        customer:{name:'Cliente Dos',email:'dos@example.com',phone:'3002222222'},
        delivery:{city:'Envigado',neighborhood:'Otra Parte',address:'Carrera privada 20',requestedDate:'2026-08-08'},
        items:[
          {productId:'la-errante',name:'La Errante',quantity:1,unitPrice:45000,unitCost:18000,lineTotal:45000},
          {productId:'salsa',name:'Salsa de tomate',quantity:2,unitPrice:12500,unitCost:5000,lineTotal:25000}
        ],
        receiptDataUrl:'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y=',statusTimeline:[]
      },
      {
        id:'EE-V22-DESPACHADO',createdAt:'2026-08-05T20:00:00.000Z',status:'dispatched',total:45000,
        customer:{name:'Cliente Tres',email:'tres@example.com',phone:'3003333333'},
        delivery:{city:'Sabaneta',neighborhood:'Centro',address:'Dirección privada 30',requestedDate:'2026-08-08'},
        items:[{productId:'la-errante',name:'La Errante',quantity:1,unitPrice:45000,unitCost:18000,lineTotal:45000}],
        receiptDataUrl:'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y=',statusTimeline:[]
      }
    ]));
    localStorage.setItem('ee_v22_fulfillment',JSON.stringify({
      'EE-V22-DESPACHADO':{productReady:true,packagingReady:true,quantityChecked:true,deliveryCoordinated:true,note:'Salida registrada'}
    }));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-08');
  });
}

test.describe('Producción y despacho V2.2',()=>{
  test('consolida unidades y programa pedidos por fecha',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const board=page.locator('#production-v22');
    await expect(board.getByRole('heading',{name:'Agenda de alistamiento por fecha'})).toBeVisible();
    await expect(board.locator('#ee-v22-date')).toHaveValue('2026-08-08');
    await expect(board.locator('[data-v22-product="la-errante"] td').nth(3)).toHaveText('3');
    await expect(board.locator('[data-v22-product="salsa"] td').nth(3)).toHaveText('2');
    await expect(board.locator('[data-v22-order]')).toHaveCount(3);
    await expect(page.locator('html')).toHaveAttribute('data-production-version','2.2.0');
  });

  test('guarda alistamiento y solo entonces permite despachar',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const board=page.locator('#production-v22');
    let card=board.locator('[data-v22-order="EE-V22-PREPARANDO"]');
    await expect(card.getByRole('button',{name:'Despachar pedido'})).toBeDisabled();
    for(const label of ['Producto listo','Empaque y etiqueta','Cantidad verificada','Entrega coordinada']){
      await card.getByLabel(label).check();
    }
    await card.getByPlaceholder('Lote, empaque, novedad o coordinación').fill('Lote 22 confirmado');
    await card.getByRole('button',{name:'Guardar alistamiento'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v22_fulfillment'))['EE-V22-PREPARANDO'].deliveryCoordinated)).toBe(true);
    card=board.locator('[data-v22-order="EE-V22-PREPARANDO"]');
    await expect(card.getByRole('button',{name:'Despachar pedido'})).toBeEnabled();
    page.once('dialog',dialog=>dialog.accept());
    await card.getByRole('button',{name:'Despachar pedido'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')).find(order=>order.id==='EE-V22-PREPARANDO').status)).toBe('dispatched');
  });

  test('bloquea también el despacho desde la ficha V2.1 cuando falta alistamiento',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const daily=page.locator('#daily-ops-v21');
    await daily.locator('[data-v21-order="EE-V22-PREPARANDO"]').getByRole('button',{name:'Abrir pedido'}).click();
    const dialog=page.locator('#ee-v21-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button',{name:'Marcar despachado'})).toBeDisabled();
    await expect(dialog.getByText('El despacho requiere 4 de 4 controles guardados en Producción V2.2.')).toBeVisible();
  });

  test('exporta una lista de preparación sin datos personales',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const downloadPromise=page.waitForEvent('download');
    await page.locator('#production-v22').getByRole('button',{name:'Exportar preparación'}).click();
    const download=await downloadPromise;
    expect(download.suggestedFilename()).toBe('el-errante-preparacion-2026-08-08.csv');
    const csv=fs.readFileSync(await download.path(),'utf8');
    expect(csv).toContain('La Errante');
    expect(csv).toContain('EE-V22-APROBADO');
    expect(csv).not.toContain('Calle privada 10');
    expect(csv).not.toContain('3001111111');
    expect(csv).not.toContain('uno@example.com');
  });

  test('no produce desbordamiento horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación exclusiva del proyecto móvil');
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    await expect(page.locator('#production-v22')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
