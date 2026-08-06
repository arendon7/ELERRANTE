(()=>{
  const runtime = window.EL_ERRANTE_RUNTIME_CONFIG || {};
  const runtimeBackend = runtime.backend || {};
  window.EL_ERRANTE_COMMERCE_CONFIG = Object.freeze({
    version: "2.1.0",
    environment: runtime.environment || "preview",
    backend: {
      provider: runtimeBackend.provider || "supabase",
      url: runtimeBackend.url || "",
      publishableKey: runtimeBackend.publishableKey || "",
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
      monthlyFixedCosts: [
        { id: "trabajador", label: "Trabajador", amount: 2000000 },
        { id: "sede", label: "Sede y ocupación", amount: 2500000 },
        { id: "servicios", label: "Servicios, conectividad y operación", amount: 750000 },
        { id: "otros", label: "Otros gastos fijos", amount: 750000 }
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
