(()=>{
  'use strict';
  const root=document.querySelector('#activation-v20');
  const CONFIG=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const RUNTIME=window.EL_ERRANTE_RUNTIME_CONFIG||{};
  if(!root||document.body?.dataset.page!=='activacion')return;

  function patchText(){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(node.nodeValue?.includes('V2.2'))node.nodeValue=node.nodeValue.replaceAll('V2.2','V2.3');
      if(node.nodeValue?.includes('V2.0, V2.1 y V2.2'))node.nodeValue=node.nodeValue.replace('V2.0, V2.1 y V2.2','V2.0, V2.1, V2.2 y V2.3');
    }
    document.documentElement.dataset.activationVersion='2.3.0';
  }

  function addPreviewRequirement(){
    const steps=[...root.querySelectorAll('.ee-v20-step p')];
    const migrations=steps.find(node=>node.textContent.includes('esquemas V1.4'));
    if(migrations&&!migrations.textContent.includes('V2.3'))migrations.textContent=migrations.textContent.replace(/V2\.2\.?$/,'V2.2 y V2.3.');
  }

  async function checkConnectedMigration(){
    if(!(CONFIG.backend?.url&&CONFIG.backend?.publishableKey&&RUNTIME.environment==='connected'))return;
    if(root.querySelector('[data-v23-migration-check]'))return;
    try{
      const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const client=module.createClient(CONFIG.backend.url,CONFIG.backend.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:CONFIG.backend.adminStorageKey||'ee-admin-auth-v15'}});
      const session=await client.auth.getSession();
      if(!session.data?.session)return;
      const result=await client.from('schema_migrations').select('version').eq('version','2.3').maybeSingle();
      const ready=!result.error&&Boolean(result.data);
      const list=root.querySelector('.ee-v20-checklist');
      if(!list)return;
      const item=document.createElement('li');
      item.dataset.ready=ready?'true':'false';
      item.dataset.v23MigrationCheck='true';
      item.innerHTML=`<span class="ee-v20-check">${ready?'✓':'!'}</span><div><strong>Materias primas e inventario V2.3</strong><small>${ready?'Migración 2.3 registrada.':'Ejecuta schema-v23.sql después de schema-v22.sql.'}</small></div>`;
      list.prepend(item);
    }catch(error){console.warn('No fue posible verificar schema-v23.',error);}
  }

  const refresh=()=>{patchText();addPreviewRequirement();checkConnectedMigration();};
  new MutationObserver(refresh).observe(root,{childList:true,subtree:true});
  refresh();
})();
