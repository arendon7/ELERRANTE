# ELERRANTE — Estado canónico

Última verificación humana: 2026-08-10.

## Fuente canónica

- Repositorio: `arendon7/ELERRANTE`
- Rama productiva: `main`
- SHA productivo base del piloto: `074d1c8d68d80b4a4b88df28065652c080a6848e`
- Último merge funcional: PR #109 — Inventario valorizado V1.5.
- El merge declara preservados Control V3.2, Finanzas V3.3 y los accesos de revisión ya certificados.

## Certificación observada sobre ese SHA

- Certificar inventario valorizado V1.5: `success`.
- Certificar costo histórico V1.4: `success`.
- GitHub registró seis workflow runs asociados al SHA post-merge; para decisiones de release debe consultarse Actions como autoridad dinámica.

## Infraestructura de conocimiento en evaluación

- Rama piloto: `infra/graphify-obsidian-pilot-v1`.
- Graphify 0.9.26 + parser SQL ejecutado correctamente en GitHub Actions.
- Primer mapa validado: 1.357 nodos, 2.452 relaciones y 154 comunidades.
- Wiki compacta generada para ChatGPT/Obsidian.
- El export Obsidian completo por nodo se mantiene local y fuera de Git para evitar ruido/deuda de repositorio.
- Esta infraestructura todavía no altera `main` ni la aplicación productiva.

## Regla de continuidad

Cuando una conversación se agote o se abra un chat nuevo, no reconstruir el proyecto solo desde memoria conversacional. Leer primero esta nota, luego `graphify-out/GRAPH_REPORT.md` y la wiki Graphify, y finalmente confirmar el código afectado en `main`.

## Capas de memoria

- GitHub: qué existe realmente.
- Graphify: cómo se relaciona técnicamente.
- Obsidian / `knowledge/`: por qué existe, qué decidimos y qué aprendimos.
- ChatGPT: orquestación, análisis e implementación.
