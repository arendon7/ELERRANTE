(()=>{
'use strict';
const VERSION='3.1.1';
const ACCOUNT_KEY='ee_v31_local_account';
const SESSION_KEY='ee_v31_session';
const SESSION_HOURS=8;
const REVIEW_ACCOUNTS=Object.freeze([
 {username:'juancho',displayName:'Juancho',role:'Revisor',salt:'7MLV0Wa6D78w2lSHznepWw==',hash:'r6PIDylO/U98/MpqrAE7RY837Gqvg7xLYMO3GKEyXyA='},
 {username:'lucho',displayName:'Lucho',role:'Revisor',salt:'KKFdvOpS0uYDMKIHUGDogg==',hash:'DmDEVWwH43mOiVPYh+DU7fyc1XkC+F9veHA894NW2os='}
]);
const ALLOWED_NEXT={
 'centro-interno.html':new Set(['']),
 'control.html':new Set(['']),
 'operacion.html':new Set(['','#resumen','#cierre-diario','#pedidos','#produccion','#materiales','#medicion','#compras','#evidencia']),
 'finanzas.html':new Set(['']),
 'studio.html':new Set(['']),
 'actas.html':new Set([''])
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
function findReviewAccount(username){return REVIEW_ACCOUNTS.find(item=>item.username===String(username||'').trim().toLowerCase())||null;}
async function authenticate(username,password){
 const reviewer=findReviewAccount(username);
 if(reviewer&&await verify(reviewer,password))return reviewer;
 const local=read(ACCOUNT_KEY);
 if(local&&String(local.username||'').toLowerCase()===String(username||'').trim().toLowerCase()&&await verify(local,password))return local;
 return null;
}
function openSession(account){
 const now=Date.now();
 const session={version:VERSION,username:account.username,displayName:account.displayName||account.username,role:account.role||'Administrador',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+SESSION_HOURS*3600000).toISOString()};
 sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
 location.href=nextTarget();
}
function validSession(){const s=read(SESSION_KEY,sessionStorage);return s&&Date.parse(s.expiresAt)>Date.now()?s:null;}
function field(label,name,type='text',extra=''){return `<label class="v31-field"><span>${label}</span><input name="${name}" type="${type}" ${extra}></label>`;}
function render(mode='auto'){
 const root=document.querySelector('#access-v31');if(!root)return;
 const active=validSession();if(active){location.replace(nextTarget());return;}
 const local=read(ACCOUNT_KEY);
 const setup=mode==='setup'||(mode==='auto'&&!local);
 root.innerHTML=`<div class="v31-access-card"><div class="v31-access-brand"><div class="v31-access-brand-lockup"><img src="assets/images/brand-v4/pizzaiolo-mark-v4.webp" alt="" width="72" height="72"><span class="v31-access-brand-wordmark"><strong>EL ERRANTE</strong><small>Pizza contemporánea · Est. 2019</small></span></div><span>Sistema interno · V3.1</span></div><div class="v31-access-copy"><p class="eyebrow">Acceso usuarios</p><h1>${setup?'Configura el primer acceso local.':'Bienvenido de nuevo.'}</h1><p>${setup?'Este navegador todavía no tiene un usuario interno. Crea las credenciales que usarás para entrar al Panel de control, Operación y Finanzas. También puedes ingresar con un usuario de revisión si te compartieron una cuenta.':'Ingresa con tu administrador local o con una cuenta de revisión autorizada para continuar al módulo interno que solicitaste.'}</p></div>${setup?`<form id="v31-setup-form" class="v31-access-form">${field('Usuario','username','text','autocomplete="username" required')}${field('Contraseña','password','password','autocomplete="new-password" minlength="8" required')}${field('Confirmar contraseña','confirm','password','autocomplete="new-password" minlength="8" required')}<button class="v31-primary" type="submit">Crear acceso y entrar</button><button class="v31-btn" type="button" data-v31-login-mode>Ingresar con usuario de revisión</button><div id="v31-access-message" class="v31-form-message" aria-live="polite"></div></form>`:`<form id="v31-access-form" class="v31-access-form">${field('Usuario','username','text',`autocomplete="username" required value="${esc(local?.username||'')}"`)}${field('Contraseña','password','password','autocomplete="current-password" minlength="5" required')}<button class="v31-primary" type="submit">Ingresar al sistema</button>${local?'':`<button class="v31-btn" type="button" data-v31-setup-mode>Crear acceso administrador local</button>`}<div id="v31-access-message" class="v31-form-message" aria-live="polite"></div></form>`}<div class="v31-access-security"><strong>Perímetro de revisión local</strong><p>Las cuentas de revisión y el administrador local usan derivados PBKDF2 y crean una sesión temporal de ocho horas. GitHub Pages sigue siendo un host estático: esta capa organiza el acceso a la demo, pero no sustituye autorización de servidor ni Supabase Auth/RLS.</p></div></div>`;
 if(setup){
  root.querySelector('[data-v31-login-mode]')?.addEventListener('click',()=>render('login'));
  root.querySelector('#v31-setup-form').addEventListener('submit',async event=>{
   event.preventDefault();const fd=new FormData(event.currentTarget);const username=String(fd.get('username')||'').trim();const password=String(fd.get('password')||'');const msg=root.querySelector('#v31-access-message');
   msg.textContent='Creando acceso…';msg.dataset.tone='';
   try{
    if(username.length<2||password.length<8)throw new Error('Usa un usuario válido y una contraseña de mínimo 8 caracteres.');
    if(findReviewAccount(username))throw new Error('Ese usuario está reservado para revisión. Elige otro nombre.');
    if(password!==String(fd.get('confirm')||''))throw new Error('Las contraseñas no coinciden.');
    const created=await createAccount(username,password);openSession(created);
   }catch(error){msg.textContent=error.message||'No fue posible crear el acceso.';msg.dataset.tone='error';}
  });
  return;
 }
 root.querySelector('[data-v31-setup-mode]')?.addEventListener('click',()=>render('setup'));
 root.querySelector('#v31-access-form').addEventListener('submit',async event=>{
  event.preventDefault();const fd=new FormData(event.currentTarget);const username=String(fd.get('username')||'').trim();const password=String(fd.get('password')||'');const msg=root.querySelector('#v31-access-message');
  msg.textContent='Validando…';msg.dataset.tone='';
  try{
   if(username.length<2||password.length<5)throw new Error('Usuario o contraseña incorrectos.');
   const authenticated=await authenticate(username,password);
   if(!authenticated)throw new Error('Usuario o contraseña incorrectos.');
   openSession(authenticated);
  }catch(error){msg.textContent=error.message||'No fue posible iniciar sesión.';msg.dataset.tone='error';}
 });
}
window.EL_ERRANTE_ACCESS_V31={version:VERSION,accountKey:ACCOUNT_KEY,sessionKey:SESSION_KEY,reviewUsers:REVIEW_ACCOUNTS.map(({username,displayName,role})=>({username,displayName,role})),allowedNext:Object.fromEntries(Object.entries(ALLOWED_NEXT).map(([page,hashes])=>[page,[...hashes]])),nextTarget,validSession};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(),{once:true});else render();
})();