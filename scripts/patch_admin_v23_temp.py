from pathlib import Path

path=Path('assets/admin-v15.js')
text=path.read_text(encoding='utf-8')
old='''  function localState(){
    const defaults = BASE.finance?.monthlyFixedCosts || [];
    return {
      orders:read(KEYS.orders,[]),
      products:defaultProducts(),
      fixedCosts:read(KEYS.fixedCosts,defaults),
      settings:localSettings()
    };
  }
'''
new='''  function localState(){
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
'''
if old not in text: raise SystemExit('No se encontró localState original')
text=text.replace(old,new,1)
old_note='<p class="ee-v14-note" style="margin-top:16px">Total configurado: <strong>${money(m.fixed)}</strong>. La base temporal continúa en $6.000.000 mensuales.</p>'
new_note='<p class="ee-v14-note" style="margin-top:16px">Total configurado: <strong>${money(m.fixed)}</strong>. Etapa ${escapeHtml(BASE.finance?.stage||"operativa")} · ${escapeHtml(BASE.finance?.dataStatus||"PENDIENTE")}. ${escapeHtml(BASE.finance?.notice||"")}</p>'
if old_note not in text: raise SystemExit('No se encontró nota demo antigua')
text=text.replace(old_note,new_note,1)
old_render='''  function renderLocal(container){
    const state = localState();
    container.innerHTML = dashboard(state,"local",null);
    bindDashboard(container,"local",state,null,null);
  }
'''
new_render='''  function renderLocal(container){
    const state = localState();
    container.innerHTML = dashboard(state,"local",null);
    bindDashboard(container,"local",state,null,null);
    window.dispatchEvent(new CustomEvent("ee:admin:ready",{detail:{mode:"local"}}));
  }
'''
if old_render not in text: raise SystemExit('No se encontró renderLocal')
text=text.replace(old_render,new_render,1)
text=text.replace('<p class="eyebrow">Administración V2.2</p>','<p class="eyebrow">Administración V2.3</p>',1)
text=text.replace('V2.0, V2.1 y V2.2.</span>','V2.0, V2.1, V2.2 y V2.3.</span>',1)
path.write_text(text,encoding='utf-8')

materials=Path('assets/materials-v23.js')
m=materials.read_text(encoding='utf-8')
marker="  window.addEventListener('ee:v22:reload',shell);"
replacement="  window.addEventListener('ee:v22:reload',shell);\n  window.addEventListener('ee:admin:ready',shell);"
if marker not in m: raise SystemExit('No se encontró evento V2.2 en materials')
materials.write_text(m.replace(marker,replacement,1),encoding='utf-8')
