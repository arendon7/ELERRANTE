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
    content_release:"v2.9-editorial-aligned",
    content_ready:true,
    brand_name:"El Errante",
    descriptor:"Pizza contemporánea hecha en Colombia, productos para terminar en casa y experiencias alrededor del fuego.",
    brand_signature:"Masa · Fuego · Territorio",
    commercial_signature:"Aprendida viajando. Hecha desde Colombia."
  };

  data.public_faqs=[
    ["¿Qué tipo de pizza hace El Errante?","Hacemos una pizza contemporánea que toma técnica y referencias de la tradición italiana y las trabaja desde Colombia. La masa, la fermentación prolongada, la apertura manual, el fuego intenso y el equilibrio de ingredientes son más importantes para nosotros que pertenecer rígidamente a una etiqueta de estilo."],
    ["¿Qué significa Masa · Fuego · Territorio?","Masa resume harina, agua, fermentación y manejo; Fuego, la manera en que temperatura y tiempo transforman la pizza; Territorio, la decisión de aprender de Italia sin fingir otra geografía y construir cada vez más desde ingredientes, productores y posibilidades de Colombia."],
    ["¿Las pizzas llegan listas para comer?","Las referencias En Casa están diseñadas para recibir un último fuego. Parte del trabajo ocurre con nosotros y la preparación se completa en tu horno siguiendo la instrucción específica del empaque."],
    ["¿Por qué hablan de terminar y no de recalentar?","Porque el producto se diseña alrededor de dos momentos de cocción. Nuestro horno resuelve la etapa que depende de masa, fermentación y alta temperatura; el horno doméstico completa estructura, fundencia y aroma antes de servir."],
    ["¿Debo descongelar la pizza antes de hornearla?","Sigue siempre la instrucción específica del producto y del lote. No todas las referencias tienen necesariamente el mismo manejo."],
    ["¿Qué es Aire y Tiempo?","Es el blend de harina que desarrollamos para trabajar el tipo de masa que buscábamos: fermentaciones prolongadas, hidrataciones exigentes y apertura manual. La ficha técnica publicará parámetros como W y P/L únicamente cuando estén validados para el producto."],
    ["¿Qué es Crea la Tuya?","Es un pack de bases precocidas con masa y tomate. Nosotros resolvemos formulación, fermentación, boleado, apertura y primera cocción; tú eliges los ingredientes y haces el último fuego."],
    ["¿Qué tomate utilizan?","La salsa que describimos en esta colección parte de tomate San Marzano y se trabaja buscando una relación limpia entre identidad de tomate, acidez, dulzor, concentración y humedad."],
    ["¿Qué es la reducción de panela y maracuyá?","Es una reducción de base balsámica, endulzada con panela e infusionada con maracuyá. La panela aporta un dulzor cálido y el maracuyá una nota aromática y ácida; no es una salsa de fruta ni una mermelada."],
    ["¿Puedo usar las reducciones fuera de la pizza?","Sí. Funcionan como acabados concentrados para quesos, tablas, vegetales, carnes, ensaladas y otras preparaciones. Conviene comenzar con poca cantidad y ajustar después de probar."],
    ["¿Cómo sé si entregan en mi ciudad?","Consulta la página de cobertura. Los productos secos y los congelados pueden necesitar rutas, costos y condiciones diferentes, y la disponibilidad se confirma antes de preparar."],
    ["¿El pedido queda confirmado inmediatamente?","No necesariamente. La solicitud se confirma después de validar inventario, cobertura, fecha y condiciones comerciales. Mientras el backend permanezca sin activar, los datos creados en el sitio no deben interpretarse como una confirmación centralizada."],
    ["¿Cómo debo conservar los productos?","La etiqueta vigente es la fuente final. Las condiciones cambian entre harina, despensa, bases y pizzas congeladas; respeta siempre temperatura, vida útil y cadena de frío indicadas."],
    ["¿Dónde encuentro el lote?","El lote debe estar impreso en el empaque. Consérvalo junto con fotografías y datos de preparación cuando necesites revisar una novedad de calidad."],
    ["¿El Errante ofrece servicio para eventos?","Sí. El Errante en Movimiento plantea una pizzería móvil para bodas, empresas, celebraciones y talleres. En esta publicación puedes preparar y copiar los datos de una solicitud; la reserva solo existe cuando un canal comercial activo confirma disponibilidad y condiciones."],
    ["¿Pueden manejar alergias o restricciones alimentarias?","Debes informarlas antes de comprar o contratar un evento. Solo se debe prometer una preparación diferenciada cuando la operación pueda garantizar el nivel de separación necesario. Una preferencia alimentaria no debe confundirse con una alergia."],
    ["¿Puedo solicitar factura?","La facturación debe coordinarse mediante el canal comercial vigente cuando esté configurado. No publicamos un mecanismo de envío o contacto que todavía no exista."]
  ];

  Object.entries(required).forEach(([key,minimum])=>{
    const value=data[key];
    counts[key]=Array.isArray(value)?value.length:0;
    if(counts[key]<minimum) missing.push(key);
  });

  const ready=missing.length===0;
  data.settings.content_ready=ready;

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
    commercial_signature:"Aprendida viajando. Hecha desde Colombia.",
    asset_status:"editorial-v29-aligned"
  };

  document.documentElement.dataset.eeContent=ready?"ready":"incomplete";
  document.documentElement.dataset.eeContentVersion="2.9";
  document.dispatchEvent(new CustomEvent("ee:content-ready",{detail:window.EE_CONTENT_STATUS}));
  document.dispatchEvent(new CustomEvent("ee:content-v1-ready",{detail:window.EE_CONTENT_V1_STATUS}));
  if(!ready) console.warn("El Errante: contenido editorial incompleto",window.EE_CONTENT_V1_STATUS);
})();
