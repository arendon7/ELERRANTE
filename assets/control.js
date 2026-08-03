(()=>{
  const D=window.EE_DATA;
  if(!D) return;

  const statusText=value=>({
    pending:"Pendiente",
    demo:"Demo",
    review:"En revisión",
    concept:"Conceptual",
    approved:"Aprobado"
  })[value]||value;

  function initControlCenter(){
    const app=document.querySelector("#control-center");
    if(!app||!window.EE_LOCAL) return;

    const overrides=EE_LOCAL.getOverrides();
    const seller={...(D.settings?.seller||{}),...(overrides.seller||{})};
    const products=Array.isArray(D.products)?D.products:[];
    const coverage=Array.isArray(D.coverage)?D.coverage:[];
    const variantCount=products.reduce((total,product)=>total+(product.variants?.length||0),0);

    app.innerHTML=`
      <section class="admin-card demo-control-hero">
        <div>
          <p class="eyebrow">Centro de control integral</p>
          <h2>Modifica la demostración sin tocar código.</h2>
          <p>Los cambios se guardan únicamente en este navegador y pueden exportarse como respaldo.</p>
        </div>
        <div class="studio-actions">
          <button class="btn btn-dark export-demo">Exportar estado</button>
          <label class="btn btn-outline import-label">Importar estado<input type="file" accept=".json" hidden></label>
          <button class="btn btn-outline reset-demo">Restablecer</button>
        </div>
      </section>

      <div class="admin-kpis">
        <div class="stat-card"><small>Productos</small><div class="stat-value">${products.length}</div></div>
        <div class="stat-card"><small>Variaciones</small><div class="stat-value">${variantCount}</div></div>
        <div class="stat-card"><small>Zonas</small><div class="stat-value">${coverage.length}</div></div>
        <div class="stat-card"><small>Versión</small><div class="stat-value">${D.settings?.version||"0.6.1"}</div></div>
      </div>

      <div class="admin-grid">
        <section class="admin-card">
          <p class="eyebrow">Datos visibles</p>
          <h3>Empresa y contacto</h3>
          <form id="seller-form" class="form-grid" style="margin-top:18px">
            <div class="field"><label>Razón social</label><input name="legal_name" value="${seller.legal_name||""}"></div>
            <div class="field"><label>NIT</label><input name="nit" value="${seller.nit||""}"></div>
            <div class="field"><label>Correo</label><input name="email" value="${seller.email||""}"></div>
            <div class="field"><label>Teléfono</label><input name="phone" value="${seller.phone||""}"></div>
            <div class="field full"><label>Ciudad</label><input name="city" value="${seller.city||""}"></div>
            <div class="field full"><button class="btn btn-primary">Guardar datos</button></div>
          </form>
        </section>

        <section class="admin-card">
          <p class="eyebrow">Escenarios</p>
          <h3>Preparar la demostración</h3>
          <div class="grid" style="margin-top:18px;gap:10px">
            <button class="btn btn-outline scenario" data-scenario="clean">Demo limpia</button>
            <button class="btn btn-outline scenario" data-scenario="sales">Escenario comercial</button>
            <button class="btn btn-outline scenario" data-scenario="operations">Escenario operativo</button>
            <button class="btn btn-outline scenario" data-scenario="investor">Escenario inversionista</button>
          </div>
          <p class="muted" style="margin-top:15px">Cada escenario precarga pedidos, eventos, lotes o indicadores para una demostración distinta.</p>
        </section>
      </div>

      <section class="admin-card" style="margin-top:18px">
        <div class="admin-card-head">
          <div><p class="eyebrow">Catálogo</p><h3>Precio e inventario demostrativo</h3></div>
          <button class="btn btn-dark btn-small save-products">Guardar catálogo</button>
        </div>
        <div class="table-wrap">
          <table class="control-products">
            <thead><tr><th>Producto</th><th>Presentación</th><th>SKU</th><th>Precio</th><th>Stock</th><th>Validación</th></tr></thead>
            <tbody>${products.flatMap(product=>(product.variants||[]).map(variant=>`
              <tr data-product="${product.id}" data-variant="${variant.id}">
                <td><strong>${product.name}</strong></td>
                <td>${variant.label}</td>
                <td class="mono">${variant.sku}</td>
                <td><input class="table-input price-input" type="number" value="${variant.price}"></td>
                <td><input class="table-input stock-input" type="number" value="${variant.stock}"></td>
                <td><span class="status-chip ${product.validation?.price==="approved"?"ok":"warn"}">${statusText(product.validation?.price||"demo")}</span></td>
              </tr>`)).join("")}</tbody>
          </table>
        </div>
      </section>

      <section class="admin-card" style="margin-top:18px">
        <p class="eyebrow">Navegación rápida</p>
        <div class="grid grid-4" style="margin-top:18px">
          <a class="intent-card compact" href="index.html"><span class="intent-index">WEB</span><h3>Inicio</h3></a>
          <a class="intent-card compact" href="tienda.html"><span class="intent-index">COMERCIO</span><h3>Tienda</h3></a>
          <a class="intent-card compact" href="operacion.html"><span class="intent-index">OPERACIÓN</span><h3>Producción</h3></a>
          <a class="intent-card compact" href="presentacion.html"><span class="intent-index">PITCH</span><h3>Presentación</h3></a>
        </div>
      </section>`;

    app.querySelector("#seller-form")?.addEventListener("submit",event=>{
      event.preventDefault();
      const state=EE_LOCAL.getOverrides();
      state.seller=Object.fromEntries(new FormData(event.currentTarget).entries());
      EE_LOCAL.setOverrides(state);
      alert("Datos guardados localmente. Recarga la web para verlos aplicados.");
    });

    app.querySelector(".save-products")?.addEventListener("click",()=>{
      const state=EE_LOCAL.getOverrides();
      state.products=state.products||{};
      app.querySelectorAll("tbody tr[data-product]").forEach(row=>{
        const productId=row.dataset.product;
        const variantId=row.dataset.variant;
        state.products[productId]=state.products[productId]||{};
        state.products[productId].variants=state.products[productId].variants||{};
        state.products[productId].variants[variantId]={
          price:Number(row.querySelector(".price-input").value),
          stock:Number(row.querySelector(".stock-input").value)
        };
      });
      EE_LOCAL.setOverrides(state);
      alert("Catálogo guardado. Recarga para aplicar los cambios.");
    });

    app.querySelector(".export-demo")?.addEventListener("click",EE_LOCAL.exportAll);
    app.querySelector(".reset-demo")?.addEventListener("click",()=>{
      if(!confirm("¿Restablecer toda la información guardada por la demo?")) return;
      [
        "ee_v4_overrides","ee_v2_cart","ee_v2_orders","ee_v2_leads","ee_v2_tickets",
        "ee_v3_production","ee_v3_lots","ee_v3_routes","ee_v3_validation"
      ].forEach(key=>localStorage.removeItem(key));
      location.reload();
    });

    app.querySelector(".import-label input")?.addEventListener("change",async event=>{
      const file=event.target.files?.[0];
      if(!file) return;
      try{
        await EE_LOCAL.importAll(file);
        alert("Estado importado correctamente. La página se recargará.");
        location.reload();
      }catch(error){
        alert("No se pudo importar el archivo: "+error.message);
      }
    });

    app.querySelectorAll(".scenario").forEach(button=>{
      button.addEventListener("click",()=>{
        loadScenario(button.dataset.scenario);
        alert("Escenario cargado. Abre el panel o la cuenta para verlo.");
      });
    });
  }

  function loadScenario(name){
    const clear=()=>[
      "ee_v2_cart","ee_v2_orders","ee_v2_leads","ee_v2_tickets",
      "ee_v3_production","ee_v3_lots","ee_v3_routes"
    ].forEach(key=>localStorage.removeItem(key));

    clear();
    if(name==="clean") return;

    if(name==="sales"||name==="investor"){
      localStorage.setItem("ee_v2_orders",JSON.stringify([
        {id:"EE-2026-10521",date:new Date().toISOString(),status:"En preparación · demo",city:"Medellín",shipping:8900,total:94700,lines:[{id:"la-errante",variant:"unidad",qty:2},{id:"panela-maracuya",variant:"250ml",qty:1}]},
        {id:"EE-2026-10520",date:new Date(Date.now()-86400000).toISOString(),status:"Entregado · demo",city:"Envigado",shipping:10900,total:69800,lines:[{id:"harina-aire-y-tiempo",variant:"25kg",qty:1},{id:"salsa-tomate",variant:"500g",qty:1}]},
        {id:"EE-2026-10519",date:new Date(Date.now()-172800000).toISOString(),status:"En ruta · demo",city:"Sabaneta",shipping:11900,total:111600,lines:[{id:"crea-la-tuya",variant:"grande",qty:2},{id:"bosque",variant:"unidad",qty:1},{id:"reduccion-balsamica",variant:"250ml",qty:1}]}
      ]));
      localStorage.setItem("ee_v2_leads",JSON.stringify([
        {id:"EV-2026-4231",date:new Date().toISOString(),status:"Propuesta en preparación"},
        {id:"EV-2026-4218",date:new Date(Date.now()-86400000).toISOString(),status:"Anticipo pendiente"},
        {id:"EV-2026-4170",date:new Date(Date.now()-604800000).toISOString(),status:"Confirmado"}
      ]));
    }

    if(name==="operations"||name==="investor"){
      localStorage.setItem("ee_v3_production",JSON.stringify([
        {id:"OP-2026-0021",product:"La Errante",quantity:36,date:"2026-08-06",status:"En proceso"},
        {id:"OP-2026-0022",product:"Crea la Tuya",quantity:60,date:"2026-08-07",status:"Planificada"},
        {id:"OP-2026-0023",product:"Harina Aire y Tiempo",quantity:80,date:"2026-08-08",status:"Planificada"}
      ]));
      localStorage.setItem("ee_v3_lots",JSON.stringify([
        {id:"EE-ERR-20260805-01",product:"La Errante",quantity:28,status:"Liberado",expiry:"2026-11-05"},
        {id:"EE-CTM-20260804-01",product:"Crea la Tuya",quantity:42,status:"Liberado",expiry:"2026-11-04"},
        {id:"EE-HAT-20260803-01",product:"Harina Aire y Tiempo",quantity:55,status:"Liberado",expiry:"2027-02-03"},
        {id:"EE-BOS-20260805-01",product:"Bosque",quantity:12,status:"Cuarentena",expiry:"2026-11-05"}
      ]));
      localStorage.setItem("ee_v3_routes",JSON.stringify([
        {id:"RUTA-2026-0810",city:"Medellín",date:"2026-08-10",orders:14,capacity:18,status:"Abierta"},
        {id:"RUTA-2026-0812",city:"Sur",date:"2026-08-12",orders:11,capacity:16,status:"Abierta"}
      ]));
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initControlCenter);
  else initControlCenter();
})();
