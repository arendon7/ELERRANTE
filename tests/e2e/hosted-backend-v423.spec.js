const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const configSource = fs.readFileSync(path.join(process.cwd(),'assets','commerce-config-v14.js'),'utf8');

async function loadSynthetic(page,url,{pageName='tienda',runtime={}}={}){
  await page.route(url,route=>route.fulfill({
    status:200,
    contentType:'text/html; charset=utf-8',
    body:`<!doctype html><html><body data-page="${pageName}"><script>window.EL_ERRANTE_RUNTIME_CONFIG=${JSON.stringify(runtime)};</script><script>${configSource}</script></body></html>`
  }));
  await page.goto(url);
  return page.evaluate(()=>({config:window.EL_ERRANTE_COMMERCE_CONFIG,runtime:window.EL_ERRANTE_RUNTIME_CONFIG}));
}

test.describe('V4.2.3 · backend público hospedado',()=>{
  test('GitHub Pages de El Errante usa el backend público dedicado sin service_role',async({page})=>{
    const {config,runtime}=await loadSynthetic(page,'https://arendon7.github.io/ELERRANTE/config-test.html');
    expect(config.environment).toBe('connected');
    expect(config.backend.provider).toBe('supabase');
    expect(config.backend.url).toBe('https://mqyxsymbmpvkmdxkrqgj.supabase.co');
    expect(config.backend.publishableKey).toMatch(/^sb_publishable_/);
    expect(config.backend.publishableKey).not.toContain('service_role');
    expect(runtime.environment).toBe('connected');
    expect(runtime.backend.url).toBe(config.backend.url);
    expect(runtime.backend.publishableKey).toBe(config.backend.publishableKey);
  });

  test('otros hosts permanecen preview cuando el runtime no aporta backend',async({page})=>{
    const {config,runtime}=await loadSynthetic(page,'https://example.com/config-test.html');
    expect(config.environment).toBe('preview');
    expect(config.backend.url).toBe('');
    expect(config.backend.publishableKey).toBe('');
    expect(runtime.environment).toBeUndefined();
  });

  test('un runtime explícito válido tiene prioridad sobre el fallback hospedado',async({page})=>{
    const {config,runtime}=await loadSynthetic(page,'https://arendon7.github.io/ELERRANTE/config-runtime.html',{
      runtime:{environment:'connected',backend:{provider:'supabase',url:'https://runtime.example.supabase.co',publishableKey:'sb_publishable_runtime'}}
    });
    expect(config.backend.url).toBe('https://runtime.example.supabase.co');
    expect(config.backend.publishableKey).toBe('sb_publishable_runtime');
    expect(runtime.backend.url).toBe('https://runtime.example.supabase.co');
  });

  test('demo operativo interno conserva backend apagado incluso en Pages',async({page})=>{
    const url='https://arendon7.github.io/ELERRANTE/config-demo.html';
    await page.route(url,route=>route.fulfill({
      status:200,
      contentType:'text/html; charset=utf-8',
      body:`<!doctype html><html><body data-page="operacion"><script>localStorage.setItem('ee_v311_operational_demo','1');window.EL_ERRANTE_RUNTIME_CONFIG={};</script><script>${configSource}</script></body></html>`
    }));
    await page.goto(url);
    const state=await page.evaluate(()=>({config:window.EL_ERRANTE_COMMERCE_CONFIG,runtime:window.EL_ERRANTE_RUNTIME_CONFIG}));
    expect(state.config.environment).toBe('preview');
    expect(state.config.backend.url).toBe('');
    expect(state.config.backend.publishableKey).toBe('');
    expect(state.runtime.environment).toBe('connected');
    expect(state.runtime.backend.url).toBe('https://mqyxsymbmpvkmdxkrqgj.supabase.co');
  });
});