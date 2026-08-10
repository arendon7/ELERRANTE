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
      research_program:'QSO · Arquitectura láctea',research_state:'formulación abierta',
      author_note:'La abundancia también necesita espacio. Si todo está cubierto, dejamos de percibir diferencias.',
      home_enabled:true,second_fire_enabled:true,
      canon_note:'La selección exacta de los cuatro quesos y el uso del descriptor de Montaña permanecen sujetos a validación del producto y su procedencia.'
    }
  };

  D.products.forEach(product=>{
    if(v30[product.id]) Object.assign(product,v30[product.id],{editorial_version:'3.0'});
  });
  D.settings={...(D.settings||{}),editorial_release:'v3.0-authority-candidate',author:'Juan David Ocampo',author_role:'Chef · Director gastronómico de El Errante'};
  document.documentElement.dataset.eeEditorialVersion='3.0';
  document.dispatchEvent(new CustomEvent('ee:v30-products-ready',{detail:{count:Object.keys(v30).length}}));
})();
