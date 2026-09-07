# Registro de capacidades V4.1 — El Errante

**Estado:** canónico para gobierno de capacidades desde V4.1; extendido por contratos V4.2  
**Baseline:** `main` posterior a PR #153 + ola V4.1 de registro/health  
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
| Handoff público | V4 | `assets/public-actions-v29.js` | `public_settings.ordering` cuando backend esté conectado; configuración local gobernada en preview | Ayuda / En Movimiento | `v4-public-handoff.spec.js` | ACTIVE |
| Configuración de canales · local | V4.4.0 interno / gobierno V4.1 | `assets/public-channel-settings-v4.js` | `ee_v14_settings` | `admin.html` en simulación local | `v4-public-channel-settings.spec.js` + gate V4 | ACTIVE |
| Configuración de canales · remoto | contrato V4.2 | `assets/public-channel-settings-v4.js` | `public_settings.ordering`; publishable key + `is_admin` + RLS | `admin.html` conectado | `v42-public-channel-connected.spec.js` + gate V4 | PREPARED |
| Verdad de sesión / conectividad administrativa | contrato V4.2 | `assets/admin-connectivity-v42.js` | sesión admin + `rpc('is_admin')`; sin store de negocio | `admin.html` y módulos heredados contenidos | `v42-admin-connectivity.spec.js` + `verificar_admin_connectivity_v42.py` + health Pages | ACTIVE |
| Backend público Supabase | preparado | `assets/commerce-runtime-config.js` + schemas versionados | URL + publishable key sólo en deploy; RLS | checkout/admin/consumidores autorizados | gate V4 + schemas | PREPARED |
| Política pública de `public_settings` | V4.2 · allowlist preparada | `schema-v14.sql` + migración `schema-v26.sql` | público: sólo `ordering`, `payment`; admin: cualquier clave con `is_admin()` | Checkout / handoffs / administración | `verificar_public_settings_policy_v42.py` + gate V4 | PREPARED |
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
3. V4.2 identifica la preparación verificable del modo conectado; no equivale a activar Supabase productivo ni a migrar los motores internos.
4. `public-channel-settings-v4.js` puede declarar una versión interna propia sin redefinir la versión integral.
5. `PREPARED` nunca equivale a activado.
6. Backend vacío por defecto es una condición válida y debe conservar verdad operativa.
7. Ningún módulo cliente puede contener `service_role`.
8. Configuración pública remota requiere publishable key, autorización administrativa y RLS para escritura.
9. Un error remoto nunca autoriza a presentar o persistir silenciosamente `ee_v14_settings` como si fuera configuración compartida.
10. La lectura pública preparada de `public_settings` queda limitada a `ordering` y `payment`; cualquier ampliación exige cambio deliberado de política y gates. Sigue `PREPARED` hasta aplicar la migración en un backend aprobado.
11. La superficie administrativa remota sólo se considera operable mientras el estado central sea `CONNECTED`; `AUTH_REQUIRED`, `FORBIDDEN` y `REMOTE_ERROR` bloquean mutaciones, mientras `LOCAL_PREVIEW` conserva la simulación local explícita.
12. Handoff WhatsApp/correo prepara un canal revisable; nunca implica envío automático.
13. Plan, hecho, compra, COGS, estándar vigente y costo histórico siguen siendo conceptos separados.
14. `desconocido` nunca se convierte silenciosamente en cero.

## Fuente de verdad

Este registro complementa `documentacion/MAPA_VERSIONES_ACTIVAS.md`. El mapa explica la convivencia histórica de versiones; este registro responde **qué capacidad existe, quién la posee, de dónde lee, quién la consume, cómo se prueba y si está activa**.

La evidencia de contratos conectados se documenta en `documentacion/V42_CONNECTED_CHANNEL_SCOPE.md`. La política de lectura pública preparada se documenta en `documentacion/V42_PUBLIC_SETTINGS_POLICY.md`.
