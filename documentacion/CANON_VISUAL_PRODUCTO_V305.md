# EL ERRANTE · CANON VISUAL DE PRODUCTO V3.0.5

## Estado

**Release editorial:** V3.0.5 · dirección visual de producto  
**Ámbito:** cinco pizzas V3 de la línea En Casa  
**No modifica:** fórmula, gramajes, precios, stock, checkout, Datos Maestros, Operación ni Finanzas.

## 1. Problema que resuelve

El banco HQ actual contiene una pieza principal específica para cada una de las cinco pizzas, pero la galería canónica heredada completa cada ficha con activos compartidos de ingredientes y masa/fuego. Ese mecanismo es útil para conservar calidad técnica de imagen, aunque visualmente puede hacer que distintas pizzas parezcan compartir exactamente las mismas tomas de producto.

V3.0.5 separa las funciones visuales:

1. **Producto** · identifica la referencia concreta.
2. **Materia** · explica la naturaleza de los ingredientes o variables que condicionan la receta.
3. **Proceso** · explica la relación entre masa, estructura y fuego.

Las capas Materia y Proceso son contexto editorial. No son evidencia fotográfica de la formulación exacta, del lote, del gramaje ni de la producción real de una referencia.

## 2. Activos principales vigentes

Los cinco activos editoriales HQ principales son:

- `producto-margherita.webp` · Margherita del Taller.
- `producto-la-errante.webp` · La Errante.
- `producto-bosque.webp` · Bosque.
- `producto-diavola.webp` · Diavola Errante.
- `producto-cuatro-quesos.webp` · Cuatro Quesos de Montaña.

Todos están registrados en `assets/images/brand-final/manifest-hq-v13.json` con dimensión 1122 × 1402 px.

Los activos compartidos actualmente utilizados como contexto son principalmente:

- `home-ingredientes.webp` · materia / ingredientes.
- `home-masa-fuego.webp` · método / masa / fuego.

## 3. Regla de autenticidad visual

Una imagen editorial, render, composición generada o fotografía de contexto puede comunicar atmósfera y método, pero **no debe presentarse como prueba de producción real** si no documenta efectivamente esa referencia, ese proceso o ese lote.

Por tanto:

- no se atribuyen ingredientes exactos a partir de una imagen;
- no se deducen gramajes, tamaño, cocción, proveedor, origen o estado sanitario desde una imagen;
- no se utiliza una imagen compartida para afirmar que muestra una pizza concreta;
- una futura fotografía real de producción podrá reemplazar el activo editorial sin cambiar la arquitectura de la ficha;
- etiqueta, ficha técnica y lote siguen prevaleciendo sobre cualquier lectura visual.

## 4. Arquitectura pública V3.0.5

La galería de cada pizza utiliza tres roles:

### 4.1 Pieza principal

- ocupa la mayor superficie;
- utiliza el activo específico de la pizza;
- identifica nombre y territorio;
- funciona como ancla comercial y editorial.

### 4.2 Materia · contexto

- muestra materia prima, ingredientes o una lectura visual asociada;
- su texto explica la variable gastronómica relevante;
- nunca se presenta como composición exacta de la pizza.

### 4.3 Proceso · contexto

- muestra masa, fuego o trabajo de taller;
- su texto explica qué transformación sostiene el producto;
- nunca sustituye evidencia de producción.

## 5. Shot list definitivo para fotografía específica

La arquitectura V3.0.5 queda preparada para que cada pizza reciba posteriormente una sesión propia sin rediseñar la ficha.

### Slot A · HERO DE PRODUCTO

**Objetivo:** deseo inmediato y reconocimiento inequívoco de la referencia.  
**Formato maestro recomendado:** vertical 4:5, mínimo 2400 × 3000 px.  
**Plano:** pizza completa o 3/4 suficientemente próximo para leer borde, cobertura y estructura.  
**Dirección:** luz lateral cálida y controlada; fondo sobrio; textura real; sin utilería que compita con la pizza.  
**Regla:** el producto real debe dominar el encuadre.

### Slot B · CORNICIONE / CORTE

**Objetivo:** demostrar estructura y cocción sin recurrir a discurso abstracto.  
**Formato:** 3:2 o 4:3, mínimo 2400 px en el lado largo.  
**Plano:** borde, corte o pliegue donde puedan leerse alveolado, espesor, base y transición centro-borde.  
**Regla:** no manipular el alveolado de forma que deje de representar la pizza servida.

### Slot C · MATERIA ESPECÍFICA

**Objetivo:** mostrar el problema gastronómico particular de cada referencia.  
**Formato:** 4:3.  
**Regla:** la fotografía debe corresponder a ingredientes realmente vigentes en la formulación cuando se publique como imagen específica.

### Slot D · SEGUNDO FUEGO

**Objetivo:** mostrar la pizza entrando, saliendo o terminándose en un horno doméstico.  
**Formato:** horizontal 3:2 o 16:9.  
**Regla:** debe representar el uso real previsto para En Casa; no construir una escena que sugiera un equipo o procedimiento distinto al indicado en empaque.

### Slot E · FIRMA / ACABADO

**Objetivo:** fotografiar la decisión que hace reconocible a cada pizza después de entender su base técnica.  
**Formato:** macro o detalle 4:3.

## 6. Dirección específica por pizza

### Margherita del Taller · Claridad

**Problema visual:** mostrar que una pizza de pocos elementos puede tener profundidad sin llenarla de ingredientes.

Prioridades de sesión:

1. distribución de tomate y lácteo sin cubrir completamente la masa;
2. borde y transición centro-cornicione;
3. brillo y humedad del queso en punto;
4. albahaca o aceite únicamente cuando correspondan a la versión vigente;
5. corte que permita leer limpieza y estructura.

### La Errante · Territorio

**Problema visual:** hacer visible la trayectoria grasa → tostado → dulzor → acidez → aroma sin convertirla en una pizza sobrecargada.

Prioridades:

1. distribución del chorizo y la cebolla;
2. contraste entre zonas de queso, tostado y masa;
3. aplicación final del balsámico de panela y maracuyá cuando la presentación vigente lo contemple;
4. detalle del acabado después del horno;
5. corte que muestre estructura bajo una receta de mayor carga.

### Bosque · Profundidad vegetal

**Problema visual:** mostrar concentración y textura del hongo, no simplemente abundancia.

Prioridades:

1. superficie del hongo después de su tratamiento;
2. tostado y ausencia de agua libre visible;
3. relación entre hongo, lácteo y masa;
4. detalle de textura;
5. terminado aromático únicamente si corresponde a la formulación vigente.

### Diavola Errante · Intensidad

**Problema visual:** hacer visible una distribución de intensidad y no una capa uniforme de picante.

Prioridades:

1. separación entre tomate, queso, masa y embutido;
2. zonas de embutido con grasa activada sin bordes quemados;
3. contraste cromático sin sobresaturación artificial;
4. corte o porción donde la intensidad no esconda la masa;
5. acabado fresco o aromático solo si pertenece a la versión vigente.

### Cuatro Quesos de Montaña · Arquitectura láctea

**Problema visual:** representar funciones lácteas diferentes sin que la superficie parezca una sola capa homogénea de grasa.

Prioridades:

1. zonas y puntos de distinta fundencia;
2. masa visible entre áreas lácteas;
3. detalle de textura y maduración;
4. control de brillo y grasa separada;
5. cualquier ingrediente de contraste únicamente después de validación de la formulación final.

## 7. Reglas de edición

- color natural; evitar sobresaturación de rojo, naranja o amarillo;
- preservar textura real de borde, queso e ingredientes;
- evitar sharpening agresivo o falsa nitidez;
- no clonar ingredientes para simular abundancia;
- no modificar tamaño aparente del producto de manera engañosa;
- no incorporar texto dentro del archivo de imagen: títulos y claims pertenecen al HTML;
- mantener un master sin compresión destructiva y exportar WebP/AVIF para web;
- conservar metadatos internos de origen, fecha, producto y estado de aprobación.

## 8. Reemplazo futuro sin deuda técnica

V3.0.5 no crea URLs ficticias ni placeholders rotos. Mientras no exista fotografía específica aprobada, se conserva el banco HQ actual y la interfaz distingue la pieza principal de los contextos de Materia y Proceso.

Cuando exista una nueva sesión aprobada:

1. ingresar los archivos al banco canónico;
2. registrar dimensiones, peso, hash y procedencia;
3. mapear cada slot a la referencia correcta;
4. validar desktop y móvil;
5. comprobar que no existan duplicados o referencias cruzadas entre pizzas;
6. promover solo después de superar la regresión funcional.

## 9. Criterio de cierre

V3.0.5 está correctamente implementada cuando:

- las cinco pizzas muestran una pieza principal específica;
- Materia y Proceso se distinguen visual y semánticamente;
- ninguna de las otras seis referencias recibe esta capa;
- V3.0.3 y V3.0.4 permanecen intactas;
- la galería cabe en móvil sin desbordamiento horizontal;
- no se publican afirmaciones técnicas nuevas a partir de imágenes;
- la estructura admite reemplazar activos por fotografía específica sin volver a construir la ficha.
