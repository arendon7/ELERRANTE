const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(process.cwd(),'assets','operations-inventory-truth-v30.js'),'utf8');

async function harness(page){
  await page.setContent(`<!doctype html><html><body data-page="admin">
    <div id="operations-v16">
      <div class="ee-v16-alert warning"><strong>1 producto(s) requieren atención</strong><span>La Errante: 0</span></div>
      <table><tbody>
        <tr data-v16-product-row="la-errante"><td><strong>La Errante</strong></td><td>26000</td><td>11000</td><td>15000</td><td>0</td><td><input value="5"></td><td><span class="ee-v16-stock low">Bajo</span></td></tr>
        <tr data-v16-product-row="otra"><td><strong>Otra</strong></td><td>20000</td><td>9000</td><td>11000</td><td>2</td><td><input value="5"></td><td><span class="ee-v16-stock low">Bajo</span></td></tr>
      </tbody></table>
    </div>
    <script>
      window.EL_ERRANTE_ADMIN_CONNECTIVITY={states:{CONNECTED:'CONNECTED'},state:'CONNECTED'};
      window.__EE_ADMIN_SUPABASE__={from(name){if(name!=='product_operations')throw new Error('unexpected table '+name);return {
        select(){return this;},
        order(){return Promise.resolve({data:[
          {product_id:'la-errante',product_name:'La Errante',inventory:null,low_stock_threshold:5,active:true},
          {product_id:'otra',product_name:'Otra',inventory:2,low_stock_threshold:5,active:true}
        ],error:null});}
      };}};
    <\/script><script>${source}<\/script>
  </body></html>`);
}

test.describe('V3.0 · verdad de inventario en Operaciones',()=>{
  test('stock desconocido se muestra No contado y no genera falso bajo stock',async({page})=>{
    await harness(page);
    const unknown=page.locator('[data-v16-product-row="la-errante"]');
    await expect(unknown.locator('td').nth(4)).toHaveText('No contado');
    await expect(unknown.locator('td').nth(6)).toContainText('Sin conteo');
    await expect(page.locator('.ee-v16-alert strong')).toHaveText('1 producto(s) requieren atención');
    await expect(page.locator('.ee-v16-alert span')).toContainText('Otra: 2');
    await expect(page.locator('.ee-v16-alert span')).toContainText('1 sin conteo físico');
  });

  test('si sólo falta conteo, la alerta pide conteo físico en lugar de restock',async({page})=>{
    await harness(page);
    await page.evaluate(()=>{
      window.__EE_ADMIN_SUPABASE__.from=()=>({select(){return this;},order(){return Promise.resolve({data:[{product_id:'la-errante',product_name:'La Errante',inventory:null,low_stock_threshold:5,active:true}],error:null});}});
    });
    await page.evaluate(()=>window.EL_ERRANTE_OPERATIONS_INVENTORY_TRUTH_V30.patch());
    await expect(page.locator('.ee-v16-alert strong')).toHaveText('1 producto(s) sin conteo físico');
    await expect(page.locator('.ee-v16-alert span')).toContainText('inventario inicial');
  });
});
