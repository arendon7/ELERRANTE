(()=>{
  "use strict";

  const BASE = window.EL_ERRANTE_COMMERCE_CONFIG || {};
  const KEYS = {
    orders: "ee_v14_orders",
    settings: "ee_v14_settings",
    products: "ee_v14_products",
    fixedCosts: "ee_v14_fixed_costs"
  };
  const STATUS_LABELS = {
    pending_payment: "Pago pendiente",
    payment_review: "Comprobante por revisar",
    approved: "Aprobado",
    preparing: "En preparación",
    dispatched: "Despachado",
    delivered: "Entregado",
    rejected: "Rechazado",
    cancelled: "Cancelado"
  };

  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (_) {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => new Intl.NumberFormat("es-CO", {style:"currency", currency:"COP", maximumFractionDigits:0}).format(Number(value)||0);
  const number = value => Number(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;
  const uid = prefix => `${prefix}-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase()}`;
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const nowMonth = () => new Date().toISOString().slice(0,7);

  function getSettings(){
    const saved = read(KEYS.settings, {});
    return {
      payment: {...(BASE.payment||{}), ...(saved.payment||{})},
      finance: {...(BASE.finance||{}), ...(saved.finance||{})},
      ordering: {...(BASE.ordering||{}), ...(saved.ordering||{})}
    };
  }

  function backendReady(){
    return Boolean(BASE.backend?.url && BASE.backend?.publishableKey);
  }

  async function supabase(){
    if(window.__EE_SUPABASE__) return window.__EE_SUPABASE__;
    if(!backendReady()) throw new Error("Backend no configurado");
    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    window.__EE_SUPABASE__ = module.createClient(BASE.backend.url, BASE.backend.publishableKey, {
      auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
    });
    return window.__EE_SUPABASE__;
  }

  function products(){
    const overrides = read(KEYS.products, {});
    const catalog = Array.isArray(window.EE_DATA?.products) ? window.EE_DATA.products : [];
    return catalog.map(product => {
      const variant = Array.isArray(product.variants) ? product.variants[0] || {} : {};
      const id = product.id || variant.id || uid("producto");
      const saved = overrides[id] || {};
      return {
        id,
        name: product.name || product.title || variant.name || id,
        price: number(saved.price ?? variant.price ?? product.price),
        unitCost: number(saved.unitCost ?? product.unitCost ?? 0),
        inventory: number(saved.inventory ?? product.inventory ?? 0),
        active: saved.active !== false
      };
    });
  }

  function cartItems(){
    const raw = read("ee_v2_cart", []);
    const catalog = Array.isArray(window.EE_DATA?.products) ? window.EE_DATA.products : [];
    const overrides = read(KEYS.products, {});
    return (Array.isArray(raw) ? raw : []).map(row => {
      const productId = row.productId || row.product_id || row.id;
      const product = catalog.find(item => item.id === productId) || {};
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const variantId = row.variantId || row.variant_id;
      const variant = variants.find(item => item.id === variantId) || variants[0] || {};
      const saved = overrides[productId] || {};
      const quantity = Math.max(1, number(row.quantity ?? row.qty ?? 1));
      const price = number(saved.price ?? row.price ?? variant.price ?? product.price);
      return {
        productId,
        variantId: variant.id || variantId || null,
        name: row.name || product.name || product.title || variant.name || "Producto El Errante",
        quantity,
        unitPrice: price,
        unitCost: number(saved.unitCost ?? product.unitCost ?? 0),
        lineTotal: quantity * price
      };
    });
  }

  async function compressReceipt(file){
    if(!file) return null;
    if(!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .78));
    return new File([blob], `comprobante-${Date.now()}.jpg`, {type:"image/jpeg"});
  }

  function toDataUrl(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function saveOrderLocal(order, receipt){
    if(receipt) order.receiptDataUrl = await toDataUrl(await compressReceipt(receipt));
    const orders = read(KEYS.orders, []);
    orders.unshift(order);
    write(KEYS.orders, orders);
    return order;
  }

  async function saveOrderRemote(order, receipt){
    const client = await supabase();
    let {data:{session}} = await client.auth.getSession();
    if(!session){
      const result = await client.auth.signInAnonymously();
      if(result.error) throw result.error;
      session = result.data.session;
    }
    const ownerId = session.user.id;
    const orderRow = {
      id: order.id,
      customer_user_id: ownerId,
      status: order.status,
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      city: order.delivery.city,
      neighborhood: order.delivery.neighborhood,
      address: order.delivery.address,
      delivery_notes: order.delivery.notes,
      requested_date: order.delivery.requestedDate || null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      payment_method: "bank_transfer",
      payment_reference: order.paymentReference,
      source: "web"
    };
    const inserted = await client.from("orders").insert(orderRow);
    if(inserted.error) throw inserted.error;
    const itemRows = order.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost_snapshot: item.unitCost,
      line_total: item.lineTotal
    }));
    const itemInsert = await client.from("order_items").insert(itemRows);
    if(itemInsert.error) throw itemInsert.error;
    if(receipt){
      const clean = await compressReceipt(receipt);
      const path = `${ownerId}/${order.id}/${clean.name}`;
      const upload = await client.storage.from(BASE.backend.receiptBucket || "payment-receipts").upload(path, clean, {upsert:false, contentType:clean.type});
      if(upload.error) throw upload.error;
      const receiptInsert = await client.from("payment_receipts").insert({order_id:order.id, owner_id:ownerId, storage_path:path, status:"pending"});
      if(receiptInsert.error) throw receiptInsert.error;
    }
    return order;
  }

  function checkoutTemplate(){
    const settings = getSettings();
    const payment = settings.payment;
    const detailsReady = payment.accountNumber || payment.key;
    return `
      <h3>1. ¿Quién recibe el pedido?</h3>
      <div class="ee-v14-form-grid" style="margin-top:20px">
        <div class="ee-v14-field"><label for="ee-name">Nombre completo</label><input id="ee-name" name="name" autocomplete="name" required></div>
        <div class="ee-v14-field"><label for="ee-phone">WhatsApp o teléfono</label><input id="ee-phone" name="phone" autocomplete="tel" required></div>
        <div class="ee-v14-field full"><label for="ee-email">Correo electrónico</label><input id="ee-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <h3 style="margin-top:34px">2. ¿Dónde y cuándo coordinamos la entrega?</h3>
      <p class="ee-v14-help">No cerramos el pedido por rutas fijas ni por días predeterminados. Recibimos tu solicitud y coordinamos contigo la alternativa logística disponible.</p>
      <div class="ee-v14-form-grid" style="margin-top:18px">
        <div class="ee-v14-field"><label for="ee-city">Ciudad o municipio</label><input id="ee-city" name="city" required placeholder="Medellín, Envigado, Bello…"></div>
        <div class="ee-v14-field"><label for="ee-neighborhood">Barrio o sector</label><input id="ee-neighborhood" name="neighborhood" required></div>
        <div class="ee-v14-field full"><label for="ee-address">Dirección</label><input id="ee-address" name="address" autocomplete="street-address" required></div>
        <div class="ee-v14-field"><label for="ee-date">Fecha preferida</label><input id="ee-date" name="requestedDate" type="date"></div>
        <div class="ee-v14-field full"><label for="ee-notes">Indicaciones y horario</label><textarea id="ee-notes" name="notes" placeholder="Unidad, portería, referencias, horario disponible o cualquier detalle útil"></textarea></div>
      </div>
      <h3 style="margin-top:34px">3. Transferencia y comprobante</h3>
      <div class="ee-v14-bank">
        <strong>${escapeHtml(payment.bank || "Bancolombia")}</strong>
        <p>${escapeHtml(payment.instructions || "Realiza la transferencia y adjunta el comprobante.")}</p>
        <div class="ee-v14-bank-grid">
          <div class="ee-v14-bank-item"><small>Tipo de cuenta</small><strong>${escapeHtml(payment.accountType || "Cuenta de ahorros")}</strong></div>
          <div class="ee-v14-bank-item"><small>Titular</small><strong>${escapeHtml(payment.accountHolder || "Pendiente de configuración")}</strong></div>
          <div class="ee-v14-bank-item"><small>Número de cuenta</small><strong>${escapeHtml(payment.accountNumber || "Pendiente de configuración")}</strong></div>
          <div class="ee-v14-bank-item"><small>Llave</small><strong>${escapeHtml(payment.key || "Pendiente de configuración")}</strong></div>
        </div>
        ${detailsReady ? "" : '<div class="ee-v14-note" style="margin-top:14px">En esta iteración de revisión aún falta registrar la cuenta y la llave reales desde Administración.</div>'}
      </div>
      <div class="ee-v14-drop" style="margin-top:18px">
        <label for="ee-receipt"><strong>Adjunta el comprobante de transferencia</strong></label>
        <p class="ee-v14-help">JPG, PNG o PDF. En producción se almacenará de forma privada.</p>
        <input id="ee-receipt" name="receipt" type="file" accept="image/jpeg,image/png,application/pdf" ${settings.ordering.requireReceipt ? "required" : ""}>
        <img id="ee-receipt-preview" class="ee-v14-receipt-preview" alt="Vista previa del comprobante">
      </div>
      <div class="ee-v14-field" style="margin-top:20px"><label><input name="consent" type="checkbox" required> Confirmo que los datos son correctos y autorizo el contacto para coordinar mi pedido.</label></div>
      <div id="ee-checkout-error" class="form-alert" aria-live="polite"></div>
      <button class="btn btn-primary" type="submit" style="width:100%;margin-top:20px">Enviar pedido y comprobante</button>`;
  }

  function currentTotals(items){
    const subtotal = items.reduce((sum,item)=>sum+item.lineTotal,0);
    const displayedDelivery = number(document.querySelector("#checkout-shipping")?.textContent);
    return {subtotal, deliveryFee:displayedDelivery, total:subtotal+displayedDelivery};
  }

  async function initCheckout(){
    const oldForm = document.querySelector("#checkout-form");
    if(!oldForm) return;
    const form = document.createElement("form");
    form.className = oldForm.className;
    form.id = "checkout-form-v14";
    form.innerHTML = checkoutTemplate();
    oldForm.replaceWith(form);

    const preview = form.querySelector("#ee-receipt-preview");
    form.receipt.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if(file?.type.startsWith("image/")){
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      } else {
        preview.removeAttribute("src");
        preview.style.display = "none";
      }
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector("button[type=submit]");
      const errorBox = form.querySelector("#ee-checkout-error");
      errorBox.textContent = "";
      const items = cartItems();
      if(!items.length){ errorBox.textContent = "Tu carrito está vacío."; return; }
      const receipt = form.receipt.files?.[0] || null;
      const limit = getSettings().ordering.maxReceiptBytesPreview || 5000000;
      if(!backendReady() && receipt && receipt.size > limit){ errorBox.textContent = "Para esta vista previa el comprobante debe pesar menos de 5 MB."; return; }
      if(backendReady() && !(getSettings().payment.accountNumber || getSettings().payment.key)){
        errorBox.textContent = "Los datos de transferencia todavía no están configurados."; return;
      }
      button.disabled = true;
      button.textContent = "Registrando pedido…";
      try{
        const totals = currentTotals(items);
        const data = new FormData(form);
        const order = {
          id: uid("EE"),
          createdAt: new Date().toISOString(),
          month: nowMonth(),
          status: receipt ? "payment_review" : "pending_payment",
          customer: {name:data.get("name"), email:data.get("email"), phone:data.get("phone")},
          delivery: {city:data.get("city"), neighborhood:data.get("neighborhood"), address:data.get("address"), requestedDate:data.get("requestedDate"), notes:data.get("notes")},
          items,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          paymentReference: uid("PAGO"),
          source: backendReady() ? "supabase" : "local-preview"
        };
        if(backendReady()) await saveOrderRemote(order, receipt); else await saveOrderLocal(order, receipt);
        write("ee_v2_cart", []);
        form.closest(".form-card").innerHTML = `<div class="ee-v14-order-success"><p class="eyebrow">Pedido recibido</p><h2>Gracias. Ya tenemos tu solicitud.</h2><p>Referencia: <strong>${escapeHtml(order.id)}</strong></p><p>Revisaremos el comprobante y coordinaremos contigo la preparación y entrega. El pedido cambia a aprobado cuando el pago sea verificado.</p>${backendReady()?"":'<div class="ee-v14-note">Este registro quedó en el modo local de revisión. La sincronización entre el comprador y Juan se activará al conectar el backend privado.</div>'}<a class="btn btn-primary" href="tienda.html" style="margin-top:18px">Volver a la tienda</a></div>`;
        document.querySelector("#checkout-lines")?.replaceChildren();
      }catch(error){
        console.error(error);
        errorBox.textContent = "No pudimos registrar el pedido. Revisa la conexión e inténtalo nuevamente.";
        button.disabled = false;
        button.textContent = "Enviar pedido y comprobante";
      }
    });
  }

  function localState(){
    const settings = getSettings();
    return {
      orders: read(KEYS.orders, []),
      products: products(),
      fixedCosts: read(KEYS.fixedCosts, settings.finance.monthlyFixedCosts || [])
    };
  }

  function metrics(state){
    const orders = state.orders.filter(order => (order.month || order.createdAt?.slice(0,7)) === nowMonth());
    const approvedStatuses = new Set(["approved","preparing","dispatched","delivered"]);
    const sales = orders.filter(order => approvedStatuses.has(order.status)).reduce((sum,order)=>sum+number(order.total),0);
    const variable = orders.filter(order => approvedStatuses.has(order.status)).flatMap(order=>order.items||[]).reduce((sum,item)=>sum+number(item.unitCost)*number(item.quantity),0);
    const fixed = state.fixedCosts.reduce((sum,item)=>sum+number(item.amount),0);
    return {orders:orders.length, sales, variable, fixed, balance:sales-variable-fixed};
  }

  function statusOptions(current){
    return Object.entries(STATUS_LABELS).map(([value,label])=>`<option value="${value}" ${value===current?"selected":""}>${label}</option>`).join("");
  }

  function adminDashboard(state, mode){
    const m = metrics(state);
    const orderRows = state.orders.length ? state.orders.map(order => `
      <tr>
        <td><strong>${escapeHtml(order.id)}</strong><br><small>${escapeHtml(new Date(order.createdAt).toLocaleString("es-CO"))}</small></td>
        <td>${escapeHtml(order.customer?.name)}<br><small>${escapeHtml(order.customer?.phone)}</small></td>
        <td>${money(order.total)}</td>
        <td><select data-order-status="${escapeHtml(order.id)}">${statusOptions(order.status)}</select></td>
        <td class="ee-v14-actions">${order.receiptDataUrl?`<button class="ee-v14-btn secondary" data-view-receipt="${escapeHtml(order.id)}">Comprobante</button>`:"<span class='ee-v14-help'>Sin archivo local</span>"}</td>
      </tr>`).join("") : '<tr><td colspan="5" class="ee-v14-empty">Todavía no hay pedidos registrados.</td></tr>';
    const productRows = state.products.length ? state.products.map(product => `
      <tr class="ee-v14-product-row">
        <td><strong>${escapeHtml(product.name)}</strong><br><small>${escapeHtml(product.id)}</small></td>
        <td><input type="number" min="0" step="100" value="${product.price}" data-product-price="${escapeHtml(product.id)}"></td>
        <td><input type="number" min="0" step="100" value="${product.unitCost}" data-product-cost="${escapeHtml(product.id)}"></td>
        <td><input type="number" min="0" step="1" value="${product.inventory}" data-product-inventory="${escapeHtml(product.id)}"></td>
      </tr>`).join("") : '<tr><td colspan="4" class="ee-v14-empty">No fue posible leer el catálogo.</td></tr>';
    const costRows = state.fixedCosts.map(item => `<div class="ee-v14-field"><label>${escapeHtml(item.label)}</label><input type="number" min="0" step="50000" value="${number(item.amount)}" data-fixed-cost="${escapeHtml(item.id)}"></div>`).join("");
    const settings = getSettings();
    return `
      <div class="ee-v14-banner"><div><strong>${mode === "remote" ? "Administración conectada" : "Vista local de revisión"}</strong><p>${mode === "remote" ? "Los pedidos y comprobantes se consultan desde el backend privado." : "Esta vista permite probar la lógica financiera en este navegador. No es un acceso privado ni comparte información entre dispositivos."}</p></div></div>
      <div class="ee-v14-grid">
        <section class="ee-v14-card ee-v14-metric"><small>Pedidos del mes</small><strong>${m.orders}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Ventas aprobadas</small><strong>${money(m.sales)}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Costos variables</small><strong>${money(m.variable)}</strong></section>
        <section class="ee-v14-card ee-v14-metric"><small>Balance del mes</small><strong class="${m.balance>=0?"ee-v14-positive":"ee-v14-negative"}">${money(m.balance)}</strong></section>
        <section class="ee-v14-card"><div class="ee-v14-toolbar"><div><p class="eyebrow">Pedidos</p><h2>Seguimiento y aprobación</h2></div><button class="ee-v14-btn secondary" id="ee-refresh-admin">Actualizar</button></div><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${orderRows}</tbody></table></div></section>
        <section class="ee-v14-card"><p class="eyebrow">Catálogo operativo</p><h2>Precios, costos e inventario</h2><p class="ee-v14-help">Los valores actuales son de demostración y quedan listos para reemplazarlos cuando entregues la tabla real.</p><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Producto</th><th>Precio venta</th><th>Costo unitario</th><th>Inventario</th></tr></thead><tbody>${productRows}</tbody></table></div><button class="ee-v14-btn terracotta" id="ee-save-products" style="margin-top:16px">Guardar catálogo operativo</button></section>
        <section class="ee-v14-card"><p class="eyebrow">Estructura mensual</p><h2>Gastos fijos</h2><div class="ee-v14-form-grid">${costRows}</div><p class="ee-v14-note" style="margin-top:16px">Total configurado: <strong>${money(m.fixed)}</strong>. La base inicial es de $6.000.000 mensuales.</p><button class="ee-v14-btn terracotta" id="ee-save-costs" style="margin-top:16px">Guardar gastos fijos</button></section>
        <section class="ee-v14-card"><p class="eyebrow">Transferencias</p><h2>Datos bancarios visibles en checkout</h2><div class="ee-v14-form-grid"><div class="ee-v14-field"><label>Titular</label><input id="ee-bank-holder" value="${escapeHtml(settings.payment.accountHolder||"")}"></div><div class="ee-v14-field"><label>Cuenta de ahorros Bancolombia</label><input id="ee-bank-account" value="${escapeHtml(settings.payment.accountNumber||"")}"></div><div class="ee-v14-field full"><label>Llave</label><input id="ee-bank-key" value="${escapeHtml(settings.payment.key||"")}"></div></div><button class="ee-v14-btn terracotta" id="ee-save-payment" style="margin-top:16px">Guardar datos de transferencia</button></section>
      </div>`;
  }

  function bindLocalAdmin(container){
    container.addEventListener("change", event => {
      const select = event.target.closest("[data-order-status]");
      if(!select) return;
      const orders = read(KEYS.orders, []);
      const order = orders.find(item => item.id === select.dataset.orderStatus);
      if(order){ order.status = select.value; order.updatedAt = new Date().toISOString(); write(KEYS.orders, orders); renderLocalAdmin(container); }
    });
    container.addEventListener("click", event => {
      const receiptButton = event.target.closest("[data-view-receipt]");
      if(receiptButton){
        const order = read(KEYS.orders, []).find(item => item.id === receiptButton.dataset.viewReceipt);
        if(order?.receiptDataUrl) window.open(order.receiptDataUrl, "_blank", "noopener");
        return;
      }
      if(event.target.closest("#ee-refresh-admin")){ renderLocalAdmin(container); return; }
      if(event.target.closest("#ee-save-products")){
        const saved = read(KEYS.products, {});
        container.querySelectorAll("[data-product-price]").forEach(input => {
          const id = input.dataset.productPrice;
          saved[id] = {...(saved[id]||{}), price:number(input.value)};
        });
        container.querySelectorAll("[data-product-cost]").forEach(input => {
          const id = input.dataset.productCost;
          saved[id] = {...(saved[id]||{}), unitCost:number(input.value)};
        });
        container.querySelectorAll("[data-product-inventory]").forEach(input => {
          const id = input.dataset.productInventory;
          saved[id] = {...(saved[id]||{}), inventory:number(input.value)};
        });
        write(KEYS.products, saved); renderLocalAdmin(container); return;
      }
      if(event.target.closest("#ee-save-costs")){
        const defaults = getSettings().finance.monthlyFixedCosts || [];
        const costs = defaults.map(item => ({...item, amount:number(container.querySelector(`[data-fixed-cost="${CSS.escape(item.id)}"]`)?.value)}));
        write(KEYS.fixedCosts, costs); renderLocalAdmin(container); return;
      }
      if(event.target.closest("#ee-save-payment")){
        const settings = read(KEYS.settings, {});
        settings.payment = {...(settings.payment||{}), accountHolder:container.querySelector("#ee-bank-holder").value.trim(), accountNumber:container.querySelector("#ee-bank-account").value.trim(), key:container.querySelector("#ee-bank-key").value.trim()};
        write(KEYS.settings, settings); renderLocalAdmin(container);
      }
    }, {once:false});
  }

  function renderLocalAdmin(container){
    container.innerHTML = adminDashboard(localState(), "local");
  }

  async function renderRemoteAdmin(container, client){
    const [{data:orders,error:ordersError},{data:items},{data:catalog},{data:costs}] = await Promise.all([
      client.from("orders").select("*").order("created_at",{ascending:false}),
      client.from("order_items").select("*"),
      client.from("product_operations").select("*"),
      client.from("fixed_costs").select("*").eq("month",nowMonth())
    ]);
    if(ordersError) throw ordersError;
    const state = {
      orders:(orders||[]).map(order=>({id:order.id,createdAt:order.created_at,month:order.created_at?.slice(0,7),status:order.status,total:order.total,customer:{name:order.customer_name,phone:order.customer_phone},items:(items||[]).filter(item=>item.order_id===order.id).map(item=>({quantity:item.quantity,unitCost:item.unit_cost_snapshot}))})),
      products:(catalog||[]).map(item=>({id:item.product_id,name:item.product_name,price:item.sale_price,unitCost:item.unit_cost,inventory:item.inventory})),
      fixedCosts:(costs||[]).map(item=>({id:item.cost_key,label:item.label,amount:item.amount}))
    };
    if(!state.products.length) state.products = products();
    if(!state.fixedCosts.length) state.fixedCosts = getSettings().finance.monthlyFixedCosts || [];
    container.innerHTML = adminDashboard(state,"remote");
    container.addEventListener("change", async event => {
      const select = event.target.closest("[data-order-status]");
      if(!select) return;
      const result = await client.from("orders").update({status:select.value,updated_at:new Date().toISOString()}).eq("id",select.dataset.orderStatus);
      if(result.error) alert("No fue posible actualizar el pedido."); else renderRemoteAdmin(container,client);
    }, {once:true});
  }

  async function initAdmin(){
    const container = document.querySelector("#admin-dynamic");
    if(!container) return;
    if(!backendReady()){
      container.innerHTML = `<div class="ee-v14-auth"><p class="eyebrow">Administración V1.4</p><h1>Panel operativo en preparación.</h1><p>El acceso privado necesita el backend autenticado. Mientras se conecta, puedes abrir una vista local de revisión para probar pedidos, precios, inventarios, costos y balance.</p><button class="ee-v14-btn terracotta" id="ee-open-local-admin">Abrir vista local de revisión</button></div>`;
      container.querySelector("#ee-open-local-admin").addEventListener("click",()=>{renderLocalAdmin(container);bindLocalAdmin(container);});
      return;
    }
    const client = await supabase();
    const {data:{session}} = await client.auth.getSession();
    if(!session || session.user?.is_anonymous){
      container.innerHTML = `<form class="ee-v14-auth" id="ee-admin-login"><p class="eyebrow">Acceso privado</p><h1>Administración El Errante</h1><div class="ee-v14-field"><label>Correo</label><input name="email" type="email" required autocomplete="username"></div><div class="ee-v14-field" style="margin-top:14px"><label>Contraseña</label><input name="password" type="password" required autocomplete="current-password"></div><div id="ee-login-error" class="form-alert"></div><button class="ee-v14-btn terracotta" style="width:100%;margin-top:18px">Ingresar</button></form>`;
      container.querySelector("#ee-admin-login").addEventListener("submit",async event=>{
        event.preventDefault(); const data=new FormData(event.currentTarget); const result=await client.auth.signInWithPassword({email:data.get("email"),password:data.get("password")});
        if(result.error) container.querySelector("#ee-login-error").textContent="Credenciales inválidas o usuario sin autorización."; else renderRemoteAdmin(container,client);
      });
      return;
    }
    await renderRemoteAdmin(container,client);
  }

  function init(){
    if(document.body?.dataset.page === "checkout") initCheckout();
    if(document.body?.dataset.page === "admin") initAdmin();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true}); else setTimeout(init,0);
})();
