(()=>{
  const runtime = window.EL_ERRANTE_RUNTIME_CONFIG || {};
  const runtimeBackend = runtime.backend || {};
  const INTERNAL_DEMO_PAGES = new Set(['centro-interno','control','operacion','finanzas']);
  const operationalDemoActive = (()=>{
    try{
      const page = String(document.body?.dataset?.page || '');
      return INTERNAL_DEMO_PAGES.has(page) && Boolean(localStorage.getItem('ee_v311_operational_demo'));
    }catch(_){
      return false;
    }
  })();
  window.EL_ERRANTE_COMMERCE_CONFIG = Object.freeze({
    version: "2.5.0",
    environment: runtime.environment || "preview",
    backend: {
      provider: runtimeBackend.provider || "supabase",
      url: operationalDemoActive ? "" : (runtimeBackend.url || ""),
      publishableKey: operationalDemoActive ? "" : (runtimeBackend.publishableKey || ""),
      receiptBucket: runtimeBackend.receiptBucket || "payment-receipts",
      shopperStorageKey: runtimeBackend.shopperStorageKey || "ee-shopper-auth-v15",
      adminStorageKey: runtimeBackend.adminStorageKey || "ee-admin-auth-v15"
    },
    payment: {
      bank: "Bancolombia",
      accountType: "Cuenta de ahorros",
      accountNumber: "",
      key: "",
      accountHolder: "",
      instructions: "Realiza la transferencia por el valor total del pedido y adjunta el comprobante. El pedido se prepara cuando el pago sea verificado por El Errante."
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