const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const source=fs.readFileSync(path.join(process.cwd(),'assets','web-order-rpc-v32.js'),'utf8');
const schema=fs.readFileSync(path.join(process.cwd(),'backend','supabase','schema-v32.sql'),'utf8');
const receiptSchema=fs.readFileSync(path.join(process.cwd(),'backend','supabase','schema-v321.sql'),'utf8');

async function harness(page){
  await page.setContent(`<!doctype html><html><body>
    <form id="checkout-form-v14" class="form-card">
      <input name="name" value="Cliente Prueba"><input name="email" value="cliente@example.com"><input name="phone" value="3001234567">
      <input name="city" value="Medellín"><input name="neighborhood" value="Laureles"><input name="address" value="Calle 1 # 2-3">
      <input name="requestedDate" value=""><textarea name="notes"></textarea>
      <input id="ee-receipt" name="receipt" type="file"><div id="ee-checkout-error"></div><button type="submit">Enviar pedido y comprobante</button>
    </form><div id="checkout-lines"></div>
    <script>
      localStorage.setItem('ee_v2_cart',JSON.stringify([{productId:'la-errante',variantId:'unidad',quantity:2,price:1,lineTotal:2}]));
      window.__v32={rpc:[],uploads:[],metadata:[]};
      window.EE_PUBLIC_COMMERCE_GUARD_V29={connected:()=>true};
      window.EL_ERRANTE_COMMERCE_CONFIG={backend:{receiptBucket:'payment-receipts'}};
      window.__EE_SUPABASE__={
        auth:{async getSession(){return {data:{session:{user:{id:'shopper-1',is_anonymous:true}}},error:null};},async signInAnonymously(){throw new Error('not expected');}},
        async rpc(name,args){window.__v32.rpc.push({name,args});return {data:{order_id:'EE-WEB-TEST',status:'pending_payment',subtotal:50000,delivery_fee:7000,total:57000,payment_reference:'PAGO-TEST'},error:null};},
        storage:{from(bucket){return {async upload(filePath,file,options){window.__v32.uploads.push({bucket,filePath,type:file.type,options});return {data:{path:filePath},error:null};}};}},
        from(name){if(name!=='payment_receipts')throw new Error('direct table write unexpected: '+name);return {async insert(payload){window.__v32.metadata.push(payload);return {data:null,error:null};}};}
      };
    <\/script><script>${source}<\/script>
  </body></html>`);
}

test.describe('V3.2 · pedido web server-priced',()=>{
  test('payload shopper no contiene precios ni totales controlados por el navegador',async({page})=>{
    await harness(page);
    await page.locator('button[type="submit"]').click();
    await expect.poll(()=>page.evaluate(()=>window.__v32.rpc.length)).toBe(1);
    const snapshot=await page.evaluate(()=>window.__v32.rpc[0]);
    expect(snapshot.name).toBe('create_web_order_v32');
    const payload=snapshot.args.p_payload;
    expect(payload.items).toEqual([{product_id:'la-errante',variant_id:'unidad',quantity:2}]);
    expect(payload).not.toHaveProperty('subtotal');
    expect(payload).not.toHaveProperty('delivery_fee');
    expect(payload).not.toHaveProperty('total');
    expect(payload.items[0]).not.toHaveProperty('unit_price');
    expect(payload.items[0]).not.toHaveProperty('line_total');
    await expect(page.locator('.ee-v14-order-success')).toContainText('$ 57.000');
  });

  test('comprobante se vincula al order_id server-side y metadata nace pending',async({page})=>{
    await harness(page);
    await page.locator('#ee-receipt').setInputFiles({name:'pago.png',mimeType:'image/png',buffer:Buffer.from('receipt')});
    await page.locator('button[type="submit"]').click();
    await expect.poll(()=>page.evaluate(()=>window.__v32.metadata.length)).toBe(1);
    const state=await page.evaluate(()=>({upload:window.__v32.uploads[0],metadata:window.__v32.metadata[0]}));
    expect(state.upload.bucket).toBe('payment-receipts');
    expect(state.upload.filePath).toContain('shopper-1/EE-WEB-TEST/');
    expect(state.metadata).toEqual(expect.objectContaining({order_id:'EE-WEB-TEST',owner_id:'shopper-1',status:'pending'}));
    expect(state.metadata).not.toHaveProperty('reviewed_by');
    expect(state.metadata).not.toHaveProperty('reviewed_at');
  });

  test('contrato SQL retira inserts directos y separa comprobantes shopper/admin',async()=>{
    expect(schema).toContain('revoke insert on table public.orders from anon,authenticated');
    expect(schema).toContain('revoke insert on table public.order_items from anon,authenticated');
    expect(schema).toContain("and status='pending'");
    expect(schema).toContain('create_web_order_v32');
    expect(schema).toContain('resolve_delivery_fee_v32');
    expect(schema).toContain("jsonb_set(coalesce(value,'{}'::jsonb),'{commerceEnabled}','false'::jsonb,true)");
    expect(receiptSchema).toContain("is_anonymous')::boolean,false)=true");
    expect(receiptSchema).toContain('admins insert receipt metadata v321');
    expect(receiptSchema).toContain('public.is_admin()');
    expect(receiptSchema).toContain("and status='pending'");
  });
});
