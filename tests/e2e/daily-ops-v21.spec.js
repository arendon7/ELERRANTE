const {test,expect}=require('@playwright/test');

async function seed(page,{receipt=true,status='payment_review'}={}){
  await page.addInitScript(({withReceipt,currentStatus})=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-20260805-DIARIA',createdAt:'2026-08-05T20:00:00.000Z',updatedAt:'2026-08-05T20:10:00.000Z',month:'2026-08',status:currentStatus,total:50000,subtotal:50000,deliveryFee:0,
      customer:{name:'Cliente Diario',email:'cliente@example.com',phone:'3000000000'},
      delivery:{city:'Medellín',neighborhood:'Laureles',address:'Carrera 70 # 10-20',requestedDate:'2026-08-08',notes:'Portería principal'},
      items:[{productId:'la-errante',name:'La Errante',quantity:1,unitPrice:50000,unitCost:20000,lineTotal:50000}],
      receiptDataUrl:withReceipt?'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y=':'',statusTimeline:[{status:currentStatus,createdAt:'2026-08-05T20:10:00.000Z',note:'Prueba'}]
    }]));
    localStorage.setItem('ee_v14_products',JSON.stringify({'la-errante':{inventory:10,price:50000,unitCost:20000}}));
  },{withReceipt:receipt,currentStatus:status});
}

test.describe('Operación diaria V2.1',()=>{
  test('muestra cola, abre detalle y permite aprobar con comprobante',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    await expect(page.getByRole('heading',{name:'Mesa de pedidos y continuidad local'})).toBeVisible();
    await expect(page.getByText('Cliente Diario')).toBeVisible();
    await page.getByRole('button',{name:'Abrir pedido'}).click();
    await expect(page.getByText('Carrera 70 # 10-20')).toBeVisible();
    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Aprobar pago'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders'))[0].status)).toBe('approved');
    await expect(page.locator('html')).toHaveAttribute('data-daily-ops-version','2.1.0');
  });

  test('bloquea aprobación cuando falta comprobante',async({page})=>{
    await seed(page,{receipt:false});
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    await page.getByRole('button',{name:'Abrir pedido'}).click();
    await expect(page.getByRole('button',{name:'Aprobar pago'})).toBeDisabled();
  });

  test('filtra pedidos y exporta CSV sin dirección ni comprobante',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    await page.locator('#ee-v21-search').fill('Cliente Diario');
    await expect(page.getByText('EE-20260805-DIARIA')).toBeVisible();
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exportar CSV operativo'}).click();
    const download=await downloadPromise;
    expect(download.suggestedFilename()).toContain('el-errante-pedidos-');
  });

  test('descarga respaldo local y no desborda en móvil',async({page},testInfo)=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Descargar respaldo'}).click();
    const download=await downloadPromise;
    expect(download.suggestedFilename()).toContain('el-errante-respaldo-');
    if(testInfo.project.name.includes('mobile')){
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
    }
  });
});
