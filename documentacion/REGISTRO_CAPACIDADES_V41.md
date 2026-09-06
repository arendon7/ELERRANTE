# Registro de capacidades V4.1 — El Errante

**Estado:** canónico para gobierno de capacidades desde V4.1  
**Baseline:** `main` posterior a PR #153  
**Propósito:** separar versión integral, versión de contrato, asset propietario, fuente de datos, consumidores, pruebas y estado operativo.

## Estados

- `ACTIVE`: capacidad publicada y utilizable dentro de su contrato.
- `PREPARED`: implementada o preparada, pero no activada productivamente.
- `INACTIVE`: deliberadamente desactivada.
- `LEGACY`: compatibilidad histórica; no debe recibir nuevas responsabilidades sin decisión explícita.

## Capacidades públicas

| Capacidad | Contrato | Asset/propietario | Fuente / store | Consumidores | Pruebas / gates | Estado |
|---|---|---|---|---|---|---|
| Identidad pública | V4 | `brand-v4-*`, canon V2.8 | canon/activos versionados | Home y superficies públicas | regresión V4 + auditoría canónica | ACTIVE |
| Home editorial | V4 | capas `brand-v4-*` | contenido editorial V2.9 | `index.html` | Playwright V4 | ACTIVE |
| Tienda / catálogo | V4 | catálogo público + refinamientos V4 | datos canónicos V2.8 | tienda/producto | V4 store/product specs | ACTIVE |
| Producto | V4 | refinamientos V4 | catálogo, variantes y disponibilidad canónicos | producto | V4 product specs | ACTIVE |
| Checkout | V4 | `brand-v4-checkout.css` + runtime histórico | carrito + backend sólo si está configurado | checkout | V4 checkout specs | ACTIVE |
| Cuenta / seguimiento | V4 | `brand-v4-account.css` + contratos de cuenta | fuente real cuando exista; offline no simula pedidos | cuenta | V4 account specs | ACTIVE |
| Handoff público | V4 | `assets/public-actions-v29.js` | `public_settings.ordering` o configuración local gobernada | Ayuda / En Movimiento | `v4-public-handoff.spec.js` | ACTIVE |
| Configuración de canales | V4.4.0 interno / gobierno V4.1 | `assets/public-channel-settings-v4.js` | local `ee_v14_settings`; remoto `public_settings` | `admin.html` | `v4-public-channel-settings.spec.js` + gate V4 | ACTIVE |
| Backend público Supabase | preparado | `assets/commerce-runtime-config.js` + schema V1.4 | URL + publishable key sólo en deploy; RLS | checkout/admin/consumidores autorizados | gate V4 + schemas | PREPARED |
| WhatsApp/correo automático | no existe | — | — | — | contrato prohíbe afirmar envío automático | INACTIVE |

## Capacidades internas

| Capacidad | Contrato | Asset/propietario | Fuente / store | Consumidores | Pruebas / gates | Estado |
|---|---|---|---|---|---|---|
| Acceso / shell | V3.1.1 | `access-v31.js`, `internal-shell-v31.js` | sesión local gobernada | superficies internas | release/canonical/Playwright | ACTIVE |
| Control | base V3.0; efectiva V3.6 | `control-v30.js` + overlays V3.4–V3.6 | lecturas operativas | `control.html` | regresión integral | ACTIVE |
| Operación | base V3.3.0; efectiva V3.6 | motores V2.1–V2.5 + V3.0 + overlays | stores propietarios de pedidos, producción, compras, inventario y cierres | `operacion.html` | regresión integral | ACTIVE |
| Finanzas | base V3.2.9; mesa V3.5.1 | workbench V3.1 + capas V3.2.x–V3.5.1 | hechos operativos + modelo financiero | `finanzas.html` | regresión financiera + costo histórico | ACTIVE |
| Datos maestros | V1.0–V1.3 | master data/cost modules | gobierno, propuestas, materializaciones | Studio/Operación/Finanzas | verificadores V1.x | ACTIVE |
| Costo histórico | V1.4 | historical cost | snapshots as-of | Finanzas/inventario | gate V1.4 | ACTIVE |
| Inventario valorizado | V1.5 | inventory valuation | hechos + costo histórico | Finanzas/gestión | gate V1.5 | ACTIVE |
| Piloto operativo | V3.7.1–V3.7.4 | `pilot-*` | stores locales gobernados + backups privados | `piloto-operativo.html` | regresión integral | ACTIVE |
| Persistencia multiusuario operativa | futura | Supabase/Auth/RLS | por definir tras piloto | Operación/Finanzas | requiere gate de salida V3.7.3 | INACTIVE |

## Contratos transversales

1. La release integral publicada sigue identificándose por `deploy-version.txt`; no se deduce por el mayor número de módulo.
2. V4 identifica el sistema público/visual y sus contratos contemporáneos; V4.1 identifica la ola de gobierno y verificación, no una renumeración de todos los motores históricos.
3. `public-channel-settings-v4.js` puede declarar una versión interna propia sin redefinir la versión integral.
4. `PREPARED` nunca equivale a activado.
5. Backend vacío por defecto es una condición válida y debe conservar verdad operativa.
6. Ningún módulo cliente puede contener `service_role`.
7. Configuración pública remota requiere RLS y autorización administrativa para escritura.
8. Handoff WhatsApp/correo prepara un canal revisable; nunca implica envío automático.
9. Plan, hecho, compra, COGS, estándar vigente y costo histórico siguen siendo conceptos separados.
10. `desconocido` nunca se convierte silenciosamente en cero.

## Fuente de verdad

Este registro complementa `documentacion/MAPA_VERSIONES_ACTIVAS.md`. El mapa explica la convivencia histórica de versiones; este registro responde **qué capacidad existe, quién la posee, de dónde lee, quién la consume, cómo se prueba y si está activa**.
