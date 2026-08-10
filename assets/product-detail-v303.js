(()=>{
  'use strict';
  const D=window.EE_DATA;
  if(!D||!Array.isArray(D.products))return;

  const provisional=(value,note='Dato de trabajo pendiente de validación en ficha técnica final.')=>({value,status:'provisional',note});
  const confirmed=(value,note='Respaldado por la definición vigente del producto.')=>({value,status:'confirmed',note});
  const label=(value,note='La etiqueta y el lote vigente prevalecen sobre esta ficha editorial.')=>({value,status:'label',note});

  const details={
    'margherita-del-taller':{
      product_detail_release:'3.0.3',
      arrival:'Pizza precocida y congelada de tomate, mozzarella y queso madurado. El acabado de albahaca y aceite debe seguir la presentación e instrucción vigente.',
      composition:[
        {name:'Masa',role:'Estructura, fermentación y soporte del bocado.'},
        {name:'Tomate',role:'Acidez, concentración y humedad.'},
        {name:'Mozzarella + queso madurado',role:'Fundencia, cuerpo y continuidad láctea.'},
        {name:'Albahaca + aceite',role:'Aroma y acabado después del fuego, cuando corresponda.'}
      ],
      passport:[
        ['Presentación',confirmed('Pizza precocida y congelada · 1 unidad','La unidad completa es la presentación de trabajo actual; el empaque comercial final sigue en validación.')],
        ['Diámetro',provisional('≈ 28–30 cm')],
        ['Peso neto',provisional('≈ 350 g','Referencia de maquetación y desarrollo. Debe reemplazarse por peso final medido y tolerancia de producción.')],
        ['Porciones',provisional('≈ 1–2 personas','Referencia de servicio, no declaración nutricional.')],
        ['Alérgenos',confirmed('Trigo/gluten y leche','Confirmados por la composición base; revisar siempre subingredientes y etiqueta final.')],
        ['Conservación',label('Mantener congelada','Temperatura exacta, vida útil y manejo fuera de frío deben provenir de la etiqueta validada.')]
      ],
      service:{
        before:'Mantén la pizza congelada hasta el momento indicado por el empaque y precalienta bien el horno antes de comenzar.',
        fire:'Busca una base firme, un centro completamente caliente y queso fundido con brillo, sin llevar el lácteo a sequedad.',
        finish:'Albahaca fresca y aceite pertenecen al final cuando la presentación vigente los contemple. Reposa brevemente antes de cortar.'
      },
      ready_signals:[
        ['Base','Firme y recuperada, sin sensación húmeda en el centro.'],
        ['Lácteo','Fundido y brillante; no reseco ni separado en exceso.'],
        ['Tomate','Caliente y vivo, sin acumulaciones de agua libre.'],
        ['Final','Aroma fresco y un bocado suficientemente limpio para querer continuar.']
      ]
    },
    'la-errante':{
      product_detail_release:'3.0.3',
      arrival:'Pizza precocida y congelada con tomate, quesos, chorizo y cebolla caramelizada. El acabado balsámico de panela y maracuyá pertenece al final y su forma de entrega continúa en validación.',
      composition:[
        {name:'Masa',role:'Estructura para sostener una receta de mayor intensidad.'},
        {name:'Chorizo + quesos',role:'Grasa, especias, umami y profundidad.'},
        {name:'Cebolla caramelizada',role:'Dulzor, textura y continuidad.'},
        {name:'Balsámico · panela · maracuyá',role:'Acidez y aroma para abrir el final del bocado.'}
      ],
      passport:[
        ['Presentación',confirmed('Pizza precocida y congelada · 1 unidad','La ficha maestra vigente registra una pizza completa; la arquitectura final del acabado y empaque sigue abierta.')],
        ['Diámetro',provisional('≈ 28–30 cm')],
        ['Peso neto',provisional('≈ 420 g','Referencia de desarrollo para una pizza con mayor carga de ingredientes. Debe sustituirse por peso real y tolerancia de lote.')],
        ['Porciones',provisional('≈ 1–2 personas','Referencia de servicio, no declaración nutricional.')],
        ['Alérgenos',label('Trigo/gluten y leche · otros según chorizo y subingredientes','Trigo/gluten y leche son base conocida; la ficha del proveedor del chorizo y la etiqueta final pueden añadir otros alérgenos.')],
        ['Conservación',label('Mantener congelada','Temperatura exacta, vida útil, cadena de frío y no recongelación deben seguir la etiqueta/lote vigente.')]
      ],
      service:{
        before:'Mantén congelada según empaque y precalienta bien el horno. Reserva el acabado ácido-dulce para después del fuego cuando llegue separado.',
        fire:'La señal no es dorar al máximo: busca base recuperada, centro completamente caliente, queso fundido y chorizo aromático sin resecar.',
        finish:'Aplica el acabado en líneas finas. Debe cortar persistencia y sumar aroma, no convertir la pizza en una cobertura dulce.'
      },
      ready_signals:[
        ['Base','Sostiene el peso del bocado sin volverse rígida.'],
        ['Chorizo','Grasa activada y aroma presente, sin zonas secas o quemadas.'],
        ['Queso','Fundido e integrado con la cebolla, sin exceso de separación grasa.'],
        ['Final','El maracuyá y el balsámico aparecen después, devolviendo deseo de otro bocado.']
      ]
    },
    'bosque':{
      product_detail_release:'3.0.3',
      arrival:'Pizza precocida y congelada de hongos, quesos, ajo y aromáticas. El trabajo principal está en conservar profundidad vegetal sin devolver humedad libre al centro.',
      composition:[
        {name:'Masa',role:'Estructura y contraste frente a ingredientes húmedos.'},
        {name:'Hongos',role:'Umami, carnosidad, tostado y profundidad vegetal.'},
        {name:'Quesos + ajo',role:'Cuerpo, grasa y continuidad aromática.'},
        {name:'Aromáticas / acabado',role:'Frescura y contraste al final, según formulación vigente.'}
      ],
      passport:[
        ['Presentación',confirmed('Pizza precocida y congelada · 1 unidad','Definición comercial de trabajo para la línea En Casa; empaque final pendiente de cierre.')],
        ['Diámetro',provisional('≈ 28–30 cm')],
        ['Peso neto',provisional('≈ 390 g','Referencia de desarrollo. Debe validarse tras cerrar tratamiento y gramaje de hongos.')],
        ['Porciones',provisional('≈ 1–2 personas','Referencia de servicio, no declaración nutricional.')],
        ['Alérgenos',confirmed('Trigo/gluten y leche','Confirmados por masa y lácteos; la etiqueta final debe revisar todos los subingredientes.')],
        ['Conservación',label('Mantener congelada','Temperatura exacta y vida útil están pendientes de evidencia de estabilidad y deben venir de etiqueta/lote.')]
      ],
      service:{
        before:'Mantén congelada según empaque y precalienta bien el horno. No añadas ingredientes húmedos antes de probar la formulación tal como fue diseñada.',
        fire:'Busca recuperar tostado y temperatura sin prolongar el horno hasta convertir el hongo en una fuente de vapor o secar la masa.',
        finish:'Si la referencia incluye hierbas o contraste ácido, incorpóralos al final y con medida para conservar la concentración del hongo.'
      },
      ready_signals:[
        ['Base','Firme y legible bajo una cobertura de mayor humedad potencial.'],
        ['Hongos','Calientes, aromáticos y concentrados; no acuosos.'],
        ['Queso','Fundido como soporte del hongo, no como capa dominante.'],
        ['Final','Terroso y profundo, pero con salida suficientemente fresca.']
      ]
    },
    'diavola-errante':{
      product_detail_release:'3.0.3',
      arrival:'Pizza precocida y congelada de tomate, mozzarella y embutido picante. La intensidad está pensada para crecer en boca sin convertir todo el perfil en ardor.',
      composition:[
        {name:'Masa',role:'Estructura y pausa frente a grasa y picante.'},
        {name:'Tomate',role:'Acidez y tensión para mantener definición.'},
        {name:'Mozzarella',role:'Fundencia e integración.'},
        {name:'Embutido picante',role:'Grasa, especias, umami y curva de calor.'}
      ],
      passport:[
        ['Presentación',confirmed('Pizza precocida y congelada · 1 unidad','Presentación de trabajo para En Casa; el cierre de empaque sigue pendiente.')],
        ['Diámetro',provisional('≈ 28–30 cm')],
        ['Peso neto',provisional('≈ 390 g','Referencia de desarrollo hasta cerrar gramaje y proveedor del embutido.')],
        ['Porciones',provisional('≈ 1–2 personas','Referencia de servicio, no declaración nutricional.')],
        ['Alérgenos',label('Trigo/gluten y leche · otros según embutido','La especificación final del proveedor del embutido puede introducir alérgenos adicionales.')],
        ['Conservación',label('Mantener congelada','Temperatura exacta, vida útil y manejo deben seguir la etiqueta/lote vigente.')]
      ],
      service:{
        before:'Mantén congelada según empaque y precalienta bien el horno. No añadas picante adicional antes de conocer la curva de la formulación.',
        fire:'Busca base recuperada, centro completamente caliente y grasa del embutido activada sin quemar especias ni secar sus bordes.',
        finish:'Deja que la intensidad termine de desarrollarse en boca. Un acabado fresco o aromático solo debe abrir el perfil, no competir con él.'
      },
      ready_signals:[
        ['Base','Suficiente tensión para dar descanso entre zonas de intensidad.'],
        ['Tomate','Todavía reconocible antes de que aparezca el calor.'],
        ['Embutido','Aromático y jugoso, sin bordes carbonizados.'],
        ['Final','Picante progresivo con información de masa, tomate y especias todavía presente.']
      ]
    },
    'cuatro-quesos-montana':{
      product_detail_release:'3.0.3',
      arrival:'Pizza precocida y congelada construida alrededor de cuatro funciones lácteas: fundencia, cuerpo, maduración y contraste. La selección exacta de quesos permanece abierta hasta su validación final.',
      composition:[
        {name:'Masa',role:'Contrapunto y estructura frente a la riqueza láctea.'},
        {name:'Queso de fundencia',role:'Cohesión y textura.'},
        {name:'Queso de cuerpo / maduración',role:'Profundidad, umami y persistencia.'},
        {name:'Queso de contraste',role:'Puntos de mayor intensidad sin cubrir toda la superficie.'}
      ],
      passport:[
        ['Presentación',confirmed('Pizza precocida y congelada · 1 unidad','Presentación de trabajo; la mezcla final de quesos y el descriptor “de Montaña” siguen sujetos a validación.')],
        ['Diámetro',provisional('≈ 28–30 cm')],
        ['Peso neto',provisional('≈ 410 g','Referencia de desarrollo. Debe reemplazarse al cerrar mezcla, gramajes y tolerancias.')],
        ['Porciones',provisional('≈ 1–2 personas','Referencia de servicio, no declaración nutricional.')],
        ['Alérgenos',confirmed('Trigo/gluten y leche','Confirmados por masa y quesos; la etiqueta final debe considerar todos los subingredientes.')],
        ['Conservación',label('Mantener congelada','Temperatura exacta y vida útil dependen de validación de formulación, congelación y empaque.')]
      ],
      service:{
        before:'Mantén congelada según empaque y precalienta bien el horno. Evita sumar más queso antes de probar el equilibrio formulado.',
        fire:'El objetivo es recuperar fundencia y temperatura sin llevar la mezcla a separación excesiva de grasa ni a un gratinado uniforme.',
        finish:'Reposa brevemente. Pimienta, hierbas o una nota dulce solo tienen sentido si amplían el perfil sin ocultar las distintas funciones lácteas.'
      },
      ready_signals:[
        ['Base','Sigue presente y sostiene la riqueza láctea.'],
        ['Fundencia','Quesos cohesionados sin una piscina extensa de grasa separada.'],
        ['Contraste','Todavía se perciben zonas y funciones distintas, no una sola capa salada.'],
        ['Final','Cremoso y persistente, pero con suficiente aire para seguir comiendo.']
      ]
    }
  };

  let applied=0;
  for(const product of D.products){
    const detail=details[product.id];
    if(!detail)continue;
    Object.assign(product,detail);
    applied+=1;
  }
  D.settings={...(D.settings||{}),product_detail_release:'v3.0.3-producto-premium-ficha'};
  document.documentElement.dataset.eeProductDetailVersion='3.0.3';
  window.EE_PRODUCT_DETAIL_V303=Object.freeze({version:'3.0.3',count:applied,details});
  document.dispatchEvent(new CustomEvent('ee:v303-product-detail-ready',{detail:{count:applied}}));
})();