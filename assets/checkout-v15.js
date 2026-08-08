(()=>{
  "use strict";

  const ORIGINAL_PAGE = document.body?.dataset?.page || "";
  if(ORIGINAL_PAGE === "checkout") document.body.dataset.page = "checkout-v29-bootstrap";

  const v29Root = () => document.querySelector('#checkout-v29-status');
  const exposeLegacyRoot = () => {
    const root = v29Root();
    if(root) root.id = 'checkout-form';
  };
  const restoreV29Root = () => {
    const root = document.querySelector('#checkout-form');
    if(root && !document.querySelector('#checkout-form-v14')) root.id = 'checkout-v29-status';
  };

  const loadLegacyCheckout = () => new Promise((resolve, reject) => {
    if (document.querySelector('script[data-ee-commerce-v14]')) return resolve();
    const script = document.createElement("script");
    script.src = "assets/commerce-v14.js";
    script.dataset.eeCommerceV14 = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("No fue posible cargar el checkout comercial."));
    document.body.appendChild(script);
  });

  const backendReady = config => Boolean(config?.backend?.url && config?.backend?.publishableKey);
  const publishRuntime = (backendState, runtime, pageState) => {
    document.documentElement.dataset.eeCommerceBackend = backendState;
    document.documentElement.dataset.eeCheckoutRuntime = runtime;
    if(document.body) document.body.dataset.page = pageState;
    document.dispatchEvent(new CustomEvent("ee:checkout-runtime", {detail:{backendState,runtime,pageState}}));
  };

  async function hydratePublicSettings(config){
    if(!backendReady(config)) return config;
    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const client = module.createClient(config.backend.url, config.backend.publishableKey, {
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:false,
        storageKey:config.backend.shopperStorageKey || "ee-shopper-auth-v15"
      }
    });
    window.__EE_SUPABASE__ = client;
    const {data,error} = await client
      .from("public_settings")
      .select("key,value")
      .in("key",["payment","ordering"]);
    if(error) throw error;
    const values = Object.fromEntries((data||[]).map(row => [row.key,row.value||{}]));
    return Object.freeze({
      ...config,
      payment:{...(config.payment||{}), ...(values.payment||{})},
      ordering:{...(config.ordering||{}), ...(values.ordering||{})}
    });
  }

  async function boot(){
    const initial = window.EL_ERRANTE_COMMERCE_CONFIG || {};

    if(!backendReady(initial)){
      window.EL_ERRANTE_COMMERCE_CONFIG = initial;
      restoreV29Root();
      publishRuntime("preview", "v29-offline", "checkout-preview");
      return;
    }

    try{
      window.EL_ERRANTE_COMMERCE_CONFIG = await hydratePublicSettings(initial);
      if(!backendReady(window.EL_ERRANTE_COMMERCE_CONFIG)){
        restoreV29Root();
        publishRuntime("preview", "v29-offline", "checkout-preview");
        return;
      }
      exposeLegacyRoot();
      publishRuntime("connected", "legacy-connected", "checkout");
      await loadLegacyCheckout();
    }catch(error){
      console.warn("No fue posible sincronizar la configuración pública; el checkout permanecerá sin conexión.", error);
      window.EL_ERRANTE_COMMERCE_CONFIG = initial;
      restoreV29Root();
      publishRuntime("degraded", "v29-offline", "checkout-preview");
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
})();
