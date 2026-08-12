# UX V3.9 — eficiencia de navegación y continuidad local

## Objetivo

Reducir fricción de orientación y cantidad de pasos dentro del sistema interno sin tocar hechos operativos, reglas financieras, piloto, autenticación ni backend.

V3.8 resolvió jerarquía, navegación móvil, foco, accesibilidad básica, regiones desplazables y feedback. V3.9 se monta encima como una capa independiente y reversible orientada a velocidad de trabajo.

## Problemas observados

1. `centro-interno.html` siempre inicia desde cero: no ofrece retomar la última superficie o sección visitada.
2. Para cambiar entre módulos o encontrar una sección hay que recorrer navegación lateral / navegación contextual.
3. El sistema no ofrece búsqueda por intención (`caja`, `inventario`, `pedidos`, `costos`, etc.).
4. En móvil, aunque V3.8 ya tiene drawer real, cambiar de contexto sigue requiriendo abrir menú y recorrer enlaces.

## Solución V3.9

### Launcher de navegación

- `Cmd+K` en macOS y `Ctrl+K` en otros entornos abre el buscador.
- También hay botón visible `Buscar` en la sesión y un acceso compacto en la barra móvil.
- Busca módulos, secciones de la pantalla actual y recientes.
- Admite vocabulario de intención: caja/costos → Finanzas; inventario/producción/compras → Operación; SKU/catálogo → Datos maestros; backup/checkpoint → Piloto.
- `Enter` abre el primer resultado filtrado.
- `Arrow Up/Down` recorre resultados.
- `Escape` cierra y devuelve foco al invocador.

### Continuidad

`Inicio interno` muestra un bloque `Continúa donde quedaste` cuando existe historial local válido. Si no existe historial, enseña el acceso rápido al buscador.

Se conserva un máximo de seis destinos recientes en `localStorage` bajo `ee_v39_navigation_history`.

Cada elemento contiene exclusivamente:

- `href`: ruta interna permitida + hash opcional;
- `label`: nombre de módulo/sección;
- `at`: timestamp local para ordenamiento.

No almacena cliente, pedido, teléfono, costos, caja, comprobantes, inventario, actas ni ningún dato de negocio.

## Seguridad de rutas

El historial y el launcher usan una allowlist cerrada:

- `centro-interno.html`
- `control.html`
- `operacion.html`
- `finanzas.html`
- `studio.html`
- `actas.html`
- `piloto-operativo.html`
- `index.html`

Los hashes sólo aceptan caracteres alfanuméricos, guion y guion bajo. No se aceptan URLs absolutas, `//` ni destinos externos arbitrarios.

## Accesibilidad

El launcher sigue el patrón modal del WAI-ARIA Authoring Practices Guide:

- `role="dialog"`;
- `aria-modal="true"`;
- título visible referenciado por `aria-labelledby`;
- foco inicial en búsqueda;
- `Tab` y `Shift+Tab` contenidos dentro del diálogo;
- `Escape` cierra;
- el shell queda `inert` mientras el launcher está abierto;
- el foco vuelve al invocador al cerrar.

La búsqueda usa un `input type="search"` nativo y no intercepta teclas de edición de texto.

Referencias:
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Progressive enhancement

V3.9 no sustituye V3.8.

Orden de carga:

1. sesión V3.1.1 válida;
2. CSS/JS V3.8;
3. CSS/JS V3.9.

Si V3.8 falla, no se intenta V3.9. Si V3.9 falla, el shell retira únicamente `internal-ux-v39.css`; V3.8 continúa funcionando sin cambios.

## Invariantes

V3.9:

- no activa Supabase;
- no activa Auth/RLS remoto;
- no cambia roles ni sesiones;
- no crea ni reescribe pedidos;
- no toca inventario, producción, compras, costos, caja ni cierres;
- no modifica el backup del piloto;
- no modifica checkout ni web pública;
- no registra telemetría remota;
- no envía historial a GitHub ni a servicios externos.

## Certificación

`tests/e2e/internal-ux-v39.spec.js` verifica desktop/móvil:

1. composición V3.1.1 + V3.8 + V3.9;
2. modal, foco, `inert` y `Escape`;
3. búsqueda por intención + navegación con teclado;
4. continuidad desde una sección real;
5. estructura mínima y no comercial del historial;
6. fallback limpio cuando falla V3.9;
7. ausencia de overflow horizontal en móvil.

`.github/workflows/public-health-v39.yml` verifica que GitHub Pages publique el mismo SHA y exponga el shell y assets V3.9 esperados.