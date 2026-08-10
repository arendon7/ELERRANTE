# CANON DE FICHA DE PRODUCTO · V3.0.3

**Estado:** candidato editorial sobre CANON_EDITORIAL_V30 V3.0.2  
**Ámbito:** cinco pizzas V3 · Margherita del Taller · La Errante · Bosque · Diavola Errante · Cuatro Quesos de Montaña

## 1. Objetivo

La ficha debe permitir que una persona quiera comer la pizza, entienda qué está comprando y pueda reconocer las decisiones gastronómicas que sostienen el producto sin confundir narrativa editorial con especificación operacional.

Orden de lectura recomendado:

1. **Deseo:** producto, imagen, nombre, promesa y compra.
2. **Qué llega:** definición concreta de la referencia.
3. **Composición:** ingredientes explicados por función gastronómica.
4. **Pasaporte:** presentación, formato, peso, porciones, alérgenos y conservación.
5. **Lectura práctica:** señales de base, centro, cobertura y acabado.
6. **Prueba de oficio:** problema → observación → decisión → resultado.
7. **Método / Segundo Fuego:** por qué la pizza está diseñada de esa manera.

La ficha no debe convertirse en una hoja técnica antes de haber mostrado comida.

## 2. Tres estados de dato

Todo dato que todavía no sea completamente canónico debe expresar su estado de forma visible.

### Confirmado

Dato respaldado por la definición o documentación vigente del producto.

Etiqueta UI: `Confirmado`.

### Por validar

Referencia de trabajo utilizada para completar prototipo, maquetación o desarrollo mientras se obtiene la medición o ficha final.

Etiqueta UI: `Por validar`.

Reglas:

- utilizar `≈`, un rango o una formulación explícitamente aproximada;
- añadir una nota que explique qué evidencia falta;
- no convertir el valor provisional en claim comercial, etiqueta, costo estándar ni dato maestro;
- reemplazarlo cuando exista medición aprobada.

### Etiqueta / lote

Dato cuya última palabra corresponde a etiqueta, lote, fórmula aprobada, especificación sanitaria o proveedor vigente.

Etiqueta UI: `Etiqueta / lote`.

## 3. Qué sí puede aproximarse públicamente

Mientras esté inequívocamente marcado `Por validar`, V3.0.3 puede utilizar referencias de desarrollo para:

- diámetro;
- peso neto aproximado;
- número orientativo de porciones;
- formato físico todavía pendiente de cierre.

Estos valores existen para evitar una ficha incompleta, no para fingir una especificación cerrada.

## 4. Qué no debe inventarse

No utilizar aproximaciones editoriales como sustituto de evidencia para:

- vida útil;
- fecha de vencimiento;
- temperatura obligatoria de almacenamiento;
- tiempo máximo fuera de cadena de frío;
- tabla nutricional;
- información sanitaria;
- alérgenos no verificados;
- instrucciones universales de cocción cuando puedan variar por lote, formulación o equipo;
- proveedor u origen no confirmado.

En estos casos debe decirse qué se conoce y remitir a `Etiqueta / lote` para el dato operativo final.

## 5. Preparación y Segundo Fuego

La ficha editorial puede enseñar **señales culinarias de punto**: base recuperada, centro caliente, fundencia, humedad libre, separación de grasa, tostado, aroma y momento del acabado.

No debe reemplazar las instrucciones del empaque con un cronómetro editorial.

Regla:

> La etiqueta indica qué hacer. La ficha ayuda a entender qué mirar.

## 6. Composición por función

Los ingredientes pueden organizarse por su función: estructura, humedad, acidez, grasa, fundencia, umami, aroma, contraste o acabado.

La función gastronómica no sustituye la lista legal de ingredientes y subingredientes.

## 7. Alérgenos

Para las pizzas de esta iteración pueden mostrarse como base conocida `trigo/gluten` y `leche` cuando estén presentes en la definición vigente.

Cuando un embutido, salsa, reducción, queso compuesto u otro ingrediente dependa de especificación de proveedor, la ficha debe advertir que pueden existir alérgenos adicionales y que la etiqueta final prevalece.

## 8. Valores provisionales V3.0.3

Los valores incluidos en `assets/product-detail-v303.js` son deliberadamente provisionales donde así se marca. En particular, los pesos y diámetros no ingresan a Datos Maestros V1.3, costeo, inventario, etiqueta ni producción por el solo hecho de aparecer en la ficha pública.

Regla de arquitectura:

> UI provisional ≠ dato maestro.

## 9. No regresión

V3.0.3 no modifica:

- precio canónico o demo;
- stock;
- carrito;
- checkout;
- pedidos;
- fórmula operacional;
- Datos Maestros;
- Operación;
- Finanzas;
- vida útil;
- costo estándar.

## 10. Cierre

Una ficha puede estar visualmente completa aunque parte de la especificación siga abierta, siempre que la interfaz muestre con la misma claridad **lo que sabemos, lo que estamos estimando y lo que todavía necesita evidencia**.