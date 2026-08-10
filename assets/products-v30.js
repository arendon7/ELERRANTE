(()=>{
  'use strict';
  const D=window.EE_DATA;
  if(!D||!Array.isArray(D.products)) return;

  const v30={
    'margherita-del-taller':{
      territory:'Claridad',
      territory_key:'claridad',
      short_description:'Tomate, mozzarella y albahaca sobre una masa que no necesita esconderse.',
      sensory_promise:'Limpia, aromática y precisa: tomate y lácteo en equilibrio, con la masa todavía presente.',
      sensory_profile:{Acidez:'media',Lácteo:'medio',Frescura:'media-alta',Tostado:'medio',Intensidad:'baja-media'},
      best_for:'Una pizza esencial, limpia y reconocible.',
      workshop_question:'¿Qué ocurre cuando ya no tenemos dónde esconder un error?',
      workshop_decision:'La Margherita funciona como referencia porque obliga a leer cada elemento con especial claridad. No buscamos hacerla diferente agregando más ingredientes: el trabajo está en masa, tomate, humedad del queso, distribución, fuego y acabado.',
      craft_proof:{
        axis:'Humedad y exposición',
        problem:'Tomate y mozzarella contienen agua. En una pizza con pocos elementos, un centro húmedo, una base sin fijar o un lácteo sobrecocido se perciben de inmediato.',
        observation:'Leemos densidad del tomate, liberación de suero, expansión del borde y fijación de la base como un mismo problema. No basta con pesar ingredientes: importa cuándo y dónde entregan su agua.',
        decision:'La distribución deja respiraciones entre tomate, queso y masa. El objetivo es que el calor pueda evaporar, fundir y fijar estructura sin convertir el centro en una zona saturada.',
        result:'Buscamos que el tomate conserve acidez, el lácteo se sienta limpio y la base siga sosteniendo el bocado. Si algo falla, la sencillez lo revela.'
      },
      second_fire_focus:'Recuperar base y fundencia sin secar el lácteo ni convertir el centro en una zona húmeda y pesada.',
      second_fire_finish:'Los aromas frescos tienen sentido al final. La forma exacta de terminarlos depende de la presentación y de la instrucción vigente.',
      research_program:'MGH · Claridad',research_state:'desarrollo de canon',
      author_note:'La Margherita me interesa porque no concede demasiados lugares para distraer la atención. Si algo falla, queda expuesto.',
      home_enabled:true,second_fire_enabled:true
    },
    'la-errante':{
      territory:'Territorio',territory_key:'territorio',
      short_description:'Chorizo, cebolla y quesos con un final de panela y maracuyá.',
      sensory_promise:'Tostado y profundidad al comienzo; una acidez aromática aparece después para abrir el final.',
      sensory_profile:{Tostado:'alto',Umami:'alto',Grasa:'media-alta',Acidez:'media-alta',Dulzor:'bajo-medio'},
      best_for:'La pizza más representativa del lenguaje actual de El Errante.',
      workshop_question:'¿Cómo puede una técnica aprendida afuera empezar a hablar desde Colombia?',
      workshop_decision:'La dificultad de La Errante no está en conseguir intensidad, sino en gobernarla. Chorizo, cebolla y quesos concentran grasa, sal, umami y dulzor; el acabado de panela y maracuyá debe devolver aroma y acidez sin convertirse en protagonista.',
      craft_proof:{
        axis:'Ritmo entre grasa, dulzor y acidez',
        problem:'Chorizo, quesos y cebolla pueden acumular grasa, sal y dulzor muy rápido. El acabado de panela y maracuyá puede resolver esa persistencia o, si se excede, convertirse en otra capa de peso.',
        observation:'Miramos cómo cambia el paladar entre el primer y el cuarto bocado: cuánto permanece la grasa, cuándo aparece el dulzor y en qué momento una nota ácida vuelve a abrir la percepción.',
        decision:'La composición necesita zonas de intensidad y zonas de descanso. El chorizo no tiene que ocupar toda la superficie y el acabado funciona como puntuación final, no como cobertura.',
        result:'Buscamos un primer bocado profundo y un cuarto bocado todavía deseable: tostado, grasa, dulzor y acidez deben sentirse como una sola idea, no como cuatro capas compitiendo.'
      },
      second_fire_focus:'Integrar la grasa del chorizo sin prolongar el fuego hasta secar masa o embutido.',
      second_fire_finish:'El acabado ácido-dulce pertenece al final: debe limpiar persistencia y sumar aroma, no cubrir aquello que acaba de salir del horno.',
      research_program:'ERR · Territorio / Ritmo',research_state:'desarrollo y afinación',
      author_note:'No quiero que La Errante se recuerde como la pizza dulce ni como la pizza cargada. Quiero que chorizo, tostado y acidez terminen sintiéndose como una sola idea.',
      home_enabled:true,second_fire_enabled:true
    },
    'bosque':{
      territory:'Profundidad vegetal',territory_key:'profundidad',
      short_description:'Hongos, lácteo, ajo y aromáticas: profundidad vegetal, tostado y umami.',
      sensory_promise:'Carnosidad y notas terrosas al comienzo; un final más fresco para evitar que la profundidad se vuelva pesada.',
      sensory_profile:{Umami:'alto',Tostado:'alto',Cremosidad:'media',Frescura:'media',Acidez:'media'},
      best_for:'Una pizza vegetal intensa, terrosa y profundamente sabrosa.',
      workshop_question:'¿Hasta dónde puede llegar un ingrediente cuando dejamos de tratarlo como topping?',
      workshop_decision:'El hongo tiene una dificultad particular dentro de una pizza: buena parte de aquello que le da jugosidad también puede introducir suficiente agua para comprometer tostado y estructura. Antes de sumar más ingredientes, estudiamos cómo concentrar sabor y conservar textura frente al fuego.',
      craft_proof:{
        axis:'Agua y concentración',
        problem:'El hongo puede ser carnoso, aromático y profundamente umami, pero también puede liberar suficiente agua para convertir el horno en vapor y debilitar la estructura de la pizza.',
        observation:'Leemos dos cosas al mismo tiempo: cuánto sabor gana el hongo cuando concentra y cuánta humedad libre conserva antes de encontrarse con la masa. Vapor y tostado compiten por el mismo instante de cocción.',
        decision:'Priorizamos tratamientos que desarrollen concentración y tostado antes de pedirle al horno final que resuelva todo. El hongo entra por la función que ya construyó, no simplemente por volumen.',
        result:'Buscamos profundidad vegetal y carnosidad con una base todavía legible, sin un centro acuoso y sin necesitar carne, trufa o una lista extensa de ingredientes para crear intensidad.'
      },
      second_fire_focus:'Devolver tostado y temperatura sin reintroducir vapor al centro.',
      second_fire_finish:'El acabado debe aportar contraste sin devolver al hongo la humedad que se trabajó en controlar durante el proceso.',
      research_program:'BOS · Profundidad vegetal',research_state:'investigación activa',
      author_note:'No quiero que el hongo necesite carne, trufa o una lista extensa de ingredientes para demostrar profundidad. Quiero entender hasta dónde podemos llevarlo mediante producto y fuego.',
      home_enabled:true,second_fire_enabled:true
    },
    'diavola-errante':{
      territory:'Intensidad',territory_key:'intensidad',
      short_description:'Tomate, mozzarella y embutido picante en una intensidad que crece sin borrar la pizza.',
      sensory_promise:'Tomate y especias primero; calor progresivo después, con espacio para seguir percibiendo masa y producto.',
      sensory_profile:{Picante:'medio-alto',Tomate:'alto',Umami:'alto',Grasa:'media',Dulzor:'bajo'},
      best_for:'Picante con sabor, no una prueba de resistencia.',
      workshop_question:'¿Cuánto puede crecer la intensidad sin eliminar información?',
      workshop_decision:'El picante debe tener progresión y no aparecer como una capa uniforme que domina desde el primer segundo. Tipo de embutido, grosor, distribución y cantidad forman parte de esa curva.',
      craft_proof:{
        axis:'Curva de picante',
        problem:'El picante es acumulativo y la grasa del embutido ayuda a transportarlo. Una distribución uniforme puede hacer que la intensidad llegue demasiado pronto y borre tomate, masa y especias.',
        observation:'No medimos solo cuánto pica un ingrediente. Observamos cuándo aparece el calor, cuánto crece de un bocado al siguiente y cuánto espacio deja para seguir percibiendo el resto de la pizza.',
        decision:'La distribución crea picos y descansos. Grosor, cantidad y posición del embutido ordenan la curva; tomate y lácteo acompañan la intensidad sin convertirla en una experiencia plana.',
        result:'Buscamos sabor antes que ardor: tomate y especias primero, calor después y suficiente información todavía presente cuando el picante alcanza su punto más alto.'
      },
      second_fire_focus:'Activar grasa y aroma del embutido sin quemar especias ni volver plano el tomate.',
      second_fire_finish:'El objetivo no es maximizar picante con más cocción. La intensidad debe seguir desarrollándose en boca después de salir del horno.',
      research_program:'DIA · Intensidad',research_state:'composición en desarrollo',
      author_note:'Me interesa que después de que aparezca el picante todavía podamos entender la pizza.',
      home_enabled:true,second_fire_enabled:true
    },
    'cuatro-quesos-montana':{
      territory:'Arquitectura láctea',territory_key:'arquitectura',
      short_description:'Cuatro expresiones lácteas pensadas para fundir, dar cuerpo, madurar y contrastar sin esconder la masa.',
      sensory_promise:'Cremosidad y maduración con una salida suficientemente limpia para que la abundancia conserve estructura.',
      sensory_profile:{Cremosidad:'alta',Umami:'alto',Salinidad:'media-alta','Intensidad láctea':'alta','Salida / acidez':'media'},
      best_for:'Queso como protagonista, pero con estructura y contraste.',
      workshop_question:'¿Cómo puede la abundancia conservar claridad?',
      workshop_decision:'No buscamos maximizar la cantidad de queso. Buscamos que distintas funciones lácteas puedan percibirse sin saturar la masa. El queso más intenso puede necesitar aparecer solo en puntos; el espacio también forma parte de la composición.',
      craft_proof:{
        axis:'Fundencia, grasa y espacio',
        problem:'Cuatro quesos pueden convertirse con facilidad en una sola capa grasa y salada. Cada lácteo trae distinta humedad, fundencia, intensidad y capacidad de separar grasa bajo el fuego.',
        observation:'Leemos qué queso funde, cuál aporta cuerpo, cuál introduce maduración y cuál debe aparecer como contraste. También observamos dónde empieza a separarse la grasa y cuándo la masa deja de percibirse.',
        decision:'Asignamos funciones antes que cantidades. Los quesos más intensos pueden trabajar en puntos y el espacio entre ellos forma parte de la receta: no toda la superficie necesita estar cubierta.',
        result:'Buscamos una secuencia láctea reconocible —fundencia, cuerpo, maduración y contraste— con suficiente aire para que la masa siga participando del bocado.'
      },
      second_fire_focus:'Fundir otra vez sin separar exceso de grasa ni borrar las distintas funciones de los quesos.',
      second_fire_finish:'El punto final busca cohesión y brillo, no una capa uniforme llevada al máximo de gratinado.',
      research_program:'QSO · Arquitectura láctea',research_state:'formulación abierta',
      author_note:'La abundancia también necesita espacio. Si todo está cubierto, dejamos de percibir diferencias.',
      home_enabled:true,second_fire_enabled:true,
      canon_note:'La selección exacta de los cuatro quesos y el uso del descriptor de Montaña permanecen sujetos a validación del producto y su procedencia.'
    }
  };

  D.products.forEach(product=>{
    if(v30[product.id]) Object.assign(product,v30[product.id],{editorial_version:'3.0',product_detail_release:'3.0.2'});
  });
  D.settings={...(D.settings||{}),editorial_release:'v3.0-authority-candidate',product_detail_release:'v3.0.2-pruebas-de-oficio',author:'Juan David Ocampo',author_role:'Chef · Director gastronómico de El Errante'};
  document.documentElement.dataset.eeEditorialVersion='3.0';
  document.documentElement.dataset.eeProductDetailVersion='3.0.2';
  document.dispatchEvent(new CustomEvent('ee:v30-products-ready',{detail:{count:Object.keys(v30).length,productDetailRelease:'3.0.2'}}));
})();