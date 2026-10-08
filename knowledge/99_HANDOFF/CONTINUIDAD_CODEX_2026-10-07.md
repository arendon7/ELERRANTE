# EL ERRANTE — Dossier maestro de continuidad para Codex

**Corte de revisión:** 7 de octubre de 2026 · Colombia (America/Bogota)  
**Repositorio canónico:** https://github.com/arendon7/ELERRANTE  
**Web pública:** https://arendon7.github.io/ELERRANTE/  
**Rama estable consultada:** main  
**SHA confirmado de main:** a6edba45848a04437fb07b73e5d18cfdcdfc071b  
**Último commit observado en main:** 13 de septiembre de 2026 (hora de Colombia); merge de PR #185 / V4.2.4  
**Alcance de este documento:** consolidar decisiones de producto, diseño, arquitectura, trabajo implementado, deuda abierta y ruta concreta para que una nueva sesión de Codex pueda retomar sin depender de chats anteriores.

> **Jerarquía de verdad:** 1) código, tests y estado de GitHub en el HEAD real de main; 2) AGENTS.md y contratos canónicos del repositorio; 3) este dossier, fechado; 4) actas/conversaciones y documentos históricos. **Este dossier no sustituye una lectura en vivo del repo ni certifica funciones en producción.** No se han ejecutado aquí pruebas locales ni compras reales. Las verificaciones señaladas son lecturas de fuentes conectadas.

## 1. Qué estamos construyendo y para qué

El Errante es una marca de **pizza contemporánea** con una aplicación web pública y un sistema interno de operación. No es solamente una landing o un rediseño. El objetivo actual es poner el negocio a funcionar durante **un piloto real de 30 días**, con operación controlada, antes de declarar terminada la versión final.

Experiencia deseada del cliente:

1. Entrar en la web, comprender la propuesta gastronómica y consultar tienda/productos.
2. Elegir producto y variante, agregar al carrito y confirmar disponibilidad/cobertura real.
3. Crear un pedido con precio y flete calculados por una fuente confiable del servidor.
4. Pagar **100 % anticipado por transferencia** y cargar comprobante de forma privada; el pago no se debe mostrar como verificado automáticamente.
5. Recibir seguimiento honesto del pedido y atención vía WhatsApp como canal externo.

Experiencia deseada del equipo:

1. Ver pedidos web conectados y registrar pedidos recibidos por WhatsApp, teléfono o atención directa.
2. Revisar comprobantes, validar pago y cambiar estados por transiciones autorizadas.
3. Planificar producción, alistamiento, pedidos, materiales/BOM, inventarios, compras, recepción y restocks.
4. Registrar hechos y evidencias, cerrar la jornada, reconciliar y guardar respaldo.
5. Analizar caja, costos e indicadores sin mezclar plan con hechos reales.

**Fuera del alcance del GO inicial:** bandeja omnicanal de WhatsApp dentro de la app, pagos con pasarela no aprobada, transformación integral del frontend a otro framework y migración total del workbench financiero a base de datos remota. Esas mejoras pueden planearse sin detener el piloto.

## 2. Estado efectivo al 7 de octubre de 2026

### 2.1 Lo verificado en GitHub

| Componente | Estado y precisión |
|---|---|
| Fuente principal | Repositorio **arendon7/ELERRANTE**, rama main en el SHA indicado. |
| Publicación web | Proyecto con GitHub Pages y workflows; el último conjunto de ejecuciones consultado de septiembre figura en success para el mismo SHA. No equivale a una prueba en navegador realizada hoy. |
| Release integral nominal | README y package.json conservan **3.1.1**; motores, interfaces y contratos posteriores tienen numeración modular propia. No anunciar una hipotética release integral V4.2.5 como publicada. |
| Identidad pública V4 | Implementada en activos/capas V4; canon oficial vigente en AGENTS.md y documentacion/V4_BRAND_DIRECTION.md. |
| Tienda, fichas, variantes, carrito | Disponibles en el código público y cubiertos por pruebas E2E; README declara 11 productos y 14 variantes. No asumir inventario real o precio comercial final por esa sola razón. |
| Checkout | Tiene implementación preparada, guardas y validaciones; **no debe aceptar ventas reales** hasta completar backend seguro, datos aprobados y pedido cero. |
| Administración conectada e intake | El código de intake conectado de pedidos WhatsApp/teléfono fue fusionado en PR #181; su uso real sigue condicionado a backend, autenticación y seguridad. |
| Operación y Finanzas | Motores y herramientas locales de gran alcance, con capas acumulativas probadas; la mera presencia de overlays no significa persistencia remota total. |
| Centro de mensajes WhatsApp | **No existe un inbox real sincronizado.** Hay handoffs hacia WhatsApp y captura/gestión de pedidos por otras vías; no venderlo como integración bidireccional. |
| Gobierno de main | La protección obligatoria de rama sigue abierta en issues. El endpoint de branch protection devolvió 403 a la integración, por lo que no se verificó un ruleset activo. |
| Handoff y memoria | Existen knowledge/00_CANON/ESTADO_ACTUAL.md, knowledge/99_HANDOFF/COMO_RETOMAR.md y memoria Graphify, pero buena parte de la redacción de estado es anterior a la ola V4.2. |

### 2.2 Verificación directa de Supabase

El proyecto dedicado **el-errante-production** sí fue creado el 13 de septiembre de 2026. **Al consultar Supabase el 7 de octubre de 2026 aparece en estado INACTIVE.** El issue #179 todavía tiene una casilla histórica que lo describe como ACTIVE_HEALTHY: esa afirmación está desactualizada y no debe usarse para autorizar pedidos.

Por tanto: **NO-GO comercial hoy**. No intentar compras reales ni aplicar migraciones hasta reactivar/comprobar el proyecto y revisar el estado del esquema. La documentación de septiembre menciona schemas aplicados hasta V2.9 y comprobantes en un bucket privado; esto es evidencia histórica, **no una auditoría activa realizada hoy**.

### 2.3 Pull requests que determinan el siguiente trabajo

La lectura de GitHub muestra estas PR todavía abiertas, escalonadas; sus datos deben reconfirmarse en el inicio de cada sesión:

| Orden | PR | Trabajo | Situación observada |
|---|---|---|---|
| 0 | **#185** | V4.2.4 · transiciones seguras | **Fusionada** en main, 13 sep. |
| 1 | **#186** | V4.2.5 · conexión Pages con kill switch comercial y datos de pago honestos | **Abierta**. Habilita conexión técnica, no ventas. |
| 2 | **#187** | V3.0 · inventario desconocido permanece NULL/no contado | **Abierta**, depende de #186. Migración no aplicada según la PR. |
| 3 | **#188** | V3.1 · 31 maestros de materiales sin inventario inventado | **Abierta**, depende de #187. Migración no aplicada según la PR. |
| 4 | **#189** | V3.2 · pedido web con precios y logística calculados server-side | **Abierta**, depende de #188. No contiene precios ni fletes aprobados. |

Enlaces: https://github.com/arendon7/ELERRANTE/pull/186 · https://github.com/arendon7/ELERRANTE/pull/187 · https://github.com/arendon7/ELERRANTE/pull/188 · https://github.com/arendon7/ELERRANTE/pull/189

La **issue #179** concentra el bloqueo de GO: https://github.com/arendon7/ELERRANTE/issues/179 . Sus casillas reflejan el momento en que se redactaron; deben contrastarse con main, PRs y Supabase antes de actualizarse. Las #180, #182 y #184 están sustituidas (SUPERSEDED); no revivirlas como si fueran la solución actual.

## 3. Identidad, contenido e imágenes: canon que no debemos perder

**Identidad aprobada V4**:
- Nombre **EL ERRANTE** y descriptor **PIZZA CONTEMPORÁNEA**.
- Emblema: **pizzaiolo caminando y lanzando masa**.
- Estilo: ilustración negra predominante, oro envejecido discreto, fondo marfil, tipografía serif editorial para el wordmark.
- Año del lockup vigente: **EST. 2019**, según AGENTS.md y canon V4. Hubo conversaciones históricas con años distintos; **no prevalecen sobre el canon actual de main**.
- Idea editorial **Masa · Fuego · Territorio**: conservar como relato, no sustituir descriptor del logo.
- Paleta referencial: negro carbón #11110F, negro cálido #1A1916, marfil #F1EBDD, papel #E5DDCD, oro envejecido #B79A5B y oro profundo #8C713D.
- Tono: gastronomía contemporánea, oficio visible, voz colombiana precisa, relato Italia como escuela y Colombia como territorio; fotografía protagonista, no clichés rústicos o lujos vacíos.

**Fuentes obligatorias para Codex:** AGENTS.md → .agents/skills/el-errante-brand/SKILL.md → documentacion/V4_BRAND_DIRECTION.md → documentacion/CANON_EDITORIAL_V30.md → documentacion/CANON_VISUAL_PRODUCTO_V305.md.

**Activos y aprobación:** assets/images/brand-v4/manifest-v4.json y assets/images/brand-v4/generated-01-20/manifest.json. El banco V4 contiene 20 imágenes importadas con trazabilidad; **16 están habilitadas/promovidas según el manifiesto principal**. Cuatro imágenes **NO se pueden publicar**:
- 14-crea-la-tuya-v4.webp: escena mal clasificada y textos incrustados.
- 16-ayuda-v4.webp: textos/UI incrustados que duplican la página.
- 19-seguimiento-v4.webp: descriptor erróneo.
- 20-logo-lockup-v4-candidate.webp: exceso de dorado; no reemplaza al logo maestro.

El archivo **assets/images/brand-v4/pizzaiolo-mark-v4.webp** figura como marca pública/PWA. Los SVG históricos assets/logo-lockup.svg y assets/logo-mark.svg deben evaluarse contra la política V4: su mera existencia **no** los hace maestros actuales. El favicon/ícono de navegador es un requisito prioritario; documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md recoge la corrección V4.2.1: comprobar resultado visual real, no limitarse al cambio de código.

**Fotografías:** preservar autenticidad culinaria (producto, masa, ingredientes, rótulos, tamaño y composición). No inventar etiquetas ni gramos. Aire y Tiempo y Crea la Tuya tienen excepciones históricas de fotografía mientras no exista reemplazo aprobado; no confundir excepción con autorización general para volver a la identidad antigua.

**Sobre prompts visuales históricos:** las conversaciones previas describieron un paquete maestro de decenas de prompts y generación individual con control de marca, propósito UX, ratio, verdad de producto y criterios de rechazo. Este dossier **no afirma haber recuperado una transcripción literal completa de esos prompts**. El canon verificable y el banco de activos hoy están en el repositorio y sus manifiestos. Si se recupera el paquete original, archivarlo como referencia versionada, no modificar ni publicar imágenes sin auditoría.

## 4. Mapa de la aplicación y fuentes canónicas

### Web pública
- index.html — Home.
- tienda.html, producto.html — catálogo/fichas/variantes.
- en-casa.html — segundo fuego/consumo en casa.
- en-movimiento.html, caso-evento.html — eventos/servicio.
- metodo.html, historia.html, nosotros.html, equipo.html, juan-david-ocampo.html, bitacora.html — editorial/autoría.
- recetas.html, receta.html, herramientas.html — contenido de apoyo.
- cobertura.html, ayuda.html, checkout.html, cuenta.html, legal.html, offline.html — conversión, soporte, confianza.
- manifest.webmanifest, service-worker.js y assets de identidad — instalación/offline/favicon.

### Web interna
- acceso.html y centro-interno.html — entrada/sesión/selección.
- control.html — alertas y prioridades.
- operacion.html — pedidos, producción, BOM, inventario, compras, evidencias y cierre.
- finanzas.html — Plan vs. Real, costos, escenarios, caja y decisiones.
- studio.html y actas.html — datos maestros, evidencia y validación.
- piloto-operativo.html — jornadas, backups, checkpoints, conciliación y aprendizaje.
- configuracion-publica.html — gobierno actual de datos públicos de pedidos y pagos.
- admin.html — compatibilidad administrativa heredada, no lugar preferente para desarrollar nuevas capacidades.

### Arquitectura y límites
- Frontend **HTML/CSS/JavaScript** con capas históricas/overlays; no migrar de framework por estética.
- Sitio materializado con **scripts/materializar_fuentes_locales_v28.py** y **scripts/preparar_sitio_materializado_v28.py**; los nombres V2.8 reflejan la base canónica, no una versión integral obsoleta.
- Publicación mediante GitHub Pages y workflows; pruebas con **Playwright desktop y móvil**, regresión, auditoría canónica, verificadores de contratos, Graphify y health-check.
- Capas del sistema interno nominal: release 3.1.1, motor Control 3.0 + overlays, Operación base 3.3 y capas 3.4–3.7, Finanzas base 3.2.9 con capas 3.4/3.5, pilotos 3.7.x y UI posterior V3.8–V4.0. Usar el mapa vivo **documentacion/REGISTRO_CAPACIDADES_V41.md** y no deducir activación sólo por el número de archivo.
- El backend se prepara en backend/supabase/schema-v*.sql y con RPC/RLS. Las propuestas #187–#189 traen nuevas migraciones: **no asumir que archivos en PR están en main ni desplegados**.
- La mayor parte de motores de Finanzas/Operación conserva fuentes locales y no debe convertirse automáticamente en multiusuario al activar comercio.

### Invariantes no negociables
1. Inventario desconocido **no es cero**; NULL/“No contado” hasta conteo físico, 0 sólo cuando se comprobó.
2. Necesidad BOM **no es** compra realizada.
3. Compra, COGS, inventario y caja representan hechos diferentes.
4. Costo histórico faltante **no se rellena** con costo estándar vigente ni con 0.
5. Plan financiero **no es** venta real.
6. Registros de evidencia/cierre se corrigen de forma trazable (append-only y supersedes), sin sobrescribir los hechos originarios.
7. Demo **no es** operación real; nunca sembrar datos sintéticos en producción.
8. Páginas públicas **no reciben service_role/secret keys**.
9. Si red, sesión o permiso fallan, no mostrar éxito ni degradar en silencio al modo local.
10. Los precios finales y el flete de un pedido web los fija el servidor; no el DOM.
11. Un handoff WhatsApp no equivale a mensaje enviado ni a pedido recibido.
12. Una PR verde no equivale a una migración aplicada ni a un GO comercial.

## 5. Trabajo desarrollado que se debe preservar

La historia técnica parte de una base materializada V2.8 y narrativa/editorial V2.9. Luego se construyó un sistema interno con acceso, control, operación, finanzas, datos maestros y piloto. La identidad V4 evolucionó de manera separada y se integró como capa pública editorial, con banco visual auditado, responsive y pruebas. V4.1/V4.2 añadieron gobierno de capacidades, contratos de conectividad, autenticación administrativa, configuración pública, política de lectura, comprobantes, intake de pedidos y hardening.

**No reiniciar el producto. No hacer otra oleada de rediseño especulativo.** La prioridad decidida en las conversaciones de septiembre fue estabilizar y activar una beta operativa con tienda, transferencia, pedido, WhatsApp externo, inventario y restock reales.

**Señales de fuentes parcialmente históricas:** README.md, knowledge/00_CANON/ESTADO_ACTUAL.md e INDICE_DOCUMENTACION_ACTIVA.md conservan parte del panorama 3.1.x/3.7.x y pueden no reflejar los últimos contratos V4.2. Contrastarlos con código, PR y registro de capacidades. El documento documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md, de 13 de septiembre, decía que aún no existía Supabase dedicado; esa parte fue superada por la creación posterior y hoy además el proyecto está INACTIVE.

## 6. Qué falta para aceptar pedidos reales — orden de ejecución

### P0 · Recuperar verdad operativa
- Revalidar HEAD, diff y estado de #186/#187/#188/#189; verificar si alguna fue reemplazada o rebasada.
- Reactivar/verificar **el-errante-production** bajo control del administrador y revisar estado de Auth, migraciones, tablas, RLS, Storage privado, RPCs, advisories y backups. **No aplicar migraciones “a ciegas”.**
- Confirmar status real de Pages, marca/favicon, scripts y pruebas.
- Habilitar ruleset/branch protection sobre main con PRs, checks obligatorios, sin force push, si aún no existe. No confundir un 403 de lectura con confirmación de desprotección.
- Mantener comercio bloqueado durante todo el proceso.

### P0 · Integrar capas conectadas con orden y evidencia
- Revisar y certificar **#186**: conexión Pages sólo host oficial; publishable key pública; datos bancarios vacíos, sin inventar entidad; kill switch comercial apagado.
- Revisar, aislar, certificar e integrar **#187**: semántica NULL/no contado; aplicar la migración V3.0 **sólo** con plan de cambio/rollback y pruebas sobre entorno correcto.
- Revisar e integrar **#188**: 31 maestros de materiales sin inventario ni costos confirmados inventados; respetar datos existentes.
- Revisar e integrar **#189**: RPC de pedido web con cálculo de precios, variantes, flete, idempotencia, comprobante privado y permisos. El pricebook nace vacío; su integración **no autoriza** ventas.
- Cada paso requiere diff acotado, PR, barreras en verde sobre el SHA correcto, verificación de migración aplicada y actualización del registro de capacidades. No fusionar ramas stacked fuera de orden.

### P0 · Completar datos y permisos reales
- Aprobar precios por **SKU/variante** en un libro comercial real; no copiar automáticamente cifras demo.
- Aprobar política y cálculo server-side de domicilio/flete: cotización manual validada, tarifa fija o por zona sólo con reglas comprobables.
- Definir WhatsApp oficial, correo/canal de soporte y horarios/cobertura.
- Definir datos reales de transferencia: banco, titular, tipo, número de cuenta y/o llave; regla **100 % anticipado más comprobante**. No publicar datos bancarios ficticios.
- Crear acceso Auth administrativo permanente y validar rol/RPC administrativa.
- Permitir **Anonymous Sign-Ins** para shoppers **únicamente después** del cierre del gate server-side de precios, fletes, escritura segura y RLS. No confiar sólo en que la interfaz oculte el botón.
- Conteo físico real de inventario y carga de cantidades verificadas; no sembrar stock 0 para salir del paso.
- Validar costos reales/estimados/inferidos como categorías distintas.

### P0 · Pedido cero completo, controlado
Probar desde un navegador limpio:

**Tienda → variante → carrito → checkout → cálculo servidor → transferencia y referencia → comprobante privado → pedido y líneas → revisión administrativa → confirmación de pago → transición autorizada → producción/alistamiento → consumo o control de inventario → compra/recepción/restock → despacho/entrega → cierre de jornada → checkpoint, backup y reconciliación.**

Criterios de aceptación: totals no manipulables en cliente, RLS protegida, idempotencia en reintentos, comprobante no público, usuario no admin sin poder mutar pedidos, inventario desconocido preservado, no pérdida de datos con sesión expirada, no retroalimentación de demo y sin editar manualmente tablas para completar el recorrido.

### P1 · Pulido de experiencia y contenido
Verificar realmente en desktop y móvil: title, favicon/PWA, menú, Home, tienda, producto, carrito, checkout, cobertura, ayuda, contacto, registro de pedidos, y accesibilidad de formularios, errores, textos y estados. Corregir defectos concretos observados, sin reemplazar maestros gráficos ya aprobados ni alterar motores estables.

### P1 · Piloto de 30 días
- GO sólo después de pedido cero certificado y verificación de Seguridad/Pages/Supabase.
- Registrar cada día pedidos, comprobantes, producción, inventarios, compras, entregas, cierre, checkpoint, backup y excepciones.
- Semanalmente revisar tasa de checkout completado, abandono, pagos pendientes, tiempos de preparación, roturas de stock, ajustes/correcciones y errores técnicos.
- Distinguir mejoras P0 de mejoras P2. Preparar al día 30 decisión de continuar local-first o expandir persistencia remota, basada en evidencia de uso.
- No habilitar un inbox omnicanal ficticio: WhatsApp sigue como canal de atención externa durante el piloto.

## 7. Gobierno técnico y comandos de comienzo

Antes de tocar código, **leer**: AGENTS.md; knowledge/00_CANON/ESTADO_ACTUAL.md; knowledge/README.md; documentacion/REGISTRO_CAPACIDADES_V41.md; documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md; documentacion/ROADMAP_V41_V43.md; las PR vigentes; y el contrato específico del módulo.

Trabajar mediante rama/PR propia desde el main más reciente. Un cambio debe declarar objetivo, archivos, fronteras, pruebas, resultado, riesgos, rollback y SHA. Nunca usar un resultado verde de un SHA distinto. No publicar directamente desde esta rama documental.

Comandos orientativos para inspección local (usar el procedimiento de CI del repo para la certificación real):

~~~bash
git clone https://github.com/arendon7/ELERRANTE.git
cd ELERRANTE
git fetch --all --prune
git checkout main
git pull --ff-only
git rev-parse HEAD
python3 scripts/verificar_fuentes.py
python3 scripts/materializar_fuentes_locales_v28.py
python3 scripts/preparar_sitio_materializado_v28.py
npm install
npx playwright test
~~~

**Precaución:** el repositorio consultado contiene package.json con Playwright, pero no se observó lockfile npm en main. No presumir reproducibilidad de npm ci hasta revisar/crear lockfile mediante cambio separado. Las barreras oficiales viven en .github/workflows/ y sus comandos/condiciones deben prevalecer sobre los orientativos anteriores.

Protocolo de conclusión para Codex:
- Describir el SHA de origen y la PR/branch.
- Enumerar tests **realmente ejecutados**, no afirmaciones hipotéticas.
- Separar **código preparado**, **merge hecho**, **migración aplicada**, **servicio activo** y **flujo E2E real probado**.
- Si algo requiere acceso humano (activación de proyecto, credenciales, precio, pagos, ruleset), dejarlo explícitamente en una tabla de bloqueos sin simular cumplimiento.
- No exponer PII, costos privados, snapshots, contraseñas o llaves en un repositorio público.

## 8. Biblioteca mínima para ampliar investigación sin rehacerla

| Necesidad | Referencia principal |
|---|---|
| Contexto de Codex y reglas de marca | AGENTS.md |
| Memoria humana de proyecto | knowledge/README.md; knowledge/00_CANON/ESTADO_ACTUAL.md; knowledge/99_HANDOFF/COMO_RETOMAR.md |
| Dirección de marca V4 | .agents/skills/el-errante-brand/SKILL.md; documentacion/V4_BRAND_DIRECTION.md |
| Activos aprobados/rechazados | assets/images/brand-v4/manifest-v4.json; assets/images/brand-v4/generated-01-20/manifest.json |
| Verdad de productos | documentacion/CANON_PRODUCTO_V303.md; documentacion/CANON_VISUAL_PRODUCTO_V305.md; documentacion/productos/ |
| Estado de módulos y fuentes | documentacion/REGISTRO_CAPACIDADES_V41.md; documentacion/MAPA_DATOS_Y_FUENTES.md |
| Arquitectura interna | documentacion/ARQUITECTURA_INTERNA_V31.md |
| Historia de versiones | README.md; CHANGELOG.md; documentacion/MAPA_VERSIONES_ACTIVAS.md |
| Ruta de piloto y seguridad | documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md; issue #179 |
| Piloto local/diario | documentacion/PILOTO_OPERATIVO_V37.md; documentacion/PILOTO_JORNADA_V374.md; documentacion/PILOTO_SALIDA_V373.md |
| Branches y CI | .github/workflows/; docs/FLUJO_GITHUB.md; tests/e2e/ |
| Graphify (si está al día) | rama knowledge/graphify-live; revisar su Built from commit |

## 9. Primer encargo recomendado para Codex (copiar y ejecutar como instrucción)

~~~text
Trabajaremos en arendon7/ELERRANTE. Lee primero AGENTS.md y
knowledge/99_HANDOFF/CONTINUIDAD_CODEX_2026-10-07.md.
No reconstruyas el producto desde cero ni cambies el diseño aprobado.

1. Obtén el HEAD actual de main y contrasta el dossier con código,
   REGISTRO_CAPACIDADES_V41.md, issue #179 y las PR #186 a #189.
2. Confirma qué PR siguen abiertas, cuáles son stacked y cuál puede
   integrarse primero sin arrastrar diffs o migraciones ajenas.
3. Revisa los workflows, fallos E2E y barreras de privacidad/RLS.
4. Comprueba Supabase real; si está INACTIVE, registra el bloqueo y
   NO actives checkout ni asumas que hay backend saludable.
5. Entrega un diagnóstico corto pero verificable (HECHO / FALTA / BLOQUEA),
   seguido de plan por PRs pequeñas hacia pedido cero y beta 30 días.
6. Preserva logo V4, año EST. 2019, manifiesto visual, fuentes canónicas,
   cero ficticio prohibido, costos históricos, demos aisladas y
   confirmación humana de precios, banco, cobertura y roles.
7. Empieza a resolver la primera tarea técnica desbloqueada en una
   rama propia, corre las pruebas relevantes y documenta el resultado.
8. NO integres a main, NO modifiques backend productivo, NO habilites
   Anonymous Sign-Ins, NO recibas compras reales y NO marques GO
   sin certificación explícita y los gates humanos completos.
~~~

## 10. Registro de vacíos y siguientes actualizaciones de este dossier

- **Acceso en vivo vs. lectura documental:** GitHub se consultó hasta el último main visible de septiembre; la lista de PR y los checks puede cambiar mañana.
- **Supabase:** el estado INACTIVE se confirmó hoy mediante la conexión disponible; la configuración y datos internos no pudieron verificarse mientras permanezca inactivo.
- **Conversaciones anteriores:** se incorporaron decisiones y referencias conocidas del proyecto, no una transcripción exhaustiva de cada chat ni todas las decenas de prompts externos. Evitar la afirmación “todo está recuperado” sin contraste documental.
- **Datos comerciales:** precios, coberturas, medio de pago, domicilio, WhatsApp, inventario físico y costos aprobados deben provenir de fuentes reales autorizadas; no completarlos por inferencia.
- **Evolución:** al finalizar cada PR con cambio sustantivo, registrar fecha, nuevo SHA, verificación, capacidades afectadas, bloqueos restantes y decisión GO/NO-GO. Mantener este dossier como índice y transferir hechos canónicos estables a los documentos propietarios.

---

**Resumen ejecutivo:** La aplicación tiene una base técnica y visual extensa; la tarea correcta no es comenzar de nuevo. La ruta crítica actual es recuperar salud de backend, integrar el stack de PRs con controles de seguridad, aprobar datos comerciales verdaderos, probar el pedido cero de extremo a extremo y sólo entonces iniciar 30 días de beta controlada.
