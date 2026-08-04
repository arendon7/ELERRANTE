(()=>{
  const data=window.EE_DATA;
  const canonicalStatus=window.EE_CONTENT_STATUS||null;
  const required={products:11,articles:1,recipes:1,faqs:1};
  const counts={};
  const missing=[];

  if(!data){
    window.EE_CONTENT_STATUS={ready:false,source:"assets/data.js + assets/preprod.js + assets/products-v6.js"};
    window.EE_CONTENT_V1_STATUS={ready:false,release:"v1.0-content",missing:["EE_DATA"],counts:{}};
    document.documentElement.dataset.eeContent="missing";
    console.error("El Errante: la fuente maestra EE_DATA no está disponible.");
    return;
  }

  data.settings={
    ...(data.settings||{}),
    content_release:"v1.0-content",
    content_ready:true,
    brand_name:"El Errante",
    descriptor:"Pizza napolitana contemporánea, productos para casa y experiencias móviles.",
    brand_signature:"Masa · Fuego · Territorio",
    commercial_signature:"Pizza napolitana, donde sea."
  };

  data.public_faqs=[
    ["¿Qué tipo de pizza hace El Errante?","Desarrollamos una interpretación contemporánea de la pizza napolitana, con masas de fermentación lenta, apertura manual y cocción a alta temperatura."],
    ["¿Las pizzas llegan listas para comer?","Depende del producto. Algunas referencias están diseñadas para terminarse en casa y requieren cocción según las instrucciones del empaque. Consulta la ficha antes de comprar."],
    ["¿Debo descongelar la pizza antes de hornearla?","Sigue siempre la instrucción específica del producto. Algunas referencias pueden cocinarse directamente desde congeladas y otras pueden requerir un manejo diferente."],
    ["¿Qué es Aire y Tiempo?","Es un blend de harina desarrollado para trabajar masas de pizza con fermentaciones prolongadas, hidrataciones exigentes y apertura manual. No reemplaza el método ni la observación de la masa."],
    ["¿Qué es Crea la Tuya?","Es una base preparada para que agregues queso, ingredientes y acabados antes de terminarla en tu horno."],
    ["¿Qué es la reducción de panela y maracuyá?","Su definición completa es reducción balsámica endulzada con panela e infusionada con maracuyá. Parte de una base balsámica; no es una salsa de fruta ni una mermelada."],
    ["¿Puedo usar las reducciones en productos distintos a la pizza?","Sí. Pueden utilizarse en quesos, tablas, ensaladas, vegetales, carnes y otras preparaciones. Son productos concentrados y deben aplicarse en pequeñas cantidades."],
    ["¿Cómo sé si entregan en mi ciudad?","Consulta la página de cobertura. Los productos secos y los productos congelados pueden tener rutas, costos y pedidos mínimos diferentes."],
    ["¿El pedido queda confirmado inmediatamente?","No necesariamente. La solicitud se confirma después de validar inventario, cobertura, fecha de entrega y condiciones de pago."],
    ["¿Cómo debo conservar los productos?","Sigue la información indicada en la etiqueta y la ficha. Las condiciones pueden variar entre harina, despensa, bases y pizzas congeladas."],
    ["¿Dónde encuentro el lote?","El lote debe estar impreso en el empaque. Consérvalo cuando necesites informar una novedad de calidad."],
    ["¿El Errante ofrece servicio para eventos?","Sí. El Errante en Movimiento ofrece pizzería móvil para bodas, empresas, celebraciones y talleres, sujeto a disponibilidad y condiciones del lugar."],
    ["¿Pueden manejar alergias o restricciones alimentarias?","Debes informarlas antes de comprar o contratar un evento. Evaluaremos si la operación puede garantizar el nivel de separación requerido. Una preferencia alimentaria no debe confundirse con una alergia."],
    ["¿Puedo solicitar factura?","La información de facturación debe registrarse durante el pedido o enviarse dentro del plazo informado por el canal de atención."]
  ];

  Object.entries(required).forEach(([key,minimum])=>{
    const value=data[key];
    counts[key]=Array.isArray(value)?value.length:0;
    if(counts[key]<minimum) missing.push(key);
  });

  const ready=missing.length===0;
  data.settings.content_ready=ready;

  /* Contrato estable de la fuente recuperada. El contenido editorial V1
     se publica en un estado paralelo y no modifica estos indicadores. */
  window.EE_CONTENT_STATUS=canonicalStatus||{
    ready:
      Array.isArray(data.products)&&data.products.length===11&&
      Array.isArray(data.recipes)&&data.recipes.length===5&&
      Array.isArray(data.articles)&&data.articles.length===5&&
      Array.isArray(data.faqs)&&data.faqs.length===5&&
      Array.isArray(data.coverage)&&data.coverage.length===6,
    source:"assets/data.js + assets/preprod.js + assets/products-v6.js"
  };

  window.EE_CONTENT_V1_STATUS={
    ready,
    release:"v1.0-content",
    source:"assets/content-v5.js",
    canonical_source:window.EE_CONTENT_STATUS.source,
    missing,
    counts,
    public_faqs:data.public_faqs.length,
    checkedAt:new Date().toISOString()
  };

  window.EE_BRAND_V1={
    logo:"assets/logo-mark.svg",
    palette:{carbon:"#191817",cream:"#F2ECE1",terracotta:"#A5432D",wheat:"#C5A36A",steel:"#66645D"},
    signature:"Masa · Fuego · Territorio",
    commercial_signature:"Pizza napolitana, donde sea.",
    asset_status:"editorial-package-prepared-for-integration"
  };

  document.documentElement.dataset.eeContent=ready?"ready":"incomplete";
  document.documentElement.dataset.eeContentVersion="1.0";
  document.dispatchEvent(new CustomEvent("ee:content-ready",{detail:window.EE_CONTENT_STATUS}));
  document.dispatchEvent(new CustomEvent("ee:content-v1-ready",{detail:window.EE_CONTENT_V1_STATUS}));
  if(!ready) console.warn("El Errante: contenido editorial incompleto",window.EE_CONTENT_V1_STATUS);
})();
