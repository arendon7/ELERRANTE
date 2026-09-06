# El Errante — Roadmap V4.1 a V4.3

**Estado:** plan técnico posterior a integración de canales públicos V4  
**Baseline auditado:** `main` en `72dd7528f76c5fe21a8339f3f09348cdadc746e4`  
**Principio:** evolucionar por contratos pequeños y verificables sin reescribir motores certificados de Operación, Finanzas, costos o datos maestros.

## 1. Diagnóstico ejecutivo

El Errante ya no es únicamente una web pública. El repositorio contiene cuatro dominios que deben evolucionar sin mezclarse:

1. **Experiencia pública V4:** marca, tienda, producto, En Casa, En Movimiento, Método, Bitácora, autoría, ayuda y handoffs.
2. **Comercio y administración heredada:** checkout, pedidos, comprobantes, configuración y compatibilidad de módulos históricos.
3. **Sistema interno:** Centro, Control, Operación, Finanzas, Datos maestros, Actas y Piloto.
4. **Gobierno técnico:** materialización V2.8, fuente canónica, CI/CD, Playwright, Graphify, health checks, schemas Supabase preparados y documentación contractual.

La arquitectura es deliberadamente acumulativa. Una versión alta de un overlay no renumera automáticamente toda la distribución. Esto es correcto, pero exige un registro explícito de capacidades para evitar que la numeración se convierta en deuda cognitiva.

## 2. Lo que ya está bien resuelto

### 2.1 Separación semántica

Se preservan correctamente fronteras críticas:

- plan ≠ real;
- BOM ≠ compra;
- compra ≠ COGS;
- inventario desconocido ≠ cero;
- costo estándar vigente ≠ costo histórico del hecho;
- propuesta aprobada ≠ estándar materializado;
- Finanzas lee hechos operativos sin reescribirlos;
- cierre diario agrega coordinación sin mutar stores propietarios;
- demos se aíslan de datos reales;
- backend preparado no equivale a backend activado.

Estas invariantes deben mantenerse como requisitos de aceptación de cualquier release posterior.

### 2.2 Publicación y materialización

La superficie publicable se reconstruye antes de ejecutar verificadores y antes de Pages. La publicación excluye fuentes/chunks históricos que no deben ejecutarse directamente y conserva un marcador de commit de release.

### 2.3 Seguridad del canal V4

El módulo de canales públicos preserva cuatro fronteras:

- modo local: `ee_v14_settings` del navegador;
- modo conectado: publishable key + sesión + `rpc('is_admin')`;
- escritura remota protegida adicionalmente por RLS sobre `public_settings`;
- WhatsApp/correo son handoffs: preparar o abrir el canal no envía automáticamente.

El repositorio mantiene URL y publishable key vacías por defecto. La configuración conectada sólo puede materializarse durante deploy si existe configuración explícita.

### 2.4 Cobertura funcional

Existe una suite amplia Playwright para marca V4, comercio, acceso, administración, operación y finanzas. La profundidad de cobertura es una fortaleza y no debe reducirse para ganar velocidad.

## 3. Deuda prioritaria encontrada

### P0 — Protección de `main`

`main` no está protegido y no tiene required status checks configurados a nivel de rama. El proceso actual se ha protegido disciplinariamente mediante PR, lectura de gates y merge bloqueado por SHA, pero GitHub todavía permitiría una integración fuera de ese procedimiento.

**Objetivo:** habilitar ruleset/branch protection para:

- prohibir push directo a `main`;
- exigir PR;
- exigir branch up-to-date antes de merge cuando corresponda;
- exigir al menos los gates canónicos;
- bloquear force push y borrado;
- mantener merge bloqueado por head SHA en automatizaciones.

Esta configuración es administrativa del repositorio y debe aplicarse en GitHub; no debe simularse mediante JavaScript o scripts de la aplicación.

### P0 — Gate rápido de contrato

La regresión Playwright completa usa un solo worker y dos proyectos (desktop + móvil). Es adecuada como certificación integral, pero demasiado pesada para ser la única señal temprana.

**V4.1 introduce:**

- `scripts/verificar_v4_public_channels.py`;
- `.github/workflows/v4-contracts.yml`;
- timeout máximo de 5 minutos;
- sintaxis JS + contrato estático V4.

La regresión completa permanece intacta.

### P1 — Registro de capacidades y versiones

Hay varias líneas legítimas: release integral 3.1.1, runtime 2.8, público/editorial 2.9, identidad V4, canales públicos V4 y módulos internos 3.x/1.x. Además, `public-channel-settings-v4.js` tiene un marcador interno `4.4.0` que no está registrado en el mapa canónico.

**Acción:** crear un registro de capacidades que responda, para cada superficie:

- nombre funcional;
- versión de contrato;
- asset propietario;
- store/fuente de datos;
- páginas consumidoras;
- tests;
- estado `ACTIVE / PREPARED / INACTIVE / LEGACY`.

No renombrar assets históricos sólo para uniformar números.

### P1 — Contrato de despliegue V4

Pages valida materialización y muchos motores internos, pero V4 debe tener además checks explícitos de publicación:

- `admin.html` materializado monta `public-channel-settings-v4.js` después de `admin-v15.js`;
- el asset V4 existe en `_site`;
- Ayuda y En Movimiento conservan `public-actions-v29.js`;
- el runtime publicado no contiene credenciales fuera de la configuración esperada;
- `release_commit` coincide con el SHA desplegado.

### P1 — Cobertura del modo conectado

La prueba de canales V4 cubre correctamente persistencia local y ocultamiento al vaciar canales. Falta una prueba específica del camino conectado sin depender de un Supabase real.

**Objetivo V4.2:** harness controlado que simule:

- sesión válida + `is_admin=true` → lectura/escritura permitida;
- sesión válida + `is_admin=false` → editor bloqueado;
- fallo de red → no sustituir silenciosamente configuración remota por una escritura local;
- RLS rechazando escritura → mensaje de error y cero mutación local accidental.

No colocar secretos de integración en el repositorio.

### P1 — Política pública de `public_settings`

El schema inicial permite lectura pública de todas las filas de `public_settings`. Hoy la tabla está concebida para configuración pública, pero una futura ampliación podría introducir una clave que no deba exponerse.

**Antes de activar backend real:** decidir y certificar una allowlist de claves públicas (`ordering`, `payment` u otras aprobadas), o separar configuración privada en otra tabla. Nunca confiar sólo en convenciones de nombre.

### P1 — Higiene de ramas y PRs

Persisten ramas `feature/v4-*` y `release/v4-*` de múltiples reconstrucciones. Deben clasificarse después de confirmar qué PR las contiene:

- `MERGED` → elegible para borrado de rama;
- `SUPERSEDED` → cerrar PR y borrar rama cuando ya no sea necesaria;
- `REFERENCE` → conservar sólo si contiene trabajo no integrado y documentar por qué;
- `ACTIVE` → única rama de trabajo vigente por iniciativa.

La limpieza debe ser posterior a la certificación, nunca destructiva durante un gate pendiente.

### P2 — Rendimiento de CI

La suite completa usa `workers: 1`, `fullyParallel: false` y desktop + móvil. Antes de subir workers de forma global hay que identificar specs con dependencia de estado, servidor o stores compartidos.

Ruta recomendada:

1. medir duración por spec;
2. etiquetar smoke/critical/full;
3. mantener un gate rápido determinista;
4. paralelizar sólo grupos demostrablemente aislados;
5. conservar full regression para merge/release.

### P2 — Administración heredada

`admin.html` es explícitamente una superficie de compatibilidad, pero sigue acumulando módulos. V4.2 debe mover configuración contemporánea a una superficie administrativa coherente o convertir `admin.html` en adaptador claramente delimitado.

No eliminarla hasta mapear consumidores y contratos históricos.

## 4. Roadmap por release

## V4.1 — Gobierno, contratos y claridad

**Meta:** que cada siguiente cambio falle rápido, sea trazable y tenga una única fuente de verdad sobre su alcance.

Entregables:

1. gate rápido V4;
2. verificador de canales y seguridad;
3. registro/roadmap canónico V4.1–V4.3;
4. cierre de PRs sustituidos #145/#149 después de certificación de #152;
5. inventario de ramas V4;
6. ruleset/branch protection de `main`;
7. verificación explícita de V4 en artefacto Pages;
8. definición de qué significa `V4`, `V4.x` y `release integral` en documentación.

**Gate de salida:**

- gate V4 verde;
- fuente canónica verde;
- validación/materialización verde;
- Playwright integral verde;
- Graphify verde;
- health de Pages sobre el SHA de merge verde;
- ningún cambio en datos/finanzas/operación fuera del alcance.

## V4.2 — Operación pública y administración conectable

**Meta:** preparar una transición segura de configuración local a persistencia compartida sin activar backend prematuramente.

Entregables:

1. test del modo remoto con mocks/harness;
2. allowlist de `public_settings` o separación de settings privados;
3. estado visible de conectividad en administración;
4. auditoría de sesión, expiración y errores de red;
5. contrato de migración local → remoto;
6. superficie administrativa coherente para canales, pago, cobertura y disponibilidad;
7. telemetría técnica no invasiva sólo si existe decisión explícita sobre privacidad.

**No incluye:** migrar Operación/Finanzas a Supabase.

## V4.3 — Activación multiusuario gobernada

**Meta:** sólo si el piloto demuestra que el modelo local dejó de ser suficiente.

Precondiciones:

- conclusión de piloto `BACKEND_DESIGN_CANDIDATE` correctamente sustentada;
- modelo de roles aprobado;
- migraciones reproducibles;
- RLS auditada;
- plan de backup/rollback;
- pruebas de concurrencia e idempotencia;
- política de datos personales y retención definida;
- separación inequívoca entre datos públicos, operativos y financieros.

Secuencia:

1. Auth y roles;
2. configuración pública;
3. pedidos/comprobantes;
4. hechos operativos seleccionados;
5. sólo después evaluar finanzas compartidas.

La activación debe ser gradual y reversible.

## 5. Backlog de producto público

La evolución técnica no debe detener la mejora visual/comercial. La dirección V4 ya establece una Home editorial y una identidad fuerte. El backlog público debe seguir esta prioridad:

1. **Tienda y producto:** claridad de precio, presentación, disponibilidad, CTA y carrito.
2. **En Casa / Segundo Fuego:** instrucciones inequívocas y ritual de terminación.
3. **En Movimiento:** cotización, capacidad, cobertura y handoff real cuando exista canal aprobado.
4. **Despensa:** diferenciar producto comercial de storytelling.
5. **Método/Bitácora:** evidencia antes que claims.
6. **Autoría:** Juan David después de obra/producto, no como hero corporativo.
7. **Legal/confianza:** mantener coherencia entre lo que la web puede hacer y lo que afirma hacer.

Todo rediseño público debe preservar semántica HTML, foco visible, touch targets, contraste, responsive images, reduced motion y estabilidad de layout.

## 6. Reglas de desarrollo desde V4.1

1. Una iniciativa = una rama activa y un PR limpio.
2. El PR declara base SHA, head SHA, archivos y alcance funcional.
3. No mezclar correcciones de CI con cambios de producto salvo que sean inseparables.
4. No mergear con gate rojo o pendiente.
5. Antes del merge, confirmar que el head SHA no cambió.
6. Después del merge, certificar el SHA real de `main` y Pages.
7. Cerrar/suprimir ramas sustituidas sólo después de certificación.
8. Todo nuevo store debe tener propietario, semántica y política de corrección.
9. Todo nuevo dato remoto debe tener RLS antes de activar UI de escritura.
10. Ningún fallback puede convertir `desconocido` en cero, hecho, ingreso, costo o aprobación.
11. Los cambios públicos leen primero el canon de marca V4 y no deben modificar Operación/Finanzas por efecto colateral.
12. Los datos privados reales nunca se versionan.

## 7. Orden inmediato de ejecución

1. Certificar completamente `main` posterior a #152.
2. Cerrar #149 y #145 como sustituidos.
3. Integrar V4.1 gate rápido mediante PR separado.
4. Configurar protección de `main` con los checks aprobados.
5. Limpiar ramas V4 ya sustituidas.
6. Añadir contrato explícito de publicación V4 a Pages.
7. Construir cobertura remota mockeada.
8. Auditar la siguiente ola visual/comercial página por página.
9. Sólo después decidir si existe evidencia suficiente para activar persistencia multiusuario.

Este orden preserva una regla fundamental: primero hacemos que el sistema sea fácil de verificar; luego aceleramos su evolución.
