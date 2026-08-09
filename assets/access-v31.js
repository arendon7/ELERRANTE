(()=>{
'use strict';
const VERSION='3.1.0';
const ACCOUNT_KEY='ee_v31_local_account';
const SESSION_KEY='ee_v31_session';
const SESSION_HOURS=8;
const ALLOWED_NEXT={
 'centro-interno.html':new Set(['']),
 'control.html':new Set(['']),
 'operacion.html':new Set(['','#resumen','#pedidos','#produccion','#materiales','#medicion','#compras']),
 'finanzas.html':new Set([''])
};
const enc=new TextEncoder();
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
const read=(key,where=localStorage)=>{try{return JSON.parse(where.getItem(key));}catch(_){return null;}};
function nextTarget(){
 try{
  const candidate=new URLSearchParams(location.search).get('next');
  if(!candidate)return 'centro-interno.html';
  const match=String(candidate).match(/^([a-z0-9-]+\.html)(#[a-z0-9-]+)?$/i);
  if(!match)return 'centro-interno.html';
  const page=match[1];
  const hash=match[2]||'';
  const allowedHashes=ALLOWED_NEXT[page];
  if(!allowedHashes)return 'centro-interno.html';
  return allowedHashes.has(hash)?`${page}${hash}`:page;
 }catch(_){return 'centro-interno.html';}
}
async function derive(password,salt){
 const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 return crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:150000},material,256);
}
async function createAccount(username,password){
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const hash=await derive(password,salt);
 const account={version:VERSION,username:username.trim(),displayName:username.trim(),role:'Administrador',salt:b64(salt),hash:b64(hash),createdAt:new Date().toISOString()};
 localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));
 return account;
}
async function verify(account,password){
 const hash=await derive(password,unb64(account.salt));
 const a=unb64(account.hash),b=new Uint8Array(hash);if(a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
function openSession(account){
 const now=Date.now();
 const session={version:VERSION,username:account.username,displayName:account.displayName||account.username,role:account.role||'Administrador',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+SESSION_HOURS*3600000).toISOString()};
 sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
 location.href=nextTarget();
}
function validSession(){const s=read(SESSION_KEY,sessionStorage);return s&&Date.parse(s.expiresAt)>Date.now()?s:null;}
function field(label,name,type='text',extra=''){return `<label class="v31-field"><span>${label}</span><input name="${name}" type="${type}" ${extra}></label>`;}
function render(){
 const root=document.querySelector('#access-v31');if(!root)return;
 const active=validSession();if(active){location.replace(nextTarget());return;}
 const account=read(ACCOUNT_KEY);
 const first=!account;
 root.innerHTML=`<div class="v31-access-card"><div class="v31-access-brand"><img src="assets/logo-lockup.svg" alt="El Errante"><span>Sistema interno · V3.1</span></div><div class="v31-access-copy"><p class="eyebrow">Acceso usuarios</p><h1>${first?'Configura el primer acceso local.':'Bienvenido de nuevo.'}</h1><p>${first?'Este navegador todavía no tiene un usuario interno. Crea las credenciales que usarás para entrar al Panel de control, Operación y Finanzas.':'Ingresa con tu usuario para continuar al módulo interno que solicitaste.'}</p></div><form id="v31-access-form" class="v31-access-form">${field('Usuario','username','text',`autocomplete="username" required value="${esc(account?.username||'')}"`)}${field('Contraseña','password','password','autocomplete="current-password" minlength="8" required')}${first?field('Confirmar contraseña','confirm','password','autocomplete="new-password" minlength="8" required'):''}<button class="v31-primary" type="submit">${first?'Crear acceso y entrar':'Ingresar al sistema'}</button><div id="v31-access-message" class="v31-form-message" aria-live="polite"></div></form><div class="v31-access-security"><strong>Acceso local protegido</strong><p>La contraseña no se guarda: el navegador conserva únicamente un derivado PBKDF2 con sal aleatoria. Esta capa protege la experiencia local, pero GitHub Pages sigue siendo un host estático; la autorización servidor/RLS se activará al migrar a Supabase.</p></div></div>`;
 root.querySelector('#v31-access-form').addEventListener('submit',async event=>{
  event.preventDefault();const fd=new FormData(event.currentTarget);const username=String(fd.get('username')||'').trim();const password=String(fd.get('password')||'');const msg=root.querySelector('#v31-access-message');
  msg.textContent='Validando…';msg.dataset.tone='';
  try{
   if(username.length<2||password.length<8)throw new Error('Usa un usuario válido y una contraseña de mínimo 8 caracteres.');
   if(first){if(password!==String(fd.get('confirm')||''))throw new Error('Las contraseñas no coinciden.');const created=await createAccount(username,password);openSession(created);return;}
   if(username.toLowerCase()!==String(account.username||'').toLowerCase()||!(await verify(account,password)))throw new Error('Usuario o contraseña incorrectos.');
   openSession(account);
  }catch(error){msg.textContent=error.message||'No fue posible iniciar sesión.';msg.dataset.tone='error';}
 });
}
window.EL_ERRANTE_ACCESS_V31={version:VERSION,accountKey:ACCOUNT_KEY,sessionKey:SESSION_KEY,allowedNext:Object.fromEntries(Object.entries(ALLOWED_NEXT).map(([page,hashes])=>[page,[...hashes]])),nextTarget,validSession};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();