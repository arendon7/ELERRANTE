# Piloto operativo V3.7.2 — captura interna local de pedidos

## Motivo

El checkout público permanece correctamente bloqueado mientras no exista backend comercial conectado. Esa protección evita guardar datos personales de compradores en un navegador y presentarlos como pedidos sincronizados.

Para el piloto operativo real, sin embargo, El Errante necesita que un pedido recibido por WhatsApp, teléfono o coordinación directa pueda nacer desde una superficie interna legítima antes de activar Supabase.

V3.7.2 resuelve únicamente ese hueco.

## Alcance

`piloto-operativo.html` carga `assets/pilot-order-intake-v372.js` y `assets/pilot-order-intake-v372.css` como una capa auxiliar sobre V3.7.1.

La captura:

- es interna y protegida por la shell V3.1;
- opera sólo en el navegador controlado del piloto;
- reutiliza `ee_v14_orders` como fuente de pedidos;
- toma productos del catálogo canónico y overrides locales `ee_v14_products`;
- exige cantidad, precio de venta y costo histórico unitario mayores que cero;
- guarda `unitCost` y `unit_cost_snapshot` por línea;
- conserva la fecha operativa solicitada;
- permite iniciar en `pending_payment` o `payment_review`;
- identifica el origen como `pilot-local-intake-v372`;
- no activa checkout público, Supabase, Auth, RLS ni almacenamiento remoto.

## Flujo esperado

1. El pedido llega por un canal real fuera del checkout web.
2. El operador lo registra desde `Piloto operativo`.
3. Si corresponde, el pago queda pendiente o por revisar.
4. El pedido continúa en las superficies vigentes de Control/Operación.
5. La aprobación, preparación, despacho, producción, compras, cierre y caja siguen usando los motores existentes.
6. V3.7.1 reconcilia el mismo pedido porque vive en `ee_v14_orders`.

## Regla económica

Una línea sin costo histórico real no puede guardarse desde V3.7.2. El piloto debe distinguir `desconocido` de `0` y evitar crear pedidos aparentemente completos que luego no permitan reconstruir margen o costo histórico.

## Privacidad

Los datos del cliente permanecen en el navegador local y en los backups privados del piloto. No deben subirse al repositorio.

V3.7.2 no adjunta comprobantes ni credenciales bancarias. La referencia de pago es texto opcional de coordinación local.

## Versionado

El motor de backup/reconciliación sigue siendo V3.7.1 y mantiene su formato de respaldo. V3.7.2 añade sólo el adaptador de entrada interna de pedidos; no cambia el formato de backup ni invalida backups V3.7.0/3.7.1.

## Certificación

La integración exige:

1. `scripts/verificar_piloto_v37.py` = PASS con contratos V3.7.2;
2. `tests/e2e/pilot-intake-v372.spec.js` = PASS;
3. costo histórico cero bloqueado;
4. pedido válido escrito en `ee_v14_orders` con snapshot de costo;
5. Playwright completo desktop/móvil = PASS;
6. auditoría canónica y validación/publicación = PASS;
7. health-check público V3.7.2 = PASS;
8. Supabase y checkout público permanecen sin activar.