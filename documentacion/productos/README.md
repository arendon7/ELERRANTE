# Fichas Maestras de Producto — El Errante v0.9

## Propósito

Esta carpeta organiza la documentación comercial, gastronómica, operativa, financiera, sanitaria y visual de cada producto. Las fichas no sustituyen fórmulas técnicas, registros o actas; actúan como índice de decisiones y evidencias.

## Estándar

- `PLANTILLA_FICHA_MAESTRA_PRODUCTO_V09.md` define la estructura obligatoria.
- Un producto no cambia a `piloto aprobado` o `venta aprobada` solo por tener una ficha completa.
- Cada puerta requiere responsable, evidencia y fecha.
- Los precios, stocks y rendimientos actuales continúan siendo de demostración hasta validación.

## Ola 1 — núcleo propuesto

| Producto | Rol | Ficha | Estado | Decisión principal |
|---|---|---|---|---|
| Aire y Tiempo | Producto plataforma | `AIRE_Y_TIEMPO_FICHA_MAESTRA_V09.md` | En revisión | Fórmula, formatos, empaque, vida útil y precio piloto |
| Crea la Tuya | Producto plataforma | `CREA_LA_TUYA_FICHA_MAESTRA_V09.md` | En revisión | Formatos, precocción, congelación e instrucciones por equipo |
| Margherita del Taller | Referencia esencial | `MARGHERITA_TALLER_FICHA_MAESTRA_V09.md` | En revisión | Gramajes, recuperación, costo base y control de calidad |
| La Errante | Producto insignia | `LA_ERRANTE_FICHA_MAESTRA_V09.md` | En revisión | Fórmula, chorizo, cebolla, acabado, empaque y margen |
| Panela + Maracuyá | Acabado insignia | `PANELA_MARACUYA_FICHA_MAESTRA_V09.md` | En revisión | Fórmula, proceso, envase, dosificación y vida útil |
| Combo Primera Ruta | Ruta de descubrimiento | `COMBO_PRIMERA_RUTA_FICHA_MAESTRA_V09.md` | En revisión | Composición, empaque mixto, inventario derivado y margen |

## Ola 2 — extensión pendiente de ficha profunda

| Producto | Rol | Estado de ficha | Próxima decisión |
|---|---|---|---|
| Diavola Errante | Pizza extensión | Matriz general | Proveedor, picante, gramaje y estabilidad |
| Bosque | Pizza vegetariana | Matriz general | Hongos, humedad y estabilidad congelada |
| Cuatro Quesos de Montaña | Pizza extensión | Matriz general | Mezcla, exudación, costo y recalentamiento |
| Salsa de tomate | Despensa base | Matriz general | Formulación, tratamiento, envase y vida útil |
| Reducción balsámica | Acabado extensión | Matriz general | Formulación, viscosidad, envase y vida útil |

## Secuencia de trabajo

1. Validar la composición de la ola 1.
2. Completar datos humanos de Aire y Tiempo.
3. Completar datos humanos de Crea la Tuya.
4. Validar conjuntamente La Errante y Panela + Maracuyá.
5. Utilizar Margherita como control técnico y económico de la línea En Casa.
6. Aprobar componentes antes de cerrar Combo Primera Ruta.
7. Actualizar la matriz JSON y las fichas con evidencia.
8. Integrar estados aprobados en Studio y Administración.
9. Modificar tienda y disponibilidad únicamente después de aprobación.
10. Desarrollar fichas profundas de ola 2.

## Estados permitidos

- `borrador`
- `en revisión`
- `piloto aprobado`
- `venta aprobada`
- `suspendido`
- `retirado`

## Regla de coherencia

La ficha, la matriz maestra, Studio, Administración, tienda, operación y fuente canónica deben expresar el mismo estado. Ninguna superficie puede considerar disponible un SKU que siga pendiente en la matriz aprobada.
