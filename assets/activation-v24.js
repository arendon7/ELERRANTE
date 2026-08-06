(()=>{
  'use strict';
  const root=document.querySelector('#activation-v20');
  const CONFIG=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const RUNTIME=window.EL_ERRANTE_RUNTIME_CONFIG||{};
  if(!root||document.body?.dataset.page!=='activacion')return;

  function patchText(){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      const value=node.nodeValue||'';
      if(value.includes('V2.0, V2.1, V2.2 y V2.3'))node.nodeValue=value.replace('V2.0, V2.1, V2.2 y V2.3','V2.0, V2.1, V2.2, V2.3 y V2.4');
      else if(value.includes('Activación V2.3'))node.nodeValue=value.replaceAll('Activación V2.3','Activación V2.4');
      else if(value.includes('continuidad · V2.3'))node.nodeValue=value.replaceAll('continuidad · V2.3','continuidad · V2.4');
    }
    document.documentElement.dataset.activationVersion='2.4.0';
  }

  function patchPreviewSteps(){
    const steps=[...root.querySelectorAll('.ee-v20-step p')];
    const migrations=steps.find(node=>node.textContent.includes('esquemas V1.4'));
    if(migrations&&!migrations.textContent.includes('V2.4'))migrations.textContent=migrations.textContent.replace(/V2\.3\.?$/,'V2.3 y V2.4.');
  }

  async function checkConnectedMigration(){
    if(!(CONFIG.backend?.url&&CONFIG.backend?.publishableKey&&RUNTIME.environment==='connected'))return;
    if(root.querySelector('[data-v24-migration-check]'))return;
    try{
      const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const client=module.createClient(CONFIG.backend.url,CONFIG.backend.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:CONFIG.backend.adminStorageKey||'ee-admin-auth-v15'}});
      const session=await client.auth.getSession();if(!session.data?.session)return;
      const result=await client.from('schema_migrations').select('version').eq('version','2.4').maybeSingle();
      const ready=!result.error&&Boolean(result.data);const list=root.querySelector('.ee-v20-checklist');if(!list)return;
      const item=document.createElement('li');item.dataset.ready=ready?'true':'false';item.dataset.v24MigrationCheck='true';
      item.innerHTML=`<span class="ee-v20-check">${ready?'✓':'!'}</span><div><strong>Medición y compras V2.4</strong><small>${ready?'Migración 2.4 registrada.':'Ejecuta schema-v24.sql después de schema-v23.sql.'}</small></div>`;
      list.prepend(item);
    }catch(error){console.warn('No fue posible verificar schema-v24.',error);}
  }

  const refresh=()=>{patchText();patchPreviewSteps();checkConnectedMigration();};
  new MutationObserver(refresh).observe(root,{childList:true,subtree:true,characterData:true});refresh();
})();
