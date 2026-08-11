const {test,expect}=require('@playwright/test');

const RECEIPT_PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64');
const receiptFile=()=>({name:'comprobante-piloto.png',mimeType:'image/png',buffer:RECEIPT_PNG});
function today(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});}

async function seedSession(page,{unitCost=18000}={}){
  await page.addInitScript(({unitCost})=>{
    if(sessionStorage.getItem('ee_v372_intake_seeded')==='1')return;
    const now=new Date();
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'pilot-v372',displayName:'Piloto V3.7.2',role:'Administrador',issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+8*3600000).toISOString()}));
    localStorage.removeItem('ee_v37_pilot_events');
    localStorage.removeItem('ee_v311_operational_demo');
    localStorage.removeItem('ee_v329_finance_demo');
    localStorage.removeItem('ee_v14_orders');
    localStorage.setItem('ee_v14_products',JSON.stringify({'la-errante':{price:45000,unitCost,inventory:12,active:true}}));
    sessionStorage.setItem('ee_v372_intake_seeded','1');
  },{unitCost});
}

async function fillBaseOrder(form,{status='pending_payment'}={}){
  await form.locator('[name="customerName"]').fill('Cliente piloto real');
  await form.locator('[name="customerPhone"]').fill('3001234567');
  await form.locator('[name="requestedDate"]').fill(today());
  await form.locator('[name="status"]').selectOption(status);
  await form.locator('[name="city"]').fill('Medellín');
  await form.locator('[name="neighborhood"]').fill('Laureles');
  await form.locator('[name="address"]').fill('Entrega coordinada');
  await form.locator('[name="paymentReference"]').fill('PAGO-PILOTO-001');
  await form.locator('[name="deliveryFee"]').fill('5000');
  const line=form.locator('[data-v372-line]').first();
  await line.locator('[name="productId"]').selectOption('la-errante');
  await line.locator('[name="quantity"]').fill('2');
  return line;
}

test.describe('V3.7.2 · captura interna de pedido real local',()=>{
  test('crea pedido con comprobante, conserva costo y permite aprobarlo en Operación',async({page})=>{
    await seedSession(page);
    await page.goto('/piloto-operativo.html');
    await expect(page.locator('html')).toHaveAttribute('data-pilot-intake-version','3.7.2');
    const form=page.locator('#v372-order-form');
    await expect(form).toBeVisible();
    const line=await fillBaseOrder(form,{status:'payment_review'});
    await expect(line.locator('[name="unitPrice"]')).toHaveValue('45000');
    await expect(line.locator('[name="unitCost"]')).toHaveValue('18000');
    await form.locator('[name="receipt"]').setInputFiles(receiptFile());
    await form.getByRole('button',{name:'Registrar pedido real local'}).click();
    await expect(page.locator('#v372-message')).toContainText('registrado localmente');
    const order=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]')[0]);
    expect(order).toMatchObject({status:'payment_review',source:'pilot-local-intake-v372',pilotIntakeVersion:'3.7.2',subtotal:90000,deliveryFee:5000,total:95000,receiptStatus:'pending'});
    expect(order.delivery.requestedDate).toBe(today());
    expect(order.receiptDataUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({productId:'la-errante',quantity:2,unitPrice:45000,unitCost:18000,unit_cost_snapshot:18000,lineTotal:90000});

    await page.goto('/operacion.html#pedidos');
    const desk=page.locator('#daily-ops-v21');
    const card=desk.locator(`[data-v21-order="${order.id}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button',{name:'Abrir pedido'}).click();
    const dialogBox=page.locator('#ee-v21-dialog');
    await expect(dialogBox.getByRole('button',{name:'Aprobar pago'})).toBeEnabled();
    page.once('dialog',dialog=>dialog.accept());
    await dialogBox.getByRole('button',{name:'Aprobar pago'}).click();
    await expect.poll(()=>page.evaluate(id=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]').find(row=>row.id===id)?.status,order.id)).toBe('approved');
  });

  test('permite adjuntar después el comprobante de un pedido con pago pendiente',async({page})=>{
    await seedSession(page);
    await page.goto('/piloto-operativo.html');
    const form=page.locator('#v372-order-form');
    await fillBaseOrder(form,{status:'pending_payment'});
    await form.getByRole('button',{name:'Registrar pedido real local'}).click();
    await expect(page.locator('#v372-message')).toContainText('registrado localmente');
    const order=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]')[0]);
    expect(order.status).toBe('pending_payment');
    expect(order.receiptDataUrl).toBe('');

    const paymentForm=page.locator('#v372-payment-form');
    await paymentForm.locator('[name="orderId"]').selectOption(order.id);
    await paymentForm.locator('[name="receipt"]').setInputFiles(receiptFile());
    await paymentForm.locator('[name="paymentReference"]').fill('PAGO-POSTERIOR-001');
    await paymentForm.getByRole('button',{name:'Adjuntar comprobante y pasar a revisión'}).click();
    await expect(page.locator('#v372-message')).toContainText('quedó por revisar');
    const updated=await page.evaluate(id=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]').find(row=>row.id===id),order.id);
    expect(updated.status).toBe('payment_review');
    expect(updated.paymentReference).toBe('PAGO-POSTERIOR-001');
    expect(updated.receiptDataUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(updated.statusTimeline.at(-1).status).toBe('payment_review');
  });

  test('bloquea una línea sin costo histórico real',async({page})=>{
    await seedSession(page,{unitCost:0});
    await page.goto('/piloto-operativo.html');
    const form=page.locator('#v372-order-form');
    const line=await fillBaseOrder(form,{status:'pending_payment'});
    await line.locator('[name="quantity"]').fill('1');
    await expect(line.locator('[name="unitCost"]')).toHaveValue('0');
    await form.getByRole('button',{name:'Registrar pedido real local'}).click();
    await expect(page.locator('#v372-message')).toContainText('costo histórico');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_orders')||'[]').length)).toBe(0);
  });
});