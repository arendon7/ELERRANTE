(()=>{
'use strict';
const VERSION='3.1.0';
const SESSION_KEY='ee_v31_session';
let expiryTimer=null;
function read(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY));}catch(_){return null;}}
function session(){const s=read();if(!s||!s.expiresAt||Date.parse(s.expiresAt)<=Date.now()){sessionStorage.removeItem(SESSION_KEY);return null;}return s;}
function signOut(){clearExpiryTimer();sessionStorage.removeItem(SESSION_KEY);location.href='acceso.html';}
function requestedTarget(){
 const page=location.pathname.split('/').pop()||'centro-interno.html';
 return `${page}${location.hash||''}`;
}
function accessUrl(){return `acceso.html?next=${encodeURIComponent(requestedTarget())}`;}
function clearExpiryTimer(){if(expiryTimer!==null){clearTimeout(expiryTimer);expiryTimer=null;}}
function redirectExpired(){clearExpiryTimer();sessionStorage.removeItem(SESSION_KEY);location.replace(accessUrl());}
function scheduleExpiry(s){
 clearExpiryTimer();
 const expires=Date.parse(s?.expiresAt||'');
 if(!Number.isFinite(expires)){redirectExpired();return;}
 const remaining=expires-Date.now();
 if(remaining<=0){redirectExpired();return;}
 expiryTimer=setTimeout(()=>{
  const active=session();
  if(!active){redirectExpired();return;}
  scheduleExpiry(active);
 },Math.max(1,Math.min(remaining,2147483647)));
}
function enforceSession(){
 const s=session();
 if(!s){redirectExpired();return null;}
 scheduleExpiry(s);return s;
}
function boot(){
 const body=document.body;if(!body)return;
 const s=enforceSession();
 if(!s)return;
 body.dataset.v31Authenticated='true';document.documentElement.dataset.internalVersion=VERSION;
 document.querySelectorAll('[data-v31-user]').forEach(node=>node.textContent=s.displayName||s.username||'Usuario');
 document.querySelectorAll('[data-v31-role]').forEach(node=>node.textContent=s.role||'Usuario');
 document.querySelectorAll('[data-v31-signout]').forEach(button=>button.addEventListener('click',signOut));
 document.querySelectorAll('.v30-side').forEach(side=>{
  if(side.querySelector('.v31-session-card'))return;
  const card=document.createElement('div');card.className='v31-session-card';
  card.innerHTML=`<div><small>Sesión activa</small><strong>${escapeHtml(s.displayName||s.username||'Usuario')}</strong><span>${escapeHtml(s.role||'Usuario')}</span></div><div class="v31-session-actions"><a href="centro-interno.html">Cambiar módulo</a><button type="button" data-v31-signout>Cerrar sesión</button></div>`;
  side.appendChild(card);card.querySelector('[data-v31-signout]').addEventListener('click',signOut);
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')enforceSession();});
 window.addEventListener('focus',enforceSession);
 window.addEventListener('pageshow',enforceSession);
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
window.EL_ERRANTE_INTERNAL_V31={version:VERSION,session,signOut,requestedTarget,accessUrl,enforceSession};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();