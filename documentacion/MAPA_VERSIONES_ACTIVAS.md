# Mapa de versiones activas — El Errante

Este documento separa las distintas líneas de versión que conviven legítimamente en El Errante. No todas representan una release integral del sitio.

## Regla principal

La **release integral** identifica la distribución pública e interna publicada como conjunto. Las versiones de **módulo**, **motor**, **shell**, **runtime**, **canon** o **perfil de datos** pueden avanzar de forma independiente mientras mantengan sus contratos e invariantes.

Por tanto, no debe deducirse la versión integral a partir del número más alto visible en un módulo.

## Estado vigente

| Capa | Versión efectiva | Función | Observación |
|---|---:|---|---|
| Release integral | **3.1.1** | Distribución publicada y certificada | Sigue siendo la referencia de package, Pages y health-check. |
| Runtime / materialización | **2.8.0** | Fuente materializada, cache y superficie ejecutable | No se renombra mientras el contrato técnico siga siendo el mismo. |
| Canon de marca y activos | **2.8** | Identidad, imágenes, aliases y materialización | `assets/brand-canon-v28.js`. |
| Línea pública/editorial | **2.9** | Narrativa y recorrido público | Compatible con el runtime V2.8. |
| Arquitectura interna | **3.1** | Tres contextos principales + herramientas auxiliares | Control / Operación / Finanzas; Studio y Actas como gobierno. |
| Shell y sesión interna | **3.1.1** | Guard local, navegación, retorno seguro, expiración y demo operativa reversible | Cubre Centro, Control, Operación, Finanzas, Datos maestros y Actas; no equivale a autorización servidor. |
| Panel de control | **shell 3.1.1 / motor 3.0** | Priorización operativa | `control-v30.js` permanece como motor. |
| Módulo Operativo | **3.3.0** | Ejecución + evidencia y cierre | Compone motores V2.1–V2.5, Control V3.0 y evidencia V3.3.0. |
| Workbench Financiero base | **3.1.0** | Baseline + working model | Núcleo `finance-workbench-v31.js`. |
| Módulo Financiero efectivo | **3.2.9** | Profundidad financiera acumulativa | Capas V3.2.0–V3.2.9 sobre el workbench base. |
| Datos maestros | **shell 3.1.1 / motor oferta V0.9** | Gobierno de producto, SKU, fuentes y evidencia | Superficie auxiliar `studio.html`. |
| Actas | **shell 3.1.1 / motores oferta V0.9** | Trazabilidad de sesiones, evidencia y decisiones | Superficie auxiliar `actas.html`. |
| Demo financiera | **3.2.9** | Escenario sintético local y reversible | No contiene cifras privadas reales. |
| Snapshot MFO | **schema 3.0 / workbook profile v3.3** | Perfil de importación del MFO privado | El XLSX real permanece fuera del repositorio. |
| Supabase | **preparado, inactivo** | Futuro Auth, RLS y persistencia multiusuario | No se declara backend activo en esta release. |

## Perímetro de shell V3.1.1

Comparten la misma barrera local de sesión:

- `centro-interno.html`;
- `control.html`;
- `operacion.html`;
- `finanzas.html`;
- `studio.html`;
- `actas.html`.

El retorno seguro mediante `?next=` sólo admite esos destinos y hashes operativos expresamente permitidos, incluido `operacion.html#evidencia`.

Esta coherencia de shell no cambia la limitación esencial: GitHub Pages es estático y la sesión local no es autorización servidor.

## Composición del módulo Operativo V3.3.0

`operacion.html` conserva y compone motores previamente certificados:

- Agenda / pedidos: V2.1.
- Producción: V2.2.
- Materiales / BOM: V2.3.
- Medición: V2.4.
- Abastecimiento: V2.5.
- Resumen de control: V3.0.
- Shell / sesión: V3.1.1.
- Evidencia y cierre: V3.3.0.

V3.3.0 añade una bitácora append-only de evidencia operativa y controles de cierre. No reemplaza ni renumera los motores anteriores.

## Composición del módulo Financiero V3.2.9

`finanzas.html` monta el workbench V3.1 y las siguientes capas acumulativas:

- V3.2.0 — profundidad financiera.
- V3.2.1 — ledger / movimientos trazables.
- V3.2.2 — economía unitaria.
- V3.2.3 — caja y tendencias.
- V3.2.4 — escenarios.
- V3.2.5 — decisiones.
- V3.2.6 — compras e inventario vistos desde Finanzas sin reescribir Operación.
- V3.2.7 — resumen ejecutivo.
- V3.2.8 — readiness / calidad del dato.
- V3.2.9 — demo financiera aislada y reversible.

El número **3.2.9** describe la profundidad efectiva del módulo financiero, no una nueva release integral.

## Qué identifica `deploy-version.txt`

El marcador de despliegue debe declarar por separado:

- `release_version=3.1.1`
- `version=2.8.0` — runtime técnico.
- `internal_architecture=v3.1-acceso-operacion-finanzas`
- `session_shell=v3.1.1`
- `control_engine=v3.0`
- `operation_module=v3.3.0`
- `finance_workbench_core=v3.1.0`
- `finance_module=v3.2.9`
- `mfo_baseline=v3.0-schema-mfo-v3.3`

`internal_architecture` conserva su identificador histórico de tres contextos principales; la shell V3.1.1 también cubre las herramientas auxiliares Studio/Actas.

Esto evita usar un solo número para contratos que evolucionan a ritmos distintos.

## Cuándo subir la release integral

La release integral sólo debe cambiar cuando el conjunto publicado requiera un nuevo contrato de distribución, por ejemplo:

- cambio incompatible de arquitectura interna;
- activación real de backend / Auth / RLS;
- migración de persistencia local a multiusuario;
- cambio del runtime o de la superficie materializada;
- nuevo contrato transversal que afecte simultáneamente publicación, validadores y experiencia general.

Una mejora aislada y compatible de Operación, Finanzas o una superficie auxiliar puede conservar `release_version=3.1.1` mientras no cambie el contrato transversal.

## Invariantes de numeración

1. No renombrar activos V2.8 sólo para hacerlos coincidir con la versión más alta del producto.
2. No llamar V3.3.0 a toda la web únicamente porque Operación esté en V3.3.0.
3. No presentar el workbench financiero como V3.1 sin aclarar que la profundidad efectiva vigente es V3.2.9.
4. No presentar el guard local V3.1.1 como seguridad backend.
5. No declarar Supabase activo mientras Auth, RLS y persistencia compartida no estén realmente habilitados y certificados.
6. Toda nueva capa modular debe conservar una prueba que demuestre que no rompe los contratos inferiores que reutiliza.
7. Las herramientas auxiliares deben compartir la shell interna si aparecen dentro del mapa de navegación protegido.
