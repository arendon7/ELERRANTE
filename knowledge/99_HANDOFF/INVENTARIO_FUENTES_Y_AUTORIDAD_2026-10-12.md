# El Errante — Inventario de fuentes, decisiones y autoridad

**Corte:** 12 de octubre de 2026. **Propósito:** saber dónde consultar cada verdad antes de diseñar, editar, migrar, publicar o activar ventas.

## Jerarquía

1. **Hecho real observado y autorizado:** factura, pesaje, receta versionada/aprobada, conteo físico, soporte de pago, evidencia de pedido y base activa verificada.
2. **Estado técnico actual:** HEAD de `main`, archivos fuente, contratos, tests, PRs, migraciones *aplicadas* y configuración/servicios vivos.
3. **Identidad / editorial:** `AGENTS.md`, `.agents/skills/el-errante-brand/SKILL.md`, `documentacion/V4_BRAND_DIRECTION.md`, `documentacion/CANON_EDITORIAL_V30.md` y `documentacion/CANON_VISUAL_PRODUCTO_V305.md`.
4. **Manifiestos:** `assets/images/brand-v4/manifest-v4.json` y `assets/images/brand-v4/generated-01-20/manifest.json`; assets rechazados no son publicables.
5. **Diseño de operaciones y finanzas:** contratos vigentes de `documentacion/`, registro de capacidades, schemas y modelo financiero; las cifras de planificación no son hechos contables.
6. **Fuentes antiguas y conversaciones:** explican origen, propuestas y decisiones superadas, pero no sustituyen evidencia vigente ni código certificado.

## Fuentes técnicas en GitHub público

| Fuente | Información propietaria | Uso al retomar |
|---|---|---|
| `AGENTS.md` | Guardas de Codex, marca y límites de cambios | Leer primero en cualquier rama. |
| `knowledge/00_CANON/ESTADO_ACTUAL.md` | Memoria humana con último corte explícito en agosto | Tratar **como snapshot histórico**, no como reporte vivo de Supabase V4.2. |
| `knowledge/99_HANDOFF/COMO_RETOMAR.md` | Rutina original de Graphify y versiones | Leer con el nuevo dossier. |
| `knowledge/99_HANDOFF/CONTINUIDAD_CODEX_2026-10-07.md` | Contexto integral, guardas y plan de beta | Punto de entrada de Codex; snapshot fechado. |
| `knowledge/99_HANDOFF/MATRIZ_VISUAL_65_SPECS_2026-10-12.md` | Cruce de 65 roles históricos con candidatos V4 | Evitar rehacer imágenes ya resueltas. |
| `documentacion/REGISTRO_CAPACIDADES_V41.md` | Contratos, activos, stores, estados por módulo | Distinguir ACTIVE/PREPARED/INACTIVE/LEGACY, y actualizar tras merges. |
| `documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md` | Plan de activación original | **Fecha 2026-09-13:** algunas afirmaciones de no-existencia de backend están superadas. |
| `documentacion/MAPA_DATOS_Y_FUENTES.md` | Diferencia entre demo, hechos locales, remotos y privados | No fusionar stores ni confundir simulaciones con producción. |
| `documentacion/CANON_PRODUCTO_V303.md`, `CANON_VISUAL_PRODUCTO_V305.md` | Evidencia de producto e imagen | Prevalece sobre prompts históricos. |
| `documentacion/productos/` | Fichas maestras por SKU y madurez editorial | Revisión contra gramajes y formulaciones aprobadas. |
| `backend/supabase/` | SQL versionado de backend | Preparado en repo **no significa aplicado** en proyecto real. |
| `tests/e2e/` y `.github/workflows/` | Regresión y gates de certificación | Repetir sobre el SHA correcto; no presentar éxito viejo como nuevo. |
| `knowledge/graphify-live` (rama) | Estructura derivada del código | Comparar siempre `Built from commit` con main real. |

## Documentos externos encontrados en Google Drive

**Ubicación segura:** Drive de la cuenta conectada; buscar por el **nombre exacto**. No se incluyen enlaces internos o ID de archivos privados porque `ELERRANTE` es un repositorio público. Los títulos se verificaron por búsqueda, pero la vigencia de datos y duplicados requiere cotejo.

| Fuente | Clasificación | Observación / acción segura |
|---|---|---|
| `EL_ERRANTE_MASTER_VISUAL_PROMPTS_V1.xlsx` | Visual histórico; control no confidencial | **65 specs (61 principales, 4 opcionales)**, 14 familias; year lock V1 `EST. 2024` vs V4 `EST. 2019`. Referenciar, no sobreescribir. |
| `EL_ERRANTE_Transferencia_Financiera_Operativa_Respuesta_Completa_v1.docx` | **CONFIDENCIAL**; esquema de 18 módulos | Contiene 14 SKU preliminares, materiales, recetas, producción, costos, inventarios, ventas, MFO, caja, vacíos y priorización. Revalidar soportes; no copiar cifras en público. |
| `EL_ERRANTE_Cuestionario_Maestro_Transferencia_Financiera_Operativa.docx` | Privado, cuestionario | Usa un esquema de faltantes y métodos de validación; no eleva respuestas inferidas a certeza. |
| `MFO_EL_ERRANTE_v3_3_Decisiones_y_Escenarios.xlsx` | **CONFIDENCIAL**; modelo financiero | El repositorio referencia el perfil v3.3; se debe verificar versión, fórmulas, aprobaciones y vigencia antes de importar. |
| `MFO_EL_ERRANTE_24_MESES_v1.xlsx`, `MFO_EL_ERRANTE_24_MESES_v2_CLARO.xlsx` | Históricos/privados | Archivo de evolución del modelo; no usar como información financiera vigente. |
| `Receta estandar EL ERRANTE.xlsx` (copias) | **CONFIDENCIAL**; receta | Existen varias copias; distinguir fecha, aprobación y soporte antes de incorporarla a BOM. |
| `Base de Datos EL ERRANTE.xlsx` (copias) | **CONFIDENCIAL** potencial | Duplicados; revisión humana antes de vincular personas, proveedores o clientes. |
| `El Errante proyecto.docx` (copias) | Histórico de proyecto | Documentar diferencias frente a la visión/estado actuales. |
| `Fotos El Errante` y `ELERRANTE_PAQUETE_VISUAL_V1_10` (carpetas) | Imágenes históricas | No trasladar a V4 sin evaluar autenticidad, derechos, marca y vigencia. |
| `ELERRANTE_WEB_HQ_V13` (carpeta) | Assets heredados | Puede servir de referencia de origen; no promocionar automáticamente. |
| `Logo El Errante Barril.pdf` | Archivo histórico de marca | **No** sustituye emblema maestro V4. |

## Contradicciones expresamente identificadas

| Asunto | Fuentes en tensión | Resolución canónica actual |
|---|---|---|
| Año del logo | Planilla visual V1: `EST. 2024`; canon V4: `EST. 2019` | Prevalece `EST. 2019` del código y `AGENTS.md`. |
| Color dominante | Visual V1: terracota/vino como elementos de paleta; V4: negro/marfil/oro | Negro/marfil/oro V4. |
| Cantidad de prompts | Conteo anterior erróneo: 56; workbook: 65 | **65 (61 + 4)**. |
| Estado de backend | Auditoría del 13-sep decía no creado; issue #179 decía healthy; consulta de octubre lo muestra `INACTIVE` | Solo una nueva verificación **en vivo** autoriza el estado actual; hasta entonces NO-GO. |
| Versión integral vs módulos | README 3.1.1; múltiples overlays V4/V3.x | La etiqueta global no define cada capacidad; usar registro + fuente + release_commit. |
| Estado de imágenes | Banco generado 20 archivos; 4 rechazados; manifiesto 16 publicables/promovibles | La presencia física de un archivo no equivale a aprobación o uso en página. |
| Centro de mensajes | Handoffs y intake comercial vs inbox real sincronizado | El inbox bidireccional de WhatsApp **no está implementado**; handoff y pedido manual/administrativo sí son capacidades distintas. |

## Checklist de gobierno documental

- [ ] Congelar índice de docs activos e históricos y alinear README/registro de capacidades con releases efectivamente integradas.
- [ ] Registrar una copia **privada** de las fuentes de negocio y su propietario, fecha, versión, aprobación y nivel de confidencialidad.
- [ ] Reconciliar las 65 Prompt Specs V1 sin generar automáticamente 65 imágenes: compararlas contra slots realmente usados y activos aprobados.
- [ ] Vincular cada fórmula/receta/BOM/stock/costo a soporte observado, fecha y aprobador.
- [ ] Diferenciar proyectos, environments, storage y secrets, sin copiar claves al repositorio.
- [ ] Versionar decisiones de cambio por ADR/cambio validado, con enlaces a pruebas y PR.
- [ ] Actualizar el dossier después del primer pedido cero certificado y durante las cuatro semanas de piloto.

**Regla de privacidad:** el repo público contiene rutas, reglas, esquemas y estado **no sensible**. Los XLSX de costos, recetas privadas, backups, datos personales, comprobantes, contraseñas y claves nunca se suben allí. El acceso a Drive/Supabase requiere autorización y comprobación en el entorno apropiado.
