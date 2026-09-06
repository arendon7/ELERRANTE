#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"FAIL: falta {path}")
    return target.read_text(encoding="utf-8")


def require(haystack: str, needle: str, message: str) -> None:
    if needle not in haystack:
        raise SystemExit(f"FAIL: {message}")


def forbid(haystack: str, needle: str, message: str) -> None:
    if needle in haystack:
        raise SystemExit(f"FAIL: {message}")


admin = read("admin.html")
channels = read("assets/public-channel-settings-v4.js")
actions = read("assets/public-actions-v29.js")
runtime = read("assets/commerce-runtime-config.js")
schema = read("backend/supabase/schema-v14.sql")
spec = read("tests/e2e/v4-public-channel-settings.spec.js")
remote_spec = read("tests/e2e/v42-public-channel-connected.spec.js")

# Montaje y aislamiento de superficie.
admin_v15 = '<script src="assets/admin-v15.js"></script>'
channels_v4 = '<script src="assets/public-channel-settings-v4.js"></script>'
require(admin, admin_v15, "admin.html no monta admin-v15.js")
require(admin, channels_v4, "admin.html no monta public-channel-settings-v4.js")
if admin.index(channels_v4) <= admin.index(admin_v15):
    raise SystemExit("FAIL: public-channel-settings-v4.js debe montarse después de admin-v15.js")

# Contrato local: la simulación sólo usa el store local histórico gobernado.
require(channels, "const SETTINGS_KEY='ee_v14_settings';", "cambió la clave local de configuración")
require(channels, "if(mode==='local')", "falta la rama explícita de simulación local")
require(channels, "write(SETTINGS_KEY,saved);", "la simulación local ya no persiste en su store gobernado")

# Contrato conectado: publishable key + sesión admin + RLS, nunca service role en cliente.
require(channels, "rpc('is_admin')", "el modo conectado ya no verifica is_admin")
require(channels, ".from('public_settings').upsert", "el modo conectado ya no actualiza public_settings")
require(channels, "publishableKey", "el cliente conectado no usa publishableKey")
forbid(channels.lower(), "service_role", "public-channel-settings-v4.js contiene service_role")
require(schema, "alter table public.public_settings enable row level security;", "public_settings perdió RLS")
require(schema, 'create policy "admins manage public settings"', "falta la política administrativa de public_settings")
require(schema, "using (public.is_admin()) with check (public.is_admin());", "la escritura administrativa no conserva is_admin en RLS")

# El repositorio sigue desconectado por defecto; Pages puede inyectar configuración pública sólo en deploy.
require(runtime, 'url: ""', "commerce-runtime-config.js dejó de tener URL vacía por defecto")
require(runtime, 'publishableKey: ""', "commerce-runtime-config.js dejó de tener publishableKey vacía por defecto")

# Consumidores públicos: sólo leen ordering y preparan handoffs revisables.
require(actions, ".from('public_settings').select('value').eq('key','ordering').maybeSingle()", "Ayuda/En Movimiento ya no leen exclusivamente ordering")
require(actions, "https://wa.me/", "falta handoff de WhatsApp")
require(actions, "mailto:", "falta handoff de correo")
require(actions, "No ha sido enviado automáticamente", "se perdió la advertencia de no envío automático")
require(actions, "Abrir un canal no envía nada por sí solo", "se perdió la confirmación explícita del handoff")

# Campos funcionales del contrato local/publicado.
for marker in ("supportWhatsapp", "supportEmail", "expectedResponseHours"):
    require(channels, marker, f"falta {marker} en el editor V4")
    require(spec, marker, f"falta cobertura E2E local para {marker}")
    require(remote_spec, marker, f"falta cobertura E2E conectada para {marker}")

# Cobertura mínima de verdad operativa local: persistencia y ocultamiento al vaciar canales.
require(spec, "ee_v14_settings", "la prueba E2E no verifica persistencia local")
require(spec, "vaciar los canales", "la prueba E2E no cubre el vaciado de canales")
require(spec, "toHaveCount(0)", "la prueba E2E no verifica ocultamiento de handoffs")

# V4.2: el modo conectado se prueba sin Supabase real y no puede degradar silenciosamente a local.
require(remote_spec, "__EE_PUBLIC_CHANNEL_SUPABASE__", "falta harness remoto controlado V4.2")
require(remote_spec, "Administración conectada", "la suite V4.2 no monta explícitamente modo remoto")
require(remote_spec, "isAdmin:false", "falta escenario is_admin=false")
require(remote_spec, "JWT expired", "falta escenario de sesión/RPC expirada")
require(remote_spec, "network unavailable", "falta escenario de fallo de lectura remota")
require(remote_spec, "row-level security policy", "falta escenario de rechazo RLS")
require(remote_spec, "expect(await localSnapshot(page)).toEqual(localSeed)", "la suite V4.2 no protege aislamiento de ee_v14_settings")
require(remote_spec, "Canales públicos sincronizados", "falta escenario remoto exitoso")
require(remote_spec, "upserts", "la suite V4.2 no verifica escritura remota")

print("PASS: contratos V4/V4.2 de canales públicos, seguridad, aislamiento y handoff preservados")
