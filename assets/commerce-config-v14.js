window.EL_ERRANTE_COMMERCE_CONFIG = Object.freeze({
  version: "1.4.0",
  environment: "preview",
  backend: {
    provider: "supabase",
    url: "",
    publishableKey: "",
    receiptBucket: "payment-receipts"
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
    requireReceipt: true,
    maxReceiptBytesPreview: 5000000
  }
});
