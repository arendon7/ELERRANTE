(()=>{
'use strict';
const VERSION='3.1.1';
const UX_VERSION='3.8.0';
const EFFICIENCY_VERSION='3.9.0';
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
function ensureUxStyle(){
 const existing=document.querySelector('link[data-internal-ux-v38]');
 if(existing)return Promise.resolve(existing);
 return new Promise(resolve=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href=`assets/internal-ux-v38.css?v=${UX_VERSION}`;link.dataset.internalUxV38=UX_VERSION;
  link.addEventListener('load',()=>resolve(link),{once:true});link.addEventListener('error',()=>resolve(link),{once:true});document.head.appendChild(link);
 });
}
function ensureUxScript(){
 if(window.EL_ERRANTE_INTERNAL_UX_V38)return Promise.resolve(window.EL_ERRANTE_INTERNAL_UX_V38);
 const existing=document.querySelector('script[data-internal-ux-v38]');
 if(existing)return new Promise(resolve=>existing.addEventListener('load',()=>resolve(window.EL_ERRANTE_INTERNAL_UX_V38||null),{once:true}));
 return new Promise(resolve=>{
  const script=document.createElement('script');script.src=`assets/internal-ux-v38.js?v=${UX_VERSION}`;script.dataset.internalUxV38=UX_VERSION;script.async=false;
  script.addEventListener('load',()=>resolve(window.EL_ERRANTE_INTERNAL_UX_V38||null),{once:true});script.addEventListener('error',()=>resolve(null),{once:true});document.body.appendChild(script);
 });
}
function rollbackUxStyle(){document.querySelector('link[data-internal-ux-v38]')?.remove();document.documentElement.removeAttribute('data-internal-ux-version');}
function ensureEfficiencyStyle(){
 const existing=document.querySelector('link[data-internal-ux-v39]');
 if(existing)return Promise.resolve(existing);
 return new Promise(resolve=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href=`assets/internal-ux-v39.css?v=${EFFICIENCY_VERSION}`;link.dataset.internalUxV39=EFFICIENCY_VERSION;
  link.addEventListener('load',()=>resolve(link),{once:true});link.addEventListener('error',()=>resolve(link),{once:true});document.head.appendChild(link);
 });
}
function ensureEfficiencyScript(){
 if(window.EL_ERRANTE_INTERNAL_UX_V39)return Promise.resolve(window.EL_ERRANTE_INTERNAL_UX_V39);
 const existing=document.querySelector('script[data-internal-ux-v39]');
 if(existing)return new Promise(resolve=>existing.addEventListener('load',()=>resolve(window.EL_ERRANTE_INTERNAL_UX_V39||null),{once:true}));
 return new Promise(resolve=>{
  const script=document.createElement('script');script.src=`assets/internal-ux-v39.js?v=${EFFICIENCY_VERSION}`;script.dataset.internalUxV39=EFFICIENCY_VERSION;script.async=false;
  script.addEventListener('load',()=>resolve(window.EL_ERRANTE_INTERNAL_UX_V39||null),{once:true});script.addEventListener('error',()=>resolve(null),{once:true});document.body.appendChild(script);
 });
}
function rollbackEfficiencyStyle(){document.querySelector('link[data-internal-ux-v39]')?.remove();document.documentElement.removeAttribute('data-internal-efficiency-version');}
async function boot(){
 const body=document.body;if(!body)return;
 const s=enforceSession();
 if(!s)return;
 await ensureUxStyle();
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
 const ux=await ensureUxScript();
 if(!ux){rollbackUxStyle();return;}
 await ensureEfficiencyStyle();
 const efficiency=await ensureEfficiencyScript();
 if(!efficiency)rollbackEfficiencyStyle();
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
window.EL_ERRANTE_INTERNAL_V31={version:VERSION,uxVersion:UX_VERSION,efficiencyVersion:EFFICIENCY_VERSION,session,signOut,requestedTarget,accessUrl,enforceSession,ensureUxStyle,ensureUxScript,rollbackUxStyle,ensureEfficiencyStyle,ensureEfficiencyScript,rollbackEfficiencyStyle};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});else void boot();
})();