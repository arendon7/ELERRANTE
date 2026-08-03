(()=>{
  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products)) return;

  const enhancements={
    "harina-aire-y-tiempo":{
      image:"assets/images/v6-harina-aire-tiempo.svg",
      gallery:["assets/images/v6-harina-aire-tiempo.svg","assets/images/harina-manos.svg","assets/images/masa-apertura-gold.svg","assets/images/alveolos.svg"],
      tag:"Masa propia",
      headline:"La fuerza que sostiene el tiempo.",
      profile:["Mayor absorción","Fermentación prolongada","Apertura manual","Estructura equilibrada"],
      promise:"Un blend desarrollado en Colombia para incorporar más agua, sostener fermentaciones prolongadas y conservar un manejo predecible.",
      for_whom:"Para quien quiere comprender y controlar la masa, desde una pizza cotidiana hasta procesos de 24 horas o más.",
      not_for:"No reemplaza el control de temperatura, fermentación, peso ni cocción: la harina amplía el rango de trabajo, pero el método sigue importando.",
      finish:"El resultado final depende del método, el equipo y la lectura de la masa."
    },
    "crea-la-tuya":{
      image:"assets/images/v6-crea-la-tuya.svg",
      gallery:["assets/images/v6-crea-la-tuya.svg","assets/images/pizza-errante.svg","assets/images/fermentacion.svg"],
      tag:"Personalizable",
      headline:"Nosotros hacemos la parte difícil. Tú decides cómo termina.",
      profile:["Precocida","Congelada","Con tomate y aromáticas","Airfryer u horno"],
      promise:"Dos pizzas con masa fermentada, salsa de tomate y aromáticas listas para que agregues queso, ingredientes y el último gesto.",
      for_whom:"Para cocinar rápido sin empezar desde harina y para compartir sabores distintos en una misma mesa.",
      not_for:"No es una pizza completa ni una base cruda. Requiere queso, ingredientes y cocción final.",
      finish:"Termina con hierbas, aceite, queso o una reducción después del horno, según la combinación elegida."
    },
    "margherita-del-taller":{
      image:"assets/images/v6-margherita-taller.svg",
      gallery:["assets/images/v6-margherita-taller.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Esencial",
      headline:"Cuando hay poco que esconder, todo debe estar en equilibrio.",
      profile:["Tomate","Mozzarella","Albahaca","Masa El Errante"],
      promise:"Una Margherita construida alrededor del equilibrio entre masa, tomate, queso y aroma.",
      for_whom:"Para quien busca una pizza directa, reconocible y precisa.",
      not_for:"No busca exceso de queso ni ingredientes: su carácter depende de la proporción y la cocción.",
      finish:"Albahaca fresca y un hilo de aceite después del horno."
    },
    "diavola-errante":{
      image:"assets/images/v6-diavola-errante.svg",
      gallery:["assets/images/v6-diavola-errante.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Picante equilibrado",
      headline:"Picante suficiente para despertar la pizza, no para ocultarla.",
      profile:["Tomate","Mozzarella","Salame picante","Contraste aromático"],
      promise:"Una pizza intensa y equilibrada, con picante progresivo y una base que sigue siendo protagonista.",
      for_whom:"Para quien disfruta sabores marcados sin convertir el picante en el único argumento.",
      not_for:"No pretende ser una prueba de resistencia: el picante acompaña, no domina.",
      finish:"Hierbas y aceite después del horno para abrir el aroma."
    },
    "bosque":{
      image:"assets/images/v6-bosque.svg",
      gallery:["assets/images/v6-bosque.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Vegetariana",
      headline:"Una pizza profunda sin depender de la carne.",
      profile:["Hongos","Quesos","Aromáticas","Acabado balsámico"],
      promise:"Capas de sabor terroso, cremosidad y acidez para una pizza vegetariana con profundidad real.",
      for_whom:"Para quien busca una opción vegetal compleja y completa.",
      not_for:"No es una pizza ligera ni neutra: los hongos y el acabado balsámico tienen presencia.",
      finish:"Reducción balsámica y hierbas después del horno."
    },
    "cuatro-quesos-montana":{
      image:"assets/images/v6-cuatro-quesos.svg",
      gallery:["assets/images/v6-cuatro-quesos.svg","assets/images/pizza-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Cremosa",
      headline:"Cremosa y compleja, pero todavía una pizza.",
      profile:["Cuatro quesos","Contraste de intensidades","Masa estructurada","Acabado aromático"],
      promise:"Una mezcla de quesos diseñada para sumar cremosidad, salinidad y maduración sin borrar la masa.",
      for_whom:"Para amantes del queso que buscan equilibrio, no solo abundancia.",
      not_for:"No pretende ser una capa uniforme de grasa: cada queso cumple una función.",
      finish:"Pimienta, hierbas o un toque de miel después del horno."
    },
    "la-errante":{
      image:"assets/images/v6-la-errante.svg",
      gallery:["assets/images/v6-la-errante.svg","assets/images/pizza-la-errante.svg","assets/images/editorial-fuego.svg"],
      tag:"Pizza insignia",
      headline:"La pizza donde la búsqueda encuentra territorio.",
      profile:["Chorizo artesanal","Cebolla caramelizada","Quesos","Panela y maracuyá"],
      promise:"Técnica aprendida, ingredientes propios y un acabado colombiano que define la firma de la casa.",
      for_whom:"Para quien quiere probar la identidad completa de El Errante en una sola pizza.",
      not_for:"No es una combinación tímida: mezcla grasa, dulzor, acidez, humo y maduración.",
      finish:"Reducción de panela y maracuyá después del horno."
    },
    "salsa-tomate":{
      image:"assets/images/v6-salsa-tomate.svg",
      gallery:["assets/images/v6-salsa-tomate.svg","assets/images/v6-crea-la-tuya.svg","assets/images/v6-margherita-taller.svg"],
      tag:"Despensa",
      headline:"Tomate suficiente para acompañar la masa, no para cubrirla.",
      profile:["Tomate","Textura para pizza","Uso dosificado","Lista para aplicar"],
      promise:"Una salsa formulada para distribuirse con facilidad, conservar frescura y no saturar la masa.",
      for_whom:"Para pizzas, focaccias, panes y preparaciones donde el tomate debe integrarse sin dominar.",
      not_for:"No es una salsa de pasta ni un guiso concentrado: está pensada para una capa delgada.",
      finish:"Dosifica desde el centro hacia afuera y deja libre el borde."
    },
    "reduccion-balsamica":{
      image:"assets/images/v6-reduccion-balsamica.svg",
      gallery:["assets/images/v6-reduccion-balsamica.svg","assets/images/v6-bosque.svg","assets/images/v6-cuatro-quesos.svg"],
      tag:"Acabado",
      headline:"Profundidad en pequeñas cantidades.",
      profile:["Dulce y ácida","Textura densa","Uso después del horno","Dosificación precisa"],
      promise:"Un acabado concentrado para sumar acidez, dulzor y profundidad sin humedecer la pizza.",
      for_whom:"Para hongos, quesos, vegetales asados, ensaladas y tablas.",
      not_for:"No debe usarse como salsa base ni en exceso: funciona como acento.",
      finish:"Aplica en líneas finas o puntos justo antes de servir."
    },
    "panela-maracuya":{
      image:"assets/images/v6-panela-maracuya.svg",
      gallery:["assets/images/v6-panela-maracuya.svg","assets/images/v6-la-errante.svg","assets/images/pizza-la-errante.svg"],
      tag:"Territorio",
      headline:"Dulzor profundo. Acidez que despierta.",
      profile:["Panela","Maracuyá","Ácido-dulce","Uso después del horno"],
      promise:"Una reducción colombiana que combina dulzor tostado y acidez tropical para terminar pizzas, quesos y carnes.",
      for_whom:"Para quien busca contraste y una firma menos convencional.",
      not_for:"No es una mermelada ni una salsa abundante: su intensidad exige dosificación.",
      finish:"Usa pocas líneas después del horno y ajusta según la grasa del ingrediente principal."
    },
    "combo-primera-ruta":{
      image:"assets/images/v6-combo-primera-ruta.svg",
      gallery:["assets/images/v6-combo-primera-ruta.svg","assets/images/v6-harina-aire-tiempo.svg","assets/images/v6-crea-la-tuya.svg","assets/images/v6-la-errante.svg"],
      tag:"Ruta de entrada",
      headline:"Tres formas de entrar a la misma búsqueda.",
      profile:["Desde cero","Personalizar","Solo hornear","Despensa"],
      promise:"Una selección para conocer El Errante desde la masa, la preparación en casa y los acabados.",
      for_whom:"Para primeras compras, regalos y mesas que quieren comparar distintos niveles de participación.",
      not_for:"La composición exacta depende de disponibilidad y cadena de frío en la ciudad de entrega.",
      finish:"Sigue las instrucciones de cada producto y usa los acabados al momento de servir."
    }
  };

  window.EE_DATA.settings={...window.EE_DATA.settings,version:"0.6.1",demo:false,release_name:"Catálogo Gold V0.6",default_mode:"public"};

  window.EE_DATA.products.forEach(product=>{
    const enhancement=enhancements[product.id];
    if(!enhancement) return;
    Object.assign(product,enhancement);
    product.source_status="catalogo_publico_v6";
    product.validation={
      formula:"Revisión interna",
      price:"Precio publicado sujeto a confirmación",
      label:"Información comercial",
      sanitary:"Confirmar en empaque",
      photography:"Visual editorial v0.6",
      life_shelf:"Confirmar en empaque",
      coverage:"Según ciudad y cadena de frío"
    };
  });
})();
