(()=>{
  'use strict';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  const target=document.querySelector('#procurement-v25');
  if(!DATA||!target)return;

  const CONFIG=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const KEYS={
    sourceOrders:'ee_v14_orders',
    stock:'ee_v23_material_stock',
    purchases:'ee_v24_material_purchases',
    purchaseOrders:'ee_v25_purchase_orders'
  };
  const DATE_KEY='ee_v22_selected_date';
  const ACTIVE_SALES=new Set(['approved','preparing']);
  const OPEN_PURCHASES=new Set(['draft','approved','ordered','partial']);
  const STATUS_LABEL={draft:'Borrador',approved:'Aprobada',ordered:'Emitida',partial:'Recepción parcial',received:'Recibida',cancelled:'Cancelada'};
  const STATUS_STATE={draft:'draft',approved:'approved',ordered:'ordered',partial:'partial',received:'received',cancelled:'cancelled'};
  const SAFETY_PERCENT=Number(DATA.stockPolicy?.safetyPercent)||10;
  const LEAD_TIME_DAYS=Number(DATA.stockPolicy?.leadTimeDays)||2;
  let flash='';
  let snapshot={remote:false,sourceOrders:[],stock:{},purchases:[],purchaseOrders:[]};

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const num=(value,digits=2)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(Number(value)||0);
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const selectedDate=()=>sessionStorage.getItem(DATE_KEY)||today();
  const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const addDays=(date,days)=>{const value=new Date(`${date}T12:00:00`);value.setDate(value.getDate()+days);return value.toISOString().slice(0,10);};
  const client=()=>window.__EE_ADMIN_SUPABASE__||null;
  const backendReady=()=>Boolean(CONFIG.backend?.url&&CONFIG.backend?.publishableKey&&client());

  function findProduct(item){
    const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
    const name=norm(item.name||item.product_name);
    return DATA.products.find(product=>product.ids.some(id=>ids.includes(id))||product.names.some(candidate=>norm(candidate)===name)||norm(product.name)===name)||null;
  }
  function explode(product,amount,bag=new Map(),seen=new Set()){
    if(!product||seen.has(product.sku))return bag;
    const next=new Set(seen);next.add(product.sku);
    (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+(Number(line.qty)||0)*amount));
    (product.components||[]).forEach(component=>explode(DATA.products.find(item=>item.sku===component.sku),amount*(Number(component.qty)||0),bag,next));
    return bag;
  }
  function currentRequirements(sourceOrders=snapshot.sourceOrders){
    const date=selectedDate();
    const materials=new Map();
    sourceOrders.filter(order=>ACTIVE_SALES.has(String(order.status))&&String(order.delivery?.requestedDate||order.requested_date||'')===date).forEach(order=>{
      (order.items||[]).forEach(item=>{const product=findProduct(item);if(product)explode(product,Number(item.quantity)||0,materials);});
    });
    return materials;
  }
  function supplierStats(){
    const grouped=new Map();
    snapshot.purchases.forEach(item=>{
      const supplier=String(item.supplier||item.supplier_name_snapshot||'').trim();
      const materialId=String(item.materialId||item.material_id||'');
      const unitCost=Number(item.unitCost??item.unit_cost)||0;
      const date=String(item.receivedDate||item.received_date||item.createdAt||item.created_at||'');
      if(!supplier||!materialId||!(unitCost>0))return;
      const key=`${materialId}::${norm(supplier)}`;
      const row=grouped.get(key)||{materialId,supplier,count:0,totalUnitCost:0,lastUnitCost:0,lastDate:'',minUnitCost:null,maxUnitCost:null};
      row.count+=1;row.totalUnitCost+=unitCost;
      row.minUnitCost=row.minUnitCost===null?unitCost:Math.min(row.minUnitCost,unitCost);
      row.maxUnitCost=row.maxUnitCost===null?unitCost:Math.max(row.maxUnitCost,unitCost);
      if(!row.lastDate||date>row.lastDate){row.lastDate=date;row.lastUnitCost=unitCost;}
      grouped.set(key,row);
    });
    return [...grouped.values()].map(row=>({...row,averageUnitCost:row.count?row.totalUnitCost/row.count:0})).sort((a,b)=>a.materialId.localeCompare(b.materialId)||b.lastDate.localeCompare(a.lastDate));
  }
  function latestSupplierMap(){
    const map=new Map();
    supplierStats().forEach(row=>{if(!map.has(row.materialId)||row.lastDate>map.get(row.materialId).lastDate)map.set(row.materialId,row);});
    return map;
  }
  function openCommitted(materialId){
    return snapshot.purchaseOrders.filter(order=>String(order.materialId||order.material_id)===materialId&&OPEN_PURCHASES.has(String(order.status))).reduce((sum,order)=>{
      const quantity=Number(order.requestedQty??order.requested_quantity)||0;
      const received=Number(order.receivedQty??order.received_quantity)||0;
      return sum+Math.max(0,quantity-received);
    },0);
  }
  function suggestions(){
    const requirements=currentRequirements();
    const latest=latestSupplierMap();
    return [...requirements.entries()].map(([materialId,required])=>{
      const material=DATA.materials.find(item=>item.id===materialId)||{id:materialId,name:materialId,unit:'unidad',cost:0};
      const known=snapshot.stock[materialId]!==undefined&&snapshot.stock[materialId]!==null&&snapshot.stock[materialId]!=='';
      const available=known?Number(snapshot.stock[materialId]):null;
      const gap=known?Math.max(0,required-available):null;
      const committed=openCommitted(materialId);
      const gross=gap===null?null:gap*(1+SAFETY_PERCENT/100);
      const suggested=gross===null?null:Math.max(0,gross-committed);
      const observed=latest.get(materialId)||null;
      return {material,required,available,gap,committed,suggested,observed};
    }).filter(row=>row.available!==null&&row.suggested>0).sort((a,b)=>b.suggested-a.suggested||a.material.name.localeCompare(b.material.name,'es'));
  }
  function normalizePurchaseOrder(row){
    return {
      id:String(row.id),
      code:String(row.code||row.order_code||row.id),
      materialId:String(row.materialId||row.material_id||''),
      supplier:String(row.supplier||row.supplier_name_snapshot||''),
      status:String(row.status||'draft'),
      requestedQty:Number(row.requestedQty??row.requested_quantity)||0,
      receivedQty:Number(row.receivedQty??row.received_quantity)||0,
      unitCost:Number(row.unitCost??row.unit_cost_snapshot)||0,
      expectedDate:String(row.expectedDate||row.expected_date||''),
      externalReference:String(row.externalReference||row.external_reference||''),
      note:String(row.note||''),
      createdAt:String(row.createdAt||row.created_at||''),
      updatedAt:String(row.updatedAt||row.updated_at||'')
    };
  }
  function materialFor(id){return DATA.materials.find(item=>item.id===id)||{id,name:id,unit:'unidad'};}
  function statusBadge(order){return `<span class="ee-v25-state" data-state="${STATUS_STATE[order.status]||'draft'}">${esc(STATUS_LABEL[order.status]||order.status)}</span>`;}
  function metrics(){
    const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder);
    const issued=rows.filter(row=>['ordered','partial'].includes(row.status));
    return {
      suggestions:suggestions().length,
      drafts:rows.filter(row=>['draft','approved'].includes(row.status)).length,
      issued:issued.length,
      commitment:issued.reduce((sum,row)=>sum+Math.max(0,row.requestedQty-row.receivedQty)*row.unitCost,0)
    };
  }
  function suggestionTable(){
    const rows=suggestions();
    if(!rows.length)return '<div class="ee-v25-empty">No hay faltantes con conteo físico que requieran un nuevo borrador para la fecha seleccionada.</div>';
    return `<div class="ee-v25-table-wrap"><table class="ee-v25-table"><thead><tr><th>Material</th><th>Faltante</th><th>Ya solicitado</th><th>Borrador sugerido</th><th>Evidencia disponible</th><th></th></tr></thead><tbody>${rows.map(row=>`<tr data-v25-suggestion="${esc(row.material.id)}"><td><strong>${esc(row.material.name)}</strong><small>${esc(row.material.unit)}</small></td><td>${num(row.gap)} ${esc(row.material.unit)}</td><td>${num(row.committed)} ${esc(row.material.unit)}</td><td>${num(row.suggested)} ${esc(row.material.unit)}</td><td>${row.observed?`${esc(row.observed.supplier)}<small>${money(row.observed.lastUnitCost)} · última compra observada</small>`:'Sin proveedor observado'}</td><td><button type="button" class="ee-v25-action" data-v25-create="${esc(row.material.id)}">Crear borrador</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function actionButtons(order){
    const actions=[];
    if(order.status==='draft')actions.push(`<button type="button" data-v25-edit="${esc(order.id)}">Editar</button><button type="button" data-v25-transition="approved" data-v25-order="${esc(order.id)}">Aprobar</button>`);
    if(order.status==='approved')actions.push(`<button type="button" data-v25-transition="ordered" data-v25-order="${esc(order.id)}">Marcar emitida</button>`);
    if(['ordered','partial'].includes(order.status))actions.push(`<button type="button" data-v25-receive="${esc(order.id)}">Registrar recepción</button>`);
    if(!['received','cancelled'].includes(order.status))actions.push(`<button type="button" class="danger" data-v25-transition="cancelled" data-v25-order="${esc(order.id)}">Cancelar</button>`);
    return actions.join('');
  }
  function activeOrdersTable(){
    const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder).filter(order=>OPEN_PURCHASES.has(order.status)).sort((a,b)=>a.expectedDate.localeCompare(b.expectedDate)||b.createdAt.localeCompare(a.createdAt));
    if(!rows.length)return '<div class="ee-v25-empty">No hay borradores ni órdenes de compra abiertas.</div>';
    return `<div class="ee-v25-table-wrap"><table class="ee-v25-table"><thead><tr><th>Orden</th><th>Material</th><th>Proveedor</th><th>Cantidad</th><th>Compromiso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows.map(order=>{const material=materialFor(order.materialId);const outstanding=Math.max(0,order.requestedQty-order.receivedQty);return `<tr data-v25-order-row="${esc(order.id)}"><td><strong>${esc(order.code)}</strong><small>${esc(order.expectedDate||'Sin fecha esperada')}</small></td><td>${esc(material.name)}</td><td>${esc(order.supplier||'Pendiente de definir')}</td><td>${num(order.receivedQty)} / ${num(order.requestedQty)} ${esc(material.unit)}<small>Pendiente ${num(outstanding)}</small></td><td>${order.unitCost>0?money(outstanding*order.unitCost):'Sin costo acordado'}</td><td>${statusBadge(order)}</td><td><div class="ee-v25-actions">${actionButtons(order)}</div></td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function supplierTable(){
    const rows=supplierStats();
    if(!rows.length)return '<div class="ee-v25-empty">Aún no existen compras observadas suficientes para comparar proveedores.</div>';
    return `<div class="ee-v25-table-wrap"><table class="ee-v25-table"><thead><tr><th>Material</th><th>Proveedor</th><th>Compras</th><th>Último costo</th><th>Promedio observado</th><th>Rango observado</th><th>Última recepción</th></tr></thead><tbody>${rows.map(row=>{const material=materialFor(row.materialId);return `<tr><td>${esc(material.name)}</td><td><strong>${esc(row.supplier)}</strong></td><td>${row.count}</td><td>${money(row.lastUnitCost)}</td><td>${money(row.averageUnitCost)}</td><td>${money(row.minUnitCost)} – ${money(row.maxUnitCost)}</td><td>${esc(String(row.lastDate).slice(0,10)||'—')}</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function historyTable(){
    const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder).filter(order=>['received','cancelled'].includes(order.status)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,20);
    if(!rows.length)return '<div class="ee-v25-empty">Aún no hay órdenes cerradas.</div>';
    return `<div class="ee-v25-table-wrap"><table class="ee-v25-table"><thead><tr><th>Orden</th><th>Material</th><th>Proveedor</th><th>Resultado</th><th>Estado</th></tr></thead><tbody>${rows.map(order=>{const material=materialFor(order.materialId);return `<tr><td>${esc(order.code)}</td><td>${esc(material.name)}</td><td>${esc(order.supplier||'—')}</td><td>${num(order.receivedQty)} de ${num(order.requestedQty)} ${esc(material.unit)}</td><td>${statusBadge(order)}</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function orderForm(){
    const options=DATA.materials.map(material=>`<option value="${esc(material.id)}">${esc(material.name)} · ${esc(material.unit)}</option>`).join('');
    const suppliers=[...new Set(snapshot.purchases.map(item=>String(item.supplier||item.supplier_name_snapshot||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    return `<details class="ee-v25-details" id="ee-v25-order-details"><summary>Crear o editar borrador de compra</summary><form class="ee-v25-form" id="ee-v25-order-form"><input type="hidden" name="id"><div class="ee-v25-form-grid"><label><span>Material</span><select name="materialId" required>${options}</select></label><label><span>Proveedor</span><input name="supplier" list="ee-v25-suppliers" placeholder="Puede definirse antes de aprobar"><datalist id="ee-v25-suppliers">${suppliers.map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist></label><label><span>Cantidad solicitada</span><input type="number" name="requestedQty" min="0.0001" step="0.0001" required></label><label><span>Costo unitario acordado</span><input type="number" name="unitCost" min="0" step="0.0001" value="0"></label><label><span>Fecha esperada</span><input type="date" name="expectedDate" value="${addDays(today(),LEAD_TIME_DAYS)}"></label><label><span>Referencia externa</span><input name="externalReference" placeholder="Cotización, correo o consecutivo"></label></div><label><span>Nota de decisión</span><textarea name="note" rows="2" placeholder="Condiciones, presentación, plazo o aclaración"></textarea></label><p class="ee-v25-note">Guardar crea un borrador. Aprobar y emitir siempre requieren acciones separadas.</p><div class="ee-v25-form-actions"><button class="ee-v25-button" type="submit">Guardar borrador</button><button class="ee-v25-secondary" type="button" id="ee-v25-reset">Limpiar</button></div></form></details>`;
  }
  function receiptForm(){
    return `<details class="ee-v25-details" id="ee-v25-receipt-details"><summary>Registrar recepción contra orden</summary><form class="ee-v25-form" id="ee-v25-receipt-form"><input type="hidden" name="orderId"><div class="ee-v25-receipt-context" id="ee-v25-receipt-context">Selecciona una orden emitida desde la tabla.</div><div class="ee-v25-form-grid"><label><span>Fecha de recepción</span><input type="date" name="receivedDate" value="${today()}" required></label><label><span>Cantidad recibida</span><input type="number" name="quantity" min="0.0001" step="0.0001" required></label><label><span>Costo total observado</span><input type="number" name="totalCost" min="0" step="1" required></label><label><span>Factura o remisión</span><input name="invoiceReference" required></label></div><label class="ee-v25-check"><input type="checkbox" name="updateStock"><span>Sumar la recepción al inventario. Solo se ejecuta cuando ya existe un conteo físico del material.</span></label><label><span>Nota de recepción</span><textarea name="note" rows="2" placeholder="Diferencias, calidad, presentación o novedad"></textarea></label><button class="ee-v25-button" type="submit">Confirmar recepción</button></form></details>`;
  }

  function render(){
    const m=metrics();
    target.innerHTML=`<section class="ee-v25-shell"><div class="ee-v25-heading"><div><p class="eyebrow">Abastecimiento y proveedores · V2.5</p><h2>Comprar con evidencia y autorización.</h2><p>Los faltantes se convierten en borradores; ninguna orden se aprueba, emite o recibe automáticamente.</p></div><span class="ee-v25-mode">${snapshot.remote?'Backend conectado':'Simulación local'}</span></div>${flash?`<div class="ee-v25-flash">${esc(flash)}</div>`:''}<div class="ee-v25-notice"><strong>Regla de control</strong><span>La comparación usa únicamente compras observadas. Los costos estándar, recetas y BOM no cambian por registrar una cotización, una orden o una factura.</span></div><div class="ee-v25-metrics"><article><small>Faltantes listos</small><strong>${m.suggestions}</strong></article><article><small>Borradores y aprobadas</small><strong>${m.drafts}</strong></article><article><small>Órdenes emitidas</small><strong>${m.issued}</strong></article><article><small>Compromiso pendiente</small><strong>${money(m.commitment)}</strong></article></div><div class="ee-v25-grid"><article class="ee-v25-panel"><div class="ee-v25-panel-head"><div><h3>Faltantes listos para decisión</h3><p>Solo aparecen materiales con conteo físico y necesidad no cubierta por órdenes abiertas.</p></div><span>${esc(selectedDate())}</span></div>${suggestionTable()}</article><article class="ee-v25-panel"><div class="ee-v25-panel-head"><div><h3>Compras en curso</h3><p>Seguimiento desde borrador hasta recepción o cancelación.</p></div></div>${activeOrdersTable()}</article></div>${orderForm()}${receiptForm()}<details class="ee-v25-details"><summary>Comparar proveedores observados</summary><div class="ee-v25-detail-body"><p class="ee-v25-note">La comparación no califica calidad ni cumplimiento sin evidencia registrada; muestra frecuencia, fechas y costos realmente observados.</p>${supplierTable()}</div></details><details class="ee-v25-details"><summary>Historial de órdenes cerradas</summary><div class="ee-v25-detail-body">${historyTable()}</div></details></section>`;
    document.documentElement.dataset.procurementVersion='2.5.0';
    bind();
  }

  function resetOrderForm(){
    const form=target.querySelector('#ee-v25-order-form');if(!form)return;
    form.reset();form.elements.id.value='';form.elements.expectedDate.value=addDays(today(),LEAD_TIME_DAYS);
  }
  function fillOrderForm(payload){
    const form=target.querySelector('#ee-v25-order-form');const details=target.querySelector('#ee-v25-order-details');if(!form||!details)return;
    form.elements.id.value=payload.id||'';
    form.elements.materialId.value=payload.materialId||DATA.materials[0]?.id||'';
    form.elements.supplier.value=payload.supplier||'';
    form.elements.requestedQty.value=payload.requestedQty||'';
    form.elements.unitCost.value=payload.unitCost||0;
    form.elements.expectedDate.value=payload.expectedDate||addDays(today(),LEAD_TIME_DAYS);
    form.elements.externalReference.value=payload.externalReference||'';
    form.elements.note.value=payload.note||'';
    details.open=true;form.elements.supplier.focus();details.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function saveOrder(payload){
    if(snapshot.remote){
      const {error}=await client().rpc('save_material_purchase_order_v25',{p_payload:{
        id:payload.id||null,material_id:payload.materialId,supplier_name:payload.supplier,
        requested_quantity:payload.requestedQty,unit_cost_snapshot:payload.unitCost,
        expected_date:payload.expectedDate||null,external_reference:payload.externalReference,note:payload.note
      }});
      if(error)throw error;
      flash=payload.id?'Borrador actualizado.':'Borrador creado. Aún no está aprobado ni emitido.';
    }else{
      const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder);
      const existing=payload.id?rows.find(row=>row.id===payload.id):null;
      if(existing&&existing.status!=='draft')throw new Error('Solo los borradores pueden editarse.');
      const now=new Date().toISOString();
      const order={
        id:existing?.id||uid('OC'),code:existing?.code||`OC-${today().replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
        materialId:payload.materialId,supplier:payload.supplier,status:'draft',requestedQty:payload.requestedQty,
        receivedQty:existing?.receivedQty||0,unitCost:payload.unitCost,expectedDate:payload.expectedDate,
        externalReference:payload.externalReference,note:payload.note,createdAt:existing?.createdAt||now,updatedAt:now
      };
      const next=existing?rows.map(row=>row.id===order.id?order:row):[order,...rows];
      write(KEYS.purchaseOrders,next);flash=existing?'Borrador actualizado.':'Borrador creado. Aún no está aprobado ni emitido.';
    }
    await load();
  }
  async function transition(orderId,newStatus){
    const order=snapshot.purchaseOrders.map(normalizePurchaseOrder).find(row=>row.id===orderId);if(!order)throw new Error('Orden no encontrada.');
    if(newStatus==='approved'&&(!order.supplier||!(order.requestedQty>0)))throw new Error('Define proveedor y cantidad antes de aprobar.');
    if(newStatus==='ordered'&&(!(order.unitCost>0)||!order.externalReference||order.status!=='approved'))throw new Error('La orden debe estar aprobada y tener costo unitario acordado con una referencia externa antes de emitirla.');
    if(snapshot.remote){
      const {error}=await client().rpc('transition_material_purchase_order_v25',{p_order_id:orderId,p_new_status:newStatus,p_note:null});if(error)throw error;
    }else{
      const allowed={draft:new Set(['approved','cancelled']),approved:new Set(['ordered','cancelled']),ordered:new Set(['cancelled']),partial:new Set(['cancelled'])};
      if(!allowed[order.status]?.has(newStatus))throw new Error(`Transición ${order.status} → ${newStatus} no permitida.`);
      const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder).map(row=>row.id===orderId?{...row,status:newStatus,updatedAt:new Date().toISOString()}:row);
      write(KEYS.purchaseOrders,rows);
    }
    flash=newStatus==='approved'?'Orden aprobada. Aún no ha sido emitida al proveedor.':newStatus==='ordered'?'Orden marcada como emitida. Queda pendiente la recepción.':'Orden cancelada sin modificar inventario.';
    await load();
  }
  function prepareReceipt(orderId){
    const order=snapshot.purchaseOrders.map(normalizePurchaseOrder).find(row=>row.id===orderId);if(!order)return;
    const form=target.querySelector('#ee-v25-receipt-form');const details=target.querySelector('#ee-v25-receipt-details');const context=target.querySelector('#ee-v25-receipt-context');
    const material=materialFor(order.materialId);const outstanding=Math.max(0,order.requestedQty-order.receivedQty);
    form.elements.orderId.value=order.id;form.elements.quantity.value=outstanding;form.elements.totalCost.value=order.unitCost>0?Math.round(outstanding*order.unitCost):'';
    context.innerHTML=`<strong>${esc(order.code)} · ${esc(material.name)}</strong><span>Proveedor ${esc(order.supplier)} · pendiente ${num(outstanding)} ${esc(material.unit)}</span>`;
    details.open=true;form.elements.invoiceReference.focus();details.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function receiveOrder(payload){
    const order=snapshot.purchaseOrders.map(normalizePurchaseOrder).find(row=>row.id===payload.orderId);if(!order)throw new Error('Selecciona una orden emitida.');
    const outstanding=Math.max(0,order.requestedQty-order.receivedQty);
    if(!['ordered','partial'].includes(order.status))throw new Error('Solo una orden emitida o parcial puede recibirse.');
    if(!(payload.quantity>0)||payload.quantity>outstanding+0.0001)throw new Error('La cantidad recibida debe ser positiva y no superar el saldo pendiente.');
    if(!payload.invoiceReference)throw new Error('La factura o remisión es obligatoria para reconciliar la recepción.');
    if(snapshot.remote){
      const {data,error}=await client().rpc('receive_material_purchase_order_v25',{p_order_id:payload.orderId,p_payload:{
        received_date:payload.receivedDate,quantity:payload.quantity,total_cost:payload.totalCost,
        invoice_reference:payload.invoiceReference,update_inventory:payload.updateStock,note:payload.note
      }});if(error)throw error;
      flash=data?.inventory_updated?'Recepción registrada, factura observada e inventario actualizado.':'Recepción registrada y factura observada. El inventario no cambió porque no existía conteo físico o no fue autorizado.';
    }else{
      const stock=read(KEYS.stock,{});const hasCount=stock[order.materialId]!==undefined&&stock[order.materialId]!==null&&stock[order.materialId]!=='';
      const inventoryUpdated=Boolean(payload.updateStock&&hasCount);
      if(inventoryUpdated){stock[order.materialId]=Number(stock[order.materialId])+payload.quantity;write(KEYS.stock,stock);}
      const purchases=read(KEYS.purchases,[]);purchases.unshift({
        id:uid('COM'),materialId:order.materialId,supplier:order.supplier,receivedDate:payload.receivedDate,
        quantity:payload.quantity,totalCost:payload.totalCost,unitCost:payload.quantity>0?payload.totalCost/payload.quantity:0,
        invoiceReference:payload.invoiceReference,note:payload.note,sourceOrderId:order.id,createdAt:new Date().toISOString(),dataStatus:'OBSERVADO'
      });write(KEYS.purchases,purchases);
      const rows=snapshot.purchaseOrders.map(normalizePurchaseOrder).map(row=>{
        if(row.id!==order.id)return row;const received=row.receivedQty+payload.quantity;
        return {...row,receivedQty:received,status:received+0.0001>=row.requestedQty?'received':'partial',updatedAt:new Date().toISOString()};
      });write(KEYS.purchaseOrders,rows);
      flash=inventoryUpdated?'Recepción registrada, factura observada e inventario actualizado.':'Recepción registrada y factura observada. El inventario no cambió porque no existía conteo físico o no fue autorizado.';
      window.dispatchEvent(new CustomEvent('ee:v23:reload'));
      window.dispatchEvent(new CustomEvent('ee:v24:reload'));
    }
    await load();
  }

  function bind(){
    target.querySelectorAll('[data-v25-create]').forEach(button=>button.addEventListener('click',()=>{
      const row=suggestions().find(item=>item.material.id===button.dataset.v25Create);if(!row)return;
      fillOrderForm({materialId:row.material.id,supplier:row.observed?.supplier||'',requestedQty:Number(row.suggested.toFixed(4)),unitCost:row.observed?.lastUnitCost??0,expectedDate:addDays(today(),LEAD_TIME_DAYS),externalReference:'',note:`Borrador originado por faltante calculado para ${selectedDate()}.`});
    }));
    target.querySelectorAll('[data-v25-edit]').forEach(button=>button.addEventListener('click',()=>{const order=snapshot.purchaseOrders.map(normalizePurchaseOrder).find(row=>row.id===button.dataset.v25Edit);if(order)fillOrderForm(order);}));
    target.querySelectorAll('[data-v25-transition]').forEach(button=>button.addEventListener('click',async()=>{
      const status=button.dataset.v25Transition;const label=STATUS_LABEL[status]||status;
      if(!confirm(`¿Confirmas cambiar esta orden a “${label}”?`))return;
      try{await transition(button.dataset.v25Order,status);}catch(error){flash=error.message||'No fue posible cambiar el estado.';render();}
    }));
    target.querySelectorAll('[data-v25-receive]').forEach(button=>button.addEventListener('click',()=>prepareReceipt(button.dataset.v25Receive)));
    target.querySelector('#ee-v25-reset')?.addEventListener('click',resetOrderForm);
    target.querySelector('#ee-v25-order-form')?.addEventListener('submit',async event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);
      const payload={id:String(fd.get('id')||''),materialId:String(fd.get('materialId')),supplier:String(fd.get('supplier')||'').trim(),requestedQty:Number(fd.get('requestedQty')),unitCost:Number(fd.get('unitCost')||0),expectedDate:String(fd.get('expectedDate')||''),externalReference:String(fd.get('externalReference')||'').trim(),note:String(fd.get('note')||'').trim()};
      try{await saveOrder(payload);}catch(error){flash=error.message||'No fue posible guardar el borrador.';render();}
    });
    target.querySelector('#ee-v25-receipt-form')?.addEventListener('submit',async event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);
      const payload={orderId:String(fd.get('orderId')||''),receivedDate:String(fd.get('receivedDate')),quantity:Number(fd.get('quantity')),totalCost:Number(fd.get('totalCost')),invoiceReference:String(fd.get('invoiceReference')||'').trim(),updateStock:fd.get('updateStock')==='on',note:String(fd.get('note')||'').trim()};
      try{await receiveOrder(payload);}catch(error){flash=error.message||'No fue posible registrar la recepción.';render();}
    });
  }

  async function loadRemote(){
    const db=client();
    const [ordersResult,itemsResult,stockResult,purchasesResult,purchaseOrdersResult]=await Promise.all([
      db.from('orders').select('id,status,requested_date').in('status',['approved','preparing']),
      db.from('order_items').select('order_id,product_id,variant_id,product_name,quantity'),
      db.from('material_inventory').select('material_id,quantity'),
      db.from('material_purchases').select('id,material_id,supplier_name_snapshot,received_date,quantity,total_cost,unit_cost,invoice_reference,created_at').order('received_date',{ascending:false}).limit(300),
      db.from('material_purchase_orders_v25').select('*').order('created_at',{ascending:false})
    ]);
    for(const result of [ordersResult,itemsResult,stockResult,purchasesResult,purchaseOrdersResult])if(result.error)throw result.error;
    const itemsByOrder=new Map();(itemsResult.data||[]).forEach(item=>{const list=itemsByOrder.get(item.order_id)||[];list.push(item);itemsByOrder.set(item.order_id,list);});
    const sourceOrders=(ordersResult.data||[]).map(order=>({...order,items:itemsByOrder.get(order.id)||[]}));
    const stock=Object.fromEntries((stockResult.data||[]).map(row=>[row.material_id,Number(row.quantity)]));
    snapshot={remote:true,sourceOrders,stock,purchases:purchasesResult.data||[],purchaseOrders:purchaseOrdersResult.data||[]};
  }
  function loadLocal(){
    snapshot={remote:false,sourceOrders:read(KEYS.sourceOrders,[]),stock:read(KEYS.stock,{}),purchases:read(KEYS.purchases,[]),purchaseOrders:read(KEYS.purchaseOrders,[])};
  }
  async function load(){
    try{if(backendReady())await loadRemote();else loadLocal();}catch(error){console.warn('No fue posible cargar abastecimiento conectado.',error);loadLocal();flash='La conexión remota no respondió; se muestra la simulación local sin mezclar datos.';}
    render();
  }

  window.addEventListener('ee:v25:reload',load);
  window.addEventListener('ee:v24:reload',load);
  window.addEventListener('ee:v23:reload',load);
  document.addEventListener('click',event=>{if(event.target.closest?.('#ee-refresh-admin'))setTimeout(load,150);});
  load();
})();
