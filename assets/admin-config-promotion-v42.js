(()=>{
  'use strict';

  const VERSION='4.2.0';
  const SETTINGS_KEY='ee_v14_settings';
  const ROOT_ID='admin-dynamic';
  const GROUPS=Object.freeze({
    payment:Object.freeze(['bank','accountType','accountNumber','key','accountHolder','instructions']),
    ordering:Object.freeze(['deliveryPolicy','deliveryFeePolicy','coverageDetails','supportWhatsapp','supportEmail','expectedResponseHours','requireReceipt','maxReceiptBytesPreview'])
  });
  const LABELS=Object.freeze({payment:'Pago / transferencias',ordering:'Pedidos / canales públicos'});
  const FIELD_LABELS=Object.freeze({
    bank:'Banco',accountType:'Tipo de cuenta',accountNumber:'Número de cuenta',key:'Llave',accountHolder:'Titular',instructions:'Instrucciones',
    deliveryPolicy:'Política de entrega',deliveryFeePolicy:'Política de tarifa',coverageDetails:'Cobertura',supportWhatsapp:'WhatsApp público',supportEmail:'Correo público',expectedResponseHours:'Horas de respuesta',requireReceipt:'Exigir comprobante',maxReceiptBytesPreview:'Máximo de comprobante en preview'
  });

  const isRecord=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt',"'":'&#39;','"':'&quot;'}[char]));
  const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

  function readLocalRoot(){
    try{
      const parsed=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
      return isRecord(parsed)?parsed:{};
    }catch(_){return {};}
  }

  function allowedView(raw,group){
    const source=isRecord(raw)?raw:{};
    const allowed={};
    GROUPS[group].forEach(field=>{if(hasOwn(source,field))allowed[field]=clone(source[field]);});
    return allowed;
  }

  function unknownFields(raw,group){
    if(!isRecord(raw))return [];
    const allowed=new Set(GROUPS[group]);
    return Object.keys(raw).filter(key=>!allowed.has(key)).sort();
  }

  function canonical(value){
    if(Array.isArray(value))return value.map(canonical);
    if(isRecord(value))return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
    return value;
  }

  const fingerprint=value=>JSON.stringify(canonical(value));
  const same=(a,b)=>fingerprint(a)===fingerprint(b);

  function modeOf(root){
    const label=root.querySelector('.ee-v15-sessionbar strong')?.textContent||'';
    if(/Administración conectada/i.test(label))return 'remote';
    if(/Simulación local/i.test(label))return 'local';
    return '';
  }

  function client(){
    const value=window.__EE_ADMIN_SUPABASE__||null;
    if(!value)throw new Error('El cliente administrativo conectado no está disponible.');
    return value;
  }

  async function assertConnected(){
    const guard=window.EL_ERRANTE_ADMIN_CONNECTIVITY;
    if(!guard?.assertConnected)throw new Error('No está disponible el guard de conectividad administrativa V4.2.');
    await guard.assertConnected();
    if(guard.state!=='CONNECTED')throw new Error('La administración remota no está en estado CONNECTED.');
    return true;
  }

  async function readRemoteGroup(db,group){
    const result=await db.from('public_settings').select('key,value,updated_at').eq('key',group).maybeSingle();
    if(result.error)throw result.error;
    const row=result.data||null;
    return {exists:Boolean(row),raw:isRecord(row?.value)?clone(row.value):{},updatedAt:row?.updated_at||''};
  }

  function snapshotRemote(remote){return fingerprint({exists:Boolean(remote?.exists),raw:isRecord(remote?.raw)?remote.raw:{}});}

  function groupModel(localRoot,group,remote){
    const localRaw=isRecord(localRoot[group])?clone(localRoot[group]):{};
    const localExists=isRecord(localRoot[group]);
    const localAllowed=allowedView(localRaw,group);
    const remoteAllowed=allowedView(remote.raw,group);
    let status='SIN DATOS';
    if(localExists&&remote.exists)status=same(localAllowed,remoteAllowed)?'IGUAL':'DIFERENTE';
    else if(localExists)status='SÓLO LOCAL';
    else if(remote.exists)status='SÓLO REMOTO';
    const fields=GROUPS[group].map(field=>({
      field,
      localPresent:hasOwn(localAllowed,field),
      remotePresent:hasOwn(remoteAllowed,field),
      local:localAllowed[field],
      remote:remoteAllowed[field],
      different:!same(localAllowed[field],remoteAllowed[field])||hasOwn(localAllowed,field)!==hasOwn(remoteAllowed,field)
    }));
    return {group,status,localExists,remoteExists:remote.exists,localRaw,localAllowed,remoteAllowed,unknown:unknownFields(localRaw,group),fields};
  }

  function printable(value,present){
    if(!present)return '—';
    if(value===true)return 'Sí';
    if(value===false)return 'No';
    if(value===null)return 'null';
    if(isRecord(value)||Array.isArray(value))return fingerprint(value);
    const text=String(value);
    return text===''?'(vacío)':text;
  }

  function statusClass(status){
    if(status==='IGUAL')return 'ok';
    if(status==='DIFERENTE'||status==='CONFLICT')return 'warning';
    return 'neutral';
  }

  function groupMarkup(model){
    const rows=model.fields.map(item=>{
      const selectable=item.localPresent&&item.different;
      return `<tr data-promotion-field-row="${escapeHtml(model.group)}:${escapeHtml(item.field)}">
        <td>${selectable?`<input type="checkbox" aria-label="Promover ${escapeHtml(FIELD_LABELS[item.field]||item.field)}" data-promote-field="${escapeHtml(model.group)}:${escapeHtml(item.field)}">`:''}</td>
        <td><strong>${escapeHtml(FIELD_LABELS[item.field]||item.field)}</strong><br><small>${escapeHtml(item.field)}</small></td>
        <td>${escapeHtml(printable(item.local,item.localPresent))}</td>
        <td>${escapeHtml(printable(item.remote,item.remotePresent))}</td>
        <td>${item.different?'Diferente':'Igual'}</td>
      </tr>`;
    }).join('');
    const unknown=model.unknown.length
      ? `<p class="ee-v14-help" data-unknown-local-fields><strong>No promovibles:</strong> ${model.unknown.map(escapeHtml).join(', ')}. Se ignoran hasta incorporarlos deliberadamente a la allowlist.</p>`
      : '<p class="ee-v14-help" data-unknown-local-fields>Sin campos locales fuera de la allowlist.</p>';
    const promotable=model.fields.some(item=>item.localPresent&&item.different);
    return `<section class="ee-v14-card" data-promotion-group="${escapeHtml(model.group)}">
      <p class="eyebrow">${escapeHtml(LABELS[model.group])}</p>
      <h3 style="margin:0 0 8px">Comparación local ↔ remota</h3>
      <p class="ee-v14-help">Local: <strong>${model.localExists?'sí':'no'}</strong> · Remoto: <strong>${model.remoteExists?'sí':'no'}</strong> · Estado: <strong data-promotion-status data-state="${escapeHtml(model.status)}" data-type="${statusClass(model.status)}">${escapeHtml(model.status)}</strong></p>
      <div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Promover</th><th>Campo</th><th>Local</th><th>Remoto</th><th>Comparación</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${unknown}
      <div class="ee-v14-actions" style="margin-top:14px">
        <button type="button" class="ee-v14-btn secondary" data-keep-remote="${escapeHtml(model.group)}">Conservar remoto</button>
        <button type="button" class="ee-v14-btn terracotta" data-promote-group="${escapeHtml(model.group)}" ${promotable?'':'disabled'}>Promover selección local</button>
      </div>
      <p class="ee-v14-help" data-promotion-result aria-live="polite" style="margin-top:10px"></p>
    </section>`;
  }

  function shellMarkup(){
    return `<section class="ee-v14-card" data-config-promotion-v42 data-version="${VERSION}">
      <p class="eyebrow">V4.2 · promoción explícita</p>
      <h2>Comparar configuración local y remota</h2>
      <p class="ee-v14-help">Nada se sincroniza automáticamente. Selecciona únicamente campos locales revisados. Antes de escribir se revalida la sesión y se confirma que el remoto no haya cambiado.</p>
      <div data-promotion-groups class="ee-v14-grid" style="margin-top:14px"></div>
    </section>`;
  }

  function setGroupResult(root,group,text,type='ok',state=''){
    const section=root?.querySelector(`[data-promotion-group="${CSS.escape(group)}"]`);
    const result=section?.querySelector('[data-promotion-result]');
    if(result){result.textContent=text;result.dataset.type=type;}
    if(state){
      const badge=section?.querySelector('[data-promotion-status]');
      if(badge){badge.textContent=state;badge.dataset.state=state;badge.dataset.type=statusClass(state);}
    }
  }

  function replaceGroup(root,group,remote){
    const current=root.querySelector(`[data-promotion-group="${CSS.escape(group)}"]`);
    if(!current)return null;
    const holder=document.createElement('div');
    holder.innerHTML=groupMarkup(groupModel(localSnapshot,group,remote)).trim();
    current.replaceWith(holder.firstElementChild);
    return root.querySelector(`[data-promotion-group="${CSS.escape(group)}"]`);
  }

  let busy=false;
  let currentRoot=null;
  let currentDb=null;
  let localSnapshot={};
  let remoteSnapshots={};
  let remoteState={};

  async function load(root){
    if(busy)return;
    busy=true;
    try{
      await assertConnected();
      const db=client();
      const localRoot=readLocalRoot();
      const [payment,ordering]=await Promise.all([readRemoteGroup(db,'payment'),readRemoteGroup(db,'ordering')]);
      currentRoot=root;
      currentDb=db;
      localSnapshot=clone(localRoot);
      remoteState={payment,ordering};
      remoteSnapshots={payment:snapshotRemote(payment),ordering:snapshotRemote(ordering)};

      const grid=root.querySelector('.ee-v14-grid');
      if(!grid)return;
      grid.querySelector('[data-config-promotion-v42]')?.remove();
      const holder=document.createElement('div');
      holder.innerHTML=shellMarkup().trim();
      const shell=holder.firstElementChild;
      const groups=shell.querySelector('[data-promotion-groups]');
      groups.innerHTML=['ordering','payment'].map(group=>groupMarkup(groupModel(localSnapshot,group,remoteState[group]))).join('');
      grid.append(shell);
    }catch(error){
      const grid=root.querySelector('.ee-v14-grid');
      if(grid&&!grid.querySelector('[data-config-promotion-v42]')){
        const section=document.createElement('section');
        section.className='ee-v14-card';
        section.dataset.configPromotionV42='blocked';
        section.innerHTML='<p class="eyebrow">V4.2 · promoción explícita</p><h2>Asistente bloqueado</h2><p class="ee-v14-help" data-promotion-load-error></p>';
        section.querySelector('[data-promotion-load-error]').textContent=error?.message||'No fue posible validar la configuración remota.';
        grid.append(section);
      }
    }finally{busy=false;}
  }

  async function promote(group){
    const root=currentRoot;
    const db=currentDb;
    if(!root||!db)return;
    const section=root.querySelector(`[data-promotion-group="${CSS.escape(group)}"]`);
    if(!section)return;
    const selected=[...section.querySelectorAll(`[data-promote-field^="${CSS.escape(group)}:"]:checked`)].map(input=>input.dataset.promoteField.split(':').slice(1).join(':'));
    if(!selected.length){setGroupResult(root,group,'Selecciona al menos un campo local diferente.','error');return;}
    const localAllowed=allowedView(localSnapshot[group],group);
    const approved=selected.filter(field=>GROUPS[group].includes(field)&&hasOwn(localAllowed,field));
    if(!approved.length){setGroupResult(root,group,'La selección no contiene campos permitidos.','error');return;}
    if(!window.confirm(`Promover ${approved.length} campo(s) locales de ${LABELS[group]} al remoto?`))return;

    const button=section.querySelector(`[data-promote-group="${CSS.escape(group)}"]`);
    if(button)button.disabled=true;
    try{
      await assertConnected();
      const beforeWrite=await readRemoteGroup(db,group);
      if(snapshotRemote(beforeWrite)!==remoteSnapshots[group]){
        remoteState[group]=beforeWrite;
        remoteSnapshots[group]=snapshotRemote(beforeWrite);
        replaceGroup(root,group,beforeWrite);
        setGroupResult(root,group,'CONFLICT: el remoto cambió desde la lectura inicial. Los valores visibles fueron actualizados; revisa y selecciona nuevamente.','error','CONFLICT');
        return;
      }

      const nextRaw=clone(beforeWrite.raw)||{};
      approved.forEach(field=>{nextRaw[field]=clone(localAllowed[field]);});
      const result=await db.from('public_settings').upsert({key:group,value:nextRaw,updated_at:new Date().toISOString()},{onConflict:'key'});
      if(result.error)throw result.error;

      const confirmed=await readRemoteGroup(db,group);
      if(!confirmed.exists||!same(confirmed.raw,nextRaw))throw new Error('El remoto respondió, pero la relectura no confirmó exactamente la configuración promovida.');
      remoteState[group]=confirmed;
      remoteSnapshots[group]=snapshotRemote(confirmed);
      replaceGroup(root,group,confirmed);
      setGroupResult(root,group,'Promoción confirmada por relectura remota. La copia local permanece intacta.','ok');
    }catch(error){
      setGroupResult(root,group,error?.message||'No fue posible promover la selección.','error');
    }finally{
      const active=root.querySelector(`[data-promotion-group="${CSS.escape(group)}"] [data-promote-group="${CSS.escape(group)}"]`);
      if(active)active.disabled=false;
    }
  }

  function bind(){
    document.addEventListener('click',event=>{
      const target=event.target instanceof Element?event.target:null;
      const promoteButton=target?.closest('[data-promote-group]');
      if(promoteButton){event.preventDefault();promote(promoteButton.dataset.promoteGroup).catch(()=>{});return;}
      const keepButton=target?.closest('[data-keep-remote]');
      if(keepButton){
        event.preventDefault();
        const group=keepButton.dataset.keepRemote;
        setGroupResult(currentRoot,group,'Se conserva el remoto. No se realizó ninguna escritura.','ok');
      }
    });
  }

  async function sync(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    const mode=modeOf(root);
    if(mode!=='remote'){
      root.querySelector('[data-config-promotion-v42]')?.remove();
      root.querySelector('[data-config-promotion-v42="blocked"]')?.remove();
      currentRoot=null;currentDb=null;
      return;
    }
    if(root.querySelector('[data-config-promotion-v42]')||root.querySelector('[data-config-promotion-v42="blocked"]'))return;
    await load(root);
  }

  function init(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    bind();
    new MutationObserver(()=>{sync().catch(()=>{});}).observe(root,{childList:true,subtree:true,characterData:true});
    window.addEventListener('ee:admin-connectivity',event=>{
      if(event.detail?.state==='CONNECTED'&&modeOf(root)==='remote'&&!root.querySelector('[data-config-promotion-v42]'))sync().catch(()=>{});
    });
    sync().catch(()=>{});
    document.documentElement.dataset.configPromotionVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
