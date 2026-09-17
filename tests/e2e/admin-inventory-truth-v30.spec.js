const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(process.cwd(),'assets','admin-inventory-truth-v30.js'),'utf8');

async function harness(page, inventory){
  await page.setContent(`<!doctype html><html><body data-page="admin">
    <div id="admin-dynamic">
      <div id="ee-admin-message"></div>
      <section class="ee-v14-card"><p class="ee-v14-help">Texto anterior</p>
        <table><tbody><tr class="ee-v14-product-row">
          <td><strong>La Errante</strong></td>
          <td><input data-product-price="la-errante" value="26000"></td>
          <td><input data-product-cost="la-errante" value="11000"></td>
          <td><input data-product-inventory="la-errante" value="0"></td>
        </tr></tbody></table>
        <button id="ee-save-products" type="button">Guardar catálogo operativo</button>
      </section>
    </div>
    <button id="ee-refresh-admin" type="button"></button>
    <script>
      window.__inventoryWrites=[];
      window.EE_DATA={products:[{id:'la-errante',name:'La Errante',variants:[{id:'la-errante-1',price:25000}]}]};
      window.EL_ERRANTE_ADMIN_CONNECTIVITY={states:{CONNECTED:'CONNECTED'},state:'CONNECTED',assertConnected:async()=>true};
      const remoteInventory=${JSON.stringify(inventory)};
      window.__EE_ADMIN_SUPABASE__={from(name){if(name!=='product_operations')throw new Error('unexpected table '+name);return {
        select(){return Promise.resolve({data:[{product_id:'la-errante',inventory:remoteInventory}],error:null});},
        upsert(payload){window.__inventoryWrites.push(payload);return Promise.resolve({data:null,error:null});}
      };}};
    <\/script><script>${source}<\/script>
  </body></html>`);
}

test.describe('V3.0 · inventario desconocido',()=>{
  test('NULL remoto se presenta como No contado y no como cero',async({page})=>{
    await harness(page,null);
    const input=page.locator('[data-product-inventory="la-errante"]');
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('placeholder','No contado');
    await expect(input).toHaveAttribute('data-inventory-known','false');
    await expect(page.locator('.ee-v14-help')).toContainText('no contado');
  });

  test('guardar un inventario vacío envía null; un valor conocido conserva su número',async({page})=>{
    await harness(page,null);
    const input=page.locator('[data-product-inventory="la-errante"]');
    await expect(input).toHaveValue('');
    await page.locator('#ee-save-products').click();
    await expect.poll(()=>page.evaluate(()=>window.__inventoryWrites.length)).toBe(1);
    let writes=await page.evaluate(()=>window.__inventoryWrites);
    expect(writes[0][0].inventory).toBeNull();

    await input.fill('7');
    await page.locator('#ee-save-products').click();
    await expect.poll(()=>page.evaluate(()=>window.__inventoryWrites.length)).toBe(2);
    writes=await page.evaluate(()=>window.__inventoryWrites);
    expect(writes[1][0].inventory).toBe(7);
  });
});
