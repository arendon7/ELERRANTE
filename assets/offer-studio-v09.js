(()=>{
  'use strict';

  const MODEL_URL='documentacion/modelo-oferta-v09.json';
  const STORAGE_KEY='ee_v09_offer_governance';
  const OVERALL_STATUSES=['pendiente','en_prueba','en_revision','aprobado_con_condiciones','aprobado','descartado'];
  const GATE_STATUSES=['pendiente','en_prueba','en_revision','aprobado_con_condiciones','aprobado','no_aplica'];
  const APPROVED=new Set(['aprobado','aprobado_base','aprobado_referencia','no_aplica']);
  const REVIEW=new Set(['en_prueba','en_revision','pendiente_validacion','provisional_demo','aprobado_con_condiciones']);
  const CRITICAL_GATES=new Set([
    'formula','costo_unitario','precio_final','margen','empaque_fisico','etiqueta',
    'sanitario','vida_util','conservacion_validada','capacidad_produccion',
    'inventario_real','cobertura_real','instrucciones_validadas'
  ]);
  const GATE_LABELS={
    concepto_y_rol:'Concepto y rol',narrativa_comercial:'Narrativa comercial',visual_editorial:'Visual editorial',
    formula:'Fórmula y proceso',costo_unitario:'Costo unitario',precio_final:'Precio final',margen:'Margen',
    empaque_fisico:'Empaque físico',etiqueta:'Etiqueta',sanitario:'Sanitario',vida_util:'Vida útil',
    conservacion_validada:'Conservación validada',fotografia_fisica:'Fotografía física',
    capacidad_produccion:'Capacidad de producción',inventario_real:'Inventario real',
    cobertura_real:'Cobertura real',instrucciones_validadas:'Instrucciones validadas'
  };
  const STATUS_LABELS={
    pendiente:'Pendiente',en_prueba:'En prueba',en_revision:'En revisión',pendiente_validacion:'Pendiente de validación',
    provisional_demo:'Provisional demo',aprobado_con_condiciones:'Aprobado con condiciones',aprobado:'Aprobado',
    aprobado_base:'Aprobado base',aprobado_referencia:'Referencia aprobada',descartado:'Descartado',no_aplica:'No aplica',
    demostracion:'Demostración',futura:'Futura'
  };
  const WAVE_LABELS={ola_1_nucleo:'Ola 1 · Núcleo',ola_2_extension:'Ola 2 · Extensión'};
  const LINE_LABELS={'harina':'Harina','crea':'Personalización','en-casa':'Pizzas En Casa','despensa':'Despensa','combo':'Combos'};

  const escapeHTML=value=>String(value??'').replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]);

  const statusLabel=status=>STATUS_LABELS[status]||String(status||'Pendiente').replaceAll('_',' ');
  const statusGroup=status=>APPROVED.has(status)?'ok':REVIEW.has(status)?'review':status==='descartado'?'off':'pending';
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value||0));

  function loadGovernance(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'?value:{};
    }catch{
      return {};
    }
  }

  function saveGovernance(state){
    const next={...state,schema:'ee-offer-governance-v09',updated_at:new Date().toISOString()};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    return next;
  }

  function productState(state,id){
    return state.products?.[id]||{};
  }

  function effectiveGate(product,state,key){
    return productState(state,product.id).gates?.[key]?.status||product.gates?.[key]||'pendiente';
  }

  function progress(product,state){
    const gates=Object.keys(product.gates||{});
    if(!gates.length) return 0;
    const score=gates.reduce((sum,key)=>{
      const status=effectiveGate(product,state,key);
      if(APPROVED.has(status)) return sum+1;
      if(REVIEW.has(status)) return sum+.45;
      return sum;
    },0);
    return Math.round((score/gates.length)*100);
  }

  function criticalPending(product,state){
    return Object.keys(product.gates||{}).filter(key=>CRITICAL_GATES.has(key)&&!APPROVED.has(effectiveGate(product,state,key)));
  }

  function summary(model,state){
    const products=model.products||[];
    const wave1=products.filter(product=>product.proposed_wave==='ola_1_nucleo');
    const approved=products.filter(product=>productState(state,product.id).overall_status==='aprobado');
    const blocked=products.filter(product=>criticalPending(product,state).length>0);
    const average=products.length?Math.round(products.reduce((sum,product)=>sum+progress(product,state),0)/products.length):0;
    return {products,wave1,approved,blocked,average};
  }

  function statusOptions(selected,allowed){
    return allowed.map(status=>`<option value="${status}" ${status===selected?'selected':''}>${escapeHTML(statusLabel(status))}</option>`).join('');
  }

  function renderStudio(model){
    const host=document.querySelector('#studio-app');
    if(!host||host.querySelector('[data-offer-studio-v09]')) return;

    let governance=loadGovernance();
    const baseSummary=summary(model,governance);
    const section=document.createElement('section');
    section.className='offer-studio-v09';
    section.dataset.offerStudioV09='true';
    section.innerHTML=`
      <section class="admin-card offer-hero">
        <div>
          <p class="eyebrow">Studio de Oferta · v0.9</p>
          <h2>De catálogo demostrativo a portafolio aprobable.</h2>
          <p>Esta vista consume la Matriz Maestra de Oferta y registra decisiones locales. No cambia la tienda, precios publicados ni inventarios reales.</p>
        </div>
        <div class="studio-actions">
          <button class="btn btn-dark offer-export" type="button">Exportar decisiones</button>
          <button class="btn btn-outline offer-reset" type="button">Restablecer decisiones</button>
        </div>
      </section>
      <div class="admin-kpis offer-kpis">
        <div class="stat-card"><small>Productos</small><div class="stat-value" data-kpi-products>${baseSummary.products.length}</div></div>
        <div class="stat-card"><small>Ola 1</small><div class="stat-value" data-kpi-wave1>${baseSummary.wave1.length}</div></div>
        <div class="stat-card"><small>Aprobados localmente</small><div class="stat-value" data-kpi-approved>${baseSummary.approved.length}</div></div>
        <div class="stat-card"><small>Avance documental</small><div class="stat-value" data-kpi-progress>${baseSummary.average}%</div></div>
      </div>
      <section class="admin-card offer-toolbar">
        <div class="form-grid">
          <div class="field"><label>Buscar</label><input type="search" data-offer-search placeholder="Producto, SKU o decisión"></div>
          <div class="field"><label>Ola</label><select data-offer-wave><option value="">Todas</option><option value="ola_1_nucleo">Ola 1 · Núcleo</option><option value="ola_2_extension">Ola 2 · Extensión</option></select></div>
          <div class="field"><label>Línea</label><select data-offer-line><option value="">Todas</option>${Object.entries(LINE_LABELS).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></div>
          <div class="field"><label>Prioridad</label><select data-offer-priority><option value="">Todas</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></div>
        </div>
      </section>
      <div class="offer-layout">
        <section class="admin-card offer-list-card">
          <div class="admin-card-head"><div><p class="eyebrow">Portafolio</p><h3>Productos y puertas</h3></div><span class="demo-badge" data-offer-count>${baseSummary.products.length} referencias</span></div>
          <div class="table-wrap"><table class="offer-products-table"><thead><tr><th>Producto</th><th>Ola</th><th>Avance</th><th>Bloqueos</th><th>Estado</th><th></th></tr></thead><tbody data-offer-rows></tbody></table></div>
        </section>
        <aside class="admin-card offer-detail" data-offer-detail aria-live="polite"></aside>
      </div>
      <section class="admin-card offer-committee">
        <p class="eyebrow">Comité de aprobación</p>
        <h3>Reglas de esta demostración</h3>
        <div class="grid grid-3" style="margin-top:18px">
          <div class="feature-card"><h4>Una decisión no borra la fuente</h4><p>Las aprobaciones locales se guardan como una capa separada y exportable.</p></div>
          <div class="feature-card"><h4>Evidencia obligatoria</h4><p>Un estado aprobado debe acompañarse de responsable, fecha y evidencia verificable.</p></div>
          <div class="feature-card"><h4>La tienda permanece intacta</h4><p>Esta vista no activa productos, precios ni stock reales.</p></div>
        </div>
      </section>`;
    host.prepend(section);

    const rows=section.querySelector('[data-offer-rows]');
    const detail=section.querySelector('[data-offer-detail]');
    const filters={
      search:section.querySelector('[data-offer-search]'),wave:section.querySelector('[data-offer-wave]'),
      line:section.querySelector('[data-offer-line]'),priority:section.querySelector('[data-offer-priority]')
    };
    let selectedId=(model.products||[])[0]?.id||'';

    function updateKPIs(){
      const data=summary(model,governance);
      section.querySelector('[data-kpi-products]').textContent=data.products.length;
      section.querySelector('[data-kpi-wave1]').textContent=data.wave1.length;
      section.querySelector('[data-kpi-approved]').textContent=data.approved.length;
      section.querySelector('[data-kpi-progress]').textContent=`${data.average}%`;
    }

    function filteredProducts(){
      const query=filters.search.value.trim().toLowerCase();
      return (model.products||[]).filter(product=>{
        const haystack=[product.name,product.id,product.next_decision,...(product.variants||[]).flatMap(variant=>[variant.sku,variant.label])].join(' ').toLowerCase();
        return (!query||haystack.includes(query))&&(!filters.wave.value||product.proposed_wave===filters.wave.value)&&(!filters.line.value||product.line===filters.line.value)&&(!filters.priority.value||product.priority===filters.priority.value);
      });
    }

    function renderRows(){
      const products=filteredProducts();
      if(!products.some(product=>product.id===selectedId)) selectedId=products[0]?.id||'';
      rows.innerHTML=products.map(product=>{
        const local=productState(governance,product.id);
        const blocking=criticalPending(product,governance).length;
        const overall=local.overall_status||'pendiente';
        return `<tr class="${product.id===selectedId?'selected':''}" data-offer-product="${escapeHTML(product.id)}">
          <td><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(LINE_LABELS[product.line]||product.line)} · ${product.cold_chain?'Cadena de frío':'Sin frío'}</small></td>
          <td><span class="status-chip review">${escapeHTML(WAVE_LABELS[product.proposed_wave]||product.proposed_wave)}</span></td>
          <td><div class="offer-progress"><span style="width:${progress(product,governance)}%"></span></div><small>${progress(product,governance)}%</small></td>
          <td><strong>${blocking}</strong><small>puertas críticas</small></td>
          <td><span class="offer-status ${statusGroup(overall)}">${escapeHTML(statusLabel(overall))}</span></td>
          <td><button class="btn btn-outline btn-small" type="button" data-open-offer="${escapeHTML(product.id)}">Abrir</button></td>
        </tr>`;
      }).join('')||'<tr><td colspan="6">No hay productos que coincidan con los filtros.</td></tr>';
      section.querySelector('[data-offer-count]').textContent=`${products.length} referencias`;
      rows.querySelectorAll('[data-open-offer]').forEach(button=>button.addEventListener('click',()=>{
        selectedId=button.dataset.openOffer;
        renderRows();
        renderDetail();
      }));
    }

    function renderDetail(){
      const product=(model.products||[]).find(item=>item.id===selectedId);
      if(!product){
        detail.innerHTML='<p class="muted">Selecciona un producto para abrir su expediente.</p>';
        return;
      }
      const local=productState(governance,product.id);
      const overall=local.overall_status||'pendiente';
      const owner=local.owner||'';
      const nextReview=local.next_review||'';
      const notes=local.notes||'';
      const gates=Object.entries(product.gates||{});
      detail.innerHTML=`
        <div class="admin-card-head"><div><p class="eyebrow">Expediente de producto</p><h3>${escapeHTML(product.name)}</h3></div><span class="offer-status ${statusGroup(overall)}">${escapeHTML(statusLabel(overall))}</span></div>
        <p>${escapeHTML(product.rationale||'')}</p>
        <dl class="offer-meta">
          <div><dt>Ola</dt><dd>${escapeHTML(WAVE_LABELS[product.proposed_wave]||product.proposed_wave)}</dd></div>
          <div><dt>Prioridad</dt><dd>${escapeHTML(product.priority)}</dd></div>
          <div><dt>Entrada</dt><dd>${escapeHTML(product.entry)}</dd></div>
          <div><dt>Avance</dt><dd>${progress(product,governance)}%</dd></div>
        </dl>
        <div class="offer-next"><strong>Siguiente decisión</strong><p>${escapeHTML(product.next_decision||'Sin decisión registrada.')}</p></div>
        <h4>Variantes demostrativas</h4>
        <div class="table-wrap"><table><thead><tr><th>Presentación</th><th>SKU</th><th>Precio demo</th><th>Stock demo</th></tr></thead><tbody>${(product.variants||[]).map(variant=>`<tr><td>${escapeHTML(variant.label)}</td><td class="mono">${escapeHTML(variant.sku)}</td><td>${money(variant.demo_price_cop)}</td><td>${escapeHTML(variant.demo_stock)}</td></tr>`).join('')}</tbody></table></div>
        <h4>Puertas de lanzamiento</h4>
        <div class="offer-gates">${gates.map(([key,baseStatus])=>{
          const override=local.gates?.[key]||{};
          const effective=override.status||baseStatus;
          return `<div class="offer-gate" data-gate="${escapeHTML(key)}">
            <div><strong>${escapeHTML(GATE_LABELS[key]||key)}</strong><small>Base: ${escapeHTML(statusLabel(baseStatus))}</small></div>
            <select class="table-input" data-gate-status>${statusOptions(effective,GATE_STATUSES)}</select>
            <input class="table-input" data-gate-evidence value="${escapeHTML(override.evidence||'')}" placeholder="Evidencia o condición">
          </div>`;
        }).join('')}</div>
        <form class="offer-governance-form">
          <h4>Decisión de comité · local</h4>
          <div class="form-grid">
            <div class="field"><label>Estado general</label><select name="overall_status">${statusOptions(overall,OVERALL_STATUSES)}</select></div>
            <div class="field"><label>Responsable</label><input name="owner" value="${escapeHTML(owner)}" placeholder="Nombre y disciplina"></div>
            <div class="field"><label>Próxima revisión</label><input name="next_review" type="date" value="${escapeHTML(nextReview)}"></div>
            <div class="field full"><label>Notas</label><textarea name="notes" placeholder="Condiciones, bloqueos y próximos pasos">${escapeHTML(notes)}</textarea></div>
          </div>
          <div class="button-row"><button class="btn btn-primary" type="submit">Guardar decisión local</button><a class="btn btn-outline" href="documentacion/productos/README.md">Abrir fichas maestras</a></div>
          <p class="offer-save-status" role="status"></p>
        </form>`;

      detail.querySelector('.offer-governance-form')?.addEventListener('submit',event=>{
        event.preventDefault();
        const formData=Object.fromEntries(new FormData(event.currentTarget).entries());
        const gatesState={};
        detail.querySelectorAll('.offer-gate').forEach(row=>{
          gatesState[row.dataset.gate]={
            status:row.querySelector('[data-gate-status]').value,
            evidence:row.querySelector('[data-gate-evidence]').value.trim(),
            updated_at:new Date().toISOString()
          };
        });
        governance.products=governance.products||{};
        governance.products[product.id]={...productState(governance,product.id),...formData,gates:gatesState,updated_at:new Date().toISOString()};
        governance=saveGovernance(governance);
        detail.querySelector('.offer-save-status').textContent='Decisión guardada únicamente en este navegador.';
        updateKPIs();
        renderRows();
        renderDetail();
      });
    }

    Object.values(filters).forEach(control=>control.addEventListener(control.tagName==='INPUT'?'input':'change',()=>{renderRows();renderDetail();}));
    section.querySelector('.offer-export')?.addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify({model_version:model.schema_version,exported_at:new Date().toISOString(),governance},null,2)],{type:'application/json'});
      const link=document.createElement('a');
      link.href=URL.createObjectURL(blob);
      link.download=`el-errante-oferta-v09-${new Date().toISOString().slice(0,10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
    section.querySelector('.offer-reset')?.addEventListener('click',()=>{
      if(!confirm('¿Eliminar todas las decisiones locales de la Matriz de Oferta?')) return;
      localStorage.removeItem(STORAGE_KEY);
      governance={};
      updateKPIs();renderRows();renderDetail();
    });

    updateKPIs();renderRows();renderDetail();
  }

  function renderControl(model){
    const host=document.querySelector('#control-center');
    if(!host||host.querySelector('[data-offer-control-v09]')) return;
    const governance=loadGovernance();
    const data=summary(model,governance);
    const wave1=data.wave1;
    const section=document.createElement('section');
    section.className='admin-card offer-control-v09';
    section.dataset.offerControlV09='true';
    section.innerHTML=`
      <div class="admin-card-head">
        <div><p class="eyebrow">Gobierno de oferta · v0.9</p><h3>Estado del núcleo de piloto.</h3></div>
        <a class="btn btn-dark btn-small" href="studio.html">Abrir Studio de Oferta</a>
      </div>
      <div class="admin-kpis offer-control-kpis">
        <div class="stat-card"><small>Ola 1</small><div class="stat-value">${wave1.length}</div></div>
        <div class="stat-card"><small>Aprobados localmente</small><div class="stat-value">${wave1.filter(product=>productState(governance,product.id).overall_status==='aprobado').length}</div></div>
        <div class="stat-card"><small>Bloqueos críticos</small><div class="stat-value">${wave1.reduce((sum,product)=>sum+criticalPending(product,governance).length,0)}</div></div>
        <div class="stat-card"><small>Avance medio</small><div class="stat-value">${wave1.length?Math.round(wave1.reduce((sum,product)=>sum+progress(product,governance),0)/wave1.length):0}%</div></div>
      </div>
      <div class="table-wrap"><table class="offer-wave-table"><thead><tr><th>Producto</th><th>Avance</th><th>Puertas críticas</th><th>Siguiente decisión</th></tr></thead><tbody>${wave1.map(product=>`<tr><td><strong>${escapeHTML(product.name)}</strong></td><td>${progress(product,governance)}%</td><td>${criticalPending(product,governance).length}</td><td>${escapeHTML(product.next_decision)}</td></tr>`).join('')}</tbody></table></div>
      <p class="data-note">Los estados mostrados pertenecen a la matriz y a decisiones locales de demostración. No representan disponibilidad, registro, precio ni inventario aprobados.</p>`;
    host.prepend(section);
  }

  async function loadModel(){
    const response=await fetch(MODEL_URL,{cache:'no-store'});
    if(!response.ok) throw new Error(`No fue posible cargar la matriz (${response.status}).`);
    const model=await response.json();
    if(!Array.isArray(model.products)||model.products.length!==11) throw new Error('La matriz no contiene las 11 referencias esperadas.');
    return model;
  }

  async function init(){
    if(!document.querySelector('#studio-app,#control-center')) return;
    try{
      const model=await loadModel();
      window.EE_OFFER_STUDIO_V09={ready:true,source:MODEL_URL,products:model.products.length,schema:model.schema_version};
      renderStudio(model);
      renderControl(model);
    }catch(error){
      window.EE_OFFER_STUDIO_V09={ready:false,error:error.message};
      const host=document.querySelector('#studio-app,#control-center');
      if(host&&!host.querySelector('[data-offer-error]')){
        const note=document.createElement('div');
        note.className='data-note';note.dataset.offerError='true';
        note.textContent=`Studio de Oferta no disponible: ${error.message}`;
        host.prepend(note);
      }
      console.error(error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
  else setTimeout(init,0);
})();
