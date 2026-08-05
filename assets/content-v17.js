(()=>{
  'use strict';

  const products={
    'harina-aire-y-tiempo':{
      tag:'Masa de autor',
      headline:'Una harina pensada para sostener agua, tiempo y fuego.',
      summary:'Blend desarrollado para masas de fermentación prolongada, buena absorción y apertura manual: una base seria para quien quiere comprender y dominar el proceso.',
      promise:'Aire y Tiempo nace de observar la masa en condiciones reales: cómo incorpora agua, cómo conserva tensión durante la fermentación, cómo se extiende bajo las manos y cómo responde frente a una cocción intensa. No promete hacer el trabajo por ti; ofrece una materia prima diseñada para que el trabajo bien hecho tenga una base más consistente.',
      for_whom:'Para quienes disfrutan medir, fermentar, observar y ajustar. Es una harina para aprender con método, repetir con criterio y desarrollar una pizza propia desde el primer gramo.',
      not_for:'No sustituye el control de temperatura, el manejo de la levadura, los descansos ni la lectura de la masa. La calidad final sigue dependiendo del proceso completo.',
      finish:'Elige el método según tu tiempo y temperatura ambiente. Registra hidratación, fermentación y resultado: la siguiente masa comienza con lo que aprendiste de la anterior.',
      definition:'Blend de harina para pizza de fermentación prolongada, hidratación exigente y apertura manual.',
      seo_description:'Aire y Tiempo, blend de harina El Errante para masas de pizza con fermentación prolongada, hidratación exigente y apertura manual.'
    },
    'crea-la-tuya':{
      tag:'Libertad sobre buena masa',
      headline:'El trabajo difícil ya ocurrió. La decisión final es tuya.',
      summary:'Una base El Errante lista para recibir tus ingredientes y volver al fuego: estructura, sabor y libertad sin comenzar la masa desde cero.',
      promise:'Crea la Tuya conserva lo esencial de nuestro método —masa trabajada, fermentación y base preparada— y abre el resto de la receta a tu imaginación. Es el punto exacto entre la comodidad y la participación: nosotros construimos el soporte; tú defines el carácter.',
      for_whom:'Para familias, amigos y cocineros curiosos que quieren personalizar una pizza con libertad, pero prefieren partir de una masa desarrollada con criterio.',
      not_for:'No admite ingredientes sin medida. Exceso de queso, salsas o vegetales húmedos puede comprometer la base y ocultar el sabor de la masa.',
      finish:'Trabaja con pocos ingredientes, bien escogidos y correctamente preparados. Termina después del horno con hojas, aceite o una reducción dosificada.',
      definition:'Base de pizza El Errante preparada para personalizar y terminar en casa.',
      seo_description:'Crea la Tuya: base de pizza El Errante para personalizar con tus ingredientes y terminar con precisión en casa.'
    },
    'margherita-del-taller':{
      tag:'La precisión de lo esencial',
      headline:'Cuando todo es visible, cada decisión importa.',
      summary:'Tomate, mozzarella y albahaca sobre una masa de fermentación lenta. Una pizza clara, aromática y equilibrada donde nada puede esconderse.',
      promise:'La Margherita del Taller es nuestra medida de precisión. La acidez del tomate, la humedad del queso, el perfume de la albahaca y la estructura de la masa deben encontrarse sin competir. Su aparente sencillez es exactamente lo que la hace exigente.',
      for_whom:'Para quienes valoran sabores limpios y quieren probar la masa, el tomate y el queso en su expresión más directa.',
      not_for:'No busca abundancia ni exceso de queso. Su placer está en la proporción, la ligereza y el contraste entre centro, base y borde.',
      finish:'Devuélvela al fuego hasta recuperar base y aroma. Termina con albahaca fresca y un hilo preciso de aceite.',
      definition:'Pizza de tomate, mozzarella y albahaca sobre masa El Errante de fermentación lenta.',
      seo_description:'Margherita del Taller: tomate, mozzarella, albahaca y masa El Errante de fermentación lenta.'
    },
    'diavola-errante':{
      tag:'Intensidad afinada',
      headline:'Picante con profundidad, no con ruido.',
      summary:'Tomate, mozzarella y salame picante en una pizza intensa, especiada y equilibrada por la acidez y la estructura de la masa.',
      promise:'El salame libera grasa, especias y calor; el tomate devuelve frescura; el queso integra; y la masa sostiene el conjunto. El resultado no pretende desafiar por cantidad de picante, sino construir una intensidad que crece y permanece sin borrar los demás sabores.',
      for_whom:'Para quienes disfrutan sabores marcados, especias y un picante progresivo que todavía permite reconocer cada ingrediente.',
      not_for:'No es una pizza neutra. La percepción de picante varía y debe elegirse con esa claridad.',
      finish:'Termina con hierbas frescas o unas gotas de aceite después del horno para abrir el aroma y aligerar la intensidad.',
      definition:'Pizza de tomate, mozzarella y salame picante sobre masa El Errante.',
      seo_description:'Diavola Errante: pizza de tomate, mozzarella y salame picante, intensa y equilibrada.'
    },
    'bosque':{
      tag:'Umami y profundidad',
      headline:'Una pizza vegetal con presencia, textura y memoria.',
      summary:'Hongos, quesos y aromáticas en una composición terrosa, cremosa y profunda, terminada para mantener contraste y frescura.',
      promise:'Bosque trata los hongos como protagonistas, no como sustitutos. Sus notas terrosas encuentran la cremosidad de los quesos, el perfume de las aromáticas y una masa capaz de sostener humedad e intensidad sin perder estructura.',
      for_whom:'Para quienes buscan una pizza vegetal compleja, envolvente y alejada de las combinaciones previsibles.',
      not_for:'No es una opción tímida ni ligera de sabor. Los hongos, los quesos y el acabado tienen una presencia definida.',
      finish:'Una línea fina de reducción balsámica y hierbas frescas después del horno elevan el umami sin cubrirlo.',
      definition:'Pizza vegetariana de hongos, quesos y aromáticas sobre masa El Errante.',
      seo_description:'Bosque: pizza vegetariana El Errante de hongos, quesos, aromáticas y notas profundas de umami.'
    },
    'cuatro-quesos-montana':{
      tag:'Cremosidad con estructura',
      headline:'Cuatro quesos, cuatro funciones, una sola textura.',
      summary:'Una composición láctea y aromática que combina fundencia, cuerpo, maduración y contraste sin convertir la pizza en una capa uniforme de grasa.',
      promise:'Cada queso entra por una razón: uno funde, otro aporta cuerpo, otro profundidad y otro una nota más intensa. La masa y la cocción equilibran esa riqueza para que la pizza se sienta amplia y cremosa, pero conserve tensión y carácter.',
      for_whom:'Para amantes del queso que valoran la complejidad, la textura y una intensidad bien organizada.',
      not_for:'No busca exceso por exceso. El equilibrio depende de la proporción y del punto de cocción.',
      finish:'Pimienta recién molida, hierbas o un toque mínimo de miel pueden ampliar el perfil sin ocultar los quesos.',
      definition:'Pizza de cuatro quesos con distintos niveles de fundencia, cremosidad y maduración.',
      seo_description:'Cuatro Quesos Montaña: pizza El Errante cremosa, aromática y equilibrada con cuatro perfiles de queso.'
    },
    'la-errante':{
      tag:'Nuestra pizza insignia',
      headline:'Territorio, contraste y una firma que permanece.',
      summary:'Chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica con panela e infusión de maracuyá: la expresión más completa de El Errante.',
      promise:'La Errante reúne todo lo que buscamos en una pizza de firma. El chorizo aporta profundidad y especias; la cebolla, dulzor y textura; los quesos, continuidad; y la reducción final corta la grasa con acidez balsámica, panela tostada y el perfume del maracuyá. Cada capa tiene una función y el conjunto conserva a la masa como protagonista.',
      for_whom:'Para quienes quieren conocer la identidad gastronómica de El Errante y disfrutan contrastes entre grasa, acidez, dulzor, especias y maduración.',
      not_for:'No es una combinación discreta ni una salsa de fruta. La reducción parte de una base balsámica y se aplica con precisión después del horno.',
      finish:'Calienta hasta recuperar base, borde y queso. Aplica la reducción en líneas finas justo antes de servir.',
      definition:'Pizza insignia con chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica de panela y maracuyá.',
      seo_description:'La Errante: pizza insignia con chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica de panela y maracuyá.'
    },
    'salsa-tomate':{
      tag:'La base bien medida',
      headline:'Tomate limpio, textura justa y acidez que despierta la masa.',
      summary:'Salsa de tomate concebida para extenderse en una capa ligera, conservar frescura y acompañar la pizza sin saturarla de humedad.',
      promise:'Una buena salsa no debe sentirse como un guiso encima de la masa. Debe aportar tomate, acidez y jugosidad en la cantidad exacta. La formulamos para distribuirse con facilidad, integrarse durante la cocción y dejar espacio para que la masa y los demás ingredientes sigan hablando.',
      for_whom:'Para pizzas, focaccias, panes y preparaciones al horno que necesitan una base de tomate equilibrada y fácil de dosificar.',
      not_for:'No está pensada para cubrir en exceso ni para compensar ingredientes sin balance. Una capa delgada suele ser suficiente.',
      finish:'Extiende desde el centro hacia afuera, deja libre el borde y evita acumular salsa en un solo punto.',
      definition:'Salsa de tomate El Errante formulada para pizza y preparaciones al horno.',
      seo_description:'Salsa de tomate El Errante: textura dosificable y acidez equilibrada para pizza, focaccia y preparaciones al horno.'
    },
    'reduccion-balsamica':{
      tag:'Acabado de precisión',
      headline:'Acidez brillante y dulzor medido en pocas gotas.',
      summary:'Una reducción concentrada para aportar profundidad, contraste y un final largo a pizzas, quesos, vegetales y tablas.',
      promise:'La reducción concentra sin volver pesado. Su acidez corta la grasa, el dulzor redondea sabores intensos y la textura permite decidir exactamente dónde debe aparecer. Es un acabado, no una cobertura.',
      for_whom:'Para quienes disfrutan terminar el plato y ajustar su equilibrio justo antes de servir.',
      not_for:'No es una salsa base. Su intensidad exige moderación y funciona mejor en puntos o líneas finas.',
      finish:'Añádela después del horno y prueba antes de repetir. El valor está en el contraste, no en la cantidad.',
      definition:'Reducción balsámica concentrada para acabados dulces, ácidos y profundos.',
      seo_description:'Reducción balsámica El Errante para terminar pizzas, quesos, vegetales, ensaladas y tablas con precisión.'
    },
    'panela-maracuya':{
      tag:'Firma colombiana',
      headline:'Balsámico, panela y maracuyá en un equilibrio inesperado.',
      summary:'Base balsámica endulzada con panela e infusionada con maracuyá: acidez, dulzor tostado y aroma tropical para terminar con identidad.',
      promise:'El balsámico aporta profundidad; la panela, un dulzor cálido y tostado; el maracuyá, perfume y una acidez frutal que levanta el conjunto. No es mermelada ni salsa de fruta: es una reducción compleja diseñada para aparecer en pequeñas cantidades y cambiar la lectura del plato.',
      for_whom:'Para pizzas, quesos, carnes, vegetales asados y tablas que necesitan contraste frente a sabores grasos, salinos o maduros.',
      not_for:'No debe utilizarse como cobertura abundante. Su concentración y carácter se expresan mejor con una dosificación precisa.',
      finish:'Comienza con pocas gotas o líneas finas y ajusta según la grasa, salinidad e intensidad del ingrediente principal.',
      definition:'Reducción balsámica endulzada con panela e infusionada con maracuyá.',
      seo_description:'Reducción balsámica El Errante con panela y maracuyá: una firma colombiana ácida, tostada y aromática.'
    },
    'combo-primera-ruta':{
      tag:'La experiencia completa',
      headline:'Un recorrido por la masa, el fuego y los acabados de la casa.',
      summary:'Una selección creada para descubrir distintas formas de vivir El Errante: preparar, personalizar, terminar y compartir.',
      promise:'Primera Ruta no reúne productos al azar. Construye una secuencia: comprender la masa, participar en la preparación, conocer una pizza de firma y descubrir cómo un acabado preciso puede transformar el resultado. Es la entrada más completa a nuestra manera de cocinar.',
      for_whom:'Para regalar, compartir o conocer la marca más allá de una sola pizza.',
      not_for:'Cada componente exige una participación distinta. Revisa conservación, preparación y condiciones específicas antes de comenzar.',
      finish:'Organiza la experiencia antes de encender el horno: lee las instrucciones, prepara la superficie y reserva los acabados para el final.',
      definition:'Selección de productos El Errante para recorrer masa, pizza en casa y acabados.',
      seo_description:'Combo Primera Ruta de El Errante: una selección para conocer la masa, las pizzas y los acabados de la casa.'
    }
  };

  const list=window.EE_DATA?.products||[];
  for(const product of list){
    const copy=products[product.id];
    if(copy) Object.assign(product,copy);
  }

  const text=(selector,value,root=document)=>{const node=root.querySelector(selector);if(node&&value)node.textContent=value;};
  const attr=(selector,name,value,root=document)=>{const node=root.querySelector(selector);if(node&&value)node.setAttribute(name,value);};
  const meta=(name,value)=>{
    let node=document.querySelector(`meta[name="${name}"]`);
    if(!node){node=document.createElement('meta');node.name=name;document.head.appendChild(node);}
    node.content=value;
  };
  const insertAfter=(target,html)=>{const node=document.querySelector(target);if(node&&!document.querySelector('[data-v17-premium]'))node.insertAdjacentHTML('afterend',html);};

  const page=document.body?.dataset?.page||'';
  const hero=document.querySelector('.hero .hero-content');

  if(page==='inicio'&&hero){
    document.title='El Errante · Pizza neo-napolitana, productos y eventos';
    meta('description','El Errante: pizza neo-napolitana de masa fermentada, productos para terminar en casa y pizzería móvil para eventos en Medellín.');
    text('.eyebrow','Pizza neo-napolitana · Medellín',hero);
    text('h1','Masa con tiempo. Fuego con carácter.',hero);
    text('.lead','El Errante es una cocina de pizza contemporánea nacida de una búsqueda rigurosa por la harina, la fermentación y el fuego. Creamos pizzas para terminar en casa, productos de despensa y una pizzería móvil que cocina cada pieza frente a los invitados.',hero);
    const buttons=hero.querySelectorAll('.button-row a');
    if(buttons[0])buttons[0].textContent='Elegir pizzas para casa';
    if(buttons[1])buttons[1].textContent='Cotizar la pizzería móvil';
    const notes=hero.querySelectorAll(':scope > p');
    if(notes.length)notes[notes.length-1].textContent='Fermentación lenta. Apertura manual. Sabores construidos con precisión.';
    const intro=document.querySelector('.section-paper .container.split');
    if(intro){
      text('.eyebrow','La masa es el primer ingrediente',intro);
      text('h2','La pizza comienza mucho antes de elegir los ingredientes.',intro);
      const paragraphs=intro.querySelectorAll('p');
      if(paragraphs[1])paragraphs[1].textContent='Antes del tomate, el queso o el acabado existe una masa que debe incorporar agua, desarrollar estructura, fermentar con tiempo y abrirse sin perder el aire construido durante el proceso.';
      if(paragraphs[2])paragraphs[2].textContent='Después llegan los ingredientes, cada uno con una función precisa. No buscamos llenar la pizza: buscamos balancear acidez, grasa, dulzor, aroma y textura para que cada bocado conserve claridad.';
      const quote=intro.querySelector('.quote');if(quote)quote.textContent='Una pizza memorable no depende de cuánto lleva, sino de cómo todo encuentra su lugar.';
    }
    insertAfter('.hero',`<section class="section section-paper" data-v17-premium><div class="container"><div class="section-head"><div><p class="eyebrow">Por qué se siente diferente</p><h2>Calidad que puede explicarse y también probarse.</h2></div><p>El carácter premium no está en una palabra. Está en las decisiones invisibles que sostienen cada pizza.</p></div><div class="grid grid-4"><div class="feature-card"><h3>Masa con desarrollo</h3><p>Harina, hidratación, fermentación y manejo afinados para construir sabor, ligereza y estructura.</p></div><div class="feature-card"><h3>Ingredientes con función</h3><p>Cada elemento aporta acidez, grasa, aroma, textura o contraste. Nada entra solo para llenar.</p></div><div class="feature-card"><h3>Fuego bien utilizado</h3><p>La temperatura transforma la masa y revela el trabajo previo: base firme, centro flexible y borde con carácter.</p></div><div class="feature-card"><h3>Experiencia completa</h3><p>Desde las instrucciones en casa hasta el servicio en vivo, cuidamos el último momento antes de la mesa.</p></div></div></div></section>`);
  }

  if(page==='tienda'&&hero){
    document.title='Tienda El Errante · Pizzas de masa fermentada y despensa';
    meta('description','Compra pizzas El Errante para terminar en casa, harina Aire y Tiempo, bases y acabados de despensa. Masa fermentada, recetas precisas y entrega coordinada.');
    text('.eyebrow','Tienda El Errante',hero);
    text('h1','Elige cómo quieres vivir la pizza.',hero);
    text('.lead','Puedes comenzar desde la harina, crear sobre una base trabajada por nosotros, terminar una pizza completa o dar el último contraste con productos de despensa. Distintos niveles de participación, una misma exigencia por la masa y el sabor.',hero);
    const catalog=document.querySelector('#catalogo');
    if(catalog){text('.section-head h2','Una colección breve, construida con intención.',catalog);text('.section-head > p','Cada producto tiene una función clara, un método de preparación y una razón para existir dentro de la cocina El Errante.',catalog);}
    insertAfter('.hero',`<section class="section section-paper" data-v17-premium><div class="container"><div class="grid grid-4"><div class="feature-card"><h3>Masa protagonista</h3><p>Fermentación y estructura pensadas para que la masa siga presente incluso en las recetas más intensas.</p></div><div class="feature-card"><h3>Recetas afinadas</h3><p>Combinaciones construidas por balance, no por acumulación: grasa, acidez, dulzor, aroma y textura.</p></div><div class="feature-card"><h3>Último fuego en casa</h3><p>Productos diseñados para recuperar base, borde, queso y aroma antes de servir.</p></div><div class="feature-card"><h3>Compra acompañada</h3><p>Preparación, conservación y coordinación claras para que la experiencia no termine al pagar.</p></div></div></div></section>`);
  }

  if(page==='historia'&&hero){
    document.title='Nuestra historia · El Errante, masa, fuego y territorio';
    meta('description','La historia de El Errante: una búsqueda por comprender harina, fermentación y fuego para construir una pizza neo-napolitana con voz propia en Colombia.');
    text('h1','Aprendimos la tradición para construir una voz propia.',hero);
    text('.lead','El Errante nació de una convicción: una gran pizza no se copia por apariencia. Se comprende desde la harina, el clima, la fermentación, las manos y el horno; después se traduce al territorio donde realmente será cocinada.',hero);
    const first=document.querySelector('.section-paper .container.split');
    if(first){text('h2','La receta no era suficiente. Necesitábamos comprender la masa.',first);const quote=first.querySelector('.quote');if(quote)quote.textContent='Cuando dejamos de perseguir una fórmula, comenzamos a construir un método.';}
  }

  if(page==='casa'&&hero){
    document.title='El Errante en Casa · Pizza de masa fermentada para terminar';
    meta('description','Pizzas El Errante de masa fermentada, preparadas para recuperar base, borde, queso y aroma con el último horneado en casa.');
    text('h1','El último fuego cambia todo.',hero);
    text('.lead','Nosotros construimos la masa, afinamos la receta y preparamos cada pizza para que en tu cocina ocurra el momento decisivo: recuperar la base, despertar el aroma y llevarla a la mesa en su mejor punto.',hero);
    const collection=document.querySelector('#coleccion');if(collection){text('.section-head h2','Cinco maneras de entender una misma masa.',collection);text('.section-head > p','De la precisión de una Margherita a los contrastes de La Errante: una colección corta donde cada receta tiene identidad y equilibrio.',collection);}
    const prep=document.querySelector('#preparacion');if(prep){text('.section-head h2','No la calientes. Devuélvela al fuego.',prep);}
  }

  if(page==='movimiento'&&hero){
    document.title='Pizzería móvil premium para eventos · El Errante';
    meta('description','Pizzería móvil El Errante para bodas, empresas y celebraciones: masa fermentada, hornos de alta temperatura y pizzas preparadas frente a los invitados.');
    text('h1','Una pizzería encendida dentro de tu evento.',hero);
    text('.lead','Llegamos con hornos, masa fermentada, ingredientes, equipo y una operación completa. Abrimos, montamos, horneamos y servimos frente a los invitados para que la cocina también forme parte del recuerdo.',hero);
    const open=document.querySelector('.section:not(.section-paper):not(.section-dark) .container.split');
    if(open){text('h2','El aroma, el fuego y las manos también hacen parte de la experiencia.',open);}
    insertAfter('.hero',`<section class="section section-paper" data-v17-premium><div class="container"><div class="section-head"><div><p class="eyebrow">Una experiencia gastronómica en vivo</p><h2>No entregamos bandejas. Construimos el momento.</h2></div><p>La calidad del servicio se diseña antes del evento y se confirma pizza por pizza frente al horno.</p></div><div class="grid grid-4"><div class="feature-card"><h3>Masa preparada para la jornada</h3><p>Fermentación y porcionado organizados según horario, temperatura, volumen y ritmo de servicio.</p></div><div class="feature-card"><h3>Carta con criterio</h3><p>Sabores distintos, pero una selección suficientemente corta para cuidar consistencia y velocidad.</p></div><div class="feature-card"><h3>Cocción frente al invitado</h3><p>El proceso permanece visible: apertura, montaje, horno, acabado y servicio.</p></div><div class="feature-card"><h3>Operación diseñada</h3><p>Accesos, montaje, cadena de frío, circulación y tiempos se revisan antes de confirmar.</p></div></div></div></section>`);
  }

  if(location.pathname.endsWith('/producto.html')||location.pathname.endsWith('producto.html')){
    meta('description','Ficha gastronómica El Errante: ingredientes, perfil, preparación, conservación y compra de pizzas y productos de masa, fuego y despensa.');
  }

  if(location.pathname.endsWith('/producto.html')||location.pathname.endsWith('producto.html')){
    const productId=new URLSearchParams(location.search).get('id');
    const product=list.find(item=>item.id===productId);
    const root=document.querySelector('#dynamic-product');
    const applyProductPremium=()=>{
      if(!root||!product)return;
      const title=root.querySelector('h1');
      if(!title||title.dataset.v17Applied===product.id)return;
      title.dataset.v17Applied=product.id;
      const summaryNode=title.nextElementSibling?.matches('p')?title.nextElementSibling:null;
      if(summaryNode)summaryNode.textContent=product.summary;
      const reasonLabel=[...root.querySelectorAll('p')].find(node=>node.textContent.trim()==='Por qué existe');
      const storyHeading=reasonLabel?.nextElementSibling?.matches('h2')?reasonLabel.nextElementSibling:null;
      if(storyHeading){
        storyHeading.textContent=product.headline;
        let promise=storyHeading.nextElementSibling;
        if(!promise||promise.dataset.v17ProductPromise!==product.id){
          promise=document.createElement('p');
          promise.className='lead';
          promise.dataset.v17ProductPromise=product.id;
          storyHeading.insertAdjacentElement('afterend',promise);
        }
        promise.textContent=product.promise;
      }
      document.title=`${product.name} · El Errante`;
      meta('description',product.seo_description||product.summary);
      root.dataset.v17Product=product.id;
    };
    applyProductPremium();
    if(root){
      const observer=new MutationObserver(applyProductPremium);
      observer.observe(root,{childList:true,subtree:true});
      window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
    }
  }

  document.documentElement.dataset.contentVersion='1.7.0';
})();
