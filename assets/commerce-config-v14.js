(()=>{
  const runtime = window.EL_ERRANTE_RUNTIME_CONFIG || {};
  const runtimeBackend = runtime.backend || {};
  const HOSTED_PUBLIC_BACKEND = Object.freeze({
    provider: "supabase",
    url: "https://mqyxsymbmpvkmdxkrqgj.supabase.co",
    publishableKey: "sb_publishable_EZgM0VHAb2h99yDCPJLPpw_NqbU331r"
  });
  const hostedProduction = (()=>{
    try{
      const host = String(location.hostname || '').toLowerCase();
      const path = String(location.pathname || '').toLowerCase();
      return host === 'arendon7.github.io' && (path === '/elerrante' || path.startsWith('/elerrante/'));
    }catch(_){
      return false;
    }
  })();
  const runtimeBackendReady = Boolean(runtimeBackend.url && runtimeBackend.publishableKey);
  const hostedFallbackActive = !runtimeBackendReady && hostedProduction;
  const resolvedBackend = runtimeBackendReady ? runtimeBackend : (hostedFallbackActive ? HOSTED_PUBLIC_BACKEND : {});
  if(hostedFallbackActive){
    window.EL_ERRANTE_RUNTIME_CONFIG = Object.freeze({
      ...runtime,
      environment: "connected",
      backend: Object.freeze({
        provider: HOSTED_PUBLIC_BACKEND.provider,
        url: HOSTED_PUBLIC_BACKEND.url,
        publishableKey: HOSTED_PUBLIC_BACKEND.publishableKey,
        receiptBucket: runtimeBackend.receiptBucket || "payment-receipts",
        shopperStorageKey: runtimeBackend.shopperStorageKey || "ee-shopper-auth-v15",
        adminStorageKey: runtimeBackend.adminStorageKey || "ee-admin-auth-v15"
      })
    });
  }
  const INTERNAL_DEMO_PAGES = new Set(['centro-interno','control','operacion','finanzas']);
  const operationalDemoActive = (()=>{
    try{
      const page = String(document.body?.dataset?.page || '');
      return INTERNAL_DEMO_PAGES.has(page) && Boolean(localStorage.getItem('ee_v311_operational_demo'));
    }catch(_){
      return false;
    }
  })();
  const connected = Boolean(resolvedBackend.url && resolvedBackend.publishableKey) && !operationalDemoActive;
  window.EL_ERRANTE_COMMERCE_CONFIG = Object.freeze({
    version: "2.5.0",
    environment: connected ? "connected" : (runtime.environment || "preview"),
    backend: {
      provider: resolvedBackend.provider || runtimeBackend.provider || "supabase",
      url: connected ? resolvedBackend.url : "",
      publishableKey: connected ? resolvedBackend.publishableKey : "",
      receiptBucket: runtimeBackend.receiptBucket || "payment-receipts",
      shopperStorageKey: runtimeBackend.shopperStorageKey || "ee-shopper-auth-v15",
      adminStorageKey: runtimeBackend.adminStorageKey || "ee-admin-auth-v15"
    },
    payment: {
      bank: "",
      accountType: "",
      accountNumber: "",
      key: "",
      accountHolder: "",
      instructions: "Realiza la transferencia por el valor total confirmado del pedido y adjunta el comprobante. El pedido se prepara cuando el pago sea verificado por El Errante."
    },
    finance: {
      currency: "COP",
      stage: "Piloto",
      dataStatus: "ESTIMADO",
      notice: "Gastos provisionales de la etapa piloto. No incluyen salario formal de Juan, arriendo futuro, impuestos definitivos ni costo económico del trabajo de socios.",
      monthlyFixedCosts: [
        { id: "servicios", label: "Servicios e internet", amount: 90000 },
        { id: "aseo", label: "Aseo y consumibles", amount: 50000 },
        { id: "contabilidad", label: "Contabilidad y software", amount: 70000 },
        { id: "mercadeo", label: "Mercadeo", amount: 80000 },
        { id: "mantenimiento", label: "Mantenimiento", amount: 40000 },
        { id: "sanitario", label: "Sanitario, etiquetas y registros", amount: 40000 }
      ]
    },
    ordering: {
      commerceEnabled: false,
      deliveryPolicy: "Cobertura abierta sujeta a coordinación logística",
      deliveryFeePolicy: "La tarifa se confirma según dirección, volumen y alternativa de entrega.",
      coverageDetails: "Recibimos solicitudes sin rutas ni días fijos. Confirmamos disponibilidad y logística antes de preparar.",
      supportWhatsapp: "",
      supportEmail: "",
      expectedResponseHours: 24,
      requireReceipt: true,
      maxReceiptBytesPreview: 5000000
    }
  });
})();