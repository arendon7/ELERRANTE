(()=>{
  'use strict';

  const CONFIG=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const RUNTIME=window.EL_ERRANTE_RUNTIME_CONFIG||{};
  const root=document.querySelector('#activation-v20');
  if(!root||document.body?.dataset.page!=='activacion')return;

  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const connected=Boolean(CONFIG.backend?.url&&CONFIG.backend?.publishableKey&&RUNTIME.environment==='connected');
  let client=null;

  const state=(title,copy,status='warn')=>`<div class="ee-v20-state" data-state="${status}"><span class="ee-v20-dot" aria-hidden="true"></span><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></div></div>`;
  const checklistItem=(ready,title,copy)=>`<li data-ready="${ready?'true':'false'}"><span class="ee-v20-check">${ready?'✓':'!'}</span><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(copy)}</small></div></li>`;
  const copyButton=(label,target)=>`<button class="btn btn-outline btn-small" type="button" data-copy-target="${escapeHtml(target)}">${escapeHtml(label)}</button>`;

  async function copyText(value,button){
    try{
      await navigator.clipboard.writeText(value);
      const original=button.textContent;
      button.textContent='Copiado';
      setTimeout(()=>button.textContent=original,1500);
    }catch(_){
      button.textContent='Copia manualmente';
    }
  }

  function bindCopy(scope=root){
    scope.querySelectorAll('[data-copy-target]').forEach(button=>{
      if(button.dataset.bound)return;
      button.dataset.bound='true';
      button.addEventListener('click',()=>copyText(button.dataset.copyTarget,button));
    });
  }

  function renderPreview(){
    root.innerHTML=`<div class="ee-v20-shell"><section class="ee-v20-hero"><div class="ee-v20-card"><p class="eyebrow">Estado actual</p><h2>La web sigue en modo previo.</h2><p>GitHub Pages está publicando la experiencia completa, pero todavía no recibió la URL y la clave publicable del proyecto Supabase. Los pedidos continúan guardándose únicamente en el navegador donde se crean.</p>${state('Supabase aún no está conectado','No se enviarán pedidos ni comprobantes a una base central hasta completar la activación.','warn')}<div class="ee-v20-warning" style="margin-top:16px"><strong>Protección activa</strong><p>La web no simula una conexión ni muestra datos bancarios o canales de soporte que no hayan sido configurados.</p></div></div><div class="ee-v20-card"><p class="eyebrow">Lectura de Pages</p><h3>Configuración publicada</h3><ul class="ee-v20-checklist">${checklistItem(RUNTIME.environment==='preview','Entorno declarado','preview')}${checklistItem(!CONFIG.backend?.url,'URL remota ausente','Se requiere SUPABASE_URL en GitHub Actions.')}${checklistItem(!CONFIG.backend?.publishableKey,'Clave publicable ausente','Se requiere SUPABASE_PUBLISHABLE_KEY como secreto de Actions.')}${checklistItem(true,'Credenciales privadas fuera del sitio','La activación no solicita ni almacena claves privadas del servidor.')}</ul></div></section><section class="ee-v20-card"><p class="eyebrow">Ruta controlada</p><h2>Activa la operación en este orden.</h2><div class="ee-v20-steps"><div class="ee-v20-step"><div><strong>Crear el proyecto Supabase</strong><p>Utiliza un proyecto dedicado a El Errante y conserva sus accesos en la cuenta empresarial responsable.</p></div></div><div class="ee-v20-step"><div><strong>Ejecutar las migraciones</strong><p>En el SQL Editor ejecuta, en orden, los esquemas V1.4, V1.5, V1.6, V1.9, V2.0, V2.1 y V2.2.</p></div></div><div class="ee-v20-step"><div><strong>Crear el usuario de Juan</strong><p>Desde Authentication crea el usuario administrativo y confirma su correo antes de asignarle el rol.</p></div></div><div class="ee-v20-step"><div><strong>Configurar GitHub Actions</strong><p>Agrega la URL como variable y la clave publicable como secreto. Pages generará automáticamente el archivo de conexión.</p></div></div></div><div class="ee-v20-grid"><div><h3>Variable de repositorio</h3><div class="ee-v20-code">SUPABASE_URL</div>${copyButton('Copiar nombre','SUPABASE_URL')}</div><div><h3>Secreto de Actions</h3><div class="ee-v20-code">SUPABASE_PUBLISHABLE_KEY</div>${copyButton('Copiar nombre','SUPABASE_PUBLISHABLE_KEY')}</div></div><p class="ee-v20-muted" style="margin-top:16px">Después de guardar ambos valores, una nueva publicación de main cambiará automáticamente el entorno a conectado.</p></section></div>`;
    bindCopy();
    document.documentElement.dataset.activationVersion='2.2.0';
  }

  async function getClient(){
    if(client)return client;
    const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=module.createClient(CONFIG.backend.url,CONFIG.backend.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:CONFIG.backend.adminStorageKey||'ee-admin-auth-v15'}
    });
    return client;
  }

  function renderLogin(message=''){
    root.innerHTML=`<div class="ee-v20-shell"><section class="ee-v20-hero"><div class="ee-v20-card"><p class="eyebrow">Conexión detectada</p><h2>Supabase está conectado.</h2>${state('Entorno conectado','La URL y la clave publicable fueron incorporadas por GitHub Pages.','ok')}<p style="margin-top:16px">Inicia sesión con el usuario administrativo creado en Supabase para comprobar migraciones, roles y datos mínimos.</p></div><div class="ee-v20-card"><p class="eyebrow">Acceso privado</p><h3>Ingresar al diagnóstico</h3><form id="ee-v20-login" class="ee-v20-form"><div class="ee-v14-field"><label for="ee-v20-email">Correo</label><input id="ee-v20-email" name="email" type="email" required autocomplete="username"></div><div class="ee-v14-field"><label for="ee-v20-password">Contraseña</label><input id="ee-v20-password" name="password" type="password" required autocomplete="current-password"></div><button class="btn btn-primary" type="submit">Comprobar activación</button></form><div id="ee-v20-login-message" class="ee-v20-message" data-type="${message?'error':''}">${escapeHtml(message)}</div></div></section></div>`;
    root.querySelector('#ee-v20-login').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const button=form.querySelector('button');
      const messageBox=root.querySelector('#ee-v20-login-message');
      const data=new FormData(form);
      button.disabled=true;button.textContent='Verificando…';messageBox.textContent='';
      try{
        const supabase=await getClient();
        const result=await supabase.auth.signInWithPassword({email:String(data.get('email')).trim(),password:String(data.get('password'))});
        if(result.error)throw result.error;
        await renderConnected();
      }catch(error){
        console.error(error);
        messageBox.textContent='No fue posible iniciar sesión. Revisa el usuario, la contraseña y la confirmación del correo.';
        messageBox.dataset.type='error';
      }finally{button.disabled=false;button.textContent='Comprobar activación';}
    });
  }

  function firstAdminCommand(user){
    return `select public.register_first_admin_v20('${String(user.id).replace(/'/g,'')}','Juan');`;
  }

  async function renderPendingRole(supabase,user){
    const command=firstAdminCommand(user);
    root.innerHTML=`<div class="ee-v20-shell"><section class="ee-v20-hero"><div class="ee-v20-card"><p class="eyebrow">Usuario autenticado</p><h2>La cuenta existe, pero aún no tiene rol administrativo.</h2>${state('Acceso pendiente','La sesión es válida, pero is_admin() no autorizó el panel.','warn')}<p style="margin-top:16px">UUID de esta cuenta:</p><div class="ee-v20-code">${escapeHtml(user.id)}</div></div><div class="ee-v20-card"><p class="eyebrow">Primer administrador</p><h3>Alta controlada desde SQL Editor</h3><p>Este comando solo funciona cuando todavía no existe otro administrador activo. Ejecútalo dentro del proyecto Supabase, nunca desde el navegador público.</p><div class="ee-v20-code">${escapeHtml(command)}</div><div class="ee-v20-actions">${copyButton('Copiar comando',command)}<button class="btn btn-outline btn-small" type="button" id="ee-v20-signout">Cerrar sesión</button></div><p class="ee-v20-muted">Cuando ya exista un administrador, el acceso adicional debe concederse desde esta misma pantalla por un administrador autorizado.</p></div></section></div>`;
    bindCopy();
    root.querySelector('#ee-v20-signout').addEventListener('click',async()=>{await supabase.auth.signOut();renderLogin();});
  }

  function healthChecklist(health){
    const migrations=Array.isArray(health?.migrations)?health.migrations:[];
    return [
      checklistItem(health?.schema_version==='2.2','Esquema V2.2','El diagnóstico confirma la agenda de producción y el despacho seguro V2.2.'),
      checklistItem(['1.4','1.5','1.6','1.9','2.0','2.1','2.2'].every(value=>migrations.includes(value)),'Migraciones completas',`Registradas: ${migrations.join(', ')||'ninguna'}`),
      checklistItem(Number(health?.admin_count)>0,'Administrador activo',`${Number(health?.admin_count)||0} cuenta(s) con acceso.`),
      checklistItem(Boolean(health?.receipt_bucket_private),'Comprobantes privados','El bucket de comprobantes permanece privado.'),
      checklistItem(Boolean(health?.payment_configured),'Datos de transferencia','Cuenta o llave configurada para el checkout.'),
      checklistItem(Boolean(health?.coverage_configured),'Cobertura comercial','La política logística está configurada.'),
      checklistItem(Boolean(health?.support_configured),'Canal de soporte','WhatsApp o correo disponible para compradores.'),
      checklistItem(Boolean(health?.catalog_ready),'Catálogo operativo',`${Number(health?.catalog_rows)||0} producto(s) en la tabla operativa.`),
      checklistItem(Boolean(health?.fixed_costs_ready),'Gastos fijos del mes',money(health?.fixed_costs_total)),
      checklistItem(Boolean(health?.fulfillment_table_ready),'Agenda de producción y despacho',`${Number(health?.fulfillment_rows)||0} pedido(s) con control de alistamiento.`)
    ].join('');
  }

  async function renderDashboard(supabase,user,health){
    const adminsResult=await supabase.from('admin_users').select('user_id,display_name,active,created_at').order('created_at',{ascending:true});
    const admins=adminsResult.error?[]:adminsResult.data||[];
    const adminRows=admins.map(item=>`<div class="ee-v20-admin"><div><strong>${escapeHtml(item.display_name)}</strong><small>${escapeHtml(item.user_id)}</small></div><span class="ee-v20-badge" data-active="${item.active?'true':'false'}">${item.active?'Activo':'Inactivo'}</span></div>`).join('')||'<p class="ee-v20-muted">No fue posible listar los administradores.</p>';
    root.innerHTML=`<div class="ee-v20-shell"><section class="ee-v20-hero"><div class="ee-v20-card"><p class="eyebrow">Diagnóstico conectado</p><h2>Estado de activación operativa.</h2>${state('Sesión administrativa autorizada',user.email||'Usuario autorizado','ok')}<ul class="ee-v20-checklist">${healthChecklist(health)}</ul></div><div class="ee-v20-card"><p class="eyebrow">Lectura actual</p><h3>Operación central</h3><p><strong>Pedidos registrados:</strong> ${Number(health?.orders_count)||0}</p><p><strong>Gastos fijos del mes:</strong> ${money(health?.fixed_costs_total)}</p><p><strong>Catálogo operativo:</strong> ${Number(health?.catalog_rows)||0} filas</p><div class="ee-v20-actions"><a class="btn btn-primary btn-small" href="admin.html">Abrir Administración</a><button class="btn btn-outline btn-small" type="button" id="ee-v20-refresh">Repetir diagnóstico</button><button class="btn btn-outline btn-small" type="button" id="ee-v20-signout">Cerrar sesión</button></div></div></section><section class="ee-v20-grid"><div class="ee-v20-card"><p class="eyebrow">Gobierno de acceso</p><h2>Administradores registrados</h2><div class="ee-v20-admins">${adminRows}</div></div><div class="ee-v20-card"><p class="eyebrow">Alta o actualización</p><h2>Gestionar administrador</h2><p class="ee-v20-muted">El usuario debe existir previamente en Authentication. Esta acción queda registrada en la auditoría administrativa.</p><form id="ee-v20-admin-form" class="ee-v20-form"><div class="ee-v14-field"><label for="ee-v20-admin-email">Correo del usuario</label><input id="ee-v20-admin-email" name="email" type="email" required></div><div class="ee-v14-field"><label for="ee-v20-admin-name">Nombre visible</label><input id="ee-v20-admin-name" name="displayName" required></div><div class="ee-v14-field"><label for="ee-v20-admin-active">Estado</label><select id="ee-v20-admin-active" name="active"><option value="true">Activo</option><option value="false">Inactivo</option></select></div><button class="btn btn-primary" type="submit">Guardar acceso</button></form><div id="ee-v20-admin-message" class="ee-v20-message"></div></div></section></div>`;
    root.querySelector('#ee-v20-refresh').addEventListener('click',()=>renderConnected());
    root.querySelector('#ee-v20-signout').addEventListener('click',async()=>{await supabase.auth.signOut();renderLogin();});
    root.querySelector('#ee-v20-admin-form').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const button=form.querySelector('button');
      const message=root.querySelector('#ee-v20-admin-message');
      const data=new FormData(form);
      button.disabled=true;button.textContent='Guardando…';message.textContent='';
      try{
        const response=await supabase.rpc('set_admin_user_v20',{
          p_email:String(data.get('email')).trim(),
          p_display_name:String(data.get('displayName')).trim(),
          p_active:String(data.get('active'))==='true'
        });
        if(response.error)throw response.error;
        message.textContent='Acceso administrativo actualizado.';message.dataset.type='ok';
        setTimeout(()=>renderConnected(),700);
      }catch(error){
        console.error(error);
        message.textContent=error?.message||'No fue posible actualizar el acceso.';message.dataset.type='error';
      }finally{button.disabled=false;button.textContent='Guardar acceso';}
    });
  }

  async function renderConnected(){
    try{
      const supabase=await getClient();
      const sessionResult=await supabase.auth.getSession();
      const user=sessionResult.data?.session?.user;
      if(!user){renderLogin();return;}
      const role=await supabase.rpc('is_admin');
      if(role.error)throw role.error;
      if(role.data!==true){await renderPendingRole(supabase,user);return;}
      const healthResult=await supabase.rpc('activation_health_v20');
      if(healthResult.error){
        root.innerHTML=`<div class="ee-v20-card"><p class="eyebrow">Migración pendiente</p><h2>La conexión funciona, pero V2.0 aún no responde.</h2>${state('Ejecuta schema-v20.sql','El usuario está autorizado, pero falta instalar la función de diagnóstico V2.0.','warn')}<div class="ee-v20-actions"><button class="btn btn-outline" id="ee-v20-retry">Reintentar</button></div></div>`;
        root.querySelector('#ee-v20-retry').addEventListener('click',()=>renderConnected());
        return;
      }
      await renderDashboard(supabase,user,healthResult.data||{});
    }catch(error){
      console.error(error);
      renderLogin('La conexión existe, pero el diagnóstico no pudo completarse. Revisa las migraciones y las políticas de acceso.');
    }
    document.documentElement.dataset.activationVersion='2.2.0';
  }

  connected?renderConnected():renderPreview();
})();