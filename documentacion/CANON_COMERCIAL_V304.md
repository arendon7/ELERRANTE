# Canon comercial V3.0.4 · Elección y conversión

## Propósito

V3.0.4 mejora la capacidad de elegir y comprar las cinco pizzas editoriales V3 sin reemplazar la profundidad gastronómica construida en V3.0–V3.0.3 ni intervenir el dominio transaccional existente.

## Alcance

La capa aplica únicamente a:

- Margherita del Taller · Claridad
- La Errante · Territorio
- Bosque · Profundidad vegetal
- Diavola Errante · Intensidad
- Cuatro Quesos · Arquitectura láctea

No aplica automáticamente a harina, Crea la Tuya, despensa, recorridos ni futuras referencias.

## Principio de lectura

La decisión comercial debe poder ocurrir antes de leer toda la investigación. El orden recomendado es:

1. Qué quiero comer.
2. Qué dirección sensorial propone la pizza.
3. Qué producto estoy eligiendo.
4. Qué llega, cómo se termina y qué datos siguen pendientes.
5. Qué oficio y método sostienen esa decisión.

La simplificación comercial no elimina la profundidad: crea una puerta de entrada hacia ella.

## Cinco entradas de elección

- **Margherita del Taller:** “Quiero una pizza limpia y esencial.”
- **La Errante:** “Quiero conocer la firma de El Errante.”
- **Bosque:** “Quiero profundidad vegetal y umami.”
- **Diavola Errante:** “Quiero picante con sabor y progresión.”
- **Cuatro Quesos:** “Quiero una pizza cremosa y envolvente.”

Estas frases son guías editoriales de elección, no declaraciones técnicas, nutricionales ni regulatorias.

## Intensidad y ruta de sabor

Los campos `Intensidad` y `Ruta de sabor` de V3.0.4 son comparadores sensoriales cualitativos. No constituyen escalas instrumentales, especificaciones de formulación ni datos de control de calidad.

No deben utilizarse para sobrescribir fórmula, gramajes, costos, inventarios, Datos Maestros, etiqueta o ficha sanitaria.

## CTA de compra

V3.0.4 no crea un carrito nuevo ni una segunda lógica transaccional. El control “Agregar a mi selección” debe delegar en el control de compra existente de la ficha.

Por tanto:

- no cambia precio;
- no cambia stock;
- no cambia cantidades por defecto;
- no cambia `localStorage` por una ruta distinta a la aplicación existente;
- no cambia checkout;
- no cambia disponibilidad ni promesas logísticas.

## Comparación contextual

Cada ficha puede recomendar dos movimientos cercanos para facilitar la comparación. La recomendación sirve para navegar la colección, no para afirmar superioridad objetiva, maridajes universales o equivalencias nutricionales.

## Relación con V3.0.3

V3.0.4 debe preservar íntegramente:

- ficha esencial;
- composición por función;
- estados `Confirmado`, `Por validar` y `Etiqueta / lote`;
- Segundo Fuego;
- señales de punto;
- prueba de oficio;
- canon editorial de Juan David Ocampo.

Los valores aproximados continúan siendo provisionales y no se promocionan a Dato Maestro por aparecer en una interfaz comercial.

## Regla de seguridad de producto

Ingredientes, alérgenos, conservación, vida útil, lote, preparación operativa y cualquier requisito sanitario continúan subordinados a la información vigente y validada de etiqueta/ficha técnica.

## Regla visual

La capa comercial debe sentirse editorial, gastronómica y premium. Debe evitar patrones de marketplace genérico, urgencia artificial, contadores, descuentos inventados, escasez ficticia o mensajes que presionen la compra.

La conversión se busca reduciendo incertidumbre y haciendo más legible la elección, no creando ansiedad.
