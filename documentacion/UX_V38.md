# UX V3.8 — shell común y usabilidad transversal

## Objetivo

V3.8 mejora la experiencia del sistema interno sin modificar la semántica de los hechos operativos, financieros o del piloto.

La capa se monta desde `assets/internal-shell-v31.js` después de validar una sesión V3.1.1 y carga:

- `assets/internal-ux-v38.css`;
- `assets/internal-ux-v38.js`.

El contrato de autenticación sigue siendo V3.1.1. La mejora UX se identifica independientemente como V3.8.0.

## Criterio de diseño

La implementación combina:

- Impeccable como marco principal para app shell, formularios, estados, responsive, accesibilidad, jerarquía y reducción de carga cognitiva;
- Emil Kowalski / Design Engineering para motion breve, feedback predecible, foco en detalles de interacción y respeto por `prefers-reduced-motion`;
- Taste Skill como filtro anti-template para evitar jerarquías genéricas, exceso de tarjetas y ornamentación sin función.

No se introduce una nueva librería UI ni dependencia de runtime.

## Mejoras V3.8

### Navegación

- navegación lateral jerarquizada en Trabajo, Gobierno y prueba, y Exterior;
- `aria-current="page"` en el destino activo;
- drawer real en tablet/móvil en vez de convertir el sidebar en una fila horizontal;
- apertura/cierre con estado `aria-expanded`;
- cierre por botón, backdrop, enlace o tecla Escape;
- ciclo de foco contenido dentro del drawer mientras está abierto;
- barra móvil sticky con contexto actual;
- skip-link al contenido principal.

### Accesibilidad e interacción

- `:focus-visible` consistente;
- objetivos táctiles mínimos en navegación y acciones comunes;
- mensajes comunes con `role="status"`, `aria-live="polite"` y `aria-atomic="true"`;
- tablas horizontales convertidas en regiones enfocables sin modificar la semántica de la tabla interna;
- scroll suave sólo cuando el usuario no solicita reducción de movimiento;
- soporte explícito de `prefers-reduced-motion`.

### Jerarquía y densidad

- tipografía y ancho de lectura más controlados;
- sombras y elevación discretas;
- menor competencia visual entre paneles secundarios;
- espaciado de secciones consistente;
- mejor tratamiento móvil de hero, cards, paneles, tablas y navegación interna.

## Invariantes

V3.8 no:

- cambia `ee_v31_session`;
- cambia roles o permisos;
- activa Supabase/Auth/RLS;
- crea o modifica pedidos, producción, compras, inventario, cierres, caja o costos;
- modifica schemas de backup del piloto;
- duplica motores de Operación o Finanzas;
- cambia el checkout público.

## Certificación mínima

1. V3.1.1 continúa autenticando y expirando sesión correctamente.
2. `data-internal-version="3.1.1"` permanece estable.
3. `data-internal-ux-version="3.8.0"` confirma la carga de la nueva capa.
4. drawer móvil abre/cierra por control y Escape.
5. no aparece overflow horizontal nuevo en las superficies internas críticas.
6. mensajes del piloto son regiones vivas accesibles.
7. tablas siguen conservando su elemento `table` y además son regiones de scroll enfocables.
8. Playwright desktop y móvil completo = PASS.
9. auditoría canónica, publicación y health-check continúan verdes.
10. Graphify se sincroniza después del merge.
