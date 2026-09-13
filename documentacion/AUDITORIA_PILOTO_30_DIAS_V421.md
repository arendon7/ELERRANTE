# EL ERRANTE · Auditoría para piloto operativo de 30 días V4.2.1

**Fecha:** 2026-09-13  
**Baseline auditado:** `main` en `cd5340cec380a0afbe6bd46c13abaf2081a7699f`  
**Objetivo:** pasar de aplicación certificada en preview a una versión de pruebas públicamente utilizable durante al menos 30 días, sin falsear capacidades ni comprometer datos personales.

## 1. Diagnóstico ejecutivo

El Errante no necesita una reconstrucción. La base pública V4, el comercio, la administración conectable y los motores internos ya existen y están certificados. La brecha principal es de **activación controlada**:

1. no existe todavía un proyecto Supabase dedicado a El Errante;
2. GitHub Pages publica `commerce-runtime-config.js` en modo `preview` porque no recibe URL + publishable key;
3. los datos reales de transferencia y atención aún no están configurados;
4. el checkout se bloquea correctamente mientras esas condiciones no existan;
5. no existe un inbox real de conversaciones de WhatsApp dentro de El Errante; actualmente existen handoffs a WhatsApp/correo y captura interna de pedidos;
6. `main` continúa sin protección administrativa obligatoria.

La meta V4.2.1 es activar sólo lo necesario para que el piloto pueda recorrer:

`tienda → carrito → checkout → transferencia/comprobante → pedido remoto → revisión de pago → preparación → producción → inventario → compra/recepción/restock → despacho → cierre → checkpoint`.

## 2. Estado por capacidad

| Capacidad | Estado | Evidencia / decisión |
|---|---|---|
| Publicación GitHub Pages | READY | `main` post-PR #174 certificado; Pages y health checks verdes. |
| Identidad V4 | READY | Pizzaiolo caminando, negro/marfil/oro, `PIZZA CONTEMPORÁNEA`, `EST. 2019`. |
| Título de pestaña | READY | Las páginas públicas principales ya tienen `<title>` válido. |
| Favicon | FIX V4.2.1 | Se corrige desde `host-mode.js` con `pizzaiolo-mark-v4.webp` y prueba Playwright dedicada. |
| Tienda / catálogo | READY | Catálogo, fichas, variantes, precios y CTA existentes. |
| Carrito | READY | Persistencia y resumen existentes. |
| Checkout público | PREPARED | Código remoto listo; bloqueado deliberadamente mientras no exista backend configurado. |
| Transferencia bancaria | PREPARED | Flujo y comprobante listos; faltan valores comerciales reales aprobados. |
| Comprobante privado | PREPARED | Storage privado y registro `payment_receipts` previstos en Supabase. |
| Pedido remoto | PREPARED | Checkout crea `orders` + `order_items` con sesión anónima cuando backend está activo. |
| Administración de pedidos | PREPARED | `admin-v15.js` y Operación pueden consultar pedidos/comprobantes remotos con sesión administrativa. |
| Producción / despacho | READY | Motores internos existentes y cubiertos por regresión. |
| Inventario | READY / CONNECTABLE | Motor existente; operación conectada preserva inventario y movimientos. |
| Compras / recepción / restock | READY / CONNECTABLE | `procurement-v25.js` contempla cliente Supabase, recepción y actualización de inventario. |
| Configuración pública | READY / CONNECTABLE | V4.2 unifica `ordering` y `payment`; escritura remota requiere admin + RLS. |
| Piloto diario / backup / reconciliación | READY | V3.7.1–V3.7.4 ya cubren jornada, backup, checkpoint y aprendizaje. |
| WhatsApp como canal externo | PREPARED | Handoff `wa.me` disponible cuando exista número configurado. |
| Centro de mensajes interno | NOT IMPLEMENTED | No existe bandeja omnicanal ni sincronización de conversaciones de WhatsApp. No debe presentarse como activa. |
| Supabase dedicado | BLOCKER | No existe actualmente un proyecto llamado/identificado para El Errante. |
| Protección de `main` | P0 pendiente | Issue #167: branch protection/ruleset aún no forzado por GitHub. |

## 3. Qué pasó con la conversación anterior

La conversación quedó interrumpida durante el análisis de una regresión Playwright de una versión intermedia de PR #174. Esa observación quedó obsoleta: el head final `019709d7424d721fba50f219691dda3349a67e2f` pasó los siete gates y la PR fue fusionada. El `main` actual es `cd5340ce…` y Graphify fue regenerado desde ese mismo commit.

Por tanto, no hay que revertir #174 ni reconstruir el trabajo realizado.

## 4. Activación mínima recomendada para el piloto

### Gate A · cierre visual y navegador

- favicon V4 funcional;
- títulos coherentes;
- revisar Home, Tienda, Producto, Checkout, Ayuda y En Movimiento en desktop/móvil;
- cero assets rechazados o legacy visibles;
- regresión completa verde.

### Gate B · backend dedicado

Crear un proyecto Supabase exclusivo para El Errante. No reutilizar proyectos de otras aplicaciones.

Después:

- aplicar las migraciones vigentes del repositorio en el orden documentado;
- revisar RLS;
- revisar advisories de seguridad;
- habilitar el método de autenticación requerido por el checkout;
- crear el primer usuario administrador y registrarlo en `admin_users`;
- confirmar bucket privado de comprobantes;
- ejecutar smoke tests de lectura/escritura con roles reales.

### Gate C · conectar Pages

Configurar en GitHub:

- `SUPABASE_URL` como variable del entorno Pages;
- `SUPABASE_PUBLISHABLE_KEY` como secret del entorno Pages.

El workflow existente materializa automáticamente `commerce-runtime-config.js` como `connected` sólo cuando ambos valores están presentes.

### Gate D · datos comerciales reales

Desde `configuracion-publica.html` con sesión admin:

- número oficial de WhatsApp;
- correo de soporte, si aplica;
- cobertura y política logística;
- tiempo esperado de respuesta;
- banco;
- tipo de cuenta;
- titular;
- número de cuenta y/o llave;
- instrucciones de transferencia;
- política de comprobante.

No publicar valores inventados ni cuentas temporales.

### Gate E · pedido cero

Antes de abrir el piloto al público ejecutar una orden real controlada:

1. agregar producto al carrito;
2. checkout desde un navegador sin sesión previa;
3. registrar datos de entrega;
4. adjuntar comprobante;
5. comprobar creación de `orders`, `order_items` y `payment_receipts`;
6. entrar como administrador;
7. revisar pago;
8. aprobar pedido;
9. preparar / producir;
10. afectar inventario de manera esperada;
11. generar compra o recepción de reposición;
12. comprobar restock;
13. despachar / entregar;
14. cerrar jornada;
15. generar checkpoint y respaldo privado.

El piloto sólo pasa a `GO` si esta cadena termina sin intervención manual sobre base de datos.

## 5. Mensajería durante el piloto

Para V4.2.1, WhatsApp debe tratarse como **canal externo de atención y coordinación**, no como inbox interno.

Flujo aceptable para 30 días:

- web prepara/abre WhatsApp con contexto;
- conversación ocurre en WhatsApp;
- pedidos públicos nacen en checkout conectado o se registran mediante intake interno si llegaron por teléfono/WhatsApp;
- El Errante administra el hecho comercial dentro de Operación.

Un verdadero Centro de Mensajes requeriría una fase separada con WhatsApp Business Cloud API, webhook, persistencia de conversaciones, identidad/contactos, estados de entrega, plantillas y controles de privacidad. No bloquear el piloto por esa integración.

## 6. Criterio GO / NO-GO

### GO

- Pages publica el SHA certificado;
- favicon y navegación correctos;
- Supabase dedicado activo y saludable;
- RLS/advisories revisados;
- admin real operativo;
- datos de pago/WhatsApp reales configurados;
- pedido cero completo;
- comprobantes privados;
- compra/recepción/restock probado;
- backup diario probado;
- ninguna demo activa.

### NO-GO

- checkout guarda PII sólo en navegador;
- checkout muestra datos bancarios incompletos;
- se reutiliza backend de otro proyecto;
- comprobantes quedan públicos;
- Operación no ve el pedido remoto;
- inventario se convierte silenciosamente de desconocido a cero;
- el flujo requiere editar tablas manualmente;
- un gate de regresión queda rojo.

## 7. Orden de ejecución V4.2.1

1. integrar corrección de favicon + test;
2. completar auditoría visual/textual de superficies críticas;
3. crear Supabase dedicado;
4. desplegar schemas y revisar seguridad;
5. crear admin real;
6. conectar GitHub Pages;
7. cargar datos de pago/atención reales;
8. ejecutar pedido cero y restock cero;
9. certificar release;
10. iniciar piloto de 30 días con checkpoints diarios y revisión semanal.

## 8. Decisiones que no deben mezclarse con este release

- migración completa de Finanzas a persistencia compartida;
- reemplazo de motores de Operación certificados;
- nuevo framework frontend;
- inbox WhatsApp completo;
- automatizaciones de marketing;
- cambios masivos de marca o nuevas imágenes no auditadas.

V4.2.1 debe ser un release de **activación, estabilidad y usabilidad**, no otro rediseño estructural.
