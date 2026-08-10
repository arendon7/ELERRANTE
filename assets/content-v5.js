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
    content_release:"v3.0-editorial-authority-candidate",
    content_ready:true,
    brand_name:"El Errante",
    descriptor:"Proyecto gastronómico dirigido por Juan David Ocampo alrededor de pizza contemporánea, masa, fuego, producto y territorio.",
    brand_signature:"Masa · Fuego · Territorio",
    commercial_signature:"Aprendemos del origen. Cocinamos desde aquí."
  };

  data.public_faqs=[
    ["¿Qué tipo de pizza hace El Errante?","Hacemos pizza contemporánea desde Colombia. Tomamos técnica y referencias de la tradición italiana, pero trabajamos cada decisión desde nuestras condiciones reales de harina, fermentación, producto y fuego, sin obligarnos a pertenecer rígidamente a una etiqueta de estilo."],
    ["¿Qué significa Masa · Fuego · Territorio?","Masa resume tiempo, fermentación, estructura y oficio; Fuego, la transformación que ocurre durante la cocción; Territorio, el producto, los productores, el clima y las decisiones tomadas desde Colombia."],
    ["¿Las pizzas llegan listas para comer?","Las referencias En Casa están diseñadas para recibir un último fuego. Parte del trabajo ocurre con nosotros y la preparación se completa siguiendo la instrucción específica del producto y del lote."],
    ["¿Qué es Segundo Fuego?","En Casa nombra la línea comercial. Segundo Fuego es el concepto con el que investigamos una pizza sabiendo desde el comienzo que tendrá dos momentos de transformación: uno durante nuestro proceso y otro en una cocina doméstica. No reemplaza las instrucciones específicas del producto."],
    ["¿Por qué hablan de terminar y no de recalentar?","Porque una pizza En Casa se desarrolla considerando que todavía tendrá una transformación. Primera cocción, estructura, humedad y acabado se piensan para que el horno doméstico complete una tarea concreta antes de servir."],
    ["¿Debo descongelar la pizza antes de hornearla?","Sigue siempre la instrucción específica del producto y del lote. No todas las referencias tienen necesariamente el mismo manejo."],
    ["¿Qué es Aire y Tiempo?","Es el blend de harina que desarrollamos a partir de la necesidad de comprender mejor la estructura y el comportamiento de la masa que buscábamos. Los parámetros técnicos de producto solo se publicarán como definitivos cuando estén validados para la versión vigente."],
    ["¿Qué es Crea la Tuya?","Es un formato de bases precocidas pensado para que parte del proceso ocurra con El Errante y la composición final quede en manos de quien la termina. La ficha vigente define presentación y preparación."],
    ["¿Qué tomate utilizan?","Trabajamos el tomate buscando una relación precisa entre identidad, acidez, concentración y humedad. El origen o variedad específicos solo se comunican como canon cuando coinciden con la formulación y el proveedor vigentes."],
    ["¿Qué es la reducción de panela y maracuyá?","Es un acabado concentrado en el que panela y maracuyá trabajan profundidad, aroma y acidez. Su formulación, presentación e ingredientes finales deben corresponder siempre con la ficha y etiqueta vigentes."],
    ["¿Puedo usar los acabados fuera de la pizza?","Cuando la ficha de la referencia lo permita, pueden utilizarse en otras preparaciones. Conviene comenzar con poca cantidad y ajustar después de probar: su función es modificar contraste, no cubrir."],
    ["¿Cómo sé si entregan en mi ciudad?","Consulta la página de cobertura. Los productos secos y los congelados pueden necesitar rutas, costos y condiciones diferentes, y la disponibilidad se confirma antes de preparar."],
    ["¿El pedido queda confirmado inmediatamente?","No necesariamente. La solicitud se confirma después de validar inventario, cobertura, fecha y condiciones comerciales. Mientras el backend permanezca sin activar, los datos creados en el sitio no deben interpretarse como una confirmación centralizada."],
    ["¿Cómo debo conservar los productos?","La etiqueta vigente es la fuente final. Las condiciones cambian entre harina, despensa, bases y pizzas congeladas; respeta siempre temperatura, vida útil y cadena de frío indicadas."],
    ["¿Dónde encuentro el lote?","El lote debe estar impreso en el empaque cuando corresponda. Consérvalo junto con fotografías y datos de preparación cuando necesites revisar una novedad de calidad."],
    ["¿El Errante ofrece servicio para eventos?","Sí. El Errante en Movimiento plantea una pizzería móvil para bodas, empresas, celebraciones y talleres. La reserva solo existe cuando el canal comercial activo confirma disponibilidad y condiciones."],
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
    release:"v3.0-content-candidate",
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
    commercial_signature:"Aprendemos del origen. Cocinamos desde aquí.",
    asset_status:"editorial-v30-authority-candidate"
  };

  document.documentElement.dataset.eeContent=ready?"ready":"incomplete";
  document.documentElement.dataset.eeContentVersion="3.0";
  document.dispatchEvent(new CustomEvent("ee:content-ready",{detail:window.EE_CONTENT_STATUS}));
  document.dispatchEvent(new CustomEvent("ee:content-v1-ready",{detail:window.EE_CONTENT_V1_STATUS}));
  if(!ready) console.warn("El Errante: contenido editorial incompleto",window.EE_CONTENT_V1_STATUS);
})();