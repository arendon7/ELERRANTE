# ADR-001 — Graphify + Obsidian como memoria de ingeniería

Estado: piloto validado; propuesta para adopción.
Fecha: 2026-08-10.

## Contexto

ELERRANTE ya tiene múltiples capas funcionales, workflows, contratos históricos y pruebas. En iteraciones largas se pierde tiempo reconstruyendo dependencias y contexto cuando una conversación se agota.

## Decisión

Adoptar tres capas separadas:

- GitHub `main` como autoridad técnica.
- Graphify como grafo estructural regenerable.
- Obsidian/Markdown como memoria humana persistente y superficie de exploración local.

ChatGPT continúa como agente principal. Codex no es requisito del diseño.

## Reglas

1. La memoria estructural generada no se versiona en `main`; se publica en `knowledge/graphify-live`.
2. `knowledge/90_GRAPHIFY_AUTO/` nunca contiene información humana ni se versiona; es un export local opcional.
3. La superficie automática persistente principal es la wiki compacta `graphify-out/wiki/` de la rama viva, no el export masivo por nodo.
4. Las notas humanas nunca dependen de que Graphify esté disponible para ser entendidas.
5. Graphify se ejecuta en modo `--code-only`: AST local, sin API/LLM y sin enviar el código a un modelo externo.
6. Una relación `EXTRACTED` puede orientar navegación. Una relación `INFERRED` es una hipótesis y debe verificarse en fuente; nombres genéricos como `order()` pueden producir asociaciones espurias.
7. Playwright, auditorías, validaciones y Pages siguen siendo las autoridades de certificación funcional.
8. Toda memoria generada debe poder eliminarse y reconstruirse sin pérdida de conocimiento humano.

## Evidencia del piloto

Sobre el código posterior a V1.5, Graphify generó 1.357 nodos, 2.452 relaciones y 154 comunidades incluyendo SQL. El reporte indicó 97 % de relaciones extraídas, 3 % inferidas y 0 % ambiguas y no detectó ciclos de imports.

La wiki localizó directamente comunidades como `inventory-valuation-v15.js`, `finance-inventory-valuation-v15.js`, `historical-cost-snapshots-v14.js`, `master-data-v10.js`, los esquemas SQL, `service-worker.js` y pruebas asociadas.

## Resultado esperado

Al iniciar una tarea, ChatGPT parte del estado canónico y del mapa de impacto antes de leer archivos uno por uno. Al terminar, `main` conserva las decisiones humanas y la rama Graphify conserva la fotografía estructural del mismo `main`.
