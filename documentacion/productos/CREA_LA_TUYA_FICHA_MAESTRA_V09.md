# Crea la Tuya — Ficha Maestra de Producto v0.9

## Estado del documento

- **Producto:** Crea la Tuya.
- **ID:** `crea-la-tuya`.
- **Rol:** producto plataforma de personalización.
- **Ola propuesta:** núcleo del piloto.
- **Estado:** en revisión humana.
- **Fuente:** baseline integral v0.4 + narrativa comercial v0.6.1.
- **Advertencia:** tamaños, tiempos, precios, inventario y vida útil permanecen provisionales hasta validación documentada.

## 1. Función dentro de la marca

Crea la Tuya debe ser la forma más accesible de participar en El Errante sin empezar desde harina ni limitarse a recalentar una pizza completamente terminada.

Su función es:

- reducir la barrera de entrada;
- permitir creatividad sin trasladar al cliente la parte más difícil del proceso;
- conectar masa, tomate, personalización y acabado;
- funcionar en airfryer y horno doméstico;
- generar contenido de combinaciones, límites y técnicas;
- facilitar una primera compra de menor precio que una pizza completa.

## 2. Definición actual

Producto congelado compuesto por dos bases de masa fermentada, abiertas, cubiertas con salsa de tomate y aromáticas, y precocidas. El cliente agrega queso e ingredientes, realiza la cocción final y aplica el acabado.

### Incluye

- masa formulada por El Errante;
- salsa de tomate;
- aromáticas;
- precocción;
- dos unidades por empaque.

### No incluye

- queso;
- ingredientes finales;
- acabado obligatorio;
- garantía de resultado sin precalentamiento y dosificación adecuados.

### Diferencia frente a una base vacía

No debe comunicarse como un disco neutro. La masa ya fue fermentada, abierta y precocida; el tomate y las aromáticas sitúan al cliente en el momento creativo del proceso.

## 3. Promesa comercial

> Nosotros hacemos la parte difícil. Tú decides cómo termina.

### Afirmaciones permitidas como base

- se entrega precocida y congelada;
- incluye tomate y aromáticas;
- requiere queso, ingredientes y cocción final;
- tiene formatos orientados a airfryer y horno;
- permite personalizar dos pizzas dentro del mismo empaque.

### Afirmaciones sujetas a prueba

- tiempo exacto de cocción por equipo;
- compatibilidad universal con cualquier airfryer;
- diámetro y capacidad útil de cada formato;
- resultado “crujiente” o “igual a horno profesional”;
- vida útil;
- preparación directamente congelada en todas las condiciones;
- rendimiento y porciones.

## 4. Arquitectura de variantes

| SKU | Formato actual | Precio demo | Stock demo | Propuesta v0.9 | Decisión pendiente |
|---|---|---:|---:|---|---|
| `EE-CTM-02` | Mediana ×2 · airfryer | $15.000 | 28 | Formato de entrada | Confirmar diámetro, peso, compatibilidad y costo |
| `EE-CTG-02` | Grande ×2 · horno | $22.000 | 20 | Formato doméstico principal | Confirmar diámetro, peso, empaque y precio |

### Decisión estratégica

Debe evaluarse si el piloto inicia con ambos formatos o con uno solo. Dos formatos amplían cobertura de equipos, pero duplican empaque, instrucciones, control de inventario y riesgo de confusión.

## 5. Especificación técnica pendiente

Para cada formato se debe registrar:

- diámetro antes y después de precocción;
- peso de masa;
- peso de salsa;
- cantidad y tipo de aromáticas;
- espesor objetivo;
- grado de fermentación;
- temperatura y tiempo de precocción;
- pérdida de peso;
- temperatura antes de congelar;
- método y velocidad de congelación;
- tolerancias de forma;
- criterio de base, borde y estructura;
- vida útil;
- lote y trazabilidad.

## 6. Preparación y experiencia

### Flujo que debe validar el producto

1. El cliente precalienta completamente el equipo.
2. Retira el producto del empaque.
3. Agrega queso e ingredientes.
4. Cocina hasta recuperar base, borde y cobertura.
5. Aplica acabado después del horno cuando corresponda.

### Decisiones por equipo

#### Airfryer

- dimensiones mínimas de canasta;
- temperatura;
- precalentamiento;
- tiempo;
- uso de rejilla, papel o superficie;
- posición;
- cantidad máxima de ingredientes;
- control de queso y borde.

#### Horno doméstico

- temperatura máxima recomendada;
- piedra, acero, bandeja o rejilla;
- posición en el horno;
- tiempo;
- giro;
- señales de base y borde;
- acabado final.

### Límites de personalización

La guía debe explicar:

- peso máximo de queso;
- número o peso de ingredientes;
- ingredientes que requieren cocción previa;
- ingredientes con exceso de humedad;
- carnes que no deben agregarse crudas;
- momento correcto de hierbas, aceites y reducciones;
- errores que saturan o humedecen la base.

## 7. Conservación y vida útil

### Estado actual

- mantener congelada;
- no recongelar después de descongelación completa.

### Debe validarse

- temperatura de congelación y transporte;
- tiempo máximo fuera de congelación;
- vida útil cerrada;
- estabilidad del tomate y aromáticas;
- pérdida de textura;
- quemadura por frío;
- integridad de empaque;
- comportamiento después de fluctuaciones controladas;
- criterios de rechazo;
- tratamiento de producto parcialmente descongelado.

## 8. Empaque

### Funciones obligatorias

- evitar deshidratación y quemadura por frío;
- proteger forma y borde;
- separar las dos unidades;
- permitir apilamiento;
- resistir ruta y manipulación;
- mostrar formato y equipo recomendado;
- incluir preparación visible;
- conservar lote y fecha.

### Opciones a evaluar

- bolsa sellada con separador y soporte;
- bandeja o cartón con bolsa barrera;
- empaque individual dentro de un conjunto;
- caja exterior para protección y narrativa.

### Decisiones

- ¿las dos unidades van separadas individualmente?;
- ¿el cliente puede usar una y conservar otra?;
- ¿el soporte entra al horno o debe retirarse?;
- ¿qué material soporta frío sin quebrarse?;
- ¿cómo se diferencia mediana de grande?;
- ¿qué costo y volumen logístico agrega el empaque?

## 9. Etiqueta y sanitario

Debe incluir, cuando corresponda:

- denominación clara del producto;
- estado precocido y congelado;
- contenido y número de unidades;
- peso neto;
- ingredientes;
- trigo, gluten y demás alérgenos;
- lote y fechas;
- temperatura de conservación;
- instrucciones;
- advertencia de no recongelación cuando aplique;
- responsable y contacto;
- información nutricional y requisitos aplicables.

La frase “lista para hornear” debe evitar confundir al cliente sobre la necesidad de agregar queso e ingredientes.

## 10. Costeo y precio

Los precios actuales de $15.000 y $22.000 son valores de demostración.

El costo debe incorporar:

- masa;
- salsa y aromáticas;
- fermentación;
- apertura;
- precocción;
- energía;
- enfriamiento;
- congelación;
- separadores;
- empaque;
- etiqueta;
- mano de obra;
- merma;
- almacenamiento congelado;
- ruta fría;
- comisión de canal.

### Preguntas económicas

- ¿el formato mediano tiene margen suficiente después de frío y entrega?;
- ¿dos unidades son la mejor composición?;
- ¿debe venderse solo, en combo o con Despensa?;
- ¿cuál es el costo de permitir dos preparaciones distintas?;
- ¿el formato grande compite demasiado cerca de una pizza completa?

## 11. Operación

### Flujo propuesto

1. Preparación y fermentación de masa.
2. División y boleado.
3. Apertura por formato.
4. Aplicación de tomate y aromáticas.
5. Precocción.
6. Enfriamiento controlado.
7. Inspección.
8. Congelación.
9. Empaque y lote.
10. Almacenamiento.
11. Preparación de ruta fría.

### Indicadores

- unidades por lote;
- roturas o deformaciones;
- variación de diámetro;
- merma;
- tiempo hasta congelación;
- uso de espacio en congelador;
- devoluciones;
- desempeño por equipo del cliente.

## 12. Contenido y conversión

Crea la Tuya debe sostener un sistema de contenido práctico:

- cinco combinaciones básicas;
- guía de ingredientes húmedos;
- guía de quesos;
- airfryer frente a horno;
- errores frecuentes;
- acabados después del horno;
- actividad para niños o familia, si la operación lo permite;
- personalización para reuniones;
- relación con salsa y reducciones.

### Rutas de compra

- Crea la Tuya + queso sugerido por el cliente.
- Crea la Tuya + Panela y maracuyá.
- Crea la Tuya + reducción balsámica.
- Combo Primera Ruta.
- Recompra con recetas estacionales.

## 13. Fotografía requerida

1. Empaque cerrado.
2. Dos unidades dentro del empaque.
3. Producto congelado sin ingredientes.
4. Aplicación de queso e ingredientes.
5. Formato dentro de airfryer.
6. Formato dentro de horno.
7. Resultado terminado.
8. Dos personalizaciones distintas.
9. Base y borde.
10. Comparación visual de mediana y grande.

## 14. Riesgos

- base quebrada en transporte;
- quemadura por frío;
- exceso de humedad del cliente;
- airfryer demasiado pequeña;
- confusión entre precocida y lista para comer;
- resultado deficiente por falta de precalentamiento;
- margen insuficiente en formato pequeño;
- empaque voluminoso;
- proliferación de combinaciones difíciles de soportar;
- instrucciones demasiado generales.

## 15. Puertas y estado

| Puerta | Estado | Evidencia pendiente |
|---|---|---|
| Concepto y rol | Aprobado base | Ratificación de dirección |
| Narrativa comercial | Aprobado base | Validación con producto físico |
| Fórmula | En revisión | Gramajes y proceso por formato |
| Precocción | Pendiente | Tiempos, temperaturas y señales |
| Congelación | Pendiente | Protocolo y estabilidad |
| Instrucciones | En revisión | Pruebas por equipos reales |
| Costo | Pendiente | Costeo completo |
| Precio | Provisional demo | Margen y posicionamiento |
| Empaque | Pendiente | Prototipo y prueba de frío/ruta |
| Etiqueta | Pendiente | Arte y revisión aplicable |
| Vida útil | Pendiente | Pruebas y criterios |
| Capacidad | Pendiente | Lotes y congelación |
| Cobertura | Provisional demo | Ruta fría real |
| Fotografía física | Pendiente | Sesión con ambos formatos |
| Aprobación final | Pendiente | Acta fechada |

## 16. Decisiones para la próxima sesión

1. ¿Se mantienen dos formatos en el piloto?
2. ¿Cuál es el diámetro y peso real de cada unidad?
3. ¿Qué equipo y tamaños de airfryer se probaron?
4. ¿Se cocina directamente congelada?
5. ¿Cuál es el grado exacto de precocción?
6. ¿Qué peso máximo de ingredientes se recomienda?
7. ¿Cómo se empacan y separan las dos unidades?
8. ¿Cuál es la vida útil respaldada?
9. ¿Cuál es el costo real de cada formato?
10. ¿Qué variante debe ser la principal en la tienda?

## Criterio de aprobación para piloto

Crea la Tuya solo pasa a `piloto aprobado` cuando al menos una variante tiene fórmula, tamaño, precocción, congelación, instrucciones, empaque, costo, precio, vida útil, capacidad y cobertura documentados, y ha sido probada en equipos domésticos reales sin depender de supuestos generales.
