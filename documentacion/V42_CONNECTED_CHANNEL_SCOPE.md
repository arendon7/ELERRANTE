# V4.2 — Canales públicos conectables: contrato y evidencia

## Estado

Primera ola V4.2, deliberadamente **test-first**. Esta entrega no activa Supabase productivo ni modifica el runtime funcional.

## Base

Se construye sobre el head certificado/candidato de V4.1 que incorpora registro de capacidades y health real de Pages.

## Objetivo

Convertir el comportamiento conectado ya implementado en `assets/public-channel-settings-v4.js` en un contrato E2E explícito antes de modificar schemas, RLS, UI o configuración productiva.

## Escenarios obligatorios

1. **Administrador autorizado**
   - `rpc('is_admin') = true`;
   - lectura de `public_settings.ordering`;
   - editor carga configuración remota;
   - `upsert` remoto exitoso;
   - `ee_v14_settings` permanece intacto.

2. **Usuario autenticado sin rol administrativo**
   - `rpc('is_admin') = false`;
   - editor remoto bloqueado;
   - cero lecturas/escrituras posteriores;
   - cero fallback local.

3. **Sesión expirada / fallo de autorización**
   - error en `rpc('is_admin')`;
   - error visible;
   - cero lectura/escritura remota posterior;
   - cero fallback local.

4. **Fallo de red al leer configuración**
   - autorización válida;
   - lectura de `public_settings.ordering` falla;
   - no se presenta la configuración local como si fuera remota;
   - no se muta `ee_v14_settings`.

5. **RLS rechaza escritura**
   - lectura remota válida;
   - el `upsert` devuelve error de política;
   - error visible en la misma superficie;
   - no se persiste localmente el intento fallido.

## Harness

La suite usa un cliente Supabase simulado inyectado como `window.__EE_PUBLIC_CHANNEL_SUPABASE__` y una configuración runtime conectada ficticia. No contiene secretos, no contacta un proyecto Supabase real y no convierte el mock en comportamiento productivo.

La autenticación completa de `admin-v15.js` queda fuera del harness: ya posee sus contratos propios. La suite monta explícitamente la señal DOM de `Administración conectada` para aislar el contrato del módulo de canales.

## Invariantes

- publishable key, nunca `service_role` en cliente;
- escritura remota exige `is_admin` y RLS;
- modo remoto nunca degrada silenciosamente a local ante error;
- `ee_v14_settings` sólo pertenece a simulación local;
- WhatsApp/correo siguen siendo handoffs revisables, no envíos automáticos;
- backend vacío por defecto sigue siendo válido;
- esta ola no cambia Operación, Finanzas, costos, inventario, catálogo, precios, checkout ni pedidos.

## Riesgo detectado para la siguiente ola

El schema V1.4 actual permite lectura pública de todas las filas de `public.public_settings` mediante una política `using (true)`. Los consumidores conocidos usan actualmente `ordering` y `payment`.

Antes de activar backend real, una segunda ola V4.2 debe sustituir esa política abierta por una allowlist explícita de claves públicas o separar la configuración privada en otra tabla. Ese cambio de schema debe ir en un PR independiente con migración, verificador y pruebas de política.

## Gate de salida

- nueva suite V4.2 verde en desktop y móvil;
- gate rápido V4 verde;
- fuente canónica verde;
- materialización/publicación verde;
- regresión integral verde;
- Graphify verde;
- inventario V1.5 verde;
- costo histórico V1.4 verde;
- ningún cambio funcional fuera del alcance.
