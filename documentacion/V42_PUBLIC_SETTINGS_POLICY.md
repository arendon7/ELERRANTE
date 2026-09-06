# V4.2 — Política pública de `public_settings`

## Estado

**PREPARED / no activado productivamente.**

Esta ola endurece el contrato SQL y deja preparada una migración para proyectos Supabase existentes. GitHub Pages no ejecuta migraciones SQL y este PR no conecta ni modifica ningún proyecto remoto.

## Problema

El bootstrap V1.4 permitía lectura pública de todas las filas de `public.public_settings` mediante una política RLS con `using (true)`. Hoy las claves públicas conocidas son únicamente:

- `ordering`: canales, disponibilidad, confianza comercial y configuración pública de pedido/handoff;
- `payment`: datos públicos de transferencia que Checkout necesita mostrar al comprador.

Mantener lectura abierta permitiría que una clave administrativa futura quedara expuesta accidentalmente sólo por compartir tabla.

## Decisión V4.2

La lectura para roles `anon` y `authenticated` queda limitada por RLS a:

```sql
key in ('ordering','payment')
```

La política administrativa continúa separada y conserva acceso completo a cualquier clave mediante:

```sql
using (public.is_admin())
with check (public.is_admin())
```

Esto permite añadir en el futuro settings privados sin hacerlos públicos por defecto.

## Archivos

- `backend/supabase/schema-v14.sql`: bootstrap seguro para instalaciones nuevas.
- `backend/supabase/schema-v26.sql`: migración idempotente para instalaciones existentes.
- `scripts/verificar_public_settings_policy_v42.py`: gate estático de política y consumidores.

## Consumidores certificados

- Checkout lee exclusivamente `payment` y `ordering`.
- Ayuda / En Movimiento leen exclusivamente `ordering`.
- Cuenta / confianza comercial (`trust-v19.js`) lee exclusivamente `ordering` y su panel administrativo escribe `ordering`.
- El editor de canales V4 lee y escribe exclusivamente `ordering`.
- Administración heredada escribe `payment`; el acceso administrativo completo sigue protegido por `is_admin()`.

## Registro de la migración

V2.6 se registra en `public.app_migrations`, tabla creada canónicamente por `schema-v20.sql`. Durante esta auditoría se detectó que V2.3–V2.5 referencian una tabla distinta, `public.schema_migrations`, que no tiene creación versionada en el repositorio. V2.6 no hereda esa dependencia; la reconciliación histórica queda separada en el issue #166.

## Invariantes

1. Ningún consumidor público puede ampliar claves sin cambiar deliberadamente la allowlist y sus gates.
2. Una nueva fila de `public_settings` no se vuelve pública automáticamente.
3. Administrador y público son contratos distintos; limitar lectura pública no limita el gobierno administrativo.
4. No existe `service_role` en cliente.
5. Esta migración no activa backend, Auth, persistencia multiusuario, Operación ni Finanzas.
6. `PREPARED` no significa desplegado.
7. V2.6 no puede depender de una tabla de migraciones no creada por la secuencia canónica.

## Aplicación futura

La migración `schema-v26.sql` sólo debe aplicarse cuando exista una decisión explícita de activar/actualizar el backend correspondiente y después de la secuencia de activación que crea `app_migrations`. Antes de hacerlo se debe verificar:

- backup del schema/políticas vigentes;
- existencia de `ordering` y/o `payment` según configuración real;
- que no exista un consumidor público aprobado de otra clave;
- prueba con rol `anon`: `ordering` y `payment` visibles, cualquier otra clave invisible;
- prueba con administrador: acceso completo y escritura gobernada;
- registro `2.6` en `app_migrations`;
- rollback documentado para una contingencia controlada.

## Rollback de emergencia

Si una activación futura evidencia un consumidor público legítimo no inventariado, la respuesta preferida es añadir esa clave explícitamente a la allowlist con PR y prueba. Reabrir `using (true)` sólo debe considerarse una reversión temporal de emergencia y nunca el estado final.

## Gate de salida de esta ola

- bootstrap sin política `using (true)` para `public_settings`;
- migración V2.6 preparada e idempotente respecto de nombres de políticas;
- allowlist exacta `ordering/payment`;
- acceso administrativo completo preservado;
- consumidores públicos conocidos dentro de la allowlist;
- registro V2.6 en la tabla canónica `app_migrations`;
- gate rápido V4, fuente canónica, materialización, Playwright, Graphify, inventario V1.5 y costo histórico V1.4 verdes.
