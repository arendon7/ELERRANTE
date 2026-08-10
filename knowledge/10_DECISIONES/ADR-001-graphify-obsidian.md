# ADR-001 — Graphify + Obsidian como memoria de ingeniería

Estado: piloto validado técnicamente.
Fecha: 2026-08-10.

## Contexto

ELERRANTE ya tiene múltiples capas funcionales, workflows, contratos históricos y pruebas. En iteraciones largas se pierde tiempo reconstruyendo dependencias y contexto cuando una conversación se agota.

## Decisión

Adoptar tres capas separadas:

- GitHub como autoridad técnica.
- Graphify como grafo estructural regenerable.
- Obsidian/Markdown como memoria humana persistente y superficie navegable.

ChatGPT continúa como agente principal. Codex no es requisito del diseño.

## Reglas

1. `knowledge/90_GRAPHIFY_AUTO/` nunca contiene información humana ni se versiona; es un export local opcional.
2. La superficie automática persistente será la wiki compacta `graphify-out/wiki/`, no el export de ~1.500 notas por nodo.
3. Las notas humanas nunca dependen de que Graphify esté disponible para ser entendidas.
4. Graphify se ejecuta inicialmente en modo `--code-only`: AST local, sin API/LLM y sin enviar código a un modelo externo.
5. Una relación `EXTRACTED` puede orientar navegación. Una relación `INFERRED` es una hipótesis y debe verificarse en fuente antes de decisiones arquitectónicas; nombres genéricos como `order()` pueden producir asociaciones espurias.
6. La adopción no modifica barreras existentes: Playwright, auditorías, validaciones y Pages siguen siendo las autoridades de certificación funcional.
7. Los artefactos generados deben poder eliminarse y reconstruirse sin pérdida de conocimiento humano.

## Evidencia del piloto

Sobre el código posterior a V1.5, Graphify generó 1.357 nodos, 2.452 relaciones y 154 comunidades, incluyendo SQL. El reporte indicó 97 % de relaciones extraídas, 3 % inferidas y 0 % ambiguas, sin ciclos de imports detectados.

La wiki permitió localizar de forma directa comunidades específicas como `inventory-valuation-v15.js`, `finance-inventory-valuation-v15.js`, `historical-cost-snapshots-v14.js`, `master-data-v10.js`, esquemas SQL, `service-worker.js` y sus pruebas asociadas.

## Criterio para pasar el piloto a main

- El grafo se genera de forma estable en Actions. ✅
- La wiki es navegable y útil para localizar dependencias reales. ✅
- El flujo no debe llenar Git con el export Obsidian por nodo. ✅ corregido con wiki compacta.
- Una tarea real debe iniciarse usando el grafo con menos lectura manual de archivos. Pendiente de validar durante el próximo ciclo funcional.
