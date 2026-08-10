# ELERRANTE — Estado canónico

Última verificación humana: 2026-08-10.

## Fuente canónica

- Repositorio: `arendon7/ELERRANTE`.
- Rama productiva: `main`.
- SHA actual de `main` al cerrar esta verificación: `a5f7bb84cc1a61364c831ee0252dfc523c3dcf48`.
- Último merge funcional: PR #109 — Inventario valorizado V1.5, base funcional `074d1c8d68d80b4a4b88df28065652c080a6848e`.
- Último merge de infraestructura/memoria: PR #113 — Graphify + Obsidian.
- PR #113 no modifica la aplicación; preserva Control V3.2, Finanzas V3.3, Inventario valorizado V1.5 y los accesos de revisión certificados.

## Certificación observada sobre el `main` actual

- Inventario valorizado V1.5: `success`.
- Costo histórico V1.4: `success`.
- Publicación real / health-check: `success`.
- No existen workflows fallidos ni en ejecución sobre `a5f7bb84…` al cerrar esta verificación.
- Para cualquier decisión futura de release, GitHub Actions sigue siendo la autoridad dinámica.

## Accesos de revisión certificados

- `juancho / juancho` — rol visual `Revisor`.
- `lucho / lucho` — rol visual `Revisor`.
- El administrador local permanece independiente y no es reemplazado por las cuentas de revisión.

## Memoria de ingeniería

Graphify + Obsidian quedó integrado y regenerado sobre el `main` actual:

- snapshot vivo: `bf4cd2d47a4018b8e3ec4a8f3526a96dc864ebee`;
- construido desde `a5f7bb84`;
- 1.357 nodos;
- 2.452 relaciones;
- 154 comunidades;
- SQL incluido mediante el parser correspondiente;
- 97 % de relaciones extraídas, 3 % inferidas y 0 % ambiguas en el reporte.

La arquitectura adoptada evita introducir commits generados en `main`: el workflow publica la memoria estructural en la rama regenerable `knowledge/graphify-live`. La memoria humana permanece en `main`.

## Regla de continuidad

Cuando una conversación se agote o se abra un chat nuevo, no reconstruir ELERRANTE solo desde conversaciones anteriores. Usar este orden:

1. confirmar el SHA actual de `main` y leer este estado canónico;
2. consultar `knowledge/graphify-live` y comprobar que `GRAPH_REPORT.md` fue construido desde ese `main`;
3. revisar únicamente los archivos fuente y tests concretos afectados por la tarea;
4. consultar PRs/historial solo cuando sea necesario explicar una decisión previa.

Las relaciones `INFERRED` de Graphify nunca sustituyen la verificación del código fuente.

## Capas

- GitHub `main`: qué existe realmente.
- Graphify: cómo se relaciona técnicamente.
- Obsidian / `knowledge/`: por qué existe, qué decidimos y qué aprendimos.
- ChatGPT: orquestación, análisis e implementación.
