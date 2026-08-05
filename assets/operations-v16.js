(()=>{
  "use strict";

  const BASE = window.EL_ERRANTE_COMMERCE_CONFIG || {};
  const KEYS = {
    orders:"ee_v14_orders",
    products:"ee_v14_products",
    fixedCosts:"ee_v14_fixed_costs",
    movements:"ee_v16_inventory_movements"
  };
  const APPROVED = new Set(["approved","preparing","dispatched","delivered"]);
  const COMMITTED = new Set(["preparing","dispatched","delivered"]);
  const MOVEMENT_LABELS = {
    opening:"Inventario inicial",
    purchase:"Compra",
    production:"Producción",
    sale:"Salida por pedido",
    return:"Reintegro",
    adjustment_in:"Ajuste de entrada",
    adjustment_out:"Ajuste de salida",
    waste:"Merma"
  };

  const read = (key,fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (_) { return fallback; }
  };
  const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  const number = value => Number(String(value ?? "").replace(/[^0-9.-]/g,"")) || 0;
  const money = value => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(number(value));
  const quantity = value => new Intl.NumberFormat("es-CO",{maximumFractionDigits:2}).format(number(value));
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const monthKey = () => new Date().toISOString().slice(0,7);
  const backendReady = () => Boolean(BASE.backend?.url && BASE.backend?.publishableKey);
  const uid = prefix => `${prefix}-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;

  function catalogProducts(){
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
        threshold:number(saved.threshold ?? 5),
        active:saved.active !== false
      };
    }).filter(item=>item.id);
  }

  function localState(){
    return {
      mode:"local",
      orders:read(KEYS.orders,[]),
      products:catalogProducts(),
      fixedCosts:read(KEYS.fixedCosts,BASE.finance?.monthlyFixedCosts || []),
      movements:read(KEYS.movements,[])
    };
  }

  function normalizedOrderItems(order){
    return (order.items || []).map(item=>({
      productId:item.productId || item.product_id || item.variantId || item.variant_id || "unknown",
      name:item.name || item.product_name || "Producto El Errante",
      quantity:number(item.quantity),
      unitPrice:number(item.unitPrice ?? item.unit_price),
      unitCost:number(item.unitCost ?? item.unit_cost_snapshot)
    }));
  }

  function finance(state){
    const monthly = state.orders.filter(order=>(order.month || order.createdAt?.slice(0,7) || order.created_at?.slice(0,7))===monthKey());
    const approved = monthly.filter(order=>APPROVED.has(order.status));
    const sales = approved.reduce((sum,order)=>sum+number(order.total),0);
    const variable = approved.flatMap(normalizedOrderItems).reduce((sum,item)=>sum+(item.quantity*item.unitCost),0);
    const contribution = sales-variable;
    const fixed = state.fixedCosts.reduce((sum,item)=>sum+number(item.amount),0);
    const result = contribution-fixed;
    const contributionRate = sales>0 ? contribution/sales : weightedCatalogRate(state.products);
    const breakEvenSales = contributionRate>0 ? fixed/contributionRate : 0;
    const units = approved.flatMap(normalizedOrderItems).reduce((sum,item)=>sum+item.quantity,0);
    const averageContribution = units>0 ? contribution/units : averageCatalogContribution(state.products);
    const breakEvenUnits = averageContribution>0 ? Math.ceil(fixed/averageContribution) : 0;
    return {orders:monthly.length,sales,variable,contribution,fixed,result,contributionRate,breakEvenSales,breakEvenUnits};
  }

  function weightedCatalogRate(products){
    const active=products.filter(item=>item.active && item.price>0);
    if(!active.length) return 0;
    const sales=active.reduce((sum,item)=>sum+item.price,0);
    const contribution=active.reduce((sum,item)=>sum+Math.max(0,item.price-item.unitCost),0);
    return sales>0 ? contribution/sales : 0;
  }

  function averageCatalogContribution(products){
    const active=products.filter(item=>item.active && item.price>item.unitCost);
    if(!active.length) return 0;
    return active.reduce((sum,item)=>sum+(item.price-item.unitCost),0)/active.length;
  }

  function productPerformance(state){
    const rows = new Map(state.products.map(product=>[product.id,{...product,units:0,revenue:0,cogs:0}]));
    state.orders.filter(order=>APPROVED.has(order.status)).forEach(order=>{
      normalizedOrderItems(order).forEach(item=>{
        const row=rows.get(item.productId) || {id:item.productId,name:item.name,price:item.unitPrice,unitCost:item.unitCost,inventory:0,threshold:5,active:true,units:0,revenue:0,cogs:0};
        row.units+=item.quantity;
        row.revenue+=item.quantity*item.unitPrice;
        row.cogs+=item.quantity*item.unitCost;
        rows.set(item.productId,row);
      });
    });
    return [...rows.values()].map(row=>({
      ...row,
      contribution:row.price-row.unitCost,
      marginRate:row.price>0 ? (row.price-row.unitCost)/row.price : 0,
      realizedContribution:row.revenue-row.cogs
    })).sort((a,b)=>a.inventory-b.inventory);
  }

  function movementRows(state){
    return [...state.movements].sort((a,b)=>String(b.createdAt||b.created_at).localeCompare(String(a.createdAt||a.created_at))).slice(0,60);
  }

  function render(state){
    const m=finance(state);
    const products=productPerformance(state);
    const low=products.filter(item=>item.inventory<=item.threshold);
    const productRows=products.map(item=>`
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong><br><small>${escapeHtml(item.id)}</small></td>
        <td>${money(item.price)}</td>
        <td>${money(item.unitCost)}</td>
        <td>${money(item.contribution)}<br><small>${(item.marginRate*100).toFixed(1)}%</small></td>
        <td>${quantity(item.inventory)}</td>
        <td><input class="ee-v16-threshold" type="number" min="0" step="1" value="${number(item.threshold)}" data-v16-threshold="${escapeHtml(item.id)}" aria-label="Umbral bajo de ${escapeHtml(item.name)}"></td>
        <td>${item.inventory<=item.threshold?'<span class="ee-v16-stock low">Bajo</span>':'<span class="ee-v16-stock ok">Disponible</span>'}</td>
      </tr>`).join("");
    const movements=movementRows(state).map(item=>`
      <tr>
        <td>${escapeHtml(new Date(item.createdAt||item.created_at||Date.now()).toLocaleString("es-CO"))}</td>
        <td>${escapeHtml(item.productName||item.product_name)}</td>
        <td>${escapeHtml(MOVEMENT_LABELS[item.type||item.movement_type] || item.type || item.movement_type)}</td>
        <td class="${number(item.delta??item.quantity_delta)>=0?"ee-v14-positive":"ee-v14-negative"}">${number(item.delta??item.quantity_delta)>=0?"+":""}${quantity(item.delta??item.quantity_delta)}</td>
        <td>${escapeHtml(item.orderId||item.order_id||item.note||"—")}</td>
      </tr>`).join("") || '<tr><td colspan="5" class="ee-v14-empty">Aún no hay movimientos registrados.</td></tr>';
    const options=products.map(item=>`<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("");
    return `
      <section class="ee-v16-shell">
        <div class="ee-v16-heading"><div><p class="eyebrow">Operación y finanzas · V1.6</p><h2>Inventario, margen y punto de equilibrio</h2></div><span class="ee-v16-mode">${state.mode==="remote"?"Datos conectados":"Simulación local"}</span></div>
        <div id="ee-v16-message" class="ee-v15-message" aria-live="polite"></div>
        <div class="ee-v16-metrics">
          <article><small>Margen de contribución</small><strong>${money(m.contribution)}</strong><span>${(m.contributionRate*100).toFixed(1)}% sobre ventas</span></article>
          <article><small>Resultado operativo</small><strong class="${m.result>=0?"ee-v14-positive":"ee-v14-negative"}">${money(m.result)}</strong><span>Ventas − costos variables − gastos fijos</span></article>
          <article><small>Ventas de equilibrio</small><strong>${money(m.breakEvenSales)}</strong><span>Estimación con el margen actual</span></article>
          <article><small>Unidades de equilibrio</small><strong>${quantity(m.breakEvenUnits)}</strong><span>Estimación según contribución media</span></article>
        </div>
        <div class="ee-v16-alert ${low.length?"warning":"ok"}"><strong>${low.length?`${low.length} producto(s) requieren atención`:'Inventario sin alertas'}</strong><span>${low.length?low.map(item=>`${item.name}: ${quantity(item.inventory)}`).join(" · "):'Ningún producto está por debajo de su umbral.'}</span></div>
        <div class="ee-v16-grid">
          <section class="ee-v14-card">
            <p class="eyebrow">Movimiento manual</p><h2>Registrar producción, compra o ajuste</h2>
            <form id="ee-v16-movement-form" class="ee-v14-form-grid">
              <div class="ee-v14-field full"><label>Producto</label><select name="productId" required>${options}</select></div>
              <div class="ee-v14-field"><label>Tipo</label><select name="type" required><option value="production">Producción</option><option value="purchase">Compra</option><option value="opening">Inventario inicial</option><option value="adjustment_in">Ajuste de entrada</option><option value="adjustment_out">Ajuste de salida</option><option value="waste">Merma</option></select></div>
              <div class="ee-v14-field"><label>Cantidad</label><input name="quantity" type="number" min="0.01" step="0.01" required></div>
              <div class="ee-v14-field"><label>Costo unitario opcional</label><input name="unitCost" type="number" min="0" step="100"></div>
              <div class="ee-v14-field full"><label>Nota</label><input name="note" maxlength="180" placeholder="Lote, proveedor, causa del ajuste o responsable"></div>
              <button class="ee-v14-btn terracotta full" type="submit">Registrar movimiento</button>
            </form>
          </section>
          <section class="ee-v14-card">
            <p class="eyebrow">Lectura financiera</p><h2>Cómo interpretar el mes</h2>
            <dl class="ee-v16-summary"><div><dt>Ventas aprobadas</dt><dd>${money(m.sales)}</dd></div><div><dt>Costos variables</dt><dd>${money(m.variable)}</dd></div><div><dt>Gastos fijos</dt><dd>${money(m.fixed)}</dd></div><div><dt>Resultado</dt><dd>${money(m.result)}</dd></div></dl>
            <p class="ee-v14-note">El punto de equilibrio es una estimación operativa basada en los precios y costos actuales. Cambiar los valores demo modifica inmediatamente esta lectura.</p>
          </section>
        </div>
        <section class="ee-v14-card"><div class="ee-v16-heading compact"><div><p class="eyebrow">Rentabilidad por producto</p><h2>Precio, costo, margen e inventario</h2></div><button class="ee-v14-btn secondary" id="ee-v16-save-thresholds">Guardar umbrales</button></div><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Producto</th><th>Precio</th><th>Costo</th><th>Contribución</th><th>Inventario</th><th>Umbral</th><th>Estado</th></tr></thead><tbody>${productRows}</tbody></table></div></section>
        <section class="ee-v14-card"><p class="eyebrow">Kardex básico</p><h2>Últimos movimientos de inventario</h2><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Movimiento</th><th>Cantidad</th><th>Referencia</th></tr></thead><tbody>${movements}</tbody></table></div></section>
      </section>`;
  }

  async function adminClient(){
    if(window.__EE_ADMIN_SUPABASE__) return window.__EE_ADMIN_SUPABASE__;
    const module=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    window.__EE_ADMIN_SUPABASE__=module.createClient(BASE.backend.url,BASE.backend.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:BASE.backend.adminStorageKey||"ee-admin-auth-v15"}});
    return window.__EE_ADMIN_SUPABASE__;
  }

  async function remoteState(){
    const client=await adminClient();
    const [orders,items,products,costs,movements]=await Promise.all([
      client.from("orders").select("*").order("created_at",{ascending:false}),
      client.from("order_items").select("*"),
      client.from("product_operations").select("*").order("product_name"),
      client.from("fixed_costs").select("*").eq("month",monthKey()),
      client.from("inventory_movements").select("*").order("created_at",{ascending:false}).limit(100)
    ]);
    const failed=[orders,items,products,costs,movements].find(result=>result.error);
    if(failed) throw failed.error;
    const orderItems=items.data||[];
    return {
      mode:"remote",
      orders:(orders.data||[]).map(order=>({id:order.id,status:order.status,total:order.total,createdAt:order.created_at,month:order.created_at?.slice(0,7),items:orderItems.filter(item=>item.order_id===order.id)})),
      products:(products.data||[]).map(item=>({id:item.product_id,name:item.product_name,price:item.sale_price,unitCost:item.unit_cost,inventory:item.inventory,threshold:item.low_stock_threshold,active:item.active})),
      fixedCosts:(costs.data||[]).map(item=>({id:item.cost_key,label:item.label,amount:item.amount})),
      movements:movements.data||[]
    };
  }

  function setMessage(text,type="ok"){
    const box=document.querySelector("#ee-v16-message");
    if(!box) return;
    box.textContent=text;
    box.dataset.type=type;
  }

  function localMovement(data){
    const productId=data.get("productId");
    const type=data.get("type");
    const amount=Math.abs(number(data.get("quantity")));
    const delta=["adjustment_out","waste"].includes(type)?-amount:amount;
    const unitCost=number(data.get("unitCost"));
    const note=String(data.get("note")||"").trim();
    const products=read(KEYS.products,{});
    const base=catalogProducts().find(item=>item.id===productId);
    products[productId]={...(products[productId]||{}),inventory:number(products[productId]?.inventory ?? base?.inventory)+delta};
    if(unitCost>0 && ["purchase","production"].includes(type)) products[productId].unitCost=unitCost;
    write(KEYS.products,products);
    const movements=read(KEYS.movements,[]);
    movements.unshift({id:uid("mov"),productId,productName:base?.name||productId,type,delta,unitCost,note,createdAt:new Date().toISOString()});
    write(KEYS.movements,movements.slice(0,500));
  }

  function reconcileLocalOrder(orderId){
    const orders=read(KEYS.orders,[]);
    const order=orders.find(item=>item.id===orderId);
    if(!order) return false;
    const shouldCommit=COMMITTED.has(order.status);
    if(shouldCommit===Boolean(order.inventoryCommitted)) return false;
    const direction=shouldCommit?-1:1;
    const products=read(KEYS.products,{});
    const movements=read(KEYS.movements,[]);
    normalizedOrderItems(order).forEach(item=>{
      const base=catalogProducts().find(product=>product.id===item.productId);
      products[item.productId]={...(products[item.productId]||{}),inventory:number(products[item.productId]?.inventory ?? base?.inventory)+(direction*item.quantity)};
      movements.unshift({id:uid("mov"),productId:item.productId,productName:item.name,type:shouldCommit?"sale":"return",delta:direction*item.quantity,unitCost:item.unitCost,orderId:order.id,createdAt:new Date().toISOString()});
    });
    order.inventoryCommitted=shouldCommit;
    order.inventoryCycle=number(order.inventoryCycle)+(shouldCommit?1:0);
    write(KEYS.products,products);
    write(KEYS.movements,movements.slice(0,500));
    write(KEYS.orders,orders);
    return true;
  }

  async function saveThresholds(state){
    const inputs=[...document.querySelectorAll("[data-v16-threshold]")];
    if(state.mode==="local"){
      const saved=read(KEYS.products,{});
      inputs.forEach(input=>{const id=input.dataset.v16Threshold;saved[id]={...(saved[id]||{}),threshold:number(input.value)};});
      write(KEYS.products,saved);
      return;
    }
    const client=await adminClient();
    const results=await Promise.all(inputs.map(input=>client.from("product_operations").update({low_stock_threshold:number(input.value),updated_at:new Date().toISOString()}).eq("product_id",input.dataset.v16Threshold)));
    const failed=results.find(result=>result.error);
    if(failed) throw failed.error;
  }

  async function submitMovement(state,data){
    if(state.mode==="local") { localMovement(data); return; }
    const client=await adminClient();
    const result=await client.rpc("record_inventory_movement_v16",{
      p_product_id:data.get("productId"),
      p_movement_type:data.get("type"),
      p_quantity:number(data.get("quantity")),
      p_unit_cost:number(data.get("unitCost"))||null,
      p_note:String(data.get("note")||"").trim()||null
    });
    if(result.error) throw result.error;
  }

  async function load(){
    const host=document.querySelector("#operations-v16");
    if(!host) return;
    const session=document.querySelector("#admin-dynamic .ee-v15-sessionbar");
    if(!session){
      host.innerHTML='<div class="ee-v16-pending">La operación financiera se habilita al ingresar o abrir la simulación local.</div>';
      return;
    }
    try{
      const state=backendReady() && session.textContent.includes("Administración conectada") ? await remoteState() : localState();
      host.innerHTML=render(state);
      host.querySelector("#ee-v16-movement-form")?.addEventListener("submit",async event=>{
        event.preventDefault();
        const button=event.currentTarget.querySelector("button[type=submit]");
        button.disabled=true;
        try{await submitMovement(state,new FormData(event.currentTarget));await load();setMessage("Movimiento registrado y balance actualizado.");}
        catch(error){console.error(error);setMessage(error.message||"No fue posible registrar el movimiento.","error");button.disabled=false;}
      });
      host.querySelector("#ee-v16-save-thresholds")?.addEventListener("click",async()=>{
        try{await saveThresholds(state);await load();setMessage("Umbrales de inventario guardados.");}
        catch(error){console.error(error);setMessage("No fue posible guardar los umbrales.","error");}
      });
    }catch(error){
      console.error(error);
      host.innerHTML='<div class="ee-v16-pending">No fue posible cargar la operación financiera. Revisa la conexión y los permisos V1.6.</div>';
    }
  }

  function observeAdmin(){
    const admin=document.querySelector("#admin-dynamic");
    if(!admin) return;
    let timer;
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(load,60);}).observe(admin,{childList:true,subtree:true});
    load();
  }

  document.addEventListener("change",event=>{
    const select=event.target.closest?.("[data-order-status]");
    if(!select) return;
    const orderId=select.dataset.orderStatus;
    setTimeout(async()=>{
      if(!backendReady()){
        if(reconcileLocalOrder(orderId)) document.querySelector("#ee-refresh-admin")?.click();
      }
      await load();
    },120);
  });

  window.addEventListener("ee:v16:reload",load);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",observeAdmin,{once:true}); else observeAdmin();
})();
