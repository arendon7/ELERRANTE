(()=>{
  "use strict";

  const BASE = window.EL_ERRANTE_COMMERCE_CONFIG || {};
  const KEYS = {
    orders:"ee_v14_orders",
    settings:"ee_v14_settings",
    products:"ee_v14_products",
    fixedCosts:"ee_v14_fixed_costs"
  };
  const STATUS_LABELS = {
    pending_payment:"Pago pendiente",
    payment_review:"Comprobante por revisar",
    approved:"Aprobado",
    preparing:"En preparación",
    dispatched:"Despachado",
    delivered:"Entregado",
    rejected:"Rechazado",
    cancelled:"Cancelado"
  };
  const APPROVED = new Set(["approved","preparing","dispatched","delivered"]);
  const STATUS_TRANSITIONS = {
    pending_payment:["payment_review","cancelled"],
    payment_review:["approved","rejected","cancelled"],
    rejected:["payment_review","cancelled"],
    approved:["preparing","cancelled"],
    preparing:["dispatched","approved","cancelled"],
    dispatched:["delivered","preparing"],
    delivered:["dispatched"],
    cancelled:["pending_payment"]
  };

  const read = (key,fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (_) { return fallback; }
  };
  const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  const money = value => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(value)||0);
  const number = value => Number(String(value ?? "").replace(/[^0-9.-]/g,"")) || 0;
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const monthKey = () => new Date().toISOString().slice(0,7);
  const backendReady = () => Boolean(BASE.backend?.url && BASE.backend?.publishableKey);

  function defaultProducts(){
    const overrides = read(KEYS.products,{});
    const catalog = Array.isArray(window.EE_DATA?.products) ? window.EE_DATA.products : [];
    return catalog.map(product=>{
      const variant = Array.isArray(product.variants) ? product.variants[0] || {} : {};
      const id = product.id || variant.id;
      const saved = overrides[id] || {};
      return {
        id,
        name:product.name || product.title || variant.name || id,
        price:number(saved.price ?? variant.price ?? product.price),
        unitCost:number(saved.unitCost ?? product.unitCost),
        inventory:number(saved.inventory ?? product.inventory),
        active:saved.active !== false
      };
    }).filter(item=>item.id);
  }

  function localSettings(){
    const saved = read(KEYS.settings,{});
    return {
      payment:{...(BASE.payment||{}),...(saved.payment||{})},
      ordering:{...(BASE.ordering||{}),...(saved.ordering||{})}
    };
  }

  function localState(){
    const defaults = BASE.finance?.monthlyFixedCosts || [];
    const savedCosts = read(KEYS.fixedCosts,null);
    const legacyIds = new Set(["trabajador","sede","servicios","otros"]);
    const legacyDemo = Array.isArray(savedCosts) && savedCosts.length===4 && savedCosts.every(item=>legacyIds.has(item.id)) && savedCosts.reduce((sum,item)=>sum+number(item.amount),0)===6000000;
    const fixedCosts = legacyDemo || !Array.isArray(savedCosts) ? defaults : savedCosts;
    if(legacyDemo) write(KEYS.fixedCosts,defaults);
    return {
      orders:read(KEYS.orders,[]),
      products:defaultProducts(),
      fixedCosts,
      settings:localSettings()
    };
  }

  function metrics(state){
    const orders = state.orders.filter(order => (order.month || order.createdAt?.slice(0,7)) === monthKey());
    const sales = orders.filter(order=>APPROVED.has(order.status)).reduce((sum,order)=>sum+number(order.total),0);
    const variable = orders.filter(order=>APPROVED.has(order.status)).flatMap(order=>order.items||[]).reduce((sum,item)=>sum+number(item.unitCost)*number(item.quantity),0);
    const fixed = state.fixedCosts.reduce((sum,item)=>sum+number(item.amount),0);
    return {orders:orders.length,sales,variable,fixed,balance:sales-variable-fixed};
  }

  function statusOptions(current){
    const allowed=new Set([current,...(STATUS_TRANSITIONS[current]||[])]);
    return Object.entries(STATUS_LABELS).filter(([value])=>allowed.has(value)).map(([value,label])=>`<option value="${value}" ${value===current?"selected":""}>${label}</option>`).join("");
  }

  function dashboard(state,mode,user){
    const m = metrics(state);
    const orders = state.orders.length ? state.orders.map(order=>`
      <tr>
        <td><strong>${escapeHtml(order.id)}</strong><br><small>${escapeHtml(order.createdAt ? new Date(order.createdAt).toLocaleString("es-CO") : "")}</small></td>
        <td>${escapeHtml(order.customer?.name)}<br><small>${escapeHtml(order.customer?.phone)}${order.customer?.email?` · ${escapeHtml(order.customer.email)}`:""}</small></td>
        <td>${money(order.total)}</td>
        <td><select data-order-status="${escapeHtml(order.id)}">${statusOptions(order.status)}</select></td>
        <td class="ee-v14-actions">${order.receiptPath || order.receiptDataUrl ? `<button class="ee-v14-btn secondary" data-view-receipt="${escapeHtml(order.id)}">Ver comprobante</button>` : '<span class="ee-v14-help">Sin comprobante</span>'}</td>
      </tr>`).join("") : '<tr><td colspan="5" class="ee-v14-empty">Todavía no hay pedidos registrados.</td></tr>';
    const products = state.products.length ? state.products.map(product=>`
      <tr class="ee-v14-product-row">
        <td><strong>${escapeHtml(product.name)}</strong><br><small>${escapeHtml(product.id)}</small></td>
        <td><input type="number" min="0" step="100" value="${number(product.price)}" data-product-price="${escapeHtml(product.id)}"></td>
        <td><input type="number" min="0" step="100" value="${number(product.unitCost)}" data-product-cost="${escapeHtml(product.id)}"></td>
        <td><input type="number" min="0" step="1" value="${number(product.inventory)}" data-product-inventory="${escapeHtml(product.id)}"></td>
      </tr>`).join("") : '<tr><td colspan="4" class="ee-v14-empty">No fue posible leer el catálogo.</td></tr>';
    const costs = state.fixedCosts.map(item=>`<div class="ee-v14-field"><label>${escapeHtml(item.label)}</label><input type="number" min="0" step="50000" value="${number(item.amount)}" data-fixed-cost="${escapeHtml(item.id)}" data-fixed-label="${escapeHtml(item.label)}"></div>`).join("");
    const payment = state.settings?.payment || {};
    return `
      <div class="ee-v15-sessionbar">
        <div><strong>${mode==="remote"?"Administración conectada":"Simulación local"}</strong><span>${mode==="remote"?escapeHtml(user?.email||"Usuario autorizado"):"Los datos permanecen únicamente en este navegador."}</span></div>
        <div class="ee-v14-actions"><button class="ee-v14-btn secondary" id="ee-refresh-admin">Actualizar</button>${mode==="remote"?'<button class="ee-v14-btn" id="ee-admin-signout">Cerrar sesión</button>':""}</div>
      </div>
      <div id="ee-admin-message" class="ee-v15-message" aria-live="polite"></div>
      <div class="ee-v14-grid">
        <section class="ee-v14-card ee-v14-metric"><small>Pedidos del mes</small><strong>${m.orders}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Ventas aprobadas</small><strong>${money(m.sales)}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Costos variables</small><strong>${money(m.variable)}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Balance del mes</small><strong class="${m.balance>=0?"ee-v14-positive":"ee-v14-negative"}">${money(m.balance)}</strong></section>
        <section class="ee-v14-card"><p class="eyebrow">Pedidos</p><h2>Seguimiento y aprobación</h2><p class="ee-v14-help">Los enlaces de comprobantes conectados son privados y caducan automáticamente.</p><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${orders}</tbody></table></div></section>
        <section class="ee-v14-card"><p class="eyebrow">Catálogo operativo</p><h2>Precios, costos e inventario</h2><p class="ee-v14-help">Los datos actuales continúan siendo demostrativos hasta recibir la tabla real.</p><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Producto</th><th>Precio de venta</th><th>Costo unitario</th><th>Inventario</th></tr></thead><tbody>${products}</tbody></table></div><button class="ee-v14-btn terracotta" id="ee-save-products" style="margin-top:16px">Guardar catálogo operativo</button></section>
        <section class="ee-v14-card"><p class="eyebrow">Estructura mensual</p><h2>Gastos fijos</h2><div class="ee-v14-form-grid">${costs}</div><p class="ee-v14-note" style="margin-top:16px">Total configurado: <strong>${money(m.fixed)}</strong>. Etapa ${escapeHtml(BASE.finance?.stage||"operativa")} · ${escapeHtml(BASE.finance?.dataStatus||"PENDIENTE")}. ${escapeHtml(BASE.finance?.notice||"")}</p><button class="ee-v14-btn terracotta" id="ee-save-costs" style="margin-top:16px">Guardar gastos fijos</button></section>
        <section class="ee-v14-card"><p class="eyebrow">Transferencias</p><h2>Datos bancarios visibles en checkout</h2><p class="ee-v14-help">Estos datos son públicos por naturaleza porque el comprador debe verlos para realizar la transferencia. Nunca se almacena aquí una contraseña bancaria.</p><div class="ee-v14-form-grid"><div class="ee-v14-field"><label for="ee-bank-holder">Titular</label><input id="ee-bank-holder" value="${escapeHtml(payment.accountHolder||"")}"></div><div class="ee-v14-field"><label for="ee-bank-account">Cuenta de ahorros Bancolombia</label><input id="ee-bank-account" value="${escapeHtml(payment.accountNumber||"")}"></div><div class="ee-v14-field full"><label for="ee-bank-key">Llave</label><input id="ee-bank-key" value="${escapeHtml(payment.key||"")}"></div></div><button class="ee-v14-btn terracotta" id="ee-save-payment" style="margin-top:16px">Guardar datos de transferencia</button></section>
      </div>`;
  }

  async function adminClient(){
    if(window.__EE_ADMIN_SUPABASE__) return window.__EE_ADMIN_SUPABASE__;
    if(!backendReady()) throw new Error("Backend no configurado");
    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    window.__EE_ADMIN_SUPABASE__ = module.createClient(BASE.backend.url,BASE.backend.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:BASE.backend.adminStorageKey||"ee-admin-auth-v15"}
    });
    return window.__EE_ADMIN_SUPABASE__;
  }

  async function isAuthorized(client){
    const result = await client.rpc("is_admin");
    if(result.error) throw result.error;
    return result.data === true;
  }

  async function remoteState(client){
    const month = monthKey();
    const [ordersResult,itemsResult,receiptsResult,productsResult,costsResult,settingsResult] = await Promise.all([
      client.from("orders").select("*").order("created_at",{ascending:false}),
      client.from("order_items").select("*"),
      client.from("payment_receipts").select("order_id,storage_path,status,notes"),
      client.from("product_operations").select("*").order("product_name",{ascending:true}),
      client.from("fixed_costs").select("*").eq("month",month),
      client.from("public_settings").select("key,value").in("key",["payment","ordering"])
    ]);
    const error = [ordersResult,itemsResult,receiptsResult,productsResult,costsResult,settingsResult].find(result=>result.error)?.error;
    if(error) throw error;
    const items = itemsResult.data || [];
    const receipts = receiptsResult.data || [];
    const settings = Object.fromEntries((settingsResult.data||[]).map(row=>[row.key,row.value||{}]));
    return {
      orders:(ordersResult.data||[]).map(order=>{
        const receipt = receipts.find(item=>item.order_id===order.id);
        return {
          id:order.id,
          createdAt:order.created_at,
          month:order.created_at?.slice(0,7),
          status:order.status,
          total:order.total,
          customer:{name:order.customer_name,email:order.customer_email,phone:order.customer_phone},
          items:items.filter(item=>item.order_id===order.id).map(item=>({quantity:item.quantity,unitCost:item.unit_cost_snapshot})),
          receiptPath:receipt?.storage_path || "",
          receiptStatus:receipt?.status || ""
        };
      }),
      products:(productsResult.data||[]).map(item=>({id:item.product_id,name:item.product_name,price:item.sale_price,unitCost:item.unit_cost,inventory:item.inventory,active:item.active})),
      fixedCosts:(costsResult.data||[]).map(item=>({id:item.cost_key,label:item.label,amount:item.amount})),
      settings:{payment:{...(BASE.payment||{}),...(settings.payment||{})},ordering:{...(BASE.ordering||{}),...(settings.ordering||{})}}
    };
  }

  function setMessage(container,text,type="ok"){
    const box = container.querySelector("#ee-admin-message");
    if(!box) return;
    box.textContent = text;
    box.dataset.type = type;
  }

  function collectProducts(container){
    return defaultProducts().map(product=>({
      product_id:product.id,
      product_name:product.name,
      sale_price:number(container.querySelector(`[data-product-price="${CSS.escape(product.id)}"]`)?.value),
      unit_cost:number(container.querySelector(`[data-product-cost="${CSS.escape(product.id)}"]`)?.value),
      inventory:number(container.querySelector(`[data-product-inventory="${CSS.escape(product.id)}"]`)?.value),
      active:true,
      updated_at:new Date().toISOString()
    }));
  }

  function collectCosts(container){
    return [...container.querySelectorAll("[data-fixed-cost]")].map(input=>({
      month:monthKey(),
      cost_key:input.dataset.fixedCost,
      label:input.dataset.fixedLabel,
      amount:number(input.value),
      updated_at:new Date().toISOString()
    }));
  }

  async function openReceipt(client,order){
    if(order.receiptDataUrl){ window.open(order.receiptDataUrl,"_blank","noopener"); return; }
    if(!order.receiptPath) throw new Error("El pedido no tiene comprobante.");
    const result = await client.storage.from(BASE.backend.receiptBucket||"payment-receipts").createSignedUrl(order.receiptPath,120);
    if(result.error) throw result.error;
    window.open(result.data.signedUrl,"_blank","noopener,noreferrer");
  }

  async function renderRemote(container,client,user){
    container.innerHTML = '<div class="ee-v15-loading">Cargando pedidos y operación…</div>';
    const state = await remoteState(client);
    if(!state.products.length) state.products = defaultProducts();
    if(!state.fixedCosts.length) state.fixedCosts = BASE.finance?.monthlyFixedCosts || [];
    container.innerHTML = dashboard(state,"remote",user);
    bindDashboard(container,"remote",state,client,user);
  }

  function renderLocal(container){
    const state = localState();
    container.innerHTML = dashboard(state,"local",null);
    bindDashboard(container,"local",state,null,null);
    window.dispatchEvent(new CustomEvent("ee:admin:ready",{detail:{mode:"local"}}));
  }

  function bindDashboard(container,mode,state,client,user){
    container.onchange = async event => {
      const select = event.target.closest("[data-order-status]");
      if(!select) return;
      try{
        if(mode==="local"){
          const orders = read(KEYS.orders,[]);
          const order = orders.find(item=>item.id===select.dataset.orderStatus);
          if(order){
            const next=select.value;
            if(!(STATUS_TRANSITIONS[order.status]||[]).includes(next)){ select.value=order.status; setMessage(container,"Ese cambio de estado no está permitido desde la etapa actual.","error"); return; }
            if(next==="approved" && !(order.receiptDataUrl||order.receiptPath)){ select.value=order.status; setMessage(container,"No se puede aprobar el pago sin comprobante.","error"); return; }
            order.status=next; order.updatedAt=new Date().toISOString();
            order.statusTimeline=Array.isArray(order.statusTimeline)?order.statusTimeline:[];
            const timelineNote=select.dataset.v21Note||"Estado actualizado desde Administración"; order.statusTimeline.push({status:next,createdAt:order.updatedAt,note:timelineNote}); delete select.dataset.v21Note;
            write(KEYS.orders,orders); renderLocal(container);
          }
          return;
        }
        const update = await client.rpc("transition_order_v21",{p_order_id:select.dataset.orderStatus,p_new_status:select.value,p_note:"Estado actualizado desde Administración"});
        if(update.error) throw update.error;
        await renderRemote(container,client,user);
      }catch(error){ console.error(error); setMessage(container,"No fue posible actualizar el estado del pedido.","error"); }
    };

    container.onclick = async event => {
      const target = event.target;
      try{
        const receiptButton = target.closest("[data-view-receipt]");
        if(receiptButton){
          const order = state.orders.find(item=>item.id===receiptButton.dataset.viewReceipt);
          await openReceipt(client,order||{});
          return;
        }
        if(target.closest("#ee-refresh-admin")){
          if(mode==="remote") await renderRemote(container,client,user); else renderLocal(container);
          return;
        }
        if(target.closest("#ee-admin-signout")){
          await client.auth.signOut();
          await showLogin(container,client);
          return;
        }
        if(target.closest("#ee-save-products")){
          if(mode==="local"){
            const saved = read(KEYS.products,{});
            collectProducts(container).forEach(item=>{ saved[item.product_id]={price:item.sale_price,unitCost:item.unit_cost,inventory:item.inventory,active:item.active}; });
            write(KEYS.products,saved); renderLocal(container); return;
          }
          const result = await client.from("product_operations").upsert(collectProducts(container),{onConflict:"product_id"});
          if(result.error) throw result.error;
          setMessage(container,"Catálogo operativo guardado.");
          return;
        }
        if(target.closest("#ee-save-costs")){
          if(mode==="local"){
            write(KEYS.fixedCosts,collectCosts(container).map(item=>({id:item.cost_key,label:item.label,amount:item.amount})));
            renderLocal(container); return;
          }
          const result = await client.from("fixed_costs").upsert(collectCosts(container),{onConflict:"month,cost_key"});
          if(result.error) throw result.error;
          setMessage(container,"Gastos fijos del mes guardados.");
          return;
        }
        if(target.closest("#ee-save-payment")){
          const payment = {
            bank:"Bancolombia",
            accountType:"Cuenta de ahorros",
            accountHolder:container.querySelector("#ee-bank-holder").value.trim(),
            accountNumber:container.querySelector("#ee-bank-account").value.trim(),
            key:container.querySelector("#ee-bank-key").value.trim(),
            instructions:BASE.payment?.instructions || "Realiza la transferencia y adjunta el comprobante."
          };
          if(mode==="local"){
            const saved=read(KEYS.settings,{}); saved.payment={...(saved.payment||{}),...payment}; write(KEYS.settings,saved); renderLocal(container); return;
          }
          const result = await client.from("public_settings").upsert({key:"payment",value:payment,updated_at:new Date().toISOString()},{onConflict:"key"});
          if(result.error) throw result.error;
          setMessage(container,"Datos de transferencia sincronizados con el checkout.");
        }
      }catch(error){
        console.error(error);
        setMessage(container,error?.message || "No fue posible completar la operación.","error");
      }
    };
  }

  function activationPanel(container){
    container.innerHTML = `
      <section class="ee-v14-auth ee-v15-activation">
        <p class="eyebrow">Administración V2.3</p>
        <h1>Acceso administrativo seguro.</h1>
        <p>El código de autenticación, roles, base de datos y comprobantes privados ya está preparado. Falta vincular el proyecto Supabase mediante la configuración protegida del despliegue.</p>
        <div class="ee-v15-checklist"><span>1. Crear o seleccionar el proyecto Supabase.</span><span>2. Ejecutar las migraciones V1.4, V1.5, V1.6, V1.9, V2.0, V2.1, V2.2 y V2.3.</span><span>3. Registrar la URL y la publishable key en GitHub Actions.</span><span>4. Crear el usuario de Juan y autorizarlo en <code>admin_users</code>.</span></div>
        <div class="ee-v14-note">No existe una contraseña maestra dentro del código. Pages no simula un acceso privado inexistente.</div>
        <button class="ee-v14-btn terracotta" id="ee-open-local-admin" style="width:100%;margin-top:18px">Abrir simulación local</button>
      </section>`;
    container.querySelector("#ee-open-local-admin").addEventListener("click",()=>renderLocal(container),{once:true});
  }

  async function showLogin(container,client,message=""){
    container.innerHTML = `
      <form class="ee-v14-auth" id="ee-admin-login">
        <p class="eyebrow">Acceso privado · V1.5</p>
        <h1>Administración El Errante</h1>
        <p>Ingresa con el usuario administrativo autorizado. Las sesiones de compradores y administradores permanecen separadas.</p>
        <div class="ee-v14-field"><label for="ee-admin-email">Correo</label><input id="ee-admin-email" name="email" type="email" required autocomplete="username"></div>
        <div class="ee-v14-field" style="margin-top:14px"><label for="ee-admin-password">Contraseña</label><input id="ee-admin-password" name="password" type="password" required autocomplete="current-password"></div>
        <div id="ee-login-error" class="form-alert" aria-live="polite">${escapeHtml(message)}</div>
        <button class="ee-v14-btn terracotta" style="width:100%;margin-top:18px">Ingresar</button>
      </form>`;
    container.querySelector("#ee-admin-login").addEventListener("submit",async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const data=new FormData(form);
      const button=form.querySelector("button");
      const errorBox=form.querySelector("#ee-login-error");
      button.disabled=true; button.textContent="Verificando…"; errorBox.textContent="";
      try{
        const result=await client.auth.signInWithPassword({email:data.get("email"),password:data.get("password")});
        if(result.error) throw result.error;
        if(!(await isAuthorized(client))){ await client.auth.signOut(); throw new Error("El usuario no está autorizado como administrador."); }
        await renderRemote(container,client,result.data.user);
      }catch(error){
        errorBox.textContent=error?.message || "No fue posible iniciar sesión.";
        button.disabled=false; button.textContent="Ingresar";
      }
    });
  }

  async function init(){
    const container=document.querySelector("#admin-dynamic");
    if(!container) return;
    if(!backendReady()){ activationPanel(container); return; }
    try{
      const client=await adminClient();
      const {data:{session}}=await client.auth.getSession();
      if(!session || session.user?.is_anonymous){ await showLogin(container,client); return; }
      if(!(await isAuthorized(client))){ await client.auth.signOut(); await showLogin(container,client,"El usuario no tiene autorización administrativa."); return; }
      await renderRemote(container,client,session.user);
    }catch(error){
      console.error(error);
      container.innerHTML='<div class="ee-v14-auth"><p class="eyebrow">Conexión administrativa</p><h1>No fue posible abrir el panel.</h1><p>Revisa la configuración del backend y las políticas de acceso.</p></div>';
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
