const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(process.cwd(),'assets','admin-order-intake-v423.js'),'utf8');

async function harness(page,{connected=true}={}){
  await page.setContent(`<!doctype html><html><body data-page="admin"><button id="ee-refresh-admin" type="button"></button><div id="admin-dynamic"></div><script>
  window.__intakeCalls=[];
  window.EE_DATA={products:[{id:'la-errante',name:'La Errante',unitCost:10000,variants:[{id:'la-errante-1',price:25000}]}]};
  const state=${JSON.stringify(connected?'CONNECTED':'AUTH_REQUIRED')};
  window.EL_ERRANTE_ADMIN_CONNECTIVITY={states:{CONNECTED:'CONNECTED',AUTH_REQUIRED:'AUTH_REQUIRED'},state,assertConnected:async()=>{if(state!=='CONNECTED')throw new Error('not connected');return true;}};
  const productQuery={select(){return this;},async order(){return {data:[{product_id:'la-errante',product_name:'La Errante',sale_price:26000,unit_cost:11000,active:true}],error:null};}};
  const receiptQuery={async insert(payload){window.__intakeCalls.push(['receipt',payload]);return {data:null,error:null};}};
  window.__EE_ADMIN_SUPABASE__={
    from(name){if(name==='product_operations')return productQuery;if(name==='payment_receipts')return receiptQuery;throw new Error('unexpected table '+name);},
    async rpc(name,args){window.__intakeCalls.push(['rpc',name,args]);if(name==='create_internal_order_v29')return {data:{order_id:'EE-INT-20260913-ABC123'},error:null};if(name==='transition_order_v22')return {data:{status:'payment_review'},error:null};throw new Error('unexpected rpc '+name);},
    auth:{async getSession(){return {data:{session:{user:{id:'11111111-1111-1111-1111-111111111111',is_anonymous:false}}},error:null};}},
    storage:{from(name){if(name!=='payment-receipts')throw new Error('unexpected bucket');return {async upload(storagePath,file,options){window.__intakeCalls.push(['upload',storagePath,file.name,options]);return {data:{path:storagePath},error:null};}};}}
  };
  <\/script><script>${source}<\/script></body></html>`);
  if(connected)await expect(page.locator('#ee-v423-internal-intake')).toBeVisible();
}

async function fillBase(page){
  await page.locator('[name="customerName"]').fill('Cliente WhatsApp');
  await page.locator('[name="customerPhone"]').fill('3001234567');
  await page.locator('[data-field="productId"]').selectOption('la-errante');
  await expect(page.locator('[data-field="unitPrice"]')).toHaveValue('26000');
  await expect(page.locator('[data-field="unitCost"]')).toHaveValue('11000');
}

test.describe('V4.2.3 · pedidos internos conectados',()=>{
  test('sesión admin conectada registra pedido WhatsApp remoto como pago pendiente',async({page})=>{
    await harness(page);
    await fillBase(page);
    await page.locator('#ee-v423-intake-form button[type="submit"]').click();
    await expect(page.locator('#ee-v423-message')).toContainText('EE-INT-20260913-ABC123');
    const calls=await page.evaluate(()=>window.__intakeCalls);
    const create=calls.find(row=>row[0]==='rpc'&&row[1]==='create_internal_order_v29');
    expect(create).toBeTruthy();
    expect(create[2].p_payload.channel).toBe('whatsapp');
    expect(create[2].p_payload.customer_phone).toBe('3001234567');
    expect(create[2].p_payload.items).toHaveLength(1);
    expect(create[2].p_payload.items[0]).toMatchObject({product_id:'la-errante',quantity:1,unit_price:26000,unit_cost_snapshot:11000});
    expect(calls.some(row=>row[1]==='transition_order_v22')).toBe(false);
  });

  test('comprobante se guarda en bucket privado y luego pasa a payment_review',async({page})=>{
    await harness(page);
    await fillBase(page);
    await page.locator('[name="receipt"]').setInputFiles({name:'pago.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 prueba')});
    await page.locator('#ee-v423-intake-form button[type="submit"]').click();
    await expect(page.locator('#ee-v423-message')).toContainText('comprobante por revisar');
    const calls=await page.evaluate(()=>window.__intakeCalls);
    const upload=calls.find(row=>row[0]==='upload');
    expect(upload).toBeTruthy();
    expect(upload[1]).toContain('11111111-1111-1111-1111-111111111111/EE-INT-20260913-ABC123/');
    expect(calls.some(row=>row[0]==='receipt'&&row[1].order_id==='EE-INT-20260913-ABC123')).toBe(true);
    expect(calls.some(row=>row[0]==='rpc'&&row[1]==='transition_order_v22'&&row[2].p_new_status==='payment_review')).toBe(true);
  });

  test('sin sesión administrativa conectada no aparece intake remoto',async({page})=>{
    await harness(page,{connected:false});
    await expect(page.locator('#ee-v423-internal-intake')).toHaveCount(0);
  });
});
