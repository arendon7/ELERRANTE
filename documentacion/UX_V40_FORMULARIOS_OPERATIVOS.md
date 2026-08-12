# UX V4.0 · Formularios operativos asistidos

## Alcance del bloque 1

V4.0.0 mejora únicamente la experiencia de captura en `operacion.html` sobre cuatro formularios ya existentes:

- V2.4 · compra observada.
- V2.4 · medición de lote, rendimiento y merma.
- V2.5 · borrador de compra.
- V2.5 · recepción contra orden.

La capa se implementa en `assets/operational-forms-v40.js` y `assets/operational-forms-v40.css` y funciona como mejora progresiva: si estos assets no cargan, los formularios V2.4/V2.5 conservan su comportamiento anterior.

## Qué cambia

- Estado de completitud en vivo antes de guardar.
- Identificación visible de campos requeridos.
- Acción “Ir al siguiente pendiente” para reducir búsqueda visual y clics.
- `aria-invalid` y apertura del `details` cuando la validación nativa detecta un campo inválido.
- `inputmode="decimal"` en campos numéricos para facilitar captura móvil.
- Previews derivados antes de guardar:
  - costo unitario observado de una compra;
  - rendimiento y merma de una medición;
  - compromiso estimado de un borrador;
  - costo unitario observado de una recepción.
- Guard contra doble `submit` accidental mientras el formulario existente procesa el primer envío.

## Invariantes

V4.0.0 NO:

- crea, modifica o elimina claves de `localStorage` o `sessionStorage`;
- cambia recetas, BOM, costos estándar o costos históricos;
- aprueba ni emite órdenes de compra;
- recibe mercancía por sí misma;
- altera la regla de inventario físico existente;
- activa backend, Supabase, Auth o RLS;
- cambia estados, transiciones o permisos;
- introduce datos demo o hechos operativos ficticios.

Todos los guardados siguen ejecutándose exclusivamente por los motores V2.4 y V2.5 ya certificados.

## Estrategia técnica

La capa observa únicamente `#measurement-v24` y `#procurement-v25` porque ambos motores reconstruyen su DOM tras guardar o recargar. Cada formulario recibe `data-v40-enhanced="true"` una sola vez por instancia. El `MutationObserver` sólo agenda una nueva inspección; no reescribe formularios ya mejorados.

La versión pública puede verificarse mediante `document.documentElement.dataset.operationalFormsVersion === "4.0.0"` y `window.EL_ERRANTE_OPERATIONAL_FORMS_V40.version`.

## Cobertura E2E

`tests/e2e/operational-forms-v40.spec.js` verifica:

1. montaje progresivo sobre los cuatro formularios;
2. ausencia de escrituras operativas al cargar la capa;
3. navegación al siguiente campo pendiente;
4. preview de rendimiento/merma y preservación del guardado V2.4;
5. preview de costo unitario sin modificar inventario;
6. validación nativa visible en borradores V2.5;
7. preview de compromiso de compra;
8. ausencia de overflow horizontal en móvil.

## Criterio de cierre del bloque

El bloque puede fusionarse sólo si pasan la regresión funcional completa y los gates canónicos existentes. Después del merge, el workflow `Verificar publicación V4.0` debe confirmar en GitHub Pages que el SHA publicado contiene los assets y marcadores V4.0.0.
