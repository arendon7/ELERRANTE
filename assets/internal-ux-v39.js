(()=>{
'use strict';
const VERSION='3.9.0';
const HISTORY_KEY='ee_v39_navigation_history';
const MAX_HISTORY=6;
const ALLOWED_PAGES=new Set(['centro-interno.html','control.html','operacion.html','finanzas.html','studio.html','actas.html','piloto-operativo.html','index.html']);
const PAGE_LABELS={
 'centro-interno.html':'Inicio interno',
 'control.html':'Panel de control',
 'operacion.html':'Operación',
 'finanzas.html':'Finanzas',
 'studio.html':'Datos maestros',
 'actas.html':'Actas',
 'piloto-operativo.html':'Piloto operativo',
 'index.html':'Web pública'
};
const PAGE_KEYWORDS={
 'centro-interno.html':'inicio módulos sistema',
 'control.html':'prioridad alertas faltantes pedidos compras control día',
 'operacion.html':'pedidos producción materiales inventario compras despacho medición operación',
 'finanzas.html':'finanzas margen caja costos plan real escenarios abastecimiento presupuesto',
 'studio.html':'datos maestros catálogo sku precio evidencia producto recetas bom',
 'actas.html':'actas validación trazabilidad decisiones evidencia sesión puertas',
 'piloto-operativo.html':'piloto backup checkpoint reconciliación observaciones jornada continuidad',
 'index.html':'web pública cliente catálogo exterior'
};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let layer=null,dialog=null,input=null,results=null,previousFocus=null,activeIndex=-1,currentItems=[];
function pageName(){return location.pathname.split('/').pop()||'centro-interno.html'}
function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function validHref(raw){
 const value=String(raw||'').trim();if(!value||/^https?:/i.test(value)||value.startsWith('//'))return null;
 const [base,hash='']=value.split('#');const page=base||pageName();if(!ALLOWED_PAGES.has(page))return null;
 if(hash&&!/^[A-Za-z0-9_-]+$/.test(hash))return null;return `${page}${hash?`#${hash}`:''}`;
}
function sectionLabelForHash(hash){
 if(!hash)return'';const link=$(`.v31-workspace-nav a[href="#${CSS.escape(hash)}"]`);return link?.textContent?.trim()||'';
}
function readHistory(){
 try{
  const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(!Array.isArray(parsed))return[];
  return parsed.map(item=>({href:validHref(item?.href),label:String(item?.label||'').slice(0,120),at:Number(item?.at)||0})).filter(item=>item.href&&item.label).sort((a,b)=>b.at-a.at).slice(0,MAX_HISTORY);
 }catch(_){return[]}
}
function writeHistory(items){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,MAX_HISTORY)))}catch(_){}}
function currentVisit(){
 const page=pageName();if(!ALLOWED_PAGES.has(page)||page==='centro-interno.html'||page==='index.html')return null;
 const hash=(location.hash||'').replace(/^#/,'');const section=sectionLabelForHash(hash);const base=PAGE_LABELS[page]||document.title.split('·')[0].trim();
 return{href:`${page}${hash?`#${hash}`:''}`,label:section?`${base} · ${section}`:base,at:Date.now()};
}
function recordCurrent(){const item=currentVisit();if(!item)return;const next=[item,...readHistory().filter(old=>old.href!==item.href)];writeHistory(next)}
function navItems(){
 const items=[];const seen=new Set();const add=(href,label,group='Módulo',keywords='')=>{const safe=validHref(href);if(!safe||seen.has(safe))return;seen.add(safe);const base=safe.split('#')[0];items.push({href:safe,label:String(label||safe).trim(),group,keywords:normalize(`${label} ${group} ${keywords} ${PAGE_KEYWORDS[base]||''}`)})};
 readHistory().forEach(item=>add(item.href,item.label,'Reciente','continuar historial'));
 $$('.v30-nav a').forEach(a=>add(a.getAttribute('href'),a.textContent,'Módulo','navegación principal'));
 $$('.v31-workspace-nav a[href^="#"]').forEach(a=>add(`${pageName()}${a.getAttribute('href')}`,a.textContent,'En esta pantalla','sección ancla'));
 return items;
}
function shortcutLabel(){return /Mac|iPhone|iPad|iPod/.test(navigator.platform||navigator.userAgent)?'⌘K':'Ctrl K'}
function triggerMarkup(compact=false){const button=document.createElement('button');button.type='button';button.className=`v39-command-trigger${compact?' compact':''}`;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label','Buscar y navegar por el sistema');button.innerHTML=`<span aria-hidden="true">⌕</span><span class="v39-trigger-label">Buscar</span><kbd>${shortcutLabel()}</kbd>`;button.addEventListener('click',openDialog);return button}
function addTriggers(){
 $$('.v31-session-actions').forEach(actions=>{if(!$('.v39-command-trigger',actions))actions.prepend(triggerMarkup())});
 const mobile=$('.v38-mobile-bar');if(mobile&&!$('.v39-command-trigger',mobile))mobile.append(triggerMarkup(true));
}
function createLayer(){
 if(layer)return;
 layer=document.createElement('div');layer.className='v39-command-layer';layer.hidden=true;layer.innerHTML=`<div class="v39-command-backdrop" data-v39-close></div><section class="v39-command" role="dialog" aria-modal="true" aria-labelledby="v39-command-title"><header><div><small>NAVEGACIÓN RÁPIDA</small><h2 id="v39-command-title">¿A dónde quieres ir?</h2></div><button type="button" class="v39-command-close" data-v39-close aria-label="Cerrar buscador">×</button></header><div class="v39-search-wrap"><span aria-hidden="true">⌕</span><input id="v39-command-input" type="search" autocomplete="off" spellcheck="false" placeholder="Busca Operación, caja, pedidos, inventario…" aria-label="Buscar módulo o sección" aria-controls="v39-command-results"><kbd>Esc</kbd></div><div id="v39-command-results" class="v39-command-results" role="list" aria-live="polite"></div><footer><span><kbd>↑</kbd><kbd>↓</kbd> mover</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span></footer></section>`;
 document.body.append(layer);dialog=$('.v39-command',layer);input=$('#v39-command-input',layer);results=$('#v39-command-results',layer);
 $$('[data-v39-close]',layer).forEach(node=>node.addEventListener('click',closeDialog));input.addEventListener('input',renderResults);input.addEventListener('keydown',onInputKey);dialog.addEventListener('keydown',trapFocus);
}
function filteredItems(){const q=normalize(input?.value);const all=navItems();if(!q)return all;return all.filter(item=>item.keywords.includes(q)||normalize(item.label).includes(q))}
function renderResults(){
 currentItems=filteredItems();activeIndex=-1;if(!results)return;results.innerHTML='';
 if(!currentItems.length){const empty=document.createElement('p');empty.className='v39-no-results';empty.textContent='No encontré un módulo o sección con ese nombre.';results.append(empty);return}
 currentItems.forEach((item,index)=>{const row=document.createElement('div');row.setAttribute('role','listitem');const button=document.createElement('button');button.type='button';button.className='v39-command-item';button.dataset.v39Index=String(index);button.innerHTML=`<span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.group)}</small></span><span aria-hidden="true">→</span>`;button.addEventListener('click',()=>navigate(item.href));row.append(button);results.append(row)});
}
function navigate(href){const safe=validHref(href);if(!safe)return;closeDialog(false);location.href=safe}
function setActive(index){
 const buttons=$$('.v39-command-item',results);if(!buttons.length)return;activeIndex=(index+buttons.length)%buttons.length;buttons.forEach((button,i)=>button.classList.toggle('active',i===activeIndex));buttons[activeIndex].focus();
}
function onInputKey(e){if(e.key==='ArrowDown'){e.preventDefault();setActive(0)}else if(e.key==='ArrowUp'){e.preventDefault();setActive(currentItems.length-1)}else if(e.key==='Enter'&&currentItems[0]){e.preventDefault();navigate(currentItems[0].href)}}
function onGlobalKey(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();layer&&!layer.hidden?closeDialog():openDialog();return}if(e.key==='Escape'&&layer&&!layer.hidden){e.preventDefault();closeDialog()}}
function trapFocus(e){
 if(e.key==='Escape'){e.preventDefault();closeDialog();return}
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&document.activeElement?.classList.contains('v39-command-item')){e.preventDefault();setActive(activeIndex+(e.key==='ArrowDown'?1:-1));return}
 if(e.key!=='Tab')return;const nodes=$$('button:not([disabled]),input:not([disabled]),[href],[tabindex]:not([tabindex="-1"])',dialog).filter(el=>!el.hidden&&el.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}
function openDialog(){
 createLayer();window.EL_ERRANTE_INTERNAL_UX_V38?.closeMenu?.(false);previousFocus=document.activeElement;layer.hidden=false;document.body.classList.add('v39-command-open');const shell=$('.v30-shell');if(shell)shell.inert=true;input.value='';renderResults();requestAnimationFrame(()=>input.focus())
}
function closeDialog(restore=true){if(!layer||layer.hidden)return;layer.hidden=true;document.body.classList.remove('v39-command-open');const shell=$('.v30-shell');if(shell)shell.inert=false;if(restore&&previousFocus instanceof HTMLElement)previousFocus.focus();previousFocus=null}
function buildResume(){
 if(pageName()!=='centro-interno.html'||$('.v39-resume'))return;const hero=$('.v31-module-hero');if(!hero)return;const history=readHistory();const recent=history[0];const section=document.createElement('section');section.className='v39-resume';section.setAttribute('aria-label','Continuidad de trabajo');
 if(recent){section.innerHTML=`<div><small>CONTINUIDAD</small><h2>Continúa donde quedaste</h2><p>${escapeHtml(recent.label)}</p></div><div class="v39-resume-actions"><a class="v39-resume-primary" href="${escapeHtml(recent.href)}">Continuar →</a><button type="button" class="v39-resume-search">Buscar otra cosa <kbd>${shortcutLabel()}</kbd></button></div>`}
 else{section.innerHTML=`<div><small>ACCESO RÁPIDO</small><h2>Encuentra cualquier módulo sin recorrer menús</h2><p>Busca módulos y secciones desde teclado o desde el botón Buscar.</p></div><div class="v39-resume-actions"><button type="button" class="v39-resume-search">Buscar en el sistema <kbd>${shortcutLabel()}</kbd></button></div>`}
 hero.insertAdjacentElement('afterend',section);$('.v39-resume-search',section)?.addEventListener('click',openDialog)
}
function observeWorkspace(){window.addEventListener('hashchange',recordCurrent);window.addEventListener('pagehide',recordCurrent);$$('.v31-workspace-nav a[href^="#"]').forEach(a=>a.addEventListener('click',()=>setTimeout(recordCurrent,0)))}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function boot(){if(!document.body?.classList.contains('admin-body'))return;document.documentElement.dataset.internalEfficiencyVersion=VERSION;recordCurrent();createLayer();addTriggers();buildResume();observeWorkspace();document.addEventListener('keydown',onGlobalKey)}
window.EL_ERRANTE_INTERNAL_UX_V39={VERSION,openDialog,closeDialog,readHistory,recordCurrent};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();