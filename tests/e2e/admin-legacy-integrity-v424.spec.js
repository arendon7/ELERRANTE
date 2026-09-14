const {test,expect}=require('@playwright/test');

const SESSION={user:{id:'admin-integrity-v424',email:'admin@elerrante.co',is_anonymous:false}};

async function prepare(page){
  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:'window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://trap.supabase.invalid",publishableKey:"public-test",receiptBucket:"payment-receipts",adminStorageKey:"ee-admin-auth-v15"}});'
  }));

  await page.addInitScript(session=>{
    window.__legacyIntegrity={session,isAdmin:true,transitions:[],bubbleChanges:0,transitionError:''};
    const result=()=>({data:[],error:null});
    const query=()=>{
      const q={
        select(){return q;},order(){return q;},eq(){return q;},in(){return q;},limit(){return q;},
        insert(){return q;},update(){return q;},upsert(){return q;},delete(){return q;},
        async maybeSingle(){return {data:null,error:null};},
        then(resolve,reject){return Promise.resolve(result()).then(resolve,reject);}
      };
      return q;
    };
    window.__EE_ADMIN_SUPABASE__={
      auth:{
        async getSession(){return {data:{session:window.__legacyIntegrity.session},error:null};},
        async signInWithPassword(){return {data:{session:null},error:{message:'login disabled in test'}};},
        async signOut(){return {error:null};},
        onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};}
      },
      async rpc(name,args){
        if(name==='is_admin')return {data:window.__legacyIntegrity.isAdmin,error:null};
        if(name==='transition_order_v22'){
          window.__legacyIntegrity.transitions.push(args);
          if(window.__legacyIntegrity.transitionError)return {data:null,error:{message:window.__legacyIntegrity.transitionError}};
          return {data:{order_id:args.p_order_id,status:args.p_new_status},error:null};
        }
        return {data:null,error:null};
      },
      from(){return query();},
      storage:{from(){return {async upload(){return {data:{},error:null};}};}}
    };
  },SESSION);

  await page.goto('/admin.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminLegacyIntegrityVersion||''))
    .toBe('4.2.4');
}

async function mountLegacy(page,status='payment_review'){
  await page.evaluate(current=>{
    const root=document.getElementById('admin-dynamic');
    root.innerHTML=`
      <div class="ee-v15-sessionbar"><div><strong>Administración conectada</strong></div></div>
      <section class="ee-v14-card"><h2>Precios, costos e inventario</h2><p class="ee-v14-help">Los valores actuales son de demostración y quedan listos para reemplazarlos cuando entregues la tabla real.</p></section>
      <section class="ee-v14-card"><h2>Estructura mensual</h2><p class="ee-v14-note">Total configurado: <strong>$370.000</strong>. La base inicial es de $6.000.000 mensuales.</p></section>
      <select data-order-status="EE-TEST-001">
        <option value="pending_payment">Pago pendiente</option>
        <option value="payment_review">Comprobante por revisar</option>
        <option value="approved">Aprobado</option>
      </select>`;
    root.querySelector('[data-order-status]').value=current;
    root.addEventListener('change',()=>{window.__legacyIntegrity.bubbleChanges+=1;});
  },status);

  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
    .toBe('CONNECTED');
  await expect.poll(()=>page.locator('[data-order-status]').getAttribute('data-integrity-status')).toBe(status);
}

test.describe('V4.2.4 integridad de Administración heredada',()=>{
  test('redirige cambio remoto al RPC seguro y bloquea el listener heredado',async({page})=>{
    await prepare(page);
    await mountLegacy(page);

    await page.locator('[data-order-status]').selectOption('approved');
    await expect.poll(()=>page.evaluate(()=>window.__legacyIntegrity.transitions.length)).toBe(1);

    const state=await page.evaluate(()=>({
      transition:window.__legacyIntegrity.transitions[0],
      bubbleChanges:window.__legacyIntegrity.bubbleChanges,
      selected:document.querySelector('[data-order-status]').value,
      stored:document.querySelector('[data-order-status]').dataset.integrityStatus
    }));
    expect(state.transition).toEqual({p_order_id:'EE-TEST-001',p_new_status:'approved',p_note:null});
    expect(state.bubbleChanges).toBe(0);
    expect(state.selected).toBe('approved');
    expect(state.stored).toBe('approved');
    await expect(page.locator('#ee-legacy-integrity-message')).toContainText('transición segura');
  });

  test('un rechazo del backend restaura el estado previo',async({page})=>{
    await prepare(page);
    await mountLegacy(page);
    await page.evaluate(()=>{window.__legacyIntegrity.transitionError='payment receipt required before approval';});

    await page.locator('[data-order-status]').selectOption('approved');
    await expect(page.locator('#ee-legacy-integrity-message')).toContainText('payment receipt required');
    await expect(page.locator('[data-order-status]')).toHaveValue('payment_review');
    expect(await page.evaluate(()=>window.__legacyIntegrity.bubbleChanges)).toBe(0);
  });

  test('retira copy demo obsoleto sin inventar costos',async({page})=>{
    await prepare(page);
    await mountLegacy(page);
    await expect(page.locator('#admin-dynamic')).not.toContainText('base inicial');
    await expect(page.locator('#admin-dynamic')).not.toContainText('demostración');
    await expect(page.locator('#admin-dynamic')).toContainText('$370.000');
    await expect(page.locator('#admin-dynamic')).toContainText('Verifica la estructura vigente');
  });
});
