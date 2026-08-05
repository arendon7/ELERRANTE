(()=>{
  "use strict";

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
    try{
      window.EL_ERRANTE_COMMERCE_CONFIG = await hydratePublicSettings(initial);
      document.documentElement.dataset.eeCommerceBackend = backendReady(window.EL_ERRANTE_COMMERCE_CONFIG) ? "connected" : "preview";
    }catch(error){
      console.warn("No fue posible sincronizar la configuración pública; se usará el modo de contingencia.", error);
      window.EL_ERRANTE_COMMERCE_CONFIG = initial;
      document.documentElement.dataset.eeCommerceBackend = "degraded";
    }
    try{
      await loadLegacyCheckout();
    }catch(error){
      console.error(error);
      const form = document.querySelector("#checkout-form");
      if(form) form.innerHTML = '<div class="form-alert">No fue posible iniciar el formulario. Recarga la página o escríbenos para coordinar tu pedido.</div>';
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
})();
