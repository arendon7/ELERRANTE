# EL ERRANTE — Roadmap de operación comercial V1.4

## Objetivo
Convertir la web actual en una experiencia comercial usable, administrable y medible, conservando el repositorio `main` como fuente única de código y utilizando GitHub Pages como entorno público de revisión de cada iteración.

## Decisión de arquitectura
GitHub Pages continuará como vitrina y preproducción porque publica únicamente archivos estáticos. La operación comercial real requiere un despliegue compatible con comercio y un backend autenticado para pedidos, comprobantes, inventarios, costos y administración.

Arquitectura prevista:

- Fuente única: repositorio `arendon7/ELERRANTE`, rama `main`.
- Revisión continua: GitHub Pages.
- Producción comercial: despliegue desde el mismo `main` en Cloudflare Pages u otro hosting comercial compatible.
- Backend: Supabase Auth, Postgres, Row Level Security y Storage privado.
- Pago inicial: transferencia Bancolombia por cuenta de ahorros o llave, con comprobante adjunto.
- Pasarela: fuera de alcance por ahora.

## Iteraciones

### Iteración 1 — Flujo operativo base
- Rediseñar checkout para transferencia y comprobante.
- Eliminar bloqueos por rutas y días predeterminados.
- Crear estados de pedido y vista de aprobación.
- Crear panel financiero con ventas, costos variables, gastos fijos y balance mensual.
- Permitir edición de precios, costos e inventario en modo de revisión.
- Preparar esquema seguro de backend.

### Iteración 2 — Backend y acceso privado
- Crear proyecto de backend.
- Activar autenticación anónima de compradores.
- Crear usuarios administrativos permanentes para Juan y responsables autorizados.
- Aplicar RLS y bucket privado de comprobantes.
- Conectar pedidos, estados, catálogo, inventario y costos.
- Confirmar que ningún secreto quede en el repositorio público.

### Iteración 3 — Operación y finanzas
- Kardex básico de inventario.
- Descuento de inventario al aprobar o preparar pedidos.
- Costo de ventas real por producto y lote.
- Gastos fijos y variables por mes.
- Margen bruto, punto de equilibrio y resultado operativo.
- Alertas por inventario bajo y pedidos pendientes.

### Iteración 4 — Mercadeo y redacción gastronómica
- Reescribir páginas de producto, colección, historia, hogar y eventos.
- Unificar tono de marca: artesanal, sobrio, preciso y sensorial.
- Mejorar argumentos de compra, usos, preparación, conservación y diferenciadores.
- Ajustar microcopias, llamados a la acción y mensajes de confianza.

### Iteración 5 — Experiencia, accesibilidad y conversión
- Simplificar navegación y jerarquía visual.
- Mejorar móvil, formularios y estados de carga/error.
- Optimizar SEO técnico, metadatos, datos estructurados y rendimiento.
- Revisar accesibilidad WCAG y contraste.
- Medir embudo de producto, carrito, pedido y comprobante.

### Iteración 6 — Piloto comercial
- Reemplazar precios, costos, inventarios y datos bancarios demo por valores reales.
- Probar pedidos reales controlados.
- Documentar proceso de aprobación, preparación, entrega y atención.
- Cerrar pendientes jurídicos de privacidad, tratamiento de datos, términos y retracto cuando corresponda.
- Publicar dominio de producción y conservar Pages como entorno de revisión.

## Base financiera temporal
Gastos fijos mensuales demo: **$6.000.000 COP**.

- Trabajador: $2.000.000.
- Sede y ocupación: $2.500.000.
- Servicios, conectividad y operación: $750.000.
- Otros gastos fijos: $750.000.

Todos estos valores son editables y deberán sustituirse por información real.

## Criterio de cierre de cada iteración
Cada iteración se integra a `main` únicamente después de:

1. Validación funcional en escritorio y móvil.
2. Revisión de seguridad y ausencia de secretos.
3. Pruebas de regresión.
4. Publicación correcta en Pages.
5. Registro de cambios y pendientes reales.

## Estado de avance — V1.5 / Iteración 2

Implementado en código:

- Configuración runtime sin credenciales privadas versionadas.
- Sesiones separadas para comprador anónimo y administrador permanente.
- Inicio de sesión administrativo mediante Supabase Auth.
- Verificación de autorización contra `admin_users` y RLS.
- Lectura sincronizada de pedidos, comprobantes, catálogo, inventario, costos y gastos fijos.
- Comprobantes privados abiertos mediante enlaces firmados de corta duración.
- Escritura remota de estados, catálogo, costos y datos públicos de transferencia.
- Migración V1.5 con auditoría administrativa y disparadores `updated_at`.

Pendiente externo de activación:

- Crear o seleccionar el proyecto Supabase.
- Ejecutar `schema-v14.sql` y `schema-v15.sql`.
- Registrar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en GitHub.
- Crear el usuario de Juan e incluir su UUID en `admin_users`.
- Sustituir datos bancarios, precios, costos e inventarios demo por información real.

## Estado de avance — V1.6 / Iteración 3

Implementado en código:

- Kardex básico de inventario con entradas, salidas, producción, compras, ajustes y mermas.
- Descuento automático al iniciar preparación y reintegro al volver a un estado no operativo.
- Ciclos idempotentes para impedir descuentos duplicados por pedido.
- Umbral de inventario bajo por producto y alertas operativas.
- Margen de contribución por producto y consolidado mensual.
- Resultado operativo: ventas aprobadas menos costos variables y gastos fijos.
- Ventas y unidades de punto de equilibrio estimadas.
- Registro manual de movimientos en modo local y mediante RPC segura en Supabase.

Los precios, costos, inventarios y gastos continúan siendo demostrativos hasta recibir la base real.


## Iteración 4 — contenido y conversión V1.7

- Voz gastronómica premium aplicada a inicio, tienda, historia, En Casa y En Movimiento.
- Once fichas de producto reescritas con deseo, criterio técnico y claridad de uso.
- Mensajes de conversión sustentados en masa, fermentación, fuego, balance y servicio.
- Prohibición de superlativos o certificaciones no demostradas.


## Iteración 5 — experiencia de compra V1.8

- Checkout guiado en tres pasos: datos, entrega y pago.
- Total persistente y acceso rápido al formulario en móvil.
- Copia segura de cuenta y llave; comprobante con nombre y peso visibles.
- Estados honestos para carrito vacío, solicitud recibida y coordinación posterior.
- Señales de confianza en Tienda y compra informada en las once fichas.
- Sin promesas de disponibilidad, entrega o devolución no sustentadas.


## Iteración 6 — confianza comercial y cierre operativo V1.9

- Consulta limitada de pedidos por referencia y correo.
- Historial de estados y trazabilidad en Supabase.
- Cobertura, tarifa, soporte y tiempo de respuesta configurables.
- Enlace de seguimiento posterior al checkout.
- Plantillas de actualización para WhatsApp desde Administración.


## Iteración 7 — activación operativa V2.0

- Centro privado de diagnóstico de conexión y migraciones.
- Alta inicial restringida al SQL Editor y gobierno posterior mediante RPC administrativo.
- Verificación de bucket privado, cobertura, soporte, transferencia, catálogo y gastos fijos.
- Modo previo explícito: la web no simula conexión ni producción real.
- Variables de GitHub separadas de credenciales privadas.


## Iteración 8 — operación diaria V2.1

- Mesa de pedidos por revisión, preparación, despacho y cierre.
- Ficha completa de cliente, entrega, productos, pago e historial.
- Transiciones guiadas y aprobación bloqueada sin comprobante.
- Exportación CSV operativa sin dirección, teléfono, correo ni comprobante.
- Respaldo y restauración validados para el modo local previo a Supabase.
- RPC administrativa que sincroniza estado, comprobante, auditoría e inventario.
