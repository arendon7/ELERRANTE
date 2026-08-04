(()=>{
  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products)) return;

  const enhancements={
    "harina-aire-y-tiempo":{
      image:"assets/images/v6-harina-aire-tiempo.svg",
      gallery:["assets/images/v6-harina-aire-tiempo.svg","assets/images/harina-manos.svg","assets/images/masa-apertura-gold.svg","assets/images/alveolos.svg"],
      tag:"Masa propia",
      headline:"La fuerza que sostiene el proceso.",
      summary:"Blend de harina desarrollado para trabajar fermentaciones prolongadas, hidrataciones exigentes y apertura manual con mayor control.",
      profile:["Fermentación prolongada","Apertura manual","Hidrataciones medias y altas","Desarrollo de estructura"],
      promise:"Aire y Tiempo nació en el taller. Buscábamos una harina capaz de incorporar agua, sostener fermentaciones prolongadas, conservar estructura durante la apertura y responder con coherencia frente al fuego.",
      for_whom:"Para personas que disfrutan construir la pizza desde la harina, comparar métodos y comprender cómo cada variable transforma la masa.",
      not_for:"No reemplaza el control de temperatura, el cronograma, el manejo ni la lectura de la masa. Ofrece una base de trabajo; el método sigue siendo determinante.",
      finish:"Elige una receta según tu tiempo, temperatura y experiencia. Registra el comportamiento de la masa para ajustar la siguiente prueba.",
      definition:"Harina para pizza desarrollada para procesos de fermentación lenta y apertura manual.",
      seo_description:"Harina Aire y Tiempo para pizza, desarrollada para fermentaciones prolongadas, hidrataciones exigentes y apertura manual."
    },
    "crea-la-tuya":{
      image:"assets/images/v6-crea-la-tuya.svg",
      gallery:["assets/images/v6-crea-la-tuya.svg","assets/images/pizza-errante.svg","assets/images/fermentacion.svg"],
      tag:"Personalizable",
      headline:"Nosotros trabajamos la masa. Tú decides cómo termina.",
      summary:"Una base de masa El Errante preparada para que agregues queso, ingredientes y un acabado propio.",
      profile:["Base preparada","Lista para personalizar","Horno doméstico","Combinaciones abiertas"],
      promise:"Crea la Tuya ocupa el punto medio entre empezar desde harina y recibir una pizza completamente terminada. Nosotros desarrollamos la masa y la base; tú eliges la dirección final.",
      for_whom:"Para familias, grupos y personas que quieren construir sabores diferentes sin desarrollar la masa desde cero.",
      not_for:"No es una pizza completa. Los ingredientes adicionales modifican la humedad, la cocción y la textura; los productos muy húmedos deben escurrirse o cocinarse previamente.",
      finish:"Agrega una cantidad moderada de queso e ingredientes. Hornea según el empaque y termina con hojas, aceite o reducción después del fuego.",
      definition:"Base de pizza preparada para personalizar y terminar en casa.",
      seo_description:"Base Crea la Tuya de El Errante para agregar queso, ingredientes y acabados antes de terminarla en casa."
    },
    "margherita-del-taller":{
      image:"assets/images/v6-margherita-taller.svg",
      gallery:["assets/images/v6-margherita-taller.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Esencial",
      headline:"Cuando hay poco que esconder, todo debe estar en equilibrio.",
      summary:"Tomate, mozzarella y albahaca sobre una masa de fermentación lenta.",
      profile:["Tomate","Mozzarella","Albahaca","Masa protagonista"],
      promise:"La Margherita del Taller es una prueba de claridad. Su carácter está en la proporción entre masa, tomate, queso y aroma, no en la acumulación de ingredientes.",
      for_whom:"Para quienes prefieren sabores claros, reconocibles y una pizza en la que la masa pueda expresarse.",
      not_for:"No busca exceso de queso ni coberturas abundantes. Su sencillez hace más visibles la cocción y la proporción.",
      finish:"Albahaca fresca y un hilo moderado de aceite después del horno.",
      definition:"Pizza de tomate, mozzarella y albahaca sobre masa El Errante.",
      seo_description:"Margherita del Taller de El Errante: tomate, mozzarella, albahaca y masa de fermentación lenta."
    },
    "diavola-errante":{
      image:"assets/images/v6-diavola-errante.svg",
      gallery:["assets/images/v6-diavola-errante.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Picante equilibrado",
      headline:"El picante debe despertar la pizza, no ocultarla.",
      summary:"Tomate, mozzarella y salame picante en una combinación intensa y equilibrada.",
      profile:["Intensa","Especiada","Picante progresivo","Masa estructurada"],
      promise:"El salame aporta grasa, especias y profundidad; el tomate introduce acidez, el queso integra el conjunto y la masa conserva el contraste necesario para evitar que la intensidad se vuelva pesada.",
      for_whom:"Para quienes disfrutan sabores marcados y picante progresivo sin renunciar al equilibrio.",
      not_for:"No pretende ser una prueba de resistencia. La percepción de picante varía entre personas y debe comunicarse con claridad.",
      finish:"Hierbas frescas o un hilo de aceite después del horno.",
      definition:"Pizza de tomate, mozzarella y salame picante.",
      seo_description:"Diavola Errante: pizza de tomate, mozzarella y salame picante con intensidad equilibrada."
    },
    "bosque":{
      image:"assets/images/v6-bosque.svg",
      gallery:["assets/images/v6-bosque.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Vegetariana",
      headline:"Una pizza profunda sin depender de la carne.",
      summary:"Hongos, quesos y aromáticas en una receta terrosa, cremosa y compleja.",
      profile:["Hongos","Notas terrosas","Cremosidad","Contraste balsámico"],
      promise:"Bosque parte de los hongos como ingrediente central. Combina notas terrosas, cremosidad y aroma, mientras la masa conserva la estructura necesaria para sostener el conjunto.",
      for_whom:"Para quienes buscan una opción vegetal con presencia, profundidad y un perfil menos convencional.",
      not_for:"No es una pizza neutra ni ligera. Los hongos, quesos y el acabado balsámico tienen una presencia definida.",
      finish:"Reducción balsámica en líneas finas y hierbas después del horno.",
      definition:"Pizza vegetariana de hongos, quesos y aromáticas.",
      seo_description:"Bosque de El Errante: pizza vegetariana de hongos, quesos, aromáticas y acabado balsámico."
    },
    "cuatro-quesos-montana":{
      image:"assets/images/v6-cuatro-quesos.svg",
      gallery:["assets/images/v6-cuatro-quesos.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Cremosa",
      headline:"Cremosa y amplia, sin dejar de ser una pizza.",
      summary:"Una combinación de quesos con diferentes intensidades, construida para lograr cremosidad, salinidad y profundidad.",
      profile:["Cremosa","Láctea","Madurada","Aromática"],
      promise:"Cada queso debe cumplir una función: fundir, aportar cuerpo, introducir maduración o generar contraste. La masa sostiene esa intensidad y evita que la receta se vuelva plana.",
      for_whom:"Para amantes del queso y quienes prefieren pizzas de perfil envolvente.",
      not_for:"No pretende ser una capa uniforme de grasa. Los cuatro quesos y los alérgenos deben identificarse con precisión en la ficha real.",
      finish:"Pimienta, hierbas o un toque pequeño de miel, cuando corresponda.",
      definition:"Pizza de cuatro quesos con distintos niveles de cremosidad y maduración.",
      seo_description:"Cuatro Quesos Montaña: pizza cremosa con una mezcla equilibrada de quesos y masa El Errante."
    },
    "la-errante":{
      image:"assets/images/v6-la-errante.svg",
      gallery:["assets/images/v6-la-errante.svg","assets/images/pizza-la-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Pizza insignia",
      headline:"La pizza donde la búsqueda encuentra territorio.",
      summary:"Chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica con panela e infusión de maracuyá.",
      profile:["Chorizo artesanal","Cebolla caramelizada","Quesos","Balsámico, panela y maracuyá"],
      promise:"La Errante concentra la identidad gastronómica de la marca. El chorizo aporta profundidad, la cebolla construye dulzor, los quesos integran la receta y el acabado balsámico aporta acidez y una firma aromática propia.",
      for_whom:"Para quienes quieren conocer la identidad completa de El Errante y disfrutan contrastes entre grasa, dulzor, acidez y maduración.",
      not_for:"No es una combinación tímida. La reducción no es una salsa de fruta ni una mermelada: parte de una base balsámica, se endulza con panela y se infusiona con maracuyá.",
      finish:"Aplicar la reducción después del horno en una dosificación moderada.",
      definition:"Pizza de firma con chorizo, cebolla, quesos y reducción balsámica con panela e infusión de maracuyá.",
      seo_description:"La Errante: pizza de firma con chorizo artesanal, cebolla, quesos y reducción balsámica con panela y maracuyá."
    },
    "salsa-tomate":{
      image:"assets/images/v6-salsa-tomate.svg",
      gallery:["assets/images/v6-salsa-tomate.svg","assets/images/v6-crea-la-tuya.svg","assets/images/v6-margherita-taller.svg"],
      tag:"Despensa",
      headline:"Tomate suficiente para acompañar la masa, no para cubrirla.",
      summary:"Salsa de tomate de textura equilibrada para pizza, panes y preparaciones donde el tomate debe integrarse con claridad.",
      profile:["Tomate","Acidez equilibrada","Textura dosificable","Uso versátil"],
      promise:"Nuestra salsa está pensada como una capa de sabor y no como un guiso pesado. Busca distribuirse con facilidad, conservar una acidez reconocible y acompañar la masa sin saturarla de humedad.",
      for_whom:"Para preparar pizzas, utilizar con Crea la Tuya y acompañar focaccias, panes y preparaciones horneadas.",
      not_for:"No deben atribuirse origen, variedad, certificaciones o procesos no confirmados en la formulación y la etiqueta real.",
      finish:"Distribuye una capa delgada desde el centro hacia afuera y deja libre el borde.",
      definition:"Salsa de tomate formulada para pizza y preparaciones al horno.",
      seo_description:"Salsa de tomate El Errante para pizza, focaccia, panes y preparaciones al horno."
    },
    "reduccion-balsamica":{
      image:"assets/images/v6-reduccion-balsamica.svg",
      gallery:["assets/images/v6-reduccion-balsamica.svg","assets/images/v6-bosque.svg","assets/images/v6-cuatro-quesos.svg"],
      tag:"Acabado",
      headline:"Profundidad en pequeñas cantidades.",
      summary:"Reducción de perfil dulce y ácido para terminar pizzas, quesos, vegetales, ensaladas y tablas.",
      profile:["Ácida","Dulce","Concentrada","Dosificable"],
      promise:"La reducción balsámica concentra acidez, dulzor y profundidad en una textura diseñada para aplicarse de forma precisa. Funciona como un acento que separa sabores y contrasta la grasa.",
      for_whom:"Para quienes disfrutan ajustar y terminar el plato después de la cocción.",
      not_for:"No está pensada para utilizarse como salsa base ni para cubrir una preparación. Su intensidad exige moderación.",
      finish:"Aplicar después del horno en puntos o líneas finas.",
      definition:"Reducción balsámica concentrada para acabados dulces y ácidos.",
      seo_description:"Reducción balsámica El Errante para terminar pizzas, quesos, vegetales, ensaladas y tablas."
    },
    "panela-maracuya":{
      image:"assets/images/v6-panela-maracuya.svg",
      gallery:["assets/images/v6-panela-maracuya.svg","assets/images/v6-la-errante.svg","assets/images/pizza-la-errante.svg"],
      tag:"Firma de la casa",
      headline:"Dulzor de panela. Acidez balsámica. Aroma de maracuyá.",
      summary:"Reducción de base balsámica, endulzada con panela e infusionada con maracuyá para aportar contraste, aroma y profundidad.",
      profile:["Base balsámica","Dulzor tostado","Acidez frutal","Uso dosificado"],
      promise:"El aceto aporta acidez y profundidad; la panela introduce un dulzor cálido con notas tostadas; y la infusión de maracuyá suma aroma y una acidez frutal reconocible sin convertir el producto en una salsa de fruta.",
      for_whom:"Para terminar pizzas, quesos, tablas, carnes, vegetales asados y preparaciones que necesitan contraste frente a ingredientes grasos o intensos.",
      not_for:"No es una salsa de maracuyá, una mermelada ni una reducción compuesta únicamente por panela y fruta. Es una reducción balsámica y debe aplicarse en pequeñas cantidades.",
      finish:"Comienza con una cantidad pequeña y ajusta según la grasa, la salinidad y la intensidad del ingrediente principal.",
      definition:"Reducción balsámica endulzada con panela e infusionada con maracuyá.",
      seo_description:"Reducción balsámica El Errante endulzada con panela e infusionada con maracuyá."
    },
    "combo-primera-ruta":{
      image:"assets/images/v6-combo-primera-ruta.svg",
      gallery:["assets/images/v6-combo-primera-ruta.svg","assets/images/v6-harina-aire-tiempo.svg","assets/images/v6-crea-la-tuya.svg","assets/images/v6-la-errante.svg"],
      tag:"Ruta de entrada",
      headline:"Una selección para recorrer distintas partes del proceso.",
      summary:"Un conjunto diseñado para conocer El Errante desde la masa, la preparación en casa y los acabados.",
      profile:["Desde la masa","Personalizar","Terminar en casa","Descubrir la despensa"],
      promise:"Primera Ruta reúne productos de diferentes líneas para ofrecer una introducción completa a la marca: comprender la masa, preparar una pizza y descubrir cómo un acabado transforma el resultado.",
      for_whom:"Para primeras compras, regalos y experiencias alrededor de la cocina.",
      not_for:"La composición exacta debe informarse en cada edición. Los productos pueden tener distintas condiciones de conservación y la ruta depende del componente más exigente.",
      finish:"Sigue las instrucciones de cada referencia y utiliza los acabados al momento de servir.",
      definition:"Combo de introducción a las líneas de masa, pizza en casa y despensa El Errante.",
      seo_description:"Combo Primera Ruta de El Errante con productos para conocer la masa, la preparación en casa y la despensa."
    }
  };

  window.EE_DATA.settings={
    ...window.EE_DATA.settings,
    version:"1.0.0-content",
    demo:false,
    release_name:"Contenidos públicos V1",
    default_mode:"public",
    brand_signature:"Masa · Fuego · Territorio",
    commercial_signature:"Pizza napolitana, donde sea."
  };

  window.EE_DATA.products.forEach(product=>{
    const enhancement=enhancements[product.id];
    if(!enhancement) return;
    Object.assign(product,enhancement);
    product.source_status="contenido_publico_v1";
    product.validation={
      formula:"Revisión interna",
      price:"Precio y disponibilidad sujetos a confirmación",
      label:"La información del empaque prevalece",
      sanitary:"Confirmar en etiqueta aprobada",
      photography:"Visual editorial; validar packshot y composición",
      life_shelf:"Confirmar en empaque",
      coverage:"Según ciudad, ruta y cadena de frío"
    };
  });
})();
