# ELERRANTE — Estado canónico

Última verificación humana: 2026-08-10.

## Fuente canónica

- Repositorio: `arendon7/ELERRANTE`.
- Rama productiva: `main`.
- SHA funcional base de esta integración: `074d1c8d68d80b4a4b88df28065652c080a6848e`.
- Último merge funcional: PR #109 — Inventario valorizado V1.5.
- Ese merge preserva Control V3.2, Finanzas V3.3 y los accesos de revisión ya certificados.

## Certificación observada sobre ese SHA

- Inventario valorizado V1.5: `success`.
- Costo histórico V1.4: `success`.
- Para una decisión de release, GitHub Actions sigue siendo la autoridad dinámica.

## Memoria de ingeniería

El piloto Graphify + Obsidian quedó validado técnicamente sobre este código:

- 1.357 nodos.
- 2.452 relaciones.
- 154 comunidades.
- SQL incluido mediante el parser correspondiente.
- 97 % de relaciones extraídas, 3 % inferidas y 0 % ambiguas en el reporte del piloto.

La arquitectura adoptada evita introducir commits generados en `main`: el workflow publica la memoria estructural en la rama regenerable `knowledge/graphify-live`. La memoria humana permanece en `main`.

## Regla de continuidad

Cuando una conversación se agote o se abra un chat nuevo, no reconstruir ELERRANTE solo desde conversaciones anteriores. Usar este orden:

1. `main` y este estado canónico.
2. `knowledge/graphify-live` para reporte/wiki Graphify.
3. código y tests concretos en `main`.
4. PRs/historial únicamente cuando haga falta explicar una decisión previa.

## Capas

- GitHub `main`: qué existe realmente.
- Graphify: cómo se relaciona técnicamente.
- Obsidian / `knowledge/`: por qué existe, qué decidimos y qué aprendimos.
- ChatGPT: orquestación, análisis e implementación.
