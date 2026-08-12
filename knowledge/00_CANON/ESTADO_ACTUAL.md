# ELERRANTE — Estado canónico

Última verificación humana: 2026-08-11.

## Fuente canónica

- Repositorio: `arendon7/ELERRANTE`.
- Rama productiva: `main`.
- **No se fija aquí un SHA “actual” permanente**: antes de retomar trabajo debe consultarse el head real de `main`.
- SHA de referencia inmediatamente anterior al ciclo V3.7.4: `74f5e7bb2cea23c7b39a3be6c403a87ce1b52c4d`.
- Ese SHA ya incorporaba V3.7.3, Finanzas V3.5.1 y certificación pública completa.
- La superficie de piloto vigente al integrar este documento pasa a V3.7.4: motor V3.7.1 + intake V3.7.2 + salida/aprendizaje V3.7.3 + jornada diaria V3.7.4.

## Estado funcional vigente

- Control: V3.0 + horizonte V3.4 + capacidad V3.5 + continuidad V3.6.
- Operación: motores V2.1–V2.5 + evidencia V3.3 + horizonte V3.4 + capacidad V3.5 + cierre diario V3.6.
- Finanzas: workbench V3.1 + profundidad V3.2.x + costos V1.4/V1.5 + puente V3.4 + cierre gerencial V3.5 + mesa clara V3.5.1.
- Piloto operativo: backup/reconciliación V3.7.1 + captura interna V3.7.2 + revisión de salida V3.7.3 + guía diaria V3.7.4.
- Supabase: preparado, **inactivo**.
- Persistencia interna efectiva: navegador local controlado.
- GitHub Pages: revisión y demostración; nunca depósito de datos privados del piloto.

## Jornada del piloto V3.7.4

El piloto debe probar la cadena:

`pedido → producción → inventario → compra/recepción → cierre diario → caja → checkpoint → reconciliación → aprendizaje`

V3.7.4 lee los hechos existentes y orienta la jornada sin duplicarlos. Registra sólo observaciones propias en `ee_v374_pilot_daily_observations`, de forma append-only y con `supersedes`.

Estados diarios:

- `PILOT_INACTIVE`;
- `OUTSIDE_PERIOD`;
- `NO_ACTIVITY`;
- `IN_PROGRESS`;
- `READY_FOR_CHECKPOINT`;
- `DAY_COMPLETE`.

El checkpoint diario delega en V3.7.1 y conserva el backup privado vigente. Los timestamps se interpretan en `America/Bogota`.

## Gate del piloto V3.7.3

V3.7.3 registra revisiones append-only en `ee_v373_pilot_exit_reviews` y clasifica:

- datos que pueden seguir locales o necesitan persistencia compartida;
- acciones que pueden seguir locales o requieren identidad/rol real;
- superficies usadas diariamente, ocasionalmente, con fricción o no usadas.

Una conclusión final exige piloto cerrado + reconciliación `EVIDENCE_COMPLETE` + revisión vigente + clasificaciones completas.

Resultados finales:

- `LOCAL_MODEL_SUFFICIENT`;
- `BACKEND_DESIGN_CANDIDATE`.

`BACKEND_DESIGN_CANDIDATE` permite diseñar la siguiente arquitectura; **no activa Supabase**.

## Certificación

Una iteración sólo se considera cerrada cuando, sobre el mismo SHA productivo:

1. auditoría canónica = PASS;
2. validación/materialización = PASS;
3. Playwright desktop+móvil = PASS;
4. Pages = publicado;
5. health-check público aplicable = PASS;
6. documentación activa = coherente;
7. Graphify = regenerado desde ese `main`;
8. no quedan PR redundantes del ciclo.

GitHub Actions es la autoridad dinámica para el estado de certificación.

## Memoria de ingeniería

Graphify + Obsidian permanece integrado con esta separación:

- GitHub `main`: qué existe realmente;
- `knowledge/graphify-live`: memoria estructural regenerable;
- `knowledge/` en `main`: decisiones humanas, contratos y handoff;
- ChatGPT: orquestación, análisis e implementación.

La rama `knowledge/graphify-live` debe mostrar en `GRAPH_REPORT.md` el mismo commit base que el `main` consultado. Las relaciones `INFERRED` nunca sustituyen la verificación del código fuente.

## Regla de continuidad

Cuando una conversación se agote o se abra un chat nuevo:

1. consultar el SHA actual de `main`;
2. leer este estado canónico;
3. comprobar que `knowledge/graphify-live` fue construido desde ese `main`;
4. revisar sólo los archivos fuente y tests afectados;
5. consultar PRs/historial únicamente si hace falta explicar una decisión previa.

No reconstruir ELERRANTE sólo desde conversaciones antiguas cuando el repositorio contiene un estado más reciente.
