(()=>{
  'use strict';

  const VERSION='2.9.0';
  const data=window.EE_DATA;
  if(!data)return;

  const products={
    'harina-aire-y-tiempo':{
      tag:'El origen de la masa',
      headline:'La harina que necesitábamos no estaba esperando en una estantería.',
      summary:'Aire y Tiempo es nuestro blend para pizza: una formulación nacida de buscar estructura, extensibilidad y tolerancia para fermentaciones largas, hidrataciones altas y apertura manual.',
      promise:'El proyecto empezó por una incomodidad concreta. Queríamos trabajar masas vivas, con biga, masa madre, tiempo y agua, pero la harina disponible no siempre entregaba la información técnica ni el comportamiento que necesitábamos para repetir con criterio. En lugar de seguir corrigiendo una receta alrededor de esa limitación, empezamos a formular nuestra propia base. Aire y Tiempo es el resultado de esa búsqueda: no una harina milagrosa, sino una herramienta para que proceso, observación y materia prima trabajen en la misma dirección.',
      for_whom:'Para quien quiere hacer pizza desde el principio y disfruta entender lo que ocurre durante mezcla, fermentación, división, boleado, apertura y cocción. Funciona mejor cuando se mide y se registra: cada masa deja información para la siguiente.',
      not_for:'No reemplaza el método. La temperatura, el porcentaje de prefermento, la hidratación, los descansos y la lectura de la masa siguen siendo decisivos. Tampoco publicamos valores técnicos que todavía no estén respaldados por una ficha validada.',
      finish:'Úsala con un método definido, pesa todos los ingredientes y registra temperatura de masa, tiempo e hidratación. Si cambias una variable, procura mantener las demás estables para poder leer el resultado.',
      definition:'Blend de harina desarrollado por El Errante para pizza de fermentación prolongada, hidratación exigente y apertura manual.',
      seo_description:'Aire y Tiempo, blend de harina El Errante desarrollado para masas con fermentación prolongada, hidratación alta y apertura manual.',
      story_title:'Primero tuvimos que construir la harina.',
      story:'En Italia es normal encontrar harinas para pizza descritas por su fuerza, equilibrio y uso recomendado. En Colombia esa lectura no siempre es posible con la misma profundidad. Para nosotros esa diferencia no era un detalle: condicionaba toda la masa. Aire y Tiempo nació para dejar de adaptar el objetivo a la harina disponible y empezar a diseñar la harina alrededor del tipo de fermentación y cocción que queríamos lograr.',
      sensory:'Una buena masa no debería saber únicamente a harina tostada. Buscamos un perfil limpio, ligeramente dulce y fermentado, con una miga aireada y una estructura capaz de conservar ligereza sin volverse frágil.',
      process:['Blend formulado para nuestro método','Compatible con procesos de biga y masa madre','Pensado para fermentaciones prolongadas','Apertura manual y cocción intensa'],
      technical:[['Fuerza (W)','Publicaremos el valor cuando la ficha técnica esté validada.'],['Equilibrio P/L','Pendiente de validación técnica; no usamos un número estimado como argumento comercial.'],['Absorción','Se expresa mejor como rango de trabajo ligado al método; se documentará con pruebas reproducibles.'],['Fermentación','Diseñada para procesos prolongados; el rango final depende de temperatura, prefermento y receta.']]
    },
    'crea-la-tuya':{
      tag:'La parte difícil, resuelta',
      headline:'Nosotros hacemos el tiempo. Tú decides cómo termina.',
      summary:'Dos bases El Errante precocidas, con nuestra masa y tomate, listas para que el último capítulo ocurra en tu cocina.',
      promise:'Crea la Tuya no es una pizza incompleta. Es un producto diseñado deliberadamente para compartir el proceso. Antes de llegar a tu congelador ya ocurrieron formulación, prefermentos, fermentación, división, boleado, apertura, salsa y una primera cocción. Tú entras cuando empieza la parte más libre: elegir pocos ingredientes, equilibrar humedad y grasa, volver al fuego y terminar.',
      for_whom:'Para quien quiere cocinar en casa sin empezar una masa con uno o dos días de anticipación. Funciona especialmente bien para cenas espontáneas, familias y personas que disfrutan combinar lo que ya tienen en la nevera.',
      not_for:'Más ingredientes no significan una mejor pizza. Una base sobrecargada de queso, salsa o vegetales húmedos puede perder estructura y esconder el trabajo de la masa.',
      finish:'Precalienta el horno a su máxima temperatura, trabaja con ingredientes escurridos y bien porcionados, y reserva hojas frescas, aceites y reducciones para después del horno.',
      definition:'Pack de dos bases de pizza El Errante precocidas y congeladas para personalizar y terminar en casa.',
      seo_description:'Crea la Tuya: pack de bases El Errante precocidas para personalizar y terminar en casa con tus ingredientes.',
      story_title:'Una base puede ser una invitación, no un atajo.',
      story:'La mayoría de las casas no tiene un horno de 400 °C ni necesita tenerlo. Por eso resolvemos antes la etapa que depende de nuestro horno, nuestra masa y nuestros tiempos. El hogar aporta el último fuego y la decisión personal. El objetivo no es imitar exactamente el servicio de pizzería, sino trasladar una parte auténtica del proceso a una cocina doméstica de forma accesible.',
      sensory:'La base debe recuperar contraste al volver al horno: superficie seca y tostada, borde ligero y centro capaz de sostener el acabado sin volverse pesado.',
      process:['Masa fermentada por nosotros','Base abierta y precocida a alta temperatura','Tomate aplicado en proporción controlada','Congelada para terminar cuando tú decidas']
    },
    'margherita-del-taller':{
      tag:'Lo esencial, sin dónde esconderse',
      headline:'Una pizza simple no es una pizza fácil.',
      summary:'Tomate, mozzarella y albahaca. Pocos elementos para que se sientan la masa, la acidez, el lácteo, el perfume y el fuego.',
      promise:'La Margherita del Taller funciona como una prueba de honestidad. Cuando hay pocos ingredientes, cada error se vuelve visible: una salsa demasiado dulce, un queso con exceso de humedad, una masa plana o una cocción sin contraste. Por eso la mantenemos deliberadamente clara. No necesita una lista larga para resultar compleja; necesita proporción.',
      for_whom:'Para quien quiere conocer El Errante desde el fundamento y prefiere sabores limpios, equilibrados y reconocibles.',
      not_for:'No busca abundancia de queso ni una cobertura pesada. Su carácter está en el equilibrio entre masa, tomate, mozzarella, albahaca y aceite.',
      finish:'Devuélvela al fuego hasta que la base recupere tensión y el queso se funda sin secarse. Termina con albahaca fresca y aceite en poca cantidad.',
      definition:'Pizza de tomate, mozzarella y albahaca sobre masa El Errante de fermentación lenta.',
      seo_description:'Margherita del Taller de El Errante: tomate, mozzarella, albahaca y masa de fermentación lenta.',
      story_title:'Nuestra forma de medir lo esencial.',
      story:'Cuando probamos una masa nueva volvemos con frecuencia a combinaciones simples. El tomate muestra si hay balance de acidez; la mozzarella obliga a controlar humedad; la albahaca no tolera una cocción mal pensada; y la masa queda expuesta. Esa vulnerabilidad es precisamente lo que nos interesa.',
      sensory:'Acidez limpia, lácteo suave, albahaca fresca y un borde aromático. La sensación final debe ser ligera y suficientemente limpia para querer otro bocado.',
      process:['Masa de fermentación prolongada','Tomate en capa ligera','Mozzarella dosificada por humedad','Albahaca y aceite como acabado']
    },
    'diavola-errante':{
      tag:'Picante con dirección',
      headline:'El picante debe ampliar el sabor, no borrarlo.',
      summary:'Tomate, mozzarella y salame picante sobre una masa capaz de sostener grasa, especias y calor sin perder claridad.',
      promise:'En la Diavola la intensidad aparece por capas. El salame entrega grasa y especias; el tomate devuelve acidez; la mozzarella redondea; la masa sostiene. No perseguimos una escala de picante como espectáculo. Buscamos que el calor llegue, crezca y se retire dejando todavía reconocible el resto de la pizza.',
      for_whom:'Para quien disfruta un picante progresivo, sabroso y acompañado por ingredientes con carácter.',
      not_for:'No es una referencia neutra. La percepción de picante cambia de una persona a otra y debe elegirse sabiendo que el salame es protagonista.',
      finish:'Termina con hierbas o unas gotas de aceite después del horno. Evita salsas adicionales que compitan con el equilibrio original.',
      definition:'Pizza de tomate, mozzarella y salame picante sobre masa El Errante.',
      seo_description:'Diavola Errante: tomate, mozzarella y salame picante sobre masa El Errante, intensa y equilibrada.',
      story_title:'Intensidad sin ruido.',
      story:'El reto no es añadir picante; es decidir cuánto necesita la grasa del salame, cuánta acidez debe devolver el tomate y cuánto queso puede integrar el conjunto antes de volverlo pesado.',
      sensory:'Especias, grasa sabrosa, tomate vivo y calor progresivo. El final debe seguir teniendo masa y no únicamente picante.',
      process:['Salame como fuente de grasa y especias','Tomate para tensión y frescura','Mozzarella como puente','Acabado ligero después del horno']
    },
    'bosque':{
      tag:'Vegetal con profundidad',
      headline:'Los hongos no están aquí para reemplazar nada.',
      summary:'Hongos, quesos y aromáticas construyen una pizza terrosa, cremosa y profunda, pensada desde el umami y no desde la idea de “opción vegetariana”.',
      promise:'Bosque parte de tratar el ingrediente vegetal como protagonista. Los hongos aportan notas terrosas y umami; los quesos dan continuidad y grasa; las aromáticas levantan el conjunto. La humedad se controla para que la masa conserve estructura y el sabor no se convierta en una sola capa cremosa.',
      for_whom:'Para quien busca una pizza vegetal con presencia, profundidad y textura.',
      not_for:'No es una pizza de perfil tímido. Los hongos son protagonistas y su carácter terroso está deliberadamente presente.',
      finish:'Después del horno admite hierbas frescas y una línea muy fina de reducción balsámica. El acabado debe iluminar el umami, no endulzarlo.',
      definition:'Pizza vegetariana de hongos, quesos y aromáticas sobre masa El Errante.',
      seo_description:'Bosque: pizza vegetariana El Errante con hongos, quesos, aromáticas y profundidad de umami.',
      story_title:'Construir profundidad sin carne.',
      story:'Un ingrediente vegetal bien tratado no necesita disculpas ni sustitutos. El trabajo está en concentración, humedad, textura y temperatura. Bosque nace de esa idea.',
      sensory:'Terroso, lácteo y aromático, con un final largo y una acidez opcional muy medida.',
      process:['Hongos tratados como ingrediente central','Humedad controlada antes del montaje','Quesos para cuerpo, no para cubrir','Acabados ácidos solo después del fuego']
    },
    'cuatro-quesos-montana':{
      tag:'Cremosidad con arquitectura',
      headline:'Cuatro quesos no significan cuatro veces más queso.',
      summary:'Una composición donde cada queso cumple una función distinta de fundencia, cuerpo, maduración o contraste.',
      promise:'La dificultad de una cuatro quesos no está en reunir nombres, sino en evitar que todo termine sabiendo a una sola capa de grasa. Construimos la mezcla por función: qué funde, qué aporta cuerpo, qué introduce maduración y qué deja una nota más marcada. La masa y el fuego ponen el límite.',
      for_whom:'Para amantes del queso que prefieren complejidad y textura antes que exceso.',
      not_for:'No busca una cobertura desbordada. El equilibrio depende de la proporción, la humedad y el punto de fusión de cada queso.',
      finish:'Pimienta recién molida o una nota dulce mínima pueden ampliar el perfil. Prueba primero la pizza como fue formulada.',
      definition:'Pizza El Errante con cuatro perfiles de queso organizados por fundencia, cuerpo, maduración y contraste.',
      seo_description:'Cuatro Quesos Montaña: cuatro perfiles de queso equilibrados sobre masa El Errante.',
      story_title:'El queso también se formula.',
      story:'En un horno intenso, la humedad, la grasa y la maduración importan tanto como el sabor. Elegir el orden y la proporción de los quesos es parte de la cocción.',
      sensory:'Cremosa y láctea, con puntos más maduros y un final que debe sentirse amplio sin resultar pesado.',
      process:['Quesos elegidos por función','Humedad y fundencia consideradas en el montaje','Masa como contrapunto','Acabado mínimo para conservar definición']
    },
    'la-errante':{
      tag:'La pizza de la casa',
      headline:'Italia fue el punto de partida. Esta pizza ya habla desde aquí.',
      summary:'Chorizo artesanal, cebolla caramelizada, quesos y una reducción balsámica con panela y maracuyá: contraste, territorio y una firma propia.',
      promise:'La Errante resume nuestra manera de entender una receta de autor. El chorizo aporta profundidad y especias; la cebolla, dulzor y textura; los quesos, continuidad; y la reducción final corta la grasa con acidez balsámica, dulzor de panela y perfume de maracuyá. Ningún ingrediente está allí para decorar una historia: cada uno cambia el balance del bocado.',
      for_whom:'Para quien quiere probar la referencia que mejor explica hacia dónde puede viajar El Errante cuando deja de perseguir una copia y empieza a construir una voz propia.',
      not_for:'No es una pizza discreta ni una salsa de fruta. La reducción es balsámica y concentrada; aparece al final y en poca cantidad.',
      finish:'Calienta hasta recuperar base, borde y queso. Aplica la reducción en líneas finas justo antes de servir para conservar el contraste.',
      definition:'Pizza insignia con chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica de panela y maracuyá.',
      seo_description:'La Errante: chorizo artesanal, cebolla caramelizada, quesos y reducción balsámica con panela y maracuyá.',
      story_title:'Una receta que no intenta fingir otra geografía.',
      story:'Aprender una tradición no obliga a quedarse inmóvil dentro de ella. La Errante toma una masa y una lógica de cocción que respetamos profundamente, pero permite que ingredientes y contrastes cercanos construyan otra identidad.',
      sensory:'Especiada, dulce, láctea y ácida. El acabado de panela y maracuyá debe limpiar la grasa y prolongar el aroma, no convertir la pizza en un plato dulce.',
      process:['Masa como estructura de la receta','Chorizo y cebolla para profundidad y dulzor','Quesos como continuidad','Reducción aplicada únicamente al final']
    },
    'salsa-tomate':{
      tag:'La acidez que sostiene',
      headline:'El tomate no es un fondo rojo. Es uno de los sabores principales.',
      summary:'Tomate San Marzano trabajado por nosotros hasta encontrar una relación limpia entre acidez, dulzor, concentración y humedad.',
      promise:'Partimos de tomate San Marzano y trabajamos la salsa para que pueda convivir con una cocción intensa sin convertirse en un guiso ni inundar la masa. Buscamos conservar identidad de tomate, acidez y una textura fácil de dosificar. En una pizza con pocos ingredientes, el tomate no tiene dónde esconderse; por eso merece el mismo cuidado que la masa.',
      for_whom:'Para pizzas, focaccias y preparaciones al horno donde el tomate debe aportar frescura y equilibrio sin dominar.',
      not_for:'No está pensada para usarse como una capa gruesa. Más salsa significa también más humedad y puede cambiar la cocción de la base.',
      finish:'Extiende una capa ligera desde el centro hacia afuera y deja el borde libre. Ajusta cantidad antes de añadir más ingredientes húmedos.',
      definition:'Salsa El Errante elaborada a partir de tomate San Marzano para pizza y preparaciones al horno.',
      seo_description:'Salsa de tomate San Marzano El Errante, trabajada para pizza y preparaciones al horno con acidez y humedad equilibradas.',
      story_title:'Reducir no significa esconder el tomate.',
      story:'Buscamos concentración suficiente para controlar humedad y construir sabor, pero no una salsa pesada. La referencia sigue siendo el tomate: su acidez, su dulzor y la forma en que responde al fuego.',
      sensory:'Tomate claro, acidez viva, dulzor natural y una concentración que acompaña sin volverse pastosa.',
      process:['Tomate San Marzano como materia prima','Concentración controlada','Humedad pensada para la masa','Dosificación ligera']
    },
    'reduccion-balsamica':{
      tag:'Un acabado, no una cobertura',
      headline:'Pocas gotas pueden cambiar la lectura completa de una pizza.',
      summary:'Reducción balsámica concentrada para aportar acidez, profundidad y un dulzor medido al final del plato.',
      promise:'La reducción existe para intervenir con precisión. La acidez corta grasa y despierta sabores maduros; la concentración prolonga el final. Su función no es cubrir la pizza sino introducir contraste exactamente donde hace falta.',
      for_whom:'Para pizzas, quesos, vegetales, carnes, ensaladas y tablas que necesitan un punto ácido y profundo al terminar.',
      not_for:'No es salsa base. Su concentración exige dosificación y funciona mejor en gotas o líneas finas.',
      finish:'Añádela después del horno. Empieza con poco, prueba el conjunto y solo entonces decide si necesita más.',
      definition:'Reducción balsámica concentrada El Errante para terminar preparaciones con acidez y profundidad.',
      seo_description:'Reducción balsámica El Errante para terminar pizzas, quesos, vegetales y otras preparaciones con precisión.',
      story_title:'El último gesto también se formula.',
      story:'Cuando un acabado entra después del fuego conserva una capacidad distinta de modificar aroma, grasa y persistencia. Por eso preferimos tratarlo como una decisión final y no como una salsa abundante.',
      sensory:'Ácida, profunda, ligeramente dulce y persistente.',
      process:['Concentración para aumentar profundidad','Aplicación después del horno','Dosificación precisa','Pensada para contrastar grasa y maduración']
    },
    'panela-maracuya':{
      tag:'Una firma desde Colombia',
      headline:'Balsámico, panela y maracuyá: tres acideces y dulzores que necesitan medida.',
      summary:'Reducción balsámica endulzada con panela e infusionada con maracuyá, creada para aportar un final ácido, tostado y aromático.',
      promise:'La base balsámica aporta profundidad; la panela introduce un dulzor cálido y tostado; el maracuyá eleva el aroma y suma una acidez frutal reconocible. La formulación funciona cuando ninguna de las tres capas se impone por completo. No buscamos una mermelada ni una salsa tropical: buscamos un acabado.',
      for_whom:'Para pizzas, quesos, carnes y vegetales donde grasa, salinidad o maduración admiten un contraste ácido y aromático.',
      not_for:'No debe confundirse con una salsa de fruta ni utilizarse como cobertura abundante.',
      finish:'Aplica al final en líneas muy finas. En preparaciones grasas suele necesitar menos cantidad de la que parece.',
      definition:'Reducción balsámica endulzada con panela e infusionada con maracuyá.',
      seo_description:'Reducción balsámica El Errante con panela y maracuyá: acidez, dulzor tostado y aroma tropical en un acabado concentrado.',
      story_title:'El territorio puede aparecer en una gota.',
      story:'No necesitamos abandonar la técnica aprendida para acercarnos a ingredientes propios. A veces basta con cambiar el último gesto y dejar que panela y maracuyá conversen con una base balsámica.',
      sensory:'Ácido, tostado, frutal y balsámico, con un aroma de maracuyá más evidente que su dulzor.',
      process:['Base balsámica','Panela para dulzor cálido','Infusión de maracuyá','Aplicación posterior al horno']
    },
    'combo-primera-ruta':{
      tag:'Una primera lectura de la casa',
      headline:'No es un surtido. Es un recorrido.',
      summary:'Una selección para entender El Errante desde distintos niveles de participación: masa, pizza, terminado y despensa.',
      promise:'Primera Ruta organiza productos que normalmente se comprarían por separado como una pequeña secuencia gastronómica. La intención es que puedas reconocer qué cambia cuando haces más parte del proceso y qué cambia cuando nosotros resolvemos la complejidad antes de que el producto llegue a casa.',
      for_whom:'Para conocer la marca, regalar una experiencia o compartir una sesión de cocina con distintos niveles de participación.',
      not_for:'Cada componente puede tener condiciones distintas de conservación y uso. Revisa siempre la ficha y el empaque de cada producto.',
      finish:'Lee primero el recorrido completo, organiza el espacio y deja para el final los ingredientes frescos y las reducciones.',
      definition:'Selección de productos El Errante para recorrer masa, pizza en casa y acabados.',
      seo_description:'Primera Ruta de El Errante: selección para conocer masa, pizzas para casa y acabados de la despensa.',
      story_title:'Entender una marca probándola.',
      story:'La idea es sencilla: empezar por el proceso, pasar por el producto y terminar con el gesto final. Una ruta breve por las decisiones que sostienen nuestra cocina.',
      sensory:'Variable según la selección; el hilo común es el contraste entre masa, fuego y acabados.',
      process:['Preparar','Personalizar','Terminar','Compartir']
    }
  };

  for(const product of data.products||[]){
    if(products[product.id])Object.assign(product,products[product.id]);
  }

  data.settings={...(data.settings||{}),editorial_release:'v2.9-editorial-ux',editorial_version:VERSION};
  document.documentElement.dataset.eeEditorialVersion=VERSION;

  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function productNarrative(){
    if(!location.pathname.endsWith('producto.html'))return;
    const id=new URLSearchParams(location.search).get('id')||'';
    const product=(data.products||[]).find(item=>item.id===id);
    if(!product||!product.story)return;
    const root=document.querySelector('#dynamic-product');
    if(!root||root.querySelector('[data-v29-product-story]'))return;
    const process=(product.process||[]).map((item,index)=>`<article class="feature-card"><span class="intent-index">0${index+1}</span><p>${escapeHtml(item)}</p></article>`).join('');
    const technical=Array.isArray(product.technical)&&product.technical.length?`<section class="section section-paper"><div class="container"><div class="section-head"><div><p class="eyebrow">Ficha técnica</p><h2>Los números tienen que poder sostenerse.</h2></div><p>No publicamos especificaciones por semejanza con otra harina. Cada valor aparecerá cuando esté documentado para este producto.</p></div><div class="package-list">${product.technical.map(([name,value])=>`<div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(value)}</span></div>`).join('')}</div></div></section>`:'';
    root.insertAdjacentHTML('beforeend',`<div data-v29-product-story><section class="section"><div class="container split"><div><p class="eyebrow">Por qué existe</p><h2>${escapeHtml(product.story_title)}</h2><p class="lead" style="margin-top:22px">${escapeHtml(product.story)}</p><p>${escapeHtml(product.sensory||'')}</p></div><div><p class="eyebrow">Decisiones detrás del producto</p><div class="grid grid-2">${process}</div></div></div></section>${technical}<section class="section section-dark"><div class="container split"><div><p class="eyebrow" style="color:var(--wheat)">Antes de llevarlo</p><h2>Compra sabiendo qué parte del proceso es nuestra y cuál será tuya.</h2><p class="lead" style="margin-top:22px;color:rgba(242,236,225,.76)">${escapeHtml(product.finish||'Sigue las instrucciones específicas del empaque y ajusta únicamente después de observar el resultado.')}</p></div><div class="package-list" style="color:var(--carbon)"><div><strong>Ingredientes y alérgenos</strong><span>La etiqueta vigente es la fuente final para composición y alérgenos.</span></div><div><strong>Conservación</strong><span>Respeta siempre temperatura, vida útil y cadena de frío indicadas en el empaque.</span></div><div><strong>Disponibilidad</strong><span>Inventario, cobertura y fecha se confirman antes de preparar el pedido.</span></div></div></div></section></div>`);
  }

  const install=()=>{
    productNarrative();
    const root=document.querySelector('#dynamic-product');
    if(root)new MutationObserver(productNarrative).observe(root,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  window.EE_EDITORIAL_V29={version:VERSION,products};
})();
