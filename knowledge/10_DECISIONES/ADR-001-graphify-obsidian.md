# ADR-001 — Graphify + Obsidian como memoria de ingeniería

Estado: piloto.
Fecha: 2026-08-10.

## Contexto

ELERRANTE ya tiene múltiples capas funcionales, workflows, contratos históricos y pruebas. En iteraciones largas se pierde tiempo reconstruyendo dependencias y contexto cuando una conversación se agota.

## Decisión

Adoptar tres capas separadas:

- GitHub como autoridad técnica.
- Graphify como grafo estructural regenerable.
- Obsidian/Markdown como memoria humana persistente.

ChatGPT continúa como agente principal. Codex no es requisito del diseño.

## Reglas

1. `knowledge/90_GRAPHIFY_AUTO/` nunca contiene edición humana.
2. Las notas humanas nunca dependen de que Graphify esté disponible para ser entendidas.
3. Graphify se ejecuta inicialmente en modo `--code-only`: AST local, sin API/LLM y sin enviar código a un modelo externo.
4. La adopción no modifica barreras existentes: Playwright, auditorías, validaciones y Pages siguen siendo las autoridades de certificación funcional.
5. Los artefactos generados deben poder eliminarse y reconstruirse sin pérdida de conocimiento humano.

## Criterio para pasar el piloto a main

- El grafo se genera de forma estable en Actions.
- Las notas automáticas son navegables y útiles para localizar dependencias reales.
- El flujo no degrada CI ni genera ruido excesivo en Git.
- Una tarea real puede iniciarse usando el grafo con menos lectura manual de archivos.
