# Piloto operativo V3.7.2 — captura interna local de pedidos

## Motivo

El checkout público permanece correctamente bloqueado mientras no exista backend comercial conectado. Esa protección evita guardar datos personales de compradores en un navegador y presentarlos como pedidos sincronizados.

Para el piloto operativo real, sin embargo, El Errante necesita que un pedido recibido por WhatsApp, teléfono o coordinación directa pueda nacer desde una superficie interna legítima antes de activar Supabase.

V3.7.2 resuelve esa frontera sin debilitar las reglas vigentes de pago.

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
- exige comprobante cuando el pedido nace en `payment_review`;
- permite adjuntar posteriormente un comprobante a pedidos `pending_payment`, `payment_review` o `rejected` sin soporte;
- identifica el origen como `pilot-local-intake-v372`;
- no activa checkout público, Supabase, Auth, RLS ni almacenamiento remoto.

## Flujo esperado

1. El pedido llega por un canal real fuera del checkout web.
2. El operador lo registra desde `Piloto operativo`.
3. Si todavía no ha pagado, queda en `pending_payment`.
4. Cuando llega el comprobante, puede adjuntarse desde el mismo adaptador; el pedido pasa a `payment_review`.
5. Si el comprobante ya existe al crear el pedido, puede registrarse directamente en `payment_review`.
6. **La aprobación no ocurre en V3.7.2.** Operación V2.1 conserva el guard vigente y sólo habilita `Aprobar pago` cuando existe `receiptDataUrl` o `receiptPath`.
7. Después de aprobar, preparación, despacho, producción, compras, cierre y caja siguen usando los motores existentes.
8. V3.7.1 reconcilia el mismo pedido porque vive en `ee_v14_orders`.

## Comprobante local

El soporte se conserva como `receiptDataUrl` para mantener compatibilidad con Administración/Mesa diaria V2.1. No se inventa una excepción de aprobación ni un estado alternativo.

Para reducir presión sobre `localStorage`:

- sólo se aceptan JPG, PNG o WEBP;
- el archivo fuente no puede superar 8 MB;
- la imagen se reduce localmente a un máximo de 1.400 px en su dimensión mayor;
- se normaliza a JPEG con calidad 0,72;
- el resultado almacenado tiene un límite adicional antes de escribirse.

La transformación ocurre en el navegador. No se envía el comprobante a ningún servicio remoto.

## Regla económica

Una línea sin costo histórico real no puede guardarse desde V3.7.2. El piloto debe distinguir `desconocido` de `0` y evitar crear pedidos aparentemente completos que luego no permitan reconstruir margen o costo histórico.

## Privacidad

Los datos del cliente y los comprobantes permanecen en el navegador local y en los backups privados del piloto. No deben subirse al repositorio ni compartirse como parte de una revisión ordinaria del código.

El comprobante es evidencia privada del piloto. Las credenciales bancarias, contraseñas y secretos siguen excluidos.

## Versionado

El motor de backup/reconciliación sigue siendo V3.7.1 y mantiene su formato de respaldo. V3.7.2 añade sólo el adaptador de entrada interna de pedidos y soporte de comprobante local; no cambia el formato de backup ni invalida backups V3.7.0/3.7.1.

## Certificación

La integración exige:

1. `scripts/verificar_piloto_v37.py` = PASS con contratos V3.7.2;
2. `tests/e2e/pilot-intake-v372.spec.js` = PASS en desktop y móvil;
3. costo histórico cero bloqueado;
4. pedido válido escrito en `ee_v14_orders` con snapshot de costo;
5. `payment_review` sin comprobante bloqueado;
6. pedido `pending_payment` puede recibir comprobante después y pasar a `payment_review`;
7. el comprobante guardado habilita `Aprobar pago` en Operación V2.1 y la transición llega a `approved`;
8. Playwright completo desktop/móvil = PASS;
9. auditoría canónica y validación/publicación = PASS;
10. health-check público V3.7.2 = PASS;
11. Supabase y checkout público permanecen sin activar.