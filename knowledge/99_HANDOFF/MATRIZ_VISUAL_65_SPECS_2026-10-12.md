# El Errante · Matriz de continuidad visual (65 Prompt Specs)

**Corte:** 12-oct-2026. **Fuente original:** `EL_ERRANTE_MASTER_VISUAL_PROMPTS_V1.xlsx` (Google Drive privado). **Destino:** auditoría de continuidad, no orden de regenerar imágenes.

## Descubrimiento verificado

La planilla **sí contiene 65 Prompt Specs**: 61 de núcleo y 4 opcionales de navegación. En la matriz original hay 51 registros como `Pendiente`, 10 como `Bloqueado` y 4 como `Opcional` **en el momento de su elaboración**. Las prioridades históricas son 23 P0, 30 P1 y 12 P2.

**Corrección de auditoría:** una extracción anterior contó sólo 56 por una expresión regular que excluía los códigos `PM##` y `BO##`. **Ese conteo era erróneo**. Se validaron 65 IDs únicos, entre G01 y O04, sin duplicados.

**Prevalencia obligatoria:** `AGENTS.md` + `documentacion/V4_BRAND_DIRECTION.md` + `assets/images/brand-v4/manifest-v4.json`. El workbook V1 es histórico y contiene el año **EST. 2024** en su tabla de verdad visual; el canon vigente del código declara **EST. 2019**. Debe corregirse en una **copia V4**, preservando el original. Terracota como institucional también fue sustituida por negro/marfil/oro sutil.

## Método

- Se catalogan ID, familia, rol UX, ubicación, ratio y estado **histórico**. No se incorporan los textos completos de los prompts al repo público.
- Una coincidencia de rol con un activo **promovido en el manifiesto V4** se muestra como `CANDIDATO POR ROL`. **No confirma** identidad visual ni correspondencia 1:1, ni exige usar ese activo en ese slot.
- `SIN EQUIVALENCIA EXACTA` significa que esta auditoría documental no estableció una correspondencia inequívoca; **no significa** que falte producir esa foto o que la web no la tenga.
- Los estados `Pendiente`/`Bloqueado` proceden del **workbook V1**, no son un diagnóstico de pendientes nuevos.
- No publicar logos, empaques o claims generados sin aprobación documental. Mantener las 4 imágenes rechazadas del banco V4 en cuarentena.

## Inventario por familia

| Familia | Specs |
|---|---:|
| Marca | 10 |
| Eventos | 3 |
| Aire y Tiempo | 4 |
| Crea la Tuya | 5 |
| Despensa | 6 |
| Panela + Maracuyá | 4 |
| Primera Ruta | 3 |
| Margherita | 5 |
| La Errante | 5 |
| Bosque | 5 |
| Diavola | 5 |
| Cuatro Quesos | 5 |
| En Casa | 1 |
| Opcional navegación | 4 |

## Referencia cruzada de 65 specs

| ID | Familia | Pieza / función | Página / uso V1 | Ratio V1 | Prioridad | Estado V1 | Referencia V4 por rol |
|---|---|---|---|---|---|---|---|
| G01 | Marca | Hero desktop | `index.html` | 16:9 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/01-home-hero-v4.webp` (candidato por rol) |
| G02 | Marca | Hero mobile | `index.html` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| G03 | Marca | Fermentación | `index.html / historia` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| G04 | Marca | Chef autor | `index.html / juan-david-ocampo.html` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| G05 | Marca | Masa y fuego | `index.html / metodo.html` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| G06 | Marca | Producto y territorio | `index.html` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| G07 | Marca | Compartir | `index.html` | 16:9 | P2 | Pendiente | Sin equivalencia exacta verificada |
| G08 | Marca | Hero tienda | `tienda.html` | 16:9 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/11-tienda-hero-v4.webp` (candidato por rol) |
| G09 | Marca | Hero En Casa | `en-casa.html` | 16:9 | P0 | Pendiente | `assets/images/brand-v4/segundo-fuego-v4.webp` (candidato por rol) |
| G10 | Marca | Open Graph | `metadata social` | 1200x630 | P1 | Pendiente | Sin equivalencia exacta verificada |
| E01 | Eventos | Evento hero | `en-movimiento.html` | 16:9 | P2 | Pendiente | `assets/images/brand-v4/eventos-v4.webp` (candidato por rol) |
| E02 | Eventos | Servicio | `en-movimiento.html` | 16:9 | P2 | Pendiente | Sin equivalencia exacta verificada |
| E03 | Eventos | Noche | `en-movimiento.html` | 16:9 | P2 | Pendiente | Sin equivalencia exacta verificada |
| H01 | Aire y Tiempo | Packshot maestro | `producto harina / tienda` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| H02 | Aire y Tiempo | Bolsa abierta / materia | `producto harina` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| H03 | Aire y Tiempo | Proceso masa | `producto harina / metodo` | 3:2 | P1 | Pendiente | Sin equivalencia exacta verificada |
| H04 | Aire y Tiempo | Resultado estructural | `producto harina` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| C01 | Crea la Tuya | Packshot x2 | `producto base / tienda` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| C02 | Crea la Tuya | Base fuera del empaque | `producto base / en-casa` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| C03 | Crea la Tuya | Personalización | `producto base / en-casa` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| C04 | Crea la Tuya | Segundo Fuego | `en-casa / producto base` | 16:9 | P1 | Pendiente | Sin equivalencia exacta verificada |
| C05 | Crea la Tuya | Resultado personalizado | `producto base` | 4:5 | P1 | Pendiente | Sin equivalencia exacta verificada |
| S01 | Despensa | Salsa tomate packshot | `producto salsa / tienda` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| S02 | Despensa | Salsa textura | `producto salsa` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| S03 | Despensa | Salsa aplicación | `producto salsa / Crea la Tuya` | 3:2 | P1 | Pendiente | Sin equivalencia exacta verificada |
| B01 | Despensa | Balsámica packshot | `producto balsámica / tienda` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| B02 | Despensa | Balsámica textura | `producto balsámica` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| B03 | Despensa | Balsámica aplicación | `producto balsámica` | 3:2 | P1 | Pendiente | Sin equivalencia exacta verificada |
| PM01 | Panela + Maracuyá | Packshot 250 ml | `producto PM / tienda` | 4:5 | P0 | Pendiente | Sin equivalencia exacta verificada |
| PM02 | Panela + Maracuyá | Materia | `producto PM` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| PM03 | Panela + Maracuyá | Gota / textura | `producto PM` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| PM04 | Panela + Maracuyá | Firma sobre La Errante | `producto PM / La Errante` | 3:2 | P0 | Pendiente | Sin equivalencia exacta verificada |
| R01 | Primera Ruta | Primera Ruta packshot | `producto combo / tienda` | 4:5 | P2 | Bloqueado | `assets/images/brand-v4/generated-01-20/15-combo-primera-ruta-v4.webp` (candidato por rol) |
| R02 | Primera Ruta | Primera Ruta abierto | `producto combo / tienda` | 4:3 | P2 | Bloqueado | Sin equivalencia exacta verificada |
| R03 | Primera Ruta | Primera Ruta experiencia | `producto combo / tienda` | 16:9 | P2 | Bloqueado | Sin equivalencia exacta verificada |
| M00 | Margherita | Packshot En Casa | `producto Margherita / tienda` | 4:5 | P0 | Bloqueado | Sin equivalencia exacta verificada |
| M01 | Margherita | Hero | `producto Margherita / home` | 4:5 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/02-margherita-v4.webp` (candidato por rol) |
| M02 | Margherita | Corte / cornicione | `producto Margherita` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| M03 | Margherita | Materia | `producto Margherita` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| M04 | Margherita | Segundo Fuego | `en-casa / Margherita` | 16:9 | P1 | Pendiente | Sin equivalencia exacta verificada |
| L00 | La Errante | Packshot En Casa | `producto La Errante / tienda` | 4:5 | P0 | Bloqueado | Sin equivalencia exacta verificada |
| L01 | La Errante | Hero | `producto La Errante / home` | 4:5 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/03-la-errante-v4.webp` (candidato por rol) |
| L02 | La Errante | Corte | `producto La Errante` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| L03 | La Errante | Materia | `producto La Errante` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| L04 | La Errante | Acabado signature | `producto La Errante` | 4:3 | P0 | Pendiente | Sin equivalencia exacta verificada |
| BO00 | Bosque | Packshot En Casa | `producto Bosque / tienda` | 4:5 | P0 | Bloqueado | Sin equivalencia exacta verificada |
| BO01 | Bosque | Hero | `producto Bosque / home` | 4:5 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/04-bosque-v4.webp` (candidato por rol) |
| BO02 | Bosque | Corte | `producto Bosque` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| BO03 | Bosque | Materia / transformación | `producto Bosque` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| BO04 | Bosque | Acabado | `producto Bosque` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| D00 | Diavola | Packshot En Casa | `producto Diavola / tienda` | 4:5 | P0 | Bloqueado | Sin equivalencia exacta verificada |
| D01 | Diavola | Hero | `producto Diavola / home` | 4:5 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/05-diavola-v4.webp` (candidato por rol) |
| D02 | Diavola | Corte | `producto Diavola` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| D03 | Diavola | Materia | `producto Diavola` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| D04 | Diavola | Segundo Fuego | `en-casa / Diavola` | 16:9 | P1 | Pendiente | Sin equivalencia exacta verificada |
| Q00 | Cuatro Quesos | Packshot En Casa | `producto Cuatro Quesos / tienda` | 4:5 | P0 | Bloqueado | Sin equivalencia exacta verificada |
| Q01 | Cuatro Quesos | Hero | `producto Cuatro Quesos / home` | 4:5 | P0 | Pendiente | `assets/images/brand-v4/generated-01-20/06-cuatro-quesos-v4.webp` (candidato por rol) |
| Q02 | Cuatro Quesos | Corte | `producto Cuatro Quesos` | 4:3 | P1 | Pendiente | Sin equivalencia exacta verificada |
| Q03 | Cuatro Quesos | Materia específica | `producto Cuatro Quesos` | 4:3 | P2 | Bloqueado | Sin equivalencia exacta verificada |
| Q04 | Cuatro Quesos | Segundo Fuego | `en-casa / Cuatro Quesos` | 16:9 | P1 | Pendiente | Sin equivalencia exacta verificada |
| X01 | En Casa | Familia de empaques | `tienda / en-casa` | 4:5 | P1 | Bloqueado | Sin equivalencia exacta verificada |
| O01 | Opcional navegación | Categoría Harina | `tienda / navegación` | 4:5 | P2 | Opcional | Sin equivalencia exacta verificada |
| O02 | Opcional navegación | Categoría Bases | `tienda / navegación` | 4:5 | P2 | Opcional | Sin equivalencia exacta verificada |
| O03 | Opcional navegación | Categoría Pizzas | `tienda / navegación` | 4:5 | P2 | Opcional | Sin equivalencia exacta verificada |
| O04 | Opcional navegación | Categoría Despensa | `tienda / navegación` | 4:5 | P2 | Opcional | Sin equivalencia exacta verificada |

## Reglas de reconciliación V1 → V4

1. Congelar versión y fecha del archivo V1; **no editarlo** para fingir que siempre dijo V4.
2. En una nueva matriz V4, resolver cada spec contra la necesidad UX actual y el activo verdaderamente usado en HTML/CSS. Solo abrir una tarea nueva cuando la ausencia sea comprobable.
3. En el libro V1, `Panela + Maracuyá` significa un **vinagre balsámico de 250 ml** oscuro/caoba. No ilustrarlo como jugo, miel o salsa amarilla. Esta verdad debe confirmarse contra el catálogo vigente antes de publicar nuevos textos.
4. `Crea la Tuya` se referencia como presentación x2 en tamaños; comprobar la unidad comercial en datos canónicos, no deducirla de fotografías.
5. Los empaques y la composición Primera Ruta tienen bloqueos materiales históricos. Exigir foto/envase real aprobados, no diseños especulativos.
6. Para Cuatro Quesos no inferir quesos específicos desde una ilustración sin ficha aprobada.
7. Piezas de marca y copyright: los activos 14/16/19/20 de `generated-01-20` están rechazados/cuarentenados. No promocionarlos por similitud de ID.
8. Documentar resultado de QA para cada nuevo emparejamiento: **PUBLICABLE / CANDIDATO / REFERENCIA / RECHAZADO**, con motivo, fecha y evidencia.
9. Auditar en desktop y móvil. Una imagen nominalmente existente puede tener recorte, alt, escala, peso o contexto incorrectos.
10. No iniciar otra generación masiva por existencia de la matriz; primero verificar la web V4 real.

**Fuente privada:** buscar el nombre exacto de archivo en Drive conectado. No publicar URL interna, copia financiera ni prompt completo en un repositorio público.
