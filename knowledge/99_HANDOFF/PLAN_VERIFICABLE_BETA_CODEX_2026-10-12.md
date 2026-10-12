# El Errante — Plan verificable para Codex y piloto de 30 días

**Corte:** 12-oct-2026 · Colombia. **Propósito:** convertir el contexto consolidado en trabajo ejecutable, con orden de dependencias, gates verificables y responsables humanos.

## Objetivo único

Preparar y certificar una beta operativa que procese **un pedido real**, su transferencia y comprobante, producción, control de stock, compra/recepción de reposición, despacho y cierre diario. La meta es operar durante **30 días** en condiciones controladas, sin falsear pagos, precios, disponibilidad ni conectividad.

### Estado inicial comprobado

- `main` observado: `a6edba45848a04437fb07b73e5d18cfdcdfc071b`; último merge #185.
- PR **#186, #187, #188, #189 abiertas** y con dependencias secuenciales; antes de tocar un archivo verificar HEADs/rebases reales y que no estén ya sustituidas.
- PR **#190** exclusivamente documental: índice/handoff para Codex; no activa producto.
- Proyecto Supabase dedicado `el-errante-production`: **INACTIVE** en consulta directa del 12-oct-2026. **NO-GO**.
- Issue central de la beta: https://github.com/arendon7/ELERRANTE/issues/179. Contiene casillas históricas que no reflejan completamente fusiones recientes ni estado del backend.

## Ruta crítica (sin ejecución de producción automática)

| Gate | Trabajo verificable | Evidencia de aceptación | Bloqueo / rol |
|---|---|---|---|
| G0 · verdad | Verificar HEAD de main, CI, Pages y PRs apiladas; confirmar docs/manifest | Snapshot con SHA y fecha, sin confundir ramas con deploy | Codex / GitHub |
| G1 · gobierno | Comprobar ruleset/branch protection y required checks para main | Configuración GitHub visible al administrador y checks requeridos | Administrador GitHub |
| G2 · backend | Reactivar `el-errante-production` si procede, inventariar schemas realmente aplicados, Auth/RPC/RLS/Storage, backups y advisors | Health activo y verificación de permisos/lecturas/Storage desde rol correcto | Administrador Supabase; **no inferir estado del SQL versionado** |
| G3 · conexión protegida | Revisar/recertificar PR #186 con `commerceEnabled=false`, sin datos bancarios de relleno ni ventas habilitadas | Modo connected solo en host aprobado; localhost/otros hosts preview; regresión | Código / QA |
| G4 · stock verídico | Certificar #187 + migración V3.0 (NULL = no contado) con transacciones de prueba, rollback, y después #188/V3.1 | No se inventa inventario, no stock negativo, 31 maestros sin filas físicas fabricadas | Código, QA, autorización DBA |
| G5 · precio y logística | Certificar #189/V3.2, precio y flete calculados server-side; idempotencia, comprobante y RLS | Cliente no puede alterar unit_price/total; sin pricebook aprobado es NO-GO | Código / QA |
| G6 · decisiones comerciales | Aprobar cada precio/SKU-variante, método/cobertura/costo de domicilio, WhatsApp, correo, cuenta y política de pago | Fuente fechada, aprobador y pruebas; 100% anticipado + comprobante | Responsable comercial/operativo |
| G7 · acceso y protección | Usuario Auth admin real + autorización RPC, shoppers anónimos **solo tras** cerrar G5, pruebas negativas y Storage privado | Admin autorizado, cliente limitado a sus datos, archivo propio no público | Administrador / QA |
| G8 · inventario inicial | Conteo físico y estado de confianza de costos, sin convertir no contado en cero | Conteos firmados/versionados y controles de diferencia | Responsable operativo |
| G9 · pedido cero | Ejecutar flujo transaccional completo sin edición manual de BD | Orden, comprobante, estado/pago, preparación, compra-restock, despacho, entrega y cierre verificables | Equipo comercial + operación + QA |
| G10 · GO | Revisar todos los gates, registrar SHA, deploy, backend y plan de contingencia | Acta GO explícita, sin demos, backups probados y reversibilidad | Responsable de proyecto |
| G11 · 30 días | Registro diario + revisión semanal; calidad de datos, soporte y estabilidad | Evidencias diarias, incidentes, métricas y decisión final | Operación + soporte |

**Condición fuerte:** cualquier G0–G9 fallido implica NO-GO. Pasar CI en una PR no equivale a haber completado G2/G6/G8/G9.

## Prioridades del primer ciclo Codex

### Ola A · documental/diagnóstico (ya iniciada en PR #190)

1. Leer `AGENTS.md`, dossier, matriz de fuentes y matriz visual. Confrontar cada estado con `main`.
2. Comprobar si `knowledge/graphify-live` fue generado desde exactamente el `main` real; si no, tratarlo como navegación obsoleta.
3. Ejecutar herramientas de auditoría del repositorio y registrar fallos reales con paths/stack traces/reproducción.
4. Auditar checkout, cuentas, configuración, administración e intake sin enviar pedidos ni exponer datos personales.
5. Abrir PRs pequeñas, cada una con alcance limitado, pruebas, rollback y contrato preservado.

### Ola B · integrar sin arrastrar cambios de otras ramas

Orden de revisión: **#186 → #187 → #188 → #189**. Por ser PRs stacked, después de integrar cada una actualizar base de la siguiente, recalcular el diff y evitar introducir al mismo tiempo migraciones posteriores. La secuencia SQL no se aplica por mera existencia de branch. El responsable de Supabase debe aprobar cambios antes de ejecutarlos, con backups y pruebas RLS negativas.

### Ola C · activar mínimo operable

Datos humanos reales y funciones seguras; después usuarios/roles; después pedido cero. La UI debe enseñar **pago pendiente de validación**, no un estado confirmado solo por cargar comprobante. Un pedido llegado por WhatsApp es atendido en el canal externo y luego incorporado mediante intake controlado, no mediante lectura automática del chat.

### Ola D · pulir solo defectos observados

Favicon y PWA, SEO público, enlaces, navegación, imágenes aprobadas, tiempos de carga, checkout y accesibilidad desktop/móvil. Los activos visuales se gobiernan por manifiesto V4. Se prohíbe reintroducir logo terracota y emblema viejo.

## Definición de hecho real y fuentes propietarias

- **Precio final / flete:** aprobado en una fuente comercial operativa; no derivarlo de plantilla V0.9 ni de DOM.
- **Stock inicial:** medido físicamente; `NULL` significa sin conteo; `0` solo cuando realmente se contó cero.
- **Costo real:** documento/factura o cálculo versionado con soporte; `INFERIDO` y `ESTIMADO` no equivalen a `CONFIRMADO`.
- **Pago:** archivo de comprobante en bucket privado y validación administrativa; subida ≠ dinero confirmado.
- **Hechos operativos:** stores propietarios y eventos trazables; no mezclar ventas planificadas con reales.
- **MFO:** privado; `Plan ≠ Real`, compras ≠ COGS y costo histórico faltante ≠ 0.
- **Demo:** datos sintéticos aislados y reversibles, prohibidos en el piloto productivo.

## Matriz de pruebas recomendadas por superficie

| Superficie | Prueba/fuente existente | Qué demostrar |
|---|---|---|
| Identidad, pestaña, PWA | `tests/e2e/browser-identity-v421.spec.js`, `brand-v4-*.spec.js` | Maestro V4 y favicon correctos sin assets rechazados. |
| Catálogo y carrito | `v4-store-catalog.spec.js`, `v4-store-editorial.spec.js`, `v4-checkout.spec.js` | Variantes, precios expuestos honestos y navegación sin JS errors. |
| Estados de checkout y pagos | `commerce-readiness-v422.spec.js`; tests adicionales de #189 después de integrar | No se piden PII ni se recibe orden si falta configuración; cálculo server-side. |
| Admin, sesión y permisos | `v42-admin-connectivity.spec.js`, `admin-legacy-integrity-v424.spec.js`, `v42-public-channel-connected.spec.js` | No permitir mutaciones después de caducidad, non-admin o caída remota. |
| Pedidos de atención externa | `connected-internal-orders-v423.spec.js` | Intake con trazabilidad, sin afirmar automatización WhatsApp. |
| Stock, BOM, costo | `master-data-v10.spec.js`, `inventory-valuation-v15.spec.js`, `historical-cost-snapshots-v14.spec.js` | No inventar stock/costo, preservar snapshots y trazabilidad. |
| Flujo interno | `operations-v16.spec.js`, `procurement-v25.spec.js`, `daily-close-v36.spec.js` | Pedido → producción → compra/recepción → cierre consistente. |
| Piloto | `pilot-*.spec.js` + pruebas de sesión real en entorno controlado | Inicio, observaciones, checkpoint, backup, reconciliación y salida. |
| Móvil/accesibilidad | Configuración Playwright desktop+móvil y auditorías de foco | Sin overflow, controles visibles, errores explicativos y responsive real. |
| Publicación | `.github/workflows/pages.yml`, `public-health*.yml` y `v4-contracts.yml` | `release_commit` y health sobre el mismo SHA; jamás declarar PASS de otro. |

### Comandos de comienzo (solo referencia, no sustituyen Actions)

```bash
git fetch --all --prune
git switch main
git pull --ff-only
git rev-parse HEAD
cat AGENTS.md
cat knowledge/99_HANDOFF/INDICE_CODEX_2026-10-12.md
cat knowledge/99_HANDOFF/CONTINUIDAD_CODEX_2026-10-07.md
python3 scripts/verificar_fuentes.py
python3 scripts/materializar_fuentes_locales_v28.py
python3 scripts/preparar_sitio_materializado_v28.py
npx playwright test
```

Leer los scripts actuales de Actions antes de lanzar tareas pesadas y ejecutar setup de dependencias en un entorno limpio. No suponer un `package-lock.json` hasta comprobarlo. No modificar o sobrescribir datos locales de la persona en Mac como parte de pruebas automatizadas.

## Mínimo que debe entregar Codex después de cada sesión

1. `baseline_sha`, rama, PR, fecha, archivos cambiados.
2. Hallazgos clasificados: **HECHO PROBADO / CODIGO PREPARADO / BLOQUEO / HIPOTESIS**.
3. Lista de pruebas ejecutadas con resultados y comando; cero atribuciones de tests no ejecutados.
4. Migraciones: **NO APLICADAS / APLICADAS / REVERTIDAS**, con evidencia de backend.
5. Riesgos de seguridad/privacy y condición GO/NO-GO.
6. Próximo cambio mínimo desbloqueado, nunca otra reescritura amplia del sistema.

## Cierre del piloto 30 días

Registrar por día: pedidos, conversiones, pagos revisados, unidades producidas, stocks verificados, restocks, entregas, fallos, tiempos y back-up/restore. Revisar semanalmente fricciones, ingresos reales versus plan y tareas P0. Al día 30 emitir decisión sobre continuidad, servicio, estructura de datos y mejoras V4.3, sin afirmar funcionalidades no desplegadas.

**Prohibido declarar “producción lista” sin evidencia G0–G10 del mismo corte.**
