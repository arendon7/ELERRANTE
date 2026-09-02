# EL ERRANTE · Auditoría integral y proceso de desarrollo

Fecha de corte: 2026-09-02  
Repositorio: `arendon7/ELERRANTE`  
Baseline auditado de `main`: `a281a8ab52ac4968996ad5a6d0fbf6d0b7d57a04`

## 1. Conclusión ejecutiva

El proyecto ya no está en una etapa de “construir una web”. Existe un producto digital amplio con dos capas que deben gestionarse por separado:

1. **Experiencia pública V4**: marca, narrativa, tienda, producto, En Casa / Segundo Fuego, En Movimiento, Método, Historia, Bitácora, Juan David, recetas, herramientas, ayuda, cobertura y flujos comerciales.
2. **Aplicación integral interna**: shell y runtime heredados/evolutivos, administración, control, operación, finanzas, inventario, actas, Studio y superficies de acceso, con persistencia local y una ruta preparada —pero no activada como seguridad real multiusuario— hacia Supabase Auth + RLS.

El rediseño público V4 ya fue integrado en `main`. Por tanto, la prioridad correcta no es iniciar V5 ni producir nuevas imágenes por inercia. La prioridad es **cerrar hardening pendiente, reconciliar documentación, proteger el proceso de release, completar SEO/AEO técnico, medir calidad y continuar únicamente mediante defectos observados u oportunidades medibles**.

## 2. Estado real del repositorio

### 2.1 Baseline de producción

`main` apunta al merge de la candidatura pública V4 del 2026-08-21. La Home de `main` ya implementa:

- identidad canónica del pizzaiolo caminando/lanzando masa;
- `EL ERRANTE · PIZZA CONTEMPORÁNEA · EST. 2019`;
- paleta carbón / negro cálido / marfil / dorado envejecido;
- hero “Pizza contemporánea. En movimiento.”;
- narrativa editorial en lugar de una cuadrícula genérica de tarjetas;
- carta destacada;
- En Casa / Segundo Fuego;
- En Movimiento;
- Despensa;
- Método + Bitácora;
- autoría de Juan David;
- cierre comercial fuerte;
- navegación, carrito, PWA, cookies y acceso de usuarios.

### 2.2 Arquitectura pública disponible

Rutas públicas relevantes existentes en la raíz incluyen:

- `index.html`
- `tienda.html`
- `producto.html` (contenido parametrizado)
- `en-casa.html`
- `en-movimiento.html`
- `caso-evento.html`
- `metodo.html`
- `historia.html`
- `juan-david-ocampo.html`
- `bitacora.html`
- `articulo.html` (contenido parametrizado)
- `recetas.html`
- `receta.html` (contenido parametrizado)
- `herramientas.html`
- `cobertura.html`
- `ayuda.html`
- `legal.html`
- `checkout.html`
- `cuenta.html`

No todas deben ser indexables. Checkout, cuenta y superficies de acceso son funcionales/transaccionales, no destinos de adquisición orgánica.

### 2.3 Superficies internas / administrativas

El mismo repositorio contiene, entre otras:

- `acceso.html`
- `admin.html`
- `control.html`
- `centro-interno.html`
- `operacion.html`
- `finanzas.html`
- `studio.html`
- `actas.html`
- `activacion.html`
- `piloto-operativo.html`

Estas superficies no deben confundirse con la web pública ni promocionarse mediante sitemap/SEO. `robots.txt` y `noindex` ayudan a indexación, pero **no son controles de acceso**. Si alguna superficie llega a manejar datos reales multiusuario o sensibles, la seguridad debe residir en autenticación/autorización reales, no en la oscuridad de una URL ni en lógica local del navegador.

### 2.4 Modelo técnico actual

- Frontend principal: HTML/CSS/JS sin framework.
- QA E2E: `@playwright/test`.
- Publicación: GitHub Pages.
- PWA/offline: `manifest.webmanifest` + service worker.
- Persistencia histórica de demo/interna: `localStorage` / `sessionStorage` en varias superficies.
- Backend/Supabase: existe trabajo preparatorio, pero el canon documental mantiene la activación de Auth + RLS como una decisión separada antes de tratarlo como seguridad multiusuario real.

**Decisión vigente:** no migrar a React/Next ni a otro framework como efecto colateral de una mejora visual o SEO. La arquitectura actual puede seguir evolucionando mientras cumpla las necesidades del producto.

## 3. Dos ejes de versión que hoy están mezclados

El repositorio mantiene `package.json` como release integral `3.1.1`, mientras la experiencia pública ya es V4. Esto no es necesariamente una contradicción técnica: son dos ejes diferentes. El problema es que la documentación no los distingue consistentemente.

### Mapa recomendado

| Eje | Estado | Significado |
|---|---|---|
| Release integral/app | V3.1.1 | Baseline de runtime y aplicación interna |
| Experiencia pública | V4 | Diseño, marca, contenido y journeys públicos |
| Operación / Finanzas / Inventario | versiones propias documentadas | Evoluciones funcionales internas |
| Deployment | SHA exacto | Fuente definitiva de qué está publicado |

No conviene renumerar toda la historia para “hacerla coincidir”. Conviene mantener un único `MAPA_VERSIONES_ACTIVAS` actualizado que explique estos ejes.

## 4. Qué está bien resuelto

### Marca y dirección visual

La V4 ya tiene canon fuerte: identidad estable, lenguaje propio, reglas de uso de imágenes, motion restraint, criterios de rechazo y una jerarquía narrativa clara. El proyecto dejó atrás la etapa donde cada iteración podía inventar una marca nueva.

### Contenido y producto

La Home ya expresa con claridad los pilares del negocio:

- pizza contemporánea desde Colombia;
- producto En Casa como experiencia de Segundo Fuego;
- servicio En Movimiento para eventos;
- carta y Despensa;
- Método como explicación de decisiones;
- Bitácora como evidencia/proceso;
- Juan David como autor dentro del contexto del trabajo.

### QA y release

Los PR de continuidad más recientes muestran una disciplina fuerte de CI: auditoría canónica, validación/publicación, Graphify, regresión funcional, costo histórico e inventario valorizado. El proyecto ya posee una suite Playwright suficientemente madura para que el siguiente salto no dependa de instalar otro framework de testing.

### Gobierno de diseño

`AGENTS.md`, `el-errante-brand` y los documentos V4 establecen precedencia y evitan que un skill externo sustituya la verdad de marca/producto. Esta es una fortaleza que debe conservarse.

## 5. Hallazgos y deuda priorizada

### P0 · Cerrar dos PR de hardening antes de nuevas olas

#### PR #146 · V4 Home reveal hardening

Corrige un defecto de alta prioridad: algunas secciones podían quedar en `opacity: 0` si `IntersectionObserver` no activaba todos los `.v4-reveal`. Una animación nunca debe actuar como compuerta de acceso al contenido. El PR agrega fallback y regresión específica. Sus checks están verdes.

**Orden recomendado:** mergear primero #146, verificar publicación real y volver a basar la siguiente ola sobre ese `main`.

#### PR #145 · Public channels / admin configuration

Conecta configuración administrativa de WhatsApp, email y tiempo esperado de respuesta con las superficies públicas, preservando modo local y un modo conectado gobernado. No introduce service-role secrets y oculta canales vacíos. Sus checks también están verdes.

**Orden recomendado:** rebase/actualización sobre el `main` que resulte de #146, regresión completa y luego merge.

### P0 · `main` no está protegido

La rama `main` aparece actualmente con `protected: false` y sin required status checks. Esto permite saltarse en la configuración del repositorio la misma disciplina que el proyecto ya construyó en CI.

**Acción requerida de repositorio:** activar branch protection/ruleset para impedir push directo y exigir, como mínimo, los checks de release que ya funcionan. Esta acción no debe simularse desde código; debe configurarse en GitHub.

### P1 · Documentación V4 desactualizada

`V4_NEXT_GATE.md`, `V4_FOUNDATION_STATUS.md` y `V4_IMPLEMENTATION_CHECKLIST.md` todavía describen a V4 como si `main` siguiera intacto o marcan como pendientes tareas que ya fueron realizadas. Esto es peligroso para agentes futuros porque los puede llevar a repetir una ola visual ya completada.

**Acción:** reconciliar estos documentos con el estado posterior al merge de #144/V4.

### P1 · SEO/AEO técnico incompleto

En el baseline auditado no existen `robots.txt` ni `sitemap.xml`. La Home sí posee description, Open Graph y Twitter card básica, pero todavía hace falta una política integral de:

- sitemap público;
- frontera de indexación de superficies internas/transaccionales;
- canonical URL en páginas públicas;
- `noindex` explícito en páginas internas/transaccionales apropiadas;
- JSON-LD veraz (`WebSite`, `Organization`, y después `Product`/`Article`/`FAQ` cuando los datos estén gobernados);
- metadata única para páginas profundas;
- estrategia para URLs parametrizadas de producto/artículo/receta.

### P1 · Falta una baseline de calidad web medible y repetible

Hay buenos tests funcionales, pero el siguiente ciclo debe separar:

- regresión funcional;
- accesibilidad;
- performance/Core Web Vitals;
- SEO;
- best practices;
- calidad visual desktop/mobile.

No deben usarse puntuaciones agregadas como sustituto de evidencia. Cuando no sea posible medir una señal, se marca como **NO VERIFICADA**, no se inventa.

### P1 · Complejidad por capas legacy

La Home V4 todavía carga capas con nombres históricos (`editorial-v29`, `runtime`, `app`, `preprod`, `content-v5`, `host-mode`, `products-v30`) además de sus capas V4. Esto no prueba un bug, pero sí representa una oportunidad de arquitectura/performance.

**Regla:** no “limpiar por estética”. Primero medir dependencias, comportamiento y descargas; después retirar únicamente código demostrablemente redundante con pruebas equivalentes.

### P2 · Indexación y seguridad son problemas distintos

Que una página interna esté fuera del sitemap o bloqueada en robots no la vuelve privada. Antes de usar la aplicación como sistema real multiusuario deben resolverse Auth + RLS y autorización del lado servidor/backend para las superficies que correspondan.

### P2 · Analytics / Search Console / medición comercial

El banner ya distingue almacenamiento necesario y analítica opcional. La siguiente etapa de medición debe preservar ese consentimiento y definir eventos de negocio mínimos: visita a tienda, producto, agregar al carrito, inicio de checkout, handoff de pedido, cotización de evento y contacto de ayuda. No instalar trackers por defecto sin una política y consentimiento coherentes.

## 6. Skills: estado y selección 2026-09-02

### Canon local

- `el-errante-brand`

### Craft/frontend existente

- `frontend-app-builder`
- `impeccable`
- `emil-design-eng`
- `find-animation-opportunities`
- `design-taste-frontend`
- `redesign-existing-projects`
- `high-end-visual-design`
- `web-design-guidelines`

### Nuevos skills seleccionados

#### `find-skills` · Vercel

Función: institucionalizar la búsqueda futura de skills, exigiendo comprobar fit, reputación, adopción, licencia, seguridad, tooling y redundancia antes de instalar.

#### `seo-aeo-best-practices` · Sanity

Función: cubrir el hueco de technical SEO/AEO: robots, sitemap, canonical, structured data, EEAT y estructura para motores de búsqueda/respuesta.

#### `web-quality-audit` · Addy Osmani / web-quality-skills

Función: convertir auditorías de performance, accesibilidad, SEO y best practices en evidencia reproducible y priorizada, con fallback cuando una herramienta opcional no existe.

### Skills revisados y no instalados

- `webapp-testing` de Anthropic: bueno en abstracto, redundante frente a la suite JS Playwright ya consolidada y con workflow orientado a Python.
- `web-perf` de Cloudflare: sólido, pero depende preferentemente de Chrome DevTools MCP; no conviene instalar una capacidad dormida en este ciclo.
- `openai/skills@playwright`: el proyecto ya usa `@playwright/test`; además la selección actual dispone de alternativas con mejores señales para esta necesidad.
- `playwright-best-practices` de Currents: candidato creíble si en una futura iteración la deuda principal pasa a ser mantenibilidad/flakiness de tests; no es el hueco actual.

## 7. Proceso de desarrollo obligatorio desde este punto

### Paso 1 · Definir una hipótesis concreta

Cada iteración empieza con uno de estos disparadores:

- bug reproducible;
- regresión visual/funcional;
- necesidad comercial concreta;
- métrica deficiente;
- deuda técnica con impacto demostrable;
- requerimiento normativo/seguridad;
- contenido/producto nuevo validado.

“Seguir iterando” no es una hipótesis.

### Paso 2 · Leer el canon mínimo necesario

Para cualquier cambio público:

1. `AGENTS.md`
2. `.agents/skills/el-errante-brand/SKILL.md`
3. `V4_BRAND_DIRECTION.md`
4. canon editorial/producto aplicable
5. skill especializado solamente si existe una necesidad real.

### Paso 3 · Elegir skills por problema, no por disponibilidad

| Tipo de tarea | Skills principales |
|---|---|
| Cambio de marca/UI | `el-errante-brand` + `redesign-existing-projects` / `design-taste-frontend` / `impeccable` según necesidad |
| Implementación frontend | `frontend-app-builder` + canon local |
| Motion | `find-animation-opportunities` + `emil-design-eng` |
| Revisión final UX/a11y | `web-design-guidelines` + `web-quality-audit` |
| SEO/AEO | `seo-aeo-best-practices` |
| Buscar capacidad faltante | `find-skills` |
| Regresión | suite Playwright nativa del repo primero |

### Paso 4 · Crear branch desde `main` certificado

Una branch = una hipótesis coherente. Evitar mezclar:

- upgrade de skills;
- rediseño visual;
- cambios de datos comerciales;
- cambios internos de operación/finanzas;
- migraciones de arquitectura.

### Paso 5 · Capturar baseline

Antes de editar, registrar:

- SHA base;
- páginas/journeys afectados;
- evidencia del defecto o métrica;
- screenshots/DOM/test cuando aplique;
- checks verdes/rojos previos relevantes.

### Paso 6 · Implementación mínima causal

Modificar el menor conjunto de archivos capaz de resolver la causa. No introducir un framework, librería, animación, imagen o abstracción si el problema no lo necesita.

### Paso 7 · Verificación local/CI

Según alcance:

- canonical audit;
- Playwright desktop/mobile;
- keyboard/focus/touch targets;
- reduced motion;
- no overflow;
- console errors;
- SEO/canonical/sitemap cuando sea público;
- Graphify;
- histórico/inventario cuando el change graph lo alcance;
- prueba explícita de que módulos internos no cambiaron como daño colateral.

### Paso 8 · PR con evidencia

El PR debe responder:

1. qué problema resuelve;
2. qué no cambia;
3. qué archivos toca;
4. cómo se verificó;
5. qué riesgo queda;
6. qué screenshots/evidencia prueban el resultado;
7. qué checks deben ser requeridos.

### Paso 9 · Merge controlado

No mergear con checks requeridos rojos ni con una regresión conocida. Las excepciones deben quedar documentadas como decisión explícita, no como omisión.

### Paso 10 · Certificación post-publicación

Después del merge:

- confirmar GitHub Pages sobre el SHA esperado;
- ejecutar health/smoke real;
- verificar journeys afectados;
- revisar móvil/desktop en el cambio visible;
- actualizar documentación de estado/versiones.

## 8. Roadmap de iteraciones recomendado

### Iteración 0 · Release hardening inmediato

1. finalizar y publicar #146;
2. rebasar/finalizar #145;
3. verificar Pages después de cada merge;
4. no introducir otro cambio visual entre ambos.

### Iteración 1 · Gobierno y verdad documental

1. reconciliar V4 status/next gate/checklist;
2. crear/actualizar mapa único de versiones activas;
3. activar protección de `main` y required checks;
4. limpiar ramas/PR obsoletos sólo después de confirmar su destino.

### Iteración 2 · Technical SEO/AEO baseline

1. `robots.txt`;
2. `sitemap.xml` sólo con destinos públicos canónicos;
3. canonical en páginas públicas;
4. `noindex` en superficies internas/transaccionales apropiadas;
5. JSON-LD mínimo y veraz para website/organization;
6. estrategia de URLs canónicas para producto/artículo/receta parametrizados;
7. test automatizado para impedir que páginas internas entren al sitemap.

### Iteración 3 · Quality baseline V4

1. Home;
2. Tienda → Producto;
3. En Casa;
4. En Movimiento → cotización;
5. Checkout / Help;
6. desktop + móvil;
7. performance, a11y, console, SEO y visual review bajo condiciones repetibles.

Salida: matriz de hallazgos Critical/High/Medium/Low con evidencia.

### Iteración 4 · Conversión y verdad comercial

Validar que:

- productos/precios/presentaciones visibles coincidan con la fuente canónica;
- cobertura y disponibilidad no prometan más de lo real;
- CTA de pedido lleve a un handoff operativo real;
- cotización En Movimiento tenga ruta clara y trazable;
- checkout explique exactamente qué ocurre después;
- canales configurables de #145 sean la única fuente pública de contacto operativo cuando corresponda.

### Iteración 5 · Performance y simplificación basada en medición

Analizar la pila legacy/V4 de CSS/JS y assets. Retirar sólo recursos demostrablemente redundantes. Medir antes/después y mantener regresiones equivalentes.

### Iteración 6 · Decisión de persistencia/autenticación

RFC explícito: mantener demo/local o activar una aplicación real multiusuario. Si se activa conectividad real:

- Supabase Auth;
- RLS;
- roles/autorización;
- separación de datos por alcance;
- migración/backup;
- pruebas de seguridad;
- rollback.

No activar parcialmente una “seguridad” basada sólo en cliente.

### Iteración 7 · Observabilidad y crecimiento

- Search Console/sitemap;
- analítica bajo consentimiento;
- eventos comerciales mínimos;
- medición de conversiones En Casa / En Movimiento;
- revisión SEO/AEO periódica;
- contenido editorial actualizado sólo cuando exista evidencia/proceso real que publicar.

## 9. Definition of Done para una release pública

Una iteración pública está terminada cuando:

- resuelve una hipótesis concreta;
- respeta identidad/copy/product truth;
- no reintroduce assets o identidad legacy sin excepción aprobada;
- funciona desktop + móvil;
- es operable con teclado y mantiene foco visible;
- reduced motion no oculta contenido ni rompe jerarquía;
- no presenta overflow horizontal evitable;
- no crea estados comerciales engañosos;
- mantiene o mejora performance medido cuando el cambio toca carga/render;
- pasa Playwright y verificadores canónicos aplicables;
- no rompe operación/finanzas/inventario;
- CI requerido está verde;
- producción sirve el SHA esperado;
- documentación de estado queda sincronizada.

## 10. Regla de continuidad

Desde este corte, El Errante debe evolucionar como un producto estable: **menos olas generales, más hipótesis pequeñas, evidencia, gates y publicación certificada**. La V4 es una base que debe ser perfeccionada, no reemplazada por inercia.
